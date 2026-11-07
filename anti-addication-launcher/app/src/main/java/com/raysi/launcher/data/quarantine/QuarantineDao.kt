// app/src/main/java/com/raysi/launcher/data/quarantine/QuarantineDao.kt
package com.raysi.launcher.data.quarantine

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for quarantined notifications.
 */
@Dao
interface QuarantineDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(notification: QuarantineNotificationEntity): Long

    @Query("SELECT * FROM quarantined_notifications ORDER BY timestamp DESC")
    fun getAllFlow(): Flow<List<QuarantineNotificationEntity>>

    @Query("SELECT * FROM quarantined_notifications ORDER BY timestamp DESC")
    suspend fun getAll(): List<QuarantineNotificationEntity>

    @Query("SELECT * FROM quarantined_notifications WHERE timestamp >= :sinceTimestamp ORDER BY timestamp DESC")
    suspend fun getNotificationsSince(sinceTimestamp: Long): List<QuarantineNotificationEntity>

    @Query("DELETE FROM quarantined_notifications WHERE timestamp < :cutoffTimestamp")
    suspend fun deleteOlderThan(cutoffTimestamp: Long): Int

    @Query("DELETE FROM quarantined_notifications WHERE id = :id")
    suspend fun deleteById(id: Long): Int

    @Query("DELETE FROM quarantined_notifications")
    suspend fun clearAll(): Int

    @Query("SELECT COUNT(*) FROM quarantined_notifications")
    fun getCountFlow(): Flow<Int>
}
