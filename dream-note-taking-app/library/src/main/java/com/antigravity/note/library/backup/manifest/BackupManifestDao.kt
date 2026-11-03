package com.antigravity.note.library.backup.manifest

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface BackupManifestDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(entry: BackupManifestEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateAll(entries: List<BackupManifestEntity>)

    @Query("SELECT * FROM backup_manifest WHERE path = :path LIMIT 1")
    suspend fun getByPath(path: String): BackupManifestEntity?

    @Query("SELECT * FROM backup_manifest")
    suspend fun getAll(): List<BackupManifestEntity>

    @Query("SELECT * FROM backup_manifest")
    fun observeAll(): Flow<List<BackupManifestEntity>>

    @Query("SELECT * FROM backup_manifest WHERE state IN ('DIRTY', 'DELETED')")
    suspend fun getDirtyOrDeleted(): List<BackupManifestEntity>

    @Query("SELECT COUNT(*) FROM backup_manifest WHERE state IN ('DIRTY', 'DELETED')")
    fun observeDirtyCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM backup_manifest WHERE state IN ('DIRTY', 'DELETED')")
    suspend fun getDirtyCount(): Int

    @Query("SELECT COALESCE(SUM(size_bytes), 0) FROM backup_manifest WHERE state != 'DELETED'")
    suspend fun getTotalActiveSizeBytes(): Long

    @Query("UPDATE backup_manifest SET state = 'CLEAN', last_backed_up_commit_sha = :commitSha, updated_at = :timestamp WHERE path = :path")
    suspend fun markClean(path: String, commitSha: String, timestamp: Long = System.currentTimeMillis())

    @Query("DELETE FROM backup_manifest WHERE path = :path")
    suspend fun deletePermanently(path: String)

    @Query("DELETE FROM backup_manifest WHERE path IN (:paths)")
    suspend fun deletePermanentlyAll(paths: List<String>)

    @Transaction
    suspend fun markBatchClean(paths: List<String>, commitSha: String, timestamp: Long = System.currentTimeMillis()) {
        for (p in paths) {
            markClean(p, commitSha, timestamp)
        }
    }
}
