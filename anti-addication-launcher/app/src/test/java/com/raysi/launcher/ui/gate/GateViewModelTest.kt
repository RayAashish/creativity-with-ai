// app/src/test/java/com/raysi/launcher/ui/gate/GateViewModelTest.kt
package com.raysi.launcher.ui.gate

import android.content.ComponentName
import android.content.Intent
import android.graphics.Rect
import android.os.UserHandle
import androidx.lifecycle.SavedStateHandle
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.model.ActiveSessionEntry
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.LauncherSettingsSnapshot
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.SettingsRepository
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class GateViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private lateinit var fakeDispatchers: FocusDispatchers
    private lateinit var fakeInventoryRepo: FakeAppInventoryRepository
    private lateinit var fakeSettingsRepo: FakeSettingsRepository
    private var mockCurrentElapsedRealtime = 100_000L

    private fun createApp(pkg: String, label: String = pkg): AppInfo {
        return AppInfo(
            label = label,
            packageName = pkg,
            className = "$pkg.MainActivity"
        )
    }

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        fakeDispatchers = object : FocusDispatchers {
            override val mainImmediate: CoroutineDispatcher = testDispatcher
            override val default: CoroutineDispatcher = testDispatcher
            override val io: CoroutineDispatcher = testDispatcher
            override val usageAggregation: CoroutineDispatcher = testDispatcher
        }
        fakeInventoryRepo = FakeAppInventoryRepository()
        fakeSettingsRepo = FakeSettingsRepository()
        mockCurrentElapsedRealtime = 100_000L
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    private fun createViewModel(handle: SavedStateHandle = SavedStateHandle()): GateViewModel {
        return GateViewModel(
            savedStateHandle = handle,
            settingsRepository = fakeSettingsRepo,
            appInventoryRepository = fakeInventoryRepo,
            dispatchers = fakeDispatchers,
            timeProvider = { mockCurrentElapsedRealtime }
        )
    }

    @Test
    fun checkAndLaunch_nonDistractingApp_launchesImmediately() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        val app = createApp("com.example.useful")

        val launched = viewModel.checkAndLaunch(app)
        assertTrue(launched)
        assertEquals(GateState.Idle, viewModel.gateState.value)
        assertEquals("com.example.useful", fakeInventoryRepo.lastLaunchedApp?.packageName)
    }

    @Test
    fun checkAndLaunch_distractingApp_withoutSession_triggersGate() = runTest(testDispatcher) {
        fakeSettingsRepo.updateDistractingPackages(setOf("com.example.social"))
        val viewModel = createViewModel()
        val app = createApp("com.example.social", "Social")

        val launched = viewModel.checkAndLaunch(app)
        assertFalse(launched)
        assertTrue(viewModel.gateState.value is GateState.Countdown)

        val countdown = viewModel.gateState.value as GateState.Countdown
        assertEquals(10, countdown.totalSeconds)
        assertEquals(10, countdown.remainingSeconds)
        assertEquals("Social", countdown.app.label)
    }

    @Test
    fun checkAndLaunch_distractingApp_withValidActiveSession_launchesImmediately() = runTest(testDispatcher) {
        fakeSettingsRepo.updateDistractingPackages(setOf("com.example.social"))
        val session = ActiveSessionEntry(
            packageName = "com.example.social",
            startElapsedRealtime = 90_000L,
            endWallClockMs = System.currentTimeMillis() + 600_000L,
            endElapsedRealtime = 150_000L, // valid until 150_000, current is 100_000
            extensionCount = 0
        )
        fakeSettingsRepo.addOrUpdateSession(session)

        val viewModel = createViewModel()
        val app = createApp("com.example.social")

        val launched = viewModel.checkAndLaunch(app)
        assertTrue(launched)
        assertEquals(GateState.Idle, viewModel.gateState.value)
        assertEquals("com.example.social", fakeInventoryRepo.lastLaunchedApp?.packageName)
    }

    @Test
    fun checkAndLaunch_distractingApp_withExpiredSession_triggersGate() = runTest(testDispatcher) {
        fakeSettingsRepo.updateDistractingPackages(setOf("com.example.social"))
        val expiredSession = ActiveSessionEntry(
            packageName = "com.example.social",
            startElapsedRealtime = 50_000L,
            endWallClockMs = System.currentTimeMillis() - 10_000L,
            endElapsedRealtime = 90_000L, // expired: 90_000 < current 100_000
            extensionCount = 0
        )
        fakeSettingsRepo.addOrUpdateSession(expiredSession)

        val viewModel = createViewModel()
        val app = createApp("com.example.social")

        val launched = viewModel.checkAndLaunch(app)
        assertFalse(launched)
        assertTrue(viewModel.gateState.value is GateState.Countdown)
    }

    @Test
    fun countdown_ticksAndTransitionsToDurationSelection() = runTest(testDispatcher) {
        fakeSettingsRepo.updateDistractingPackages(setOf("com.example.social"))
        val viewModel = createViewModel()
        val app = createApp("com.example.social", "Social")

        viewModel.startGate(app, gateDelaySeconds = 5, defaultDurationMinutes = 10)
        runCurrent()
        assertEquals(5, (viewModel.gateState.value as GateState.Countdown).remainingSeconds)

        // Advance 2 seconds
        advanceTimeBy(2001L)
        runCurrent()
        assertEquals(3, (viewModel.gateState.value as GateState.Countdown).remainingSeconds)

        // Advance past 5 seconds total
        advanceTimeBy(4000L)
        runCurrent()
        assertTrue(viewModel.gateState.value is GateState.DurationSelection)
        val durationSelection = viewModel.gateState.value as GateState.DurationSelection
        assertEquals("Social", durationSelection.app.label)
        assertEquals(10, durationSelection.defaultDurationMinutes)
    }

    @Test
    fun approveSession_persistsSessionAndLaunchesApp() = runTest(testDispatcher) {
        fakeSettingsRepo.updateDistractingPackages(setOf("com.example.social"))
        val viewModel = createViewModel()
        val app = createApp("com.example.social", "Social")

        viewModel.startGate(app, gateDelaySeconds = 5, defaultDurationMinutes = 10)
        advanceTimeBy(5500L) // Reach duration selection

        viewModel.approveSession(durationMinutes = 15)
        advanceUntilIdle()

        assertEquals(GateState.Idle, viewModel.gateState.value)
        assertEquals("com.example.social", fakeInventoryRepo.lastLaunchedApp?.packageName)

        val savedSession = fakeSettingsRepo.snapshot.activeSessions["com.example.social"]
        assertNotNull(savedSession)
        assertEquals(100_000L, savedSession!!.startElapsedRealtime)
        assertEquals(100_000L + 15 * 60_000L, savedSession.endElapsedRealtime)
    }

    @Test
    fun cancelGate_resetsStateToIdle() = runTest(testDispatcher) {
        val handle = SavedStateHandle()
        val viewModel = createViewModel(handle)
        val app = createApp("com.example.social")

        viewModel.startGate(app, gateDelaySeconds = 10, defaultDurationMinutes = 10)
        assertTrue(viewModel.gateState.value is GateState.Countdown)

        viewModel.cancelGate()
        assertEquals(GateState.Idle, viewModel.gateState.value)
        assertFalse(handle.contains("gate_phase"))
    }

    @Test
    fun processDeath_restoresCountdownFromSavedStateHandle() = runTest(testDispatcher) {
        val handle = SavedStateHandle().apply {
            set("gate_phase", "COUNTDOWN")
            set("gate_pkg", "com.example.social")
            set("gate_label", "Social")
            set("gate_class", "com.example.social.MainActivity")
            set("gate_total_sec", 10)
            set("gate_rem_sec", 7)
            set("gate_def_duration", 10)
        }

        val restoredViewModel = createViewModel(handle)
        val state = restoredViewModel.gateState.value
        assertTrue(state is GateState.Countdown)
        val countdown = state as GateState.Countdown
        assertEquals(10, countdown.totalSeconds)
        assertEquals(7, countdown.remainingSeconds)
        assertEquals("Social", countdown.app.label)
    }
}

