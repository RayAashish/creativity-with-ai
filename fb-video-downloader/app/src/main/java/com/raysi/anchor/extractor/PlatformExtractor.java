package com.raysi.anchor.extractor;

import android.net.Uri;

import androidx.annotation.DrawableRes;
import androidx.annotation.NonNull;

import com.raysi.anchor.extractor.model.ExtractionResult;

import java.io.IOException;

import okhttp3.OkHttpClient;

/**
 * Open-Closed plugin contract for extracting public, non-DRM media from a platform URL.
 * To add a new platform, implement this interface and register it in {@link ExtractorRegistry}.
 */
public interface PlatformExtractor {

    @NonNull
    String getPlatformId();

    @NonNull
    String getDisplayName();

    @DrawableRes
    int getBadgeIconRes();

    boolean canHandle(@NonNull Uri canonicalUri);

    @NonNull
    ExtractionResult extract(@NonNull String canonicalUrl, @NonNull OkHttpClient client) throws IOException;
}
