// app/src/test/java/com/raysi/launcher/ui/settings/SettingsViewModelTest.kt
package com.raysi.launcher.ui.settings

import android.content.ComponentName
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.graphics.Rect
import android.os.UserHandle
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.model.ActiveSessionEntry
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.LauncherSettingsSnapshot
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.HudState
import com.raysi.launcher.data.repository.PreferencesRepository
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.repository.UsageRepository
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class SettingsViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private class TestFocusDispatchers(testDispatcher: CoroutineDispatcher) : FocusDispatchers {
        override val mainImmediate: CoroutineDispatcher = testDispatcher
        override val default: CoroutineDispatcher = testDispatcher
        override val io: CoroutineDispatcher = testDispatcher
        override val usageAggregation: CoroutineDispatcher = testDispatcher
    }

    private class FakeSettingsRepo : SettingsRepository {
        val flow = MutableStateFlow(LauncherSettingsSnapshot.DEFAULT)
        override val snapshotFlow: StateFlow<LauncherSettingsSnapshot> = flow.asStateFlow()
        override val snapshot: LauncherSettingsSnapshot get() = flow.value

        override suspend fun updateGateDelay(seconds: Int) {
            flow.value = flow.value.copy(gateDelaySeconds = seconds)
        }

        override suspend fun updateSessionDuration(minutes: Int) {
            flow.value = flow.value.copy(sessionDurationMinutes = minutes)
        }

        override suspend fun updateMaxExtensions(maxExtensions: Int) {
            flow.value = flow.value.copy(maxExtensionsAllowed = maxExtensions)
        }

        override suspend fun setScreenTimeIncludesLauncher(include: Boolean) {
            flow.value = flow.value.copy(screenTimeIncludesLauncher = include)
        }

        override suspend fun updateDistractingPackages(packages: Set<String>) {
            flow.value = flow.value.copy(distractingPackages = packages)
        }

        override suspend fun updateNeverBlockPackages(packages: Set<String>) {
            flow.value = flow.value.copy(neverBlockPackages = packages)
        }

        override suspend fun updateAlwaysAllowPackages(packages: Set<String>) {
            flow.value = flow.value.copy(alwaysAllowPackages = packages)
        }

        override suspend fun updateDigestHours(hours: List<Int>) {
            flow.value = flow.value.copy(digestHours = hours)
        }

        override suspend fun updatePinnedApps(apps: List<PinnedAppEntry>) {}
        override suspend fun addOrUpdateSession(session: ActiveSessionEntry) {}
        override suspend fun removeSession(packageName: String) {}
        override suspend fun clearExpiredSessions(currentWallClockMs: Long, currentElapsedRealtime: Long) {}
    }

    private class FakeAppInventoryRepo : AppInventoryRepository {
        val apps = MutableStateFlow<List<AppInfo>>(emptyList())
        override val appsFlow: StateFlow<List<AppInfo>> = apps.asStateFlow()
        val appsMap = MutableStateFlow<Map<String, AppInfo>>(emptyMap())
        override val appsMapFlow: StateFlow<Map<String, AppInfo>> = appsMap.asStateFlow()

        override suspend fun reloadInventory() {}
        override fun launchApp(componentName: ComponentName, userHandle: UserHandle, sourceBounds: Rect?): Boolean = true
        override fun launchApp(appInfo: AppInfo, sourceBounds: Rect?): Boolean = true
        override fun findApp(componentNameStr: String, userSerialNumber: Long): AppInfo? = null
        override fun getUserHandle(userSerialNumber: Long): UserHandle? = null
        override fun getUserSerialNumber(userHandle: UserHandle): Long = 0L
        override fun isDefaultLauncher(): Boolean = true
        override fun createDefaultLauncherIntent(): Intent = Intent()
    }

    private class FakeUsageRepo : UsageRepository {
        private val _hudStateFlow = MutableStateFlow(HudState(hasPermission = true))
        override val hudStateFlow: StateFlow<HudState> = _hudStateFlow.asStateFlow()
        override fun hasUsagePermission(): Boolean = true
        override fun onScreenResumed() {}
        override fun onScreenPaused() {}
        override suspend fun reconcileUsage() {}
    }

    private class FakePreferencesRepo : PreferencesRepository {
        val stealthFlow = MutableStateFlow(true)
        val grayscaleFlow = MutableStateFlow(false)

        override val dailyFocusGoalFlow: Flow<String> = flowOf("")
        override val scratchpadContentFlow: Flow<String> = flowOf("")
        override val customAppLimitsFlow: Flow<Map<String, Int>> = flowOf(emptyMap())
        override val lastAwayDurationFlow: Flow<Long> = flowOf(0L)
        override val dailyUnlockCountFlow: Flow<Int> = flowOf(0)
        override val isStealthModeFlow: Flow<Boolean> = stealthFlow.asStateFlow()
        override val isSystemGrayscaleEnabledFlow: Flow<Boolean> = grayscaleFlow.asStateFlow()

        override suspend fun setDailyFocusGoal(goal: String) {}
        override suspend fun clearDailyFocusGoal() {}
        override suspend fun saveScratchpadContent(content: String) {}
        override suspend fun setCustomAppLimit(packageName: String, limitMinutes: Int) {}
        override suspend fun setStealthMode(enabled: Boolean) { stealthFlow.value = enabled }
        override suspend fun setSystemGrayscaleEnabled(enabled: Boolean) { grayscaleFlow.value = enabled }
        override suspend fun recordScreenOff(timestampMs: Long) {}
        override suspend fun recordUserPresent(timestampMs: Long): Int = 0
        override suspend fun getScratchpadContent(): String = ""
    }

    private lateinit var fakeSettings: FakeSettingsRepo
    private lateinit var fakeInventory: FakeAppInventoryRepo
    private lateinit var fakeUsage: FakeUsageRepo
    private lateinit var fakePreferences: FakePreferencesRepo
    private lateinit var viewModel: SettingsViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        fakeSettings = FakeSettingsRepo()
        fakeInventory = FakeAppInventoryRepo()
        fakeUsage = FakeUsageRepo()
        fakePreferences = FakePreferencesRepo()
        viewModel = SettingsViewModel(
            settingsRepository = fakeSettings,
            appInventoryRepository = fakeInventory,
            usageRepository = fakeUsage,
            preferencesRepository = fakePreferences,
            dispatchers = TestFocusDispatchers(testDispatcher)
        )
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun testUpdateGateDelayAndSessionDuration() = runTest(testDispatcher) {
        viewModel.setGateDelay(15)
        advanceUntilIdle()
        assertEquals(15, fakeSettings.snapshot.gateDelaySeconds)

        viewModel.setSessionDuration(5)
        advanceUntilIdle()
        assertEquals(5, fakeSettings.snapshot.sessionDurationMinutes)

        viewModel.setMaxExtensions(3)
        advanceUntilIdle()
        assertEquals(3, fakeSettings.snapshot.maxExtensionsAllowed)
    }

    @Test
    fun testSetScreenTimeIncludesLauncher() = runTest(testDispatcher) {
        viewModel.setScreenTimeIncludesLauncher(false)
        advanceUntilIdle()
        assertFalse(fakeSettings.snapshot.screenTimeIncludesLauncher)

        viewModel.setScreenTimeIncludesLauncher(true)
        advanceUntilIdle()
        assertTrue(fakeSettings.snapshot.screenTimeIncludesLauncher)
    }

    @Test
    fun testPickerTogglingDistractingPackages() = runTest(testDispatcher) {
        viewModel.openPicker(AppPickerType.DISTRACTING)
        advanceUntilIdle()
        assertEquals(AppPickerType.DISTRACTING, viewModel.activePicker.value)

        viewModel.togglePackageInActivePicker("com.distracting.app")
        advanceUntilIdle()
        assertTrue(fakeSettings.snapshot.distractingPackages.contains("com.distracting.app"))

        // Toggle again to remove
        viewModel.togglePackageInActivePicker("com.distracting.app")
        advanceUntilIdle()
        assertFalse(fakeSettings.snapshot.distractingPackages.contains("com.distracting.app"))

        viewModel.closePicker()
        advanceUntilIdle()
        assertNull(viewModel.activePicker.value)
    }

    @Test
    fun testPickerTogglingNeverBlockAndAlwaysAllow() = runTest(testDispatcher) {
        viewModel.openPicker(AppPickerType.NEVER_BLOCK)
        viewModel.togglePackageInActivePicker("com.emergency.dialer")
        advanceUntilIdle()
        assertTrue(fakeSettings.snapshot.neverBlockPackages.contains("com.emergency.dialer"))

        viewModel.openPicker(AppPickerType.ALWAYS_ALLOW)
        viewModel.togglePackageInActivePicker("com.important.chat")
        advanceUntilIdle()
        assertTrue(fakeSettings.snapshot.alwaysAllowPackages.contains("com.important.chat"))
    }

    @Test
    fun testAddSuggestedDistractingPackages() = runTest(testDispatcher) {
        val socialApp = AppInfo(label = "Instagram", packageName = "com.instagram.android", category = ApplicationInfo.CATEGORY_SOCIAL)
        val gameApp = AppInfo(label = "Candy Crush", packageName = "com.king.candycrush", category = ApplicationInfo.CATEGORY_GAME)
        val toolApp = AppInfo(label = "Calculator", packageName = "com.android.calculator2", category = ApplicationInfo.CATEGORY_PRODUCTIVITY)

        fakeInventory.apps.value = listOf(socialApp, gameApp, toolApp)
        advanceUntilIdle()

        viewModel.addSuggestedDistractingPackages()
        advanceUntilIdle()

        val distracting = fakeSettings.snapshot.distractingPackages
        assertTrue(distracting.contains("com.instagram.android"))
        assertTrue(distracting.contains("com.king.candycrush"))
        assertFalse(distracting.contains("com.android.calculator2"))
    }

    @Test
    fun testPickerFilteringByQueryAndCategory() = runTest(testDispatcher) {
        val social1 = AppInfo(label = "Instagram", packageName = "com.instagram.android", category = ApplicationInfo.CATEGORY_SOCIAL)
        val social2 = AppInfo(label = "Twitter", packageName = "com.twitter.android", category = ApplicationInfo.CATEGORY_SOCIAL)
        val video1 = AppInfo(label = "YouTube", packageName = "com.google.android.youtube", category = ApplicationInfo.CATEGORY_VIDEO)

        fakeInventory.apps.value = listOf(social1, social2, video1)
        advanceUntilIdle()

        // Filter by Social category
        viewModel.setPickerCategoryFilter(ApplicationInfo.CATEGORY_SOCIAL)
        advanceUntilIdle()
        val socialFiltered = viewModel.filteredPickerApps.first { it.isNotEmpty() }
        assertEquals(2, socialFiltered.size)

        // Filter by query "insta"
        viewModel.setPickerSearchQuery("insta")
        advanceUntilIdle()
        val queryFiltered = viewModel.filteredPickerApps.first { it.size == 1 }
        assertEquals(1, queryFiltered.size)
        assertEquals("com.instagram.android", queryFiltered[0].packageName)
    }

    @Test
    fun testStealthModeAndGrayscaleToggles() = runTest(testDispatcher) {
        viewModel.setStealthMode(false)
        advanceUntilIdle()
        assertFalse(fakePreferences.stealthFlow.value)

        viewModel.setStealthMode(true)
        advanceUntilIdle()
        assertTrue(fakePreferences.stealthFlow.value)
    }
}
