// app/src/main/java/com/raysi/launcher/data/quarantine/QuarantineDatabase.kt
package com.raysi.launcher.data.quarantine

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

/**
 * Room database for persisting intercepted notifications.
 */
@Database(
    entities = [QuarantineNotificationEntity::class],
    version = 1,
    exportSchema = false
)
abstract class QuarantineDatabase : RoomDatabase() {
    abstract fun quarantineDao(): QuarantineDao

    companion object {
        private const val DATABASE_NAME = "focus_quarantine.db"

        @Volatile
        private var instance: QuarantineDatabase? = null

        fun getInstance(context: Context): QuarantineDatabase {
            return instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    QuarantineDatabase::class.java,
                    DATABASE_NAME
                ).fallbackToDestructiveMigration().build().also {
                    instance = it
                }
            }
        }
    }
}
