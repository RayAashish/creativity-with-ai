package org.ledger.pdf.ui.screens.merge

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import javax.inject.Inject

data class MergeItem(
    val uri: Uri,
    val info: DocumentInfo
)

data class MergeUiState(
    val items: List<MergeItem> = emptyList(),
    val isInterleave: Boolean = false,
    val isProcessing: Boolean = false,
    val progress: Float = 0f,
    val success: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class MergeViewModel @Inject constructor(
    private val pdfEngine: PdfEngine,
    private val safFileHandler: SafFileHandler
) : ViewModel() {

    private val _uiState = MutableStateFlow(MergeUiState())
    val uiState: StateFlow<MergeUiState> = _uiState.asStateFlow()

    fun addFiles(uris: List<Uri>) {
        viewModelScope.launch {
            val current = _uiState.value.items.toMutableList()
            for (uri in uris) {
                safFileHandler.takePersistablePermission(uri)
                val info = safFileHandler.getDocumentInfo(uri)
                val pages = try { pdfEngine.getPageCount(uri) } catch (_: Exception) { 0 }
                current.add(MergeItem(uri, info.copy(pageCount = pages)))
            }
            _uiState.value = _uiState.value.copy(items = current)
        }
    }

    fun moveItem(fromIndex: Int, toIndex: Int) {
        val current = _uiState.value.items.toMutableList()
        if (fromIndex in current.indices && toIndex in current.indices) {
            val item = current.removeAt(fromIndex)
            current.add(toIndex, item)
            _uiState.value = _uiState.value.copy(items = current)
        }
    }

    fun removeItem(index: Int) {
        val current = _uiState.value.items.toMutableList()
        if (index in current.indices) {
            current.removeAt(index)
            _uiState.value = _uiState.value.copy(items = current)
        }
    }

    fun toggleInterleave() {
        _uiState.value = _uiState.value.copy(isInterleave = !_uiState.value.isInterleave)
    }

    fun executeMerge(outputUri: Uri, onComplete: () -> Unit) {
        val items = _uiState.value.items
        if (items.size < 2) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isProcessing = true, progress = 0.1f)
            try {
                safFileHandler.openOutputStream(outputUri)?.use { out ->
                    pdfEngine.merge(
                        sources = items.map { it.uri },
                        output = out,
                        interleave = _uiState.value.isInterleave,
                        onProgress = { p ->
                            _uiState.value = _uiState.value.copy(progress = p)
                        }
                    )
                }
                _uiState.value = _uiState.value.copy(isProcessing = false, success = true)
                onComplete()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isProcessing = false,
                    errorMessage = "Merge failed: ${e.localizedMessage}"
                )
            }
        }
    }
}
