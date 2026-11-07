// app/src/test/java/com/raysi/launcher/data/proto/LauncherSettingsSerializerTest.kt
package com.raysi.launcher.data.proto

import androidx.datastore.core.CorruptionException
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

class LauncherSettingsSerializerTest {

    @Test
    fun defaultValue_hasRequiredSpecifications() {
        val defaultProto = LauncherSettingsSerializer.defaultValue
        assertEquals(10, defaultProto.gateDelaySeconds)
        assertEquals(10, defaultProto.sessionDurationMinutes)
        assertEquals(2, defaultProto.maxExtensionsAllowed)
        assertTrue(defaultProto.screenTimeIncludesLauncher)
        assertEquals(listOf(12, 18, 21), defaultProto.digestHoursList)
        assertTrue(defaultProto.distractingPackagesList.isEmpty())
        assertTrue(defaultProto.neverBlockPackagesList.isEmpty())
        assertTrue(defaultProto.alwaysAllowPackagesList.isEmpty())
        assertTrue(defaultProto.pinnedAppsList.isEmpty())
        assertTrue(defaultProto.activeSessionsList.isEmpty())
    }

    @Test
    fun roundTripSerialization_preservesFields() = runTest {
        val original = LauncherSettingsProto.newBuilder()
            .setGateDelaySeconds(15)
            .setSessionDurationMinutes(5)
            .setMaxExtensionsAllowed(2)
            .setScreenTimeIncludesLauncher(false)
            .addAllDigestHours(listOf(10, 14, 20))
            .addDistractingPackages("com.example.distracting")
            .addNeverBlockPackages("com.example.work")
            .addAlwaysAllowPackages("com.example.messaging")
            .addPinnedApps(
                PinnedAppProto.newBuilder()
                    .setComponentName("com.example.phone/.Dialer")
                    .setUserSerialNumber(0L)
                    .setCustomLabel("Calls")
                    .setDisplayOrder(0)
                    .build()
            )
            .addActiveSessions(
                ActiveSessionProto.newBuilder()
                    .setPackageName("com.example.browser")
                    .setStartElapsedRealtime(1000L)
                    .setEndWallClockMs(2000L)
                    .setEndElapsedRealtime(2000L)
                    .setExtensionCount(1)
                    .build()
            )
            .build()

        val output = ByteArrayOutputStream()
        LauncherSettingsSerializer.writeTo(original, output)

        val input = ByteArrayInputStream(output.toByteArray())
        val parsed = LauncherSettingsSerializer.readFrom(input)

        assertEquals(original, parsed)
    }

    @Test(expected = CorruptionException::class)
    fun corruptStream_throwsCorruptionException() = runTest {
        val corruptBytes = byteArrayOf(0x01, 0x02, 0x03, 0x04)
        val input = ByteArrayInputStream(corruptBytes)
        LauncherSettingsSerializer.readFrom(input)
    }
}
