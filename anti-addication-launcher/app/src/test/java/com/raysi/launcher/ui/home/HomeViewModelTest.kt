// app/src/test/java/com/raysi/launcher/ui/home/HomeViewModelTest.kt
package com.raysi.launcher.ui.home

import android.content.ComponentName
import android.content.Intent
import android.graphics.Rect
import android.os.UserHandle
import com.raysi.launcher.data.model.ActiveSessionEntry
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.LauncherSettingsSnapshot
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.PreferencesRepository
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.repository.TelemetryRepository
import com.raysi.launcher.domain.model.DailyProgress
import com.raysi.launcher.domain.model.PinnedAppItem
import com.raysi.launcher.domain.model.TelemetryUiState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class HomeViewModelTest {

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var fakeSettingsRepo: FakeSettingsRepository
    private lateinit var fakeInventoryRepo: FakeAppInventoryRepository
    private lateinit var fakeTelemetryRepo: FakeTelemetryRepository
    private lateinit var fakePreferencesRepo: FakePreferencesRepository

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        fakeSettingsRepo = FakeSettingsRepository()
        fakeInventoryRepo = FakeAppInventoryRepository()
        fakeTelemetryRepo = FakeTelemetryRepository()
        fakePreferencesRepo = FakePreferencesRepository()
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    private fun createViewModel(scope: kotlinx.coroutines.CoroutineScope): HomeViewModel {
        return HomeViewModel(
            appInventoryRepository = fakeInventoryRepo,
            settingsRepository = fakeSettingsRepo,
            telemetryRepository = fakeTelemetryRepo,
            preferencesRepository = fakePreferencesRepo,
            quarantineRepository = null,
            coroutineScope = scope
        )
    }

    @Test
    fun pinnedApps_emptyInitially() = runTest(testDispatcher) {
        val viewModel = createViewModel(backgroundScope)
        val initial = viewModel.pinnedApps.first()
        assertTrue(initial.isEmpty())
    }

    @Test
    fun pinnedApps_capsAtFive_andRespectsDisplayOrder() = runTest(testDispatcher) {
        val viewModel = createViewModel(backgroundScope)

        val pins = (0 until 7).map { i ->
            PinnedAppEntry(
                componentName = "com.test.pkg$i/.Activity",
                userSerialNumber = 0L,
                customLabel = "App $i",
                displayOrder = i
            )
        }
        fakeSettingsRepo.updatePinnedApps(pins)

        val result = viewModel.pinnedApps.first { it.size == 5 }
        assertEquals(5, result.size)
        assertEquals("App 0", result[0].label)
        assertEquals("App 4", result[4].label)
    }

    @Test
    fun uninstalledPinnedApp_doesNotCrash_markedAsNotInstalled() = runTest(testDispatcher) {
        val viewModel = createViewModel(backgroundScope)

        fakeSettingsRepo.updatePinnedApps(
            listOf(
                PinnedAppEntry(
                    componentName = "com.uninstalled.pkg/.MainActivity",
                    userSerialNumber = 0L,
                    customLabel = "Ghost App",
                    displayOrder = 0
                )
            )
        )

        val pins = viewModel.pinnedApps.first { it.isNotEmpty() }
        assertEquals(1, pins.size)
        assertEquals("Ghost App", pins[0].label)
        assertFalse(pins[0].isInstalled)
    }

    @Test
    fun pinnedApps_displaysUsageDurationWhenAbove15Minutes_andHidesWhenBelow() = runTest(testDispatcher) {
        // App 1: 20 minutes (1_200_000 ms) -> usage tag visible
        // App 2: 10 minutes (600_000 ms) -> usage tag hidden (< 15m)
        fakeTelemetryRepo.setAppDuration("com.app.above", 20 * 60 * 1000L)
        fakeTelemetryRepo.setAppDuration("com.app.below", 10 * 60 * 1000L)

        val viewModel = createViewModel(backgroundScope)

        fakeSettingsRepo.updatePinnedApps(
            listOf(
                PinnedAppEntry(
                    componentName = "com.app.above/.App",
                    userSerialNumber = 0L,
                    customLabel = "Above 15m",
                    displayOrder = 0
                ),
                PinnedAppEntry(
                    componentName = "com.app.below/.App",
                    userSerialNumber = 0L,
                    customLabel = "Below 15m",
                    displayOrder = 1
                )
            )
        )

        val pins = viewModel.pinnedApps.first { it.size == 2 && it[0].usageFormatted != null }
        assertEquals("20m", pins[0].usageFormatted)
        assertNull(pins[1].usageFormatted)
    }

    @Test
    fun pinnedApps_visualSatietyDimming_whenExceedsDefault45Minutes() = runTest(testDispatcher) {
        // Exceeds default 45m limit (50m)
        fakeTelemetryRepo.setAppDuration("com.app.social", 50 * 60 * 1000L)

        val viewModel = createViewModel(backgroundScope)

        fakeSettingsRepo.updatePinnedApps(
            listOf(
                PinnedAppEntry(
                    componentName = "com.app.social/.Feed",
                    userSerialNumber = 0L,
                    customLabel = "Social",
                    displayOrder = 0
                )
            )
        )

        val pins = viewModel.pinnedApps.first { it.isNotEmpty() && it[0].isSatiated }
        assertTrue(pins[0].isSatiated)
        assertEquals(45, pins[0].timeLimitMinutes)
    }

    @Test
    fun pinnedApps_customTimeCap_triggersSatietyWhenExceeded() = runTest(testDispatcher) {
        // 35m usage with 30m custom limit
        fakeTelemetryRepo.setAppDuration("com.app.game", 35 * 60 * 1000L)
        fakePreferencesRepo.setCustomAppLimit("com.app.game", 30)

        val viewModel = createViewModel(backgroundScope)

        fakeSettingsRepo.updatePinnedApps(
            listOf(
                PinnedAppEntry(
                    componentName = "com.app.game/.Game",
                    userSerialNumber = 0L,
                    customLabel = "Game",
                    displayOrder = 0
                )
            )
        )

        val pins = viewModel.pinnedApps.first { it.isNotEmpty() && it[0].isSatiated }
        assertTrue(pins[0].isSatiated)
        assertEquals(30, pins[0].timeLimitMinutes)
    }

    @Test
    fun renamePin_validatesLength_between1And24Chars() = runTest(testDispatcher) {
        val viewModel = createViewModel(backgroundScope)

        fakeSettingsRepo.updatePinnedApps(
            listOf(
                PinnedAppEntry(
                    componentName = "com.test/.App",
                    userSerialNumber = 0L,
                    customLabel = "Old Name",
                    displayOrder = 0
                )
            )
        )

        val pin = viewModel.pinnedApps.first { it.isNotEmpty() }[0]

        // Attempt empty string rename
        viewModel.onStartRename(pin)
        viewModel.onConfirmRename(pin, "   ")
        val dialogState = viewModel.dialogState.value
        assertTrue(dialogState is HomeDialogState.Rename)
        assertNotNull((dialogState as HomeDialogState.Rename).error)

        // Attempt > 24 chars rename
        viewModel.onConfirmRename(pin, "A".repeat(25))
        val dialogState2 = viewModel.dialogState.value
        assertTrue(dialogState2 is HomeDialogState.Rename)
        assertNotNull((dialogState2 as HomeDialogState.Rename).error)

        // Valid rename (1-24 chars)
        viewModel.onConfirmRename(pin, "Focus App")
        val updated = viewModel.pinnedApps.first { it[0].label == "Focus App" }
        assertEquals(HomeDialogState.None, viewModel.dialogState.value)
        assertEquals("Focus App", updated[0].label)
    }

    @Test
    fun moveUpAndDown_updatesOrderProperly() = runTest(testDispatcher) {
        val viewModel = createViewModel(backgroundScope)

        val pin1 = PinnedAppEntry("com.test.one/.A", 0L, "One", 0)
        val pin2 = PinnedAppEntry("com.test.two/.B", 0L, "Two", 1)
        fakeSettingsRepo.updatePinnedApps(listOf(pin1, pin2))

        val uiPin2 = viewModel.pinnedApps.first { it.size == 2 }[1]
        viewModel.onMoveUp(uiPin2)

        val updated = viewModel.pinnedApps.first { it[0].componentNameStr == "com.test.two/.B" }
        assertEquals("com.test.two/.B", updated[0].componentNameStr)
        assertEquals("com.test.one/.A", updated[1].componentNameStr)
    }

    @Test
    fun unpin_removesAppFromSettings() = runTest(testDispatcher) {
        val viewModel = createViewModel(backgroundScope)

        val pin1 = PinnedAppEntry("com.test.one/.A", 0L, "One", 0)
        fakeSettingsRepo.updatePinnedApps(listOf(pin1))

        val uiPin = viewModel.pinnedApps.first { it.size == 1 }[0]
        viewModel.onUnpin(uiPin)

        val updated = viewModel.pinnedApps.first { it.isEmpty() }
        assertTrue(updated.isEmpty())
    }

    @Test
    fun dailyFocusGoal_saveAndExpose() = runTest(testDispatcher) {
        val viewModel = createViewModel(backgroundScope)

        viewModel.saveFocusGoal("Finish Phase 9 verification")
        testScheduler.advanceUntilIdle()

        val goal = viewModel.dailyFocusGoal.first { it == "Finish Phase 9 verification" }
        assertEquals("Finish Phase 9 verification", goal)
    }

    @Test
    fun scratchpad_saveAndExpose() = runTest(testDispatcher) {
        val viewModel = createViewModel(backgroundScope)

        viewModel.saveScratchpad("Quick memo line 1\nLine 2")
        testScheduler.advanceUntilIdle()

        val content = viewModel.scratchpadContent.first { it.isNotBlank() }
        assertEquals("Quick memo line 1\nLine 2", content)
    }
}

