package com.mindforge.app

import com.mindforge.app.data.local.db.entity.StreakRecordEntity
import com.mindforge.app.domain.streak.StreakEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class Phase3Test {

    private val engine = StreakEngine()

    @Test
    fun testFirstSession_initializesStreak() {
        val initial = StreakRecordEntity()
        val today = LocalDate.of(2026, 11, 7)
        val result = engine.processSessionCompletion(initial, today, 1000000L, 50000L)

        assertEquals(1, result.updatedRecord.currentStreak)
        assertEquals(1, result.updatedRecord.longestStreak)
        assertEquals("2026-11-07", result.updatedRecord.lastActiveDate)
        assertEquals(1, result.updatedRecord.freezesAvailable)
        assertTrue(result.streakIncremented)
        assertFalse(result.streakReset)
    }

    @Test
    fun testSameDayMultipleSessions_noDoubleCount() {
        val existing = StreakRecordEntity(
            currentStreak = 5,
            longestStreak = 10,
            lastActiveDate = "2026-11-07",
            freezesAvailable = 1,
            lastRealtimeMillis = 1000000L
        )
        val today = LocalDate.of(2026, 11, 7)
        val result = engine.processSessionCompletion(existing, today, 1050000L, 60000L)

        assertEquals(5, result.updatedRecord.currentStreak)
        assertFalse(result.streakIncremented)
        assertFalse(result.streakReset)
        assertFalse(result.freezeConsumed)
    }

    @Test
    fun testConsecutiveDay_incrementsStreak() {
        val existing = StreakRecordEntity(
            currentStreak = 5,
            longestStreak = 10,
            lastActiveDate = "2026-11-06",
            freezesAvailable = 1,
            lastRealtimeMillis = 1000000L
        )
        val today = LocalDate.of(2026, 11, 7)
        val result = engine.processSessionCompletion(existing, today, 2000000L, 70000L)

        assertEquals(6, result.updatedRecord.currentStreak)
        assertEquals(10, result.updatedRecord.longestStreak)
        assertEquals("2026-11-07", result.updatedRecord.lastActiveDate)
        assertTrue(result.streakIncremented)
        assertFalse(result.streakReset)
    }

    @Test
    fun testConsecutiveDay_earnsFreezeAtMultipleOfSeven() {
        val existing = StreakRecordEntity(
            currentStreak = 6,
            longestStreak = 6,
            lastActiveDate = "2026-11-06",
            freezesAvailable = 1,
            lastRealtimeMillis = 1000000L
        )
        val today = LocalDate.of(2026, 11, 7)
        val result = engine.processSessionCompletion(existing, today, 2000000L, 70000L)

        assertEquals(7, result.updatedRecord.currentStreak)
        assertEquals(7, result.updatedRecord.longestStreak)
        assertEquals(2, result.updatedRecord.freezesAvailable) // Earned 1 freeze
        assertTrue(result.freezeEarned)
    }

    @Test
    fun testMissedOneDay_withFreezeAvailable_consumesFreezeAndPreservesStreak() {
        val existing = StreakRecordEntity(
            currentStreak = 12,
            longestStreak = 12,
            lastActiveDate = "2026-11-05", // Missed Nov 6
            freezesAvailable = 1,
            lastRealtimeMillis = 1000000L
        )
        val today = LocalDate.of(2026, 11, 7)
        val result = engine.processSessionCompletion(existing, today, 3000000L, 80000L)

        assertEquals(13, result.updatedRecord.currentStreak)
        assertEquals(0, result.updatedRecord.freezesAvailable)
        assertTrue(result.freezeConsumed)
        assertFalse(result.streakReset)
    }

    @Test
    fun testMissedOneDay_withNoFreeze_resetsStreakToOne() {
        val existing = StreakRecordEntity(
            currentStreak = 12,
            longestStreak = 12,
            lastActiveDate = "2026-11-05", // Missed Nov 6
            freezesAvailable = 0,
            lastRealtimeMillis = 1000000L
        )
        val today = LocalDate.of(2026, 11, 7)
        val result = engine.processSessionCompletion(existing, today, 3000000L, 80000L)

        assertEquals(1, result.updatedRecord.currentStreak)
        assertEquals(12, result.updatedRecord.longestStreak)
        assertTrue(result.streakReset)
        assertFalse(result.freezeConsumed)
    }

    @Test
    fun testMissedTwoDays_withTwoFreezes_consumesBothAndPreservesStreak() {
        val existing = StreakRecordEntity(
            currentStreak = 20,
            longestStreak = 20,
            lastActiveDate = "2026-11-04", // Missed Nov 5, Nov 6 (2 days)
            freezesAvailable = 2,
            lastRealtimeMillis = 1000000L
        )
        val today = LocalDate.of(2026, 11, 7)
        val result = engine.processSessionCompletion(existing, today, 4000000L, 90000L)

        assertEquals(21, result.updatedRecord.currentStreak)
        assertEquals(0, result.updatedRecord.freezesAvailable)
        assertTrue(result.freezeConsumed)
        assertFalse(result.streakReset)
    }

    @Test
    fun testMissedTwoDays_withOneFreeze_consumesFreezeAndResetsStreakToOne() {
        val existing = StreakRecordEntity(
            currentStreak = 20,
            longestStreak = 20,
            lastActiveDate = "2026-11-04", // Missed Nov 5, Nov 6 (2 days)
            freezesAvailable = 1,
            lastRealtimeMillis = 1000000L
        )
        val today = LocalDate.of(2026, 11, 7)
        val result = engine.processSessionCompletion(existing, today, 4000000L, 90000L)

        assertEquals(1, result.updatedRecord.currentStreak)
        assertEquals(0, result.updatedRecord.freezesAvailable)
        assertTrue(result.freezeConsumed)
        assertTrue(result.streakReset)
    }

    @Test
    fun testClockMovedBackwards_detectedAndNoAdvancement() {
        val existing = StreakRecordEntity(
            currentStreak = 5,
            longestStreak = 5,
            lastActiveDate = "2026-11-07",
            freezesAvailable = 1,
            lastRealtimeMillis = 5000000L // 5000 seconds
        )
        val today = LocalDate.of(2026, 11, 7)
        // User moves clock backward by 1 hour (3600 seconds)
        val tamperedWallMillis = 5000000L - 3600000L
        val result = engine.processSessionCompletion(existing, today, tamperedWallMillis, 10000L)

        assertEquals(5, result.updatedRecord.currentStreak)
        assertFalse(result.streakIncremented)
        assertFalse(result.streakReset)
    }
}