// Test Fakes
private class FakeAppInventoryRepository : AppInventoryRepository {
    private val _appsFlow = MutableStateFlow<List<AppInfo>>(emptyList())
    override val appsFlow: StateFlow<List<AppInfo>> = _appsFlow.asStateFlow()

    private val _appsMapFlow = MutableStateFlow<Map<String, AppInfo>>(emptyMap())
    override val appsMapFlow: StateFlow<Map<String, AppInfo>> = _appsMapFlow.asStateFlow()

    var lastLaunchedApp: AppInfo? = null

    override suspend fun reloadInventory() {}
    override fun launchApp(componentName: ComponentName, userHandle: UserHandle, sourceBounds: Rect?): Boolean = true
    override fun launchApp(appInfo: AppInfo, sourceBounds: Rect?): Boolean {
        lastLaunchedApp = appInfo
        return true
    }
    override fun findApp(componentNameStr: String, userSerialNumber: Long): AppInfo? = null
    override fun getUserHandle(userSerialNumber: Long): UserHandle? = null
    override fun getUserSerialNumber(userHandle: UserHandle): Long = 0L
    override fun isDefaultLauncher(): Boolean = true
    override fun createDefaultLauncherIntent(): Intent = Intent()
}

private class FakeSettingsRepository : SettingsRepository {
    private val _snapshotFlow = MutableStateFlow(LauncherSettingsSnapshot.DEFAULT)
    override val snapshotFlow: StateFlow<LauncherSettingsSnapshot> = _snapshotFlow.asStateFlow()
    override val snapshot: LauncherSettingsSnapshot get() = _snapshotFlow.value

    override suspend fun updateGateDelay(seconds: Int) {}
    override suspend fun updateSessionDuration(minutes: Int) {}
    override suspend fun updateMaxExtensions(maxExtensions: Int) {}
    override suspend fun setScreenTimeIncludesLauncher(include: Boolean) {}
    override suspend fun updateDistractingPackages(packages: Set<String>) {
        _snapshotFlow.value = _snapshotFlow.value.copy(distractingPackages = packages)
    }
    override suspend fun updateNeverBlockPackages(packages: Set<String>) {}
    override suspend fun updateAlwaysAllowPackages(packages: Set<String>) {}
    override suspend fun updateDigestHours(hours: List<Int>) {}
    override suspend fun updatePinnedApps(apps: List<PinnedAppEntry>) {}

    override suspend fun addOrUpdateSession(session: ActiveSessionEntry) {
        val current = _snapshotFlow.value.activeSessions.toMutableMap()
        current[session.packageName] = session
        _snapshotFlow.value = _snapshotFlow.value.copy(activeSessions = current)
    }

    override suspend fun removeSession(packageName: String) {
        val current = _snapshotFlow.value.activeSessions.toMutableMap()
        current.remove(packageName)
        _snapshotFlow.value = _snapshotFlow.value.copy(activeSessions = current)
    }

    override suspend fun clearExpiredSessions(currentWallClockMs: Long, currentElapsedRealtime: Long) {}
}
