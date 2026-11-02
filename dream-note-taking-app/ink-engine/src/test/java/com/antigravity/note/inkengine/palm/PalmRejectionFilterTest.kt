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
}
