package com.readmaster.app.engine.eraser

import androidx.ink.brush.InputToolType
import androidx.ink.strokes.MutableStrokeInputBatch
import androidx.ink.strokes.Stroke
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * High-precision stroke cutting and boolean geometry for eraser.
 * Splits strokes into continuous sub-strokes around the eraser disc,
 * interpolating cut boundaries with proper pressure and tilt tapering.
 */
object PrecisionEraser {

    private const val MIN_STROKE_LENGTH_PX = 3.0f
    private const val MIN_STROKE_POINTS = 2

    data class CutPoint(
        val toolType: InputToolType,
        val x: Float,
        val y: Float,
        val elapsedTimeMillis: Long,
        val strokeUnitLengthCm: Float,
        val pressure: Float,
        val tiltRadians: Float,
        val orientationRadians: Float
    )

    data class CutResult(
        val wasCut: Boolean,
        val survivingStrokes: List<Stroke>
    )

    /**
     * Cuts a sequence of [CutPoint]s with an eraser disc at (cx, cy) of [radius].
     * Returns a list of surviving continuous [CutPoint] sub-segments.
     */
    fun cutPolyline(
        pts: List<CutPoint>,
        cx: Float,
        cy: Float,
        radius: Float
    ): List<List<CutPoint>> {
        val inputCount = pts.size
        if (inputCount == 0) return emptyList()

        val rSq = radius * radius

        fun isInside(p: CutPoint): Boolean {
            val dx = p.x - cx
            val dy = p.y - cy
            return (dx * dx + dy * dy) <= rSq
        }

        val subStrokePointLists = mutableListOf<MutableList<CutPoint>>()
        var currentList: MutableList<CutPoint>? = null

        if (!isInside(pts[0])) {
            val list = mutableListOf(pts[0])
            subStrokePointLists.add(list)
            currentList = list
        }

        var anySegmentCut = false

        for (i in 0 until inputCount - 1) {
            val a = pts[i]
            val b = pts[i + 1]

            val aIn = isInside(a)
            val bIn = isInside(b)

            val dx = b.x - a.x
            val dy = b.y - a.y
            val fx = a.x - cx
            val fy = a.y - cy

            val segA = dx * dx + dy * dy

            if (segA < 1e-6f) {
                if (!bIn && currentList != null) {
                    currentList.add(b)
                }
                continue
            }

            val segB = 2f * (fx * dx + fy * dy)
            val segC = (fx * fx + fy * fy) - rSq

            val disc = segB * segB - 4f * segA * segC

            if (disc <= 0f) {
                if (!aIn && !bIn) {
                    if (currentList == null) {
                        val list = mutableListOf(a, b)
                        subStrokePointLists.add(list)
                        currentList = list
                    } else {
                        currentList.add(b)
                    }
                } else {
                    currentList = null
                    anySegmentCut = true
                }
            } else {
                val sqrtDisc = sqrt(disc)
                val t1 = (-segB - sqrtDisc) / (2f * segA)
                val t2 = (-segB + sqrtDisc) / (2f * segA)

                val tEnter = max(0f, t1)
                val tExit = min(1f, t2)

                if (tEnter >= tExit) {
                    if (currentList == null) {
                        val list = mutableListOf(a, b)
                        subStrokePointLists.add(list)
                        currentList = list
                    } else {
                        currentList.add(b)
                    }
                } else {
                    anySegmentCut = true
                    if (aIn && bIn) {
                        currentList = null
                    } else if (!aIn && bIn) {
                        val cutPt = interpolate(a, b, t1)
                        currentList?.add(cutPt)
                        currentList = null
                    } else if (aIn && !bIn) {
                        val cutPt = interpolate(a, b, t2)
                        val nextList = mutableListOf(cutPt, b)
                        subStrokePointLists.add(nextList)
                        currentList = nextList
                    } else {
                        val cutPt1 = interpolate(a, b, t1)
                        val cutPt2 = interpolate(a, b, t2)
                        currentList?.add(cutPt1)
                        val nextList = mutableListOf(cutPt2, b)
                        subStrokePointLists.add(nextList)
                        currentList = nextList
                    }
                }
            }
        }

        if (!anySegmentCut && currentList != null && currentList.size == inputCount) {
            return listOf(pts)
        }

        val filtered = mutableListOf<List<CutPoint>>()
        for (pointList in subStrokePointLists) {
            val strokeLen = computePathLength(pointList)
            if (pointList.size >= MIN_STROKE_POINTS && strokeLen >= MIN_STROKE_LENGTH_PX) {
                filtered.add(pointList)
            }
        }
        return filtered
    }

