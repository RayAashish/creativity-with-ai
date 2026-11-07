package org.ledger.pdf.ui.screens.split

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.model.SplitMode
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import org.ledger.pdf.engine.RangeParser
import javax.inject.Inject

enum class SplitTab {
    BY_RANGE,
    EVERY_N_PAGES,
    AT_BOOKMARKS
}

data class SplitUiState(
    val docInfo: DocumentInfo? = null,
    val selectedTab: SplitTab = SplitTab.BY_RANGE,
    val rangeText: String = "1-2",
    val parsedIndices: List<Int> = emptyList(),
    val everyNText: String = "1",
    val isProcessing: Boolean = false,
    val success: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class SplitViewModel @Inject constructor(
    private val pdfEngine: PdfEngine,
    private val safFileHandler: SafFileHandler
) : ViewModel() {

    private val _uiState = MutableStateFlow(SplitUiState())
    val uiState: StateFlow<SplitUiState> = _uiState.asStateFlow()

    private var currentUri: Uri? = null

    fun load(uri: Uri) {
        currentUri = uri
        viewModelScope.launch {
            val info = safFileHandler.getDocumentInfo(uri)
            val pages = try { pdfEngine.getPageCount(uri) } catch (_: Exception) { 1 }
            val initialRange = if (pages > 1) "1-${pages / 2}" else "1"
            val parsed = RangeParser.parseRange(initialRange, pages)
            _uiState.value = _uiState.value.copy(
                docInfo = info.copy(pageCount = pages),
                rangeText = initialRange,
                parsedIndices = parsed
            )
        }
    }

    fun setTab(tab: SplitTab) {
        _uiState.value = _uiState.value.copy(selectedTab = tab)
    }

    fun updateRangeText(text: String) {
        val total = _uiState.value.docInfo?.pageCount ?: 1
        val parsed = RangeParser.parseRange(text, total)
        _uiState.value = _uiState.value.copy(
            rangeText = text,
            parsedIndices = parsed
        )
    }

    fun updateEveryNText(text: String) {
        _uiState.value = _uiState.value.copy(everyNText = text.filter { it.isDigit() })
    }

    fun executeSplit(outputUri: Uri, onComplete: () -> Unit) {
        val uri = currentUri ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isProcessing = true)
            try {
                val mode: SplitMode = when (_uiState.value.selectedTab) {
                    SplitTab.BY_RANGE -> SplitMode.ByRange(_uiState.value.rangeText)
                    SplitTab.EVERY_N_PAGES -> SplitMode.EveryNPages(_uiState.value.everyNText.toIntOrNull() ?: 1)
                    SplitTab.AT_BOOKMARKS -> SplitMode.AtBookmarks
                }

                pdfEngine.split(uri, mode) { _, _ ->
                    safFileHandler.openOutputStream(outputUri)
                        ?: throw IllegalStateException("Cannot open output stream")
                }
                _uiState.value = _uiState.value.copy(isProcessing = false, success = true)
                onComplete()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isProcessing = false,
                    errorMessage = "Split failed: ${e.localizedMessage}"
                )
            }
        }
    }
}
