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
import com.raysi.launcher.data.repository.HudState
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.repository.UsageRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
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
    private lateinit var fakeUsageRepo: FakeUsageRepository

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        fakeSettingsRepo = FakeSettingsRepository()
        fakeInventoryRepo = FakeAppInventoryRepository()
        fakeUsageRepo = FakeUsageRepository()
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    private fun createViewModel(scope: kotlinx.coroutines.CoroutineScope): HomeViewModel {
        return HomeViewModel(
            appInventoryRepository = fakeInventoryRepo,
            settingsRepository = fakeSettingsRepo,
            usageRepository = fakeUsageRepo,
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
                displayOrder = 6 - i
            )
        }
        fakeSettingsRepo.updatePinnedApps(pins)

        val result = viewModel.pinnedApps.first { it.size == 5 }
        assertEquals(5, result.size)
        assertTrue(result[0].displayOrder <= result[1].displayOrder)
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
        assertEquals("Ghost App", pins[0].displayLabel)
        assertFalse(pins[0].isInstalled)
    }

    @Test
    fun pinnedApps_displaysUsageDurationWhenGranted_andHidesWhenDenied() = runTest(testDispatcher) {
        fakeUsageRepo.setPermission(true)
        fakeUsageRepo.setAppDuration("com.test", 720_000L) // 12m

        val viewModel = createViewModel(backgroundScope)

        fakeSettingsRepo.updatePinnedApps(
            listOf(
                PinnedAppEntry(
                    componentName = "com.test/.App",
                    userSerialNumber = 0L,
                    customLabel = "Messages",
                    displayOrder = 0
                )
            )
        )

        val pinsGranted = viewModel.pinnedApps.first { it.isNotEmpty() && it[0].usageDurationFormatted != null }
        assertEquals("12m", pinsGranted[0].usageDurationFormatted)

        // Deny usage permission
        fakeUsageRepo.setPermission(false)
        val pinsDenied = viewModel.pinnedApps.first { it.isNotEmpty() && it[0].usageDurationFormatted == null }
        assertNull(pinsDenied[0].usageDurationFormatted)
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
        val updated = viewModel.pinnedApps.first { it[0].displayLabel == "Focus App" }
        assertEquals(HomeDialogState.None, viewModel.dialogState.value)
        assertEquals("Focus App", updated[0].displayLabel)
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
}

// Fakes for testing
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

private class FakeUsageRepository : UsageRepository {
    private val _hudStateFlow = MutableStateFlow(HudState(hasPermission = true, perAppDurations = mapOf("com.test" to 720_000L)))
    override val hudStateFlow: StateFlow<HudState> = _hudStateFlow.asStateFlow()
    override fun hasUsagePermission(): Boolean = _hudStateFlow.value.hasPermission
    override fun onScreenResumed() {}
    override fun onScreenPaused() {}
    override suspend fun reconcileUsage() {}

    fun setPermission(granted: Boolean) {
        _hudStateFlow.value = _hudStateFlow.value.copy(hasPermission = granted)
    }

    fun setAppDuration(pkg: String, durationMs: Long) {
        val updated = _hudStateFlow.value.perAppDurations.toMutableMap()
        updated[pkg] = durationMs
        _hudStateFlow.value = _hudStateFlow.value.copy(perAppDurations = updated)
    }
}
