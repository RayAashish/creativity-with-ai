package com.antigravity.note.library.db

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Append-only SQLite WAL journal record for zero-latency stroke persistence.
 * Every stroke committed to canvas is appended here off-thread in < 2ms.
 */
@Entity(
    tableName = "stroke_journal",
    indices = [
        Index(value = ["note_id", "page_id", "is_compacted"]),
        Index(value = ["is_compacted"])
    ]
)
data class StrokeJournalEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "note_id")
    val noteId: String,
    @ColumnInfo(name = "page_id")
    val pageId: String,
    @ColumnInfo(name = "stroke_id")
    val strokeId: String,
    @ColumnInfo(name = "stroke_blob")
    val strokeBlob: ByteArray,
    val timestamp: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "is_compacted")
    val isCompacted: Boolean = false
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as StrokeJournalEntity
        return id == other.id && strokeId == other.strokeId
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + strokeId.hashCode()
        return result
    }
}
