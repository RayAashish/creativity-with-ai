package com.antigravity.note.inkengine.eraser

import androidx.ink.brush.InputToolType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.cos
import kotlin.math.sin

class PrecisionEraserTest {

    private fun createHorizontalLinePoints(x1: Float, x2: Float, y: Float, pointCount: Int = 50): List<PrecisionEraser.CutPoint> {
        val list = mutableListOf<PrecisionEraser.CutPoint>()
        for (i in 0 until pointCount) {
            val t = i.toFloat() / (pointCount - 1)
            val x = x1 + t * (x2 - x1)
            list.add(
                PrecisionEraser.CutPoint(
                    toolType = InputToolType.STYLUS,
                    x = x,
                    y = y,
                    elapsedTimeMillis = 1000L + (i * 10L),
                    strokeUnitLengthCm = 0f,
                    pressure = 0.5f,
                    tiltRadians = 0f,
                    orientationRadians = 0f
                )
            )
        }
        return list
    }

    private fun createCirclePoints(cx: Float, cy: Float, radius: Float, pointCount: Int = 100): List<PrecisionEraser.CutPoint> {
        val list = mutableListOf<PrecisionEraser.CutPoint>()
        for (i in 0 until pointCount) {
            val theta = (i.toFloat() / pointCount) * 2f * Math.PI.toFloat()
            val x = cx + radius * cos(theta)
            val y = cy + radius * sin(theta)
            list.add(
                PrecisionEraser.CutPoint(
                    toolType = InputToolType.STYLUS,
                    x = x,
                    y = y,
                    elapsedTimeMillis = 1000L + (i * 10L),
                    strokeUnitLengthCm = 0f,
                    pressure = 0.5f,
                    tiltRadians = 0f,
                    orientationRadians = 0f
                )
            )
        }
        return list
    }

    @Test
    fun testErasingMiddleProducesExactlyTwoStrokes() {
        // Line from x=0 to x=200 at y=50.
        // Erase middle around x=100 with radius 20 (covers x=[80, 120]).
        val points = createHorizontalLinePoints(0f, 200f, 50f, 50)
        val result = PrecisionEraser.cutPolyline(points, 100f, 50f, 20f)

        assertEquals("Erasing middle must yield exactly 2 surviving sub-segments", 2, result.size)

        val s1 = result[0]
        val s2 = result[1]

        val xMax1 = s1.maxOf { it.x }
        val xMin2 = s2.minOf { it.x }

        // First stroke should end around x=80
        assertTrue("Sub-stroke 1 should end around x=80, got $xMax1", xMax1 <= 80.5f)
        // Second stroke should start around x=120
        assertTrue("Sub-stroke 2 should start around x=120, got $xMin2", xMin2 >= 119.5f)
    }

    @Test
    fun testErasingOnlyEndOfStrokeShortensIt() {
        // Line from x=0 to x=100 at y=50.
        // Erase end at x=100 with radius 20 (covers x=[80, 120]).
        val points = createHorizontalLinePoints(0f, 100f, 50f, 50)
        val result = PrecisionEraser.cutPolyline(points, 100f, 50f, 20f)

        assertEquals("Erasing only end must yield 1 shortened stroke", 1, result.size)

        val shortened = result[0]
        val xMin = shortened.minOf { it.x }
        val xMax = shortened.maxOf { it.x }
        assertTrue("Shortened stroke should end near x=80, got $xMax", xMax <= 80.5f)
        assertTrue("Shortened stroke should still start near x=0, got $xMin", xMin <= 0.5f)
    }

    @Test
    fun testErasingCircleAcrossDiameterProducesTwoDistinctArcs() {
        // Circle at (200, 200) with radius 80, starting at (280, 200).
        // Cutting at (120, 200) with radius 25 cuts through the left diameter vertex (midway through the stroke points).
        val circlePoints = createCirclePoints(200f, 200f, 80f, 120)
        val cut = PrecisionEraser.cutPolyline(circlePoints, 120f, 200f, 25f)

        assertEquals("Cutting across diameter of circle splits it into two distinct arcs", 2, cut.size)

        val arc1 = cut[0]
        val arc2 = cut[1]

        val yMax1 = arc1.maxOf { it.y }
        val yMin2 = arc2.minOf { it.y }

        // Arc 1 should contain the bottom curve (y > 200)
        assertTrue("Arc 1 should be bottom half", yMax1 >= 270f)
        // Arc 2 should contain the top curve (y < 200)
        assertTrue("Arc 2 should be top half", yMin2 <= 130f)
    }

