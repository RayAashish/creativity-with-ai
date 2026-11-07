package org.ledger.pdf.ui.screens.ocr

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import androidx.work.workDataOf
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import org.ledger.pdf.worker.OcrWorker
import java.util.UUID
import javax.inject.Inject

data class OcrUiState(
    val docInfo: DocumentInfo? = null,
    val selectedLanguage: String = "eng",
    val availableLanguages: List<String> = listOf("eng", "deu", "fra", "spa", "ita"),
    val isRunning: Boolean = false,
    val currentProgress: Int = 0,
    val totalProgress: Int = 0,
    val currentWorkId: UUID? = null,
    val success: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class OcrViewModel @Inject constructor(
    private val pdfEngine: PdfEngine,
    private val safFileHandler: SafFileHandler,
    private val workManager: WorkManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(OcrUiState())
    val uiState: StateFlow<OcrUiState> = _uiState.asStateFlow()

    private var currentUri: Uri? = null

    fun load(uri: Uri) {
        currentUri = uri
        viewModelScope.launch {
            val info = safFileHandler.getDocumentInfo(uri)
            val pages = try { pdfEngine.getPageCount(uri) } catch (_: Exception) { 1 }
            _uiState.value = _uiState.value.copy(
                docInfo = info.copy(pageCount = pages),
                totalProgress = pages
            )
        }
    }

    fun selectLanguage(lang: String) {
        _uiState.value = _uiState.value.copy(selectedLanguage = lang)
    }

    fun startOcr(outputUri: Uri) {
        val inputUri = currentUri ?: return

        val workRequest = OneTimeWorkRequestBuilder<OcrWorker>()
            .setInputData(
                workDataOf(
                    OcrWorker.KEY_INPUT_URI to inputUri.toString(),
                    OcrWorker.KEY_OUTPUT_URI to outputUri.toString(),
                    OcrWorker.KEY_LANGUAGE to _uiState.value.selectedLanguage
                )
            )
            .build()

        _uiState.value = _uiState.value.copy(
            isRunning = true,
            currentWorkId = workRequest.id,
            currentProgress = 0
        )

        workManager.enqueue(workRequest)

        viewModelScope.launch {
            workManager.getWorkInfoByIdFlow(workRequest.id).collect { info ->
                if (info != null) {
                    val current = info.progress.getInt(OcrWorker.KEY_PROGRESS_CURRENT, _uiState.value.currentProgress)
                    val total = info.progress.getInt(OcrWorker.KEY_PROGRESS_TOTAL, _uiState.value.totalProgress)
                    _uiState.value = _uiState.value.copy(
                        currentProgress = current,
                        totalProgress = total
                    )

                    when (info.state) {
                        WorkInfo.State.SUCCEEDED -> {
                            _uiState.value = _uiState.value.copy(isRunning = false, success = true)
                        }
                        WorkInfo.State.FAILED -> {
                            _uiState.value = _uiState.value.copy(
                                isRunning = false,
                                errorMessage = "OCR recognition failed."
                            )
                        }
                        WorkInfo.State.CANCELLED -> {
                            _uiState.value = _uiState.value.copy(
                                isRunning = false,
                                errorMessage = "OCR job cancelled by user."
                            )
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    fun cancelJob() {
        val workId = _uiState.value.currentWorkId ?: return
        workManager.cancelWorkById(workId)
        _uiState.value = _uiState.value.copy(isRunning = false)
    }
}
