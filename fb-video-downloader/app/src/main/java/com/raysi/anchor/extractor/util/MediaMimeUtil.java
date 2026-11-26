package com.raysi.anchor.extractor.util;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.raysi.anchor.extractor.model.MediaType;

import java.util.Locale;

import okhttp3.HttpUrl;

/**
 * Shared MIME type, extension, and {@link MediaType} inference utilities across all extractors.
 */
public final class MediaMimeUtil {

    private MediaMimeUtil() {
    }

    @NonNull
    public static MediaType mediaTypeForMime(@Nullable String mimeType) {
        if (mimeType == null || mimeType.isBlank()) {
            return MediaType.OTHER;
        }
        String lower = mimeType.toLowerCase(Locale.ROOT);
        if (lower.startsWith("video/")) {
            return MediaType.VIDEO;
        }
        if (lower.startsWith("image/")) {
            return MediaType.IMAGE;
        }
        if (lower.startsWith("audio/")) {
            return MediaType.AUDIO;
        }
        return MediaType.OTHER;
    }

    @NonNull
    public static String guessMimeFromUrl(@Nullable String url, @NonNull String fallbackMime) {
        if (url == null || url.isBlank()) {
            return fallbackMime;
        }
        String path = extractLowerPath(url);
        if (path.endsWith(".mp4") || path.endsWith(".m4v")) {
            return "video/mp4";
        }
        if (path.endsWith(".webm")) {
            return "video/webm";
        }
        if (path.endsWith(".mov")) {
            return "video/quicktime";
        }
        if (path.endsWith(".mkv")) {
            return "video/x-matroska";
        }
        if (path.endsWith(".mp3")) {
            return "audio/mpeg";
        }
        if (path.endsWith(".m4a") || path.endsWith(".aac")) {
            return "audio/mp4";
        }
        if (path.endsWith(".ogg") || path.endsWith(".oga") || path.endsWith(".opus")) {
            return "audio/ogg";
        }
        if (path.endsWith(".flac")) {
            return "audio/flac";
        }
        if (path.endsWith(".wav")) {
            return "audio/wav";
        }
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (path.endsWith(".png")) {
            return "image/png";
        }
        if (path.endsWith(".webp")) {
            return "image/webp";
        }
        if (path.endsWith(".gif")) {
            return "image/gif";
        }
        if (path.endsWith(".avif")) {
            return "image/avif";
        }
        if (path.endsWith(".pdf")) {
            return "application/pdf";
        }
        if (path.endsWith(".zip")) {
            return "application/zip";
        }
        if (path.endsWith(".txt")) {
            return "text/plain";
        }
        return fallbackMime;
    }

    public static boolean isDirectMediaOrAssetUrl(@Nullable String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String mime = guessMimeFromUrl(url, "");
        return !mime.isEmpty();
    }

    public static boolean isAudioUrl(@Nullable String url) {
        return mediaTypeForMime(guessMimeFromUrl(url, "")) == MediaType.AUDIO;
    }

    public static boolean isImageUrl(@Nullable String url) {
        return mediaTypeForMime(guessMimeFromUrl(url, "")) == MediaType.IMAGE;
    }

    public static boolean isVideoUrl(@Nullable String url) {
        return mediaTypeForMime(guessMimeFromUrl(url, "")) == MediaType.VIDEO;
    }

    @NonNull
    public static String shortFormatLabel(@NonNull String mimeType, @NonNull MediaType type) {
        String lower = mimeType.toLowerCase(Locale.ROOT);
        return switch (type) {
            case VIDEO -> lower.contains("webm") ? "WebM Video" : "MP4 Video";
            case IMAGE -> {
                if (lower.contains("png")) yield "PNG Image";
                if (lower.contains("webp")) yield "WebP Image";
                if (lower.contains("gif")) yield "GIF";
                yield "Original Image";
            }
            case AUDIO -> {
                if (lower.contains("mpeg") || lower.contains("mp3")) yield "MP3 Audio";
                if (lower.contains("ogg") || lower.contains("opus")) yield "OGG Audio";
                if (lower.contains("flac")) yield "FLAC Audio";
                if (lower.contains("wav")) yield "WAV Audio";
                yield "M4A Audio";
            }
            case OTHER -> {
                if (lower.contains("pdf")) yield "PDF Document";
                if (lower.contains("zip")) yield "ZIP Archive";
                yield "File";
            }
        };
    }

    private static String extractLowerPath(String url) {
        HttpUrl parsed = HttpUrl.parse(url);
        if (parsed != null) {
            return parsed.encodedPath().toLowerCase(Locale.ROOT);
        }
        int q = url.indexOf('?');
        String clean = q >= 0 ? url.substring(0, q) : url;
        return clean.toLowerCase(Locale.ROOT);
    }
}
