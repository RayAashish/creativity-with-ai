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
    data class BidirectionalArrow(val startX: Float, val startY: Float, val endX: Float, val endY: Float) : RecognizedShape()
    data class Rectangle(val left: Float, val top: Float, val right: Float, val bottom: Float) : RecognizedShape()
    data class Circle(val centerX: Float, val centerY: Float, val radius: Float) : RecognizedShape()
    data class Triangle(val x1: Float, val y1: Float, val x2: Float, val y2: Float, val x3: Float, val y3: Float) : RecognizedShape()
    data class Diamond(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class DatabaseCylinder(val centerX: Float, val centerY: Float, val width: Float = 140f, val height: Float = 160f) : RecognizedShape()
    data class LinkedListNode(val centerX: Float, val centerY: Float, val width: Float = 160f, val height: Float = 80f) : RecognizedShape()
    data class ArrayCellSequence(val centerX: Float, val centerY: Float, val cellWidth: Float = 60f, val cellHeight: Float = 60f, val count: Int = 4) : RecognizedShape()
    data class Cloud(val centerX: Float, val centerY: Float, val width: Float = 180f, val height: Float = 110f) : RecognizedShape()
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

        // 2. Closed path: Evaluate Circle, Rectangle, Triangle, Diamond, or Cylinder
        var minX = Float.MAX_VALUE
        var maxX = -Float.MAX_VALUE
        var minY = Float.MAX_VALUE
        var maxY = -Float.MAX_VALUE
        for (pt in points) {
            if (pt.x < minX) minX = pt.x
            if (pt.x > maxX) maxX = pt.x
            if (pt.y < minY) minY = pt.y
            if (pt.y > maxY) maxY = pt.y
        }

        val boxWidth = maxX - minX
        val boxHeight = maxY - minY
        if (boxWidth < 20f || boxHeight < 20f) return null

        val centerX = (minX + maxX) / 2f
        val centerY = (minY + maxY) / 2f
        val avgRadius = (boxWidth + boxHeight) / 4f

        // 2a. Check for Circle (variance in distance from center should be low)
        var radiusVariance = 0f
        for (pt in points) {
            val dist = hypot(pt.x - centerX, pt.y - centerY)
            val diff = abs(dist - avgRadius)
            radiusVariance += diff * diff
        }
        radiusVariance /= points.size
        val stdDev = sqrt(radiusVariance)
        val aspectRatio = boxWidth / boxHeight

        if (stdDev < avgRadius * 0.16f && aspectRatio in 0.82f..1.22f) {
            return RecognizedShape.Circle(centerX, centerY, avgRadius)
        }

        // 2b. Simplify polygon using Ramer-Douglas-Peucker algorithm
        val simplified = ramerDouglasPeucker(points, epsilon = (boxWidth + boxHeight) * 0.055f)

        // Triangle: 3 distinct dominant vertices
        if (simplified.size == 4) {
            return RecognizedShape.Triangle(
                simplified[0].x, simplified[0].y,
                simplified[1].x, simplified[1].y,
                simplified[2].x, simplified[2].y
            )
        }

        // 4 vertices: evaluate Rectangle vs Diamond
        if (simplified.size in 5..6) {
            val poly = if (simplified.size == 6) simplified.take(5) else simplified
            // Check if top vertex is near centerX and sides are angled (Diamond)
            val topPt = poly.minByOrNull { it.y }
            if (topPt != null && abs(topPt.x - centerX) < boxWidth * 0.2f && aspectRatio in 0.7f..1.4f) {
                // Diamond
                return RecognizedShape.Diamond(centerX, centerY, boxWidth, boxHeight)
            }
            return RecognizedShape.Rectangle(minX, minY, maxX, maxY)
        }

        // Default to clean Bounding Rectangle if mostly rectangular
        if (simplified.size in 7..8 && (pathLength / (2 * (boxWidth + boxHeight))) in 0.85f..1.35f) {
            return RecognizedShape.Rectangle(minX, minY, maxX, maxY)
        }

        return null
    }

    /**
     * Converts a recognized shape into a canonical Stroke with the given Brush.
     */
    fun createStrokeForShape(shape: RecognizedShape, brush: Brush, toolType: InputToolType = InputToolType.STYLUS): Stroke {
        val strokes = createStrokesForShape(shape, brush, toolType)
        return strokes.first()
    }

    /**
     * Converts a recognized or system design shape into one or more vector Strokes.
     */
    fun createStrokesForShape(shape: RecognizedShape, brush: Brush, toolType: InputToolType = InputToolType.STYLUS): List<Stroke> {
        val baseTime = System.currentTimeMillis()
        val result = mutableListOf<Stroke>()

        when (shape) {
            is RecognizedShape.Line -> {
                val inputBatch = MutableStrokeInputBatch()
                val steps = 24
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    val x = shape.startX + (shape.endX - shape.startX) * t
                    val y = shape.startY + (shape.endY - shape.startY) * t
                    inputBatch.add(toolType, x, y, baseTime + i * 5L, 0.5f, 0f, 0f)
                }
                result.add(Stroke(brush, inputBatch.toImmutable()))
            }
            is RecognizedShape.Arrow -> {
                val inputBatch = MutableStrokeInputBatch()
                val steps = 24
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    val x = shape.startX + (shape.endX - shape.startX) * t
                    val y = shape.startY + (shape.endY - shape.startY) * t
                    inputBatch.add(toolType, x, y, baseTime + i * 5L, 0.5f, 0f, 0f)
                }
                val angle = atan2(shape.endY - shape.startY, shape.endX - shape.startX)
                val barbLength = 32f
                val barb1X = shape.endX - barbLength * cos(angle - PI.toFloat() / 6f)
                val barb1Y = shape.endY - barbLength * sin(angle - PI.toFloat() / 6f)
                val barb2X = shape.endX - barbLength * cos(angle + PI.toFloat() / 6f)
                val barb2Y = shape.endY - barbLength * sin(angle + PI.toFloat() / 6f)

                inputBatch.add(toolType, barb1X, barb1Y, baseTime + 130L, 0.5f, 0f, 0f)
                inputBatch.add(toolType, shape.endX, shape.endY, baseTime + 140L, 0.5f, 0f, 0f)
                inputBatch.add(toolType, barb2X, barb2Y, baseTime + 150L, 0.5f, 0f, 0f)
                result.add(Stroke(brush, inputBatch.toImmutable()))
            }
            is RecognizedShape.BidirectionalArrow -> {
                val inputBatch = MutableStrokeInputBatch()
                val steps = 24
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    val x = shape.startX + (shape.endX - shape.startX) * t
                    val y = shape.startY + (shape.endY - shape.startY) * t
                    inputBatch.add(toolType, x, y, baseTime + i * 5L, 0.5f, 0f, 0f)
                }
                val angle = atan2(shape.endY - shape.startY, shape.endX - shape.startX)
                val barbLength = 28f
                // End arrowhead
                inputBatch.add(toolType, shape.endX - barbLength * cos(angle - PI.toFloat() / 6f), shape.endY - barbLength * sin(angle - PI.toFloat() / 6f), baseTime + 130L, 0.5f, 0f, 0f)
                inputBatch.add(toolType, shape.endX, shape.endY, baseTime + 135L, 0.5f, 0f, 0f)
                inputBatch.add(toolType, shape.endX - barbLength * cos(angle + PI.toFloat() / 6f), shape.endY - barbLength * sin(angle + PI.toFloat() / 6f), baseTime + 140L, 0.5f, 0f, 0f)
                // Start arrowhead
                val revAngle = angle + PI.toFloat()
                inputBatch.add(toolType, shape.startX, shape.startY, baseTime + 145L, 0.5f, 0f, 0f)
                inputBatch.add(toolType, shape.startX - barbLength * cos(revAngle - PI.toFloat() / 6f), shape.startY - barbLength * sin(revAngle - PI.toFloat() / 6f), baseTime + 150L, 0.5f, 0f, 0f)
                inputBatch.add(toolType, shape.startX, shape.startY, baseTime + 155L, 0.5f, 0f, 0f)
                inputBatch.add(toolType, shape.startX - barbLength * cos(revAngle + PI.toFloat() / 6f), shape.startY - barbLength * sin(revAngle + PI.toFloat() / 6f), baseTime + 160L, 0.5f, 0f, 0f)
                result.add(Stroke(brush, inputBatch.toImmutable()))
            }
            is RecognizedShape.Rectangle -> {
                val inputBatch = MutableStrokeInputBatch()
                val corners = listOf(
                    Point(shape.left, shape.top),
                    Point(shape.right, shape.top),
                    Point(shape.right, shape.bottom),
                    Point(shape.left, shape.bottom),
                    Point(shape.left, shape.top)
                )
                generatePolygonPoints(corners, inputBatch, toolType, baseTime)
                result.add(Stroke(brush, inputBatch.toImmutable()))
            }
            is RecognizedShape.Circle -> {
                val inputBatch = MutableStrokeInputBatch()
                val steps = 64
                for (i in 0..steps) {
                    val angle = (2.0 * PI * i / steps).toFloat()
                    val x = shape.centerX + shape.radius * cos(angle)
                    val y = shape.centerY + shape.radius * sin(angle)
                    inputBatch.add(toolType, x, y, baseTime + i * 4L, 0.5f, 0f, 0f)
                }
                result.add(Stroke(brush, inputBatch.toImmutable()))
            }
            is RecognizedShape.Triangle -> {
                val inputBatch = MutableStrokeInputBatch()
                val corners = listOf(
                    Point(shape.x1, shape.y1),
                    Point(shape.x2, shape.y2),
                    Point(shape.x3, shape.y3),
                    Point(shape.x1, shape.y1)
                )
                generatePolygonPoints(corners, inputBatch, toolType, baseTime)
                result.add(Stroke(brush, inputBatch.toImmutable()))
            }
            is RecognizedShape.Diamond -> {
                val inputBatch = MutableStrokeInputBatch()
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val corners = listOf(
                    Point(shape.centerX, shape.centerY - halfH),
                    Point(shape.centerX + halfW, shape.centerY),
                    Point(shape.centerX, shape.centerY + halfH),
                    Point(shape.centerX - halfW, shape.centerY),
                    Point(shape.centerX, shape.centerY - halfH)
                )
                generatePolygonPoints(corners, inputBatch, toolType, baseTime)
                result.add(Stroke(brush, inputBatch.toImmutable()))
            }
            is RecognizedShape.DatabaseCylinder -> {
                // System Design Database Icon: Top ellipse + vertical walls + bottom curved rim
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val rx = halfW
                val ry = shape.height * 0.16f
                val topCenterY = shape.centerY - halfH + ry
                val bottomCenterY = shape.centerY + halfH - ry

                // Stroke 1: Top Ellipse
                val topBatch = MutableStrokeInputBatch()
                val steps = 40
                for (i in 0..steps) {
                    val a = (2.0 * PI * i / steps).toFloat()
                    topBatch.add(toolType, shape.centerX + rx * cos(a), topCenterY + ry * sin(a), baseTime + i * 3L, 0.5f, 0f, 0f)
                }
                result.add(Stroke(brush, topBatch.toImmutable()))

                // Stroke 2: Left wall down, bottom arc, right wall up
                val bodyBatch = MutableStrokeInputBatch()
                // Left line
                for (i in 0..12) {
                    val t = i / 12f
                    val y = topCenterY + (bottomCenterY - topCenterY) * t
                    bodyBatch.add(toolType, shape.centerX - rx, y, baseTime + 150L + i * 3L, 0.5f, 0f, 0f)
                }
                // Bottom arc (0 to PI)
                for (i in 0..24) {
                    val a = PI.toFloat() + (PI.toFloat() * i / 24f)
                    bodyBatch.add(toolType, shape.centerX + rx * cos(a), bottomCenterY + ry * sin(a), baseTime + 200L + i * 3L, 0.5f, 0f, 0f)
                }
                // Right line up
                for (i in 0..12) {
                    val t = i / 12f
                    val y = bottomCenterY - (bottomCenterY - topCenterY) * t
                    bodyBatch.add(toolType, shape.centerX + rx, y, baseTime + 280L + i * 3L, 0.5f, 0f, 0f)
                }
                result.add(Stroke(brush, bodyBatch.toImmutable()))
            }
            is RecognizedShape.LinkedListNode -> {
                // Linked List Node: [ value | next ] ->
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val left = shape.centerX - halfW
                val right = shape.centerX + halfW
                val top = shape.centerY - halfH
                val bottom = shape.centerY + halfH

                // 1. Box
                val boxBatch = MutableStrokeInputBatch()
                val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                generatePolygonPoints(corners, boxBatch, toolType, baseTime)
                result.add(Stroke(brush, boxBatch.toImmutable()))

                // 2. Divider line between value and next pointer
                val divX = right - (shape.width * 0.35f)
                val divBatch = MutableStrokeInputBatch()
                for (i in 0..10) {
                    val t = i / 10f
                    divBatch.add(toolType, divX, top + (bottom - top) * t, baseTime + 100L + i * 3L, 0.5f, 0f, 0f)
                }
                result.add(Stroke(brush, divBatch.toImmutable()))

                // 3. Pointer arrow exiting the right side
                val pointerStartX = divX + (right - divX) / 2f
                val pointerEndX = right + 45f
                val arrowBatch = MutableStrokeInputBatch()
                for (i in 0..12) {
                    val t = i / 12f
                    arrowBatch.add(toolType, pointerStartX + (pointerEndX - pointerStartX) * t, shape.centerY, baseTime + 140L + i * 3L, 0.5f, 0f, 0f)
                }
                // Arrow tip
                arrowBatch.add(toolType, pointerEndX - 14f, shape.centerY - 12f, baseTime + 180L, 0.5f, 0f, 0f)
                arrowBatch.add(toolType, pointerEndX, shape.centerY, baseTime + 185L, 0.5f, 0f, 0f)
                arrowBatch.add(toolType, pointerEndX - 14f, shape.centerY + 12f, baseTime + 190L, 0.5f, 0f, 0f)
                result.add(Stroke(brush, arrowBatch.toImmutable()))
            }
            is RecognizedShape.ArrayCellSequence -> {
                // DSA Array / Queue block: [ 0 | 1 | 2 | 3 ]
                val totalW = shape.cellWidth * shape.count
                val left = shape.centerX - totalW / 2f
                val right = shape.centerX + totalW / 2f
                val top = shape.centerY - shape.cellHeight / 2f
                val bottom = shape.centerY + shape.cellHeight / 2f

                // Outer box
                val boxBatch = MutableStrokeInputBatch()
                val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                generatePolygonPoints(corners, boxBatch, toolType, baseTime)
                result.add(Stroke(brush, boxBatch.toImmutable()))

                // Internal cell dividers
                for (c in 1 until shape.count) {
                    val divX = left + c * shape.cellWidth
                    val divBatch = MutableStrokeInputBatch()
                    for (i in 0..10) {
                        val t = i / 10f
                        divBatch.add(toolType, divX, top + (bottom - top) * t, baseTime + 100L + c * 30L + i * 3L, 0.5f, 0f, 0f)
                    }
                    result.add(Stroke(brush, divBatch.toImmutable()))
                }
            }
            is RecognizedShape.Cloud -> {
                // System Design Cloud (Network / External Service)
                val cloudBatch = MutableStrokeInputBatch()
                val rx = shape.width / 2f
                val ry = shape.height / 2f
                val steps = 60
                for (i in 0..steps) {
                    val angle = (2.0 * PI * i / steps).toFloat()
                    val bump = 1f + 0.15f * sin(5f * angle)
                    val x = shape.centerX + rx * bump * cos(angle)
                    val y = shape.centerY + ry * bump * sin(angle)
                    cloudBatch.add(toolType, x, y, baseTime + i * 4L, 0.5f, 0f, 0f)
                }
                result.add(Stroke(brush, cloudBatch.toImmutable()))
            }
        }

        return result
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
