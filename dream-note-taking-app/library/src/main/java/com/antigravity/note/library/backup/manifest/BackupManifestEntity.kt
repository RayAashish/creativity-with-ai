package com.antigravity.note.library.backup.manifest

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

enum class ManifestState {
    DIRTY,
    CLEAN,
    DELETED
}

@Entity(tableName = "backup_manifest")
data class BackupManifestEntity(
    @PrimaryKey
    @ColumnInfo(name = "path")
    val path: String,

    @ColumnInfo(name = "content_hash")
    val contentHash: String,

    @ColumnInfo(name = "size_bytes")
    val sizeBytes: Long,

    @ColumnInfo(name = "last_backed_up_commit_sha")
    val lastBackedUpCommitSha: String? = null,

    @ColumnInfo(name = "state")
    val state: ManifestState = ManifestState.DIRTY,

    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)
