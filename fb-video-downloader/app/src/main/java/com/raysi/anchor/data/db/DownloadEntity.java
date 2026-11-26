package com.raysi.anchor.data.db;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.room.Entity;
import androidx.room.Index;
import androidx.room.PrimaryKey;

@Entity(
        tableName = "downloads",
        indices = {
                @Index(value = {"sourceUrl"}),
                @Index(value = {"status", "createdAt"})
        }
)
public class DownloadEntity {

    @PrimaryKey(autoGenerate = true)
    public long id;

    @NonNull
    public String sourceUrl = "";

    @NonNull
    public String resolvedMediaUrl = "";

    @NonNull
    public String platformId = "generic";

    @NonNull
    public String title = "";

    @NonNull
    public String qualityLabel = "";

    @NonNull
    public String mimeType = "video/mp4";

    @Nullable
    public String thumbnailUrl;

    @Nullable
    public String mediaStoreUri;

    public long downloadedBytes;

    public long totalBytes = -1L;

    @Nullable
    public String eTag;

    @Nullable
    public String lastModified;

    @Nullable
    public String segmentsJson;

    @Nullable
    public String errorMessage;

    @NonNull
    public DownloadStatus status = DownloadStatus.QUEUED;

    public long createdAt;

    public DownloadEntity() {
    }
}
