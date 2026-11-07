package com.mindforge.app.data.local.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "sessions")
data class SessionEntity(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val gameId: String,
    val category: String,
    val level: Int,
    val score: Int,
    val accuracy: Float,
    val speedSeconds: Float,
    val stars: Int,
    val xpEarned: Int,
    val mistakes: Int,
    val timestamp: Long = System.currentTimeMillis(),
    val localDate: String // YYYY-MM-DD format
)

@Entity(tableName = "game_stats")
data class GameStatEntity(
    @PrimaryKey
    val gameId: String,
    val highestLevelUnlocked: Int = 1,
    val totalPlays: Int = 0,
    val bestScore: Int = 0,
    val bestAccuracy: Float = 0f,
    val fastestSpeed: Float = 0f,
    val totalStars: Int = 0
)

@Entity(tableName = "daily_activities")
data class DailyActivityEntity(
    @PrimaryKey
    val dateString: String, // YYYY-MM-DD
    val sessionsCount: Int = 0,
    val totalXp: Int = 0,
    val dailyChallengeCompleted: Boolean = false
)

@Entity(tableName = "streak_record")
data class StreakRecordEntity(
    @PrimaryKey
    val id: Int = 1,
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val lastActiveDate: String = "",
    val freezesAvailable: Int = 1,
    val lastMonotonicElapsed: Long = 0L,
    val lastRealtimeMillis: Long = 0L
)

@Entity(tableName = "achievements")
data class AchievementEntity(
    @PrimaryKey
    val id: String,
    val progress: Int = 0,
    val maxProgress: Int = 1,
    val isUnlocked: Boolean = false,
    val unlockedAt: Long? = null
)
