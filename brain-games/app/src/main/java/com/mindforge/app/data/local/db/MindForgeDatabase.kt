package com.mindforge.app.data.local.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.mindforge.app.data.local.db.dao.AchievementDao
import com.mindforge.app.data.local.db.dao.DailyActivityDao
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.dao.SessionDao
import com.mindforge.app.data.local.db.dao.StreakDao
import com.mindforge.app.data.local.db.entity.AchievementEntity
import com.mindforge.app.data.local.db.entity.DailyActivityEntity
import com.mindforge.app.data.local.db.entity.GameStatEntity
import com.mindforge.app.data.local.db.entity.SessionEntity
import com.mindforge.app.data.local.db.entity.StreakRecordEntity

@Database(
    entities = [
        SessionEntity::class,
        GameStatEntity::class,
        DailyActivityEntity::class,
        StreakRecordEntity::class,
        AchievementEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class MindForgeDatabase : RoomDatabase() {
    abstract fun sessionDao(): SessionDao
    abstract fun gameStatDao(): GameStatDao
    abstract fun dailyActivityDao(): DailyActivityDao
    abstract fun streakDao(): StreakDao
    abstract fun achievementDao(): AchievementDao
}
