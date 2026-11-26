package com.raysi.anchor.extractor.impl;

import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.raysi.anchor.R;
import com.raysi.anchor.extractor.PlatformExtractor;
import com.raysi.anchor.extractor.model.ExtractionResult;
import com.raysi.anchor.extractor.model.MediaType;
import com.raysi.anchor.extractor.model.MediaVariant;
import com.raysi.anchor.extractor.util.OpenGraphParser;
import com.raysi.anchor.extractor.util.PayloadUnescaper;
import com.raysi.anchor.extractor.util.UrlNormalizer;
import com.raysi.anchor.network.NetworkModule;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import okhttp3.ResponseBody;

/**
 * Extracts public X (Twitter) videos, GIFs, and original-resolution images via public
 * syndication endpoints and OpenGraph fallback.
 */
public final class XTwitterExtractor implements PlatformExtractor {

    public static final String PLATFORM_ID = "x";
    private static final String DEFAULT_SYNDICATION_BASE = "https://cdn.syndication.twimg.com";
    private static final Pattern STATUS_ID_PATTERN = Pattern.compile("/(?:status|statuses)/(\\d+)");
    private static final Pattern RESOLUTION_PATTERN = Pattern.compile("/(\\d+)x(\\d+)/");

    private final String syndicationBaseUrl;

    public XTwitterExtractor() {
        this(DEFAULT_SYNDICATION_BASE);
    }

    public XTwitterExtractor(@NonNull String syndicationBaseUrl) {
        this.syndicationBaseUrl = syndicationBaseUrl.endsWith("/")
                ? syndicationBaseUrl.substring(0, syndicationBaseUrl.length() - 1)
                : syndicationBaseUrl;
    }

    @NonNull
    @Override
    public String getPlatformId() {
        return PLATFORM_ID;
    }

    @NonNull
    @Override
    public String getDisplayName() {
        return "X";
    }

    @Override
    public int getBadgeIconRes() {
        return R.drawable.ic_platform_x;
    }

    @Override
    public boolean canHandle(@NonNull Uri canonicalUri) {
        String host = canonicalUri.getHost();
        if (host == null) {
            return false;
        }
        return UrlNormalizer.hostMatches(host, "x.com")
                || UrlNormalizer.hostMatches(host, "twitter.com")
                || UrlNormalizer.hostMatches(host, "t.co");
    }

