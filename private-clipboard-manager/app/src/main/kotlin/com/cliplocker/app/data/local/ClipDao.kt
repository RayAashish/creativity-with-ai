package com.cliplocker.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ClipDao {

    @Query("SELECT * FROM clips ORDER BY timestamp DESC")
    fun getAllClips(): Flow<List<ClipEntity>>

    @Query("SELECT * FROM clips WHERE is_pinned = 1 ORDER BY timestamp DESC")
    fun getPinnedClips(): Flow<List<ClipEntity>>

    @Query("SELECT * FROM clips ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentClips(limit: Int): Flow<List<ClipEntity>>

    @Query("SELECT * FROM clips WHERE rowid = :id")
    fun getClipById(id: Long): Flow<ClipEntity?>

    @Query("SELECT * FROM clips WHERE rowid = :id")
    suspend fun getClipByIdSync(id: Long): ClipEntity?

    @Query("SELECT * FROM clips ORDER BY timestamp DESC LIMIT 1")
    suspend fun getLatestClip(): ClipEntity?

    @Query("SELECT * FROM clips WHERE contentHash = :hash ORDER BY timestamp DESC LIMIT 1")
    suspend fun findClipByHash(hash: String): ClipEntity?

    @Query(
        """
        SELECT clips.* FROM clips
        JOIN clips_fts ON clips.rowid = clips_fts.docid
        WHERE clips_fts MATCH :query
        ORDER BY clips.timestamp DESC
        """
    )
    fun searchFts(query: String): Flow<List<ClipEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClip(clip: ClipEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClips(clips: List<ClipEntity>): List<Long>

    @Update
    suspend fun updateClip(clip: ClipEntity)

    @Query("DELETE FROM clips WHERE rowid = :id")
    suspend fun deleteClipById(id: Long): Int

    @Query("DELETE FROM clips WHERE rowid IN (:ids)")
    suspend fun deleteClipsByIds(ids: List<Long>): Int

    @Query("DELETE FROM clips WHERE is_pinned = 0")
    suspend fun clearAllNonPinned(): Int

    @Query("UPDATE clips SET is_pinned = :isPinned WHERE rowid = :id")
    suspend fun setPinned(id: Long, isPinned: Boolean)

    @Query("UPDATE clips SET is_secret = :isSecret, secret_expires_at = :expiresAt WHERE rowid = :id")
    suspend fun setSecret(id: Long, isSecret: Boolean, expiresAt: Long?)

    @Query("SELECT * FROM clips WHERE is_secret = 1 AND secret_expires_at IS NOT NULL AND secret_expires_at <= :now")
    suspend fun getExpiredSecrets(now: Long): List<ClipEntity>

    @Query("DELETE FROM clips WHERE is_secret = 1 AND secret_expires_at IS NOT NULL AND secret_expires_at <= :now")
    suspend fun deleteExpiredSecrets(now: Long): Int

    @Query(
        """
        DELETE FROM clips WHERE rowid IN (
            SELECT rowid FROM clips
            WHERE is_pinned = 0
            ORDER BY timestamp ASC
            LIMIT (SELECT CASE WHEN COUNT(*) > :maxCount THEN COUNT(*) - :maxCount ELSE 0 END FROM clips WHERE is_pinned = 0)
        )
        """
    )
    suspend fun pruneOldestNonPinned(maxCount: Int): Int

    @Query("DELETE FROM clips WHERE is_pinned = 0 AND timestamp < :cutoffTimestamp")
    suspend fun pruneOlderThan(cutoffTimestamp: Long): Int

    @Query("SELECT COUNT(*) FROM clips")
    suspend fun getClipsCount(): Int
}
