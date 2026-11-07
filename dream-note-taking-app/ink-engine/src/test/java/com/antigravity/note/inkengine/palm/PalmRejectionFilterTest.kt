package com.antigravity.note.inkengine.palm

import android.view.MotionEvent
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock

class PalmRejectionFilterTest {

    private lateinit var filter: PalmRejectionFilter

    @Before
    fun setUp() {
        filter = PalmRejectionFilter(
            PalmRejectionConfig(
                inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM,
                graceWindowMs = 350L,
                palmTouchMajorThresholdPx = 40f,
                edgeZoneMarginPx = 30f
            )
        )
    }

    private fun createMockEvent(
        action: Int,
        toolType: Int,
        x: Float,
        y: Float,
        touchMajor: Float = 10f,
        eventTime: Long = 1000L,
        pointerCount: Int = 1
    ): MotionEvent {
        val event = mock(MotionEvent::class.java)
        `when`(event.actionMasked).thenReturn(action)
        `when`(event.pointerCount).thenReturn(pointerCount)
        `when`(event.actionIndex).thenReturn(0)
        `when`(event.getPointerId(0)).thenReturn(0)
        `when`(event.getToolType(0)).thenReturn(toolType)
        `when`(event.getX(0)).thenReturn(x)
        `when`(event.getY(0)).thenReturn(y)
        `when`(event.getTouchMajor(0)).thenReturn(touchMajor)
        `when`(event.getTouchMinor(0)).thenReturn(touchMajor * 0.8f)
        `when`(event.eventTime).thenReturn(eventTime)
        `when`(event.flags).thenReturn(0)
        return event
    }

    @Test
    fun testStylusAcceptedImmediately() {
        val penEvent = createMockEvent(
            action = MotionEvent.ACTION_DOWN,
            toolType = MotionEvent.TOOL_TYPE_STYLUS,
            x = 200f,
            y = 300f,
            eventTime = 1000L
        )

        val result = filter.evaluatePointer(penEvent, 0, 2190f, 3504f)
        assertTrue(result is PalmRejectionFilter.FilteredResult.StylusAction)
        assertTrue(filter.isStylusDown)
        assertEquals(1L, filter.stylusStrokesAcceptedCount)
    }

    @Test
    fun testPalmRejectedWhileStylusIsDown() {
        // Pen goes down at t=1000ms
        val penDown = createMockEvent(MotionEvent.ACTION_DOWN, MotionEvent.TOOL_TYPE_STYLUS, 200f, 300f, eventTime = 1000L)
        filter.evaluatePointer(penDown, 0, 2190f, 3504f)

        // Palm touches screen at t=1050ms while pen is still down
        val palmEvent = createMockEvent(MotionEvent.ACTION_DOWN, MotionEvent.TOOL_TYPE_FINGER, 600f, 800f, eventTime = 1050L)
        val result = filter.evaluatePointer(palmEvent, 0, 2190f, 3504f)

        assertEquals(PalmRejectionFilter.FilteredResult.RejectedPalm, result)
        assertEquals(1L, filter.palmsRejectedCount)
    }

    @Test
    fun testPalmRejectedWithinHysteresisGraceWindow() {
        // Pen lifts at t=1000ms
        val penUp = createMockEvent(MotionEvent.ACTION_UP, MotionEvent.TOOL_TYPE_STYLUS, 200f, 300f, eventTime = 1000L)
        filter.evaluatePointer(penUp, 0, 2190f, 3504f)

        // Resting palm moves at t=1200ms (200ms < 350ms grace window)
        val palmMove = createMockEvent(MotionEvent.ACTION_MOVE, MotionEvent.TOOL_TYPE_FINGER, 600f, 800f, eventTime = 1200L)
        val result = filter.evaluatePointer(palmMove, 0, 2190f, 3504f)

        assertEquals(PalmRejectionFilter.FilteredResult.RejectedPalm, result)
        assertEquals(1L, filter.palmsRejectedCount)
    }

    @Test
    fun testPalmRejectedByLargeContactArea() {
        // Pen lifted 10 seconds ago (outside grace window)
        val penUp = createMockEvent(MotionEvent.ACTION_UP, MotionEvent.TOOL_TYPE_STYLUS, 200f, 300f, eventTime = 1000L)
        filter.evaluatePointer(penUp, 0, 2190f, 3504f)

        // Large fleshy palm contact (touchMajor = 55px > 40px threshold)
        val largeContact = createMockEvent(
            action = MotionEvent.ACTION_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 400f,
            y = 500f,
            touchMajor = 55f,
            eventTime = 15000L
        )

        val result = filter.evaluatePointer(largeContact, 0, 2190f, 3504f)
        assertEquals(PalmRejectionFilter.FilteredResult.RejectedPalm, result)
        assertEquals(1L, filter.palmsRejectedCount)
    }

