package com.antigravity.note.inkengine.shape

import androidx.ink.brush.Brush
import androidx.ink.brush.InputToolType
import androidx.ink.strokes.MutableStrokeInputBatch
import androidx.ink.strokes.Stroke
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.sin
import kotlin.math.sqrt

sealed class RecognizedShape {
    data class Line(val startX: Float, val startY: Float, val endX: Float, val endY: Float) : RecognizedShape()
    data class Arrow(val startX: Float, val startY: Float, val endX: Float, val endY: Float) : RecognizedShape()
    data class Circle(val centerX: Float, val centerY: Float, val radius: Float) : RecognizedShape()
    data class Square(val centerX: Float, val centerY: Float, val size: Float) : RecognizedShape()
    data class Rectangle(val left: Float, val top: Float, val right: Float, val bottom: Float) : RecognizedShape()
    data class Triangle(val x1: Float, val y1: Float, val x2: Float, val y2: Float, val x3: Float, val y3: Float) : RecognizedShape()
    data class Diamond(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class Pentagon(val x1: Float, val y1: Float, val x2: Float, val y2: Float, val x3: Float, val y3: Float, val x4: Float, val y4: Float, val x5: Float, val y5: Float) : RecognizedShape()
    data class Hexagon(val centerX: Float, val centerY: Float, val radius: Float) : RecognizedShape()
    data class Star(val centerX: Float, val centerY: Float, val outerRadius: Float, val innerRadius: Float = outerRadius * 0.42f) : RecognizedShape()
    data class DatabaseCylinder(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class LinkedListNode(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class ArrayCellSequence(val centerX: Float, val centerY: Float, val cellWidth: Float, val cellHeight: Float, val count: Int = 4) : RecognizedShape()
    data class Cloud(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class BidirectionalArrow(val startX: Float, val startY: Float, val endX: Float, val endY: Float) : RecognizedShape()
    data class CachePill(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
}

class ShapeRecognizer {

    data class Point(val x: Float, val y: Float, val timeMs: Long = 0L)

    /**
     * Attempts to recognize a geometric shape from a collection of points.
     * Returns the recognized shape or null if points resemble freehand ink.
     */
    fun recognize(points: List<Point>): RecognizedShape? {
        if (points.size < 5) return null

        // Strip trailing cluster points where user paused pen
        val cleanPoints = points.toMutableList()
        if (cleanPoints.size > 10) {
            val last = cleanPoints.last()
            var trimIdx = cleanPoints.size - 1
            while (trimIdx > 5 && hypot(cleanPoints[trimIdx].x - last.x, cleanPoints[trimIdx].y - last.y) < 22f) {
                trimIdx--
            }
            if (trimIdx < cleanPoints.size - 2) {
                cleanPoints.subList(trimIdx + 1, cleanPoints.size).clear()
                cleanPoints.add(last)
            }
        }

        val pathLength = computePathLength(cleanPoints)
        if (pathLength < 30f) return null

        val start = cleanPoints.first()
        val end = cleanPoints.last()
        val directDistance = hypot(end.x - start.x, end.y - start.y)

        // Bounding box
        var minX = Float.MAX_VALUE
        var maxX = -Float.MAX_VALUE
        var minY = Float.MAX_VALUE
        var maxY = -Float.MAX_VALUE
        for (pt in cleanPoints) {
            if (pt.x < minX) minX = pt.x
            if (pt.x > maxX) maxX = pt.x
            if (pt.y < minY) minY = pt.y
            if (pt.y > maxY) maxY = pt.y
        }

        val boxWidth = maxX - minX
        val boxHeight = maxY - minY
        if (boxWidth < 15f && boxHeight < 15f) return null

        val centerX = (minX + maxX) / 2f
        val centerY = (minY + maxY) / 2f

        // 1. Check for Line or Arrow (Open path)
        val isClosed = (directDistance / pathLength) < 0.38f || directDistance < max(50f, (boxWidth + boxHeight) * 0.20f)
        if (!isClosed) {
            val straightness = directDistance / pathLength
            if (straightness >= 0.78f) {
                if (hasArrowTip(cleanPoints)) {
                    val tip = findTip(cleanPoints)
                    return RecognizedShape.Arrow(start.x, start.y, tip.x, tip.y)
                }
                return RecognizedShape.Line(start.x, start.y, end.x, end.y)
            }
            return null
        }

        // 2. Closed path: Evaluate Circle using Circularity (Isoperimetric Quotient: 4*pi*Area / Perimeter^2)
        val avgRadius = (boxWidth + boxHeight) / 4f
        val aspectRatio = boxWidth / max(1f, boxHeight)
        val area = computeShoelaceArea(cleanPoints)
        val circularity = if (pathLength > 0f) (4.0 * PI * area / (pathLength.toDouble() * pathLength.toDouble())).toFloat() else 0f

        // A circle has circularity ~ 1.0. A square maxes out at pi/4 ~ 0.785. A rectangle/triangle is even lower.
        if (circularity >= 0.80f && aspectRatio in 0.70f..1.42f) {
            return RecognizedShape.Circle(centerX, centerY, avgRadius)
        }

        // 3. Evaluate Triangle vs 4-sided polygons
        // Find 3 dominant vertices for Triangle detection
        val pFar = cleanPoints.maxByOrNull { hypot(it.x - start.x, it.y - start.y) } ?: end
        val leftPoints = mutableListOf<Point>()
        val rightPoints = mutableListOf<Point>()
        val chordDx = pFar.x - start.x
        val chordDy = pFar.y - start.y
        for (pt in cleanPoints) {
            val cross = chordDx * (pt.y - start.y) - chordDy * (pt.x - start.x)
            if (cross > 0f) leftPoints.add(pt) else rightPoints.add(pt)
        }

        val pSide1 = leftPoints.maxByOrNull { perpendicularDistance(it, start, pFar) }
        val pSide2 = rightPoints.maxByOrNull { perpendicularDistance(it, start, pFar) }
        val d1 = if (pSide1 != null) perpendicularDistance(pSide1, start, pFar) else 0f
        val d2 = if (pSide2 != null) perpendicularDistance(pSide2, start, pFar) else 0f

        // If one side has significant peak and the other is mostly flat, or vertices form a distinct triangle
        val isTriangleCandidate = (d1 > 25f && d2 < d1 * 0.35f) || (d2 > 25f && d1 < d2 * 0.35f)
        if (isTriangleCandidate) {
            val apex = if (d1 > d2) pSide1!! else pSide2!!
            // Vertices are start/end base midpoint, pFar, and apex
            val baseMidX = (start.x + end.x) / 2f
            val baseMidY = (start.y + end.y) / 2f
            return RecognizedShape.Triangle(baseMidX, baseMidY, pFar.x, pFar.y, apex.x, apex.y)
        }

        // 4. Evaluate Diamond vs Square vs Rectangle
        val topPt = cleanPoints.minByOrNull { it.y }
        val bottomPt = cleanPoints.maxByOrNull { it.y }
        val leftPt = cleanPoints.minByOrNull { it.x }
        val rightPt = cleanPoints.maxByOrNull { it.x }

        val isDiamond = topPt != null && bottomPt != null && leftPt != null && rightPt != null &&
                abs(topPt.x - centerX) < boxWidth * 0.20f &&
                abs(bottomPt.x - centerX) < boxWidth * 0.20f &&
                abs(leftPt.y - centerY) < boxHeight * 0.20f &&
                abs(rightPt.y - centerY) < boxHeight * 0.20f &&
                aspectRatio in 0.70f..1.42f

        if (isDiamond) {
            return RecognizedShape.Diamond(centerX, centerY, boxWidth, boxHeight)
        }

        // 5. Square vs Rectangle
        if (aspectRatio in 0.78f..1.28f) {
            val size = (boxWidth + boxHeight) / 2f
            return RecognizedShape.Square(centerX, centerY, size)
        }

        return RecognizedShape.Rectangle(minX, minY, maxX, maxY)
    }

    fun createStrokeForShape(shape: RecognizedShape, brush: Brush, toolType: InputToolType = InputToolType.STYLUS): Stroke {
        val strokes = createStrokesForShape(shape, brush, toolType)
        return strokes.first()
    }

    class SafeBatchBuilder(
        val toolType: InputToolType = InputToolType.STYLUS,
        private val baseTime: Long = 0L
    ) {
        val batch = MutableStrokeInputBatch()
        private var lastX = Float.NaN
        private var lastY = Float.NaN
        private var lastTime = baseTime - 4L

        fun add(x: Float, y: Float, pressure: Float = 0.6f, dtMillis: Long = 4L) {
            if (!lastX.isNaN() && kotlin.math.hypot(x - lastX, y - lastY) < 0.2f) {
                return // Deduplicate position
            }
            val targetTime = lastTime + max(1L, dtMillis)
            batch.add(
                toolType,
                x,
                y,
                targetTime,
                0f,                             // strokeUnitLengthCm
                pressure.coerceIn(0.1f, 1.0f),  // pressure
                0f,                             // tiltRadians
                0f                              // orientationRadians
            )
            lastX = x
            lastY = y
            lastTime = targetTime
        }

        fun toImmutable() = batch.toImmutable()
    }

    /**
     * Converts a recognized or system design shape into one or more vector Strokes.
     */
    fun createStrokesForShape(shape: RecognizedShape, brush: Brush, toolType: InputToolType = InputToolType.STYLUS): List<Stroke> {
        val baseTime = 0L
        val result = mutableListOf<Stroke>()

        when (shape) {
            is RecognizedShape.Line -> {
                val b = SafeBatchBuilder(toolType, baseTime)
                val steps = 24
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    b.add(shape.startX + (shape.endX - shape.startX) * t, shape.startY + (shape.endY - shape.startY) * t)
                }
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.Arrow -> {
                val shaft = SafeBatchBuilder(toolType, baseTime)
                val steps = 24
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    shaft.add(shape.startX + (shape.endX - shape.startX) * t, shape.startY + (shape.endY - shape.startY) * t)
                }
                result.add(Stroke(brush, shaft.toImmutable()))

                // Clean Arrowhead tip
                val angle = atan2(shape.endY - shape.startY, shape.endX - shape.startX)
                val barbLength = 26f
                val tip = SafeBatchBuilder(toolType, baseTime + 110L)
                tip.add(shape.endX - barbLength * cos(angle - PI.toFloat() / 6f), shape.endY - barbLength * sin(angle - PI.toFloat() / 6f))
                tip.add(shape.endX, shape.endY)
                tip.add(shape.endX - barbLength * cos(angle + PI.toFloat() / 6f), shape.endY - barbLength * sin(angle + PI.toFloat() / 6f))
                result.add(Stroke(brush, tip.toImmutable()))
            }
            is RecognizedShape.BidirectionalArrow -> {
                val shaft = SafeBatchBuilder(toolType, baseTime)
                val steps = 24
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    shaft.add(shape.startX + (shape.endX - shape.startX) * t, shape.startY + (shape.endY - shape.startY) * t)
                }
                result.add(Stroke(brush, shaft.toImmutable()))

                val angle = atan2(shape.endY - shape.startY, shape.endX - shape.startX)
                val barbLength = 24f

                // End Arrowhead
                val endTip = SafeBatchBuilder(toolType, baseTime + 110L)
                endTip.add(shape.endX - barbLength * cos(angle - PI.toFloat() / 6f), shape.endY - barbLength * sin(angle - PI.toFloat() / 6f))
                endTip.add(shape.endX, shape.endY)
                endTip.add(shape.endX - barbLength * cos(angle + PI.toFloat() / 6f), shape.endY - barbLength * sin(angle + PI.toFloat() / 6f))
                result.add(Stroke(brush, endTip.toImmutable()))

                // Start Arrowhead
                val revAngle = angle + PI.toFloat()
                val startTip = SafeBatchBuilder(toolType, baseTime + 130L)
                startTip.add(shape.startX - barbLength * cos(revAngle - PI.toFloat() / 6f), shape.startY - barbLength * sin(revAngle - PI.toFloat() / 6f))
                startTip.add(shape.startX, shape.startY)
                startTip.add(shape.startX - barbLength * cos(revAngle + PI.toFloat() / 6f), shape.startY - barbLength * sin(revAngle + PI.toFloat() / 6f))
                result.add(Stroke(brush, startTip.toImmutable()))
            }
            is RecognizedShape.Square -> {
                val half = shape.size / 2f
                val corners = listOf(
                    Point(shape.centerX - half, shape.centerY - half),
                    Point(shape.centerX + half, shape.centerY - half),
                    Point(shape.centerX + half, shape.centerY + half),
                    Point(shape.centerX - half, shape.centerY + half),
                    Point(shape.centerX - half, shape.centerY - half)
                )
                val b = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.Rectangle -> {
                val corners = listOf(
                    Point(shape.left, shape.top),
                    Point(shape.right, shape.top),
                    Point(shape.right, shape.bottom),
                    Point(shape.left, shape.bottom),
                    Point(shape.left, shape.top)
                )
                val b = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.Circle -> {
                val b = SafeBatchBuilder(toolType, baseTime)
                val steps = 64
                for (i in 0 until steps) {
                    val angle = (2.0 * PI * i / steps).toFloat()
                    b.add(shape.centerX + shape.radius * cos(angle), shape.centerY + shape.radius * sin(angle))
                }
                // Close loop cleanly
                b.add(shape.centerX + shape.radius, shape.centerY)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.Triangle -> {
                val corners = listOf(
                    Point(shape.x1, shape.y1),
                    Point(shape.x2, shape.y2),
                    Point(shape.x3, shape.y3),
                    Point(shape.x1, shape.y1)
                )
                val b = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.Diamond -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val corners = listOf(
                    Point(shape.centerX, shape.centerY - halfH),
                    Point(shape.centerX + halfW, shape.centerY),
                    Point(shape.centerX, shape.centerY + halfH),
                    Point(shape.centerX - halfW, shape.centerY),
                    Point(shape.centerX, shape.centerY - halfH)
                )
                val b = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.Pentagon -> {
                val corners = listOf(
                    Point(shape.x1, shape.y1),
                    Point(shape.x2, shape.y2),
                    Point(shape.x3, shape.y3),
                    Point(shape.x4, shape.y4),
                    Point(shape.x5, shape.y5),
                    Point(shape.x1, shape.y1)
                )
                val b = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.Hexagon -> {
                val corners = mutableListOf<Point>()
                for (i in 0..6) {
                    val angle = (PI / 3 * i - PI / 6).toFloat()
                    corners.add(Point(shape.centerX + shape.radius * cos(angle), shape.centerY + shape.radius * sin(angle)))
                }
                val b = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.Star -> {
                val corners = mutableListOf<Point>()
                val points = 5
                for (i in 0 until (points * 2)) {
                    val r = if (i % 2 == 0) shape.outerRadius else shape.innerRadius
                    val angle = (i * PI / points - PI / 2).toFloat()
                    corners.add(Point(shape.centerX + r * cos(angle), shape.centerY + r * sin(angle)))
                }
                corners.add(corners.first())
                val b = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.CachePill -> {
                // Stadium / Pill shape for In-Memory Cache (Redis)
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val r = halfH
                val straightW = halfW - r
                val b = SafeBatchBuilder(toolType, baseTime)
                val steps = 48
                // Top line
                for (i in 0..10) {
                    val t = i / 10f
                    b.add(shape.centerX - straightW + 2 * straightW * t, shape.centerY - halfH)
                }
                // Right semi-circle
                for (i in 0..steps / 2) {
                    val a = (-PI / 2 + PI * i / (steps / 2)).toFloat()
                    b.add(shape.centerX + straightW + r * cos(a), shape.centerY + r * sin(a))
                }
                // Bottom line
                for (i in 0..10) {
                    val t = i / 10f
                    b.add(shape.centerX + straightW - 2 * straightW * t, shape.centerY + halfH)
                }
                // Left semi-circle
                for (i in 0..steps / 2) {
                    val a = (PI / 2 + PI * i / (steps / 2)).toFloat()
                    b.add(shape.centerX - straightW + r * cos(a), shape.centerY + r * sin(a))
                }
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.DatabaseCylinder -> {
                // System Design Database Icon: Top ellipse + vertical walls + bottom curved rim
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val rx = halfW
                val ry = shape.height * 0.16f
                val topCenterY = shape.centerY - halfH + ry
                val bottomCenterY = shape.centerY + halfH - ry

                // Stroke 1: Top Ellipse (closed loop)
                val topBuilder = SafeBatchBuilder(toolType, baseTime)
                val steps = 48
                for (i in 0 until steps) {
                    val a = (2.0 * PI * i / steps).toFloat()
                    topBuilder.add(shape.centerX + rx * cos(a), topCenterY + ry * sin(a))
                }
                topBuilder.add(shape.centerX + rx, topCenterY)
                result.add(Stroke(brush, topBuilder.toImmutable()))

                // Stroke 2: Left wall down, bottom rim curving DOWN, right wall up
                val bodyBuilder = SafeBatchBuilder(toolType, baseTime + 150L)
                // Left wall down from topCenterY to bottomCenterY at x = centerX - rx
                for (i in 0..12) {
                    val t = i / 12f
                    bodyBuilder.add(shape.centerX - rx, topCenterY + (bottomCenterY - topCenterY) * t)
                }
                // Bottom arc from left to right curving downwards (i from 1 to 23 avoids duplicate endpoints)
                for (i in 1 until 24) {
                    val a = PI.toFloat() * i / 24f
                    bodyBuilder.add(shape.centerX - rx * cos(a), bottomCenterY + ry * sin(a))
                }
                // Right wall up from bottomCenterY to topCenterY at x = centerX + rx
                for (i in 0..12) {
                    val t = i / 12f
                    bodyBuilder.add(shape.centerX + rx, bottomCenterY - (bottomCenterY - topCenterY) * t)
                }
                result.add(Stroke(brush, bodyBuilder.toImmutable()))
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
                val boxBuilder = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                generatePolygonPoints(corners, boxBuilder)
                result.add(Stroke(brush, boxBuilder.toImmutable()))

                // 2. Divider line between value and next pointer
                val divX = right - (shape.width * 0.32f)
                val divBuilder = SafeBatchBuilder(toolType, baseTime + 100L)
                for (i in 0..10) {
                    val t = i / 10f
                    divBuilder.add(divX, top + (bottom - top) * t)
                }
                result.add(Stroke(brush, divBuilder.toImmutable()))

                // 3. Pointer Bullet dot inside pointer compartment
                val bulletCenterX = divX + (right - divX) / 2f
                val bulletBuilder = SafeBatchBuilder(toolType, baseTime + 140L)
                val bulletR = 7f
                for (i in 0 until 16) {
                    val a = (2.0 * PI * i / 16).toFloat()
                    bulletBuilder.add(bulletCenterX + bulletR * cos(a), shape.centerY + bulletR * sin(a))
                }
                bulletBuilder.add(bulletCenterX + bulletR, shape.centerY)
                result.add(Stroke(brush, bulletBuilder.toImmutable()))

                // 4. Pointer Arrow extending from right of node
                val arrowStartX = right
                val arrowEndX = right + 65f
                val shaftBuilder = SafeBatchBuilder(toolType, baseTime + 180L)
                for (i in 0..12) {
                    val t = i / 12f
                    shaftBuilder.add(arrowStartX + (arrowEndX - arrowStartX) * t, shape.centerY)
                }
                result.add(Stroke(brush, shaftBuilder.toImmutable()))

                // 5. Arrowhead tip
                val tipBuilder = SafeBatchBuilder(toolType, baseTime + 210L)
                tipBuilder.add(arrowEndX - 16f, shape.centerY - 14f)
                tipBuilder.add(arrowEndX, shape.centerY)
                tipBuilder.add(arrowEndX - 16f, shape.centerY + 14f)
                result.add(Stroke(brush, tipBuilder.toImmutable()))
            }
            is RecognizedShape.ArrayCellSequence -> {
                // DSA Array / Queue block: [ 0 | 1 | 2 | 3 ]
                val totalW = shape.cellWidth * shape.count
                val left = shape.centerX - totalW / 2f
                val right = shape.centerX + totalW / 2f
                val top = shape.centerY - shape.cellHeight / 2f
                val bottom = shape.centerY + shape.cellHeight / 2f

                // Outer box
                val boxBuilder = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                generatePolygonPoints(corners, boxBuilder)
                result.add(Stroke(brush, boxBuilder.toImmutable()))

                // Internal cell dividers
                for (c in 1 until shape.count) {
                    val divX = left + c * shape.cellWidth
                    val divBuilder = SafeBatchBuilder(toolType, baseTime + 100L + c * 30L)
                    for (i in 0..10) {
                        val t = i / 10f
                        divBuilder.add(divX, top + (bottom - top) * t)
                    }
                    result.add(Stroke(brush, divBuilder.toImmutable()))
                }
            }
            is RecognizedShape.Cloud -> {
                // System Design Cloud (Network / External Service)
                val cloudBuilder = SafeBatchBuilder(toolType, baseTime)
                val rx = shape.width / 2f
                val ry = shape.height / 2f
                val steps = 60
                for (i in 0 until steps) {
                    val angle = (2.0 * PI * i / steps).toFloat()
                    val bump = 1f + 0.15f * sin(5f * angle)
                    cloudBuilder.add(shape.centerX + rx * bump * cos(angle), shape.centerY + ry * bump * sin(angle))
                }
                val startBump = 1f + 0.15f * sin(0f)
                cloudBuilder.add(shape.centerX + rx * startBump, shape.centerY)
                result.add(Stroke(brush, cloudBuilder.toImmutable()))
            }
        }

        return result
    }

    private fun generatePolygonPoints(
        corners: List<Point>,
        builder: SafeBatchBuilder
    ) {
        for (idx in 0 until corners.size - 1) {
            val c1 = corners[idx]
            val c2 = corners[idx + 1]
            val steps = 14
            for (step in 0 until steps) {
                val t = step.toFloat() / steps
                builder.add(c1.x + (c2.x - c1.x) * t, c1.y + (c2.y - c1.y) * t)
            }
        }
        val last = corners.last()
        builder.add(last.x, last.y)
    }

    private fun computeShoelaceArea(points: List<Point>): Float {
        var area = 0.0
        val n = points.size
        for (i in 0 until n) {
            val j = (i + 1) % n
            area += points[i].x.toDouble() * points[j].y.toDouble()
            area -= points[j].x.toDouble() * points[i].y.toDouble()
        }
        return (abs(area) / 2.0).toFloat()
    }

    private fun computePathLength(points: List<Point>): Float {
        var total = 0f
        for (i in 0 until points.size - 1) {
            total += hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y)
        }
        return total
    }

    private fun findTip(points: List<Point>): Point {
        val start = points.first()
        var maxDistIdx = points.lastIndex
        var maxDist = 0f
        for (i in points.indices) {
            val d = hypot(points[i].x - start.x, points[i].y - start.y)
            if (d > maxDist) {
                maxDist = d
                maxDistIdx = i
            }
        }
        return points[maxDistIdx]
    }

    private fun hasArrowTip(points: List<Point>): Boolean {
        if (points.size < 12) return false
        val n = points.size
        val start = points.first()
        var maxDistIdx = 0
        var maxDist = 0f
        for (i in points.indices) {
            val d = hypot(points[i].x - start.x, points[i].y - start.y)
            if (d > maxDist) {
                maxDist = d
                maxDistIdx = i
            }
        }
        // If the tip was reached before the end of the stroke (pen doubled back to draw a barb)
        if (maxDistIdx in (n / 2) until (n - 2)) {
            val tip = points[maxDistIdx]
            val end = points.last()
            val shaftDx = tip.x - start.x
            val shaftDy = tip.y - start.y
            val barbDx = end.x - tip.x
            val barbDy = end.y - tip.y
            val dot = (shaftDx * barbDx + shaftDy * barbDy)
            val barbLen = hypot(barbDx, barbDy)
            if (barbLen >= 15f && dot <= 0f) {
                return true
            }
        }
        return false
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
        val mag = hypot(dx, dy)
        if (mag == 0f) return hypot(pt.x - lineStart.x, pt.y - lineStart.y)
        val area = abs(dy * pt.x - dx * pt.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x)
        return area / mag
    }
}
