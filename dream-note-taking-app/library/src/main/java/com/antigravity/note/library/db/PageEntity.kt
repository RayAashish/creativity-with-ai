package com.antigravity.note.library.db

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "pages",
    foreignKeys = [
        ForeignKey(
            entity = NotebookEntity::class,
            parentColumns = ["notebookId"],
            childColumns = ["notebookId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["notebookId"]),
        Index(value = ["problemStatus"]),
        Index(value = ["nextReviewTimestamp"])
    ]
)
data class PageEntity(
    @PrimaryKey
    val pageId: String,
    val notebookId: String,
    val pageIndex: Int,
    val title: String,
    val template: String = "RULED",
    val strokeCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val modifiedAt: Long = System.currentTimeMillis(),

    // DSA Problem Template fields
    val isProblemPage: Boolean = false,
    val sourceUrl: String? = null,
    val difficulty: String? = null, // "Easy", "Medium", "Hard"
    val problemStatus: String = "Unsolved", // "Unsolved", "Solved", "Revisit", "Mastered"
    val timeTakenMinutes: Int = 0,
    val tags: String = "", // Comma-separated: "Array,Two Pointers"
    val approachSummary: String = "",
    val timeComplexity: String = "", // e.g. "O(N)"
    val spaceComplexity: String = "", // e.g. "O(1)"
    val codeSnippet: String = "",
    val codeLanguage: String = "Kotlin",

    // Spaced Repetition fields
    val revisitIntervalDays: Int = 0,
    val nextReviewTimestamp: Long = 0L,

    // Trash & Recycle Bin (30-day retention)
    val isDeleted: Boolean = false,
    val deletedAt: Long? = null
)
