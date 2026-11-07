// app/src/test/java/com/raysi/launcher/service/notification/DigestSchedulerTest.kt
package com.raysi.launcher.service.notification

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.util.Calendar
import java.util.TimeZone
import java.util.concurrent.TimeUnit

class DigestSchedulerTest {

    private val tz = TimeZone.getTimeZone("UTC")

    private fun createEpochMillis(hour: Int, minute: Int, second: Int = 0): Long {
        return Calendar.getInstance(tz).apply {
            set(2026, Calendar.MARCH, 15, hour, minute, second)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis
    }

    @Test
    fun testMorningDelayToNoonDigest() {
        val now = createEpochMillis(hour = 9, minute = 30)
        val digestHours = listOf(12, 18, 21)

        val delay = DigestScheduler.calculateDelayToNextDigest(now, digestHours, tz)
        val expectedDelay = TimeUnit.HOURS.toMillis(2) + TimeUnit.MINUTES.toMillis(30)
        assertEquals(expectedDelay, delay)
    }

    @Test
    fun testAfternoonDelayToEveningDigest() {
        val now = createEpochMillis(hour = 14, minute = 0)
        val digestHours = listOf(12, 18, 21)

        val delay = DigestScheduler.calculateDelayToNextDigest(now, digestHours, tz)
        val expectedDelay = TimeUnit.HOURS.toMillis(4)
        assertEquals(expectedDelay, delay)
    }

    @Test
    fun testEveningDelayToNightDigest() {
        val now = createEpochMillis(hour = 19, minute = 45)
        val digestHours = listOf(12, 18, 21)

        val delay = DigestScheduler.calculateDelayToNextDigest(now, digestHours, tz)
        val expectedDelay = TimeUnit.HOURS.toMillis(1) + TimeUnit.MINUTES.toMillis(15)
        assertEquals(expectedDelay, delay)
    }

    @Test
    fun testLateNightDelayToNextDayDigest() {
        // At 22:00, all today's digests (12, 18, 21) have passed
        val now = createEpochMillis(hour = 22, minute = 0)
        val digestHours = listOf(12, 18, 21)

        val delay = DigestScheduler.calculateDelayToNextDigest(now, digestHours, tz)
        // From 22:00 to tomorrow 12:00 is 14 hours
        val expectedDelay = TimeUnit.HOURS.toMillis(14)
        assertEquals(expectedDelay, delay)
    }

    @Test
    fun testUnorderedAndDuplicateDigestHours() {
        val now = createEpochMillis(hour = 10, minute = 0)
        val unorderedHours = listOf(21, 12, 18, 12)

        val delay = DigestScheduler.calculateDelayToNextDigest(now, unorderedHours, tz)
        // Should hit 12:00: delay = 2 hours
        assertEquals(TimeUnit.HOURS.toMillis(2), delay)
    }

    @Test
    fun testEmptyDigestHoursFallback() {
        val now = createEpochMillis(hour = 12, minute = 0)
        val delay = DigestScheduler.calculateDelayToNextDigest(now, emptyList(), tz)
        assertEquals(TimeUnit.HOURS.toMillis(6), delay)
    }

    @Test
    fun testMinimumDelayGuaranteed() {
        // Exactly on the minute of digest
        val now = createEpochMillis(hour = 12, minute = 0, second = 0)
        val digestHours = listOf(12)

        val delay = DigestScheduler.calculateDelayToNextDigest(now, digestHours, tz)
        assertTrue("Delay must be at least 15 seconds", delay >= 15_000L)
    }
}
