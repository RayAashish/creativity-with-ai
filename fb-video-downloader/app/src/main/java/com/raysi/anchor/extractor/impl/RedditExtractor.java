package com.raysi.anchor.extractor.impl;

import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.raysi.anchor.R;
import com.raysi.anchor.extractor.PlatformExtractor;
import com.raysi.anchor.extractor.model.ExtractionResult;
import com.raysi.anchor.extractor.model.MediaType;
import com.raysi.anchor.extractor.model.MediaVariant;
import com.raysi.anchor.extractor.util.MediaMimeUtil;
import com.raysi.anchor.extractor.util.PayloadUnescaper;
import com.raysi.anchor.extractor.util.UrlNormalizer;
import com.raysi.anchor.network.NetworkModule;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import okhttp3.ResponseBody;

/**
 * Extracts public Reddit videos (v.redd.it fallback MP4), galleries, and images via Reddit's public .json endpoint.
 */
public final class RedditExtractor implements PlatformExtractor {

    public static final String PLATFORM_ID = "reddit";

    @NonNull
    @Override
    public String getPlatformId() {
        return PLATFORM_ID;
    }

    @NonNull
    @Override
    public String getDisplayName() {
        return "Reddit";
    }

    @Override
    public int getBadgeIconRes() {
        return R.drawable.ic_platform_reddit;
    }

    @Override
    public boolean canHandle(@NonNull Uri canonicalUri) {
        String host = canonicalUri.getHost();
        if (host == null) {
            return false;
        }
        return UrlNormalizer.hostMatches(host, "reddit.com")
                || UrlNormalizer.hostMatches(host, "redd.it");
    }

