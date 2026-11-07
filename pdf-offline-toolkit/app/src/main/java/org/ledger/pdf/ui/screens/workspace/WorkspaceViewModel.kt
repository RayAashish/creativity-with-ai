package org.ledger.pdf.ui.screens.workspace

import android.graphics.Bitmap
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.model.PageInfo
import org.ledger.pdf.data.repository.DocumentRepository
import org.ledger.pdf.data.repository.ScratchFileManager
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import java.io.FileOutputStream
import javax.inject.Inject

data class WorkspaceUiState(
    val docInfo: DocumentInfo? = null,
    val pages: List<PageInfo> = emptyList(),
    val selectedIndices: Set<Int> = emptySet(),
    val thumbnails: Map<Int, Bitmap> = emptyMap(),
    val isLoading: Boolean = true,
    val progress: Float? = null,
    val progressMessage: String? = null,
    val infoMessage: String? = null,
    val errorMessage: String? = null
)

@HiltViewModel
class WorkspaceViewModel @Inject constructor(
    private val pdfEngine: PdfEngine,
    private val safFileHandler: SafFileHandler,
    private val scratchFileManager: ScratchFileManager,
    private val documentRepository: DocumentRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(WorkspaceUiState())
    val uiState: StateFlow<WorkspaceUiState> = _uiState.asStateFlow()

    private var currentUri: Uri? = null

    fun loadDocument(uri: Uri) {
        currentUri = uri
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                // Ensure permission persisted if possible
                safFileHandler.takePersistablePermission(uri)
                val info = safFileHandler.getDocumentInfo(uri)
                val pages = pdfEngine.getPageList(uri)
                val pageCount = if (pages.isNotEmpty()) pages.size else pdfEngine.getPageCount(uri)
                documentRepository.recordDocumentOpened(uri, pageCount)

                _uiState.value = _uiState.value.copy(
                    docInfo = info.copy(pageCount = pageCount),
                    pages = pages,
                    selectedIndices = emptySet(),
                    isLoading = false,
                    errorMessage = null
                )

                // Load initial thumbnails
                loadThumbnails(uri, pages)
            } catch (e: Exception) {
                android.util.Log.e("WorkspaceViewModel", "Failed to load document: $uri", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Failed to load document: ${e.localizedMessage ?: e.javaClass.simpleName}"
                )
            }
        }
    }

    private fun loadThumbnails(uri: Uri, pages: List<PageInfo>) {
        viewModelScope.launch(Dispatchers.Default) {
            val thumbMap = mutableMapOf<Int, Bitmap>()
            for (p in pages.take(48)) {
                try {
                    val bmp = pdfEngine.renderPage(uri, p.pageIndex, 240, 340)
                    thumbMap[p.pageIndex] = bmp
                    _uiState.value = _uiState.value.copy(thumbnails = thumbMap.toMap())
                } catch (e: Exception) {
                    android.util.Log.w("WorkspaceViewModel", "Failed to render thumbnail for page ${p.pageIndex}", e)
                }
            }
        }
    }

    fun togglePageSelection(index: Int) {
        val current = _uiState.value.selectedIndices.toMutableSet()
        if (current.contains(index)) {
            current.remove(index)
        } else {
            current.add(index)
        }
        _uiState.value = _uiState.value.copy(selectedIndices = current)
    }

    fun selectAll() {
        val all = _uiState.value.pages.map { it.pageIndex }.toSet()
        _uiState.value = _uiState.value.copy(selectedIndices = all)
    }

    fun clearSelection() {
        _uiState.value = _uiState.value.copy(selectedIndices = emptySet())
    }

    fun rotateSelected(deltaDegrees: Int) {
        val uri = currentUri ?: return
        val selected = _uiState.value.selectedIndices
        if (selected.isEmpty()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(progress = 0.5f, progressMessage = "Rotating pages...")
            try {
                val rotations = selected.associateWith { deltaDegrees }
                val scratchFile = scratchFileManager.createScratchFile("rotate")
                FileOutputStream(scratchFile).use { out ->
                    pdfEngine.rotatePages(uri, out, rotations)
                }

                // Overwrite original SAF if writable, or copy to scratch
                safFileHandler.openOutputStream(uri)?.use { origOut ->
                    scratchFile.inputStream().use { it.copyTo(origOut) }
                }
                scratchFile.delete()

                loadDocument(uri)
                _uiState.value = _uiState.value.copy(
                    progress = null,
                    progressMessage = null,
                    infoMessage = "Rotated ${selected.size} page(s) by $deltaDegrees°"
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    progress = null,
                    progressMessage = null,
                    errorMessage = "Rotate failed: ${e.localizedMessage}"
                )
            }
        }
    }

    fun deleteSelected() {
        val uri = currentUri ?: return
        val selected = _uiState.value.selectedIndices
        if (selected.isEmpty()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(progress = 0.5f, progressMessage = "Deleting pages...")
            try {
                val scratchFile = scratchFileManager.createScratchFile("delete")
                FileOutputStream(scratchFile).use { out ->
                    pdfEngine.deletePages(uri, out, selected)
                }

                safFileHandler.openOutputStream(uri)?.use { origOut ->
                    scratchFile.inputStream().use { it.copyTo(origOut) }
                }
                scratchFile.delete()

                loadDocument(uri)
                _uiState.value = _uiState.value.copy(
                    progress = null,
                    progressMessage = null,
                    infoMessage = "Deleted ${selected.size} page(s)"
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    progress = null,
                    progressMessage = null,
                    errorMessage = "Delete failed: ${e.localizedMessage}"
                )
            }
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(infoMessage = null, errorMessage = null)
    }
}
