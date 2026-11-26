package com.raysi.anchor.util;

import androidx.annotation.NonNull;

import java.util.Locale;

public final class FormatUtils {

    private FormatUtils() {
    }

    @NonNull
    public static String formatBytes(long bytes) {
        if (bytes < 0) {
            return "Unknown size";
        }
        if (bytes < 1024L) {
            return bytes + " B";
        }
        double kb = bytes / 1024.0;
        if (kb < 1024.0) {
            return String.format(Locale.US, "%.0f KB", kb);
        }
        double mb = kb / 1024.0;
        if (mb < 1024.0) {
            return String.format(Locale.US, "%.1f MB", mb);
        }
        double gb = mb / 1024.0;
        return String.format(Locale.US, "%.2f GB", gb);
    }

    @NonNull
    public static String formatSpeed(long bytesPerSec) {
        if (bytesPerSec <= 0) {
            return "";
        }
        double kb = bytesPerSec / 1024.0;
        if (kb < 1024.0) {
            return String.format(Locale.US, "%.0f KB/s", kb);
        }
        double mb = kb / 1024.0;
        return String.format(Locale.US, "%.1f MB/s", mb);
    }

    @NonNull
    public static String platformDisplayName(@NonNull String platformId) {
        return switch (platformId.toLowerCase(Locale.ROOT)) {
            case "facebook" -> "Facebook";
            case "instagram" -> "Instagram";
            case "x" -> "X";
            case "reddit" -> "Reddit";
            default -> "Web";
        };
    }
}