    @NonNull
    @Override
    public ExtractionResult extract(@NonNull String canonicalUrl, @NonNull OkHttpClient client) throws IOException {
        HttpUrl parsed = HttpUrl.parse(canonicalUrl);
        if (parsed != null && UrlNormalizer.hostMatches(parsed.host(), "i.redd.it")) {
            return ExtractionResult.success(
                    PLATFORM_ID,
                    getDisplayName(),
                    getBadgeIconRes(),
                    canonicalUrl,
                    "Reddit Image",
                    null,
                    canonicalUrl,
                    List.of(new MediaVariant("Original Image", canonicalUrl, MediaType.IMAGE, guessImageMime(canonicalUrl), -1L, 0, 0, 0))
            );
        }

        String jsonUrl = buildJsonEndpoint(canonicalUrl);
        try (Response response = client.newCall(
                NetworkModule.newJsonRequest(jsonUrl, canonicalUrl, NetworkModule.REDDIT_USER_AGENT)).execute()) {
            if (!response.isSuccessful()) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        response.code() == 403 || response.code() == 404
                                ? ExtractionResult.FailureReason.PRIVATE_OR_LOGIN_REQUIRED
                                : ExtractionResult.FailureReason.NETWORK_ERROR,
                        "Reddit returned HTTP " + response.code() + " for this post."
                );
            }
            ResponseBody body = response.body();
            if (body == null) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NETWORK_ERROR,
                        "Empty response received from Reddit."
                );
            }
            return enrichRedditVideoAudioIfAvailable(
                    parseRedditJson(body.string(), canonicalUrl),
                    canonicalUrl,
                    client
            );
        }
    }

    private ExtractionResult enrichRedditVideoAudioIfAvailable(
            ExtractionResult result,
            String canonicalUrl,
            OkHttpClient client
    ) {
        if (!(result instanceof ExtractionResult.Success success)) {
            return result;
        }
        MediaVariant best = success.getBestVariant();
        if (best.getMediaType() != MediaType.VIDEO || !best.getUrl().contains("v.redd.it/")) {
            return result;
        }
        int slashIdx = best.getUrl().lastIndexOf('/');
        if (slashIdx <= 0) {
            return result;
        }
        String base = best.getUrl().substring(0, slashIdx + 1);
        for (String audioFile : new String[]{"CMAF_AUDIO_128.mp4", "DASH_AUDIO_128.mp4", "DASH_audio.mp4"}) {
            String candidate = base + audioFile;
            try (Response head = client.newCall(NetworkModule.newMediaProbeRequest(candidate, canonicalUrl)).execute()) {
                if (head.isSuccessful()) {
                    List<MediaVariant> expanded = new ArrayList<>(success.getVariants());
                    expanded.add(new MediaVariant("Audio Track (M4A)", candidate, MediaType.AUDIO, "audio/mp4", -1L, 0, 0, 128_000));
                    return success.withVariants(expanded);
                }
            } catch (IOException ignored) {
            }
        }
        return result;
    }

    @NonNull
    public static String buildJsonEndpoint(@NonNull String canonicalUrl) {
        HttpUrl parsed = HttpUrl.parse(canonicalUrl);
        if (parsed == null) {
            return canonicalUrl + "/.json?raw_json=1";
        }
        String path = parsed.encodedPath();
        if (!path.endsWith(".json")) {
            String trimmed = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
            path = trimmed + "/.json";
        }
        return parsed.newBuilder()
                .encodedPath(path)
                .removeAllQueryParameters("raw_json")
                .addQueryParameter("raw_json", "1")
                .build()
                .toString();
    }

    @NonNull
    public ExtractionResult parseRedditJson(@NonNull String jsonText, @NonNull String canonicalUrl) {
        try {
            Object root = new JSONTokener(jsonText).nextValue();
            JSONObject listingObj = null;
            if (root instanceof JSONArray array && array.length() > 0) {
                listingObj = array.optJSONObject(0);
            } else if (root instanceof JSONObject obj) {
                listingObj = obj;
            }
            if (listingObj == null) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                        "Unexpected Reddit metadata format."
                );
            }

            JSONObject data = listingObj.optJSONObject("data");
            JSONArray children = data != null ? data.optJSONArray("children") : null;
            if (children == null || children.length() == 0) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                        "No post data found in Reddit response."
                );
            }

            JSONObject post = children.optJSONObject(0).optJSONObject("data");
            if (post == null) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                        "Reddit post metadata is empty."
                );
            }

            String title = PayloadUnescaper.unescape(post.optString("title", "Reddit Media"));
            String authorRaw = post.optString("author", "");
            String author = !authorRaw.isBlank() && !"[deleted]".equals(authorRaw) ? "u/" + authorRaw : null;
            String thumbnailUrl = extractThumbnail(post);

            List<MediaVariant> variants = new ArrayList<>();

            // 1. Direct reddit_video (or crosspost_parent_list[0])
            extractVideoFromPost(post, variants);
            if (variants.isEmpty()) {
                JSONArray crossposts = post.optJSONArray("crosspost_parent_list");
                if (crossposts != null && crossposts.length() > 0) {
                    JSONObject parent = crossposts.optJSONObject(0);
                    if (parent != null) {
                        extractVideoFromPost(parent, variants);
                        if (thumbnailUrl == null) {
                            thumbnailUrl = extractThumbnail(parent);
                        }
                    }
                }
            }

            // 2. Gallery posts
            if (variants.isEmpty() && post.optBoolean("is_gallery", false)) {
                extractGalleryImages(post, variants);
            }

            // 3. Direct image / audio / video / document link post
            if (variants.isEmpty()) {
                String destUrl = PayloadUnescaper.unescape(post.optString("url_overridden_by_dest", post.optString("url", "")));
                if (isHttpUrl(destUrl) && MediaMimeUtil.isDirectMediaOrAssetUrl(destUrl)) {
                    String mime = MediaMimeUtil.guessMimeFromUrl(destUrl, "application/octet-stream");
                    MediaType type = MediaMimeUtil.mediaTypeForMime(mime);
                    variants.add(new MediaVariant(
                            MediaMimeUtil.shortFormatLabel(mime, type),
                            destUrl,
                            type,
                            mime,
                            -1L,
                            0,
                            0,
                            0
                    ));
                    if (thumbnailUrl == null && type == MediaType.IMAGE) {
                        thumbnailUrl = destUrl;
                    }
                } else {
                    String previewImg = extractPreviewSourceUrl(post);
                    if (isHttpUrl(previewImg) && "image".equalsIgnoreCase(post.optString("post_hint", ""))) {
                        variants.add(new MediaVariant("Original Image", previewImg, MediaType.IMAGE, guessImageMime(previewImg), -1L, 0, 0, 0));
                    }
                }
            }

            if (variants.isEmpty()) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                        "This Reddit post does not contain directly hosted video, audio, image, or file media."
                );
            }

            if (thumbnailUrl == null && variants.get(0).getMediaType() == MediaType.IMAGE) {
                thumbnailUrl = variants.get(0).getUrl();
            }

            return ExtractionResult.success(
                    PLATFORM_ID,
                    getDisplayName(),
                    getBadgeIconRes(),
                    canonicalUrl,
                    title != null && !title.isBlank() ? title : "Reddit Media",
                    author,
                    thumbnailUrl,
                    variants
            );
        } catch (Exception e) {
            return ExtractionResult.failure(
                    PLATFORM_ID,
                    canonicalUrl,
                    ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                    "Failed to parse Reddit post metadata."
            );
        }
    }

    private void extractVideoFromPost(JSONObject post, List<MediaVariant> out) {
        JSONObject media = post.optJSONObject("secure_media");
        if (media == null) {
            media = post.optJSONObject("media");
        }
        JSONObject redditVideo = media != null ? media.optJSONObject("reddit_video") : null;
        if (redditVideo == null) {
            JSONObject preview = post.optJSONObject("preview");
            if (preview != null) {
                redditVideo = preview.optJSONObject("reddit_video_preview");
            }
        }
        if (redditVideo == null) {
            return;
        }
        String fallbackUrl = PayloadUnescaper.unescape(redditVideo.optString("fallback_url", ""));
        if (isHttpUrl(fallbackUrl)) {
            int width = redditVideo.optInt("width", 0);
            int height = redditVideo.optInt("height", 0);
            String label = height > 0 ? "HD " + height + "p" : "HD Video";
            out.add(new MediaVariant(label, fallbackUrl, MediaType.VIDEO, "video/mp4", -1L, width, height, 0));
        }
        String scrubberUrl = PayloadUnescaper.unescape(redditVideo.optString("scrubber_media_url", ""));
        if (isHttpUrl(scrubberUrl) && !scrubberUrl.equals(fallbackUrl)) {
            out.add(new MediaVariant("SD Preview", scrubberUrl, MediaType.VIDEO, "video/mp4", -1L, 0, 0, 0));
        }
    }

    private void extractGalleryImages(JSONObject post, List<MediaVariant> out) {
        JSONObject galleryData = post.optJSONObject("gallery_data");
        JSONObject metadata = post.optJSONObject("media_metadata");
        if (metadata == null) {
            return;
        }
        JSONArray items = galleryData != null ? galleryData.optJSONArray("items") : null;
        if (items != null) {
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.optJSONObject(i);
                if (item == null) {
                    continue;
                }
                String mediaId = item.optString("media_id", "");
                addGalleryMetadataEntry(metadata.optJSONObject(mediaId), out, i + 1);
            }
        }
    }

    private void addGalleryMetadataEntry(@Nullable JSONObject entry, List<MediaVariant> out, int index) {
        if (entry == null) {
            return;
        }
        JSONObject source = entry.optJSONObject("s");
        if (source == null) {
            return;
        }
        String url = PayloadUnescaper.unescape(source.optString("u", source.optString("gif", "")));
        if (!isHttpUrl(url)) {
            return;
        }
        int width = source.optInt("x", 0);
        int height = source.optInt("y", 0);
        String label = index == 1 ? "Image 1 (Original)" : "Image " + index + " (Original)";
        out.add(new MediaVariant(label, url, MediaType.IMAGE, guessImageMime(url), -1L, width, height, 0));
    }

    @Nullable
    private String extractThumbnail(JSONObject post) {
        String preview = extractPreviewSourceUrl(post);
        if (isHttpUrl(preview)) {
            return preview;
        }
        String thumb = PayloadUnescaper.unescape(post.optString("thumbnail", ""));
        return isHttpUrl(thumb) ? thumb : null;
    }

    @Nullable
    private String extractPreviewSourceUrl(JSONObject post) {
        JSONObject preview = post.optJSONObject("preview");
        if (preview == null) {
            return null;
        }
        JSONArray images = preview.optJSONArray("images");
        if (images == null || images.length() == 0) {
            return null;
        }
        JSONObject first = images.optJSONObject(0);
        JSONObject source = first != null ? first.optJSONObject("source") : null;
        return source != null ? PayloadUnescaper.unescape(source.optString("url", "")) : null;
    }

    private static String guessImageMime(String url) {
        String lower = url.toLowerCase(Locale.ROOT);
        if (lower.contains(".png")) {
            return "image/png";
        }
        if (lower.contains(".webp")) {
            return "image/webp";
        }
        if (lower.contains(".gif")) {
            return "image/gif";
        }
        return "image/jpeg";
    }

    private static boolean isHttpUrl(@Nullable String url) {
        return url != null && (url.startsWith("https://") || url.startsWith("http://"));
    }
}
