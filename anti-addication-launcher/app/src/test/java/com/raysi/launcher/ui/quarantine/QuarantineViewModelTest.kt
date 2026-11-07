// app/src/test/java/com/raysi/launcher/ui/quarantine/QuarantineViewModelTest.kt
package com.raysi.launcher.ui.quarantine

import android.content.ComponentName
import android.content.Intent
import android.graphics.Rect
import android.os.UserHandle
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.quarantine.QuarantineNotificationEntity
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.QuarantineRepository
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class QuarantineViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private class TestFocusDispatchers(testDispatcher: CoroutineDispatcher) : FocusDispatchers {
        override val mainImmediate: CoroutineDispatcher = testDispatcher
        override val default: CoroutineDispatcher = testDispatcher
        override val io: CoroutineDispatcher = testDispatcher
        override val usageAggregation: CoroutineDispatcher = testDispatcher
    }

    private class FakeQuarantineRepo : QuarantineRepository {
        val listFlow = MutableStateFlow<List<QuarantineNotificationEntity>>(emptyList())
        override val allNotificationsFlow: Flow<List<QuarantineNotificationEntity>> = listFlow
        override val unreadCountFlow: Flow<Int> = listFlow.map { it.size }

        override suspend fun quarantineNotification(
            packageName: String,
            title: String,
            text: String,
            timestamp: Long,
            category: String,
            channelId: String
        ): Long {
            val id = (listFlow.value.size + 1).toLong()
            val entity = QuarantineNotificationEntity(id, packageName, title, text, timestamp, category, channelId)
            listFlow.value = listOf(entity) + listFlow.value
            return id
        }

        override suspend fun getNotificationsSince(sinceTimestamp: Long): List<QuarantineNotificationEntity> {
            return listFlow.value.filter { it.timestamp >= sinceTimestamp }
        }

        override suspend fun purgeOlderThan(cutoffTimestamp: Long): Int {
            val current = listFlow.value
            val retained = current.filter { it.timestamp >= cutoffTimestamp }
            listFlow.value = retained
            return current.size - retained.size
        }

        override suspend fun deleteById(id: Long): Int {
            val current = listFlow.value
            val retained = current.filterNot { it.id == id }
            listFlow.value = retained
            return current.size - retained.size
        }

        override suspend fun clearAll(): Int {
            val size = listFlow.value.size
            listFlow.value = emptyList()
            return size
        }
    }

    private class FakeAppInventoryRepo : AppInventoryRepository {
        val apps = MutableStateFlow<List<AppInfo>>(emptyList())
        override val appsFlow: StateFlow<List<AppInfo>> = apps
        private val _appsMap = MutableStateFlow<Map<String, AppInfo>>(emptyMap())
        override val appsMapFlow: StateFlow<Map<String, AppInfo>> = _appsMap

        fun setAppList(list: List<AppInfo>) {
            apps.value = list
            _appsMap.value = list.associateBy { it.uniqueKey }
        }

        override suspend fun reloadInventory() {}
        override fun launchApp(componentName: ComponentName, userHandle: UserHandle, sourceBounds: Rect?): Boolean = true
        override fun launchApp(appInfo: AppInfo, sourceBounds: Rect?): Boolean = true
        override fun findApp(componentNameStr: String, userSerialNumber: Long): AppInfo? = null
        override fun getUserHandle(userSerialNumber: Long): UserHandle? = null
        override fun getUserSerialNumber(userHandle: UserHandle): Long = 0L
        override fun isDefaultLauncher(): Boolean = true
        override fun createDefaultLauncherIntent(): Intent = Intent()
    }

    private lateinit var fakeRepo: FakeQuarantineRepo
    private lateinit var fakeInventory: FakeAppInventoryRepo
    private lateinit var viewModel: QuarantineViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        fakeRepo = FakeQuarantineRepo()
        fakeInventory = FakeAppInventoryRepo()
        viewModel = QuarantineViewModel(
            quarantineRepository = fakeRepo,
            appInventoryRepository = fakeInventory,
            dispatchers = TestFocusDispatchers(testDispatcher)
        )
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun testNotificationsMappedWithAppLabels() = runTest(testDispatcher) {
        val app = AppInfo(
            label = "Social Chat",
            packageName = "com.chat.social",
            className = "MainActivity"
        )
        fakeInventory.setAppList(listOf(app))

        fakeRepo.quarantineNotification(
            packageName = "com.chat.social",
            title = "Alice",
            text = "Hey there",
            timestamp = 1700000000000L,
            category = "msg",
            channelId = "c1"
        )
        advanceUntilIdle()

        val state = viewModel.uiState.first { it.items.isNotEmpty() }
        assertEquals(1, state.items.size)
        val item = state.items[0]
        assertEquals("Social Chat", item.appLabel)
        assertEquals("Alice", item.title)
        assertEquals("Hey there", item.text)
    }

    @Test
    fun testClearAllEmptiesList() = runTest(testDispatcher) {
        fakeRepo.quarantineNotification("pkg1", "t1", "m1", 1000L, "", "")
        advanceUntilIdle()

        viewModel.clearAll()
        advanceUntilIdle()

        val state = viewModel.uiState.first { it.items.isEmpty() }
        assertTrue(state.items.isEmpty())
    }

    @Test
    fun testDeleteItemRemovesSpecificItem() = runTest(testDispatcher) {
        val id1 = fakeRepo.quarantineNotification("pkg1", "t1", "m1", 1000L, "", "")
        val id2 = fakeRepo.quarantineNotification("pkg2", "t2", "m2", 2000L, "", "")
        advanceUntilIdle()

        viewModel.deleteItem(id1)
        advanceUntilIdle()

        val state = viewModel.uiState.first { it.items.size == 1 }
        assertEquals(1, state.items.size)
        assertEquals(id2, state.items[0].id)
    }
}
