package com.mindforge.app.feature.profile

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindforge.app.core.util.ImageCropHelper
import com.mindforge.app.data.local.preferences.UserPreferencesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileEditUiState(
    val displayName: String = "",
    val avatarUri: String? = null,
    val selectedBuiltInAvatar: Int = 0,
    val isInitialized: Boolean = false,
    val isSaved: Boolean = false
)

@HiltViewModel
class ProfileEditViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesRepository: UserPreferencesRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileEditUiState())
    val uiState = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            _uiState.update {
                it.copy(
                    displayName = prefs.displayName,
                    avatarUri = prefs.avatarUri,
                    selectedBuiltInAvatar = prefs.builtInAvatarIndex,
                    isInitialized = true
                )
            }
        }
    }

    fun onNameChange(name: String) {
        _uiState.update { it.copy(displayName = name) }
    }

    fun onPhotoPicked(uri: Uri?) {
        if (uri == null) return
        viewModelScope.launch {
            val saved = ImageCropHelper.processAndSaveAvatar(context, uri)
            _uiState.update { it.copy(avatarUri = saved) }
        }
    }

    fun onRemovePhoto() {
        _uiState.update { it.copy(avatarUri = null) }
    }

    fun onSelectBuiltIn(index: Int) {
        _uiState.update { it.copy(selectedBuiltInAvatar = index, avatarUri = null) }
    }

    fun saveProfile(onSuccess: () -> Unit) {
        viewModelScope.launch {
            val state = _uiState.value
            preferencesRepository.updateProfile(
                name = state.displayName,
                avatarUri = state.avatarUri,
                builtInAvatarIndex = state.selectedBuiltInAvatar
            )
            _uiState.update { it.copy(isSaved = true) }
            onSuccess()
        }
    }
}
