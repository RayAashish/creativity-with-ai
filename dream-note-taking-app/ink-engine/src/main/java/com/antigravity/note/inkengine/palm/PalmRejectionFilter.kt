package com.antigravity.note.inkengine.palm

import android.os.SystemClock
import android.view.MotionEvent

/**
 * Multi-layer Palm Rejection Filter:
 * Layer 1: Stylus Priority & Hysteresis Grace Window (default 350 ms).
 * Layer 2: System Cancellation (ACTION_CANCEL / FLAG_CANCELED).
 * Layer 3: Contact Geometry (TOUCH_MAJOR) & Bezel Edge Zone Detection.
 * Layer 4: Independent Pointer Tracking by pointerId.
 */
class PalmRejectionFilter(
    var config: PalmRejectionConfig = PalmRejectionConfig()
) {
    var isStylusDown = false
        private set
    var isStylusHovering = false
        private set
    var lastStylusLiftTimeMs = 0L
        private set

    // Active pointer classifications by pointerId
    private val pointerClassifications = HashMap<Int, PointerStatus>()
    private val pointerOriginX = HashMap<Int, Float>()
    private val pointerOriginY = HashMap<Int, Float>()

    // Pre-allocated list for debug overlay drawing
    val activePointersDebug = mutableListOf<PointerDebugInfo>()

    // Statistics
    var totalPointersSeen = 0L
        private set
    var palmsRejectedCount = 0L
        private set
    var stylusStrokesAcceptedCount = 0L
        private set
    var systemCancelsHandledCount = 0L
        private set

    /**
     * Process generic hover events to track stylus proximity before pen-down.
     */
    fun onHoverEvent(event: MotionEvent) {
        val action = event.actionMasked
        for (i in 0 until event.pointerCount) {
            val toolType = event.getToolType(i)
            if (toolType == MotionEvent.TOOL_TYPE_STYLUS || toolType == MotionEvent.TOOL_TYPE_ERASER) {
                when (action) {
                    MotionEvent.ACTION_HOVER_ENTER, MotionEvent.ACTION_HOVER_MOVE -> {
                        isStylusHovering = true
                        lastStylusLiftTimeMs = event.eventTime
                    }
                    MotionEvent.ACTION_HOVER_EXIT -> {
                        isStylusHovering = false
                        lastStylusLiftTimeMs = event.eventTime
                    }
                }
            }
        }
    }

    sealed class FilteredResult {
        data class StylusAction(val pointerIndex: Int, val isEraser: Boolean) : FilteredResult()
        data class FingerEraser(val pointerIndex: Int) : FilteredResult()
        data class MultiFingerGesture(val pointerCount: Int) : FilteredResult()
        data class CancelStroke(val pointerIndex: Int) : FilteredResult()
        object RejectedPalm : FilteredResult()
        object Ignore : FilteredResult()
    }

    /**
     * Inspect incoming MotionEvent and classify each pointer.
     */
    fun evaluatePointer(event: MotionEvent, pointerIndex: Int, surfaceWidth: Float, surfaceHeight: Float): FilteredResult {
        val pointerId = event.getPointerId(pointerIndex)
        val toolType = event.getToolType(pointerIndex)
        val action = event.actionMasked
        val now = event.eventTime
        val x = event.getX(pointerIndex)
        val y = event.getY(pointerIndex)
        val touchMajor = event.getTouchMajor(pointerIndex)
        val touchMinor = event.getTouchMinor(pointerIndex)

        totalPointersSeen++

        // Handle System Cancellation (Layer 2)
        if (action == MotionEvent.ACTION_CANCEL || (event.flags and MotionEvent.FLAG_CANCELED) != 0) {
            systemCancelsHandledCount++
            pointerClassifications.put(pointerId, PointerStatus.REJECTED_CANCELLED)
            updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.REJECTED_CANCELLED, now)
            if (toolType == MotionEvent.TOOL_TYPE_STYLUS || toolType == MotionEvent.TOOL_TYPE_ERASER) {
                isStylusDown = false
                lastStylusLiftTimeMs = now
            }
            return FilteredResult.CancelStroke(pointerIndex)
        }

        // --- STYLUS / ERASER HANDLING ---
        if (toolType == MotionEvent.TOOL_TYPE_STYLUS || toolType == MotionEvent.TOOL_TYPE_ERASER) {
            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    isStylusDown = true
                    lastStylusLiftTimeMs = now
                    stylusStrokesAcceptedCount++
                    pointerClassifications.put(pointerId, PointerStatus.ACCEPTED_STYLUS)
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    isStylusDown = false
                    lastStylusLiftTimeMs = now
                    pointerClassifications.remove(pointerId)
                }
                MotionEvent.ACTION_MOVE -> {
                    isStylusDown = true
                    lastStylusLiftTimeMs = now
                }
            }

            val isEraser = toolType == MotionEvent.TOOL_TYPE_ERASER
            updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.ACCEPTED_STYLUS, now)
            return FilteredResult.StylusAction(pointerIndex, isEraser)
        }

        // Clean up pointer origin tracking on lift
        if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP) {
            pointerClassifications.remove(pointerId)
            pointerOriginX.remove(pointerId)
            pointerOriginY.remove(pointerId)
        }

        // PRIORITY CHECK: Multi-finger gestures (2-finger scroll, pan, pinch-zoom, 2-finger tap)
        // If 2 or more fingers are touching the screen and stylus is not actively pressed down,
        // this is definitively a navigation gesture. It must NEVER be blocked by:
        // - Stylus hover signals (e.g. holding stylus in hand while scrolling)
        // - Single-finger grace window / hysteresis
        // - Contact size (touchMajor) or edge zone margins
        // - PEN_ONLY mode (users still expect 2-finger pan/zoom in pen-only drawing mode)
        if (event.pointerCount >= 2 && !isStylusDown) {
            pointerClassifications.put(pointerId, PointerStatus.ACCEPTED_GESTURE)
            updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.ACCEPTED_GESTURE, now)
            return FilteredResult.MultiFingerGesture(event.pointerCount)
        }

        if (config.inputMode == InputMode.PEN_ONLY) {
            palmsRejectedCount++
            pointerClassifications.put(pointerId, PointerStatus.REJECTED_PALM_PEN_PRIORITY)
            updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.REJECTED_PALM_PEN_PRIORITY, now)
            return FilteredResult.RejectedPalm
        }

        // Layer 1: Stylus Priority - ignore single touches if pen is down or hovering
        if (isStylusDown || isStylusHovering) {
            palmsRejectedCount++
            pointerClassifications.put(pointerId, PointerStatus.REJECTED_PALM_PEN_PRIORITY)
            updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.REJECTED_PALM_PEN_PRIORITY, now)
            return FilteredResult.RejectedPalm
        }

        // Layer 1: Hysteresis Grace Window after pen lift (applies only to single-finger palm touches)
        val timeSinceLift = now - lastStylusLiftTimeMs
        if (timeSinceLift < config.graceWindowMs) {
            palmsRejectedCount++
            pointerClassifications.put(pointerId, PointerStatus.REJECTED_PALM_GRACE_WINDOW)
            updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.REJECTED_PALM_GRACE_WINDOW, now)
            return FilteredResult.RejectedPalm
        }

        // Layer 3: Contact Size Heuristics (touchMajor > threshold)
        if (touchMajor > config.palmTouchMajorThresholdPx) {
            palmsRejectedCount++
            pointerClassifications.put(pointerId, PointerStatus.REJECTED_PALM_SIZE)
            updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.REJECTED_PALM_SIZE, now)
            return FilteredResult.RejectedPalm
        }

        // Layer 3: Bezel / Perimeter Edge Zone Rejection on initial contact
        if (config.isEdgeRejectionEnabled && (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_POINTER_DOWN)) {
            val sideMargin = config.sideEdgeZoneMarginPx.coerceAtLeast(config.edgeZoneMarginPx)
            val bottomMargin = config.bottomEdgeZoneMarginPx.coerceAtLeast(config.edgeZoneMarginPx)
            val isNearEdge = x < sideMargin ||
                    x > (surfaceWidth - sideMargin) ||
                    y < config.edgeZoneMarginPx ||
                    y > (surfaceHeight - bottomMargin)

            if (isNearEdge) {
                palmsRejectedCount++
                pointerClassifications.put(pointerId, PointerStatus.REJECTED_PALM_EDGE_ZONE)
                updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.REJECTED_PALM_EDGE_ZONE, now)
                return FilteredResult.RejectedPalm
            }

            pointerOriginX.put(pointerId, x)
            pointerOriginY.put(pointerId, y)
        }

        // Gesture vs Drawing vs Finger Eraser Mode
        val isFingerEraserActive = config.isFingerEraserEnabled || config.inputMode == InputMode.PEN_DRAWS_FINGER_ERASES

        if (isFingerEraserActive) {
            // Authentic single fingertip contact for eraser (palm already rejected by size, edge, pen priority, & grace window)
            pointerClassifications.put(pointerId, PointerStatus.ACCEPTED_FINGER_ERASER)
            updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.ACCEPTED_FINGER_ERASER, now)
            return FilteredResult.FingerEraser(pointerIndex)
        }

        if (config.inputMode == InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM) {
            // In Mode A, fingers are reserved for multi-touch gestures (pan, pinch-zoom, 2-finger tap undo)
            pointerClassifications.put(pointerId, PointerStatus.ACCEPTED_GESTURE)
            updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.ACCEPTED_GESTURE, now)
            return FilteredResult.MultiFingerGesture(event.pointerCount)
        }

        // Mode C: Pen and finger both draw
        pointerClassifications.put(pointerId, PointerStatus.ACCEPTED_FINGER_DRAW)
        updateDebugInfo(pointerId, toolType, x, y, touchMajor, touchMinor, PointerStatus.ACCEPTED_FINGER_DRAW, now)
        return FilteredResult.StylusAction(pointerIndex, isEraser = false)
    }

    private fun updateDebugInfo(
        pointerId: Int,
        toolType: Int,
        x: Float,
        y: Float,
        major: Float,
        minor: Float,
        status: PointerStatus,
        time: Long
    ) {
        if (!config.debugOverlayEnabled) return
        activePointersDebug.removeAll { it.pointerId == pointerId }
        activePointersDebug.add(
            PointerDebugInfo(pointerId, toolType, x, y, major, minor, status, time)
        )
        // Keep list bounded
        if (activePointersDebug.size > 16) {
            activePointersDebug.removeAt(0)
        }
    }

    fun clearDebug() {
        activePointersDebug.clear()
    }
}
