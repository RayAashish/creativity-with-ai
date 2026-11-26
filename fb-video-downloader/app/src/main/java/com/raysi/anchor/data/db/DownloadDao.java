package com.raysi.anchor.data.db;

import androidx.annotation.Nullable;
import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import java.util.List;

@Dao
public interface DownloadDao {

    @Query("SELECT * FROM downloads WHERE status != 'COMPLETED' ORDER BY createdAt DESC")
    LiveData<List<DownloadEntity>> observeQueue();

    @Query("SELECT * FROM downloads WHERE status = 'COMPLETED' ORDER BY createdAt DESC")
    LiveData<List<DownloadEntity>> observeCompleted();

    @Query("SELECT * FROM downloads WHERE status = 'COMPLETED' AND platformId = :platformId ORDER BY createdAt DESC")
    LiveData<List<DownloadEntity>> observeCompletedByPlatform(String platformId);

    @Query("SELECT * FROM downloads WHERE status = 'COMPLETED' AND platformId NOT IN ('facebook', 'instagram', 'x', 'reddit') ORDER BY createdAt DESC")
    LiveData<List<DownloadEntity>> observeCompletedOther();

    @Query("SELECT * FROM downloads WHERE id = :id LIMIT 1")
    @Nullable
    DownloadEntity findById(long id);

    @Query("SELECT * FROM downloads WHERE sourceUrl = :sourceUrl ORDER BY createdAt DESC LIMIT 1")
    @Nullable
    DownloadEntity findLatestBySourceUrl(String sourceUrl);

    @Query("SELECT * FROM downloads WHERE status IN ('QUEUED', 'DOWNLOADING') ORDER BY createdAt ASC")
    List<DownloadEntity> findPendingOrActive();

    @Query("SELECT COUNT(*) FROM downloads WHERE status IN ('QUEUED', 'DOWNLOADING')")
    int countPendingOrActive();

    @Insert
    long insert(DownloadEntity entity);

    @Update
    int update(DownloadEntity entity);

    @Query("UPDATE downloads SET downloadedBytes = :downloadedBytes, totalBytes = :totalBytes, segmentsJson = :segmentsJson WHERE id = :id")
    void updateProgress(long id, long downloadedBytes, long totalBytes, @Nullable String segmentsJson);

    @Query("UPDATE downloads SET status = :status, errorMessage = :errorMessage WHERE id = :id")
    void updateStatus(long id, DownloadStatus status, @Nullable String errorMessage);

    @Query("UPDATE downloads SET mediaStoreUri = :mediaStoreUri WHERE id = :id")
    void updateMediaStoreUri(long id, @Nullable String mediaStoreUri);

    @Query("UPDATE downloads SET resolvedMediaUrl = :resolvedMediaUrl, eTag = :eTag, lastModified = :lastModified, totalBytes = :totalBytes WHERE id = :id")
    void updateRefreshDetails(
            long id,
            String resolvedMediaUrl,
            @Nullable String eTag,
            @Nullable String lastModified,
            long totalBytes
    );

    @Query("DELETE FROM downloads WHERE id = :id")
    int deleteById(long id);
}
