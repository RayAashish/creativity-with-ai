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

import okhttp3.OkHttpClient;
import okhttp3.Response;
import okhttp3.ResponseBody;

/**
 * Extracts public Facebook videos, Reels, Watch clips, and photos without authentication.
 */
public final class FacebookExtractor implements PlatformExtractor {

    public static final String PLATFORM_ID = "facebook";

    private static final List<PatternLabel> VIDEO_JSON_PATTERNS = List.of(
            new PatternLabel(Pattern.compile("\"browser_native_hd_url\"\\s*:\\s*\"([^\"]+)\""), "HD Video", true),
            new PatternLabel(Pattern.compile("\"playable_url_quality_hd\"\\s*:\\s*\"([^\"]+)\""), "HD Video", true),
            new PatternLabel(Pattern.compile("\"hd_src_no_ratelimit\"\\s*:\\s*\"([^\"]+)\""), "HD Video", true),
            new PatternLabel(Pattern.compile("\"hd_src\"\\s*:\\s*\"([^\"]+)\""), "HD Video", true),
            new PatternLabel(Pattern.compile("\"browser_native_sd_url\"\\s*:\\s*\"([^\"]+)\""), "SD Video", false),
            new PatternLabel(Pattern.compile("\"playable_url\"\\s*:\\s*\"([^\"]+)\""), "SD Video", false),
            new PatternLabel(Pattern.compile("\"sd_src_no_ratelimit\"\\s*:\\s*\"([^\"]+)\""), "SD Video", false),
            new PatternLabel(Pattern.compile("\"sd_src\"\\s*:\\s*\"([^\"]+)\""), "SD Video", false)
    );

    private static final Pattern THUMBNAIL_JSON_PATTERN = Pattern.compile(
            "\"preferred_thumbnail\"\\s*:\\s*\\{[^}]*\"uri\"\\s*:\\s*\"([^\"]+)\""
    );

    private static final Pattern AUTHOR_JSON_PATTERN = Pattern.compile(
            "\"owning_profile\"\\s*:\\s*\\{[^}]*\"name\"\\s*:\\s*\"([^\"]+)\""
    );

    private static final Pattern PHOTO_JSON_PATTERN = Pattern.compile(
            "\"(?:viewer_image|photo_image|full_width_image)\"\\s*:\\s*\\{[^}]*\"uri\"\\s*:\\s*\"([^\"]+)\""
    );

    private static final Pattern AUDIO_JSON_PATTERN = Pattern.compile(
            "\"audio_url\"\\s*:\\s*\"([^\"]+)\""
    );

    @NonNull
    @Override
    public String getPlatformId() {
        return PLATFORM_ID;
    }

    @NonNull
    @Override
    public String getDisplayName() {
        return "Facebook";
    }

    @Override
    public int getBadgeIconRes() {
        return R.drawable.ic_platform_facebook;
    }

    @Override
    public boolean canHandle(@NonNull Uri canonicalUri) {
        String host = canonicalUri.getHost();
        if (host == null) {
            return false;
        }
        return UrlNormalizer.hostMatches(host, "facebook.com")
                || UrlNormalizer.hostMatches(host, "fb.watch")
                || UrlNormalizer.hostMatches(host, "fb.com");
    }

