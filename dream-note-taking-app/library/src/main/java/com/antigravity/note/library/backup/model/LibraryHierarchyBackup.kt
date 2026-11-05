package com.antigravity.note.library.backup.model

import kotlinx.serialization.Serializable

@Serializable
data class ContentBounds(
    val xMin: Float,
    val yMin: Float,
    val xMax: Float,
    val yMax: Float
)

@Serializable
data class PageSummary(
    val pageId: String,
    val title: String,
    val pageIndex: Int,
    val filePath: String,
    val strokeCount: Int = 0,
    val contentBounds: ContentBounds? = null,
    val sizeBytes: Long = 0L,
    val sha256: String = "",
    val updatedAt: Long = 0L,
    val template: String = "RULED",
    val difficulty: String? = null,
    val status: String? = null,
    val tags: List<String> = emptyList(),
    val sourceLink: String? = null
)

@Serializable
data class NotebookSummary(
    val notebookId: String,
    val folderId: String? = null,
    val title: String,
    val pageCount: Int = 0,
    val isStarred: Boolean = false,
    val createdAt: Long = 0L,
    val modifiedAt: Long = 0L,
    val iconKey: String? = null,
    val pages: List<PageSummary> = emptyList()
)

@Serializable
data class FolderSummary(
    val folderId: String,
    val parentFolderId: String? = null,
    val name: String,
    val colorHex: String? = null,
    val isPinned: Boolean = false,
    val createdAt: Long = 0L,
    val modifiedAt: Long = 0L,
    val iconKey: String? = null,
    val order: Int = 0
)

@Serializable
data class LibraryIndex(
    val version: Int = 1,
    val exportedAt: Long = System.currentTimeMillis(),
    val appVersion: String = "1.0.0",
    val folders: List<FolderSummary> = emptyList(),
    val notebooks: List<NotebookSummary> = emptyList()
)

@Serializable
data class SearchIndex(
    val version: Int = 1,
    val updatedAt: Long = System.currentTimeMillis(),
    val pages: Map<String, PageSearchItem> = emptyMap()
)

@Serializable
data class PageSearchItem(
    val title: String,
    val notebookTitle: String,
    val folderName: String? = null,
    val typedText: String = "",
    val ocrText: String = ""
)

// Legacy types preserved for backward compatibility
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
    val modifiedAt: Long,
    val iconKey: String? = null
)

@Serializable
data class NotebookBackupItem(
    val notebookId: String,
    val folderId: String? = null,
    val title: String,
    val pageCount: Int,
    val isStarred: Boolean = false,
    val createdAt: Long,
    val modifiedAt: Long,
    val iconKey: String? = null
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
