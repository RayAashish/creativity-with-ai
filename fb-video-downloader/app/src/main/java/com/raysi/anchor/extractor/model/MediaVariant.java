package com.raysi.anchor.extractor.model;

import androidx.annotation.NonNull;

import java.util.Objects;

/**
 * Represents a single downloadable media variant (e.g. HD MP4, SD MP4, Original Image).
 */
public final class MediaVariant {

    private final String label;
    private final String url;
    private final MediaType mediaType;
    private final String mimeType;
    private final long estimatedBytes;
    private final int width;
    private final int height;
    private final int bitrate;

    public MediaVariant(
            @NonNull String label,
            @NonNull String url,
            @NonNull MediaType mediaType,
            @NonNull String mimeType,
            long estimatedBytes,
            int width,
            int height,
            int bitrate
    ) {
        this.label = Objects.requireNonNull(label);
        this.url = Objects.requireNonNull(url);
        this.mediaType = Objects.requireNonNull(mediaType);
        this.mimeType = Objects.requireNonNull(mimeType);
        this.estimatedBytes = estimatedBytes;
        this.width = width;
        this.height = height;
        this.bitrate = bitrate;
    }

    public MediaVariant withEstimatedBytes(long bytes) {
        return new MediaVariant(label, url, mediaType, mimeType, bytes, width, height, bitrate);
    }

    @NonNull
    public String getLabel() {
        return label;
    }

    @NonNull
    public String getUrl() {
        return url;
    }

    @NonNull
    public MediaType getMediaType() {
        return mediaType;
    }

    @NonNull
    public String getMimeType() {
        return mimeType;
    }

    public long getEstimatedBytes() {
        return estimatedBytes;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public int getBitrate() {
        return bitrate;
    }

    public int getQualityScore() {
        int typeWeight = switch (mediaType) {
            case VIDEO -> 1_000_000;
            case AUDIO -> 500_000;
            case IMAGE -> 100_000;
            case OTHER -> 50_000;
        };
        int dimWeight = Math.max(width, height) * 100;
        int bitrateWeight = bitrate > 0 ? Math.min(bitrate / 1000, 99_999) : 0;
        int labelWeight = label.toUpperCase().contains("HD") || label.toUpperCase().contains("ORIG") ? 50_000 : 0;
        return typeWeight + dimWeight + bitrateWeight + labelWeight;
    }
}
