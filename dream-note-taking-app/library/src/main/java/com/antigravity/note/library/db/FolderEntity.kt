package com.antigravity.note.library.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "folders")
data class FolderEntity(
    @PrimaryKey
    val folderId: String,
    val parentFolderId: String? = null,
    val name: String,
    val colorHex: String? = null,
    val isPinned: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val modifiedAt: Long = System.currentTimeMillis(),
    val iconKey: String? = null
)