    @Test
    fun testPalmRejectedAtBezelEdgeZone() {
        // Touch starting at x=15px (< 30px edge margin)
        val edgeContact = createMockEvent(
            action = MotionEvent.ACTION_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 15f,
            y = 600f,
            touchMajor = 15f,
            eventTime = 20000L
        )

        val result = filter.evaluatePointer(edgeContact, 0, 2190f, 3504f)
        assertEquals(PalmRejectionFilter.FilteredResult.RejectedPalm, result)
    }

    @Test
    fun testSystemCancelHandling() {
        val cancelEvent = createMockEvent(
            action = MotionEvent.ACTION_CANCEL,
            toolType = MotionEvent.TOOL_TYPE_STYLUS,
            x = 200f,
            y = 300f,
            eventTime = 2000L
        )

        val result = filter.evaluatePointer(cancelEvent, 0, 2190f, 3504f)
        assertTrue(result is PalmRejectionFilter.FilteredResult.CancelStroke)
        assertEquals(1L, filter.systemCancelsHandledCount)
    }

    @Test
    fun testPenOnlyModeRejectsAllFingers() {
        filter.config = filter.config.copy(inputMode = InputMode.PEN_ONLY)
        val finger = createMockEvent(
            action = MotionEvent.ACTION_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 500f,
            y = 500f,
            touchMajor = 10f,
            eventTime = 30000L
        )
        val result = filter.evaluatePointer(finger, 0, 2190f, 3504f)
        assertEquals(PalmRejectionFilter.FilteredResult.RejectedPalm, result)
    }