// Test Fakes
private class FakeSettingsRepository : SettingsRepository {
    private val _snapshotFlow = MutableStateFlow(LauncherSettingsSnapshot.DEFAULT)
    override val snapshotFlow: StateFlow<LauncherSettingsSnapshot> = _snapshotFlow.asStateFlow()
    override val snapshot: LauncherSettingsSnapshot get() = _snapshotFlow.value

    override suspend fun updateGateDelay(seconds: Int) {}
    override suspend fun updateSessionDuration(minutes: Int) {}
    override suspend fun updateMaxExtensions(maxExtensions: Int) {}
    override suspend fun setScreenTimeIncludesLauncher(include: Boolean) {}
    override suspend fun updateDistractingPackages(packages: Set<String>) {}
    override suspend fun updateNeverBlockPackages(packages: Set<String>) {}
    override suspend fun updateAlwaysAllowPackages(packages: Set<String>) {}
    override suspend fun updateDigestHours(hours: List<Int>) {}

    override suspend fun updatePinnedApps(apps: List<PinnedAppEntry>) {
        _snapshotFlow.value = _snapshotFlow.value.copy(pinnedApps = apps)
    }

    override suspend fun addOrUpdateSession(session: ActiveSessionEntry) {}
    override suspend fun removeSession(packageName: String) {}
    override suspend fun clearExpiredSessions(currentWallClockMs: Long, currentElapsedRealtime: Long) {}
}

