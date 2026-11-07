package com.mindforge.app.data.local.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.mindforge.app.data.local.db.entity.AchievementEntity
import com.mindforge.app.data.local.db.entity.DailyActivityEntity
import com.mindforge.app.data.local.db.entity.GameStatEntity
import com.mindforge.app.data.local.db.entity.SessionEntity
import com.mindforge.app.data.local.db.entity.StreakRecordEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SessionDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: SessionEntity)

    @Query("SELECT * FROM sessions WHERE id = :sessionId LIMIT 1")
    suspend fun getSessionById(sessionId: String): SessionEntity?

    @Query("SELECT * FROM sessions ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentSessions(limit: Int = 20): Flow<List<SessionEntity>>

    @Query("SELECT * FROM sessions WHERE gameId = :gameId ORDER BY timestamp DESC")
    fun getSessionsForGame(gameId: String): Flow<List<SessionEntity>>

    @Query("SELECT * FROM sessions WHERE gameId = :gameId ORDER BY score DESC LIMIT 10")
    fun getTopScoresForGame(gameId: String): Flow<List<SessionEntity>>

    @Query("SELECT * FROM sessions WHERE localDate = :dateString")
    suspend fun getSessionsOnDate(dateString: String): List<SessionEntity>

    @Query("SELECT COUNT(*) FROM sessions")
    fun getTotalSessionsCount(): Flow<Int>

    @Query("SELECT SUM(xpEarned) FROM sessions")
    fun getTotalXp(): Flow<Int?>

    @Query("DELETE FROM sessions")
    suspend fun clearAll()
}

@Dao
interface GameStatDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertGameStat(stat: GameStatEntity)

    @Query("SELECT * FROM game_stats WHERE gameId = :gameId LIMIT 1")
    suspend fun getGameStat(gameId: String): GameStatEntity?

    @Query("SELECT * FROM game_stats WHERE gameId = :gameId LIMIT 1")
    fun observeGameStat(gameId: String): Flow<GameStatEntity?>

    @Query("SELECT * FROM game_stats")
    fun getAllGameStats(): Flow<List<GameStatEntity>>

    @Query("SELECT SUM(totalStars) FROM game_stats")
    fun getTotalStarsFlow(): Flow<Int?>

    @Query("DELETE FROM game_stats")
    suspend fun clearAll()
}

@Dao
interface DailyActivityDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertDailyActivity(activity: DailyActivityEntity)

    @Query("SELECT * FROM daily_activities WHERE dateString = :dateString LIMIT 1")
    suspend fun getActivity(dateString: String): DailyActivityEntity?

    @Query("SELECT * FROM daily_activities WHERE dateString = :dateString LIMIT 1")
    fun observeTodayActivity(dateString: String): Flow<DailyActivityEntity?>

    @Query("SELECT * FROM daily_activities ORDER BY dateString DESC LIMIT :limit")
    fun getRecentDailyActivities(limit: Int = 90): Flow<List<DailyActivityEntity>>

    @Query("DELETE FROM daily_activities")
    suspend fun clearAll()
}

@Dao
interface StreakDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertStreak(streak: StreakRecordEntity)

    @Query("SELECT * FROM streak_record WHERE id = 1 LIMIT 1")
    suspend fun getStreak(): StreakRecordEntity?

    @Query("SELECT * FROM streak_record WHERE id = 1 LIMIT 1")
    fun observeStreak(): Flow<StreakRecordEntity?>

    @Query("DELETE FROM streak_record")
    suspend fun clearAll()
}

@Dao
interface AchievementDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAchievements(achievements: List<AchievementEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAchievement(achievement: AchievementEntity)

    @Query("SELECT * FROM achievements WHERE id = :id LIMIT 1")
    suspend fun getAchievement(id: String): AchievementEntity?

    @Query("SELECT * FROM achievements ORDER BY id ASC")
    fun observeAllAchievements(): Flow<List<AchievementEntity>>

    @Query("SELECT COUNT(*) FROM achievements WHERE isUnlocked = 1")
    fun observeUnlockedCount(): Flow<Int>

    @Query("DELETE FROM achievements")
    suspend fun clearAll()
}
