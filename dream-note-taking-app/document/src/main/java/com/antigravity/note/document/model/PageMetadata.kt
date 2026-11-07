package com.antigravity.note.document.model

data class PageMetadata(
    val pageId: String,
    val notebookId: String,
    val pageIndex: Int,
    val title: String,
    val template: PaperTemplate = PaperTemplate.GRID,
    val strokeCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val modifiedAt: Long = System.currentTimeMillis()
)