    @Test
    fun testSkimmingNearTangentDoesNotCreateMicroSegments() {
        // Line from x=0 to x=100 at y=50.
        // Eraser at y=75.05, radius 25 (tangent or misses)
        val points = createHorizontalLinePoints(0f, 100f, 50f, 50)
        val result = PrecisionEraser.cutPolyline(points, 50f, 75.05f, 25f)

        for (seg in result) {
            assertTrue("Residual strokes must have at least 2 points", seg.size >= 2)
        }
    }

    @Test
    fun testEntireStrokeInsideEraserCompletelyErased() {
        val points = createHorizontalLinePoints(40f, 60f, 50f, 20)
        val result = PrecisionEraser.cutPolyline(points, 50f, 50f, 30f)
        assertTrue("Entire stroke inside eraser must leave 0 surviving segments", result.isEmpty())
    }

    @Test
    fun testUndoRedoGestureScopingRestoresOriginalStrokes() {
        // Model 3 lines cut in a single continuous sweep
        val stroke1 = createHorizontalLinePoints(0f, 100f, 20f)
        val stroke2 = createHorizontalLinePoints(0f, 100f, 40f)
        val stroke3 = createHorizontalLinePoints(0f, 100f, 60f)

        val canvas = mutableListOf(stroke1, stroke2, stroke3)

        // Single continuous gesture cuts through x=50, radius=15 (hitting all 3 strokes)
        val touchedOriginals = mutableSetOf<List<PrecisionEraser.CutPoint>>()
        val survivingSubSegments = mutableListOf<List<PrecisionEraser.CutPoint>>()

        for (stroke in canvas.toList()) {
            val cut = PrecisionEraser.cutPolyline(stroke, 50f, stroke[0].y, 15f)
            if (cut.size > 1 || (cut.size == 1 && cut[0].size != stroke.size)) {
                touchedOriginals.add(stroke)
                canvas.remove(stroke)
                canvas.addAll(cut)
                survivingSubSegments.addAll(cut)
            }
        }

        assertEquals("Must have touched exactly 3 strokes", 3, touchedOriginals.size)
        assertEquals("Each cut in middle yields 2 segments -> total 6 segments", 6, survivingSubSegments.size)
        assertEquals("Canvas now holds 6 sub-segments", 6, canvas.size)

        // Undo operation: remove survivingSubSegments and restore touchedOriginals
        canvas.removeAll(survivingSubSegments)
        canvas.addAll(touchedOriginals)

        assertEquals("After undo, canvas has exactly 3 strokes", 3, canvas.size)
        assertTrue("Canvas contains original stroke 1 exactly", canvas.contains(stroke1))
        assertTrue("Canvas contains original stroke 2 exactly", canvas.contains(stroke2))
        assertTrue("Canvas contains original stroke 3 exactly", canvas.contains(stroke3))
    }

    @Test
    fun test500StrokeDenseDrawingBenchmarkUnderFrameBudget() {
        // 500 strokes in a 2000x2000 canvas
        val strokes = (0 until 500).map { i ->
            val y = (i * 4).toFloat()
            createHorizontalLinePoints(0f, 2000f, y, 20)
        }

        val startTime = System.nanoTime()
        // Simulate an eraser sweep through the middle (x=1000) for 10 consecutive frames
        var cutsCount = 0
        for (f in 0 until 10) {
            val ey = 100f + f * 50f
            // Filter candidates within bounding radius
            val candidates = strokes.filter { it[0].y in (ey - 25f)..(ey + 25f) }
            for (c in candidates) {
                val cut = PrecisionEraser.cutPolyline(c, 1000f, ey, 25f)
                if (cut.isNotEmpty()) cutsCount++
            }
        }
        val durationMs = (System.nanoTime() - startTime) / 1_000_000.0
        val perFrameMs = durationMs / 10.0

        println("Benchmark: 500 strokes, 10 erase sweep frames took $durationMs ms (avg $perFrameMs ms/frame)")
        assertTrue("Per-frame eraser processing must be well under 6.94 ms (144 Hz budget)", perFrameMs < 6.94)
    }
}
