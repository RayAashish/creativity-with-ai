package com.antigravity.note.document.manager

import androidx.ink.strokes.Stroke
import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PageMetadata
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.document.storage.PageRepository
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class DocumentManager(
    val repository: PageRepository,
    val defaultNotebookId: String = "default_notebook",
    mainDispatcher: CoroutineDispatcher = Dispatchers.Main.immediate
) {
    private val scope = CoroutineScope(SupervisorJob() + mainDispatcher)

    private val _currentPage = MutableStateFlow<DocumentPage?>(null)
    val currentPage: StateFlow<DocumentPage?> = _currentPage.asStateFlow()

    private val _pagesList = MutableStateFlow<List<PageMetadata>>(emptyList())
    val pagesList: StateFlow<List<PageMetadata>> = _pagesList.asStateFlow()

    private val _lastOpenLatencyMs = MutableStateFlow(0L)
    val lastOpenLatencyMs: StateFlow<Long> = _lastOpenLatencyMs.asStateFlow()

    private var activeNotebookId: String = defaultNotebookId

    fun getActiveNotebookId(): String = activeNotebookId

    fun initialize(notebookId: String = defaultNotebookId, onReady: (() -> Unit)? = null) {
        activeNotebookId = notebookId
        scope.launch {
            val pages = repository.listPages(activeNotebookId)
            if (pages.isEmpty()) {
                val newPage = repository.createPage(activeNotebookId, 0, PaperTemplate.RULED)
                repository.savePageAtomic(newPage)
                _pagesList.value = listOf(newPage.metadata)
                _currentPage.value = newPage
            } else {
                _pagesList.value = pages
                val firstMeta = pages.first()
                val (page, latency) = repository.loadPage(activeNotebookId, firstMeta.pageId)
                _lastOpenLatencyMs.value = latency
                _currentPage.value = page
            }
            onReady?.invoke()
        }
    }

    fun onStrokeCommitted(stroke: Stroke, strokeId: String = java.util.UUID.randomUUID().toString()) {
        val page = _currentPage.value ?: return
        val added = page.addStroke(stroke, strokeId)
        if (added) {
            repository.appendStrokeAsync(page.metadata.notebookId, page.metadata.pageId, stroke, strokeId)
        }
    }

    fun onUndoCommitted(revertedStroke: Stroke?) {
        val page = _currentPage.value ?: return
        if (revertedStroke != null) {
            page.removeStrokes(listOf(revertedStroke))
        }
        repository.appendUndoAsync(page.metadata.notebookId, page.metadata.pageId)
    }

    fun onClearCommitted() {
        val page = _currentPage.value ?: return
        page.clearAllStrokes()
        repository.appendClearAsync(page.metadata.notebookId, page.metadata.pageId)
    }

    fun onStrokesReplaced(oldStrokes: List<Stroke>, newStrokes: List<Stroke>) {
        val page = _currentPage.value ?: return
        page.replaceStrokes(oldStrokes, newStrokes)
        autoSaveCurrentPage()
    }

    fun setPaperTemplate(template: PaperTemplate) {
        val page = _currentPage.value ?: return
        val updated = page.copy(
            metadata = page.metadata.copy(
                template = template,
                modifiedAt = System.currentTimeMillis()
            )
        )
        _currentPage.value = updated
        scope.launch(Dispatchers.IO) {
            repository.savePageAtomic(updated)
        }
    }

    fun nextPage(onLoaded: ((DocumentPage) -> Unit)? = null) {
        val current = _currentPage.value ?: return
        val list = _pagesList.value
        val currentIndex = list.indexOfFirst { it.pageId == current.metadata.pageId }
        if (currentIndex < 0) return

        if (currentIndex < list.size - 1) {
            val targetMeta = list[currentIndex + 1]
            switchToPage(targetMeta.pageId, onLoaded)
        } else {
            // At last page, auto-create a new page!
            addNewPage(template = current.metadata.template, onLoaded = onLoaded)
        }
    }

    fun previousPage(onLoaded: ((DocumentPage) -> Unit)? = null) {
        val current = _currentPage.value ?: return
        val list = _pagesList.value
        val currentIndex = list.indexOfFirst { it.pageId == current.metadata.pageId }
        if (currentIndex > 0) {
            val targetMeta = list[currentIndex - 1]
            switchToPage(targetMeta.pageId, onLoaded)
        }
    }

    fun switchToPage(pageId: String, onLoaded: ((DocumentPage) -> Unit)? = null) {
        val current = _currentPage.value
        scope.launch {
            // Save departing page asynchronously
            if (current != null) {
                repository.savePageAtomic(current)
            }
            val pages = repository.listPages(activeNotebookId)
            _pagesList.value = pages
            // Load target page
            val (page, latency) = repository.loadPage(activeNotebookId, pageId)
            _lastOpenLatencyMs.value = latency
            _currentPage.value = page
            onLoaded?.invoke(page)
        }
    }

    fun switchToNotebookAndPage(notebookId: String, pageId: String, onLoaded: ((DocumentPage) -> Unit)? = null) {
        val current = _currentPage.value
        scope.launch {
            if (current != null) {
                repository.savePageAtomic(current)
            }
            activeNotebookId = notebookId
            val pages = repository.listPages(activeNotebookId)
            _pagesList.value = pages
            val (page, latency) = repository.loadPage(activeNotebookId, pageId)
            _lastOpenLatencyMs.value = latency
            _currentPage.value = page
            onLoaded?.invoke(page)
        }
    }

    fun addNewPage(
        template: PaperTemplate = PaperTemplate.RULED,
        title: String? = null,
        onLoaded: ((DocumentPage) -> Unit)? = null
    ) {
        val current = _currentPage.value
        val list = _pagesList.value
        val newIndex = list.size
        val newPage = repository.createPage(activeNotebookId, newIndex, template, title)

        scope.launch {
            if (current != null) {
                repository.savePageAtomic(current)
            }
            repository.savePageAtomic(newPage)
            val updatedList = repository.listPages(activeNotebookId)
            _pagesList.value = updatedList
            _currentPage.value = newPage
            onLoaded?.invoke(newPage)
        }
    }

    fun deleteCurrentPage(onLoaded: ((DocumentPage) -> Unit)? = null) {
        val current = _currentPage.value ?: return
        val list = _pagesList.value
        if (list.size <= 1) {
            current.strokes.clear()
            autoSaveCurrentPage()
            onLoaded?.invoke(current)
            return
        }

        val currentIndex = list.indexOfFirst { it.pageId == current.metadata.pageId }
        val remaining = list.filter { it.pageId != current.metadata.pageId }
        val targetIndex = if (currentIndex > 0) (currentIndex - 1).coerceAtMost(remaining.size - 1) else 0
        val targetMeta = remaining[targetIndex]

        scope.launch {
            repository.deletePage(activeNotebookId, current.metadata.pageId)
            val updatedList = repository.listPages(activeNotebookId)
            _pagesList.value = updatedList
            val (page, latency) = repository.loadPage(activeNotebookId, targetMeta.pageId)
            _lastOpenLatencyMs.value = latency
            _currentPage.value = page
            onLoaded?.invoke(page)
        }
    }

    fun autoSaveCurrentPage() {
        val current = _currentPage.value ?: return
        scope.launch(Dispatchers.IO) {
            repository.savePageAtomic(current)
        }
    }
}
