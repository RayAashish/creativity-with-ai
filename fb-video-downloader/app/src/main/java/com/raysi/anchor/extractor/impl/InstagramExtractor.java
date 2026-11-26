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
import com.raysi.anchor.extractor.util.OpenGraphParser;
import com.raysi.anchor.extractor.util.PayloadUnescaper;
import com.raysi.anchor.extractor.util.UrlNormalizer;
import com.raysi.anchor.network.NetworkModule;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import okhttp3.ResponseBody;

/**
 * Extracts public Instagram Reels, Posts, and IGTV media via public embed endpoints,
 * JSON-LD, and OpenGraph metadata without authentication.
 */
public final class InstagramExtractor implements PlatformExtractor {

    public static final String PLATFORM_ID = "instagram";

    private static final Pattern SHORTCODE_PATTERN = Pattern.compile(
            "/(?:reel|reels|p|tv)/([A-Za-z0-9_-]+)"
    );

    private static final Pattern VIDEO_URL_JSON = Pattern.compile(
            "\"video_url\"\\s*:\\s*\"([^\"]+)\""
    );

    private static final Pattern DISPLAY_URL_JSON = Pattern.compile(
            "\"display_url\"\\s*:\\s*\"([^\"]+)\""
    );

    private static final Pattern AUDIO_URL_JSON = Pattern.compile(
            "\"(?:audio_url|progressive_download_url)\"\\s*:\\s*\"([^\"]+)\""
    );

    private static final Pattern EMBED_IMAGE_PATTERN = Pattern.compile(
            "<img\\b[^>]*class\\s*=\\s*[\"'][^\"']*EmbeddedMediaImage[^\"']*[\"'][^>]*src\\s*=\\s*[\"']([^\"']+)[\"']",
            Pattern.CASE_INSENSITIVE
    );

    @NonNull
    @Override
    public String getPlatformId() {
        return PLATFORM_ID;
    }

    @NonNull
    @Override
    public String getDisplayName() {
        return "Instagram";
    }

    @Override
    public int getBadgeIconRes() {
        return R.drawable.ic_platform_instagram;
    }

    @Override
    public boolean canHandle(@NonNull Uri canonicalUri) {
        String host = canonicalUri.getHost();
        if (host == null) {
            return false;
        }
        return UrlNormalizer.hostMatches(host, "instagram.com")
                || UrlNormalizer.hostMatches(host, "instagr.am");
    }

    @NonNull
    @Override
    public ExtractionResult extract(@NonNull String canonicalUrl, @NonNull OkHttpClient client) throws IOException {
        HttpUrl parsed = HttpUrl.parse(canonicalUrl);
        String shortcode = extractShortcode(canonicalUrl);

        // Try public embed endpoint first on real instagram.com hosts
        if (parsed != null && shortcode != null && UrlNormalizer.hostMatches(parsed.host(), "instagram.com")) {
            String embedUrl = "https://www.instagram.com/p/" + shortcode + "/embed/captioned/";
            ExtractionResult embedResult = fetchAndParse(embedUrl, canonicalUrl, client);
            if (embedResult instanceof ExtractionResult.Success) {
                return embedResult;
            }
        }

        // Fall back to canonical URL public HTML (OpenGraph / JSON-LD / inline media JSON)
        return fetchAndParse(canonicalUrl, canonicalUrl, client);
    }

