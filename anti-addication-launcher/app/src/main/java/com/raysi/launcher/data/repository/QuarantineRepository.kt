// app/src/main/java/com/raysi/launcher/data/repository/QuarantineRepository.kt
package com.raysi.launcher.data.repository

import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.quarantine.QuarantineDao
import com.raysi.launcher.data.quarantine.QuarantineNotificationEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

/**
 * Repository interface for managing quarantined notifications.
 */
interface QuarantineRepository {
    val allNotificationsFlow: Flow<List<QuarantineNotificationEntity>>
    val unreadCountFlow: Flow<Int>

    suspend fun quarantineNotification(
        packageName: String,
        title: String,
        text: String,
        timestamp: Long,
        category: String,
        channelId: String
    ): Long

    suspend fun getNotificationsSince(sinceTimestamp: Long): List<QuarantineNotificationEntity>
    suspend fun purgeOlderThan(cutoffTimestamp: Long): Int
    suspend fun deleteById(id: Long): Int
    suspend fun clearAll(): Int
}

class QuarantineRepositoryImpl(
    private val dao: QuarantineDao,
    private val dispatchers: FocusDispatchers
) : QuarantineRepository {

    override val allNotificationsFlow: Flow<List<QuarantineNotificationEntity>> =
        dao.getAllFlow()

    override val unreadCountFlow: Flow<Int> =
        dao.getCountFlow()

    override suspend fun quarantineNotification(
        packageName: String,
        title: String,
        text: String,
        timestamp: Long,
        category: String,
        channelId: String
    ): Long = withContext(dispatchers.io) {
        dao.insert(
            QuarantineNotificationEntity(
                packageName = packageName,
                title = title,
                text = text,
                timestamp = timestamp,
                category = category,
                channelId = channelId
            )
        )
    }

    override suspend fun getNotificationsSince(sinceTimestamp: Long): List<QuarantineNotificationEntity> =
        withContext(dispatchers.io) {
            dao.getNotificationsSince(sinceTimestamp)
        }

    override suspend fun purgeOlderThan(cutoffTimestamp: Long): Int =
        withContext(dispatchers.io) {
            dao.deleteOlderThan(cutoffTimestamp)
        }

    override suspend fun deleteById(id: Long): Int =
        withContext(dispatchers.io) {
            dao.deleteById(id)
        }

    override suspend fun clearAll(): Int =
        withContext(dispatchers.io) {
            dao.clearAll()
        }
}
