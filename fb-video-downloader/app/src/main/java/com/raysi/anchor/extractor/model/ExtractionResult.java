package com.raysi.anchor.extractor.model;

import androidx.annotation.DrawableRes;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Result of resolving and extracting public media metadata from a URL.
 */
public sealed interface ExtractionResult permits ExtractionResult.Success, ExtractionResult.Failure {

    enum FailureReason {
        INVALID_URL,
        PRIVATE_OR_LOGIN_REQUIRED,
        UNSUPPORTED_OR_DRM,
        NO_MEDIA_FOUND,
        NETWORK_ERROR
    }

    static Success success(
            @NonNull String platformId,
            @NonNull String platformDisplayName,
            @DrawableRes int badgeIconRes,
            @NonNull String canonicalUrl,
            @NonNull String title,
            @Nullable String author,
            @Nullable String thumbnailUrl,
            @NonNull List<MediaVariant> variants
    ) {
        return new Success(
                platformId,
                platformDisplayName,
                badgeIconRes,
                canonicalUrl,
                title,
                author,
                thumbnailUrl,
                variants
        );
    }

    static Failure failure(
            @NonNull String platformId,
            @NonNull String canonicalUrl,
            @NonNull FailureReason reason,
            @NonNull String message
    ) {
        return new Failure(platformId, canonicalUrl, reason, message);
    }

    final class Success implements ExtractionResult {
        private final String platformId;
        private final String platformDisplayName;
        @DrawableRes
        private final int badgeIconRes;
        private final String canonicalUrl;
        private final String title;
        @Nullable
        private final String author;
        @Nullable
        private final String thumbnailUrl;
        private final List<MediaVariant> variants;

        public Success(
                @NonNull String platformId,
                @NonNull String platformDisplayName,
                @DrawableRes int badgeIconRes,
                @NonNull String canonicalUrl,
                @NonNull String title,
                @Nullable String author,
                @Nullable String thumbnailUrl,
                @NonNull List<MediaVariant> variants
        ) {
            this.platformId = Objects.requireNonNull(platformId);
            this.platformDisplayName = Objects.requireNonNull(platformDisplayName);
            this.badgeIconRes = badgeIconRes;
            this.canonicalUrl = Objects.requireNonNull(canonicalUrl);
            this.title = Objects.requireNonNull(title);
            this.author = author;
            this.thumbnailUrl = thumbnailUrl;
            this.variants = Collections.unmodifiableList(List.copyOf(variants));
        }

        @NonNull
        public String getPlatformId() {
            return platformId;
        }

        @NonNull
        public String getPlatformDisplayName() {
            return platformDisplayName;
        }

        @DrawableRes
        public int getBadgeIconRes() {
            return badgeIconRes;
        }

        @NonNull
        public String getCanonicalUrl() {
            return canonicalUrl;
        }

        @NonNull
        public String getTitle() {
            return title;
        }

        @Nullable
        public String getAuthor() {
            return author;
        }

        @Nullable
        public String getThumbnailUrl() {
            return thumbnailUrl;
        }

        @NonNull
        public List<MediaVariant> getVariants() {
            return variants;
        }

        @NonNull
        public MediaVariant getBestVariant() {
            return variants.get(0);
        }

        public Success withVariants(@NonNull List<MediaVariant> updated) {
            return new Success(
                    platformId,
                    platformDisplayName,
                    badgeIconRes,
                    canonicalUrl,
                    title,
                    author,
                    thumbnailUrl,
                    updated
            );
        }
    }

    final class Failure implements ExtractionResult {
        private final String platformId;
        private final String canonicalUrl;
        private final FailureReason reason;
        private final String message;

        public Failure(
                @NonNull String platformId,
                @NonNull String canonicalUrl,
                @NonNull FailureReason reason,
                @NonNull String message
        ) {
            this.platformId = Objects.requireNonNull(platformId);
            this.canonicalUrl = Objects.requireNonNull(canonicalUrl);
            this.reason = Objects.requireNonNull(reason);
            this.message = Objects.requireNonNull(message);
        }

        @NonNull
        public String getPlatformId() {
            return platformId;
        }

        @NonNull
        public String getCanonicalUrl() {
            return canonicalUrl;
        }

        @NonNull
        public FailureReason getReason() {
            return reason;
        }

        @NonNull
        public String getMessage() {
            return message;
        }
    }
}
