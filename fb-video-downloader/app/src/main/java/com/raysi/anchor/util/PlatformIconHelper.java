package com.raysi.anchor.util;

import androidx.annotation.DrawableRes;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.raysi.anchor.R;

import java.util.Locale;

public final class PlatformIconHelper {

    private PlatformIconHelper() {
    }

    @DrawableRes
    public static int iconForPlatform(@Nullable String platformId) {
        if (platformId == null) {
            return R.drawable.ic_platform_generic;
        }
        return switch (platformId.toLowerCase(Locale.ROOT)) {
            case "facebook" -> R.drawable.ic_platform_facebook;
            case "instagram" -> R.drawable.ic_platform_instagram;
            case "x" -> R.drawable.ic_platform_x;
            case "reddit" -> R.drawable.ic_platform_reddit;
            default -> R.drawable.ic_platform_generic;
        };
    }

    @DrawableRes
    public static int iconForMimeType(@Nullable String mimeType) {
        if (mimeType == null) {
            return R.drawable.ic_file;
        }
        String lower = mimeType.toLowerCase(Locale.ROOT);
        if (lower.startsWith("image/")) {
            return R.drawable.ic_image;
        }
        if (lower.startsWith("audio/")) {
            return R.drawable.ic_audio;
        }
        if (lower.startsWith("video/")) {
            return R.drawable.ic_video;
        }
        return R.drawable.ic_file;
    }
}
