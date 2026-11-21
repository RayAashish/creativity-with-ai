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
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

enum class UmlConnectorType {
    ASSOCIATION,           // solid line
    DIRECTED_ASSOCIATION,  // solid line + open arrow
    DEPENDENCY,            // dashed line + open arrow
    GENERALIZATION,        // solid line + hollow triangle (inheritance)
    REALIZATION,           // dashed line + hollow triangle (interface implementation)
    AGGREGATION,           // solid line + hollow diamond
    COMPOSITION            // solid line + filled diamond
}

sealed class RecognizedShape {
    data class Line(val startX: Float, val startY: Float, val endX: Float, val endY: Float) : RecognizedShape()
    data class Arrow(val startX: Float, val startY: Float, val endX: Float, val endY: Float, val hasStartArrow: Boolean = false) : RecognizedShape()
    data class Circle(val centerX: Float, val centerY: Float, val radius: Float) : RecognizedShape()
    data class Ellipse(val centerX: Float, val centerY: Float, val radiusX: Float, val radiusY: Float, val rotationAngle: Float = 0f) : RecognizedShape()
    data class Square(val centerX: Float, val centerY: Float, val size: Float, val rotationAngle: Float = 0f) : RecognizedShape()
    data class Rectangle(val left: Float, val top: Float, val right: Float, val bottom: Float, val rotationAngle: Float = 0f) : RecognizedShape() {
        val centerX: Float get() = (left + right) / 2f
        val centerY: Float get() = (top + bottom) / 2f
        val width: Float get() = abs(right - left)
        val height: Float get() = abs(bottom - top)
    }
    data class Parallelogram(val centerX: Float, val centerY: Float, val width: Float, val height: Float, val skewAngle: Float = 20f, val rotationAngle: Float = 0f) : RecognizedShape()
    data class Triangle(val x1: Float, val y1: Float, val x2: Float, val y2: Float, val x3: Float, val y3: Float) : RecognizedShape()
    data class Diamond(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class Pentagon(val x1: Float, val y1: Float, val x2: Float, val y2: Float, val x3: Float, val y3: Float, val x4: Float, val y4: Float, val x5: Float, val y5: Float) : RecognizedShape()
    data class Hexagon(val centerX: Float, val centerY: Float, val radius: Float) : RecognizedShape()
    data class Star(val centerX: Float, val centerY: Float, val outerRadius: Float, val innerRadius: Float = outerRadius * 0.42f, val points: Int = 5, val rotationAngle: Float = 0f) : RecognizedShape()
    data class Polyline(val vertices: List<ShapeRecognizer.Point>, val isClosed: Boolean = true) : RecognizedShape()

    // System Design Elements
    data class DatabaseCylinder(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class Cloud(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class CachePill(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class BidirectionalArrow(val startX: Float, val startY: Float, val endX: Float, val endY: Float) : RecognizedShape()

    // Legacy DSA Elements
    data class LinkedListNode(val centerX: Float, val centerY: Float, val width: Float, val height: Float) : RecognizedShape()
    data class ArrayCellSequence(val centerX: Float, val centerY: Float, val cellWidth: Float, val cellHeight: Float, val count: Int = 4) : RecognizedShape()

    // Enhanced Parameterized DSA Generators
    data class DynamicArray(
        val centerX: Float,
        val centerY: Float,
        val size: Int = 5,
        val cellWidth: Float = 80f,
        val cellHeight: Float = 80f,
        val showIndices: Boolean = true,
        val isHorizontal: Boolean = true
    ) : RecognizedShape()

    data class DynamicLinkedList(
        val centerX: Float,
        val centerY: Float,
        val nodeCount: Int = 4,
        val isDoubly: Boolean = false,
        val isCircular: Boolean = false,
        val includeHeadNull: Boolean = true,
        val nodeWidth: Float = 140f,
        val nodeHeight: Float = 80f
    ) : RecognizedShape()

    data class Stack(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 140f,
        val height: Float = 260f,
        val slots: Int = 4,
        val showTopPointer: Boolean = true
    ) : RecognizedShape()

    data class Queue(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 320f,
        val height: Float = 100f,
        val slots: Int = 4,
        val showPointers: Boolean = true
    ) : RecognizedShape()

    data class BinaryTreeNode(
        val centerX: Float,
        val centerY: Float,
        val radius: Float = 36f,
        val branchLength: Float = 100f,
        val showChildren: Boolean = true
    ) : RecognizedShape()

    // Full UML Diagram Elements
    data class UmlClass(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 320f,
        val height: Float = 240f,
        val className: String = "User",
        val stereotype: String? = null
    ) : RecognizedShape()

    data class UmlInterface(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 320f,
        val height: Float = 200f,
        val name: String = "Repository"
    ) : RecognizedShape()

    data class UmlActor(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 100f,
        val height: Float = 160f,
        val label: String = "User"
    ) : RecognizedShape()

    data class UmlLifeline(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 140f,
        val height: Float = 380f,
        val label: String = "Service"
    ) : RecognizedShape()

    data class UmlActivationBar(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 32f,
        val height: Float = 180f
    ) : RecognizedShape()

    data class UmlCombinedFragment(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 360f,
        val height: Float = 200f,
        val operator: String = "alt"
    ) : RecognizedShape()

    data class UmlUseCase(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 260f,
        val height: Float = 140f,
        val label: String = "Use Case"
    ) : RecognizedShape()

    data class UmlInitialNode(
        val centerX: Float,
        val centerY: Float,
        val radius: Float = 20f
    ) : RecognizedShape()

    data class UmlFinalNode(
        val centerX: Float,
        val centerY: Float,
        val radius: Float = 24f
    ) : RecognizedShape()

    data class UmlForkJoin(
        val centerX: Float,
        val centerY: Float,
        val width: Float = 240f,
        val height: Float = 16f,
        val isHorizontal: Boolean = true
    ) : RecognizedShape()

    data class UmlConnector(
        val startX: Float,
        val startY: Float,
        val endX: Float,
        val endY: Float,
        val type: UmlConnectorType = UmlConnectorType.ASSOCIATION,
        val multiplicityStart: String? = null,
        val multiplicityEnd: String? = null
    ) : RecognizedShape()
}

class ShapeRecognizer {

    data class Point(val x: Float, val y: Float, val timeMs: Long = 0L)

    /**
     * Attempts to recognize a geometric shape from a collection of points.
     * Implements multi-stage geometric classification:
     * 1. Arc-length resampling & endpoint closure check
     * 2. Smooth continuous curvature vs cornered polygon
     * 3. 4-corner quadrilateral (Square vs Rectangle vs Parallelogram) with rotation preservation
     * 4. 3-corner Triangle (never collapses 4-corner square)
     * 5. Multi-point Star recognition (5-point & 6-point)
     * 6. Universal Polyline Snap (callout/speech bubbles & irregular polygons)
     */
    fun recognize(points: List<Point>): RecognizedShape? {
        if (points.size < 6) return null

        // Strip trailing stationary cluster points where user paused pen
        val cleanPoints = points.toMutableList()
        if (cleanPoints.size > 10) {
            val last = cleanPoints.last()
            var trimIdx = cleanPoints.size - 1
            while (trimIdx > 5 && hypot(cleanPoints[trimIdx].x - last.x, cleanPoints[trimIdx].y - last.y) < 18f) {
                trimIdx--
            }
            if (trimIdx < cleanPoints.size - 2) {
                cleanPoints.subList(trimIdx + 1, cleanPoints.size).clear()
                cleanPoints.add(last)
            }
        }

        val pathLength = computePathLength(cleanPoints)
        if (pathLength < 45f) return null

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
        val centerX = (minX + maxX) / 2f
        val centerY = (minY + maxY) / 2f
        val diag = hypot(boxWidth, boxHeight)

        // Check if stroke is closed: Start and End must physically meet within closure radius!
        val closureThreshold = max(24f, 0.16f * diag).coerceAtMost(65f)
        val isClosed = (directDistance <= closureThreshold) && (directDistance / max(1f, pathLength) < 0.28f)

        // --- 1. OPEN PATH (Lines, Arrows, Open Polylines, Spirals, Zigzags, Staircases) ---
        if (!isClosed) {
            if (pathLength < 45f) return null

            // 1A. Arrow Tip Check
            if (hasArrowTip(cleanPoints)) {
                val tip = findTip(cleanPoints)
                return RecognizedShape.Arrow(start.x, start.y, tip.x, tip.y)
            }

            // 1B. Straight Line Check
            val straightness = directDistance / max(1f, pathLength)
            if (straightness >= 0.88f) {
                return RecognizedShape.Line(start.x, start.y, end.x, end.y)
            }

            // 1C. Open Multi-Segment Polyline (Moto Pad Parity: Zigzags, Spirals, N, Z, Staircases)
            val rdpEpsilon = max(10f, 0.038f * diag)
            val simplified = ramerDouglasPeucker(cleanPoints, rdpEpsilon)
            if (simplified.size >= 2) {
                if (simplified.size == 2) {
                    return RecognizedShape.Line(simplified.first().x, simplified.first().y, simplified.last().x, simplified.last().y)
                } else if (simplified.size in 3..24) {
                    return RecognizedShape.Polyline(simplified, isClosed = false)
                }
            }
            return null
        }

        // --- 2. CLOSED PATH ---
        // Minimum size threshold to prevent regular handwriting letters from accidentally snapping
        if (boxWidth < 45f || boxHeight < 45f || pathLength < 95f) {
            return null
        }

        // Resample with uniform arc-length spacing and ensure closed loop
        val closedContour = cleanPoints.toMutableList()
        if (hypot(end.x - start.x, end.y - start.y) > 4f) {
            closedContour.add(start)
        }
        val resampled = resampleUniform(closedContour, step = 6f)
        if (resampled.size < 8) return null

        // --- Multi-Point Star Detection (5-Point / 6-Point) ---
        val starShape = detectStar(resampled, centerX, centerY, boxWidth, boxHeight)
        if (starShape != null) {
            return starShape
        }

        // --- Corner Detection via Ramer-Douglas-Peucker + Turning Angles ---
        val rdpPoints = ramerDouglasPeucker(resampled, max(10f, 0.038f * diag))
        // Filter out closing duplicate for vertex counting
        val vertices = if (rdpPoints.size > 2 && hypot(rdpPoints.last().x - rdpPoints.first().x, rdpPoints.last().y - rdpPoints.first().y) < 20f) {
            rdpPoints.dropLast(1)
        } else {
            rdpPoints
        }
        val cornerCount = vertices.size

        // --- 4-Corner Quadrilateral Classification (Squares & Rectangles) ---
        // Runs BEFORE smooth curves so squares/rectangles are NEVER collapsed into circles or triangles!
        if (cornerCount == 4) {
            val quad = classifyQuadrilateral(vertices, centerX, centerY, minX, minY, maxX, maxY)
            if (quad != null) return quad
        }

        // --- 3-Corner Triangle Classification ---
        // Strictly only classifies as Triangle when there are genuinely 3 dominant corners!
        if (cornerCount == 3) {
            return snapTriangle(vertices[0], vertices[1], vertices[2])
        }

        val area = computeShoelaceArea(resampled)
        val circularity = if (pathLength > 0f) (4.0 * PI * area / (pathLength.toDouble() * pathLength.toDouble())).toFloat() else 0f
        val aspectRatio = boxWidth / max(1f, boxHeight)

        // --- Circle & Ellipse (Smooth Curve check: cornerCount < 3 and high circularity) ---
        if (cornerCount < 3) {
            if (circularity >= 0.82f && aspectRatio in 0.75f..1.33f) {
                val radius = (boxWidth + boxHeight) / 4f
                return RecognizedShape.Circle(centerX, centerY, radius)
            } else if (circularity >= 0.58f) {
                val rotAngle = computePrincipalAxisAngle(resampled, centerX, centerY)
                return RecognizedShape.Ellipse(centerX, centerY, boxWidth / 2f, boxHeight / 2f, rotAngle)
            }
        }

        val fillRatio = area / max(1f, boxWidth * boxHeight)

        // High circularity & high fill ratio -> Circle / Ellipse (never diamond)
        if (circularity >= 0.74f && fillRatio >= 0.65f) {
            if (aspectRatio in 0.75f..1.33f) {
                return RecognizedShape.Circle(centerX, centerY, (boxWidth + boxHeight) / 4f)
            } else {
                val rotAngle = computePrincipalAxisAngle(resampled, centerX, centerY)
                return RecognizedShape.Ellipse(centerX, centerY, boxWidth / 2f, boxHeight / 2f, rotAngle)
            }
        }

        // --- Diamond / Decision Check (Fill ratio must be near 0.50) ---
        val topPt = cleanPoints.minByOrNull { it.y }
        val bottomPt = cleanPoints.maxByOrNull { it.y }
        val leftPt = cleanPoints.minByOrNull { it.x }
        val rightPt = cleanPoints.maxByOrNull { it.x }
        val isDiamond = topPt != null && bottomPt != null && leftPt != null && rightPt != null &&
                abs(topPt.x - centerX) < boxWidth * 0.22f &&
                abs(bottomPt.x - centerX) < boxWidth * 0.22f &&
                abs(leftPt.y - centerY) < boxHeight * 0.22f &&
                abs(rightPt.y - centerY) < boxHeight * 0.22f &&
                aspectRatio in 0.68f..1.45f &&
                fillRatio in 0.38f..0.62f
        if (isDiamond) {
            return RecognizedShape.Diamond(centerX, centerY, boxWidth, boxHeight)
        }

        // --- Universal Polyline Snap (5 to 16 vertices: callout bubbles, irregular polygons) ---
        if (cornerCount in 5..16) {
            return RecognizedShape.Polyline(vertices, isClosed = true)
        }

        // Fallback: Check fill ratio against bounding box for axis-aligned rectangles
        val expectedPerimeter = 2f * (boxWidth + boxHeight)
        val perimRatio = pathLength / max(1f, expectedPerimeter)
        if (fillRatio >= 0.65f && perimRatio in 0.72f..1.40f) {
            val minSide = min(boxWidth, boxHeight)
            val maxSide = max(boxWidth, boxHeight)
            if (minSide / maxSide >= 0.80f) {
                val size = (boxWidth + boxHeight) / 2f
                return RecognizedShape.Square(centerX, centerY, size)
            } else {
                return RecognizedShape.Rectangle(minX, minY, maxX, maxY)
            }
        }

        return null
    }

    private fun detectStar(
        points: List<Point>,
        cx: Float,
        cy: Float,
        boxW: Float,
        boxH: Float
    ): RecognizedShape.Star? {
        if (points.size < 16) return null
        val radii = points.map { hypot(it.x - cx, it.y - cy) }
        val maxR = radii.maxOrNull() ?: return null
        if (maxR < 25f) return null

        // Count local peaks with distance > 0.60 * maxR
        val n = radii.size
        val peakIndices = mutableListOf<Int>()
        for (i in 0 until n) {
            val prev = radii[(i - 1 + n) % n]
            val curr = radii[i]
            val next = radii[(i + 1) % n]
            if (curr > prev && curr > next && curr >= 0.55f * maxR) {
                // Ensure peak is not too close to previously recorded peak
                val lastIdx = peakIndices.lastOrNull()
                if (lastIdx == null || (i - lastIdx) > n / 14) {
                    peakIndices.add(i)
                }
            }
        }

        if (peakIndices.size > 2) {
            val wrapGap = (n - (peakIndices.last() - peakIndices.first()))
            if (wrapGap < n / 12) {
                peakIndices.removeAt(peakIndices.lastIndex)
            }
        }

        if (peakIndices.size == 5 || peakIndices.size == 6) {
            val outerR = peakIndices.map { radii[it] }.average().toFloat()
            val valleyIndices = mutableListOf<Int>()
            for (i in 0 until n) {
                val prev = radii[(i - 1 + n) % n]
                val curr = radii[i]
                val next = radii[(i + 1) % n]
                if (curr < prev && curr < next && curr <= 0.62f * outerR) {
                    valleyIndices.add(i)
                }
            }
            // Must have alternating valleys to be a star
            if (valleyIndices.size < 4) {
                return null
            }

            val innerR = valleyIndices.map { radii[it] }.average().toFloat().coerceIn(outerR * 0.28f, outerR * 0.58f)

            // Check angular distribution between consecutive peaks
            val angles = peakIndices.map {
                (atan2(points[it].y - cy, points[it].x - cx) + 2.0 * PI).toFloat() % (2.0f * PI.toFloat())
            }.sorted()
            val expectedGap = (2.0 * PI / peakIndices.size).toFloat()
            for (i in 0 until angles.size) {
                val nextA = if (i < angles.size - 1) angles[i + 1] else angles[0] + (2.0f * PI.toFloat())
                val gap = nextA - angles[i]
                if (gap < expectedGap * 0.45f || gap > expectedGap * 1.65f) {
                    return null // Irregular shape, not a symmetric star
                }
            }

            val firstPeak = points[peakIndices[0]]
            val rotAngle = (atan2(firstPeak.y - cy, firstPeak.x - cx) + PI / 2.0).toFloat()
            return RecognizedShape.Star(cx, cy, outerR, innerR, points = peakIndices.size, rotationAngle = rotAngle)
        }
        return null
    }

    private fun classifyQuadrilateral(
        vertices: List<Point>,
        cx: Float,
        cy: Float,
        minX: Float,
        minY: Float,
        maxX: Float,
        maxY: Float
    ): RecognizedShape? {
        val p0 = vertices[0]
        val p1 = vertices[1]
        val p2 = vertices[2]
        val p3 = vertices[3]

        // Calculate side lengths
        val s01 = hypot(p1.x - p0.x, p1.y - p0.y)
        val s12 = hypot(p2.x - p1.x, p2.y - p1.y)
        val s23 = hypot(p3.x - p2.x, p3.y - p2.y)
        val s30 = hypot(p0.x - p3.x, p0.y - p3.y)

        val avgW = (s01 + s23) / 2f
        val avgH = (s12 + s30) / 2f
        val aspect = min(avgW, avgH) / max(1f, max(avgW, avgH))

        // Check internal corner angles (in degrees)
        fun angleBetween(a: Point, b: Point, c: Point): Float {
            val v1x = a.x - b.x
            val v1y = a.y - b.y
            val v2x = c.x - b.x
            val v2y = c.y - b.y
            val dot = v1x * v2x + v1y * v2y
            val cross = v1x * v2y - v1y * v2x
            return abs(Math.toDegrees(atan2(cross.toDouble(), dot.toDouble())).toFloat())
        }

        val ang0 = angleBetween(p3, p0, p1)
        val ang1 = angleBetween(p0, p1, p2)
        val ang2 = angleBetween(p1, p2, p3)
        val ang3 = angleBetween(p2, p3, p0)

        val isRightAngled = abs(ang0 - 90f) <= 24f &&
                abs(ang1 - 90f) <= 24f &&
                abs(ang2 - 90f) <= 24f &&
                abs(ang3 - 90f) <= 24f

        // Orientation angle of edge 0->1
        val edgeAngle = atan2(p1.y - p0.y, p1.x - p0.x)
        val angleDeg = (Math.toDegrees(edgeAngle.toDouble()).toFloat() % 90f + 90f) % 90f
        val snapToAxes = angleDeg <= 12f || angleDeg >= 78f
        val rotAngle = if (snapToAxes) 0f else edgeAngle

        if (isRightAngled) {
            if (aspect >= 0.80f) {
                val size = (avgW + avgH) / 2f
                return RecognizedShape.Square(cx, cy, size, rotationAngle = rotAngle)
            } else {
                if (rotAngle == 0f) {
                    return RecognizedShape.Rectangle(minX, minY, maxX, maxY)
                } else {
                    return RecognizedShape.Rectangle(cx - avgW / 2f, cy - avgH / 2f, cx + avgW / 2f, cy + avgH / 2f, rotationAngle = rotAngle)
                }
            }
        }

        // Opposite sides parallel -> Parallelogram / Rhombus
        val angle01 = atan2(p1.y - p0.y, p1.x - p0.x)
        val angle23 = atan2(p3.y - p2.y, p3.x - p2.x)
        val parallelDiff = abs(Math.toDegrees(abs(angle01 - angle23).toDouble()).toFloat()) % 180f
        if (parallelDiff <= 18f || parallelDiff >= 162f) {
            return RecognizedShape.Parallelogram(cx, cy, avgW, avgH, skewAngle = 20f, rotationAngle = rotAngle)
        }

        // Generic 4-vertex closed polygon (irregular quad)
        return RecognizedShape.Polyline(vertices, isClosed = true)
    }

    private fun snapTriangle(p1: Point, p2: Point, p3: Point): RecognizedShape.Triangle {
        val d12 = hypot(p2.x - p1.x, p2.y - p1.y)
        val d23 = hypot(p3.x - p2.x, p3.y - p2.y)
        val d31 = hypot(p1.x - p3.x, p1.y - p3.y)

        // Snap to crisp vertices
        return RecognizedShape.Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
    }

    private fun computePrincipalAxisAngle(points: List<Point>, cx: Float, cy: Float): Float {
        var m11 = 0.0
        var m20 = 0.0
        var m02 = 0.0
        for (p in points) {
            val dx = (p.x - cx).toDouble()
            val dy = (p.y - cy).toDouble()
            m20 += dx * dx
            m02 += dy * dy
            m11 += dx * dy
        }
        val angle = 0.5 * atan2(2.0 * m11, m20 - m02)
        val deg = (Math.toDegrees(angle).toFloat() % 180f + 180f) % 180f
        return if (deg <= 10f || deg >= 170f || (deg in 80f..100f)) 0f else angle.toFloat()
    }

    private fun resampleUniform(points: List<Point>, step: Float): List<Point> {
        if (points.size < 2) return points
        val res = mutableListOf<Point>()
        res.add(points.first())
        var accumulated = 0f
        for (i in 0 until points.size - 1) {
            val p1 = points[i]
            val p2 = points[i + 1]
            val dist = hypot(p2.x - p1.x, p2.y - p1.y)
            if (dist == 0f) continue
            var covered = 0f
            while (covered + (step - accumulated) <= dist) {
                val t = (covered + step - accumulated) / dist
                val nx = p1.x + (p2.x - p1.x) * t
                val ny = p1.y + (p2.y - p1.y) * t
                res.add(Point(nx, ny, p1.timeMs))
                covered += (step - accumulated)
                accumulated = 0f
            }
            accumulated += (dist - covered)
        }
        return res
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
                return
            }
            lastX = x
            lastY = y
            lastTime += dtMillis
            batch.add(toolType, x, y, lastTime, 1.0f, pressure, 0f, 0f)
        }

        fun toImmutable() = batch.toImmutable()
    }

    fun createStrokeForShape(shape: RecognizedShape, brush: Brush, toolType: InputToolType = InputToolType.STYLUS): Stroke {
        val strokes = createStrokesForShape(shape, brush, toolType)
        return strokes.first()
    }

    fun createStrokesForShape(
        shape: RecognizedShape,
        brush: Brush,
        toolType: InputToolType = InputToolType.STYLUS
    ): List<Stroke> {
        val result = mutableListOf<Stroke>()
        val baseTime = 1000L

        when (shape) {
            is RecognizedShape.Line -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val steps = 14
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    builder.add(shape.startX + (shape.endX - shape.startX) * t, shape.startY + (shape.endY - shape.startY) * t)
                }
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Arrow -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val steps = 14
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    builder.add(shape.startX + (shape.endX - shape.startX) * t, shape.startY + (shape.endY - shape.startY) * t)
                }
                result.add(Stroke(brush, builder.toImmutable()))

                // Arrowhead at end
                val headBuilder = SafeBatchBuilder(toolType, baseTime + 120L)
                val angle = atan2(shape.endY - shape.startY, shape.endX - shape.startX)
                val barbLen = 28f
                val barbAngle = PI.toFloat() / 6f
                val h1X = shape.endX - barbLen * cos(angle - barbAngle)
                val h1Y = shape.endY - barbLen * sin(angle - barbAngle)
                val h2X = shape.endX - barbLen * cos(angle + barbAngle)
                val h2Y = shape.endY - barbLen * sin(angle + barbAngle)

                headBuilder.add(h1X, h1Y)
                headBuilder.add(shape.endX, shape.endY)
                headBuilder.add(h2X, h2Y)
                result.add(Stroke(brush, headBuilder.toImmutable()))
            }
            is RecognizedShape.BidirectionalArrow -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val steps = 14
                for (i in 0..steps) {
                    val t = i.toFloat() / steps
                    builder.add(shape.startX + (shape.endX - shape.startX) * t, shape.startY + (shape.endY - shape.startY) * t)
                }
                result.add(Stroke(brush, builder.toImmutable()))

                val angle = atan2(shape.endY - shape.startY, shape.endX - shape.startX)
                val barbLen = 26f
                val barbAngle = PI.toFloat() / 6f

                // Head at end
                val hEnd = SafeBatchBuilder(toolType, baseTime + 100L)
                hEnd.add(shape.endX - barbLen * cos(angle - barbAngle), shape.endY - barbLen * sin(angle - barbAngle))
                hEnd.add(shape.endX, shape.endY)
                hEnd.add(shape.endX - barbLen * cos(angle + barbAngle), shape.endY - barbLen * sin(angle + barbAngle))
                result.add(Stroke(brush, hEnd.toImmutable()))

                // Head at start
                val hStart = SafeBatchBuilder(toolType, baseTime + 180L)
                hStart.add(shape.startX + barbLen * cos(angle - barbAngle), shape.startY + barbLen * sin(angle - barbAngle))
                hStart.add(shape.startX, shape.startY)
                hStart.add(shape.startX + barbLen * cos(angle + barbAngle), shape.startY + barbLen * sin(angle + barbAngle))
                result.add(Stroke(brush, hStart.toImmutable()))
            }
            is RecognizedShape.Circle -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val steps = 48
                for (i in 0 until steps) {
                    val a = (2.0 * PI * i / steps).toFloat()
                    builder.add(shape.centerX + shape.radius * cos(a), shape.centerY + shape.radius * sin(a))
                }
                builder.add(shape.centerX + shape.radius, shape.centerY)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Ellipse -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val steps = 48
                val cosR = cos(shape.rotationAngle)
                val sinR = sin(shape.rotationAngle)
                for (i in 0 until steps) {
                    val a = (2.0 * PI * i / steps).toFloat()
                    val lx = shape.radiusX * cos(a)
                    val ly = shape.radiusY * sin(a)
                    val wx = lx * cosR - ly * sinR
                    val wy = lx * sinR + ly * cosR
                    builder.add(shape.centerX + wx, shape.centerY + wy)
                }
                val lx0 = shape.radiusX
                builder.add(shape.centerX + lx0 * cosR, shape.centerY + lx0 * sinR)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Square -> {
                val half = shape.size / 2f
                val corners = listOf(
                    Point(-half, -half),
                    Point(half, -half),
                    Point(half, half),
                    Point(-half, half),
                    Point(-half, -half)
                )
                val cosR = cos(shape.rotationAngle)
                val sinR = sin(shape.rotationAngle)
                val worldCorners = corners.map { p ->
                    val wx = p.x * cosR - p.y * sinR
                    val wy = p.x * sinR + p.y * cosR
                    Point(shape.centerX + wx, shape.centerY + wy)
                }
                val builder = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(worldCorners, builder)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Rectangle -> {
                val cx = shape.centerX
                val cy = shape.centerY
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val corners = listOf(
                    Point(-halfW, -halfH),
                    Point(halfW, -halfH),
                    Point(halfW, halfH),
                    Point(-halfW, halfH),
                    Point(-halfW, -halfH)
                )
                val cosR = cos(shape.rotationAngle)
                val sinR = sin(shape.rotationAngle)
                val worldCorners = corners.map { p ->
                    val wx = p.x * cosR - p.y * sinR
                    val wy = p.x * sinR + p.y * cosR
                    Point(cx + wx, cy + wy)
                }
                val builder = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(worldCorners, builder)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Parallelogram -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val skewOffset = shape.height * 0.28f
                val corners = listOf(
                    Point(-halfW + skewOffset, -halfH),
                    Point(halfW, -halfH),
                    Point(halfW - skewOffset, halfH),
                    Point(-halfW, halfH),
                    Point(-halfW + skewOffset, -halfH)
                )
                val cosR = cos(shape.rotationAngle)
                val sinR = sin(shape.rotationAngle)
                val worldCorners = corners.map { p ->
                    val wx = p.x * cosR - p.y * sinR
                    val wy = p.x * sinR + p.y * cosR
                    Point(shape.centerX + wx, shape.centerY + wy)
                }
                val builder = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(worldCorners, builder)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Triangle -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(
                    Point(shape.x1, shape.y1),
                    Point(shape.x2, shape.y2),
                    Point(shape.x3, shape.y3),
                    Point(shape.x1, shape.y1)
                )
                generatePolygonPoints(corners, builder)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Diamond -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val corners = listOf(
                    Point(shape.centerX, shape.centerY - halfH),
                    Point(shape.centerX + halfW, shape.centerY),
                    Point(shape.centerX, shape.centerY + halfH),
                    Point(shape.centerX - halfW, shape.centerY),
                    Point(shape.centerX, shape.centerY - halfH)
                )
                generatePolygonPoints(corners, builder)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Pentagon -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(
                    Point(shape.x1, shape.y1), Point(shape.x2, shape.y2),
                    Point(shape.x3, shape.y3), Point(shape.x4, shape.y4),
                    Point(shape.x5, shape.y5), Point(shape.x1, shape.y1)
                )
                generatePolygonPoints(corners, builder)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Hexagon -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val corners = (0..6).map { i ->
                    val a = (2.0 * PI * i / 6.0).toFloat()
                    Point(shape.centerX + shape.radius * cos(a), shape.centerY + shape.radius * sin(a))
                }
                generatePolygonPoints(corners, builder)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Star -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val numVertices = shape.points * 2
                val cosR = cos(shape.rotationAngle)
                val sinR = sin(shape.rotationAngle)
                val starPts = (0..numVertices).map { i ->
                    val r = if (i % 2 == 0) shape.outerRadius else shape.innerRadius
                    val a = (PI * i / shape.points - PI / 2.0).toFloat()
                    val lx = r * cos(a)
                    val ly = r * sin(a)
                    val wx = lx * cosR - ly * sinR
                    val wy = lx * sinR + ly * cosR
                    Point(shape.centerX + wx, shape.centerY + wy)
                }
                generatePolygonPoints(starPts, builder)
                result.add(Stroke(brush, builder.toImmutable()))
            }
            is RecognizedShape.Polyline -> {
                val builder = SafeBatchBuilder(toolType, baseTime)
                val pts = shape.vertices
                for (i in 0 until pts.size) {
                    val c1 = pts[i]
                    val c2 = if (i < pts.size - 1) pts[i + 1] else if (shape.isClosed) pts[0] else null
                    if (c2 != null) {
                        val steps = 10
                        for (s in 0 until steps) {
                            val t = s.toFloat() / steps
                            builder.add(c1.x + (c2.x - c1.x) * t, c1.y + (c2.y - c1.y) * t)
                        }
                    } else {
                        builder.add(c1.x, c1.y)
                    }
                }
                if (shape.isClosed && pts.isNotEmpty()) {
                    builder.add(pts[0].x, pts[0].y)
                }
                result.add(Stroke(brush, builder.toImmutable()))
            }

            // System Design shapes
            is RecognizedShape.CachePill -> {
                val b = SafeBatchBuilder(toolType, baseTime)
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val r = halfH
                val straightW = max(10f, halfW - r)
                val steps = 48
                for (i in 0..10) {
                    val t = i / 10f
                    b.add(shape.centerX - straightW + 2 * straightW * t, shape.centerY - halfH)
                }
                for (i in 0..steps / 2) {
                    val a = (-PI / 2 + PI * i / (steps / 2)).toFloat()
                    b.add(shape.centerX + straightW + r * cos(a), shape.centerY + r * sin(a))
                }
                for (i in 0..10) {
                    val t = i / 10f
                    b.add(shape.centerX + straightW - 2 * straightW * t, shape.centerY + halfH)
                }
                for (i in 0..steps / 2) {
                    val a = (PI / 2 + PI * i / (steps / 2)).toFloat()
                    b.add(shape.centerX - straightW + r * cos(a), shape.centerY + r * sin(a))
                }
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.DatabaseCylinder -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val rx = halfW
                val ry = shape.height * 0.16f
                val topCenterY = shape.centerY - halfH + ry
                val bottomCenterY = shape.centerY + halfH - ry

                // Stroke 1: Top Ellipse
                val topBuilder = SafeBatchBuilder(toolType, baseTime)
                val steps = 48
                for (i in 0 until steps) {
                    val a = (2.0 * PI * i / steps).toFloat()
                    topBuilder.add(shape.centerX + rx * cos(a), topCenterY + ry * sin(a))
                }
                topBuilder.add(shape.centerX + rx, topCenterY)
                result.add(Stroke(brush, topBuilder.toImmutable()))

                // Stroke 2: Left wall down, bottom rim arc, right wall up
                val bodyBuilder = SafeBatchBuilder(toolType, baseTime + 150L)
                for (i in 0..12) {
                    val t = i / 12f
                    bodyBuilder.add(shape.centerX - rx, topCenterY + (bottomCenterY - topCenterY) * t)
                }
                for (i in 1 until 24) {
                    val a = PI.toFloat() * i / 24f
                    bodyBuilder.add(shape.centerX - rx * cos(a), bottomCenterY + ry * sin(a))
                }
                for (i in 0..12) {
                    val t = i / 12f
                    bodyBuilder.add(shape.centerX + rx, bottomCenterY - (bottomCenterY - topCenterY) * t)
                }
                result.add(Stroke(brush, bodyBuilder.toImmutable()))
            }
            is RecognizedShape.Cloud -> {
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
            is RecognizedShape.LinkedListNode -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val left = shape.centerX - halfW
                val right = shape.centerX + halfW
                val top = shape.centerY - halfH
                val bottom = shape.centerY + halfH

                val boxBuilder = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                generatePolygonPoints(corners, boxBuilder)
                result.add(Stroke(brush, boxBuilder.toImmutable()))

                val divX = right - (shape.width * 0.32f)
                val divBuilder = SafeBatchBuilder(toolType, baseTime + 100L)
                for (i in 0..10) {
                    val t = i / 10f
                    divBuilder.add(divX, top + (bottom - top) * t)
                }
                result.add(Stroke(brush, divBuilder.toImmutable()))
            }
            is RecognizedShape.ArrayCellSequence -> {
                val totalW = shape.cellWidth * shape.count
                val halfW = totalW / 2f
                val halfH = shape.cellHeight / 2f
                val left = shape.centerX - halfW
                val right = shape.centerX + halfW
                val top = shape.centerY - halfH
                val bottom = shape.centerY + halfH

                val outerBuilder = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                generatePolygonPoints(corners, outerBuilder)
                result.add(Stroke(brush, outerBuilder.toImmutable()))

                for (c in 1 until shape.count) {
                    val divX = left + c * shape.cellWidth
                    val divBuilder = SafeBatchBuilder(toolType, baseTime + 50L * c)
                    for (i in 0..10) {
                        val t = i / 10f
                        divBuilder.add(divX, top + (bottom - top) * t)
                    }
                    result.add(Stroke(brush, divBuilder.toImmutable()))
                }
            }

            // Enhanced Parameterized Dynamic Array
            is RecognizedShape.DynamicArray -> {
                val count = shape.size.coerceIn(1, 32)
                if (shape.isHorizontal) {
                    val totalW = shape.cellWidth * count
                    val halfW = totalW / 2f
                    val halfH = shape.cellHeight / 2f
                    val left = shape.centerX - halfW
                    val right = shape.centerX + halfW
                    val top = shape.centerY - halfH
                    val bottom = shape.centerY + halfH

                    val outerBuilder = SafeBatchBuilder(toolType, baseTime)
                    val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                    generatePolygonPoints(corners, outerBuilder)
                    result.add(Stroke(brush, outerBuilder.toImmutable()))

                    for (c in 1 until count) {
                        val divX = left + c * shape.cellWidth
                        val divBuilder = SafeBatchBuilder(toolType, baseTime + 30L * c)
                        for (i in 0..8) {
                            val t = i / 8f
                            divBuilder.add(divX, top + (bottom - top) * t)
                        }
                        result.add(Stroke(brush, divBuilder.toImmutable()))
                    }
                } else {
                    val totalH = shape.cellHeight * count
                    val halfW = shape.cellWidth / 2f
                    val halfH = totalH / 2f
                    val left = shape.centerX - halfW
                    val right = shape.centerX + halfW
                    val top = shape.centerY - halfH
                    val bottom = shape.centerY + halfH

                    val outerBuilder = SafeBatchBuilder(toolType, baseTime)
                    val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                    generatePolygonPoints(corners, outerBuilder)
                    result.add(Stroke(brush, outerBuilder.toImmutable()))

                    for (c in 1 until count) {
                        val divY = top + c * shape.cellHeight
                        val divBuilder = SafeBatchBuilder(toolType, baseTime + 30L * c)
                        for (i in 0..8) {
                            val t = i / 8f
                            divBuilder.add(left + (right - left) * t, divY)
                        }
                        result.add(Stroke(brush, divBuilder.toImmutable()))
                    }
                }
            }

            // Enhanced Parameterized Dynamic Linked List
            is RecognizedShape.DynamicLinkedList -> {
                val count = shape.nodeCount.coerceIn(1, 20)
                val nodeGap = 45f
                val extraLeftPad = if (shape.includeHeadNull) 90f else 0f
                val extraRightPad = if (shape.includeHeadNull && !shape.isCircular) 80f else 0f
                val totalW = count * shape.nodeWidth + (count - 1) * nodeGap + extraLeftPad + extraRightPad
                var curLeft = shape.centerX - totalW / 2f + extraLeftPad
                val halfH = shape.nodeHeight / 2f
                val firstLeft = curLeft

                // HEAD Pointer on Left
                if (shape.includeHeadNull) {
                    val headArrowStartX = curLeft - 48f
                    val headArrowEndX = curLeft
                    val arrowY = shape.centerY
                    val headBuilder = SafeBatchBuilder(toolType, baseTime)
                    for (i in 0..8) headBuilder.add(headArrowStartX + (headArrowEndX - headArrowStartX) * (i / 8f), arrowY)
                    result.add(Stroke(brush, headBuilder.toImmutable()))

                    val headTip = SafeBatchBuilder(toolType, baseTime + 10L)
                    headTip.add(headArrowEndX - 10f, arrowY - 7f)
                    headTip.add(headArrowEndX, arrowY)
                    headTip.add(headArrowEndX - 10f, arrowY + 7f)
                    result.add(Stroke(brush, headTip.toImmutable()))

                    // "HEAD" badge
                    val badgeW = 42f
                    val badgeH = 22f
                    val badgeBox = SafeBatchBuilder(toolType, baseTime + 20L)
                    generatePolygonPoints(listOf(
                        Point(headArrowStartX - badgeW, arrowY - badgeH / 2f),
                        Point(headArrowStartX, arrowY - badgeH / 2f),
                        Point(headArrowStartX, arrowY + badgeH / 2f),
                        Point(headArrowStartX - badgeW, arrowY + badgeH / 2f),
                        Point(headArrowStartX - badgeW, arrowY - badgeH / 2f)
                    ), badgeBox)
                    result.add(Stroke(brush, badgeBox.toImmutable()))

                    // Letter H inside badge
                    val bx = headArrowStartX - badgeW / 2f
                    val hLetter = SafeBatchBuilder(toolType, baseTime + 30L)
                    hLetter.add(bx - 6f, arrowY - 6f)
                    hLetter.add(bx - 6f, arrowY + 6f)
                    result.add(Stroke(brush, hLetter.toImmutable()))
                    val hLetter2 = SafeBatchBuilder(toolType, baseTime + 35L)
                    hLetter2.add(bx + 6f, arrowY - 6f)
                    hLetter2.add(bx + 6f, arrowY + 6f)
                    result.add(Stroke(brush, hLetter2.toImmutable()))
                    val hBar = SafeBatchBuilder(toolType, baseTime + 40L)
                    hBar.add(bx - 6f, arrowY)
                    hBar.add(bx + 6f, arrowY)
                    result.add(Stroke(brush, hBar.toImmutable()))
                }

                for (n in 0 until count) {
                    val curRight = curLeft + shape.nodeWidth
                    val top = shape.centerY - halfH
                    val bottom = shape.centerY + halfH

                    // Node Box
                    val boxBuilder = SafeBatchBuilder(toolType, baseTime + 50L + n * 100L)
                    val corners = listOf(Point(curLeft, top), Point(curRight, top), Point(curRight, bottom), Point(curLeft, bottom), Point(curLeft, top))
                    generatePolygonPoints(corners, boxBuilder)
                    result.add(Stroke(brush, boxBuilder.toImmutable()))

                    // Compartments: Singly [ data | next ] vs Doubly [ prev | data | next ]
                    if (!shape.isDoubly) {
                        val divX = curRight - shape.nodeWidth * 0.35f
                        val divBuilder = SafeBatchBuilder(toolType, baseTime + 50L + n * 100L + 20L)
                        for (i in 0..8) divBuilder.add(divX, top + (bottom - top) * (i / 8f))
                        result.add(Stroke(brush, divBuilder.toImmutable()))
                    } else {
                        val div1X = curLeft + shape.nodeWidth * 0.28f
                        val div2X = curRight - shape.nodeWidth * 0.28f
                        val divBuilder = SafeBatchBuilder(toolType, baseTime + 50L + n * 100L + 20L)
                        for (i in 0..8) divBuilder.add(div1X, top + (bottom - top) * (i / 8f))
                        result.add(Stroke(brush, divBuilder.toImmutable()))
                        val divBuilder2 = SafeBatchBuilder(toolType, baseTime + 50L + n * 100L + 40L)
                        for (i in 0..8) divBuilder2.add(div2X, top + (bottom - top) * (i / 8f))
                        result.add(Stroke(brush, divBuilder2.toImmutable()))
                    }

                    // Arrow to next node
                    if (n < count - 1) {
                        val arrowStartX = curRight
                        val arrowEndX = curRight + nodeGap
                        val arrowY = shape.centerY
                        val arrowBuilder = SafeBatchBuilder(toolType, baseTime + 50L + n * 100L + 60L)
                        for (i in 0..8) arrowBuilder.add(arrowStartX + (arrowEndX - arrowStartX) * (i / 8f), arrowY)
                        result.add(Stroke(brush, arrowBuilder.toImmutable()))

                        val headBuilder = SafeBatchBuilder(toolType, baseTime + 50L + n * 100L + 75L)
                        headBuilder.add(arrowEndX - 10f, arrowY - 7f)
                        headBuilder.add(arrowEndX, arrowY)
                        headBuilder.add(arrowEndX - 10f, arrowY + 7f)
                        result.add(Stroke(brush, headBuilder.toImmutable()))

                        if (shape.isDoubly) {
                            // Back pointer arrow
                            val backY = shape.centerY + 14f
                            val backBuilder = SafeBatchBuilder(toolType, baseTime + 50L + n * 100L + 85L)
                            for (i in 0..8) backBuilder.add(arrowEndX - (arrowEndX - arrowStartX) * (i / 8f), backY)
                            result.add(Stroke(brush, backBuilder.toImmutable()))
                            val backHead = SafeBatchBuilder(toolType, baseTime + 50L + n * 100L + 95L)
                            backHead.add(arrowStartX + 10f, backY - 7f)
                            backHead.add(arrowStartX, backY)
                            backHead.add(arrowStartX + 10f, backY + 7f)
                            result.add(Stroke(brush, backHead.toImmutable()))
                        }
                    }

                    curLeft += shape.nodeWidth + nodeGap
                }

                // NULL / Ground Pointer on Right
                if (shape.includeHeadNull) {
                    val lastRight = curLeft - nodeGap
                    val arrowY = shape.centerY
                    if (!shape.isCircular) {
                        val nullArrowEnd = lastRight + 45f
                        val nullBuilder = SafeBatchBuilder(toolType, baseTime + count * 100L + 60L)
                        for (i in 0..8) nullBuilder.add(lastRight + (nullArrowEnd - lastRight) * (i / 8f), arrowY)
                        result.add(Stroke(brush, nullBuilder.toImmutable()))
                        val nullTip = SafeBatchBuilder(toolType, baseTime + count * 100L + 70L)
                        nullTip.add(nullArrowEnd - 9f, arrowY - 6f)
                        nullTip.add(nullArrowEnd, arrowY)
                        nullTip.add(nullArrowEnd - 9f, arrowY + 6f)
                        result.add(Stroke(brush, nullTip.toImmutable()))

                        // Standard Ground Symbol (3 decreasing bars)
                        val g1 = SafeBatchBuilder(toolType, baseTime + count * 100L + 80L)
                        g1.add(nullArrowEnd + 4f, arrowY - 14f)
                        g1.add(nullArrowEnd + 4f, arrowY + 14f)
                        result.add(Stroke(brush, g1.toImmutable()))
                        val g2 = SafeBatchBuilder(toolType, baseTime + count * 100L + 85L)
                        g2.add(nullArrowEnd + 10f, arrowY - 9f)
                        g2.add(nullArrowEnd + 10f, arrowY + 9f)
                        result.add(Stroke(brush, g2.toImmutable()))
                        val g3 = SafeBatchBuilder(toolType, baseTime + count * 100L + 90L)
                        g3.add(nullArrowEnd + 16f, arrowY - 4f)
                        g3.add(nullArrowEnd + 16f, arrowY + 4f)
                        result.add(Stroke(brush, g3.toImmutable()))
                    } else {
                        // Circular Return Loop
                        val loopY = shape.centerY + halfH + 28f
                        val loopBuilder = SafeBatchBuilder(toolType, baseTime + count * 100L + 60L)
                        loopBuilder.add(lastRight - 15f, shape.centerY + halfH)
                        loopBuilder.add(lastRight - 15f, loopY)
                        loopBuilder.add(firstLeft + 15f, loopY)
                        loopBuilder.add(firstLeft + 15f, shape.centerY + halfH)
                        result.add(Stroke(brush, loopBuilder.toImmutable()))

                        val loopTip = SafeBatchBuilder(toolType, baseTime + count * 100L + 70L)
                        loopTip.add(firstLeft + 10f, shape.centerY + halfH + 10f)
                        loopTip.add(firstLeft + 15f, shape.centerY + halfH)
                        loopTip.add(firstLeft + 20f, shape.centerY + halfH + 10f)
                        result.add(Stroke(brush, loopTip.toImmutable()))
                    }
                }
            }

            // Parameterized Stack
            is RecognizedShape.Stack -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val left = shape.centerX - halfW
                val right = shape.centerX + halfW
                val top = shape.centerY - halfH
                val bottom = shape.centerY + halfH
                val slots = shape.slots.coerceIn(1, 12)

                // U-shaped Container (Left vertical, Bottom horizontal, Right vertical - open at top)
                val uBuilder = SafeBatchBuilder(toolType, baseTime)
                uBuilder.add(left, top)
                uBuilder.add(left, bottom)
                uBuilder.add(right, bottom)
                uBuilder.add(right, top)
                result.add(Stroke(brush, uBuilder.toImmutable()))

                // Internal slot dividers
                val slotH = shape.height / (slots + 0.5f)
                for (s in 1..slots) {
                    val divY = bottom - s * slotH
                    val divBuilder = SafeBatchBuilder(toolType, baseTime + s * 25L)
                    for (i in 0..8) divBuilder.add(left + (right - left) * (i / 8f), divY)
                    result.add(Stroke(brush, divBuilder.toImmutable()))
                }

                // TOP pointer arrow pointing to the topmost slot
                if (shape.showTopPointer) {
                    val topY = bottom - slots * slotH + slotH / 2f
                    val arrowStartX = left - 55f
                    val arrowEndX = left
                    val arrowBuilder = SafeBatchBuilder(toolType, baseTime + 100L)
                    for (i in 0..8) arrowBuilder.add(arrowStartX + (arrowEndX - arrowStartX) * (i / 8f), topY)
                    result.add(Stroke(brush, arrowBuilder.toImmutable()))
                    val tipBuilder = SafeBatchBuilder(toolType, baseTime + 110L)
                    tipBuilder.add(arrowEndX - 9f, topY - 6f)
                    tipBuilder.add(arrowEndX, topY)
                    tipBuilder.add(arrowEndX - 9f, topY + 6f)
                    result.add(Stroke(brush, tipBuilder.toImmutable()))
                }
            }

