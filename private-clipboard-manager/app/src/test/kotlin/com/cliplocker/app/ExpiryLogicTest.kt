package com.cliplocker.app

import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.core.model.SecretTtl
import com.cliplocker.app.core.model.SensitiveType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ExpiryLogicTest {

    @Test
    fun testNonSecretClipNeverExpires() {
        val clip = ClipItem(
            id = 1,
            content = "Standard clipboard text",
            type = ClipType.TEXT,
            isSecret = false,
            secretExpiresAt = null
        )

        assertFalse(clip.isExpired)
        assertNull(clip.remainingTtlMillis)
    }

    @Test
    fun testSecretClipWithoutTimerNeverExpires() {
        val clip = ClipItem(
            id = 10,
            content = "Permanent secret password",
            type = ClipType.SECRET,
            isSecret = true,
            secretExpiresAt = null // Timer OFF by default
        )

        assertFalse(clip.isExpired)
        assertNull(clip.remainingTtlMillis)
    }

    @Test
    fun testSecretClipBeforeExpiryTime() {
        val now = System.currentTimeMillis()
        val futureExpiry = now + 60_000L // 1 minute from now

        val clip = ClipItem(
            id = 2,
            content = "Temporary API token",
            type = ClipType.SECRET,
            isSecret = true,
            secretExpiresAt = futureExpiry
        )

        assertFalse(clip.isExpired)
        val remaining = clip.remainingTtlMillis
        assertTrue(remaining != null && remaining > 0)
    }

    @Test
    fun testSecretClipAfterExpiryTime() {
        val now = System.currentTimeMillis()
        val pastExpiry = now - 5000L // 5 seconds in the past

        val clip = ClipItem(
            id = 3,
            content = "Expired secret token",
            type = ClipType.SECRET,
            isSecret = true,
            secretExpiresAt = pastExpiry
        )

        assertTrue(clip.isExpired)
        assertEquals(0L, clip.remainingTtlMillis)
    }

    @Test
    fun testSecretTtlDurations() {
        assertEquals(60_000L, SecretTtl.ONE_MINUTE.durationMillis)
        assertEquals(300_000L, SecretTtl.FIVE_MINUTES.durationMillis)
        assertEquals(3_600_000L, SecretTtl.ONE_HOUR.durationMillis)
        assertEquals(86_400_000L, SecretTtl.TWENTY_FOUR_HOURS.durationMillis)

        assertEquals(SecretTtl.ONE_MINUTE, SecretTtl.fromDurationMillis(60_000L))
        assertEquals(SecretTtl.FIVE_MINUTES, SecretTtl.fromDurationMillis(300_000L))
        assertEquals(SecretTtl.CUSTOM, SecretTtl.fromDurationMillis(12345L))
    }

    @Test
    fun testPurgeFilterSelection() {
        val now = System.currentTimeMillis()
        val clips = listOf(
            ClipItem(id = 1, content = "Regular", isSecret = false),
            ClipItem(id = 2, content = "Active Secret", isSecret = true, secretExpiresAt = now + 10_000L),
            ClipItem(id = 3, content = "Expired Secret 1", isSecret = true, secretExpiresAt = now - 1000L),
            ClipItem(id = 4, content = "Expired Secret 2", isSecret = true, secretExpiresAt = now - 60_000L),
            ClipItem(id = 5, content = "Pinned Secret", isSecret = true, isPinned = true, secretExpiresAt = now - 500L)
        )

        val expired = clips.filter { it.isSecret && it.secretExpiresAt != null && it.secretExpiresAt <= now }
        assertEquals(3, expired.size)
        assertTrue(expired.any { it.id == 3L })
        assertTrue(expired.any { it.id == 4L })
        assertTrue(expired.any { it.id == 5L })

        val active = clips.filter { !it.isExpired }
        assertEquals(2, active.size)
        assertTrue(active.any { it.id == 1L })
        assertTrue(active.any { it.id == 2L })
    }
}