    /**
     * Cuts a stroke with an eraser disc centered at (cx, cy) with [radius].
     */
    fun cutStroke(stroke: Stroke, cx: Float, cy: Float, radius: Float): CutResult {
        val inputs = stroke.inputs
        val inputCount = inputs.size
        if (inputCount == 0) {
            return CutResult(wasCut = false, survivingStrokes = emptyList())
        }

        // Quick bounding box check
        val box = stroke.shape.computeBoundingBox()
        if (box != null) {
            if (cx + radius < box.xMin || cx - radius > box.xMax ||
                cy + radius < box.yMin || cy - radius > box.yMax
            ) {
                return CutResult(wasCut = false, survivingStrokes = listOf(stroke))
            }
        }

        val pts = ArrayList<CutPoint>(inputCount)
        for (i in 0 until inputCount) {
            val p = inputs.get(i)
            pts.add(
                CutPoint(
                    toolType = p.toolType,
                    x = p.x,
                    y = p.y,
                    elapsedTimeMillis = p.elapsedTimeMillis,
                    strokeUnitLengthCm = p.strokeUnitLengthCm,
                    pressure = p.pressure,
                    tiltRadians = p.tiltRadians,
                    orientationRadians = p.orientationRadians
                )
            )
        }

        val subPointLists = cutPolyline(pts, cx, cy, radius)

        if (subPointLists.size == 1 && subPointLists[0].size == inputCount) {
            return CutResult(wasCut = false, survivingStrokes = listOf(stroke))
        }

        // Convert valid sub-point lists into surviving Strokes
        val surviving = mutableListOf<Stroke>()
        for (pointList in subPointLists) {
            val batch = MutableStrokeInputBatch()
            var lastX = Float.NaN
            var lastY = Float.NaN
            var lastTime = -1L

            for (p in pointList) {
                if (!lastX.isNaN() && hypot(p.x - lastX, p.y - lastY) < 0.1f) {
                    continue
                }
                val safeTime = if (p.elapsedTimeMillis <= lastTime) lastTime + 2L else p.elapsedTimeMillis
                val safeTilt = if (p.tiltRadians < 0f) -1f else p.tiltRadians.coerceIn(0f, (Math.PI / 2).toFloat())
                val safeOrientation = p.orientationRadians.coerceIn(-Math.PI.toFloat(), Math.PI.toFloat())
                val safePressure = p.pressure.coerceIn(0.01f, 1.0f)

                batch.add(
                    p.toolType,
                    p.x,
                    p.y,
                    safeTime,
                    p.strokeUnitLengthCm,
                    safePressure,
                    safeTilt,
                    safeOrientation
                )
                lastX = p.x
                lastY = p.y
                lastTime = safeTime
            }

            if (batch.size >= MIN_STROKE_POINTS) {
                surviving.add(Stroke(stroke.brush, batch.toImmutable()))
            }
        }

        return CutResult(wasCut = true, survivingStrokes = surviving)
    }

    private fun interpolate(a: CutPoint, b: CutPoint, t: Float): CutPoint {
        val clampedT = t.coerceIn(0f, 1f)
        val timeDiff = b.elapsedTimeMillis - a.elapsedTimeMillis
        val newTime = a.elapsedTimeMillis + (timeDiff * clampedT).toLong()
        return CutPoint(
            toolType = a.toolType,
            x = a.x + clampedT * (b.x - a.x),
            y = a.y + clampedT * (b.y - a.y),
            elapsedTimeMillis = newTime,
            strokeUnitLengthCm = a.strokeUnitLengthCm,
            pressure = (a.pressure + clampedT * (b.pressure - a.pressure)).coerceIn(0.01f, 1.0f),
            tiltRadians = (a.tiltRadians + clampedT * (b.tiltRadians - a.tiltRadians)).coerceIn(0f, (Math.PI / 2).toFloat()),
            orientationRadians = (a.orientationRadians + clampedT * (b.orientationRadians - a.orientationRadians)).coerceIn(-Math.PI.toFloat(), Math.PI.toFloat())
        )
    }

    private fun computePathLength(pts: List<CutPoint>): Float {
        var len = 0f
        for (i in 0 until pts.size - 1) {
            len += hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y)
        }
        return len
    }
}
