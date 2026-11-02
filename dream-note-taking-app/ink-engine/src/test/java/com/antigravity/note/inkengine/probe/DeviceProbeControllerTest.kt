package com.antigravity.note.inkengine.probe

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.PI

class DeviceProbeModelsTest {

    @Test
    fun testDisplayModeInfo144HzDetection() {
        val mode60 = DisplayModeInfo(modeId = 1, width = 3504, height = 2190, refreshRate = 60.0f)
        val mode120 = DisplayModeInfo(modeId = 2, width = 3504, height = 2190, refreshRate = 120.0f)
        val mode144 = DisplayModeInfo(modeId = 3, width = 3504, height = 2190, refreshRate = 144.0f)

        assertFalse(mode60.is144Hz)
        assertFalse(mode120.is144Hz)
        assertTrue(mode144.is144Hz)
    }

    @Test
    fun testLivePointerTelemetryDefaultValues() {
        val telemetry = LivePointerTelemetry()
        assertEquals(0, telemetry.pointerId)
        assertEquals("None", telemetry.toolType)
        assertFalse(telemetry.isStylus)
        assertFalse(telemetry.isEraser)
        assertFalse(telemetry.isFinger)
        assertEquals(0f, telemetry.pressure, 0.001f)
        assertEquals(0, telemetry.historySize)
    }

    @Test
    fun testTiltAngleConversionMath() {
        val tiltRad = (PI / 4).toFloat() // 45 degrees
        val tiltDeg = Math.toDegrees(tiltRad.toDouble()).toFloat()
        assertEquals(45.0f, tiltDeg, 0.01f)
    }

    @Test
    fun testSamplingRateCalculation() {
        val historySize = 5
        val durationMs = 20L // 5 samples in 20 ms = 250 Hz
        val rate = ((historySize * 1000L) / durationMs).toInt()
        assertEquals(250, rate)
    }
}