    @NonNull
    @Override
    public ExtractionResult extract(@NonNull String canonicalUrl, @NonNull OkHttpClient client) throws IOException {
        String statusId = extractStatusId(canonicalUrl);
        if (statusId != null) {
            String token = computeSyndicationToken(statusId);
            String endpoint = syndicationBaseUrl + "/tweet-result?id=" + statusId + "&lang=en&token=" + token;
            try (Response response = client.newCall(NetworkModule.newJsonRequest(endpoint, canonicalUrl, null)).execute()) {
                if (response.isSuccessful()) {
                    ResponseBody body = response.body();
                    if (body != null) {
                        ExtractionResult parsed = parseSyndicationJson(body.string(), canonicalUrl);
                        if (parsed instanceof ExtractionResult.Success) {
                            return parsed;
                        }
                    }
                } else if (response.code() == 404) {
                    return ExtractionResult.failure(
                            PLATFORM_ID,
                            canonicalUrl,
                            ExtractionResult.FailureReason.PRIVATE_OR_LOGIN_REQUIRED,
                            "This X post is unavailable, deleted, or from a protected account."
                    );
                }
            } catch (IOException ignored) {
                // Fall back to OpenGraph check on canonicalUrl
            }
        }

        // OpenGraph fallback
        try (Response response = client.newCall(NetworkModule.newHtmlRequest(canonicalUrl)).execute()) {
            if (!response.isSuccessful() || response.body() == null) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                        "Could not load public metadata for this X post."
                );
            }
            return parseOpenGraphFallback(response.body().string(), canonicalUrl);
        }
    }

    @NonNull
    public ExtractionResult parseSyndicationJson(@NonNull String jsonText, @NonNull String canonicalUrl) {
        try {
            JSONObject root = new JSONObject(jsonText);
            String tombstone = root.optString("__typename", "");
            if ("TweetTombstone".equalsIgnoreCase(tombstone)) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.PRIVATE_OR_LOGIN_REQUIRED,
                        "This X post is protected or no longer publicly visible."
                );
            }

            String text = PayloadUnescaper.unescape(root.optString("text", ""));
            String author = null;
            JSONObject userObj = root.optJSONObject("user");
            if (userObj != null) {
                String screenName = userObj.optString("screen_name", "");
                String name = userObj.optString("name", "");
                if (!screenName.isBlank()) {
                    author = "@" + screenName;
                } else if (!name.isBlank()) {
                    author = name;
                }
            }

            List<MediaVariant> videos = new ArrayList<>();
            List<MediaVariant> images = new ArrayList<>();
            String thumbnailUrl = null;

            // Schema A: mediaDetails[] (classic syndication)
            JSONArray mediaDetails = root.optJSONArray("mediaDetails");
            if (mediaDetails != null) {
                for (int i = 0; i < mediaDetails.length(); i++) {
                    JSONObject item = mediaDetails.optJSONObject(i);
                    if (item == null) {
                        continue;
                    }
                    String type = item.optString("type", "");
                    String mediaHttps = PayloadUnescaper.unescape(item.optString("media_url_https", ""));
                    if (thumbnailUrl == null && isHttpUrl(mediaHttps)) {
                        thumbnailUrl = mediaHttps;
                    }

                    if ("video".equals(type) || "animated_gif".equals(type)) {
                        JSONObject videoInfo = item.optJSONObject("video_info");
                        if (videoInfo != null) {
                            collectVideoVariants(videoInfo.optJSONArray("variants"), videos);
                        }
                    } else if ("photo".equals(type) && isHttpUrl(mediaHttps)) {
                        String origUrl = upgradeImageToOrig(mediaHttps);
                        JSONObject origInfo = item.optJSONObject("original_info");
                        int w = origInfo != null ? origInfo.optInt("width", 0) : 0;
                        int h = origInfo != null ? origInfo.optInt("height", 0) : 0;
                        String label = images.isEmpty() ? "Original Image" : "Original Image " + (images.size() + 1);
                        images.add(new MediaVariant(label, origUrl, MediaType.IMAGE, guessImageMime(origUrl), -1L, w, h, 0));
                    }
                }
            }

            // Schema B: video{} / photos[] (compact syndication)
            JSONObject videoObj = root.optJSONObject("video");
            if (videoObj != null) {
                if (thumbnailUrl == null) {
                    String poster = PayloadUnescaper.unescape(videoObj.optString("poster", ""));
                    if (isHttpUrl(poster)) {
                        thumbnailUrl = poster;
                    }
                }
                collectVideoVariants(videoObj.optJSONArray("variants"), videos);
            }

            JSONArray photosArr = root.optJSONArray("photos");
            if (photosArr != null && images.isEmpty()) {
                for (int i = 0; i < photosArr.length(); i++) {
                    JSONObject photo = photosArr.optJSONObject(i);
                    if (photo == null) {
                        continue;
                    }
                    String url = PayloadUnescaper.unescape(photo.optString("url", ""));
                    if (isHttpUrl(url)) {
                        if (thumbnailUrl == null) {
                            thumbnailUrl = url;
                        }
                        String origUrl = upgradeImageToOrig(url);
                        int w = photo.optInt("width", 0);
                        int h = photo.optInt("height", 0);
                        String label = images.isEmpty() ? "Original Image" : "Original Image " + (images.size() + 1);
                        images.add(new MediaVariant(label, origUrl, MediaType.IMAGE, guessImageMime(origUrl), -1L, w, h, 0));
                    }
                }
            }

            List<MediaVariant> merged = new ArrayList<>();
            if (!videos.isEmpty()) {
                videos.sort(
                        Comparator.comparingInt(MediaVariant::getBitrate)
                                .thenComparingInt(MediaVariant::getHeight)
                                .reversed()
                );
                Map<String, MediaVariant> deduped = new LinkedHashMap<>();
                for (int i = 0; i < videos.size(); i++) {
                    MediaVariant v = videos.get(i);
                    String qualityLabel = buildVideoLabel(i == 0, v.getHeight(), v.getBitrate());
                    deduped.putIfAbsent(
                            v.getUrl(),
                            new MediaVariant(qualityLabel, v.getUrl(), v.getMediaType(), v.getMimeType(),
                                    v.getEstimatedBytes(), v.getWidth(), v.getHeight(), v.getBitrate())
                    );
                }
                merged.addAll(deduped.values());
            }
            merged.addAll(images);

            if (merged.isEmpty()) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                        "This X post contains only text with no downloadable image or video."
                );
            }

            String title = (text != null && !text.isBlank()) ? text : (author != null ? "Post by " + author : "X Media");
            return ExtractionResult.success(
                    PLATFORM_ID,
                    getDisplayName(),
                    getBadgeIconRes(),
                    canonicalUrl,
                    title,
                    author,
                    thumbnailUrl,
                    merged
            );
        } catch (Exception e) {
            return ExtractionResult.failure(
                    PLATFORM_ID,
                    canonicalUrl,
                    ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                    "Failed to parse X media metadata."
            );
        }
    }

    private ExtractionResult parseOpenGraphFallback(String html, String canonicalUrl) {
        OpenGraphParser.ParsedPage page = OpenGraphParser.parse(html, canonicalUrl);
        List<MediaVariant> variants = new ArrayList<>();
        for (String v : page.allMeta("og:video:secure_url", "og:video", "twitter:player:stream")) {
            if (isHttpUrl(v)) {
                variants.add(new MediaVariant("HD Video", v, MediaType.VIDEO, "video/mp4", -1L, 0, 0, 0));
            }
        }
        for (String a : page.allMeta("og:audio:secure_url", "og:audio")) {
            if (isHttpUrl(a)) {
                variants.add(new MediaVariant("Audio", a, MediaType.AUDIO, "audio/mp4", -1L, 0, 0, 0));
            }
        }
        String img = page.firstMeta("og:image:secure_url", "og:image", "twitter:image");
        if (variants.isEmpty() && isHttpUrl(img) && !img.contains("abs.twimg.com")) {
            variants.add(new MediaVariant("Original Image", upgradeImageToOrig(img), MediaType.IMAGE, guessImageMime(img), -1L, 0, 0, 0));
        }
        if (variants.isEmpty()) {
            return ExtractionResult.failure(
                    PLATFORM_ID,
                    canonicalUrl,
                    ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                    "No downloadable public media was found on this X post."
            );
        }
        String title = page.firstMeta("og:description", "og:title");
        return ExtractionResult.success(
                PLATFORM_ID,
                getDisplayName(),
                getBadgeIconRes(),
                canonicalUrl,
                title != null ? title : "X Media",
                null,
                img,
                variants
        );
    }

    private static void collectVideoVariants(@Nullable JSONArray variants, List<MediaVariant> out) {
        if (variants == null) {
            return;
        }
        for (int i = 0; i < variants.length(); i++) {
            JSONObject v = variants.optJSONObject(i);
            if (v == null) {
                continue;
            }
            String contentType = v.optString("content_type", v.optString("type", ""));
            if (!"video/mp4".equalsIgnoreCase(contentType) && !contentType.toLowerCase(Locale.ROOT).startsWith("audio/")) {
                continue;
            }
            String rawUrl = v.optString("url", v.optString("src", ""));
            String url = PayloadUnescaper.unescape(rawUrl);
            if (!isHttpUrl(url)) {
                continue;
            }
            int bitrate = v.optInt("bitrate", 0);
            if (contentType.toLowerCase(Locale.ROOT).startsWith("audio/")) {
                out.add(new MediaVariant("Audio", url, MediaType.AUDIO, contentType, -1L, 0, 0, bitrate));
                continue;
            }
            int width = 0;
            int height = 0;
            Matcher res = RESOLUTION_PATTERN.matcher(url);
            if (res.find()) {
                width = Integer.parseInt(res.group(1));
                height = Integer.parseInt(res.group(2));
            }
            out.add(new MediaVariant("MP4", url, MediaType.VIDEO, "video/mp4", -1L, width, height, bitrate));
        }
    }

    private static String buildVideoLabel(boolean isBest, int height, int bitrate) {
        StringBuilder sb = new StringBuilder(isBest ? "HD" : "SD");
        if (height > 0) {
            sb.append(" ").append(height).append("p");
        } else if (bitrate > 0) {
            sb.append(" ").append(Math.max(1, bitrate / 1000)).append(" kbps");
        }
        return sb.toString();
    }

    @NonNull
    public static String upgradeImageToOrig(@NonNull String imageUrl) {
        HttpUrl parsed = HttpUrl.parse(imageUrl);
        if (parsed == null || !UrlNormalizer.hostMatches(parsed.host(), "pbs.twimg.com")) {
            return imageUrl;
        }
        return parsed.newBuilder()
                .removeAllQueryParameters("name")
                .addQueryParameter("name", "orig")
                .build()
                .toString();
    }

    @Nullable
    public static String extractStatusId(@NonNull String url) {
        Matcher matcher = STATUS_ID_PATTERN.matcher(url);
        return matcher.find() ? matcher.group(1) : null;
    }

    @NonNull
    public static String computeSyndicationToken(@NonNull String statusId) {
        try {
            double value = (Double.parseDouble(statusId) / 1e15d) * Math.PI;
            long intPart = (long) value;
            double frac = value - intPart;
            StringBuilder sb = new StringBuilder(Long.toString(intPart, 36));
            for (int i = 0; i < 12; i++) {
                frac *= 36.0;
                int digit = (int) frac;
                sb.append(Character.forDigit(digit, 36));
                frac -= digit;
            }
            return sb.toString().replace("0", "");
        } catch (NumberFormatException e) {
            return "1";
        }
    }

    private static String guessImageMime(String url) {
        String lower = url.toLowerCase(Locale.ROOT);
        if (lower.contains(".png") || lower.contains("format=png")) {
            return "image/png";
        }
        if (lower.contains(".webp") || lower.contains("format=webp")) {
            return "image/webp";
        }
        return "image/jpeg";
    }

    private static boolean isHttpUrl(@Nullable String url) {
        return url != null && (url.startsWith("https://") || url.startsWith("http://"));
    }
}
