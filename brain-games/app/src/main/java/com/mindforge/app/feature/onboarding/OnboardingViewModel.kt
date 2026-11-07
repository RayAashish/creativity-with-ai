package com.mindforge.app.feature.onboarding

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
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OnboardingUiState(
    val currentStep: Int = 0,
    val displayName: String = "Mind Athlete",
    val avatarUri: String? = null,
    val selectedBuiltInAvatar: Int = 0,
    val selectedGoal: String = "ALL_ROUNDER",
    val isSaving: Boolean = false
)

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesRepository: UserPreferencesRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(OnboardingUiState())
    val uiState = _uiState.asStateFlow()

    fun onNameChanged(name: String) {
        _uiState.update { it.copy(displayName = name) }
    }

    fun onCustomPhotoPicked(uri: Uri?) {
        if (uri == null) return
        viewModelScope.launch {
            val savedUri = ImageCropHelper.processAndSaveAvatar(context, uri)
            _uiState.update { it.copy(avatarUri = savedUri) }
        }
    }

    fun onBuiltInAvatarSelected(index: Int) {
        _uiState.update { it.copy(selectedBuiltInAvatar = index, avatarUri = null) }
    }

    fun onGoalSelected(goal: String) {
        _uiState.update { it.copy(selectedGoal = goal) }
    }

    fun nextStep() {
        _uiState.update { it.copy(currentStep = (it.currentStep + 1).coerceAtMost(2)) }
    }

    fun previousStep() {
        _uiState.update { it.copy(currentStep = (it.currentStep - 1).coerceAtLeast(0)) }
    }

    fun completeOnboarding(onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSaving = true) }
            val state = _uiState.value
            preferencesRepository.updateProfile(
                name = state.displayName,
                avatarUri = state.avatarUri,
                builtInAvatarIndex = state.selectedBuiltInAvatar
            )
            preferencesRepository.setPrimaryGoal(state.selectedGoal)
            preferencesRepository.setOnboardingCompleted(true)
            onSuccess()
        }
    }
}
