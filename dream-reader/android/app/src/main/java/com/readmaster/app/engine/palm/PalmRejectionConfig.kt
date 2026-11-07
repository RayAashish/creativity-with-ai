package com.readmaster.app.engine.palm

enum class InputMode {
    PEN_DRAWS_FINGERS_PAN_ZOOM, // Default Mode: Pen draws, fingers pan/zoom
    PEN_ONLY,                   // Mode: Pen only, finger input completely disabled
    PEN_AND_FINGER_DRAW,        // Mode: Both pen and finger can draw
    PEN_DRAWS_FINGER_ERASES     // Mode: Pen draws, single finger erases, 2 fingers pan/zoom
}

data class PalmRejectionConfig(
    val inputMode: InputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM,
    val isFingerEraserEnabled: Boolean = false,
    val graceWindowMs: Long = 350L,
    val palmTouchMajorThresholdPx: Float = 42f, // Contacts larger than this are classified as palm
    val edgeZoneMarginPx: Float = 36f,          // Touches originating near screen bezel
    val gestureDisambiguationWindowMs: Long = 35L,
    val debugOverlayEnabled: Boolean = false
)

enum class PointerStatus {
    ACCEPTED_STYLUS,
    ACCEPTED_GESTURE,
    ACCEPTED_FINGER_DRAW,
    ACCEPTED_FINGER_ERASER,
    REJECTED_PALM_SIZE,
    REJECTED_PALM_PEN_PRIORITY,
    REJECTED_PALM_GRACE_WINDOW,
    REJECTED_PALM_EDGE_ZONE,
    REJECTED_CANCELLED
}

data class PointerDebugInfo(
    val pointerId: Int,
    val toolType: Int,
    val x: Float,
    val y: Float,
    val touchMajor: Float,
    val touchMinor: Float,
    val status: PointerStatus,
    val timestamp: Long
)
