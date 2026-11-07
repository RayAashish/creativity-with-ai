package org.ledger.pdf.ui.screens.settings

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
import org.ledger.pdf.data.repository.CertificateRepository
import org.ledger.pdf.data.repository.ScratchFileManager
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.ui.theme.ThemeMode
import java.io.InputStream
import javax.inject.Inject

data class SettingsUiState(
    val themeMode: ThemeMode = ThemeMode.SYSTEM,
    val scratchSizeBytes: Long = 0L,
    val certificates: List<DigitalCertificate> = emptyList(),
    val showCreateCertDialog: Boolean = false,
    val showImportCertDialog: Boolean = false,
    val infoMessage: String? = null,
    val errorMessage: String? = null
) {
    val formattedScratchSize: String
        get() = DocumentInfo.formatBytes(scratchSizeBytes)
}

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val scratchFileManager: ScratchFileManager,
    private val certificateRepository: CertificateRepository,
    private val safFileHandler: SafFileHandler
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            certificateRepository.refresh()
            val certs = certificateRepository.certificates.value
            val scratchSize = scratchFileManager.getScratchSizeBytes()
            _uiState.value = _uiState.value.copy(
                certificates = certs,
                scratchSizeBytes = scratchSize
            )
        }
    }

    fun setTheme(mode: ThemeMode) {
        _uiState.value = _uiState.value.copy(themeMode = mode)
    }

    fun wipeScratch() {
        val reclaimed = scratchFileManager.cleanStaleScratch()
        refresh()
        _uiState.value = _uiState.value.copy(
            infoMessage = "Reclaimed ${DocumentInfo.formatBytes(reclaimed)} of scratch memory."
        )
    }

    fun showCreateCert(show: Boolean) {
        _uiState.value = _uiState.value.copy(showCreateCertDialog = show)
    }

    fun showImportCert(show: Boolean) {
        _uiState.value = _uiState.value.copy(showImportCertDialog = show)
    }

    fun createSelfSignedCert(alias: String, commonName: String) {
        viewModelScope.launch {
            try {
                certificateRepository.createSelfSigned(alias, commonName)
                refresh()
                _uiState.value = _uiState.value.copy(
                    showCreateCertDialog = false,
                    infoMessage = "Created certificate: $commonName"
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Cert creation failed: ${e.localizedMessage}"
                )
            }
        }
    }

    fun importPkcs12Cert(uri: Uri, password: String) {
        viewModelScope.launch {
            try {
                safFileHandler.openInputStream(uri)?.use { stream ->
                    certificateRepository.importPkcs12(stream, password)
                }
                refresh()
                _uiState.value = _uiState.value.copy(
                    showImportCertDialog = false,
                    infoMessage = "Successfully imported PKCS#12 certificate."
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Import failed: ${e.localizedMessage}"
                )
            }
        }
    }

    fun deleteCert(alias: String) {
        viewModelScope.launch {
            certificateRepository.deleteCertificate(alias)
            refresh()
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(infoMessage = null, errorMessage = null)
    }
}
