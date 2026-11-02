package com.antigravity.note.inkengine.shape

import androidx.ink.brush.Brush
import androidx.ink.brush.InputToolType
import androidx.ink.strokes.MutableStrokeInputBatch
import androidx.ink.strokes.Stroke
import androidx.ink.strokes.StrokeInputBatch
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.sin
import kotlin.math.sqrt

sealed class RecognizedShape {
    data class Line(val startX: Float, val startY: Float, val endX: Float, val endY: Float) : RecognizedShape()
    data class Arrow(val startX: Float, val startY: Float, val endX: Float, val endY: Float) : RecognizedShape()
    data class Rectangle(val left: Float, val top: Float, val right: Float, val bottom: Float) : RecognizedShape()
    data class Circle(val centerX: Float, val centerY: Float, val radius: Float) : RecognizedShape()
    data class Triangle(val x1: Float, val y1: Float, val x2: Float, val y2: Float, val x3: Float, val y3: Float) : RecognizedShape()
}

class ShapeRecognizer {

    data class Point(val x: Float, val y: Float, val timeMs: Long = 0L)

    /**
     * Attempts to recognize a geometric shape from a collection of points.
     * Returns the recognized shape or null if points resemble freehand ink.
     */
    fun recognize(points: List<Point>): RecognizedShape? {
        if (points.size < 5) return null

        val pathLength = computePathLength(points)
        if (pathLength < 30f) return null

        val start = points.first()
        val end = points.last()
        val directDistance = hypot(end.x - start.x, end.y - start.y)

        // 1. Check for Line or Arrow (Open path)
        val isClosed = (directDistance / pathLength) < 0.22f
        if (!isClosed) {
            val straightness = directDistance / pathLength
            if (straightness >= 0.88f) {
                // Check if user drew an arrow head at the end
                if (hasArrowTip(points)) {
                    return RecognizedShape.Arrow(start.x, start.y, end.x, end.y)
                }
                return RecognizedShape.Line(start.x, start.y, end.x, end.y)
            }
            return null
        }

        // 2. Closed path: Evaluate Circle, Rectangle, or Triangle
        var minX = Float.MAX_VALUE
        var maxX = -Float.MAX_VALUE
        var minY = Float.MAX_VALUE
        var maxY = -Float.MAX_VALUE
        var sumX = 0f
        var sumY = 0f

        for (p in points) {
            if (p.x < minX) minX = p.x
            if (p.x > maxX) maxX = p.x
            if (p.y < minY) minY = p.y
            if (p.y > maxY) maxY = p.y
            sumX += p.x
            sumY += p.y
        }

        val cx = sumX / points.size
        val cy = sumY / points.size
        val width = maxX - minX
        val height = maxY - minY
        if (width < 20f || height < 20f) return null

        // Check for Circle
        val radii = points.map { hypot(it.x - cx, it.y - cy) }
        val avgRadius = radii.average().toFloat()
        val variance = radii.map { (it - avgRadius) * (it - avgRadius) }.average()
        val stdDev = sqrt(variance).toFloat()
        val circleRatio = stdDev / avgRadius

        // Aspect ratio of bounding box
        val aspect = width / height
        if (circleRatio < 0.20f && aspect in 0.75f..1.33f) {
            return RecognizedShape.Circle(cx, cy, avgRadius)
        }

        // Check for Polygon (Rectangle or Triangle) via Ramer-Douglas-Peucker simplification
        val simplified = ramerDouglasPeucker(points, epsilon = (width + height) * 0.05f)
        val cornerCount = if (simplified.size > 1 && hypot(simplified.first().x - simplified.last().x, simplified.first().y - simplified.last().y) < 25f) {
            simplified.size - 1
        } else {
            simplified.size
        }

        if (cornerCount == 4) {
            // Rectangle
            return RecognizedShape.Rectangle(minX, minY, maxX, maxY)
        } else if (cornerCount == 3) {
            // Triangle
            return RecognizedShape.Triangle(
                simplified[0].x, simplified[0].y,
                simplified[1].x, simplified[1].y,
                simplified[2].x, simplified[2].y
            )
        }

        // Fallback for near-rectangular bounding box
        if (circleRatio >= 0.20f && aspect in 0.3f..3.0f) {
            // Check corner turns
            var rightAngleCount = 0
            for (i in 1 until points.size - 1 step (points.size / 8).coerceAtLeast(1)) {
                val pPrev = points[i - 1]
                val pCurr = points[i]
                val pNext = points[i + 1]
                val angle = abs(angleBetween(pPrev, pCurr, pNext))
                if (angle in 70.0..110.0) {
                    rightAngleCount++
                }
            }
            if (rightAngleCount in 3..6) {
                return RecognizedShape.Rectangle(minX, minY, maxX, maxY)
            }
        }

        return null
    }

