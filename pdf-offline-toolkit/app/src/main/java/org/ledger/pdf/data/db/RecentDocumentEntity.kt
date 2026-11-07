package org.ledger.pdf.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "recent_documents")
data class RecentDocumentEntity(
    @PrimaryKey
    val uriString: String,
    val displayName: String,
    val sizeBytes: Long,
    val pageCount: Int,
    val lastAccessed: Long = System.currentTimeMillis(),
    val isPinned: Boolean = false,
    val thumbnailPath: String? = null
)
