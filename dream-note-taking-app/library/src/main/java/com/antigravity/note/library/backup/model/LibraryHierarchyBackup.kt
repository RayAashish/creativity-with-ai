package com.antigravity.note.library.backup.model

import kotlinx.serialization.Serializable

@Serializable
data class LibraryHierarchyBackup(
    val version: Int = 1,
    val exportedAt: Long = System.currentTimeMillis(),
    val appVersion: String = "1.0.0",
    val folders: List<FolderBackupItem> = emptyList(),
    val notebooks: List<NotebookBackupItem> = emptyList(),
    val pages: List<PageBackupItem> = emptyList()
)

@Serializable
data class FolderBackupItem(
    val folderId: String,
    val parentFolderId: String? = null,
    val name: String,
    val colorHex: String? = null,
    val isPinned: Boolean = false,
    val createdAt: Long,
    val modifiedAt: Long
)

@Serializable
data class NotebookBackupItem(
    val notebookId: String,
    val folderId: String? = null,
    val title: String,
    val pageCount: Int,
    val isStarred: Boolean = false,
    val createdAt: Long,
    val modifiedAt: Long
)

@Serializable
data class PageBackupItem(
    val pageId: String,
    val notebookId: String,
    val pageIndex: Int,
    val title: String,
    val template: String = "RULED",
    val strokeCount: Int = 0,
    val createdAt: Long,
    val modifiedAt: Long,
    val isProblemPage: Boolean = false,
    val sourceUrl: String? = null,
    val difficulty: String? = null,
    val problemStatus: String = "Unsolved",
    val timeTakenMinutes: Int = 0,
    val tags: String = "",
    val approachSummary: String = "",
    val timeComplexity: String = "",
    val spaceComplexity: String = "",
    val codeSnippet: String = "",
    val codeLanguage: String = "Kotlin",
    val revisitIntervalDays: Int = 0,
    val nextReviewTimestamp: Long = 0L,
    val isDeleted: Boolean = false,
    val deletedAt: Long? = null,
    val problemDescriptionHtml: String? = null,
    val testCasesJson: String? = null,
    val hintsJson: String? = null
)
