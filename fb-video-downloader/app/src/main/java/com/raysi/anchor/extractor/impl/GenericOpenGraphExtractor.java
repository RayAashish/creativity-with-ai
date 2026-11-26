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
import com.raysi.anchor.network.NetworkModule;

import java.io.IOException;
import java.util.ArrayList;
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
 * Universal fallback extractor for any public website or direct media URL supporting
 * videos, images, audio streams/files, and downloadable documents/archives.
 */
public final class GenericOpenGraphExtractor implements PlatformExtractor {

    public static final String PLATFORM_ID = "generic";
    private static final Pattern CONTENT_DISP_FILENAME = Pattern.compile(
            "filename\\*?=(?:UTF-8''|\"?)([^\";\\r\\n]+)",
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
        return "Web";
    }

    @Override
    public int getBadgeIconRes() {
        return R.drawable.ic_platform_generic;
    }

    @Override
    public boolean canHandle(@NonNull Uri canonicalUri) {
        String scheme = canonicalUri.getScheme();
        return "https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme);
    }

    @NonNull
    @Override
    public ExtractionResult extract(@NonNull String canonicalUrl, @NonNull OkHttpClient client) throws IOException {
        try (Response response = client.newCall(NetworkModule.newHtmlRequest(canonicalUrl)).execute()) {
            if (!response.isSuccessful()) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NETWORK_ERROR,
                        "Site returned HTTP " + response.code() + "."
                );
            }

            String rawContentType = response.header("Content-Type", "");
            String cleanMime = rawContentType != null && !rawContentType.isBlank()
                    ? rawContentType.split(";")[0].trim().toLowerCase(Locale.ROOT)
                    : "";
            String contentDisposition = response.header("Content-Disposition");
            boolean isAttachment = contentDisposition != null
                    && contentDisposition.toLowerCase(Locale.ROOT).contains("attachment");

            String finalUrl = response.request().url().toString();
            if (isAttachment || (!cleanMime.isEmpty() && !isWebDocumentMime(cleanMime))) {
                String resolvedMime = (cleanMime.isEmpty() || "application/octet-stream".equals(cleanMime))
                        ? MediaMimeUtil.guessMimeFromUrl(finalUrl, cleanMime.isEmpty() ? "application/octet-stream" : cleanMime)
                        : cleanMime;
                MediaType mediaType = MediaMimeUtil.mediaTypeForMime(resolvedMime);
                long len = parseContentLength(response.header("Content-Length"));
                String label = MediaMimeUtil.shortFormatLabel(resolvedMime, mediaType);
                String title = extractFileTitle(contentDisposition, finalUrl, label);

                MediaVariant direct = new MediaVariant(label, finalUrl, mediaType, resolvedMime, len, 0, 0, 0);
                return ExtractionResult.success(
                        PLATFORM_ID,
                        getDisplayName(),
                        getBadgeIconRes(),
                        canonicalUrl,
                        title,
                        null,
                        mediaType == MediaType.IMAGE ? finalUrl : null,
                        List.of(direct)
                );
            }