private class FakeAppInventoryRepository : AppInventoryRepository {
    private val _appsFlow = MutableStateFlow<List<AppInfo>>(emptyList())
    override val appsFlow: StateFlow<List<AppInfo>> = _appsFlow.asStateFlow()

    private val _appsMapFlow = MutableStateFlow<Map<String, AppInfo>>(emptyMap())
    override val appsMapFlow: StateFlow<Map<String, AppInfo>> = _appsMapFlow.asStateFlow()

    override suspend fun reloadInventory() {}
    override fun launchApp(componentName: ComponentName, userHandle: UserHandle, sourceBounds: Rect?): Boolean = true
    override fun launchApp(appInfo: AppInfo, sourceBounds: Rect?): Boolean = true
    override fun findApp(componentNameStr: String, userSerialNumber: Long): AppInfo? = null
    override fun getUserHandle(userSerialNumber: Long): UserHandle? = null
    override fun getUserSerialNumber(userHandle: UserHandle): Long = 0L
    override fun isDefaultLauncher(): Boolean = true
    override fun createDefaultLauncherIntent(): Intent = Intent()
}

private class FakeTelemetryRepository : TelemetryRepository {
    private val _uiState = MutableStateFlow(TelemetryUiState())
    override val telemetryUiStateFlow: StateFlow<TelemetryUiState> = _uiState.asStateFlow()