    @Test
    fun testFingerEraserAcceptedWhenSingleFingerTip() {
        filter.config = filter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGER_ERASES)
        val finger = createMockEvent(
            action = MotionEvent.ACTION_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 500f,
            y = 500f,
            touchMajor = 16f,
            eventTime = 30000L,
            pointerCount = 1
        )
        val result = filter.evaluatePointer(finger, 0, 2190f, 3504f)
        assertTrue(result is PalmRejectionFilter.FilteredResult.FingerEraser)
    }

    @Test
    fun testPalmRejectedInFingerEraserModeDueToSize() {
        filter.config = filter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGER_ERASES)
        // Large resting palm (touchMajor = 58px > 40px threshold)
        val palm = createMockEvent(
            action = MotionEvent.ACTION_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 500f,
            y = 500f,
            touchMajor = 58f,
            eventTime = 30000L,
            pointerCount = 1
        )
        val result = filter.evaluatePointer(palm, 0, 2190f, 3504f)
        assertEquals(PalmRejectionFilter.FilteredResult.RejectedPalm, result)
        assertEquals(1L, filter.palmsRejectedCount)
    }

    @Test
    fun testPalmRejectedInFingerEraserModeWhileStylusDown() {
        filter.config = filter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGER_ERASES)
        // Pen is writing on screen
        val penDown = createMockEvent(MotionEvent.ACTION_DOWN, MotionEvent.TOOL_TYPE_STYLUS, 200f, 300f, eventTime = 1000L)
        filter.evaluatePointer(penDown, 0, 2190f, 3504f)

        // Palm rests on screen while pen is down
        val palm = createMockEvent(MotionEvent.ACTION_DOWN, MotionEvent.TOOL_TYPE_FINGER, 600f, 700f, touchMajor = 18f, eventTime = 1050L)
        val result = filter.evaluatePointer(palm, 0, 2190f, 3504f)
        assertEquals(PalmRejectionFilter.FilteredResult.RejectedPalm, result)
        assertEquals(1L, filter.palmsRejectedCount)
    }

    @Test
    fun testPalmRejectedInFingerEraserModeWithinGraceWindow() {
        filter.config = filter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGER_ERASES)
        // Pen lifts
        val penUp = createMockEvent(MotionEvent.ACTION_UP, MotionEvent.TOOL_TYPE_STYLUS, 200f, 300f, eventTime = 1000L)
        filter.evaluatePointer(penUp, 0, 2190f, 3504f)

        // Palm contact 150ms after lift (< 350ms grace window)
        val palm = createMockEvent(MotionEvent.ACTION_MOVE, MotionEvent.TOOL_TYPE_FINGER, 600f, 700f, touchMajor = 18f, eventTime = 1150L)
        val result = filter.evaluatePointer(palm, 0, 2190f, 3504f)
        assertEquals(PalmRejectionFilter.FilteredResult.RejectedPalm, result)
    }

    @Test
    fun testMultiFingerInFingerEraserModePansAndZooms() {
        filter.config = filter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGER_ERASES)
        // 2 fingers on screen
        val twoFingers = createMockEvent(
            action = MotionEvent.ACTION_POINTER_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 400f,
            y = 500f,
            touchMajor = 15f,
            eventTime = 40000L,
            pointerCount = 2
        )
        val result = filter.evaluatePointer(twoFingers, 0, 2190f, 3504f)
        assertTrue(result is PalmRejectionFilter.FilteredResult.MultiFingerGesture)
    }

    @Test
    fun testFingerEraserDisabledByDefaultOrModeA() {
        filter.config = filter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM, isFingerEraserEnabled = false)
        val finger = createMockEvent(
            action = MotionEvent.ACTION_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 500f,
            y = 500f,
            touchMajor = 15f,
            eventTime = 50000L,
            pointerCount = 1
        )
        val result = filter.evaluatePointer(finger, 0, 2190f, 3504f)
        assertTrue(result is PalmRejectionFilter.FilteredResult.MultiFingerGesture)
    }

    @Test
    fun testFingerEraserConcurrentWithPenAndGestures() {
        // Mode A with Finger Eraser toggled ON
        filter.config = filter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM, isFingerEraserEnabled = true)

        // 1. Stylus writes normally
        val pen = createMockEvent(MotionEvent.ACTION_DOWN, MotionEvent.TOOL_TYPE_STYLUS, 200f, 300f, eventTime = 60000L)
        val penResult = filter.evaluatePointer(pen, 0, 2190f, 3504f)
        assertTrue(penResult is PalmRejectionFilter.FilteredResult.StylusAction)

        // Lift pen
        val penUp = createMockEvent(MotionEvent.ACTION_UP, MotionEvent.TOOL_TYPE_STYLUS, 200f, 300f, eventTime = 60100L)
        filter.evaluatePointer(penUp, 0, 2190f, 3504f)

        // Advance beyond grace window
        val afterGrace = 60100L + filter.config.graceWindowMs + 10L

        // 2. Multi-touch gesture (2 fingers) pans/zooms
        val twoFingers = createMockEvent(
            action = MotionEvent.ACTION_POINTER_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 400f,
            y = 500f,
            touchMajor = 15f,
            eventTime = afterGrace,
            pointerCount = 2
        )
        val gestureResult = filter.evaluatePointer(twoFingers, 0, 2190f, 3504f)
        assertTrue(gestureResult is PalmRejectionFilter.FilteredResult.MultiFingerGesture)

        // 3. Single fingertip contact acts as Finger Eraser
        val singleFinger = createMockEvent(
            action = MotionEvent.ACTION_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 500f,
            y = 500f,
            touchMajor = 18f,
            eventTime = afterGrace + 500L,
            pointerCount = 1
        )
        val eraserResult = filter.evaluatePointer(singleFinger, 0, 2190f, 3504f)
        assertTrue(eraserResult is PalmRejectionFilter.FilteredResult.FingerEraser)

        // 4. Large palm touch is rejected
        val palm = createMockEvent(
            action = MotionEvent.ACTION_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 700f,
            y = 800f,
            touchMajor = 55f, // > 42px threshold
            eventTime = afterGrace + 1000L,
            pointerCount = 1
        )
        val palmResult = filter.evaluatePointer(palm, 0, 2190f, 3504f)
        assertEquals(PalmRejectionFilter.FilteredResult.RejectedPalm, palmResult)
    }

    @Test
    fun testTwoFingerScrollAcceptedImmediatelyEvenWithinGraceWindow() {
        // Pen lifts at t=1000ms
        val penUp = createMockEvent(MotionEvent.ACTION_UP, MotionEvent.TOOL_TYPE_STYLUS, 200f, 300f, eventTime = 1000L)
        filter.evaluatePointer(penUp, 0, 2190f, 3504f)

        // User immediately starts 2-finger scroll at t=1100ms (100ms < 350ms grace window)
        val twoFingerScroll = createMockEvent(
            action = MotionEvent.ACTION_POINTER_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 450f,
            y = 600f,
            touchMajor = 15f,
            eventTime = 1100L,
            pointerCount = 2
        )
        val result = filter.evaluatePointer(twoFingerScroll, 0, 2190f, 3504f)
        assertTrue(result is PalmRejectionFilter.FilteredResult.MultiFingerGesture)
    }

    @Test
    fun testTwoFingerScrollAcceptedEvenWithLargeContactArea() {
        // Flat fingers placed on screen (touchMajor = 50px > 40px palm threshold)
        val twoFingerScroll = createMockEvent(
            action = MotionEvent.ACTION_MOVE,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 450f,
            y = 600f,
            touchMajor = 50f,
            eventTime = 5000L,
            pointerCount = 2
        )
        val result = filter.evaluatePointer(twoFingerScroll, 0, 2190f, 3504f)
        assertTrue(result is PalmRejectionFilter.FilteredResult.MultiFingerGesture)
    }

    @Test
    fun testTwoFingerScrollAcceptedEvenNearBezelEdge() {
        // One finger lands at x=10px near bezel margin (< 30px margin)
        val edgeScroll = createMockEvent(
            action = MotionEvent.ACTION_POINTER_DOWN,
            toolType = MotionEvent.TOOL_TYPE_FINGER,
            x = 10f,
            y = 600f,
            touchMajor = 15f,
            eventTime = 8000L,
            pointerCount = 2
        )
        val result = filter.evaluatePointer(edgeScroll, 0, 2190f, 3504f)
        assertTrue(result is PalmRejectionFilter.FilteredResult.MultiFingerGesture)
    }
}