            ResponseBody body = response.body();
            if (body == null) {
                return ExtractionResult.failure(
                        PLATFORM_ID,
                        canonicalUrl,
                        ExtractionResult.FailureReason.NETWORK_ERROR,
                        "Empty response body."
                );
            }
            return parseHtmlPayload(body.string(), finalUrl);
        }
    }

    @NonNull
    public ExtractionResult parseHtmlPayload(@NonNull String html, @NonNull String canonicalUrl) {
        OpenGraphParser.ParsedPage page = OpenGraphParser.parse(html, canonicalUrl);
        Map<String, MediaVariant> unique = new LinkedHashMap<>();

        // 1. Videos
        for (String videoUrl : page.allMeta("og:video:secure_url", "og:video:url", "og:video", "twitter:player:stream")) {
            if (isHttpUrl(videoUrl) && !isLikelyHtmlEmbed(videoUrl)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(videoUrl, "video/mp4");
                MediaType t = MediaMimeUtil.mediaTypeForMime(mime);
                unique.putIfAbsent(
                        videoUrl,
                        new MediaVariant(MediaMimeUtil.shortFormatLabel(mime, t), videoUrl, t, mime, -1L, 0, 0, 0)
                );
            }
        }
        for (String ldVideo : page.jsonLdVideoUrls) {
            if (isHttpUrl(ldVideo) && !isLikelyHtmlEmbed(ldVideo)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(ldVideo, "video/mp4");
                unique.putIfAbsent(ldVideo, new MediaVariant("MP4 Video", ldVideo, MediaType.VIDEO, mime, -1L, 0, 0, 0));
            }
        }
        for (String htmlVideo : page.htmlVideoUrls) {
            if (isHttpUrl(htmlVideo)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(htmlVideo, "video/mp4");
                unique.putIfAbsent(htmlVideo, new MediaVariant("Video", htmlVideo, MediaType.VIDEO, mime, -1L, 0, 0, 0));
            }
        }

        // 2. Audio (og:audio, JSON-LD AudioObject/MusicRecording, HTML5 <audio>)
        String ogAudioType = page.firstMeta("og:audio:type");
        for (String audioUrl : page.allMeta("og:audio:secure_url", "og:audio:url", "og:audio")) {
            if (isHttpUrl(audioUrl)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(audioUrl, ogAudioType != null ? ogAudioType : "audio/mpeg");
                unique.putIfAbsent(
                        audioUrl,
                        new MediaVariant(MediaMimeUtil.shortFormatLabel(mime, MediaType.AUDIO), audioUrl, MediaType.AUDIO, mime, -1L, 0, 0, 0)
                );
            }
        }
        for (String ldAudio : page.jsonLdAudioUrls) {
            if (isHttpUrl(ldAudio)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(ldAudio, "audio/mpeg");
                unique.putIfAbsent(
                        ldAudio,
                        new MediaVariant(MediaMimeUtil.shortFormatLabel(mime, MediaType.AUDIO), ldAudio, MediaType.AUDIO, mime, -1L, 0, 0, 0)
                );
            }
        }
        for (String htmlAudio : page.htmlAudioUrls) {
            if (isHttpUrl(htmlAudio)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(htmlAudio, "audio/mpeg");
                unique.putIfAbsent(
                        htmlAudio,
                        new MediaVariant(MediaMimeUtil.shortFormatLabel(mime, MediaType.AUDIO), htmlAudio, MediaType.AUDIO, mime, -1L, 0, 0, 0)
                );
            }
        }

        // 3. Direct asset links (<a download> or direct .mp3/.mp4/.pdf/.zip/.png/etc.)
        for (String assetUrl : page.htmlAssetLinks) {
            if (isHttpUrl(assetUrl) && !unique.containsKey(assetUrl)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(assetUrl, "application/octet-stream");
                MediaType type = MediaMimeUtil.mediaTypeForMime(mime);
                unique.putIfAbsent(
                        assetUrl,
                        new MediaVariant(MediaMimeUtil.shortFormatLabel(mime, type), assetUrl, type, mime, -1L, 0, 0, 0)
                );
            }
        }
        for (String ldOther : page.jsonLdOtherUrls) {
            if (isHttpUrl(ldOther) && !unique.containsKey(ldOther)) {
                String mime = MediaMimeUtil.guessMimeFromUrl(ldOther, "application/octet-stream");
                MediaType type = MediaMimeUtil.mediaTypeForMime(mime);
                unique.putIfAbsent(
                        ldOther,
                        new MediaVariant(MediaMimeUtil.shortFormatLabel(mime, type), ldOther, type, mime, -1L, 0, 0, 0)
                );
            }
        }

        // 4. Images (primary if no video/audio/assets, or exposed when page is image-first)
        String ogImage = page.firstMeta("og:image:secure_url", "og:image", "twitter:image");
        if (unique.isEmpty() && isHttpUrl(ogImage)) {
            String mime = MediaMimeUtil.guessMimeFromUrl(ogImage, "image/jpeg");
            unique.putIfAbsent(
                    ogImage,
                    new MediaVariant("Original Image", ogImage, MediaType.IMAGE, mime, -1L, 0, 0, 0)
            );
        }
        if (unique.isEmpty()) {
            for (String ldImage : page.jsonLdImageUrls) {
                if (isHttpUrl(ldImage)) {
                    String mime = MediaMimeUtil.guessMimeFromUrl(ldImage, "image/jpeg");
                    unique.putIfAbsent(
                            ldImage,
                            new MediaVariant("Image", ldImage, MediaType.IMAGE, mime, -1L, 0, 0, 0)
                    );
                }
            }
        }

        if (unique.isEmpty()) {
            return ExtractionResult.failure(
                    PLATFORM_ID,
                    canonicalUrl,
                    ExtractionResult.FailureReason.NO_MEDIA_FOUND,
                    "No downloadable public video, audio, image, or file was found on this page."
            );
        }

        String title = page.firstMeta("og:title", "twitter:title");
        if (title == null || title.isBlank()) {
            title = page.title != null && !page.title.isBlank() ? page.title : "Web Media";
        }
        String siteName = page.firstMeta("og:site_name");

        return ExtractionResult.success(
                PLATFORM_ID,
                siteName != null && !siteName.isBlank() ? siteName : getDisplayName(),
                getBadgeIconRes(),
                canonicalUrl,
                title,
                null,
                isHttpUrl(ogImage) ? ogImage : null,
                new ArrayList<>(unique.values())
        );
    }

    private static boolean isWebDocumentMime(String cleanMime) {
        return "text/html".equals(cleanMime)
                || "application/xhtml+xml".equals(cleanMime)
                || "application/json".equals(cleanMime)
                || "text/javascript".equals(cleanMime)
                || "application/javascript".equals(cleanMime)
                || "text/css".equals(cleanMime);
    }

    private static String extractFileTitle(@Nullable String disposition, String url, String fallback) {
        if (disposition != null) {
            Matcher m = CONTENT_DISP_FILENAME.matcher(disposition);
            if (m.find()) {
                String name = m.group(1).replace("\"", "").trim();
                if (!name.isEmpty()) {
                    return name;
                }
            }
        }
        HttpUrl parsed = HttpUrl.parse(url);
        if (parsed != null) {
            List<String> segs = parsed.pathSegments();
            if (!segs.isEmpty()) {
                String last = segs.get(segs.size() - 1);
                if (!last.isBlank()) {
                    return last;
                }
            }
        }
        return fallback;
    }

    private static boolean isLikelyHtmlEmbed(String url) {
        String lower = url.toLowerCase(Locale.ROOT);
        return lower.endsWith(".html") || lower.endsWith(".htm") || lower.contains("/embed/");
    }

    private static long parseContentLength(@Nullable String header) {
        if (header == null) {
            return -1L;
        }
        try {
            return Long.parseLong(header.trim());
        } catch (NumberFormatException e) {
            return -1L;
        }
    }

    private static boolean isHttpUrl(@Nullable String url) {
        return url != null && (url.startsWith("https://") || url.startsWith("http://"));
    }
}
