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
    val isDirty: Boolean = true,
    @ColumnInfo(name = "lastPageIndex", defaultValue = "0")
    val lastPageIndex: Int = 0,
    @ColumnInfo(name = "viewportOffsetX", defaultValue = "0.0")
    val viewportOffsetX: Float = 0f,
    @ColumnInfo(name = "viewportOffsetY", defaultValue = "0.0")
    val viewportOffsetY: Float = 0f,
    @ColumnInfo(name = "viewportZoomScale", defaultValue = "1.0")
    val viewportZoomScale: Float = 1.0f
)
