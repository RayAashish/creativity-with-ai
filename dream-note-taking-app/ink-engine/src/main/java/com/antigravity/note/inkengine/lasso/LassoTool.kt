package com.antigravity.note.inkengine.lasso

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.graphics.RectF
import androidx.ink.brush.Brush
import androidx.ink.brush.InputToolType
import androidx.ink.strokes.MutableStrokeInputBatch
import androidx.ink.strokes.Stroke
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

enum class LassoMode {
    IDLE,
    SELECTING,
    TRANSFORMING
}

enum class TransformHandle {
    NONE,
    BODY,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
}

data class TransformedStrokesResult(
    val oldStrokes: List<Stroke>,
    val newStrokes: List<Stroke>
)

class LassoTool {

    var mode: LassoMode = LassoMode.IDLE
        private set

    // Lasso path currently being drawn
    val lassoPoints = mutableListOf<PointF>()
    private val lassoPath by lazy { Path() }

    // Currently selected strokes
    val selectedStrokes = mutableListOf<Stroke>()
    val selectionBounds = RectF()

    // Transform tracking
    private var activeHandle = TransformHandle.NONE
    private var lastTouchX = 0f
    private var lastTouchY = 0f
    private val handleTouchRadius = 80f

    var onStrokesTransformed: ((oldStrokes: List<Stroke>, newStrokes: List<Stroke>) -> Unit)? = null

    // Corner handle rects for drawing & hit-testing
    private val handleTL = RectF()
    private val handleTR = RectF()
    private val handleBL = RectF()
    private val handleBR = RectF()

