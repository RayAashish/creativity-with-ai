package com.mindforge.app.domain.backup

import android.content.Context
import android.net.Uri
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
import com.mindforge.app.data.local.preferences.UserPreferences
import com.mindforge.app.data.local.preferences.UserPreferencesRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import javax.inject.Inject
import javax.inject.Singleton

@Serializable
data class SessionBackupModel(
    val id: String,
    val gameId: String,
    val category: String,
    val level: Int,
    val score: Int,
    val accuracy: Float,
    val speedSeconds: Float,
    val stars: Int,
    val xpEarned: Int,
    val mistakes: Int,
    val timestamp: Long,
    val localDate: String
)

@Serializable
data class GameStatBackupModel(
    val gameId: String,
    val highestLevelUnlocked: Int,
    val totalPlays: Int,
    val bestScore: Int,
    val bestAccuracy: Float,
    val fastestSpeed: Float,
    val totalStars: Int
)

@Serializable
data class DailyActivityBackupModel(
    val dateString: String,
    val sessionsCount: Int,
    val totalXp: Int,
    val dailyChallengeCompleted: Boolean
)

@Serializable
data class StreakBackupModel(
    val currentStreak: Int,
    val longestStreak: Int,
    val lastActiveDate: String,
    val freezesAvailable: Int
)

@Serializable
data class UserPreferencesBackupModel(
    val displayName: String,
    val primaryGoal: String,
    val playerLevel: Int,
    val currentXp: Int
)

@Serializable
data class MindForgeBackupData(
    val schemaVersion: Int = 1,
    val exportTimestamp: Long = System.currentTimeMillis(),
    val app: String = "MindForge",
    val profile: UserPreferencesBackupModel,
    val streak: StreakBackupModel,
    val stats: List<GameStatBackupModel>,
    val activities: List<DailyActivityBackupModel>,
    val sessions: List<SessionBackupModel>
)

@Singleton
class BackupRestoreEngine @Inject constructor(
    @ApplicationContext private val context: Context,
    private val sessionDao: SessionDao,
    private val gameStatDao: GameStatDao,
    private val dailyActivityDao: DailyActivityDao,
    private val streakDao: StreakDao,
    private val achievementDao: AchievementDao,
    private val preferencesRepository: UserPreferencesRepository
) {
    private val json = Json {
        prettyPrint = true
        ignoreUnknownKeys = true
    }

    suspend fun exportBackup(targetUri: Uri): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            val streak = streakDao.getStreak() ?: StreakRecordEntity()
            val stats = gameStatDao.getAllGameStats().first()
            val activities = dailyActivityDao.getRecentDailyActivities(365).first()
            val sessions = sessionDao.getRecentSessions(1000).first()

            val backup = MindForgeBackupData(
                schemaVersion = 1,
                exportTimestamp = System.currentTimeMillis(),
                app = "MindForge",
                profile = UserPreferencesBackupModel(
                    displayName = prefs.displayName,
                    primaryGoal = prefs.primaryGoal,
                    playerLevel = prefs.playerLevel,
                    currentXp = prefs.currentXp
                ),
                streak = StreakBackupModel(
                    currentStreak = streak.currentStreak,
                    longestStreak = streak.longestStreak,
                    lastActiveDate = streak.lastActiveDate,
                    freezesAvailable = streak.freezesAvailable
                ),
                stats = stats.map {
                    GameStatBackupModel(
                        it.gameId, it.highestLevelUnlocked, it.totalPlays,
                        it.bestScore, it.bestAccuracy, it.fastestSpeed, it.totalStars
                    )
                },
                activities = activities.map {
                    DailyActivityBackupModel(it.dateString, it.sessionsCount, it.totalXp, it.dailyChallengeCompleted)
                },
                sessions = sessions.map {
                    SessionBackupModel(
                        it.id, it.gameId, it.category, it.level, it.score,
                        it.accuracy, it.speedSeconds, it.stars, it.xpEarned,
                        it.mistakes, it.timestamp, it.localDate
                    )
                }
            )

            val jsonString = json.encodeToString(backup)
            context.contentResolver.openOutputStream(targetUri)?.use { out ->
                OutputStreamWriter(out).use { writer ->
                    writer.write(jsonString)
                }
            } ?: return@withContext Result.failure(Exception("Cannot open destination output stream"))

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun importBackup(sourceUri: Uri): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val content = context.contentResolver.openInputStream(sourceUri)?.use { stream ->
                BufferedReader(InputStreamReader(stream)).use { reader ->
                    reader.readText()
                }
            } ?: return@withContext Result.failure(Exception("Cannot read source file"))

            val backup = json.decodeFromString<MindForgeBackupData>(content)
            if (backup.app != "MindForge" || backup.schemaVersion > 1) {
                return@withContext Result.failure(Exception("Invalid or unsupported MindForge backup format"))
            }

            // Restore Database
            sessionDao.clearAll()
            gameStatDao.clearAll()
            dailyActivityDao.clearAll()
            streakDao.clearAll()

            // Restore Stats
            backup.stats.forEach {
                gameStatDao.upsertGameStat(
                    GameStatEntity(
                        gameId = it.gameId,
                        highestLevelUnlocked = it.highestLevelUnlocked,
                        totalPlays = it.totalPlays,
                        bestScore = it.bestScore,
                        bestAccuracy = it.bestAccuracy,
                        fastestSpeed = it.fastestSpeed,
                        totalStars = it.totalStars
                    )
                )
            }

            // Restore Activities
            backup.activities.forEach {
                dailyActivityDao.upsertDailyActivity(
                    DailyActivityEntity(
                        dateString = it.dateString,
                        sessionsCount = it.sessionsCount,
                        totalXp = it.totalXp,
                        dailyChallengeCompleted = it.dailyChallengeCompleted
                    )
                )
            }

            // Restore Sessions
            backup.sessions.forEach {
                sessionDao.insertSession(
                    SessionEntity(
                        id = it.id,
                        gameId = it.gameId,
                        category = it.category,
                        level = it.level,
                        score = it.score,
                        accuracy = it.accuracy,
                        speedSeconds = it.speedSeconds,
                        stars = it.stars,
                        xpEarned = it.xpEarned,
                        mistakes = it.mistakes,
                        timestamp = it.timestamp,
                        localDate = it.localDate
                    )
                )
            }

            // Restore Streak
            streakDao.upsertStreak(
                StreakRecordEntity(
                    currentStreak = backup.streak.currentStreak,
                    longestStreak = backup.streak.longestStreak,
                    lastActiveDate = backup.streak.lastActiveDate,
                    freezesAvailable = backup.streak.freezesAvailable,
                    lastRealtimeMillis = System.currentTimeMillis()
                )
            )

            // Restore Preferences
            preferencesRepository.updateProfile(
                name = backup.profile.displayName,
                avatarUri = null,
                builtInAvatarIndex = 0
            )
            preferencesRepository.setPrimaryGoal(backup.profile.primaryGoal)
            preferencesRepository.updateProgression(
                level = backup.profile.playerLevel,
                xp = backup.profile.currentXp
            )

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
