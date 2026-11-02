package com.antigravity.note.inkengine.palm

enum class InputMode {
    PEN_DRAWS_FINGERS_PAN_ZOOM, // Default Mode A: Pen draws, fingers pan/zoom
    PEN_ONLY,                   // Mode B: Pen only, finger input completely disabled
    PEN_AND_FINGER_DRAW         // Mode C: Both pen and finger can draw
}

data class PalmRejectionConfig(
    val inputMode: InputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM,
    val graceWindowMs: Long = 350L,
    val palmTouchMajorThresholdPx: Float = 42f, // Contacts larger than this are classified as palm
    val edgeZoneMarginPx: Float = 36f,          // Touches originating near screen bezel
    val gestureDisambiguationWindowMs: Long = 35L,
    val debugOverlayEnabled: Boolean = true
)

enum class PointerStatus {
    ACCEPTED_STYLUS,
    ACCEPTED_GESTURE,
    ACCEPTED_FINGER_DRAW,
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