    @NonNull
    @Override
    public ExtractionResult extract(@NonNull String canonicalUrl, @NonNull OkHttpClient client) throws IOException {
        try (Response response = client.newCall(NetworkModule.newHtmlRequest(canonicalUrl)).execute()) {
            if (!response.isSuccessful()) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        response.code() == 401 || response.code() == 403
                                ? ExtractionResult.FailureReason.PRIVATE_OR_LOGIN_REQUIRED
                                : ExtractionResult.FailureReason.NETWORK_ERROR,
                        "Facebook returned HTTP " + response.code() + " for this link."
                );
            }
            ResponseBody body = response.body();
            if (body == null) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NETWORK_ERROR,
                        "Empty response received from Facebook."
                );
            }
            String html = body.string();
            return parseHtmlPayload(html, response.request().url().toString());
        }
    }

    @NonNull
    public ExtractionResult parseHtmlPayload(@NonNull String html, @NonNull String canonicalUrl) {
        OpenGraphParser.ParsedPage page = OpenGraphParser.parse(html, canonicalUrl);
        Map<String, MediaVariant> uniqueByUrl = new LinkedHashMap<>();

        for (PatternLabel pl : VIDEO_JSON_PATTERNS) {
            Matcher matcher = pl.pattern.matcher(html);
            if (matcher.find()) {
                String unescaped = PayloadUnescaper.unescape(matcher.group(1));
                if (isValidHttpUrl(unescaped) && !uniqueByUrl.containsKey(unescaped)) {
                    uniqueByUrl.put(
                            unescaped,
                            new MediaVariant(
                                    pl.label,
                                    unescaped,
                                    MediaType.VIDEO,
                                    "video/mp4",
                                    -1L,
                                    pl.isHd ? 1280 : 640,
                                    pl.isHd ? 720 : 360,
                                    0
                            )
                    );
                }
            }
        }

        // OpenGraph / JSON-LD video fallback
        for (String ogVideo : page.allMeta("og:video:secure_url", "og:video:url", "og:video")) {
            if (isValidHttpUrl(ogVideo) && !uniqueByUrl.containsKey(ogVideo)) {
                uniqueByUrl.put(
                        ogVideo,
                        new MediaVariant(
                                uniqueByUrl.isEmpty() ? "HD Video" : "Video Stream",
                                ogVideo,
                                MediaType.VIDEO,
                                "video/mp4",
                                -1L,
                                0,
                                0,
                                0
                        )
                );
            }
        }
        for (String ldVideo : page.jsonLdVideoUrls) {
            if (isValidHttpUrl(ldVideo) && !uniqueByUrl.containsKey(ldVideo)) {
                uniqueByUrl.put(
                        ldVideo,
                        new MediaVariant("Video", ldVideo, MediaType.VIDEO, "video/mp4", -1L, 0, 0, 0)
                );
            }
        }

        // Audio streams (music / voice / og:audio)
        Matcher audioMatcher = AUDIO_JSON_PATTERN.matcher(html);
        while (audioMatcher.find()) {
            String audioUrl = PayloadUnescaper.unescape(audioMatcher.group(1));
            if (isValidHttpUrl(audioUrl) && !uniqueByUrl.containsKey(audioUrl)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(audioUrl, "audio/mp4");
                uniqueByUrl.put(
                        audioUrl,
                        new MediaVariant("Audio Track", audioUrl, MediaType.AUDIO, mime, -1L, 0, 0, 0)
                );
            }
        }
        for (String audioUrl : page.allMeta("og:audio:secure_url", "og:audio:url", "og:audio")) {
            if (isValidHttpUrl(audioUrl) && !uniqueByUrl.containsKey(audioUrl)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(audioUrl, "audio/mpeg");
                uniqueByUrl.put(
                        audioUrl,
                        new MediaVariant("Audio", audioUrl, MediaType.AUDIO, mime, -1L, 0, 0, 0)
                );
            }
        }
        for (String htmlAudio : page.htmlAudioUrls) {
            if (isValidHttpUrl(htmlAudio) && !uniqueByUrl.containsKey(htmlAudio)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(htmlAudio, "audio/mpeg");
                uniqueByUrl.put(
                        htmlAudio,
                        new MediaVariant("Audio", htmlAudio, MediaType.AUDIO, mime, -1L, 0, 0, 0)
                );
            }
        }

        String thumbnailUrl = extractThumbnail(html, page);
        if (uniqueByUrl.isEmpty()) {
            // Public Facebook photo posts via embedded JSON or OpenGraph
            Matcher photoMatcher = PHOTO_JSON_PATTERN.matcher(html);
            while (photoMatcher.find()) {
                String photoUrl = PayloadUnescaper.unescape(photoMatcher.group(1));
                if (isValidHttpUrl(photoUrl) && !isFacebookPlaceholderImage(photoUrl) && !uniqueByUrl.containsKey(photoUrl)) {
                    String mime = MediaMimeUtil.guessMimeFromUrl(photoUrl, "image/jpeg");
                    String label = uniqueByUrl.isEmpty() ? "Original Image" : "Image " + (uniqueByUrl.size() + 1);
                    uniqueByUrl.put(
                            photoUrl,
                            new MediaVariant(label, photoUrl, MediaType.IMAGE, mime, -1L, 0, 0, 0)
                    );
                    if (thumbnailUrl == null) {
                        thumbnailUrl = photoUrl;
                    }
                }
            }
        }
        if (uniqueByUrl.isEmpty()) {
            // Check if public photo post via og:image (ignore generic Facebook brand fallback icons)
            String ogImage = page.firstMeta("og:image:secure_url", "og:image");
            if (isValidHttpUrl(ogImage) && !isFacebookPlaceholderImage(ogImage)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(ogImage, "image/jpeg");
                uniqueByUrl.put(
                        ogImage,
                        new MediaVariant("Original Image", ogImage, MediaType.IMAGE, mime, -1L, 0, 0, 0)
                );
                thumbnailUrl = ogImage;
            }
        }

        if (uniqueByUrl.isEmpty()) {
            boolean loginWall = html.contains("login_form")
                    || html.contains("You must log in")
                    || html.contains("This content isn't available")
                    || html.contains("login/?next=");
            return ExtractionResult.failure(
                    PLATFORM_ID,
                    canonicalUrl,
                    loginWall
                            ? ExtractionResult.FailureReason.PRIVATE_OR_LOGIN_REQUIRED
                            : ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                    loginWall
                            ? "This Facebook post is private or requires login."
                            : "No downloadable public media was found on this Facebook page."
            );
        }

        String title = chooseTitle(page);
        String author = extractAuthor(html);

        return ExtractionResult.success(
                PLATFORM_ID,
                getDisplayName(),
                getBadgeIconRes(),
                canonicalUrl,
                title,
                author,
                thumbnailUrl,
                new ArrayList<>(uniqueByUrl.values())
        );
    }

    @Nullable
    private String extractThumbnail(String html, OpenGraphParser.ParsedPage page) {
        Matcher thumbMatcher = THUMBNAIL_JSON_PATTERN.matcher(html);
        if (thumbMatcher.find()) {
            String candidate = PayloadUnescaper.unescape(thumbMatcher.group(1));
            if (isValidHttpUrl(candidate)) {
                return candidate;
            }
        }
        String ogImg = page.firstMeta("og:image:secure_url", "og:image");
        return isValidHttpUrl(ogImg) && !isFacebookPlaceholderImage(ogImg) ? ogImg : null;
    }

    @Nullable
    private String extractAuthor(String html) {
        Matcher m = AUTHOR_JSON_PATTERN.matcher(html);
        if (m.find()) {
            return PayloadUnescaper.unescape(m.group(1));
        }
        return null;
    }

    private String chooseTitle(OpenGraphParser.ParsedPage page) {
        String ogTitle = page.firstMeta("og:title", "og:description");
        if (ogTitle != null && !ogTitle.isBlank() && !ogTitle.equalsIgnoreCase("Facebook")) {
            return ogTitle;
        }
        if (page.title != null && !page.title.isBlank() && !page.title.equalsIgnoreCase("Facebook")) {
            return page.title;
        }
        return "Facebook Media";
    }

    private static boolean isFacebookPlaceholderImage(@Nullable String url) {
        if (url == null) {
            return true;
        }
        return url.contains("fb_icon") || url.contains("rsrc.php");
    }

    private static boolean isValidHttpUrl(@Nullable String url) {
        return url != null && (url.startsWith("https://") || url.startsWith("http://"));
    }

    private record PatternLabel(Pattern pattern, String label, boolean isHd) {
    }
}