    // Paints (lazy to allow isolated JVM unit testing)
    private val lassoPathPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 3f
            color = Color.parseColor("#1E88E5")
            pathEffect = DashPathEffect(floatArrayOf(12f, 8f), 0f)
        }
    }

    private val selectionBoxPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2.5f
            color = Color.parseColor("#1565C0")
        }
    }

    private val selectionFillPaint by lazy {
        Paint().apply {
            style = Paint.Style.FILL
            color = Color.parseColor("#102196F3")
        }
    }

    private val handlePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.parseColor("#1976D2")
        }
    }

    private val handleBorderPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 3f
            color = Color.WHITE
        }
    }

    fun startLasso(worldX: Float, worldY: Float) {
        // If clicking on existing selection handle or body, switch to transform
        if (mode == LassoMode.TRANSFORMING && selectedStrokes.isNotEmpty()) {
            val handle = hitTestHandle(worldX, worldY)
            if (handle != TransformHandle.NONE) {
                activeHandle = handle
                lastTouchX = worldX
                lastTouchY = worldY
                return
            }
        }

        // Otherwise start fresh selection loop
        mode = LassoMode.SELECTING
        lassoPoints.clear()
        lassoPoints.add(PointF(worldX, worldY))
        lassoPath.reset()
        lassoPath.moveTo(worldX, worldY)
        selectedStrokes.clear()
    }

    fun continueLasso(worldX: Float, worldY: Float): Boolean {
        if (mode == LassoMode.SELECTING) {
            lassoPoints.add(PointF(worldX, worldY))
            lassoPath.lineTo(worldX, worldY)
            return true
        } else if (mode == LassoMode.TRANSFORMING && activeHandle != TransformHandle.NONE) {
            val dx = worldX - lastTouchX
            val dy = worldY - lastTouchY

            when (activeHandle) {
                TransformHandle.BODY -> {
                    translateSelected(dx, dy)
                }
                TransformHandle.BOTTOM_RIGHT -> {
                    scaleSelected(dx, dy, fromLeft = false, fromTop = false)
                }
                TransformHandle.TOP_LEFT -> {
                    scaleSelected(dx, dy, fromLeft = true, fromTop = true)
                }
                TransformHandle.TOP_RIGHT -> {
                    scaleSelected(dx, dy, fromLeft = false, fromTop = true)
                }
                TransformHandle.BOTTOM_LEFT -> {
                    scaleSelected(dx, dy, fromLeft = true, fromTop = false)
                }
                TransformHandle.NONE -> {}
            }

            lastTouchX = worldX
            lastTouchY = worldY
            return true
        }
        return false
    }

    fun finishLasso(allCanvasStrokes: List<Stroke>): Boolean {
        if (mode == LassoMode.SELECTING) {
            if (lassoPoints.size < 4) {
                clearSelection()
                return false
            }

            // Close the lasso loop
            val first = lassoPoints.first()
            lassoPath.lineTo(first.x, first.y)

            // Select strokes inside polygon
            selectedStrokes.clear()
            for (stroke in allCanvasStrokes) {
                val box = stroke.shape.computeBoundingBox() ?: continue
                val centerX = (box.xMin + box.xMax) / 2f
                val centerY = (box.yMin + box.yMax) / 2f
                if (isPointInPolygon(centerX, centerY, lassoPoints)) {
                    selectedStrokes.add(stroke)
                }
            }

            if (selectedStrokes.isNotEmpty()) {
                mode = LassoMode.TRANSFORMING
                recomputeSelectionBounds()
                lassoPoints.clear()
                lassoPath.reset()
                return true
            } else {
                clearSelection()
                return false
            }
        } else if (mode == LassoMode.TRANSFORMING) {
            activeHandle = TransformHandle.NONE
            return true
        }
        return false
    }

    companion object {
        var clipboardStrokes: List<Stroke> = emptyList()
    }

    fun selectStrokes(strokes: List<Stroke>) {
        clearSelection()
        if (strokes.isEmpty()) return
        selectedStrokes.addAll(strokes)
        mode = LassoMode.TRANSFORMING
        recomputeSelectionBounds()
    }

    fun copySelected(): Int {
        if (selectedStrokes.isEmpty()) return 0
        clipboardStrokes = selectedStrokes.toList()
        return clipboardStrokes.size
    }

    fun pasteClipboard(offsetX: Float = 40f, offsetY: Float = 40f): List<Stroke> {
        if (clipboardStrokes.isEmpty()) return emptyList()
        val pasted = mutableListOf<Stroke>()
        for (stroke in clipboardStrokes) {
            val newBatch = MutableStrokeInputBatch()
            val inputs = stroke.inputs
            var lastX = Float.NaN
            var lastY = Float.NaN
            var lastTime = -1L
            for (i in 0 until inputs.size) {
                val pt = inputs.get(i)
                val targetX = pt.x + offsetX
                val targetY = pt.y + offsetY
                if (!lastX.isNaN() && kotlin.math.hypot(targetX - lastX, targetY - lastY) < 0.1f) {
                    continue
                }
                val safeTime = if (pt.elapsedTimeMillis <= lastTime) lastTime + 2L else pt.elapsedTimeMillis
                val safeTilt = if (pt.tiltRadians < 0f) -1f else pt.tiltRadians.coerceIn(0f, (Math.PI / 2).toFloat())
                val safeOrientation = pt.orientationRadians.coerceIn(-Math.PI.toFloat(), Math.PI.toFloat())
                val safePressure = pt.pressure.coerceIn(0.01f, 1.0f)
                newBatch.add(
                    pt.toolType,
                    targetX,
                    targetY,
                    safeTime,
                    pt.strokeUnitLengthCm,
                    safePressure,
                    safeTilt,
                    safeOrientation
                )
                lastX = targetX
                lastY = targetY
                lastTime = safeTime
            }
            if (newBatch.size > 0) {
                pasted.add(Stroke(stroke.brush, newBatch.toImmutable()))
            }
        }
        selectedStrokes.clear()
        selectedStrokes.addAll(pasted)
        mode = LassoMode.TRANSFORMING
        recomputeSelectionBounds()
        return pasted
    }

    fun clearSelection() {
        mode = LassoMode.IDLE
        activeHandle = TransformHandle.NONE
        lassoPoints.clear()
        lassoPath.reset()
        selectedStrokes.clear()
        selectionBounds.setEmpty()
    }

    fun duplicateSelected(): List<Stroke> {
        if (selectedStrokes.isEmpty()) return emptyList()
        val duplicated = mutableListOf<Stroke>()
        for (stroke in selectedStrokes) {
            val newBatch = MutableStrokeInputBatch()
            val inputs = stroke.inputs
            var lastX = Float.NaN
            var lastY = Float.NaN
            var lastTime = -1L
            for (i in 0 until inputs.size) {
                val pt = inputs.get(i)
                val targetX = pt.x + 30f
                val targetY = pt.y + 30f
                if (!lastX.isNaN() && kotlin.math.hypot(targetX - lastX, targetY - lastY) < 0.1f) {
                    continue
                }
                val safeTime = if (pt.elapsedTimeMillis <= lastTime) lastTime + 2L else pt.elapsedTimeMillis
                val safeTilt = if (pt.tiltRadians < 0f) -1f else pt.tiltRadians.coerceIn(0f, (Math.PI / 2).toFloat())
                val safeOrientation = pt.orientationRadians.coerceIn(-Math.PI.toFloat(), Math.PI.toFloat())
                val safePressure = pt.pressure.coerceIn(0.01f, 1.0f)
                newBatch.add(
                    pt.toolType,
                    targetX,
                    targetY,
                    safeTime,
                    pt.strokeUnitLengthCm,
                    safePressure,
                    safeTilt,
                    safeOrientation
                )
                lastX = targetX
                lastY = targetY
                lastTime = safeTime
            }
            if (newBatch.size > 0) {
                duplicated.add(Stroke(stroke.brush, newBatch.toImmutable()))
            }
        }
        selectedStrokes.clear()
        selectedStrokes.addAll(duplicated)
        recomputeSelectionBounds()
        return duplicated
    }

    fun changeColorSelected(newColor: Int): TransformedStrokesResult {
        if (selectedStrokes.isEmpty()) return TransformedStrokesResult(emptyList(), emptyList())
        val oldStrokes = selectedStrokes.toList()
        val newStrokes = mutableListOf<Stroke>()

        for (stroke in selectedStrokes) {
            val oldBrush = stroke.brush
            val newBrush = Brush.createWithColorIntArgb(
                oldBrush.family,
                newColor,
                oldBrush.size,
                oldBrush.epsilon
            )
            newStrokes.add(stroke.copy(newBrush))
        }

        selectedStrokes.clear()
        selectedStrokes.addAll(newStrokes)
        return TransformedStrokesResult(oldStrokes, newStrokes)
    }

    fun translateSelected(dx: Float, dy: Float) {
        if (selectedStrokes.isEmpty()) return
        val oldStrokes = selectedStrokes.toList()
        val updated = mutableListOf<Stroke>()
        for (stroke in selectedStrokes) {
            val newBatch = MutableStrokeInputBatch()
            val inputs = stroke.inputs
            for (i in 0 until inputs.size) {
                val pt = inputs.get(i)
                newBatch.add(
                    pt.toolType,
                    pt.x + dx,
                    pt.y + dy,
                    pt.elapsedTimeMillis,
                    pt.strokeUnitLengthCm,
                    pt.pressure.coerceIn(0.1f, 1.0f),
                    pt.tiltRadians.coerceIn(0f, 1.57f),
                    pt.orientationRadians
                )
            }
            updated.add(Stroke(stroke.brush, newBatch.toImmutable()))
        }
        selectedStrokes.clear()
        selectedStrokes.addAll(updated)
        selectionBounds.offset(dx, dy)
        updateHandles()
        onStrokesTransformed?.invoke(oldStrokes, updated)
    }

    private fun scaleSelected(dx: Float, dy: Float, fromLeft: Boolean, fromTop: Boolean) {
        val oldWidth = selectionBounds.width()
        val oldHeight = selectionBounds.height()
        if (oldWidth <= 15f || oldHeight <= 15f) return

        val scaleX = if (fromLeft) (oldWidth - dx) / oldWidth else (oldWidth + dx) / oldWidth
        val scaleY = if (fromTop) (oldHeight - dy) / oldHeight else (oldHeight + dy) / oldHeight

        // Clamp to prevent negative or extreme scale
        val clampedScaleX = scaleX.coerceIn(0.15f, 6.0f)
        val clampedScaleY = scaleY.coerceIn(0.15f, 6.0f)

        val pivotX = if (fromLeft) selectionBounds.right else selectionBounds.left
        val pivotY = if (fromTop) selectionBounds.bottom else selectionBounds.top

        val oldStrokes = selectedStrokes.toList()
        val updated = mutableListOf<Stroke>()
        for (stroke in selectedStrokes) {
            val newBatch = MutableStrokeInputBatch()
            val inputs = stroke.inputs
            for (i in 0 until inputs.size) {
                val pt = inputs.get(i)
                val newX = pivotX + (pt.x - pivotX) * clampedScaleX
                val newY = pivotY + (pt.y - pivotY) * clampedScaleY
                newBatch.add(
                    pt.toolType,
                    newX,
                    newY,
                    pt.elapsedTimeMillis,
                    pt.strokeUnitLengthCm,
                    pt.pressure.coerceIn(0.1f, 1.0f),
                    pt.tiltRadians.coerceIn(0f, 1.57f),
                    pt.orientationRadians
                )
            }
            updated.add(Stroke(stroke.brush, newBatch.toImmutable()))
        }
        selectedStrokes.clear()
        selectedStrokes.addAll(updated)
        recomputeSelectionBounds()
        onStrokesTransformed?.invoke(oldStrokes, updated)
    }

    private fun recomputeSelectionBounds() {
        if (selectedStrokes.isEmpty()) {
            selectionBounds.setEmpty()
            return
        }

        var minX = Float.MAX_VALUE
        var maxX = -Float.MAX_VALUE
        var minY = Float.MAX_VALUE
        var maxY = -Float.MAX_VALUE

        for (stroke in selectedStrokes) {
            val box = stroke.shape.computeBoundingBox() ?: continue
            minX = min(minX, box.xMin)
            maxX = max(maxX, box.xMax)
            minY = min(minY, box.yMin)
            maxY = max(maxY, box.yMax)
        }

        selectionBounds.set(minX - 12f, minY - 12f, maxX + 12f, maxY + 12f)
        updateHandles()
    }

    private fun updateHandles() {
        val hr = 24f
        handleTL.set(selectionBounds.left - hr, selectionBounds.top - hr, selectionBounds.left + hr, selectionBounds.top + hr)
        handleTR.set(selectionBounds.right - hr, selectionBounds.top - hr, selectionBounds.right + hr, selectionBounds.top + hr)
        handleBL.set(selectionBounds.left - hr, selectionBounds.bottom - hr, selectionBounds.left + hr, selectionBounds.bottom + hr)
        handleBR.set(selectionBounds.right - hr, selectionBounds.bottom - hr, selectionBounds.right + hr, selectionBounds.bottom + hr)
    }

    fun hitTest(worldX: Float, worldY: Float): Boolean {
        return hitTestHandle(worldX, worldY) != TransformHandle.NONE
    }

    private fun hitTestHandle(worldX: Float, worldY: Float): TransformHandle {
        if (hypot(worldX - handleTL.centerX(), worldY - handleTL.centerY()) < handleTouchRadius) return TransformHandle.TOP_LEFT
        if (hypot(worldX - handleTR.centerX(), worldY - handleTR.centerY()) < handleTouchRadius) return TransformHandle.TOP_RIGHT
        if (hypot(worldX - handleBL.centerX(), worldY - handleBL.centerY()) < handleTouchRadius) return TransformHandle.BOTTOM_LEFT
        if (hypot(worldX - handleBR.centerX(), worldY - handleBR.centerY()) < handleTouchRadius) return TransformHandle.BOTTOM_RIGHT
        if (selectionBounds.contains(worldX, worldY)) return TransformHandle.BODY
        return TransformHandle.NONE
    }

    fun draw(canvas: Canvas) {
        if (mode == LassoMode.SELECTING) {
            canvas.drawPath(lassoPath, lassoPathPaint)
        } else if (mode == LassoMode.TRANSFORMING && !selectionBounds.isEmpty) {
            // Draw selection box & tint
            canvas.drawRect(selectionBounds, selectionFillPaint)
            canvas.drawRect(selectionBounds, selectionBoxPaint)

            // Draw corner handles
            drawHandle(canvas, handleTL)
            drawHandle(canvas, handleTR)
            drawHandle(canvas, handleBL)
            drawHandle(canvas, handleBR)
        }
    }

    private fun drawHandle(canvas: Canvas, rect: RectF) {
        val cx = rect.centerX()
        val cy = rect.centerY()
        canvas.drawCircle(cx, cy, 18f, handlePaint)
        canvas.drawCircle(cx, cy, 18f, handleBorderPaint)
    }

    private fun isPointInPolygon(x: Float, y: Float, polygon: List<PointF>): Boolean {
        var inside = false
        var j = polygon.size - 1
        for (i in polygon.indices) {
            val xi = polygon[i].x
            val yi = polygon[i].y
            val xj = polygon[j].x
            val yj = polygon[j].y

            val intersect = ((yi > y) != (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
            if (intersect) inside = !inside
            j = i
        }
        return inside
    }
}
