package com.mindforge.app.domain.streak

import com.mindforge.app.data.local.db.entity.StreakRecordEntity
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

data class StreakEvaluation(
    val updatedRecord: StreakRecordEntity,
    val freezeConsumed: Boolean,
    val freezeEarned: Boolean,
    val streakReset: Boolean,
    val streakIncremented: Boolean,
    val message: String
)

class StreakEngine {

    companion object {
        const val MAX_FREEZES = 2
        const val FREEZE_EARN_INTERVAL = 7
        const val MAX_ALLOWED_BACKWARD_DRIFT_MS = 60_000L // 1 minute tolerance
    }

    /**
     * Evaluates and updates the streak when a qualifying session or daily challenge is completed.
     *
     * @param current The existing streak record from the database.
     * @param today The current local date of the device.
     * @param currentWallMillis The current System.currentTimeMillis().
     * @param currentMonotonicMillis The current SystemClock.elapsedRealtime().
     */
    fun processSessionCompletion(
        current: StreakRecordEntity,
        today: LocalDate,
        currentWallMillis: Long,
        currentMonotonicMillis: Long
    ): StreakEvaluation {
        val todayStr = today.format(DateTimeFormatter.ISO_LOCAL_DATE)

        // 1. Anti-Tamper Check: Wall clock moved backward significantly
        if (current.lastRealtimeMillis > 0 && currentWallMillis < current.lastRealtimeMillis - MAX_ALLOWED_BACKWARD_DRIFT_MS) {
            return StreakEvaluation(
                updatedRecord = current,
                freezeConsumed = false,
                freezeEarned = false,
                streakReset = false,
                streakIncremented = false,
                message = "Device clock irregularity detected. Streak unchanged."
            )
        }

        // 2. First-ever session in the app
        if (current.lastActiveDate.isEmpty()) {
            val record = current.copy(
                currentStreak = 1,
                longestStreak = 1,
                lastActiveDate = todayStr,
                freezesAvailable = 1, // Welcome starter freeze
                lastMonotonicElapsed = currentMonotonicMillis,
                lastRealtimeMillis = currentWallMillis
            )
            return StreakEvaluation(
                updatedRecord = record,
                freezeConsumed = false,
                freezeEarned = false,
                streakReset = false,
                streakIncremented = true,
                message = "Your MindForge journey has begun! 1-day streak."
            )
        }

        val lastDate = runCatching { LocalDate.parse(current.lastActiveDate, DateTimeFormatter.ISO_LOCAL_DATE) }
            .getOrNull()

        if (lastDate == null) {
            val record = current.copy(
                currentStreak = 1,
                longestStreak = maxOf(1, current.longestStreak),
                lastActiveDate = todayStr,
                lastMonotonicElapsed = currentMonotonicMillis,
                lastRealtimeMillis = currentWallMillis
            )
            return StreakEvaluation(
                updatedRecord = record,
                freezeConsumed = false,
                freezeEarned = false,
                streakReset = true,
                streakIncremented = true,
                message = "Welcome back! 1-day streak."
            )
        }

        val daysBetween = ChronoUnit.DAYS.between(lastDate, today)

        // 3. Same Day: Multiple sessions on the same calendar date
        if (daysBetween == 0L) {
            val record = current.copy(
                lastMonotonicElapsed = currentMonotonicMillis,
                lastRealtimeMillis = currentWallMillis
            )
            return StreakEvaluation(
                updatedRecord = record,
                freezeConsumed = false,
                freezeEarned = false,
                streakReset = false,
                streakIncremented = false,
                message = "Great effort! Today's streak was already locked in."
            )
        }

        // 4. Consecutive Day (Yesterday -> Today)
        if (daysBetween == 1L) {
            val newStreak = current.currentStreak + 1
            val newLongest = maxOf(newStreak, current.longestStreak)
            val earnedFreeze = (newStreak % FREEZE_EARN_INTERVAL == 0) && (current.freezesAvailable < MAX_FREEZES)
            val freezes = if (earnedFreeze) current.freezesAvailable + 1 else current.freezesAvailable

            val record = current.copy(
                currentStreak = newStreak,
                longestStreak = newLongest,
                lastActiveDate = todayStr,
                freezesAvailable = freezes,
                lastMonotonicElapsed = currentMonotonicMillis,
                lastRealtimeMillis = currentWallMillis
            )
            return StreakEvaluation(
                updatedRecord = record,
                freezeConsumed = false,
                freezeEarned = earnedFreeze,
                streakReset = false,
                streakIncremented = true,
                message = if (earnedFreeze) "🔥 $newStreak days! You earned a Streak Freeze shield."
                else "🔥 $newStreak day streak! Keep forging."
            )
        }

        // 5. Missed Days (daysBetween > 1)
        val missedDays = (daysBetween - 1).toInt()
        val freezesToConsume = minOf(missedDays, current.freezesAvailable)

        if (freezesToConsume == missedDays && freezesToConsume > 0) {
            // All missed days were covered by available freezes!
            val newStreak = current.currentStreak + 1
            val newLongest = maxOf(newStreak, current.longestStreak)
            val remainingFreezes = current.freezesAvailable - freezesToConsume

            val record = current.copy(
                currentStreak = newStreak,
                longestStreak = newLongest,
                lastActiveDate = todayStr,
                freezesAvailable = remainingFreezes,
                lastMonotonicElapsed = currentMonotonicMillis,
                lastRealtimeMillis = currentWallMillis
            )
            return StreakEvaluation(
                updatedRecord = record,
                freezeConsumed = true,
                freezeEarned = false,
                streakReset = false,
                streakIncremented = true,
                message = "🛡️ Streak Freeze saved your $newStreak-day streak!"
            )
        } else {
            // Missed days exceeded available freezes -> streak resets to 1
            val remainingFreezes = (current.freezesAvailable - freezesToConsume).coerceAtLeast(0)
            val record = current.copy(
                currentStreak = 1,
                longestStreak = current.longestStreak,
                lastActiveDate = todayStr,
                freezesAvailable = remainingFreezes,
                lastMonotonicElapsed = currentMonotonicMillis,
                lastRealtimeMillis = currentWallMillis
            )
            return StreakEvaluation(
                updatedRecord = record,
                freezeConsumed = freezesToConsume > 0,
                freezeEarned = false,
                streakReset = true,
                streakIncremented = true,
                message = "Welcome back to the forge. Starting a fresh 1-day streak."
            )
        }
    }
}
