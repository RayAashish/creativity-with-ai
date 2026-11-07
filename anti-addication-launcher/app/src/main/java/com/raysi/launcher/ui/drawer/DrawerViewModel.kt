// app/src/main/java/com/raysi/launcher/ui/drawer/DrawerViewModel.kt
package com.raysi.launcher.ui.drawer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.core.dispatchers.StandardFocusDispatchers
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.search.SearchEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface DrawerDialogState {
    data object None : DrawerDialogState
    data class AppOptions(
        val app: AppInfo,
        val isPinned: Boolean,
        val canPin: Boolean
    ) : DrawerDialogState
}

/**
 * DrawerViewModel manages keyboard-first drawer state, fast in-frame search queries,
 * and app launching.
 */
class DrawerViewModel(
    private val appInventoryRepository: AppInventoryRepository,
    private val searchEngine: SearchEngine,
    private val settingsRepository: SettingsRepository,
    private val dispatchers: FocusDispatchers = StandardFocusDispatchers()
) : ViewModel() {

    private val _isDrawerOpen = MutableStateFlow(false)
    val isDrawerOpen: StateFlow<Boolean> = _isDrawerOpen.asStateFlow()

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    private val _searchResults = MutableStateFlow<List<AppInfo>>(emptyList())
    val searchResults: StateFlow<List<AppInfo>> = _searchResults.asStateFlow()

    private val _dialogState = MutableStateFlow<DrawerDialogState>(DrawerDialogState.None)
    val dialogState: StateFlow<DrawerDialogState> = _dialogState.asStateFlow()

    private var allAppsCached: List<AppInfo> = emptyList()

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
        .map { it.pinnedApps.size < 5 }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Lazily,
            initialValue = true
        )

    init {
        // Observe app inventory updates and index off the main thread
        viewModelScope.launch(dispatchers.default) {
            appInventoryRepository.appsFlow.collect { apps ->
                allAppsCached = apps
                searchEngine.updateIndex(apps)

                // Re-evaluate current search query
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

    fun openDrawer() {
        _isDrawerOpen.value = true
        _query.value = ""
        _searchResults.value = allAppsCached
    }

    fun closeDrawer() {
        _isDrawerOpen.value = false
        _query.value = ""
        _dialogState.value = DrawerDialogState.None
    }

    fun onQueryChange(newQuery: String) {
        _query.value = newQuery
        val trimmed = newQuery.trim()
        val results = if (trimmed.isEmpty()) {
            allAppsCached
        } else {
            // Synchronous sub-millisecond query evaluation
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
        _dialogState.value = DrawerDialogState.AppOptions(
            app = appInfo,
            isPinned = isPinned,
            canPin = canPin
        )
    }

    fun pinApp(appInfo: AppInfo) {
        viewModelScope.launch(dispatchers.mainImmediate) {
            val currentPinned = settingsRepository.snapshot.pinnedApps
            if (currentPinned.size >= 5) {
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

    fun dismissDialog() {
        _dialogState.value = DrawerDialogState.None
    }
}
