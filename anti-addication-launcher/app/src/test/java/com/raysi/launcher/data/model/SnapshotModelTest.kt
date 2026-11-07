// app/src/test/java/com/raysi/launcher/data/model/SnapshotModelTest.kt
package com.raysi.launcher.data.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SnapshotModelTest {

    @Test
    fun defaultSnapshot_hasExpectedDefaults() {
        val defaultSnapshot = LauncherSettingsSnapshot.DEFAULT
        assertEquals(10, defaultSnapshot.gateDelaySeconds)
        assertEquals(10, defaultSnapshot.sessionDurationMinutes)
        assertEquals(2, defaultSnapshot.maxExtensionsAllowed)
        assertTrue(defaultSnapshot.screenTimeIncludesLauncher)
        assertEquals(listOf(12, 18, 21), defaultSnapshot.digestHours)
        assertTrue(defaultSnapshot.distractingPackages.isEmpty())
        assertTrue(defaultSnapshot.neverBlockPackages.isEmpty())
        assertTrue(defaultSnapshot.alwaysAllowPackages.isEmpty())
        assertTrue(defaultSnapshot.pinnedApps.isEmpty())
        assertTrue(defaultSnapshot.activeSessions.isEmpty())
    }

    @Test
    fun pinnedAppEntry_and_activeSessionEntry_modelsAreImmutable() {
        val pin = PinnedAppEntry(
            componentName = "com.android.settings/.Settings",
            userSerialNumber = 0L,
            customLabel = "Settings",
            displayOrder = 0
        )
        assertEquals("Settings", pin.customLabel)

        val session = ActiveSessionEntry(
            packageName = "com.distracting.app",
            startElapsedRealtime = 1000L,
            endWallClockMs = 601000L,
            endElapsedRealtime = 601000L,
            extensionCount = 0
        )
        assertEquals("com.distracting.app", session.packageName)
        assertEquals(0, session.extensionCount)
    }
}
