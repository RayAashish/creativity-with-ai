package com.antigravity.note.inkengine

import com.antigravity.note.inkengine.lasso.LassoMode
import com.antigravity.note.inkengine.lasso.LassoTool
import com.antigravity.note.inkengine.shape.RecognizedShape
import com.antigravity.note.inkengine.shape.ShapeRecognizer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

class ShapeAndLassoTest {

    private val recognizer = ShapeRecognizer()

    @Test
    fun testStraightLineRecognition() {
        val points = mutableListOf<ShapeRecognizer.Point>()
        for (i in 0..20) {
            points.add(ShapeRecognizer.Point(100f + i * 10f, 200f + i * 5f))
        }

        val result = recognizer.recognize(points)
        assertNotNull("Expected line to be recognized", result)
        assertTrue(result is RecognizedShape.Line)
        val line = result as RecognizedShape.Line
        assertEquals(100f, line.startX, 1f)
        assertEquals(300f, line.endX, 1f)
    }

    @Test
    fun testCircleRecognition() {
        val points = mutableListOf<ShapeRecognizer.Point>()
        val cx = 300f
        val cy = 300f
        val r = 100f
        val steps = 36
        for (i in 0..steps) {
            val angle = 2.0 * PI * i / steps
            // Add slight jitter (mimicking human hand)
            val jitter = if (i % 2 == 0) 2f else -2f
            val x = (cx + (r + jitter) * cos(angle)).toFloat()
            val y = (cy + (r + jitter) * sin(angle)).toFloat()
            points.add(ShapeRecognizer.Point(x, y))
        }

        val result = recognizer.recognize(points)
        assertNotNull("Expected circle to be recognized", result)
        assertTrue("Expected Circle, got $result", result is RecognizedShape.Circle)
        val circle = result as RecognizedShape.Circle
        assertEquals(cx, circle.centerX, 10f)
        assertEquals(cy, circle.centerY, 10f)
        assertEquals(r, circle.radius, 10f)
    }

    @Test
    fun testRectangleRecognition() {
        val points = mutableListOf<ShapeRecognizer.Point>()
        // Top edge
        for (i in 0..10) points.add(ShapeRecognizer.Point(100f + i * 20f, 100f))
        // Right edge
        for (i in 0..10) points.add(ShapeRecognizer.Point(300f, 100f + i * 15f))
        // Bottom edge
        for (i in 0..10) points.add(ShapeRecognizer.Point(300f - i * 20f, 250f))
        // Left edge back to start
        for (i in 0..10) points.add(ShapeRecognizer.Point(100f, 250f - i * 15f))

        val result = recognizer.recognize(points)
        assertNotNull("Expected rectangle to be recognized", result)
        assertTrue("Expected Rectangle, got $result", result is RecognizedShape.Rectangle)
        val rect = result as RecognizedShape.Rectangle
        assertEquals(100f, rect.left, 5f)
        assertEquals(300f, rect.right, 5f)
        assertEquals(100f, rect.top, 5f)
        assertEquals(250f, rect.bottom, 5f)
    }

    @Test
    fun testLassoSelectionLifecycle() {
        val lasso = LassoTool()
        assertEquals(LassoMode.IDLE, lasso.mode)

        lasso.startLasso(50f, 50f)
        assertEquals(LassoMode.SELECTING, lasso.mode)

        lasso.continueLasso(200f, 50f)
        lasso.continueLasso(200f, 200f)
        lasso.continueLasso(50f, 200f)

        // Finish lasso with empty stroke list
        val selected = lasso.finishLasso(emptyList())
        assertEquals(false, selected)
        assertEquals(LassoMode.IDLE, lasso.mode)
    }

    @Test
    fun testLassoTransformDecouplingAndOverlayMatrix() {
        val lasso = LassoTool()
        assertFalse(lasso.isTransformGestureActive)

        // Start transform gesture on BODY via helper
        val bounds = android.graphics.RectF(100f, 100f, 300f, 300f)
        lasso.setTransformStateForTesting(bounds, com.antigravity.note.inkengine.lasso.TransformHandle.BODY)
        assertTrue(lasso.isTransformGestureActive)

        // Drag by +50, +30 (center is 200, 200 -> move to 250, 230)
        var matrixChangeCount = 0
        lasso.onOverlayMatrixChanged = { matrixChangeCount++ }
        lasso.continueLasso(250f, 230f)

        // Verify accumulated deltas and callback notification without mutating stroke coordinates
        assertEquals(50f, lasso.accumulatedDeltaX, 0.001f) // 250 - 200 = 50
        assertEquals(30f, lasso.accumulatedDeltaY, 0.001f) // 230 - 200 = 30
        assertTrue("onOverlayMatrixChanged must be invoked", matrixChangeCount > 0)

        // Finish transform
        lasso.finishTransform()
        assertFalse(lasso.isTransformGestureActive)
    }
}
