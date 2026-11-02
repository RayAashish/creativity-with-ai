package com.antigravity.note.document.model

data class NotebookMetadata(
    val notebookId: String,
    val title: String,
    val folderId: String? = null,
    val pageCount: Int = 1,
    val createdAt: Long = System.currentTimeMillis(),
    val modifiedAt: Long = System.currentTimeMillis()
)
