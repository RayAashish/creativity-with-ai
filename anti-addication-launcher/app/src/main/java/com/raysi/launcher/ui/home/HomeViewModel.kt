// app/src/main/java/com/raysi/launcher/ui/home/HomeViewModel.kt
package com.raysi.launcher.ui.home

import android.content.ComponentName
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.PreferencesRepository
import com.raysi.launcher.data.repository.QuarantineRepository
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.repository.TelemetryRepository
import com.raysi.launcher.domain.model.DailyProgress
import com.raysi.launcher.domain.model.PinnedAppItem
import com.raysi.launcher.domain.model.TelemetryUiState
import com.raysi.launcher.util.SystemThemingHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface HomeDialogState {
    data object None : HomeDialogState
    data class Options(
        val pin: PinnedAppItem,
        val canMoveUp: Boolean,
        val canMoveDown: Boolean
    ) : HomeDialogState
    data class Rename(
        val pin: PinnedAppItem,
        val currentText: String,
        val error: String? = null
    ) : HomeDialogState
    data class SetLimit(
        val pin: PinnedAppItem,
        val currentLimit: Int
    ) : HomeDialogState
}

class HomeViewModel(
    private val appInventoryRepository: AppInventoryRepository,
    private val settingsRepository: SettingsRepository,
    private val telemetryRepository: TelemetryRepository,
    private val preferencesRepository: PreferencesRepository,
    private val quarantineRepository: QuarantineRepository? = null,
    private val systemThemingHelper: SystemThemingHelper? = null,
    coroutineScope: CoroutineScope? = null
) : ViewModel() {

    private val scope = coroutineScope ?: viewModelScope

    private val _dialogState = MutableStateFlow<HomeDialogState>(HomeDialogState.None)
    val dialogState: StateFlow<HomeDialogState> = _dialogState.asStateFlow()

    val isStealthMode: StateFlow<Boolean> = preferencesRepository.isStealthModeFlow
        .stateIn(scope, SharingStarted.Lazily, true)

    val customStatusBarLine: StateFlow<String> = (systemThemingHelper?.customStatusBarLine ?: flowOf(""))
        .stateIn(scope, SharingStarted.Lazily, "")

    val telemetryUiState: StateFlow<TelemetryUiState> = telemetryRepository.telemetryUiStateFlow
    val dailyProgress: StateFlow<DailyProgress> = telemetryRepository.dailyProgressFlow

    val dailyFocusGoal: StateFlow<String> = preferencesRepository.dailyFocusGoalFlow
        .stateIn(scope, SharingStarted.Lazily, "")

    val scratchpadContent: StateFlow<String> = preferencesRepository.scratchpadContentFlow
        .stateIn(scope, SharingStarted.Lazily, "")

    val quarantinedCount: StateFlow<Int> = (quarantineRepository?.unreadCountFlow ?: flowOf(0))
        .stateIn(scope, SharingStarted.Lazily, 0)

    private val _isDefaultLauncher = MutableStateFlow(
        try {
            appInventoryRepository.isDefaultLauncher()
        } catch (t: Throwable) {
            true
        }
    )
    val isDefaultLauncher: StateFlow<Boolean> = _isDefaultLauncher.asStateFlow()

    val pinnedApps: StateFlow<List<PinnedAppItem>> = combine(
        settingsRepository.snapshotFlow,
        appInventoryRepository.appsMapFlow,
        telemetryRepository.perAppDurationsFlow,
        preferencesRepository.customAppLimitsFlow
    ) { snapshot, appsMap, perAppDurations, customLimits ->
        val sortedPins = snapshot.pinnedApps.sortedBy { it.displayOrder }.take(5)
        sortedPins.map { pin ->
            val app = appsMap["${pin.componentName}#${pin.userSerialNumber}"]
            val parts = pin.componentName.split('/')
            val pkg = parts.getOrNull(0) ?: pin.componentName
            val cls = parts.getOrNull(1) ?: ""
            val fullCls = if (cls.startsWith(".")) "$pkg$cls" else cls

            val cleanLabel = when {
                pin.customLabel.isNotBlank() -> pin.customLabel
                app != null -> app.label
                else -> pkg
            }

            val durationMs = perAppDurations[pkg] ?: 0L
            val durationMinutes = durationMs / 60000L
            val timeLimit = customLimits[pkg] ?: 45
            val isSatiated = durationMinutes >= timeLimit
            val usageFormatted = if (durationMinutes >= 15L) "${durationMinutes}m" else null

            PinnedAppItem(
                id = "${pin.componentName}#${pin.userSerialNumber}",
                packageName = pkg,
                className = fullCls,
                componentNameStr = pin.componentName,
                label = cleanLabel,
                userSerialNumber = pin.userSerialNumber,
                isWorkProfile = app?.isWorkProfile ?: false,
                isInstalled = app != null,
                usageDurationMinutes = durationMinutes,
                usageFormatted = usageFormatted,
                isSatiated = isSatiated,
                timeLimitMinutes = timeLimit
            )
        }
    }.stateIn(scope, SharingStarted.Lazily, emptyList())

    fun onResume() {
        refreshDefaultLauncherStatus()
        telemetryRepository.onScreenResumed()
    }

    fun onPause() {
        telemetryRepository.onScreenPaused()
    }

    fun refreshDefaultLauncherStatus() {
        _isDefaultLauncher.value = try {
            appInventoryRepository.isDefaultLauncher()
        } catch (t: Throwable) {
            true
        }
    }

    fun saveFocusGoal(goal: String) {
        scope.launch {
            preferencesRepository.setDailyFocusGoal(goal)
        }
    }

    fun saveScratchpad(content: String) {
        scope.launch {
            preferencesRepository.saveScratchpadContent(content)
        }
    }

    fun toggleStealthMode() {
        scope.launch {
            preferencesRepository.setStealthMode(!isStealthMode.value)
        }
    }

    fun getAppInfoForPin(pin: PinnedAppItem): AppInfo? {
        return appInventoryRepository.findApp(pin.componentNameStr, pin.userSerialNumber)
    }

    fun onPinLongClick(pin: PinnedAppItem) {
        val currentPins = pinnedApps.value
        val index = currentPins.indexOfFirst { it.id == pin.id }
        if (index == -1) return

        val canMoveUp = index > 0
        val canMoveDown = index < currentPins.lastIndex
        _dialogState.value = HomeDialogState.Options(
            pin = pin,
            canMoveUp = canMoveUp,
            canMoveDown = canMoveDown
        )
    }

    fun onMoveUp(pin: PinnedAppItem) {
        val list = settingsRepository.snapshot.pinnedApps.toMutableList()
        val index = list.indexOfFirst {
            it.componentName == pin.componentNameStr && it.userSerialNumber == pin.userSerialNumber
        }
        if (index > 0) {
            val item = list.removeAt(index)
            list.add(index - 1, item)
            saveUpdatedPins(list)
        }
        dismissDialog()
    }

    fun onMoveDown(pin: PinnedAppItem) {
        val list = settingsRepository.snapshot.pinnedApps.toMutableList()
        val index = list.indexOfFirst {
            it.componentName == pin.componentNameStr && it.userSerialNumber == pin.userSerialNumber
        }
        if (index != -1 && index < list.lastIndex) {
            val item = list.removeAt(index)
            list.add(index + 1, item)
            saveUpdatedPins(list)
        }
        dismissDialog()
    }

    fun onUnpin(pin: PinnedAppItem) {
        val list = settingsRepository.snapshot.pinnedApps.filterNot {
            it.componentName == pin.componentNameStr && it.userSerialNumber == pin.userSerialNumber
        }
        saveUpdatedPins(list)
        dismissDialog()
    }

    fun onStartRename(pin: PinnedAppItem) {
        _dialogState.value = HomeDialogState.Rename(
            pin = pin,
            currentText = pin.label,
            error = null
        )
    }

    fun onConfirmRename(pin: PinnedAppItem, newName: String) {
        val trimmed = newName.trim()
        if (trimmed.isEmpty() || trimmed.length > 24) {
            val current = _dialogState.value
            if (current is HomeDialogState.Rename) {
                _dialogState.value = current.copy(
                    error = "Label must be between 1 and 24 characters"
                )
            }
            return
        }

        val list = settingsRepository.snapshot.pinnedApps.map { currentPin ->
            if (currentPin.componentName == pin.componentNameStr &&
                currentPin.userSerialNumber == pin.userSerialNumber
            ) {
                currentPin.copy(customLabel = trimmed)
            } else {
                currentPin
            }
        }
        saveUpdatedPins(list)
        dismissDialog()
    }

    fun onStartSetLimit(pin: PinnedAppItem) {
        _dialogState.value = HomeDialogState.SetLimit(
            pin = pin,
            currentLimit = pin.timeLimitMinutes
        )
    }

    fun onConfirmSetLimit(pin: PinnedAppItem, limitMinutes: Int) {
        scope.launch {
            preferencesRepository.setCustomAppLimit(pin.packageName, limitMinutes)
        }
        dismissDialog()
    }

    fun dismissDialog() {
        _dialogState.value = HomeDialogState.None
    }

    private fun saveUpdatedPins(updatedList: List<PinnedAppEntry>) {
        scope.launch {
            val reordered = updatedList.take(5).mapIndexed { i, entry ->
                entry.copy(displayOrder = i)
            }
            settingsRepository.updatePinnedApps(reordered)
        }
    }
}
