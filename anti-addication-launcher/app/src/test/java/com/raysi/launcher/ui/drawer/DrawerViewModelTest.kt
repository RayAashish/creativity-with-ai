// app/src/test/java/com/raysi/launcher/ui/drawer/DrawerViewModelTest.kt
package com.raysi.launcher.ui.drawer

import android.content.ComponentName
import android.content.Intent
import android.graphics.Rect
import android.os.UserHandle
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.model.ActiveSessionEntry
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.LauncherSettingsSnapshot
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.search.KotlinSearchEngine
import kotlinx.coroutines.CoroutineDispatcher
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
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class DrawerViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private lateinit var fakeDispatchers: FocusDispatchers
    private lateinit var fakeInventoryRepo: FakeAppInventoryRepository
    private lateinit var fakeSettingsRepo: FakeSettingsRepository
    private lateinit var searchEngine: KotlinSearchEngine

    private fun createApp(label: String, pkg: String = "com.example.${label.lowercase()}"): AppInfo {
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
        searchEngine = KotlinSearchEngine()

        val apps = listOf(
            createApp("Chrome"),
            createApp("Camera"),
            createApp("Calculator"),
            createApp("Google Maps"),
            createApp("Settings"),
            createApp("YouTube")
        )
        fakeInventoryRepo.setApps(apps)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    private fun createViewModel(): DrawerViewModel {
        return DrawerViewModel(
            appInventoryRepository = fakeInventoryRepo,
            searchEngine = searchEngine,
            settingsRepository = fakeSettingsRepo,
            dispatchers = fakeDispatchers
        )
    }

    @Test
    fun openDrawer_opensAndPopulatesAllApps() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        advanceUntilIdle()

        viewModel.openDrawer()
        assertTrue(viewModel.isDrawerOpen.value)
        assertEquals("", viewModel.query.value)
        assertEquals(6, viewModel.searchResults.value.size)
    }

    @Test
    fun closeDrawer_resetsState() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        advanceUntilIdle()

        viewModel.openDrawer()
        viewModel.onQueryChange("cam")
        viewModel.closeDrawer()

        assertFalse(viewModel.isDrawerOpen.value)
        assertEquals("", viewModel.query.value)
    }

    @Test
    fun search_exactPrefixRanksFirst() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        advanceUntilIdle()

        viewModel.openDrawer()
        viewModel.onQueryChange("cam")

        val results = viewModel.searchResults.value
        assertTrue(results.isNotEmpty())
        assertEquals("Camera", results.first().label)
    }

    @Test
    fun search_wordBoundaryMatches() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        advanceUntilIdle()

        viewModel.openDrawer()
        viewModel.onQueryChange("maps")

        val results = viewModel.searchResults.value
        assertTrue(results.isNotEmpty())
        assertEquals("Google Maps", results.first().label)
    }

    @Test
    fun search_damerauLevenshteinTypoMatches() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        advanceUntilIdle()

        viewModel.openDrawer()
        viewModel.onQueryChange("stetings")

        val results = viewModel.searchResults.value
        assertTrue(results.isNotEmpty())
        assertEquals("Settings", results.first().label)
    }

    @Test
    fun search_zeroResultsHandled() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        advanceUntilIdle()

        viewModel.openDrawer()
        viewModel.onQueryChange("zzzzzz")

        val results = viewModel.searchResults.value
        assertTrue(results.isEmpty())
    }

    @Test
    fun launchTopMatch_launchesFirstAppAndClosesDrawer() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        advanceUntilIdle()

        viewModel.openDrawer()
        viewModel.onQueryChange("yt") // YouTube initials

        val launched = viewModel.launchTopMatch()
        assertTrue(launched)
        assertEquals("YouTube", fakeInventoryRepo.lastLaunchedApp?.label)
        assertFalse(viewModel.isDrawerOpen.value)
    }

    @Test
    fun launchApp_launchesSelectedAppAndClosesDrawer() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        advanceUntilIdle()

        viewModel.openDrawer()
        val targetApp = fakeInventoryRepo.appsFlow.value.first { it.label == "Chrome" }

        val launched = viewModel.launchApp(targetApp)
        assertTrue(launched)
        assertEquals("Chrome", fakeInventoryRepo.lastLaunchedApp?.label)
        assertFalse(viewModel.isDrawerOpen.value)
    }

    @Test
    fun pinFromDrawer_addsPinnedAppUpToFive() = runTest(testDispatcher) {
        val viewModel = createViewModel()
        advanceUntilIdle()

        val app = fakeInventoryRepo.appsFlow.value.first { it.label == "Chrome" }
        viewModel.pinApp(app)
        advanceUntilIdle()

        val pinned = fakeSettingsRepo.snapshot.pinnedApps
        assertEquals(1, pinned.size)
        assertEquals("Chrome", pinned[0].customLabel)
    }

    @Test
    fun pinFromDrawer_rejectsWhenAlreadyFive() = runTest(testDispatcher) {
        // Pre-fill 5 pins
        val fivePins = List(5) { i ->
            PinnedAppEntry("com.pkg.$i/.Activity", 0L, "App $i", i)
        }
        fakeSettingsRepo.updatePinnedApps(fivePins)

        val viewModel = createViewModel()
        advanceUntilIdle()

        val app = fakeInventoryRepo.appsFlow.value.first { it.label == "Chrome" }
        viewModel.pinApp(app)
        advanceUntilIdle()

        val pinned = fakeSettingsRepo.snapshot.pinnedApps
        assertEquals(5, pinned.size)
    }
}

// Test Fakes
private class FakeAppInventoryRepository : AppInventoryRepository {
    private val _appsFlow = MutableStateFlow<List<AppInfo>>(emptyList())
    override val appsFlow: StateFlow<List<AppInfo>> = _appsFlow.asStateFlow()

    private val _appsMapFlow = MutableStateFlow<Map<String, AppInfo>>(emptyMap())
    override val appsMapFlow: StateFlow<Map<String, AppInfo>> = _appsMapFlow.asStateFlow()

    var lastLaunchedApp: AppInfo? = null

    fun setApps(apps: List<AppInfo>) {
        _appsFlow.value = apps
        _appsMapFlow.value = apps.associateBy { it.uniqueKey }
    }

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
