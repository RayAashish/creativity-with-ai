package org.ledger.pdf.ui.screens.batch

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
import org.ledger.pdf.data.model.BatchAction
import org.ledger.pdf.data.model.CompressLevel
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.repository.CertificateRepository
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.worker.BatchWorker
import java.util.UUID
import javax.inject.Inject

data class BatchUiState(
    val selectedDocUri: Uri? = null,
    val docInfo: DocumentInfo? = null,
    val pipeline: List<BatchAction> = listOf(
        BatchAction.StripMetadata,
        BatchAction.Compress(CompressLevel.WEB)
    ),
    val isRunning: Boolean = false,
    val currentStep: Int = 0,
    val totalSteps: Int = 0,
    val currentWorkId: UUID? = null,
    val success: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class BatchViewModel @Inject constructor(
    private val safFileHandler: SafFileHandler,
    private val certificateRepository: CertificateRepository,
    private val workManager: WorkManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(BatchUiState())
    val uiState: StateFlow<BatchUiState> = _uiState.asStateFlow()

    fun setDocument(uri: Uri) {
        viewModelScope.launch {
            safFileHandler.takePersistablePermission(uri)
            val info = safFileHandler.getDocumentInfo(uri)
            _uiState.value = _uiState.value.copy(
                selectedDocUri = uri,
                docInfo = info
            )
        }
    }

    fun addAction(action: BatchAction) {
        val current = _uiState.value.pipeline.toMutableList()
        current.add(action)
        _uiState.value = _uiState.value.copy(pipeline = current)
    }

    fun removeAction(index: Int) {
        val current = _uiState.value.pipeline.toMutableList()
        if (index in current.indices) {
            current.removeAt(index)
            _uiState.value = _uiState.value.copy(pipeline = current)
        }
    }

    fun moveAction(from: Int, to: Int) {
        val current = _uiState.value.pipeline.toMutableList()
        if (from in current.indices && to in current.indices) {
            val item = current.removeAt(from)
            current.add(to, item)
            _uiState.value = _uiState.value.copy(pipeline = current)
        }
    }

    fun startPipeline(outputUri: Uri) {
        val inputUri = _uiState.value.selectedDocUri ?: return
        val ops = _uiState.value.pipeline
        if (ops.isEmpty()) return

        val opsSerialized = ops.joinToString(";") { action ->
            when (action) {
                is BatchAction.StripMetadata -> "STRIP"
                is BatchAction.Compress -> "COMPRESS_${action.level.name}"
                is BatchAction.Sign -> "SIGN:${action.certAlias}"
                is BatchAction.RotateAll -> "ROTATE_${action.degrees}"
            }
        }

        val workRequest = OneTimeWorkRequestBuilder<BatchWorker>()
            .setInputData(
                workDataOf(
                    BatchWorker.KEY_INPUT_URI to inputUri.toString(),
                    BatchWorker.KEY_OUTPUT_URI to outputUri.toString(),
                    BatchWorker.KEY_OPERATIONS to opsSerialized
                )
            )
            .build()

        _uiState.value = _uiState.value.copy(
            isRunning = true,
            currentWorkId = workRequest.id,
            totalSteps = ops.size,
            currentStep = 0
        )

        workManager.enqueue(workRequest)

        viewModelScope.launch {
            workManager.getWorkInfoByIdFlow(workRequest.id).collect { info ->
                if (info != null) {
                    when (info.state) {
                        WorkInfo.State.SUCCEEDED -> {
                            _uiState.value = _uiState.value.copy(isRunning = false, success = true)
                        }
                        WorkInfo.State.FAILED -> {
                            _uiState.value = _uiState.value.copy(
                                isRunning = false,
                                errorMessage = "Batch execution pipeline failed."
                            )
                        }
                        WorkInfo.State.CANCELLED -> {
                            _uiState.value = _uiState.value.copy(
                                isRunning = false,
                                errorMessage = "Batch pipeline cancelled."
                            )
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    fun cancelPipeline() {
        val id = _uiState.value.currentWorkId ?: return
        workManager.cancelWorkById(id)
        _uiState.value = _uiState.value.copy(isRunning = false)
    }
}
