package com.mindforge.app.data.di

import android.content.Context
import androidx.room.Room
import com.mindforge.app.data.local.db.MindForgeDatabase
import com.mindforge.app.data.local.db.dao.AchievementDao
import com.mindforge.app.data.local.db.dao.DailyActivityDao
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.dao.SessionDao
import com.mindforge.app.data.local.db.dao.StreakDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): MindForgeDatabase {
        return Room.databaseBuilder(
            context,
            MindForgeDatabase::class.java,
            "mindforge.db"
        )
        .fallbackToDestructiveMigration() // Default safe fallback during initial phase
        .build()
    }

    @Provides
    fun provideSessionDao(database: MindForgeDatabase): SessionDao = database.sessionDao()

    @Provides
    fun provideGameStatDao(database: MindForgeDatabase): GameStatDao = database.gameStatDao()

    @Provides
    fun provideDailyActivityDao(database: MindForgeDatabase): DailyActivityDao = database.dailyActivityDao()

    @Provides
    fun provideStreakDao(database: MindForgeDatabase): StreakDao = database.streakDao()

    @Provides
    fun provideAchievementDao(database: MindForgeDatabase): AchievementDao = database.achievementDao()
}