    /**
     * Converts a recognized shape into a smoothed, canonical Stroke with the given Brush.
     */
    fun createStrokeForShape(shape: RecognizedShape, brush: Brush, toolType: InputToolType = InputToolType.STYLUS): Stroke {
        val inputBatch = MutableStrokeInputBatch()
        val baseTime = System.currentTimeMillis()

        when (shape) {
            is RecognizedShape.Line -> {
                val steps = 24
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    val x = shape.startX + (shape.endX - shape.startX) * t
                    val y = shape.startY + (shape.endY - shape.startY) * t
                    inputBatch.add(toolType, x, y, baseTime + i * 5L, 0.5f, 0f, 0f)
                }
            }
            is RecognizedShape.Arrow -> {
                val steps = 24
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    val x = shape.startX + (shape.endX - shape.startX) * t
                    val y = shape.startY + (shape.endY - shape.startY) * t
                    inputBatch.add(toolType, x, y, baseTime + i * 5L, 0.5f, 0f, 0f)
                }
                // Arrowhead barb 1
                val angle = atan2(shape.endY - shape.startY, shape.endX - shape.startX)
                val barbLength = 32f
                val barb1X = shape.endX - barbLength * cos(angle - PI.toFloat() / 6f)
                val barb1Y = shape.endY - barbLength * sin(angle - PI.toFloat() / 6f)
                val barb2X = shape.endX - barbLength * cos(angle + PI.toFloat() / 6f)
                val barb2Y = shape.endY - barbLength * sin(angle + PI.toFloat() / 6f)

                inputBatch.add(toolType, barb1X, barb1Y, baseTime + 130L, 0.5f, 0f, 0f)
                inputBatch.add(toolType, shape.endX, shape.endY, baseTime + 140L, 0.5f, 0f, 0f)
                inputBatch.add(toolType, barb2X, barb2Y, baseTime + 150L, 0.5f, 0f, 0f)
            }
            is RecognizedShape.Rectangle -> {
                val corners = listOf(
                    Point(shape.left, shape.top),
                    Point(shape.right, shape.top),
                    Point(shape.right, shape.bottom),
                    Point(shape.left, shape.bottom),
                    Point(shape.left, shape.top)
                )
                generatePolygonPoints(corners, inputBatch, toolType, baseTime)
            }
            is RecognizedShape.Circle -> {
                val steps = 64
                for (i in 0..steps) {
                    val angle = (2.0 * PI * i / steps).toFloat()
                    val x = shape.centerX + shape.radius * cos(angle)
                    val y = shape.centerY + shape.radius * sin(angle)
                    inputBatch.add(toolType, x, y, baseTime + i * 4L, 0.5f, 0f, 0f)
                }
            }
            is RecognizedShape.Triangle -> {
                val corners = listOf(
                    Point(shape.x1, shape.y1),
                    Point(shape.x2, shape.y2),
                    Point(shape.x3, shape.y3),
                    Point(shape.x1, shape.y1)
                )
                generatePolygonPoints(corners, inputBatch, toolType, baseTime)
            }
        }

        return Stroke(brush, inputBatch.toImmutable())
    }

    private fun generatePolygonPoints(
        corners: List<Point>,
        batch: MutableStrokeInputBatch,
        toolType: InputToolType,
        baseTime: Long
    ) {
        var timeOffset = 0L
        for (idx in 0 until corners.size - 1) {
            val c1 = corners[idx]
            val c2 = corners[idx + 1]
            val steps = 12
            for (step in 0 until steps) {
                val t = step.toFloat() / steps
                val x = c1.x + (c2.x - c1.x) * t
                val y = c1.y + (c2.y - c1.y) * t
                batch.add(toolType, x, y, baseTime + timeOffset, 0.5f, 0f, 0f)
                timeOffset += 4L
            }
        }
        val last = corners.last()
        batch.add(toolType, last.x, last.y, baseTime + timeOffset, 0.5f, 0f, 0f)
    }

    private fun computePathLength(points: List<Point>): Float {
        var total = 0f
        for (i in 0 until points.size - 1) {
            total += hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y)
        }
        return total
    }

    private fun hasArrowTip(points: List<Point>): Boolean {
        if (points.size < 12) return false
        val tail = points.takeLast(6)
        val mainStart = points.first()
        val mainEnd = points[points.size - 7]
        val mainAngle = atan2(mainEnd.y - mainStart.y, mainEnd.x - mainStart.x)
        val tipAngle = atan2(tail.last().y - tail.first().y, tail.last().x - tail.first().x)
        val diff = abs(mainAngle - tipAngle)
        return diff > 1.2f && diff < 3.0f
    }

    private fun angleBetween(p1: Point, p2: Point, p3: Point): Double {
        val a1 = atan2((p1.y - p2.y).toDouble(), (p1.x - p2.x).toDouble())
        val a2 = atan2((p3.y - p2.y).toDouble(), (p3.x - p2.x).toDouble())
        var diff = Math.toDegrees(a2 - a1)
        while (diff <= -180.0) diff += 360.0
        while (diff > 180.0) diff -= 360.0
        return diff
    }

    private fun ramerDouglasPeucker(points: List<Point>, epsilon: Float): List<Point> {
        if (points.size < 3) return points

        var maxDist = 0f
        var index = 0
        val first = points.first()
        val last = points.last()

        for (i in 1 until points.size - 1) {
            val dist = perpendicularDistance(points[i], first, last)
            if (dist > maxDist) {
                maxDist = dist
                index = i
            }
        }

        return if (maxDist > epsilon) {
            val left = ramerDouglasPeucker(points.subList(0, index + 1), epsilon)
            val right = ramerDouglasPeucker(points.subList(index, points.size), epsilon)
            left.dropLast(1) + right
        } else {
            listOf(first, last)
        }
    }

    private fun perpendicularDistance(pt: Point, lineStart: Point, lineEnd: Point): Float {
        val dx = lineEnd.x - lineStart.x
        val dy = lineEnd.y - lineStart.y
        val lineLen = hypot(dx, dy)
        if (lineLen < 0.001f) return hypot(pt.x - lineStart.x, pt.y - lineStart.y)
        return abs(dy * pt.x - dx * pt.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / lineLen
    }
}
