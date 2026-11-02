package com.antigravity.note.library.model

import com.antigravity.note.library.db.FolderEntity
import com.antigravity.note.library.db.NotebookEntity
import com.antigravity.note.library.db.PageEntity

sealed interface LibraryTreeItem {
    val id: String
    val title: String

    data class FolderNode(
        val folder: FolderEntity,
        val subFolders: List<FolderNode> = emptyList(),
        val notebooks: List<NotebookNode> = emptyList(),
        var isExpanded: Boolean = true
    ) : LibraryTreeItem {
        override val id: String get() = folder.folderId
        override val title: String get() = folder.name
    }

    data class NotebookNode(
        val notebook: NotebookEntity,
        val pages: List<PageEntity> = emptyList(),
        var isExpanded: Boolean = false
    ) : LibraryTreeItem {
        override val id: String get() = notebook.notebookId
        override val title: String get() = notebook.title
    }
}
