// app/src/test/java/com/raysi/launcher/data/usage/engine/UsageAggregationEngineTest.kt
package com.raysi.launcher.data.usage.engine

import com.raysi.launcher.data.usage.model.UsageEventRecord
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class UsageAggregationEngineTest {

    private val ownPackage = "com.raysi.launcher"

    @Test
    fun pairingByPackageAndClass_computesExactDuration() {
        val startOfDay = 10_000L
        val now = 20_000L

        val events = listOf(
            UsageEventRecord(UsageEventRecord.SCREEN_INTERACTIVE, 11_000L, "", ""),
            UsageEventRecord(UsageEventRecord.ACTIVITY_RESUMED, 11_000L, "com.example.chat", "com.example.chat.ChatActivity"),
            UsageEventRecord(UsageEventRecord.ACTIVITY_PAUSED, 14_000L, "com.example.chat", "com.example.chat.ChatActivity"),
            UsageEventRecord(UsageEventRecord.SCREEN_NON_INTERACTIVE, 14_000L, "", "")
        )

        val result = UsageAggregationEngine.aggregate(events, startOfDay, now, ownPackage)

        assertEquals(3_000L, result.totalScreenTimeMs)
        assertEquals(3_000L, result.perAppDurationsMs["com.example.chat"])
        assertNull(result.currentlyForegroundPackage)
    }

    @Test
    fun missingPauseEvents_closesOnNextPackageResume() {
        val startOfDay = 10_000L
        val now = 20_000L

        val events = listOf(
            UsageEventRecord(UsageEventRecord.ACTIVITY_RESUMED, 11_000L, "com.example.appA", "com.example.appA.Main"),
            // AppA crashed or was killed without ACTIVITY_PAUSED; AppB resumed at 13_000
            UsageEventRecord(UsageEventRecord.ACTIVITY_RESUMED, 13_000L, "com.example.appB", "com.example.appB.Main"),
            UsageEventRecord(UsageEventRecord.ACTIVITY_PAUSED, 16_000L, "com.example.appB", "com.example.appB.Main")
        )

        val result = UsageAggregationEngine.aggregate(events, startOfDay, now, ownPackage)

        // AppA was active from 11_000 to 13_000 = 2_000L
        assertEquals(2_000L, result.perAppDurationsMs["com.example.appA"])
        // AppB was active from 13_000 to 16_000 = 3_000L
        assertEquals(3_000L, result.perAppDurationsMs["com.example.appB"])
    }

    @Test
    fun missingPauseEvents_closesOnScreenNonInteractive() {
        val startOfDay = 10_000L
        val now = 20_000L

        val events = listOf(
            UsageEventRecord(UsageEventRecord.SCREEN_INTERACTIVE, 11_000L, "", ""),
            UsageEventRecord(UsageEventRecord.ACTIVITY_RESUMED, 11_000L, "com.example.appA", "com.example.appA.Main"),
            // Screen turns off without prior ACTIVITY_PAUSED
            UsageEventRecord(UsageEventRecord.SCREEN_NON_INTERACTIVE, 15_000L, "", "")
        )

        val result = UsageAggregationEngine.aggregate(events, startOfDay, now, ownPackage)

        assertEquals(4_000L, result.totalScreenTimeMs)
        assertEquals(4_000L, result.perAppDurationsMs["com.example.appA"])
        assertNull(result.currentlyForegroundPackage)
    }

    @Test
    fun activityToActivityTransition_insideSamePackage_doesNotDoubleCount() {
        val startOfDay = 10_000L
        val now = 20_000L

        val events = listOf(
            // Activity1 resumed
            UsageEventRecord(UsageEventRecord.ACTIVITY_RESUMED, 11_000L, "com.example.appA", "com.example.appA.Activity1"),
            // Activity2 resumed while Activity1 still active (transition)
            UsageEventRecord(UsageEventRecord.ACTIVITY_RESUMED, 12_000L, "com.example.appA", "com.example.appA.Activity2"),
            // Activity1 paused
            UsageEventRecord(UsageEventRecord.ACTIVITY_PAUSED, 12_500L, "com.example.appA", "com.example.appA.Activity1"),
            // Activity2 paused
            UsageEventRecord(UsageEventRecord.ACTIVITY_PAUSED, 15_000L, "com.example.appA", "com.example.appA.Activity2")
        )

        val result = UsageAggregationEngine.aggregate(events, startOfDay, now, ownPackage)

        // Total package duration should be 11_000 to 15_000 = 4_000L (NOT 5_500L)
        assertEquals(4_000L, result.perAppDurationsMs["com.example.appA"])
    }

    @Test
    fun sessionOpenAtStartOfDay_midnightRollover_computesTodayPortion() {
        val startOfDay = 10_000L
        val now = 20_000L

        // App started yesterday before startOfDay, paused today at 13_000
        val events = listOf(
            UsageEventRecord(UsageEventRecord.ACTIVITY_PAUSED, 13_000L, "com.example.nightowl", "com.example.nightowl.Reader")
        )

        val result = UsageAggregationEngine.aggregate(events, startOfDay, now, ownPackage)

        // Duration credited for today is startOfDay to 13_000 = 3_000L
        assertEquals(3_000L, result.perAppDurationsMs["com.example.nightowl"])
    }

    @Test
    fun openSessionStillRunningNow_countedUpToNow() {
        val startOfDay = 10_000L
        val now = 20_000L

        val events = listOf(
            UsageEventRecord(UsageEventRecord.SCREEN_INTERACTIVE, 15_000L, "", ""),
            UsageEventRecord(UsageEventRecord.ACTIVITY_RESUMED, 15_000L, "com.example.live", "com.example.live.StreamActivity")
            // No pause event; still running at now (20_000L)
        )

        val result = UsageAggregationEngine.aggregate(events, startOfDay, now, ownPackage)

        assertEquals(5_000L, result.totalScreenTimeMs)
        assertEquals(5_000L, result.perAppDurationsMs["com.example.live"])
        assertEquals("com.example.live", result.currentlyForegroundPackage)
        assertTrue(result.isCurrentlyInteractive)
    }

    @Test
    fun totalScreenTime_includesLauncher_perAppExcludesLauncher() {
        val startOfDay = 10_000L
        val now = 20_000L

        val events = listOf(
            UsageEventRecord(UsageEventRecord.SCREEN_INTERACTIVE, 10_000L, "", ""),
            // In Launcher for 2s
            UsageEventRecord(UsageEventRecord.ACTIVITY_RESUMED, 10_000L, ownPackage, "com.raysi.launcher.ui.MainActivity"),
            UsageEventRecord(UsageEventRecord.ACTIVITY_PAUSED, 12_000L, ownPackage, "com.raysi.launcher.ui.MainActivity"),
            // In Note app for 3s
            UsageEventRecord(UsageEventRecord.ACTIVITY_RESUMED, 12_000L, "com.example.notes", "com.example.notes.Editor"),
            UsageEventRecord(UsageEventRecord.ACTIVITY_PAUSED, 15_000L, "com.example.notes", "com.example.notes.Editor"),
            UsageEventRecord(UsageEventRecord.SCREEN_NON_INTERACTIVE, 15_000L, "", "")
        )

        val result = UsageAggregationEngine.aggregate(events, startOfDay, now, ownPackage)

        // Total screen time includes launcher: 10_000 to 15_000 = 5_000L
        assertEquals(5_000L, result.totalScreenTimeMs)
        // Per-app duration excludes launcher
        assertFalse(result.perAppDurationsMs.containsKey(ownPackage))
        assertEquals(3_000L, result.perAppDurationsMs["com.example.notes"])
    }

    @Test
    fun unlocksCount_tracksKeyguardHidden() {
        val startOfDay = 10_000L
        val now = 20_000L

        val events = listOf(
            UsageEventRecord(UsageEventRecord.KEYGUARD_HIDDEN, 11_000L, "", ""),
            UsageEventRecord(UsageEventRecord.KEYGUARD_HIDDEN, 14_000L, "", ""),
            UsageEventRecord(UsageEventRecord.KEYGUARD_HIDDEN, 18_000L, "", "")
        )

        val result = UsageAggregationEngine.aggregate(events, startOfDay, now, ownPackage)

        assertEquals(3, result.unlockCount)
    }
}
