// app/src/main/java/com/raysi/launcher/ui/home/HomeViewModel.kt
package com.raysi.launcher.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.PreferencesRepository
import com.raysi.launcher.data.repository.QuarantineRepository
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.repository.TelemetryRepository
import com.raysi.launcher.domain.model.AppIconMode
import com.raysi.launcher.domain.model.DailyProgress
import com.raysi.launcher.domain.model.PinnedAppItem
import com.raysi.launcher.domain.model.StatusBarMode
import com.raysi.launcher.domain.model.SwipeDownAction
import com.raysi.launcher.domain.model.SystemStatusState
import com.raysi.launcher.domain.model.TelemetryUiState
import com.raysi.launcher.util.SystemThemingHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
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
    data class DockOptions(
        val dockItem: PinnedAppItem
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

    val statusBarMode: StateFlow<StatusBarMode> = preferencesRepository.statusBarModeFlow
        .stateIn(scope, SharingStarted.Lazily, StatusBarMode.CUSTOM)

    val isStealthMode: StateFlow<Boolean> = preferencesRepository.isStealthModeFlow
        .stateIn(scope, SharingStarted.Lazily, false)

    val appIconMode: StateFlow<AppIconMode> = preferencesRepository.appIconModeFlow
        .stateIn(scope, SharingStarted.Lazily, AppIconMode.REAL)

    val swipeDownAction: StateFlow<SwipeDownAction> = preferencesRepository.swipeDownActionFlow
        .stateIn(scope, SharingStarted.Lazily, SwipeDownAction.NOTIFICATION_SHADE)

    val systemStatusState: StateFlow<SystemStatusState> =
        (systemThemingHelper?.systemStatusState ?: flowOf(SystemStatusState()))
            .stateIn(scope, SharingStarted.Lazily, SystemStatusState())

    val customStatusBarLine: StateFlow<String> =
        (systemThemingHelper?.customStatusBarLine ?: flowOf(""))
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
        val sortedPins = snapshot.pinnedApps.sortedBy { it.displayOrder }.take(8)
        sortedPins.map { pin ->
            buildPinnedItem(pin.componentName, pin.userSerialNumber, pin.customLabel, appsMap, perAppDurations, customLimits)
        }
    }.stateIn(scope, SharingStarted.Lazily, emptyList())

    val dockApps: StateFlow<List<PinnedAppItem>> = combine(
        preferencesRepository.dockAppsFlow,
        appInventoryRepository.appsMapFlow,
        telemetryRepository.perAppDurationsFlow,
        preferencesRepository.customAppLimitsFlow
    ) { dockKeys, appsMap, perAppDurations, customLimits ->
        dockKeys.take(5).mapNotNull { uniqueKey ->
            val app = appsMap[uniqueKey] ?: return@mapNotNull null
            val compStr = app.componentName?.flattenToString() ?: "${app.packageName}/${app.className}"
            buildPinnedItem(compStr, app.userSerialNumber, app.label, appsMap, perAppDurations, customLimits)
        }
    }.stateIn(scope, SharingStarted.Lazily, emptyList())

    init {
        seedDefaultsOnFirstRun()
    }

    private fun seedDefaultsOnFirstRun() {
        scope.launch {
            val apps = appInventoryRepository.appsFlow.first { it.isNotEmpty() }
            val alreadySeeded = preferencesRepository.hasSeededDefaultsFlow.first()
            if (alreadySeeded) return@launch

            // Seed Bottom Favorites Dock if empty (Phone, Messages, Browser, Camera)
            val existingDock = preferencesRepository.dockAppsFlow.first()
            if (existingDock.isEmpty()) {
                val seededDock = pickMatchingApps(
                    apps = apps,
                    queries = listOf(
                        listOf("dialer", "phone", "contacts"),
                        listOf("messaging", "messages", "mms", "sms"),
                        listOf("chrome", "browser", "firefox", "brave", "opera"),
                        listOf("camera")
                    ),
                    limit = 4
                )
                if (seededDock.isNotEmpty()) {
                    preferencesRepository.setDockApps(seededDock.map { it.uniqueKey })
                }
            }

            // Seed Pinned Essentials if empty (useful daily utilities so screen is never dead void)
            val currentPins = settingsRepository.snapshotFlow.first().pinnedApps
            if (currentPins.isEmpty()) {
                val seededEssentials = pickMatchingApps(
                    apps = apps,
                    queries = listOf(
                        listOf("calendar"),
                        listOf("notes", "keep", "memo"),
                        listOf("clock", "alarm"),
                        listOf("calculator"),
                        listOf("files", "gallery", "photos")
                    ),
                    limit = 5
                )
                if (seededEssentials.isNotEmpty()) {
                    val entries = seededEssentials.mapIndexed { idx, app ->
                        val compStr = app.componentName?.flattenToString()
                            ?: "${app.packageName}/${app.className}"
                        PinnedAppEntry(
                            componentName = compStr,
                            userSerialNumber = app.userSerialNumber,
                            customLabel = app.label,
                            displayOrder = idx
                        )
                    }
                    settingsRepository.updatePinnedApps(entries)
                }
            }

            preferencesRepository.markDefaultsSeeded()
        }
    }

    private fun pickMatchingApps(
        apps: List<AppInfo>,
        queries: List<List<String>>,
        limit: Int
    ): List<AppInfo> {
        val chosen = mutableListOf<AppInfo>()
        val usedPackages = mutableSetOf<String>()
        for (keywords in queries) {
            if (chosen.size >= limit) break
            // Iterate keywords in priority order (e.g. "dialer" before "phone" before "contacts")
            var match: AppInfo? = null
            for (kw in keywords) {
                match = apps.firstOrNull { app ->
                    !usedPackages.contains(app.packageName) &&
                        (app.packageName.contains(kw, ignoreCase = true) ||
                            app.label.equals(kw, ignoreCase = true) ||
                            app.label.contains(kw, ignoreCase = true))
                }
                if (match != null) break
            }
            if (match != null) {
                chosen.add(match)
                usedPackages.add(match.packageName)
            }
        }
        return chosen
    }

    private fun buildPinnedItem(
        componentName: String,
        userSerialNumber: Long,
        customLabel: String,
        appsMap: Map<String, AppInfo>,
        perAppDurations: Map<String, Long>,
        customLimits: Map<String, Int>
    ): PinnedAppItem {
        val app = appsMap["$componentName#$userSerialNumber"]
        val parts = componentName.split('/')
        val pkg = parts.getOrNull(0) ?: componentName
        val cls = parts.getOrNull(1) ?: ""
        val fullCls = if (cls.startsWith(".")) "$pkg$cls" else cls

        val cleanLabel = when {
            customLabel.isNotBlank() -> customLabel
            app != null -> app.label
            else -> pkg.substringAfterLast('.')
        }

        val durationMs = perAppDurations[pkg] ?: 0L
        val durationMinutes = durationMs / 60000L
        val timeLimit = customLimits[pkg] ?: 45
        val isSatiated = durationMinutes >= timeLimit
        val usageFormatted = if (durationMinutes >= 15L) "${durationMinutes}m" else null

        return PinnedAppItem(
            id = "$componentName#$userSerialNumber",
            packageName = pkg,
            className = fullCls,
            componentNameStr = componentName,
            label = cleanLabel,
            userSerialNumber = userSerialNumber,
            isWorkProfile = app?.isWorkProfile ?: false,
            isInstalled = app != null,
            usageDurationMinutes = durationMinutes,
            usageFormatted = usageFormatted,
            isSatiated = isSatiated,
            timeLimitMinutes = timeLimit
        )
    }

    fun onResume() {
        refreshDefaultLauncherStatus()
        telemetryRepository.onScreenResumed()
        systemThemingHelper?.refreshSystemStatus()
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

    fun setStatusBarMode(mode: StatusBarMode) {
        scope.launch {
            preferencesRepository.setStatusBarMode(mode)
        }
    }

    fun setAppIconMode(mode: AppIconMode) {
        scope.launch {
            preferencesRepository.setAppIconMode(mode)
        }
    }

    fun toggleStealthMode() {
        scope.launch {
            val next = if (statusBarMode.value == StatusBarMode.STEALTH) {
                StatusBarMode.CUSTOM
            } else {
                StatusBarMode.STEALTH
            }
            preferencesRepository.setStatusBarMode(next)
        }
    }

    fun getAppInfoForPin(pin: PinnedAppItem): AppInfo? {
        return appInventoryRepository.findApp(pin.componentNameStr, pin.userSerialNumber)
            ?: appInventoryRepository.appsFlow.value.firstOrNull { it.packageName == pin.packageName }
    }

    fun onDockLongClick(item: PinnedAppItem) {
        _dialogState.value = HomeDialogState.DockOptions(item)
    }

    fun removeFromDock(item: PinnedAppItem) {
        scope.launch {
            val current = preferencesRepository.dockAppsFlow.first()
            preferencesRepository.setDockApps(current.filterNot { it == item.id })
        }
        dismissDialog()
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
            val reordered = updatedList.take(8).mapIndexed { i, entry ->
                entry.copy(displayOrder = i)
            }
            settingsRepository.updatePinnedApps(reordered)
        }
    }
}
