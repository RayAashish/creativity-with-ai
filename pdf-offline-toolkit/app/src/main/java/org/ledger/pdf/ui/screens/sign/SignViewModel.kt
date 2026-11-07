package org.ledger.pdf.ui.screens.sign

import android.graphics.Bitmap
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.ledger.pdf.data.model.DigitalCertificate
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.model.SignatureInfo
import org.ledger.pdf.data.repository.CertificateRepository
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import org.ledger.pdf.security.CertGenerator
import javax.inject.Inject

enum class SignTab {
    VISUAL_STAMP,
    DIGITAL_PADES,
    VERIFY
}

data class SignUiState(
    val docInfo: DocumentInfo? = null,
    val selectedTab: SignTab = SignTab.VISUAL_STAMP,
    val targetPageIndex: Int = 0,
    val stampBitmap: Bitmap? = null,
    val flattenVisual: Boolean = true,
    val certificates: List<DigitalCertificate> = emptyList(),
    val selectedCertAlias: String? = null,
    val signReason: String = "Document Verification & Seal",
    val signLocation: String = "Ledger Offline Toolkit",
    val verifiedSignatures: List<SignatureInfo> = emptyList(),
    val isProcessing: Boolean = false,
    val success: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class SignViewModel @Inject constructor(
    private val pdfEngine: PdfEngine,
    private val safFileHandler: SafFileHandler,
    private val certificateRepository: CertificateRepository,
    private val certGenerator: CertGenerator
) : ViewModel() {

    private val _uiState = MutableStateFlow(SignUiState())
    val uiState: StateFlow<SignUiState> = _uiState.asStateFlow()

    private var currentUri: Uri? = null

    fun load(uri: Uri) {
        currentUri = uri
        viewModelScope.launch {
            val info = safFileHandler.getDocumentInfo(uri)
            val pages = try { pdfEngine.getPageCount(uri) } catch (_: Exception) { 1 }
            certificateRepository.refresh()
            val certs = certificateRepository.certificates.value
            val verified = try { pdfEngine.verifySignatures(uri) } catch (_: Exception) { emptyList() }

            _uiState.value = _uiState.value.copy(
                docInfo = info.copy(pageCount = pages),
                targetPageIndex = (pages - 1).coerceAtLeast(0),
                certificates = certs,
                selectedCertAlias = certs.firstOrNull()?.alias,
                verifiedSignatures = verified
            )
        }
    }

    fun setTab(tab: SignTab) {
        _uiState.value = _uiState.value.copy(selectedTab = tab)
    }

    fun setStampBitmap(bitmap: Bitmap) {
        _uiState.value = _uiState.value.copy(stampBitmap = bitmap)
    }

    fun setTargetPage(index: Int) {
        _uiState.value = _uiState.value.copy(targetPageIndex = index)
    }

    fun toggleFlatten() {
        _uiState.value = _uiState.value.copy(flattenVisual = !_uiState.value.flattenVisual)
    }

    fun selectCert(alias: String) {
        _uiState.value = _uiState.value.copy(selectedCertAlias = alias)
    }

    fun updateReason(reason: String) {
        _uiState.value = _uiState.value.copy(signReason = reason)
    }

    fun updateLocation(location: String) {
        _uiState.value = _uiState.value.copy(signLocation = location)
    }

    fun executeVisualSign(outputUri: Uri, onComplete: () -> Unit) {
        val uri = currentUri ?: return
        val stamp = _uiState.value.stampBitmap ?: return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isProcessing = true)
            try {
                safFileHandler.openOutputStream(outputUri)?.use { out ->
                    // Standard placement: bottom-right margin (x=360, y=50, w=180, h=90)
                    pdfEngine.signWithImageStamp(
                        source = uri,
                        output = out,
                        pageIndex = _uiState.value.targetPageIndex,
                        stampBitmap = stamp,
                        xPt = 350f,
                        yPt = 60f,
                        widthPt = 180f,
                        heightPt = 90f,
                        flatten = _uiState.value.flattenVisual
                    )
                }
                _uiState.value = _uiState.value.copy(isProcessing = false, success = true)
                onComplete()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isProcessing = false,
                    errorMessage = "Visual stamp failed: ${e.localizedMessage}"
                )
            }
        }
    }

    fun executeCryptoSign(outputUri: Uri, onComplete: () -> Unit) {
        val uri = currentUri ?: return
        val alias = _uiState.value.selectedCertAlias ?: return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isProcessing = true)
            try {
                val keyChain = certGenerator.getKeyAndChain(alias)
                    ?: throw IllegalStateException("Could not load private key for certificate $alias")

                safFileHandler.openOutputStream(outputUri)?.use { out ->
                    pdfEngine.signCryptographic(
                        source = uri,
                        output = out,
                        privateKey = keyChain.first,
                        certificateChain = keyChain.second,
                        reason = _uiState.value.signReason,
                        location = _uiState.value.signLocation
                    )
                }
                _uiState.value = _uiState.value.copy(isProcessing = false, success = true)
                onComplete()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isProcessing = false,
                    errorMessage = "Cryptographic signing failed: ${e.localizedMessage}"
                )
            }
        }
    }
}
