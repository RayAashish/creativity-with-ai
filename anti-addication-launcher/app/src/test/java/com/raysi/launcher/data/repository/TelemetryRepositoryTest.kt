// app/src/test/java/com/raysi/launcher/data/repository/TelemetryRepositoryTest.kt
package com.raysi.launcher.data.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.Calendar
import java.util.TimeZone

class TelemetryRepositoryTest {

    private val utcZone = TimeZone.getTimeZone("UTC")

    @Test
    fun formatScreenTime_formatsHoursMinutesSecondsProperly() {
        // 2h 14m 12s = (2 * 3600 + 14 * 60 + 12) * 1000 = 8052000 ms
        val formatted1 = TelemetryRepositoryImpl.formatScreenTime(8052000L)
        assertEquals("2h 14m", formatted1)

        // 14m 12s = (14 * 60 + 12) * 1000 = 852000 ms
        val formatted2 = TelemetryRepositoryImpl.formatScreenTime(852000L)
        assertEquals("14m 12s", formatted2)

        // 42s = 42000 ms
        val formatted3 = TelemetryRepositoryImpl.formatScreenTime(42000L)
        assertEquals("42s", formatted3)
    }

    @Test
    fun formatAwayDuration_formatsHoursMinutesSecondsProperly() {
        // 2h 10m = 7800000 ms
        val formatted1 = TelemetryRepositoryImpl.formatAwayDuration(7800000L)
        assertEquals("away 2h 10m", formatted1)

        // 45m = 2700000 ms
        val formatted2 = TelemetryRepositoryImpl.formatAwayDuration(2700000L)
        assertEquals("away 45m", formatted2)

        // 30s = 30000 ms
        val formatted3 = TelemetryRepositoryImpl.formatAwayDuration(30000L)
        assertEquals("away 30s", formatted3)

        // 0s or negative
        val formattedZero = TelemetryRepositoryImpl.formatAwayDuration(0L)
        assertEquals("away 0m", formattedZero)
    }

    @Test
    fun formatCulpritDuration_formatsHoursAndMinutesProperly() {
        // 58m = 3480000 ms
        val formatted1 = TelemetryRepositoryImpl.formatCulpritDuration(3480000L)
        assertEquals("58m", formatted1)

        // 1h 20m = 4800000 ms
        val formatted2 = TelemetryRepositoryImpl.formatCulpritDuration(4800000L)
        assertEquals("1h 20m", formatted2)
    }

    @Test
    fun calculateDailyProgress_producesExactTwentyCharacterBarInsideBrackets() {
        // Noon (12:00 PM) -> 50%
        val cal = Calendar.getInstance(utcZone).apply {
            set(2026, Calendar.NOVEMBER, 7, 12, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val noonMs = cal.timeInMillis

        val progress = TelemetryRepositoryImpl.calculateDailyProgress(noonMs, utcZone)
        assertEquals(50, progress.percentage)

        // Check bracket contents
        val bar = progress.formattedBar
        assertTrue(bar.startsWith("day ["))
        val startIdx = bar.indexOf('[') + 1
        val endIdx = bar.indexOf(']')
        val innerContent = bar.substring(startIdx, endIdx)

        // Exactly 20 characters inside the brackets
        assertEquals(20, innerContent.length)
        assertEquals("==========" + "----------", innerContent)
        assertEquals("day [==========----------] 50%", bar)
    }

    @Test
    fun calculateDailyProgress_atMidnightAndEndOfDay() {
        // 00:00 AM -> 0%
        val cal = Calendar.getInstance(utcZone).apply {
            set(2026, Calendar.NOVEMBER, 7, 0, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val start = TelemetryRepositoryImpl.calculateDailyProgress(cal.timeInMillis, utcZone)
        assertEquals(0, start.percentage)
        assertEquals("day [--------------------] 0%", start.formattedBar)

        // 23:59 -> 99%
        cal.set(2026, Calendar.NOVEMBER, 7, 23, 59, 0)
        val end = TelemetryRepositoryImpl.calculateDailyProgress(cal.timeInMillis, utcZone)
        assertEquals(99, end.percentage)
        assertEquals(20, end.formattedBar.substring(5, 25).length)
    }
}
