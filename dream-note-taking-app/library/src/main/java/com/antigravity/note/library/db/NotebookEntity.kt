package com.antigravity.note.library.db

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "notebooks",
    foreignKeys = [
        ForeignKey(
            entity = FolderEntity::class,
            parentColumns = ["folderId"],
            childColumns = ["folderId"],
            onDelete = ForeignKey.SET_NULL
        )
    ],
    indices = [Index(value = ["folderId"])]
)
data class NotebookEntity(
    @PrimaryKey
    val notebookId: String,
    val folderId: String? = null,
    val title: String,
    val pageCount: Int = 1,
    val isStarred: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val modifiedAt: Long = System.currentTimeMillis(),
    val iconKey: String? = null,
    @ColumnInfo(name = "is_dirty", defaultValue = "1")
    val isDirty: Boolean = true
)
