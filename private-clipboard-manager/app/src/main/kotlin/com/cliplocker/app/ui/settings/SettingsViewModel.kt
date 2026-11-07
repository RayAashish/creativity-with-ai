package com.cliplocker.app.ui.settings

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cliplocker.app.core.model.ThemeMode
import com.cliplocker.app.core.model.UserPreferences
import com.cliplocker.app.data.local.IgnoreAppEntity
import com.cliplocker.app.data.preferences.PreferencesManager
import com.cliplocker.app.data.repository.ClipRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.io.InputStream
import java.io.OutputStream
import javax.inject.Inject

data class SettingsUiState(
    val preferences: UserPreferences = UserPreferences(),
    val ignoredApps: List<IgnoreAppEntity> = emptyList(),
    val exportStatusMessage: String? = null,
    val importStatusMessage: String? = null
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val preferencesManager: PreferencesManager,
    private val repository: ClipRepository
) : ViewModel() {

    val preferences: StateFlow<UserPreferences> = preferencesManager.userPreferences

    val ignoredApps: StateFlow<List<IgnoreAppEntity>> = repository.getAllIgnoredApps()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    private val _statusMessage = MutableStateFlow<String?>(null)
    val statusMessage: StateFlow<String?> = _statusMessage.asStateFlow()

    fun updatePreferences(transform: (UserPreferences) -> UserPreferences) {
        preferencesManager.updatePreferences(transform)
    }

    fun setThemeMode(mode: ThemeMode) {
        preferencesManager.updatePreferences { it.copy(themeMode = mode) }
    }

    fun addIgnoredApp(packageName: String, label: String) {
        if (packageName.isBlank()) return
        viewModelScope.launch {
            repository.addIgnoredApp(packageName.trim(), label.trim().ifBlank { packageName.trim() })
        }
    }

    fun removeIgnoredApp(packageName: String) {
        viewModelScope.launch {
            repository.removeIgnoredApp(packageName)
        }
    }

    fun clearAllNonPinned() {
        viewModelScope.launch {
            val count = repository.clearAllNonPinned()
            _statusMessage.value = "Cleared $count non-pinned clips."
        }
    }

    fun pruneNow() {
        viewModelScope.launch {
            val prefs = preferences.value
            val count = repository.pruneOldClips(prefs.maxClipsRetention, prefs.maxDaysRetention)
            _statusMessage.value = "Pruned $count clips."
        }
    }

    fun exportBackup(context: Context, uri: Uri, passwordChars: CharArray) {
        viewModelScope.launch {
            runCatching {
                val encryptedBytes = repository.exportEncryptedBackup(passwordChars)
                context.contentResolver.openOutputStream(uri)?.use { out ->
                    out.write(encryptedBytes)
                } ?: error("Failed to open file for export")
                _statusMessage.value = "✓ Encrypted backup exported successfully."
            }.onFailure { e ->
                _statusMessage.value = "Export failed: ${e.message}"
            }
        }
    }

    fun importBackup(context: Context, uri: Uri, passwordChars: CharArray) {
        viewModelScope.launch {
            runCatching {
                val inputBytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                    ?: error("Failed to read backup file")
                val merged = repository.importEncryptedBackup(inputBytes, passwordChars)
                _statusMessage.value = "✓ Imported and merged $merged clips."
            }.onFailure { e ->
                _statusMessage.value = "Import failed: ${e.message}"
            }
        }
    }

    fun clearStatusMessage() {
        _statusMessage.value = null
    }
}
