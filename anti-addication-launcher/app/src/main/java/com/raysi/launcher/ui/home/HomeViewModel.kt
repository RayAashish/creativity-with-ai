// app/src/main/java/com/raysi/launcher/ui/home/HomeViewModel.kt
package com.raysi.launcher.ui.home

import android.content.ComponentName
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.HudState
import com.raysi.launcher.data.repository.QuarantineRepository
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.repository.UsageRepository
import com.raysi.launcher.data.usage.format.UsageDurationFormatter
import com.raysi.launcher.ui.home.model.PinnedAppUiModel
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
        val pin: PinnedAppUiModel,
        val canMoveUp: Boolean,
        val canMoveDown: Boolean
    ) : HomeDialogState
    data class Rename(
        val pin: PinnedAppUiModel,
        val currentText: String,
        val error: String? = null
    ) : HomeDialogState
}

class HomeViewModel(
    private val appInventoryRepository: AppInventoryRepository,
    private val settingsRepository: SettingsRepository,
    private val usageRepository: UsageRepository,
    private val quarantineRepository: QuarantineRepository? = null,
    coroutineScope: CoroutineScope? = null
) : ViewModel() {

    private val scope = coroutineScope ?: viewModelScope

    private val _dialogState = MutableStateFlow<HomeDialogState>(HomeDialogState.None)
    val dialogState: StateFlow<HomeDialogState> = _dialogState.asStateFlow()

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

    val hudState: StateFlow<HudState> = usageRepository.hudStateFlow

    val pinnedApps: StateFlow<List<PinnedAppUiModel>> = combine(
        settingsRepository.snapshotFlow,
        appInventoryRepository.appsMapFlow,
        usageRepository.hudStateFlow
    ) { snapshot, appsMap, hud ->
        val sortedPins = snapshot.pinnedApps.sortedBy { it.displayOrder }.take(5)
        sortedPins.mapIndexed { index, pin ->
            val app = appsMap["${pin.componentName}#${pin.userSerialNumber}"]
            val userHandle = try {
                app?.userHandle ?: appInventoryRepository.getUserHandle(pin.userSerialNumber)
            } catch (t: Throwable) {
                null
            }

            val cleanLabel = when {
                pin.customLabel.isNotBlank() -> pin.customLabel
                app != null -> app.label
                else -> pin.componentName.substringBefore('/')
            }

            val parts = pin.componentName.split('/')
            val pkg = parts.getOrNull(0) ?: pin.componentName
            val cls = parts.getOrNull(1) ?: ""
            val fullCls = if (cls.startsWith(".")) "$pkg$cls" else cls
            val component = try {
                ComponentName(pkg, fullCls)
            } catch (t: Throwable) {
                null
            }

            val durationFormatted = if (hud.hasPermission) {
                val appDurationMs = hud.perAppDurations[pkg] ?: 0L
                UsageDurationFormatter.formatAppDuration(appDurationMs)
            } else {
                null
            }

            PinnedAppUiModel(
                id = "${pin.componentName}#${pin.userSerialNumber}",
                componentNameStr = pin.componentName,
                componentName = component,
                userHandle = userHandle,
                displayLabel = cleanLabel,
                userSerialNumber = pin.userSerialNumber,
                displayOrder = index,
                isInstalled = app != null,
                isWorkProfile = app?.isWorkProfile ?: false,
                usageDurationFormatted = durationFormatted
            )
        }
    }.stateIn(scope, SharingStarted.Lazily, emptyList())

    fun onResume() {
        refreshDefaultLauncherStatus()
        usageRepository.onScreenResumed()
    }

    fun onPause() {
        usageRepository.onScreenPaused()
    }

    fun refreshDefaultLauncherStatus() {
        _isDefaultLauncher.value = try {
            appInventoryRepository.isDefaultLauncher()
        } catch (t: Throwable) {
            true
        }
    }

    fun getAppInfoForPin(pin: PinnedAppUiModel): AppInfo? {
        return appInventoryRepository.findApp(pin.componentNameStr, pin.userSerialNumber)
    }

    fun onAppClick(pin: PinnedAppUiModel) {
        val component = pin.componentName ?: try {
            val parts = pin.componentNameStr.split('/')
            val pkg = parts.getOrNull(0) ?: pin.componentNameStr
            val cls = parts.getOrNull(1) ?: ""
            ComponentName(pkg, if (cls.startsWith(".")) "$pkg$cls" else cls)
        } catch (t: Throwable) {
            null
        }
        val handle = pin.userHandle
        if (pin.isInstalled && component != null && handle != null) {
            appInventoryRepository.launchApp(component, handle)
        } else {
            // Show options dialog to allow unpinning or renaming uninstalled app
            onPinLongClick(pin)
        }
    }

    fun onPinLongClick(pin: PinnedAppUiModel) {
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

    fun onMoveUp(pin: PinnedAppUiModel) {
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

    fun onMoveDown(pin: PinnedAppUiModel) {
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

    fun onUnpin(pin: PinnedAppUiModel) {
        val list = settingsRepository.snapshot.pinnedApps.filterNot {
            it.componentName == pin.componentNameStr && it.userSerialNumber == pin.userSerialNumber
        }
        saveUpdatedPins(list)
        dismissDialog()
    }

    fun onStartRename(pin: PinnedAppUiModel) {
        _dialogState.value = HomeDialogState.Rename(
            pin = pin,
            currentText = pin.displayLabel,
            error = null
        )
    }

    fun onConfirmRename(pin: PinnedAppUiModel, newName: String) {
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
