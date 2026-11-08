// app/src/main/java/com/raysi/launcher/ui/settings/SettingsViewModel.kt
package com.raysi.launcher.ui.settings

import android.content.Context
import android.content.pm.ApplicationInfo
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.LauncherSettingsSnapshot
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.PreferencesRepository
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.repository.UsageRepository
import com.raysi.launcher.service.AccessibilityUtils
import com.raysi.launcher.service.notification.DigestScheduler
import com.raysi.launcher.service.notification.NotificationUtils
import com.raysi.launcher.util.SystemThemingHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class AppPickerType {
    DISTRACTING,
    NEVER_BLOCK,
    ALWAYS_ALLOW
}

data class SettingsPermissionsState(
    val isDefaultLauncher: Boolean = false,
    val isUsageGranted: Boolean = false,
    val isAccessibilityEnabled: Boolean = false,
    val isNotificationListenerEnabled: Boolean = false,
    val isSecureSettingsGranted: Boolean = false
)

class SettingsViewModel(
    private val settingsRepository: SettingsRepository,
    private val appInventoryRepository: AppInventoryRepository,
    private val usageRepository: UsageRepository,
    private val preferencesRepository: PreferencesRepository,
    private val dispatchers: FocusDispatchers
) : ViewModel() {

    val snapshot: StateFlow<LauncherSettingsSnapshot> = settingsRepository.snapshotFlow

    val allApps: StateFlow<List<AppInfo>> = appInventoryRepository.appsFlow

    val isStealthMode: StateFlow<Boolean> = preferencesRepository.isStealthModeFlow
        .stateIn(viewModelScope, SharingStarted.Lazily, true)

    val isSystemGrayscale: StateFlow<Boolean> = preferencesRepository.isSystemGrayscaleEnabledFlow
        .stateIn(viewModelScope, SharingStarted.Lazily, false)

    private val _permissionsState = MutableStateFlow(SettingsPermissionsState())
    val permissionsState: StateFlow<SettingsPermissionsState> = _permissionsState.asStateFlow()

    private val _activePicker = MutableStateFlow<AppPickerType?>(null)
    val activePicker: StateFlow<AppPickerType?> = _activePicker.asStateFlow()

    private val _pickerSearchQuery = MutableStateFlow("")
    val pickerSearchQuery: StateFlow<String> = _pickerSearchQuery.asStateFlow()

    private val _pickerCategoryFilter = MutableStateFlow<Int?>(null)
    val pickerCategoryFilter: StateFlow<Int?> = _pickerCategoryFilter.asStateFlow()

    val filteredPickerApps: StateFlow<List<AppInfo>> = combine(
        allApps,
        _pickerSearchQuery,
        _pickerCategoryFilter
    ) { apps, query, categoryFilter ->
        apps.filter { app ->
            val matchesCategory = (categoryFilter == null) || (app.category == categoryFilter)
            val matchesQuery = query.isBlank() ||
                    app.label.contains(query, ignoreCase = true) ||
                    app.packageName.contains(query, ignoreCase = true)
            matchesCategory && matchesQuery
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Lazily,
        initialValue = emptyList()
    )

    fun refreshPermissions(context: Context) {
        val isDefault = try {
            appInventoryRepository.isDefaultLauncher()
        } catch (e: Exception) {
            false
        }
        val isUsage = usageRepository.hasUsagePermission()
        val isA11y = AccessibilityUtils.isAccessibilityServiceEnabled(context)
        val isNotif = NotificationUtils.isNotificationListenerEnabled(context)
        val isSecure = SystemThemingHelper.isSecureSettingsGranted(context)

        _permissionsState.value = SettingsPermissionsState(
            isDefaultLauncher = isDefault,
            isUsageGranted = isUsage,
            isAccessibilityEnabled = isA11y,
            isNotificationListenerEnabled = isNotif,
            isSecureSettingsGranted = isSecure
        )
    }

    fun setStealthMode(enabled: Boolean) {
        viewModelScope.launch(dispatchers.io) {
            preferencesRepository.setStealthMode(enabled)
        }
    }

    fun setSystemGrayscale(context: Context, enabled: Boolean) {
        viewModelScope.launch(dispatchers.io) {
            preferencesRepository.setSystemGrayscaleEnabled(enabled)
            SystemThemingHelper.setHardwareGrayscale(context, enabled)
        }
    }

    fun setGateDelay(seconds: Int) {
        viewModelScope.launch(dispatchers.io) {
            settingsRepository.updateGateDelay(seconds)
        }
    }

    fun setSessionDuration(minutes: Int) {
        viewModelScope.launch(dispatchers.io) {
            settingsRepository.updateSessionDuration(minutes)
        }
    }

    fun setMaxExtensions(count: Int) {
        viewModelScope.launch(dispatchers.io) {
            settingsRepository.updateMaxExtensions(count)
        }
    }

    fun setScreenTimeIncludesLauncher(include: Boolean) {
        viewModelScope.launch(dispatchers.io) {
            settingsRepository.setScreenTimeIncludesLauncher(include)
        }
    }

    fun toggleDigestHour(context: Context, hour: Int) {
        viewModelScope.launch(dispatchers.io) {
            val current = snapshot.value.digestHours
            val updated = if (current.contains(hour)) {
                if (current.size > 1) current - hour else current
            } else {
                (current + hour).sorted()
            }
            settingsRepository.updateDigestHours(updated)
            DigestScheduler.scheduleNextDigest(context, updated)
        }
    }

    fun openPicker(type: AppPickerType) {
        _pickerSearchQuery.value = ""
        _pickerCategoryFilter.value = null
        _activePicker.value = type
    }

    fun closePicker() {
        _activePicker.value = null
        _pickerSearchQuery.value = ""
        _pickerCategoryFilter.value = null
    }

    fun setPickerSearchQuery(query: String) {
        _pickerSearchQuery.value = query
    }

    fun setPickerCategoryFilter(category: Int?) {
        _pickerCategoryFilter.value = category
    }

    fun togglePackageInActivePicker(packageName: String) {
        val pickerType = _activePicker.value ?: return
        viewModelScope.launch(dispatchers.io) {
            val currentSnapshot = snapshot.value
            when (pickerType) {
                AppPickerType.DISTRACTING -> {
                    val current = currentSnapshot.distractingPackages
                    val updated = if (current.contains(packageName)) current - packageName else current + packageName
                    settingsRepository.updateDistractingPackages(updated)
                }
                AppPickerType.NEVER_BLOCK -> {
                    val current = currentSnapshot.neverBlockPackages
                    val updated = if (current.contains(packageName)) current - packageName else current + packageName
                    settingsRepository.updateNeverBlockPackages(updated)
                }
                AppPickerType.ALWAYS_ALLOW -> {
                    val current = currentSnapshot.alwaysAllowPackages
                    val updated = if (current.contains(packageName)) current - packageName else current + packageName
                    settingsRepository.updateAlwaysAllowPackages(updated)
                }
            }
        }
    }

    fun addSuggestedDistractingPackages() {
        viewModelScope.launch(dispatchers.io) {
            val targetCategories = setOf(
                ApplicationInfo.CATEGORY_SOCIAL,
                ApplicationInfo.CATEGORY_VIDEO,
                ApplicationInfo.CATEGORY_GAME
            )
            val suggestedPkgs = allApps.value
                .filter { it.category in targetCategories }
                .map { it.packageName }
                .toSet()

            val combined = snapshot.value.distractingPackages + suggestedPkgs
            settingsRepository.updateDistractingPackages(combined)
        }
    }
}
