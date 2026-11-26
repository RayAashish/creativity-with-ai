package com.raysi.anchor.extractor;

import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.raysi.anchor.extractor.impl.FacebookExtractor;
import com.raysi.anchor.extractor.impl.GenericOpenGraphExtractor;
import com.raysi.anchor.extractor.impl.InstagramExtractor;
import com.raysi.anchor.extractor.impl.RedditExtractor;
import com.raysi.anchor.extractor.impl.XTwitterExtractor;
import com.raysi.anchor.extractor.model.ExtractionResult;
import com.raysi.anchor.extractor.model.MediaVariant;
import com.raysi.anchor.extractor.util.MediaMimeUtil;
import com.raysi.anchor.extractor.util.RedirectResolver;
import com.raysi.anchor.extractor.util.UrlNormalizer;
import com.raysi.anchor.network.NetworkModule;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import okhttp3.OkHttpClient;
import okhttp3.Response;

/**
 * Central Open-Closed plugin registry: resolves shortlinks/redirects to canonical URLs,
 * routes to the first matching {@link PlatformExtractor}, and falls back to {@link GenericOpenGraphExtractor}.
 */
public final class ExtractorRegistry {

    private static volatile ExtractorRegistry defaultInstance;

    private final CopyOnWriteArrayList<PlatformExtractor> plugins = new CopyOnWriteArrayList<>();
    private final OkHttpClient httpClient;

    public ExtractorRegistry(@NonNull OkHttpClient httpClient) {
        this.httpClient = httpClient;
    }

    @NonNull
    public static ExtractorRegistry getDefault() {
        ExtractorRegistry local = defaultInstance;
        if (local == null) {
            synchronized (ExtractorRegistry.class) {
                local = defaultInstance;
                if (local == null) {
                    local = createDefault(NetworkModule.getClient());
                    defaultInstance = local;
                }
            }
        }
        return local;
    }

    @NonNull
    public static ExtractorRegistry createDefault(@NonNull OkHttpClient client) {
        ExtractorRegistry registry = new ExtractorRegistry(client);
        registry.register(new FacebookExtractor());
        registry.register(new InstagramExtractor());
        registry.register(new XTwitterExtractor());
        registry.register(new RedditExtractor());
        registry.register(new GenericOpenGraphExtractor());
        return registry;
    }

    /**
     * Registers a plugin at the end of the list (or inserts before {@link GenericOpenGraphExtractor}
     * if {@link #registerBeforeFallback(PlatformExtractor)} is used).
     */
    public void register(@NonNull PlatformExtractor extractor) {
        plugins.add(extractor);
    }

    /**
     * Registers a new platform plugin immediately ahead of the catch-all {@link GenericOpenGraphExtractor}.
     */
    public void registerBeforeFallback(@NonNull PlatformExtractor extractor) {
        int fallbackIdx = -1;
        for (int i = 0; i < plugins.size(); i++) {
            if (plugins.get(i) instanceof GenericOpenGraphExtractor) {
                fallbackIdx = i;
                break;
            }
        }
        if (fallbackIdx >= 0) {
            plugins.add(fallbackIdx, extractor);
        } else {
            plugins.add(extractor);
        }
    }

    @NonNull
    public List<PlatformExtractor> getRegisteredExtractors() {
        return Collections.unmodifiableList(plugins);
    }

    @Nullable
    public PlatformExtractor route(@NonNull Uri canonicalUri) {
        for (PlatformExtractor plugin : plugins) {
            if (plugin.canHandle(canonicalUri)) {
                return plugin;
            }
        }
        return null;
    }

    /**
     * Quick offline check used by clipboard banner detection before making network calls.
     */
    public boolean isSupportedShareCandidate(@Nullable String rawInput) {
        String extracted = UrlNormalizer.extractFirstUrl(rawInput);
        if (extracted == null) {
            return false;
        }
        String normalized = UrlNormalizer.normalize(extracted);
        if (normalized == null) {
            return false;
        }
        if (MediaMimeUtil.isDirectMediaOrAssetUrl(normalized)) {
            return true;
        }
        Uri uri = Uri.parse(normalized);
        for (PlatformExtractor plugin : plugins) {
            if (!(plugin instanceof GenericOpenGraphExtractor) && plugin.canHandle(uri)) {
                return true;
            }
        }
        return false;
    }

    @NonNull
    public ExtractionResult resolveAndExtract(@Nullable String rawSharedInput) {
        return resolveAndExtract(rawSharedInput, true);
    }

    @NonNull
    public ExtractionResult resolveAndExtract(@Nullable String rawSharedInput, boolean probeContentSizes) {
        String extractedUrl = UrlNormalizer.extractFirstUrl(rawSharedInput);
        if (extractedUrl == null) {
            return ExtractionResult.failure(
                    "unknown",
                    "",
                    ExtractionResult.FailureReason.INVALID_URL,
                    "No valid HTTP or HTTPS link was found."
            );
        }

        String canonicalUrl = RedirectResolver.resolve(extractedUrl, httpClient);
        Uri canonicalUri = Uri.parse(canonicalUrl);
        PlatformExtractor extractor = route(canonicalUri);
        if (extractor == null) {
            return ExtractionResult.failure(
                    "unknown",
                    canonicalUrl,
                    ExtractionResult.FailureReason.UNSUPPORTED_OR_DRM,
                    "This link scheme is not supported."
            );
        }

        try {
            ExtractionResult result = extractor.extract(canonicalUrl, httpClient);
            if (probeContentSizes && result instanceof ExtractionResult.Success success) {
                return enrichEstimatedSizes(success);
            }
            return result;
        } catch (IOException e) {
            return ExtractionResult.failure(
                    extractor.getPlatformId(),
                    canonicalUrl,
                    ExtractionResult.FailureReason.NETWORK_ERROR,
                    "Network error while fetching media details: " + (e.getMessage() != null ? e.getMessage() : "connection failed")
            );
        }
    }

    private ExtractionResult.Success enrichEstimatedSizes(ExtractionResult.Success success) {
        List<MediaVariant> enriched = new ArrayList<>(success.getVariants().size());
        for (MediaVariant variant : success.getVariants()) {
            if (variant.getEstimatedBytes() > 0) {
                enriched.add(variant);
                continue;
            }
            long size = probeSize(variant.getUrl(), success.getCanonicalUrl());
            enriched.add(size > 0 ? variant.withEstimatedBytes(size) : variant);
        }
        return success.withVariants(enriched);
    }

    private long probeSize(String mediaUrl, String referer) {
        try (Response response = httpClient.newCall(NetworkModule.newMediaProbeRequest(mediaUrl, referer)).execute()) {
            if (!response.isSuccessful()) {
                return -1L;
            }
            String len = response.header("Content-Length");
            if (len != null) {
                return Long.parseLong(len.trim());
            }
        } catch (Exception ignored) {
            // Optional size probe failure is harmless
        }
        return -1L;
    }
}
