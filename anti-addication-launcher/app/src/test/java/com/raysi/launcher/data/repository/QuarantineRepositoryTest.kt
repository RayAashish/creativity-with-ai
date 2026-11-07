// app/src/test/java/com/raysi/launcher/data/repository/QuarantineRepositoryTest.kt
package com.raysi.launcher.data.repository

import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.quarantine.QuarantineDao
import com.raysi.launcher.data.quarantine.QuarantineNotificationEntity
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.concurrent.atomic.AtomicLong

@OptIn(ExperimentalCoroutinesApi::class)
class QuarantineRepositoryTest {

    private class FakeQuarantineDao : QuarantineDao {
        private val idGen = AtomicLong(1L)
        private val listFlow = MutableStateFlow<List<QuarantineNotificationEntity>>(emptyList())

        override suspend fun insert(notification: QuarantineNotificationEntity): Long {
            val id = if (notification.id == 0L) idGen.getAndIncrement() else notification.id
            val entity = notification.copy(id = id)
            val current = listFlow.value.toMutableList()
            current.removeAll { it.id == id }
            current.add(0, entity)
            listFlow.value = current.sortedByDescending { it.timestamp }
            return id
        }

        override fun getAllFlow(): Flow<List<QuarantineNotificationEntity>> = listFlow

        override suspend fun getAll(): List<QuarantineNotificationEntity> = listFlow.value

        override suspend fun getNotificationsSince(sinceTimestamp: Long): List<QuarantineNotificationEntity> {
            return listFlow.value.filter { it.timestamp >= sinceTimestamp }
        }

        override suspend fun deleteOlderThan(cutoffTimestamp: Long): Int {
            val current = listFlow.value
            val retained = current.filter { it.timestamp >= cutoffTimestamp }
            val removedCount = current.size - retained.size
            listFlow.value = retained
            return removedCount
        }

        override suspend fun deleteById(id: Long): Int {
            val current = listFlow.value
            val retained = current.filterNot { it.id == id }
            val removedCount = current.size - retained.size
            listFlow.value = retained
            return removedCount
        }

        override suspend fun clearAll(): Int {
            val count = listFlow.value.size
            listFlow.value = emptyList()
            return count
        }

        override fun getCountFlow(): Flow<Int> = listFlow.map { it.size }
    }

    private class TestFocusDispatchers : FocusDispatchers {
        override val mainImmediate: CoroutineDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        override val default: CoroutineDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        override val io: CoroutineDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        override val usageAggregation: CoroutineDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
    }

    private lateinit var fakeDao: FakeQuarantineDao
    private lateinit var repository: QuarantineRepository

    @Before
    fun setUp() {
        fakeDao = FakeQuarantineDao()
        repository = QuarantineRepositoryImpl(
            dao = fakeDao,
            dispatchers = TestFocusDispatchers()
        )
    }

    @Test
    fun testInsertAndRetrieveNotifications() = runTest {
        val id1 = repository.quarantineNotification(
            packageName = "com.social.app",
            title = "New friend request",
            text = "Alice sent you a request",
            timestamp = 1000L,
            category = "social",
            channelId = "friend_req"
        )
        assertTrue(id1 > 0)

        val id2 = repository.quarantineNotification(
            packageName = "com.news.feed",
            title = "Breaking News",
            text = "Headline details",
            timestamp = 2000L,
            category = "news",
            channelId = "breaking"
        )
        assertTrue(id2 > 0)

        val all = repository.allNotificationsFlow.first()
        assertEquals(2, all.size)
        assertEquals("com.news.feed", all[0].packageName) // sorted descending by timestamp
        assertEquals("com.social.app", all[1].packageName)
    }

    @Test
    fun testGetNotificationsSince() = runTest {
        repository.quarantineNotification("pkg1", "t1", "m1", 100L, "", "")
        repository.quarantineNotification("pkg2", "t2", "m2", 500L, "", "")
        repository.quarantineNotification("pkg3", "t3", "m3", 1000L, "", "")

        val recent = repository.getNotificationsSince(500L)
        assertEquals(2, recent.size)
        assertEquals("pkg3", recent[0].packageName)
        assertEquals("pkg2", recent[1].packageName)
    }

    @Test
    fun testPurgeOlderThan7Days() = runTest {
        val now = 1_000_000L
        val sevenDaysMillis = 7L * 24 * 60 * 60 * 1000L
        val cutoff = now - sevenDaysMillis

        // Older than 7 days
        repository.quarantineNotification("old_pkg", "old", "old", cutoff - 1000L, "", "")
        // Retained within 7 days
        repository.quarantineNotification("recent_pkg", "rec", "rec", cutoff + 1000L, "", "")

        val deleted = repository.purgeOlderThan(cutoff)
        assertEquals(1, deleted)

        val remaining = repository.allNotificationsFlow.first()
        assertEquals(1, remaining.size)
        assertEquals("recent_pkg", remaining[0].packageName)
    }

    @Test
    fun testDeleteByIdAndClearAll() = runTest {
        val id = repository.quarantineNotification("pkg1", "t1", "m1", 100L, "", "")
        repository.quarantineNotification("pkg2", "t2", "m2", 200L, "", "")

        val deletedCount = repository.deleteById(id)
        assertEquals(1, deletedCount)

        val remaining = repository.allNotificationsFlow.first()
        assertEquals(1, remaining.size)
        assertEquals("pkg2", remaining[0].packageName)

        val clearedCount = repository.clearAll()
        assertEquals(1, clearedCount)
        assertTrue(repository.allNotificationsFlow.first().isEmpty())
    }
}