    private ExtractionResult fetchAndParse(
            String fetchUrl,
            String canonicalUrl,
            OkHttpClient client
    ) throws IOException {
        try (Response response = client.newCall(NetworkModule.newHtmlRequest(fetchUrl)).execute()) {
            if (!response.isSuccessful()) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        response.code() == 401 || response.code() == 403 || response.code() == 404
                                ? ExtractionResult.FailureReason.PRIVATE_OR_LOGIN_REQUIRED
                                : ExtractionResult.FailureReason.NETWORK_ERROR,
                        "Instagram returned HTTP " + response.code() + " for this public post."
                );
            }
            ResponseBody body = response.body();
            if (body == null) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NETWORK_ERROR,
                        "Empty response received from Instagram."
                );
            }
            return parseHtmlPayload(body.string(), canonicalUrl);
        }
    }

    @NonNull
    public ExtractionResult parseHtmlPayload(@NonNull String html, @NonNull String canonicalUrl) {
        OpenGraphParser.ParsedPage page = OpenGraphParser.parse(html, canonicalUrl);
        Map<String, MediaVariant> uniqueByUrl = new LinkedHashMap<>();

        // 1. Embedded JSON video_url
        Matcher videoMatcher = VIDEO_URL_JSON.matcher(html);
        while (videoMatcher.find()) {
            String videoUrl = PayloadUnescaper.unescape(videoMatcher.group(1));
            if (isHttpUrl(videoUrl) && !uniqueByUrl.containsKey(videoUrl)) {
                uniqueByUrl.put(
                        videoUrl,
                        new MediaVariant("HD Video", videoUrl, MediaType.VIDEO, "video/mp4", -1L, 1080, 1920, 0)
                );
            }
        }

        // 2. OpenGraph / JSON-LD / HTML video tags
        for (String ogVideo : page.allMeta("og:video:secure_url", "og:video:url", "og:video")) {
            if (isHttpUrl(ogVideo) && !uniqueByUrl.containsKey(ogVideo)) {
                uniqueByUrl.put(
                        ogVideo,
                        new MediaVariant("HD Video", ogVideo, MediaType.VIDEO, "video/mp4", -1L, 0, 0, 0)
                );
            }
        }
        for (String ldVideo : page.jsonLdVideoUrls) {
            if (isHttpUrl(ldVideo) && !uniqueByUrl.containsKey(ldVideo)) {
                uniqueByUrl.put(
                        ldVideo,
                        new MediaVariant("Video", ldVideo, MediaType.VIDEO, "video/mp4", -1L, 0, 0, 0)
                );
            }
        }
        for (String htmlVideo : page.htmlVideoUrls) {
            if (isHttpUrl(htmlVideo) && !uniqueByUrl.containsKey(htmlVideo)) {
                uniqueByUrl.put(
                        htmlVideo,
                        new MediaVariant("Video", htmlVideo, MediaType.VIDEO, "video/mp4", -1L, 0, 0, 0)
                );
            }
        }

        // Audio streams if present (Reels audio / og:audio / HTML5 <audio>)
        Matcher audioMatcher = AUDIO_URL_JSON.matcher(html);
        while (audioMatcher.find()) {
            String audioUrl = PayloadUnescaper.unescape(audioMatcher.group(1));
            if (isHttpUrl(audioUrl) && !uniqueByUrl.containsKey(audioUrl)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(audioUrl, "audio/mp4");
                uniqueByUrl.put(
                        audioUrl,
                        new MediaVariant("Audio Track", audioUrl, MediaType.AUDIO, mime, -1L, 0, 0, 0)
                );
            }
        }
        for (String ogAudio : page.allMeta("og:audio:secure_url", "og:audio:url", "og:audio")) {
            if (isHttpUrl(ogAudio) && !uniqueByUrl.containsKey(ogAudio)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(ogAudio, "audio/mpeg");
                uniqueByUrl.put(
                        ogAudio,
                        new MediaVariant("Audio", ogAudio, MediaType.AUDIO, mime, -1L, 0, 0, 0)
                );
            }
        }

        String thumbnailUrl = extractThumbnail(html, page);

        // 3. Extract all public image / carousel variants when no video, or multi-image carousel items
        if (uniqueByUrl.isEmpty()) {
            Matcher displayMatcher = DISPLAY_URL_JSON.matcher(html);
            while (displayMatcher.find()) {
                String img = PayloadUnescaper.unescape(displayMatcher.group(1));
                if (isHttpUrl(img) && !isInstagramLogo(img) && !uniqueByUrl.containsKey(img)) {
                    String mime = MediaMimeUtil.guessMimeFromUrl(img, "image/jpeg");
                    String label = uniqueByUrl.isEmpty() ? "Original Image" : "Image " + (uniqueByUrl.size() + 1);
                    uniqueByUrl.put(
                            img,
                            new MediaVariant(label, img, MediaType.IMAGE, mime, -1L, 0, 0, 0)
                    );
                    if (thumbnailUrl == null) {
                        thumbnailUrl = img;
                    }
                }
            }
            if (uniqueByUrl.isEmpty()) {
                Matcher embedImg = EMBED_IMAGE_PATTERN.matcher(html);
                while (embedImg.find()) {
                    String img = PayloadUnescaper.unescape(embedImg.group(1));
                    if (isHttpUrl(img) && !isInstagramLogo(img) && !uniqueByUrl.containsKey(img)) {
                        String mime = MediaMimeUtil.guessMimeFromUrl(img, "image/jpeg");
                        String label = uniqueByUrl.isEmpty() ? "Original Image" : "Image " + (uniqueByUrl.size() + 1);
                        uniqueByUrl.put(
                                img,
                                new MediaVariant(label, img, MediaType.IMAGE, mime, -1L, 0, 0, 0)
                        );
                        if (thumbnailUrl == null) {
                            thumbnailUrl = img;
                        }
                    }
                }
            }
            if (uniqueByUrl.isEmpty()) {
                String ogImg = page.firstMeta("og:image:secure_url", "og:image");
                if (isHttpUrl(ogImg) && !isInstagramLogo(ogImg)) {
                    uniqueByUrl.put(
                            ogImg,
                            new MediaVariant("Original Image", ogImg, MediaType.IMAGE, MediaMimeUtil.guessMimeFromUrl(ogImg, "image/jpeg"), -1L, 0, 0, 0)
                    );
                    thumbnailUrl = ogImg;
                }
            }
            for (String ldImg : page.jsonLdImageUrls) {
                if (isHttpUrl(ldImg) && !isInstagramLogo(ldImg) && !uniqueByUrl.containsKey(ldImg)) {
                    uniqueByUrl.put(
                            ldImg,
                            new MediaVariant("Image", ldImg, MediaType.IMAGE, MediaMimeUtil.guessMimeFromUrl(ldImg, "image/jpeg"), -1L, 0, 0, 0)
                    );
                    if (thumbnailUrl == null) {
                        thumbnailUrl = ldImg;
                    }
                }
            }
        }

        if (uniqueByUrl.isEmpty()) {
            boolean privateOrLogin = html.contains("/accounts/login")
                    || html.contains("Sorry, this page isn't available")
                    || html.contains("This account is private");
            return ExtractionResult.failure(
                    PLATFORM_ID,
                    canonicalUrl,
                    privateOrLogin
                            ? ExtractionResult.FailureReason.PRIVATE_OR_LOGIN_REQUIRED
                            : ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                    privateOrLogin
                            ? "This Instagram post is private or requires authentication."
                            : "No downloadable public media was found on this Instagram post."
            );
        }

        String title = page.firstMeta("og:title", "og:description");
        if (title == null || title.isBlank() || title.equalsIgnoreCase("Instagram")) {
            title = page.title != null && !page.title.isBlank() ? page.title : "Instagram Media";
        }

        return ExtractionResult.success(
                PLATFORM_ID,
                getDisplayName(),
                getBadgeIconRes(),
                canonicalUrl,
                title,
                null,
                thumbnailUrl,
                new ArrayList<>(uniqueByUrl.values())
        );
    }

    @Nullable
    public static String extractShortcode(@NonNull String url) {
        Matcher matcher = SHORTCODE_PATTERN.matcher(url);
        return matcher.find() ? matcher.group(1) : null;
    }

    @Nullable
    private String extractThumbnail(String html, OpenGraphParser.ParsedPage page) {
        Matcher displayMatcher = DISPLAY_URL_JSON.matcher(html);
        if (displayMatcher.find()) {
            String candidate = PayloadUnescaper.unescape(displayMatcher.group(1));
            if (isHttpUrl(candidate)) {
                return candidate;
            }
        }
        String ogImg = page.firstMeta("og:image:secure_url", "og:image");
        if (isHttpUrl(ogImg) && !isInstagramLogo(ogImg)) {
            return ogImg;
        }
        return page.jsonLdImageUrls.isEmpty() ? null : page.jsonLdImageUrls.get(0);
    }

    private static boolean isInstagramLogo(@Nullable String url) {
        return url != null && (url.contains("instagram-static") || url.contains("rsrc.php"));
    }

    private static boolean isHttpUrl(@Nullable String url) {
        return url != null && (url.startsWith("https://") || url.startsWith("http://"));
    }
}