    private val _dailyProgress = MutableStateFlow(DailyProgress())
    override val dailyProgressFlow: StateFlow<DailyProgress> = _dailyProgress.asStateFlow()

    private val _perAppDurations = MutableStateFlow<Map<String, Long>>(emptyMap())
    override val perAppDurationsFlow: StateFlow<Map<String, Long>> = _perAppDurations.asStateFlow()

    fun setAppDuration(pkg: String, durationMs: Long) {
        val updated = _perAppDurations.value.toMutableMap()
        updated[pkg] = durationMs
        _perAppDurations.value = updated
    }

    override suspend fun reconcile() {}
    override fun onScreenResumed() {}
    override fun onScreenPaused() {}
    override fun close() {}
}

private class FakePreferencesRepository : PreferencesRepository {
    private val _focusGoal = MutableStateFlow("")
    override val dailyFocusGoalFlow: Flow<String> = _focusGoal.asStateFlow()

    private val _scratchpad = MutableStateFlow("")
    override val scratchpadContentFlow: Flow<String> = _scratchpad.asStateFlow()

    private val _customLimits = MutableStateFlow<Map<String, Int>>(emptyMap())
    override val customAppLimitsFlow: Flow<Map<String, Int>> = _customLimits.asStateFlow()

    private val _awayDuration = MutableStateFlow(0L)
    override val lastAwayDurationFlow: Flow<Long> = _awayDuration.asStateFlow()

    private val _unlockCount = MutableStateFlow(0)
    override val dailyUnlockCountFlow: Flow<Int> = _unlockCount.asStateFlow()

    private val _stealthMode = MutableStateFlow(true)
    override val isStealthModeFlow: Flow<Boolean> = _stealthMode.asStateFlow()

    private val _systemGrayscale = MutableStateFlow(false)
    override val isSystemGrayscaleEnabledFlow: Flow<Boolean> = _systemGrayscale.asStateFlow()

    override suspend fun setDailyFocusGoal(goal: String) {
        _focusGoal.value = goal
    }

    override suspend fun clearDailyFocusGoal() {
        _focusGoal.value = ""
    }

    override suspend fun saveScratchpadContent(content: String) {
        _scratchpad.value = content
    }

    override suspend fun setCustomAppLimit(packageName: String, limitMinutes: Int) {
        val updated = _customLimits.value.toMutableMap()
        if (limitMinutes <= 0) {
            updated.remove(packageName)
        } else {
            updated[packageName] = limitMinutes
        }
        _customLimits.value = updated
    }

    override suspend fun setStealthMode(enabled: Boolean) {
        _stealthMode.value = enabled
    }

    override suspend fun setSystemGrayscaleEnabled(enabled: Boolean) {
        _systemGrayscale.value = enabled
    }

    override suspend fun recordScreenOff(timestampMs: Long) {}

    override suspend fun recordUserPresent(timestampMs: Long): Int {
        val next = _unlockCount.value + 1
        _unlockCount.value = next
        return next
    }

    override suspend fun getScratchpadContent(): String = _scratchpad.value
}
