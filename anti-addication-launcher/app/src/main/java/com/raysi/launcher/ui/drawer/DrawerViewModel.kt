// app/src/main/java/com/raysi/launcher/ui/drawer/DrawerViewModel.kt
package com.raysi.launcher.ui.drawer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.core.dispatchers.StandardFocusDispatchers
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.PreferencesRepository
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.search.SearchEngine
import com.raysi.launcher.domain.model.AppIconMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface DrawerDialogState {
    data object None : DrawerDialogState
    data class AppOptions(
        val app: AppInfo,
        val isPinned: Boolean,
        val canPin: Boolean,
        val isInDock: Boolean = false,
        val canPinToDock: Boolean = true,
        val isDistracting: Boolean = false
    ) : DrawerDialogState
}

/**
 * DrawerViewModel manages keyboard/A-Z drawer state, sub-millisecond search queries,
 * app pinning (Home & Bottom Dock), distracting gate toggles, and app launching.
 */
class DrawerViewModel(
    private val appInventoryRepository: AppInventoryRepository,
    private val searchEngine: SearchEngine,
    private val settingsRepository: SettingsRepository,
    private val preferencesRepository: PreferencesRepository? = null,
    private val dispatchers: FocusDispatchers = StandardFocusDispatchers()
) : ViewModel() {

    private val _isDrawerOpen = MutableStateFlow(false)
    val isDrawerOpen: StateFlow<Boolean> = _isDrawerOpen.asStateFlow()

    private val _focusSearchOnOpen = MutableStateFlow(false)
    val focusSearchOnOpen: StateFlow<Boolean> = _focusSearchOnOpen.asStateFlow()

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    private val _searchResults = MutableStateFlow<List<AppInfo>>(emptyList())
    val searchResults: StateFlow<List<AppInfo>> = _searchResults.asStateFlow()

    private val _dialogState = MutableStateFlow<DrawerDialogState>(DrawerDialogState.None)
    val dialogState: StateFlow<DrawerDialogState> = _dialogState.asStateFlow()

    private var allAppsCached: List<AppInfo> = emptyList()

    val appIconMode: StateFlow<AppIconMode> =
        (preferencesRepository?.appIconModeFlow ?: flowOf(AppIconMode.REAL))
            .stateIn(viewModelScope, SharingStarted.Lazily, AppIconMode.REAL)

    val autoOpenKeyboardPref: StateFlow<Boolean> =
        (preferencesRepository?.autoOpenDrawerKeyboardFlow ?: flowOf(false))
            .stateIn(viewModelScope, SharingStarted.Lazily, false)

    val pinnedKeys: StateFlow<Set<String>> = settingsRepository.snapshotFlow
        .map { snapshot ->
            snapshot.pinnedApps.map { "${it.componentName}#${it.userSerialNumber}" }.toSet()
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Lazily,
            initialValue = emptySet()
        )

    val canPinMore: StateFlow<Boolean> = settingsRepository.snapshotFlow
        .map { it.pinnedApps.size < 8 }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Lazily,
            initialValue = true
        )

    val dockKeys: StateFlow<Set<String>> =
        (preferencesRepository?.dockAppsFlow ?: flowOf(emptyList()))
            .map { it.toSet() }
            .stateIn(viewModelScope, SharingStarted.Lazily, emptySet())

    val distractingPackages: StateFlow<Set<String>> = settingsRepository.snapshotFlow
        .map { it.distractingPackages }
        .stateIn(viewModelScope, SharingStarted.Lazily, emptySet())

    init {
        // Observe app inventory updates and index off the main thread
        viewModelScope.launch(dispatchers.default) {
            appInventoryRepository.appsFlow.collect { apps ->
                allAppsCached = apps
                searchEngine.updateIndex(apps)

                val currentQ = _query.value.trim()
                val results = if (currentQ.isEmpty()) {
                    apps
                } else {
                    searchEngine.search(currentQ)
                }
                _searchResults.value = results
            }
        }
    }

    fun openDrawer(focusSearch: Boolean = false) {
        _focusSearchOnOpen.value = focusSearch || autoOpenKeyboardPref.value
        _isDrawerOpen.value = true
        _query.value = ""
        _searchResults.value = allAppsCached
    }

    fun closeDrawer() {
        _isDrawerOpen.value = false
        _focusSearchOnOpen.value = false
        _query.value = ""
        _dialogState.value = DrawerDialogState.None
    }

    fun onQueryChange(newQuery: String) {
        _query.value = newQuery
        val trimmed = newQuery.trim()
        val results = if (trimmed.isEmpty()) {
            allAppsCached
        } else {
            searchEngine.search(trimmed)
        }
        _searchResults.value = results
    }

    fun launchTopMatch(): Boolean {
        val top = _searchResults.value.firstOrNull() ?: return false
        return launchApp(top)
    }

    fun launchApp(appInfo: AppInfo): Boolean {
        val launched = appInventoryRepository.launchApp(appInfo)
        closeDrawer()
        return launched
    }

    fun onAppLongClick(appInfo: AppInfo) {
        val key = appInfo.uniqueKey
        val isPinned = pinnedKeys.value.contains(key)
        val canPin = canPinMore.value && !isPinned
        val isInDock = dockKeys.value.contains(key)
        val canPinDock = dockKeys.value.size < 5 && !isInDock
        val isDistracting = distractingPackages.value.contains(appInfo.packageName)
        _dialogState.value = DrawerDialogState.AppOptions(
            app = appInfo,
            isPinned = isPinned,
            canPin = canPin,
            isInDock = isInDock,
            canPinToDock = canPinDock,
            isDistracting = isDistracting
        )
    }

    fun pinApp(appInfo: AppInfo) {
        viewModelScope.launch(dispatchers.mainImmediate) {
            val currentPinned = settingsRepository.snapshot.pinnedApps
            if (currentPinned.size >= 8) {
                dismissDialog()
                return@launch
            }

            val compStr = appInfo.componentName?.flattenToString() ?: "${appInfo.packageName}/${appInfo.className}"
            val exists = currentPinned.any { it.componentName == compStr && it.userSerialNumber == appInfo.userSerialNumber }
            if (exists) {
                dismissDialog()
                return@launch
            }

            val newEntry = PinnedAppEntry(
                componentName = compStr,
                userSerialNumber = appInfo.userSerialNumber,
                customLabel = appInfo.label,
                displayOrder = currentPinned.size
            )
            settingsRepository.updatePinnedApps(currentPinned + newEntry)
            dismissDialog()
        }
    }

    fun unpinApp(appInfo: AppInfo) {
        viewModelScope.launch(dispatchers.mainImmediate) {
            val compStr = appInfo.componentName?.flattenToString() ?: "${appInfo.packageName}/${appInfo.className}"
            val currentPinned = settingsRepository.snapshot.pinnedApps
            val updated = currentPinned.filterNot {
                it.componentName == compStr && it.userSerialNumber == appInfo.userSerialNumber
            }.mapIndexed { index, entry -> entry.copy(displayOrder = index) }
            settingsRepository.updatePinnedApps(updated)
            dismissDialog()
        }
    }

    fun pinToDock(appInfo: AppInfo) {
        val repo = preferencesRepository ?: return
        viewModelScope.launch(dispatchers.mainImmediate) {
            val current = repo.dockAppsFlow.first()
            if (current.size < 5 && !current.contains(appInfo.uniqueKey)) {
                repo.setDockApps(current + appInfo.uniqueKey)
            }
            dismissDialog()
        }
    }

    fun unpinFromDock(appInfo: AppInfo) {
        val repo = preferencesRepository ?: return
        viewModelScope.launch(dispatchers.mainImmediate) {
            val current = repo.dockAppsFlow.first()
            repo.setDockApps(current.filterNot { it == appInfo.uniqueKey })
            dismissDialog()
        }
    }

    fun toggleDistractingPackage(appInfo: AppInfo) {
        viewModelScope.launch(dispatchers.io) {
            val current = settingsRepository.snapshot.distractingPackages
            val updated = if (current.contains(appInfo.packageName)) {
                current - appInfo.packageName
            } else {
                current + appInfo.packageName
            }
            settingsRepository.updateDistractingPackages(updated)
            dismissDialog()
        }
    }

    fun dismissDialog() {
        _dialogState.value = DrawerDialogState.None
    }
}
