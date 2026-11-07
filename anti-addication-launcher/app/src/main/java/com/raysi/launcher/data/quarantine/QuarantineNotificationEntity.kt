// app/src/main/java/com/raysi/launcher/data/quarantine/QuarantineNotificationEntity.kt
package com.raysi.launcher.data.quarantine

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Persisted record of an intercepted and quarantined notification.
 * Sensitive interactive PendingIntents are NEVER persisted (they cannot be serialized).
 * Retained for a maximum of 7 days before automated cleanup.
 */
@Entity(
    tableName = "quarantined_notifications",
    indices = [
        Index(value = ["timestamp"]),
        Index(value = ["package_name"])
    ]
)
data class QuarantineNotificationEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,

    @ColumnInfo(name = "package_name")
    val packageName: String,

    @ColumnInfo(name = "title")
    val title: String,

    @ColumnInfo(name = "text")
    val text: String,

    @ColumnInfo(name = "timestamp")
    val timestamp: Long,

    @ColumnInfo(name = "category")
    val category: String,

    @ColumnInfo(name = "channel_id")
    val channelId: String
)