            // Parameterized Queue
            is RecognizedShape.Queue -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val left = shape.centerX - halfW
                val right = shape.centerX + halfW
                val top = shape.centerY - halfH
                val bottom = shape.centerY + halfH
                val slots = shape.slots.coerceIn(1, 12)

                // Top & Bottom Horizontal walls (open at both ends)
                val topBuilder = SafeBatchBuilder(toolType, baseTime)
                for (i in 0..10) topBuilder.add(left + (right - left) * (i / 10f), top)
                result.add(Stroke(brush, topBuilder.toImmutable()))

                val bottomBuilder = SafeBatchBuilder(toolType, baseTime + 20L)
                for (i in 0..10) bottomBuilder.add(left + (right - left) * (i / 10f), bottom)
                result.add(Stroke(brush, bottomBuilder.toImmutable()))

                // Vertical partition dividers
                val slotW = shape.width / slots
                for (s in 1 until slots) {
                    val divX = left + s * slotW
                    val divBuilder = SafeBatchBuilder(toolType, baseTime + s * 25L)
                    for (i in 0..8) divBuilder.add(divX, top + (bottom - top) * (i / 8f))
                    result.add(Stroke(brush, divBuilder.toImmutable()))
                }

                if (shape.showPointers) {
                    // FRONT / DEQUEUE Arrow on Left (pointing left from queue)
                    val qY = shape.centerY
                    val frontEnd = left - 40f
                    val frontBuilder = SafeBatchBuilder(toolType, baseTime + 80L)
                    for (i in 0..8) frontBuilder.add(left + (frontEnd - left) * (i / 8f), qY)
                    result.add(Stroke(brush, frontBuilder.toImmutable()))
                    val frontTip = SafeBatchBuilder(toolType, baseTime + 90L)
                    frontTip.add(frontEnd + 8f, qY - 6f)
                    frontTip.add(frontEnd, qY)
                    frontTip.add(frontEnd + 8f, qY + 6f)
                    result.add(Stroke(brush, frontTip.toImmutable()))

                    // REAR / ENQUEUE Arrow on Right (pointing into queue)
                    val rearStart = right + 40f
                    val rearBuilder = SafeBatchBuilder(toolType, baseTime + 100L)
                    for (i in 0..8) rearBuilder.add(rearStart + (right - rearStart) * (i / 8f), qY)
                    result.add(Stroke(brush, rearBuilder.toImmutable()))
                    val rearTip = SafeBatchBuilder(toolType, baseTime + 110L)
                    rearTip.add(right + 8f, qY - 6f)
                    rearTip.add(right, qY)
                    rearTip.add(right + 8f, qY + 6f)
                    result.add(Stroke(brush, rearTip.toImmutable()))
                }
            }

            // Parameterized Binary Tree Node
            is RecognizedShape.BinaryTreeNode -> {
                val r = shape.radius
                val rootBuilder = SafeBatchBuilder(toolType, baseTime)
                for (i in 0..32) {
                    val a = (2.0 * PI * i / 32).toFloat()
                    rootBuilder.add(shape.centerX + r * cos(a), shape.centerY + r * sin(a))
                }
                result.add(Stroke(brush, rootBuilder.toImmutable()))

                if (shape.showChildren) {
                    val branchLen = shape.branchLength
                    val childRadius = r * 0.85f
                    val childOffsetY = branchLen * 0.95f
                    val childOffsetX = branchLen * 1.05f

                    // Left child circle
                    val leftCx = shape.centerX - childOffsetX
                    val leftCy = shape.centerY + childOffsetY
                    val leftBranch = SafeBatchBuilder(toolType, baseTime + 40L)
                    leftBranch.add(shape.centerX - r * 0.707f, shape.centerY + r * 0.707f)
                    leftBranch.add(leftCx + childRadius * 0.707f, leftCy - childRadius * 0.707f)
                    result.add(Stroke(brush, leftBranch.toImmutable()))

                    val leftChild = SafeBatchBuilder(toolType, baseTime + 60L)
                    for (i in 0..28) {
                        val a = (2.0 * PI * i / 28).toFloat()
                        leftChild.add(leftCx + childRadius * cos(a), leftCy + childRadius * sin(a))
                    }
                    result.add(Stroke(brush, leftChild.toImmutable()))

                    // Right child circle
                    val rightCx = shape.centerX + childOffsetX
                    val rightCy = shape.centerY + childOffsetY
                    val rightBranch = SafeBatchBuilder(toolType, baseTime + 80L)
                    rightBranch.add(shape.centerX + r * 0.707f, shape.centerY + r * 0.707f)
                    rightBranch.add(rightCx - childRadius * 0.707f, rightCy - childRadius * 0.707f)
                    result.add(Stroke(brush, rightBranch.toImmutable()))

                    val rightChild = SafeBatchBuilder(toolType, baseTime + 100L)
                    for (i in 0..28) {
                        val a = (2.0 * PI * i / 28).toFloat()
                        rightChild.add(rightCx + childRadius * cos(a), rightCy + childRadius * sin(a))
                    }
                    result.add(Stroke(brush, rightChild.toImmutable()))
                }
            }

            // UML Diagram Stencils
            is RecognizedShape.UmlClass -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val left = shape.centerX - halfW
                val right = shape.centerX + halfW
                val top = shape.centerY - halfH
                val bottom = shape.centerY + halfH

                // Outer Class Box
                val outerBuilder = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                generatePolygonPoints(corners, outerBuilder)
                result.add(Stroke(brush, outerBuilder.toImmutable()))

                // Divider 1: Header to Attributes
                val h1 = top + shape.height * 0.28f
                val div1 = SafeBatchBuilder(toolType, baseTime + 50L)
                for (i in 0..10) div1.add(left + (right - left) * (i / 10f), h1)
                result.add(Stroke(brush, div1.toImmutable()))

                // Divider 2: Attributes to Methods
                val h2 = top + shape.height * 0.62f
                val div2 = SafeBatchBuilder(toolType, baseTime + 90L)
                for (i in 0..10) div2.add(left + (right - left) * (i / 10f), h2)
                result.add(Stroke(brush, div2.toImmutable()))
            }
            is RecognizedShape.UmlInterface -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val left = shape.centerX - halfW
                val right = shape.centerX + halfW
                val top = shape.centerY - halfH
                val bottom = shape.centerY + halfH

                val outerBuilder = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                generatePolygonPoints(corners, outerBuilder)
                result.add(Stroke(brush, outerBuilder.toImmutable()))

                val h1 = top + shape.height * 0.35f
                val div1 = SafeBatchBuilder(toolType, baseTime + 50L)
                for (i in 0..10) div1.add(left + (right - left) * (i / 10f), h1)
                result.add(Stroke(brush, div1.toImmutable()))
            }
            is RecognizedShape.UmlActor -> {
                // Stick Figure: Head circle, spine, arms, legs
                val headR = shape.width * 0.22f
                val headY = shape.centerY - shape.height * 0.32f
                val headBuilder = SafeBatchBuilder(toolType, baseTime)
                for (i in 0 until 32) {
                    val a = (2.0 * PI * i / 32).toFloat()
                    headBuilder.add(shape.centerX + headR * cos(a), headY + headR * sin(a))
                }
                headBuilder.add(shape.centerX + headR, headY)
                result.add(Stroke(brush, headBuilder.toImmutable()))

                // Spine
                val spineTop = headY + headR
                val spineBottom = shape.centerY + shape.height * 0.15f
                val spineBuilder = SafeBatchBuilder(toolType, baseTime + 40L)
                for (i in 0..10) spineBuilder.add(shape.centerX, spineTop + (spineBottom - spineTop) * (i / 10f))
                result.add(Stroke(brush, spineBuilder.toImmutable()))

                // Arms
                val armsY = spineTop + (spineBottom - spineTop) * 0.35f
                val armW = shape.width * 0.45f
                val armsBuilder = SafeBatchBuilder(toolType, baseTime + 80L)
                for (i in 0..10) armsBuilder.add(shape.centerX - armW + 2 * armW * (i / 10f), armsY)
                result.add(Stroke(brush, armsBuilder.toImmutable()))

                // Legs
                val legY = shape.centerY + shape.height * 0.48f
                val legW = shape.width * 0.40f
                val legBuilder = SafeBatchBuilder(toolType, baseTime + 120L)
                legBuilder.add(shape.centerX - legW, legY)
                legBuilder.add(shape.centerX, spineBottom)
                legBuilder.add(shape.centerX + legW, legY)
                result.add(Stroke(brush, legBuilder.toImmutable()))
            }
            is RecognizedShape.UmlLifeline -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val top = shape.centerY - halfH
                val bottom = shape.centerY + halfH
                val boxH = 50f

                // Header Box
                val boxBuilder = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(
                    Point(shape.centerX - halfW, top),
                    Point(shape.centerX + halfW, top),
                    Point(shape.centerX + halfW, top + boxH),
                    Point(shape.centerX - halfW, top + boxH),
                    Point(shape.centerX - halfW, top)
                )
                generatePolygonPoints(corners, boxBuilder)
                result.add(Stroke(brush, boxBuilder.toImmutable()))

                // Vertical dashed lifeline
                var curY = top + boxH + 8f
                var dashIndex = 0
                while (curY < bottom) {
                    val dashEnd = min(bottom, curY + 16f)
                    val dashBuilder = SafeBatchBuilder(toolType, baseTime + 50L + dashIndex * 15L)
                    dashBuilder.add(shape.centerX, curY)
                    dashBuilder.add(shape.centerX, dashEnd)
                    result.add(Stroke(brush, dashBuilder.toImmutable()))
                    curY += 28f
                    dashIndex++
                }
            }
            is RecognizedShape.UmlActivationBar -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val corners = listOf(
                    Point(shape.centerX - halfW, shape.centerY - halfH),
                    Point(shape.centerX + halfW, shape.centerY - halfH),
                    Point(shape.centerX + halfW, shape.centerY + halfH),
                    Point(shape.centerX - halfW, shape.centerY + halfH),
                    Point(shape.centerX - halfW, shape.centerY - halfH)
                )
                val b = SafeBatchBuilder(toolType, baseTime)
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.UmlCombinedFragment -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val left = shape.centerX - halfW
                val right = shape.centerX + halfW
                val top = shape.centerY - halfH
                val bottom = shape.centerY + halfH

                // Outer Box
                val b = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(Point(left, top), Point(right, top), Point(right, bottom), Point(left, bottom), Point(left, top))
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))

                // Pentagonal operator tag in top-left
                val tagW = 75f
                val tagH = 34f
                val tagBuilder = SafeBatchBuilder(toolType, baseTime + 40L)
                tagBuilder.add(left, top + tagH)
                tagBuilder.add(left + tagW, top + tagH)
                tagBuilder.add(left + tagW + 12f, top + tagH / 2f)
                tagBuilder.add(left + tagW, top)
                result.add(Stroke(brush, tagBuilder.toImmutable()))
            }
            is RecognizedShape.UmlUseCase -> {
                // Oval container
                val b = SafeBatchBuilder(toolType, baseTime)
                val rx = shape.width / 2f
                val ry = shape.height / 2f
                for (i in 0 until 48) {
                    val a = (2.0 * PI * i / 48).toFloat()
                    b.add(shape.centerX + rx * cos(a), shape.centerY + ry * sin(a))
                }
                b.add(shape.centerX + rx, shape.centerY)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.UmlInitialNode -> {
                // Solid dot
                val b = SafeBatchBuilder(toolType, baseTime)
                val r = shape.radius
                for (layer in 1..4) {
                    val cr = r * (layer / 4f)
                    for (i in 0 until 24) {
                        val a = (2.0 * PI * i / 24).toFloat()
                        b.add(shape.centerX + cr * cos(a), shape.centerY + cr * sin(a))
                    }
                }
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.UmlFinalNode -> {
                // Bullseye
                val outerB = SafeBatchBuilder(toolType, baseTime)
                for (i in 0 until 36) {
                    val a = (2.0 * PI * i / 36).toFloat()
                    outerB.add(shape.centerX + shape.radius * cos(a), shape.centerY + shape.radius * sin(a))
                }
                outerB.add(shape.centerX + shape.radius, shape.centerY)
                result.add(Stroke(brush, outerB.toImmutable()))

                val innerR = shape.radius * 0.55f
                val innerB = SafeBatchBuilder(toolType, baseTime + 40L)
                for (layer in 1..3) {
                    val cr = innerR * (layer / 3f)
                    for (i in 0 until 24) {
                        val a = (2.0 * PI * i / 24).toFloat()
                        innerB.add(shape.centerX + cr * cos(a), shape.centerY + cr * sin(a))
                    }
                }
                result.add(Stroke(brush, innerB.toImmutable()))
            }
            is RecognizedShape.UmlForkJoin -> {
                val halfW = shape.width / 2f
                val halfH = shape.height / 2f
                val b = SafeBatchBuilder(toolType, baseTime)
                val corners = listOf(
                    Point(shape.centerX - halfW, shape.centerY - halfH),
                    Point(shape.centerX + halfW, shape.centerY - halfH),
                    Point(shape.centerX + halfW, shape.centerY + halfH),
                    Point(shape.centerX - halfW, shape.centerY + halfH),
                    Point(shape.centerX - halfW, shape.centerY - halfH)
                )
                generatePolygonPoints(corners, b)
                result.add(Stroke(brush, b.toImmutable()))
            }
            is RecognizedShape.UmlConnector -> {
                // Connector line
                val lineB = SafeBatchBuilder(toolType, baseTime)
                for (i in 0..14) {
                    val t = i / 14f
                    lineB.add(shape.startX + (shape.endX - shape.startX) * t, shape.startY + (shape.endY - shape.startY) * t)
                }
                result.add(Stroke(brush, lineB.toImmutable()))

                // Head shape based on UML connector type
                val angle = atan2(shape.endY - shape.startY, shape.endX - shape.startX)
                val headLen = 24f
                val headB = SafeBatchBuilder(toolType, baseTime + 60L)

                when (shape.type) {
                    UmlConnectorType.ASSOCIATION -> {
                        // Plain line, no head
                    }
                    UmlConnectorType.DIRECTED_ASSOCIATION, UmlConnectorType.DEPENDENCY -> {
                        // Open V-arrowhead
                        val a1 = angle - PI.toFloat() / 6f
                        val a2 = angle + PI.toFloat() / 6f
                        headB.add(shape.endX - headLen * cos(a1), shape.endY - headLen * sin(a1))
                        headB.add(shape.endX, shape.endY)
                        headB.add(shape.endX - headLen * cos(a2), shape.endY - headLen * sin(a2))
                        result.add(Stroke(brush, headB.toImmutable()))
                    }
                    UmlConnectorType.GENERALIZATION, UmlConnectorType.REALIZATION -> {
                        // Hollow triangle arrowhead (inheritance / realization)
                        val a1 = angle - PI.toFloat() / 6f
                        val a2 = angle + PI.toFloat() / 6f
                        val c1 = Point(shape.endX - headLen * cos(a1), shape.endY - headLen * sin(a1))
                        val c2 = Point(shape.endX - headLen * cos(a2), shape.endY - headLen * sin(a2))
                        val trianglePts = listOf(Point(shape.endX, shape.endY), c1, c2, Point(shape.endX, shape.endY))
                        generatePolygonPoints(trianglePts, headB)
                        result.add(Stroke(brush, headB.toImmutable()))
                    }
                    UmlConnectorType.AGGREGATION, UmlConnectorType.COMPOSITION -> {
                        // Diamond head
                        val dLen = 22f
                        val dWidth = 12f
                        val backX = shape.endX - dLen * cos(angle)
                        val backY = shape.endY - dLen * sin(angle)
                        val perpAngle = angle + PI.toFloat() / 2f
                        val midX = shape.endX - (dLen / 2f) * cos(angle)
                        val midY = shape.endY - (dLen / 2f) * sin(angle)
                        val leftX = midX + dWidth * cos(perpAngle)
                        val leftY = midY + dWidth * sin(perpAngle)
                        val rightX = midX - dWidth * cos(perpAngle)
                        val rightY = midY - dWidth * sin(perpAngle)

                        val diamondPts = listOf(
                            Point(shape.endX, shape.endY),
                            Point(leftX, leftY),
                            Point(backX, backY),
                            Point(rightX, rightY),
                            Point(shape.endX, shape.endY)
                        )
                        generatePolygonPoints(diamondPts, headB)
                        result.add(Stroke(brush, headB.toImmutable()))
                    }
                }
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
