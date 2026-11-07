package org.ledger.pdf.ui.screens.compress

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.ledger.pdf.data.model.CompressLevel
import org.ledger.pdf.data.model.CompressMode
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.repository.ScratchFileManager
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import java.io.File
import java.io.FileOutputStream
import javax.inject.Inject

data class CompressUiState(
    val docInfo: DocumentInfo? = null,
    val selectedLevel: CompressLevel = CompressLevel.WEB,
    val isTargetKbMode: Boolean = false,
    val targetKbText: String = "500",
    val isSimulating: Boolean = false,
    val isExecuting: Boolean = false,
    val originalSize: Long = 0L,
    val estimatedNewSize: Long? = null,
    val progress: Float = 0f,
    val errorMessage: String? = null
) {
    val sizeDeltaText: String?
        get() {
            if (estimatedNewSize == null || originalSize <= 0) return null
            val delta = estimatedNewSize - originalSize
            val percent = (delta.toDouble() / originalSize.toDouble()) * 100
            val prefix = if (delta <= 0) "" else "+"
            return "${DocumentInfo.formatBytes(originalSize)} → ${DocumentInfo.formatBytes(estimatedNewSize)} ($prefix${String.format(java.util.Locale.US, "%.1f", percent)}%)"
        }
}

@HiltViewModel
class CompressViewModel @Inject constructor(
    private val pdfEngine: PdfEngine,
    private val safFileHandler: SafFileHandler,
    private val scratchFileManager: ScratchFileManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(CompressUiState())
    val uiState: StateFlow<CompressUiState> = _uiState.asStateFlow()

    private var currentUri: Uri? = null

    fun load(uri: Uri) {
        currentUri = uri
        viewModelScope.launch {
            val info = safFileHandler.getDocumentInfo(uri)
            val pages = try { pdfEngine.getPageCount(uri) } catch (_: Exception) { 1 }
            _uiState.value = _uiState.value.copy(
                docInfo = info.copy(pageCount = pages),
                originalSize = info.sizeBytes
            )
            calculateEstimate()
        }
    }

    fun selectPreset(level: CompressLevel) {
        _uiState.value = _uiState.value.copy(
            selectedLevel = level,
            isTargetKbMode = false
        )
        calculateEstimate()
    }

    fun setTargetKbMode(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(isTargetKbMode = enabled)
        calculateEstimate()
    }

    fun updateTargetKb(text: String) {
        _uiState.value = _uiState.value.copy(targetKbText = text.filter { it.isDigit() })
        calculateEstimate()
    }

    private fun calculateEstimate() {
        val orig = _uiState.value.originalSize
        if (orig <= 0) return

        val estimated = if (_uiState.value.isTargetKbMode) {
            val targetBytes = (_uiState.value.targetKbText.toLongOrNull() ?: 500L) * 1024L
            targetBytes.coerceAtMost((orig * 0.95).toLong())
        } else {
            when (_uiState.value.selectedLevel) {
                CompressLevel.EMAIL -> (orig * 0.32).toLong()
                CompressLevel.WEB -> (orig * 0.58).toLong()
                CompressLevel.PRINT -> (orig * 0.85).toLong()
            }
        }
        _uiState.value = _uiState.value.copy(estimatedNewSize = estimated)
    }

    fun executeCompress(outputUri: Uri, onComplete: () -> Unit) {
        val uri = currentUri ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isExecuting = true, progress = 0.05f)
            try {
                val mode = if (_uiState.value.isTargetKbMode) {
                    val targetBytes = (_uiState.value.targetKbText.toLongOrNull() ?: 500L) * 1024L
                    CompressMode.TargetSize(targetBytes)
                } else {
                    CompressMode.Preset(_uiState.value.selectedLevel)
                }

                safFileHandler.openOutputStream(outputUri)?.use { out ->
                    val (orig, compressed) = pdfEngine.compress(
                        source = uri,
                        output = out,
                        mode = mode,
                        onProgress = { p ->
                            _uiState.value = _uiState.value.copy(progress = p)
                        }
                    )
                    _uiState.value = _uiState.value.copy(
                        originalSize = orig,
                        estimatedNewSize = compressed,
                        isExecuting = false
                    )
                }
                onComplete()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isExecuting = false,
                    errorMessage = "Compression failed: ${e.localizedMessage}"
                )
            }
        }
    }
}
