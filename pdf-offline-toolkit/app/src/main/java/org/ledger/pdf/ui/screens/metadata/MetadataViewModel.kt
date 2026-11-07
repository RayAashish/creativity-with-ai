package org.ledger.pdf.ui.screens.metadata

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.model.MetadataDiff
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import javax.inject.Inject

data class MetadataUiState(
    val docInfo: DocumentInfo? = null,
    val diff: MetadataDiff? = null,
    val stripBookmarks: Boolean = true,
    val isInspecting: Boolean = true,
    val isProcessing: Boolean = false,
    val success: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class MetadataViewModel @Inject constructor(
    private val pdfEngine: PdfEngine,
    private val safFileHandler: SafFileHandler
) : ViewModel() {

    private val _uiState = MutableStateFlow(MetadataUiState())
    val uiState: StateFlow<MetadataUiState> = _uiState.asStateFlow()

    private var currentUri: Uri? = null

    fun load(uri: Uri) {
        currentUri = uri
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isInspecting = true)
            try {
                val info = safFileHandler.getDocumentInfo(uri)
                val diff = pdfEngine.inspectMetadata(uri)
                _uiState.value = _uiState.value.copy(
                    docInfo = info,
                    diff = diff,
                    isInspecting = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isInspecting = false,
                    errorMessage = "Inspection failed: ${e.localizedMessage}"
                )
            }
        }
    }

    fun toggleStripBookmarks() {
        _uiState.value = _uiState.value.copy(stripBookmarks = !_uiState.value.stripBookmarks)
    }

    fun executeStrip(outputUri: Uri, onComplete: () -> Unit) {
        val uri = currentUri ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isProcessing = true)
            try {
                safFileHandler.openOutputStream(outputUri)?.use { out ->
                    pdfEngine.stripMetadata(
                        source = uri,
                        output = out,
                        stripBookmarks = _uiState.value.stripBookmarks
                    )
                }
                _uiState.value = _uiState.value.copy(isProcessing = false, success = true)
                onComplete()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isProcessing = false,
                    errorMessage = "Strip failed: ${e.localizedMessage}"
                )
            }
        }
    }
}
