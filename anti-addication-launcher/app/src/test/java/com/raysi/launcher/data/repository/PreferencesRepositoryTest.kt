// app/src/test/java/com/raysi/launcher/data/repository/PreferencesRepositoryTest.kt
package com.raysi.launcher.data.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.Calendar
import java.util.TimeZone

class PreferencesRepositoryTest {

    private val utcZone = TimeZone.getTimeZone("UTC")

    @Test
    fun isFocusGoalExpired_expiredWhenSavedBefore4am_andCurrentTimeAfter4am() {
        // Saved at 03:30 AM today
        val cal = Calendar.getInstance(utcZone).apply {
            set(2026, Calendar.NOVEMBER, 7, 3, 30, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val savedTimeMs = cal.timeInMillis

        // Current time is 04:01 AM today (past the 4:00 AM boundary)
        cal.set(2026, Calendar.NOVEMBER, 7, 4, 1, 0)
        val nowMs = cal.timeInMillis

        val isExpired = PreferencesRepositoryImpl.isFocusGoalExpired(savedTimeMs, nowMs, utcZone)
        assertTrue(isExpired)
    }

    @Test
    fun isFocusGoalExpired_notExpiredWhenSavedAt5am_andCurrentTimeIs11pmSameDay() {
        // Saved at 05:00 AM today
        val cal = Calendar.getInstance(utcZone).apply {
            set(2026, Calendar.NOVEMBER, 7, 5, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val savedTimeMs = cal.timeInMillis

        // Current time is 11:00 PM today
        cal.set(2026, Calendar.NOVEMBER, 7, 23, 0, 0)
        val nowMs = cal.timeInMillis

        val isExpired = PreferencesRepositoryImpl.isFocusGoalExpired(savedTimeMs, nowMs, utcZone)
        assertFalse(isExpired)
    }

    @Test
    fun isFocusGoalExpired_notExpiredWhenSavedAt11pm_andCurrentTimeIs2amNextMorning() {
        // Late-night work session: Saved at 11:00 PM on Nov 7
        val cal = Calendar.getInstance(utcZone).apply {
            set(2026, Calendar.NOVEMBER, 7, 23, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val savedTimeMs = cal.timeInMillis

        // Current time is 02:30 AM on Nov 8 (before the 4:00 AM cutoff for the cycle)
        cal.set(2026, Calendar.NOVEMBER, 8, 2, 30, 0)
        val nowMs = cal.timeInMillis

        val isExpired = PreferencesRepositoryImpl.isFocusGoalExpired(savedTimeMs, nowMs, utcZone)
        assertFalse(isExpired)
    }

    @Test
    fun isFocusGoalExpired_expiredWhenSavedYesterdayMorning_andCurrentTimeIs2amNextMorning() {
        // Saved at 06:00 AM on Nov 6
        val cal = Calendar.getInstance(utcZone).apply {
            set(2026, Calendar.NOVEMBER, 6, 6, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val savedTimeMs = cal.timeInMillis

        // Current time is 02:00 AM on Nov 8 (previous cycle cutoff was 04:00 AM on Nov 7)
        cal.set(2026, Calendar.NOVEMBER, 8, 2, 0, 0)
        val nowMs = cal.timeInMillis

        val isExpired = PreferencesRepositoryImpl.isFocusGoalExpired(savedTimeMs, nowMs, utcZone)
        assertTrue(isExpired)
    }

    @Test
    fun parseLimits_parsesValidStringCorrectly() {
        val raw = "com.instagram.android=45;com.twitter.android=30;com.youtube=60"
        val map = PreferencesRepositoryImpl.parseLimits(raw)

        assertEquals(3, map.size)
        assertEquals(45, map["com.instagram.android"])
        assertEquals(30, map["com.twitter.android"])
        assertEquals(60, map["com.youtube"])
    }

    @Test
    fun parseLimits_handlesEmptyOrCorruptedStringGracefully() {
        assertTrue(PreferencesRepositoryImpl.parseLimits(null).isEmpty())
        assertTrue(PreferencesRepositoryImpl.parseLimits("").isEmpty())
        assertTrue(PreferencesRepositoryImpl.parseLimits("   ").isEmpty())
        assertTrue(PreferencesRepositoryImpl.parseLimits("corrupted;invalid=abc").isEmpty())
    }

    @Test
    fun serializeLimits_serializesMapCorrectly() {
        val map = mapOf(
            "com.app.a" to 20,
            "com.app.b" to 45
        )
        val serialized = PreferencesRepositoryImpl.serializeLimits(map)
        val roundtrip = PreferencesRepositoryImpl.parseLimits(serialized)

        assertEquals(map, roundtrip)
    }
}
