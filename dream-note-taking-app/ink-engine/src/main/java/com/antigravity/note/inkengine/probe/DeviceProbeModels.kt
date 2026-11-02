package com.antigravity.note.inkengine.probe

/**
 * Snapshot of display mode capabilities.
 */
data class DisplayModeInfo(
    val modeId: Int,
    val width: Int,
    val height: Int,
    val refreshRate: Float,
    val is144Hz: Boolean = refreshRate >= 143.5f,
    val isActive: Boolean = false
)

/**
 * Hardware stylus capabilities discovered via InputDevice motion ranges.
 */
data class StylusHardwareCapabilities(
    val deviceName: String,
    val deviceId: Int,
    val isExternal: Boolean,
    val supportsPressure: Boolean,
    val pressureMin: Float = 0f,
    val pressureMax: Float = 1f,
    val supportsTilt: Boolean,
    val supportsOrientation: Boolean,
    val supportsHoverDistance: Boolean,
    val supportsTouchMajor: Boolean,
    val likelyActiveStylus: Boolean,
    val reportedAxes: List<String>
)

/**
 * Real-time event telemetry received from MotionEvent.
 */
data class LivePointerTelemetry(
    val pointerId: Int = 0,
    val toolType: String = "None",
    val isStylus: Boolean = false,
    val isEraser: Boolean = false,
    val isFinger: Boolean = false,
    val action: String = "IDLE",
    val x: Float = 0f,
    val y: Float = 0f,
    val pressure: Float = 0f,
    val tiltDegrees: Float = 0f,
    val orientationDegrees: Float = 0f,
    val distance: Float = 0f,
    val isHovering: Boolean = false,
    val isPrimaryButtonPressed: Boolean = false,
    val isSecondaryButtonPressed: Boolean = false,
    val isEraserButtonPressed: Boolean = false,
    val historySize: Int = 0,
    val touchMajor: Float = 0f,
    val touchMinor: Float = 0f,
    val estimatedSamplingRateHz: Int = 0,
    val dispatchLatencyMs: Float = 0f,
    val timestampNanos: Long = 0L
)

/**
 * Overall probe state for UI observation.
 */
data class DeviceProbeState(
    val activeRefreshRate: Float = 60f,
    val is144HzActive: Boolean = false,
    val displayWidth: Int = 0,
    val displayHeight: Int = 0,
    val supportedModes: List<DisplayModeInfo> = emptyList(),
    val stylusHardware: StylusHardwareCapabilities? = null,
    val liveTelemetry: LivePointerTelemetry = LivePointerTelemetry(),
    val maxHistoryBatchSizeObserved: Int = 0,
    val minPressureObserved: Float = 1f,
    val maxPressureObserved: Float = 0f,
    val eventCount: Long = 0L,
    val palmTouchDetectedCount: Long = 0L
)
