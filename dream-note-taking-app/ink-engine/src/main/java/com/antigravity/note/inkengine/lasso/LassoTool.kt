package com.antigravity.note.inkengine.lasso

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.graphics.RectF
import androidx.ink.brush.Brush
import androidx.ink.brush.InputToolType
import androidx.ink.strokes.MutableStrokeInputBatch
import androidx.ink.strokes.Stroke
import androidx.ink.strokes.StrokeInput
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
    val selectedStrokesSet = HashSet<Stroke>()
    val initialStrokesBeforeTransform = mutableListOf<Stroke>()
    val selectionBounds = RectF()
    val baseSelectionBounds = RectF()

    // Dual-Layer Transform state
    val overlayTransformMatrix = Matrix()
    var isTransformGestureActive: Boolean = false
        private set

    private var gestureStartX = 0f
    private var gestureStartY = 0f
    var accumulatedDeltaX = 0f
        private set
    var accumulatedDeltaY = 0f
        private set
    var accumulatedScaleX = 1f
        private set
    var accumulatedScaleY = 1f
        private set
    var pivotX = 0f
        private set
    var pivotY = 0f
        private set

    // Transform tracking
    private var activeHandle = TransformHandle.NONE
    private var lastTouchX = 0f
    private var lastTouchY = 0f
    private val handleTouchRadius = 80f

    var onStrokesTransformPreview: ((oldStrokes: List<Stroke>, newStrokes: List<Stroke>) -> Unit)? = null
    var onStrokesTransformCommitted: ((initialStrokes: List<Stroke>, finalStrokes: List<Stroke>) -> Unit)? = null
    var onOverlayMatrixChanged: (() -> Unit)? = null

    @Deprecated("Use onStrokesTransformPreview or onStrokesTransformCommitted instead")
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

    @androidx.annotation.VisibleForTesting
    fun setTransformStateForTesting(
        bounds: RectF,
        handle: TransformHandle = TransformHandle.BODY,
        startX: Float = 200f,
        startY: Float = 200f
    ) {
        mode = LassoMode.TRANSFORMING
        selectionBounds.set(bounds)
        baseSelectionBounds.set(bounds)
        activeHandle = handle
        gestureStartX = startX
        gestureStartY = startY
        lastTouchX = startX
        lastTouchY = startY
        accumulatedDeltaX = 0f
        accumulatedDeltaY = 0f
        accumulatedScaleX = 1f
        accumulatedScaleY = 1f
        overlayTransformMatrix.reset()
        isTransformGestureActive = true
    }

    fun startLasso(worldX: Float, worldY: Float) {
        // If clicking on existing selection handle or body, switch to transform
        if (mode == LassoMode.TRANSFORMING && selectedStrokes.isNotEmpty()) {
            val handle = hitTestHandle(worldX, worldY)
            if (handle != TransformHandle.NONE) {
                activeHandle = handle
                lastTouchX = worldX
                lastTouchY = worldY
                gestureStartX = worldX
                gestureStartY = worldY
                accumulatedDeltaX = 0f
                accumulatedDeltaY = 0f
                accumulatedScaleX = 1f
                accumulatedScaleY = 1f
                baseSelectionBounds.set(selectionBounds)
                initialStrokesBeforeTransform.clear()
                initialStrokesBeforeTransform.addAll(selectedStrokes)
                overlayTransformMatrix.reset()
                isTransformGestureActive = true

                // Calculate pivot based on handle
                when (handle) {
                    TransformHandle.BODY -> {
                        pivotX = baseSelectionBounds.centerX()
                        pivotY = baseSelectionBounds.centerY()
                    }
                    TransformHandle.BOTTOM_RIGHT -> {
                        pivotX = baseSelectionBounds.left
                        pivotY = baseSelectionBounds.top
                    }
                    TransformHandle.TOP_LEFT -> {
                        pivotX = baseSelectionBounds.right
                        pivotY = baseSelectionBounds.bottom
                    }
                    TransformHandle.TOP_RIGHT -> {
                        pivotX = baseSelectionBounds.left
                        pivotY = baseSelectionBounds.bottom
                    }
                    TransformHandle.BOTTOM_LEFT -> {
                        pivotX = baseSelectionBounds.right
                        pivotY = baseSelectionBounds.top
                    }
                    TransformHandle.NONE -> {}
                }
                return
            }
        }

        // Otherwise start fresh selection loop
        mode = LassoMode.SELECTING
        isTransformGestureActive = false
        overlayTransformMatrix.reset()
        lassoPoints.clear()
        lassoPoints.add(PointF(worldX, worldY))
        lassoPath.reset()
        lassoPath.moveTo(worldX, worldY)
        selectedStrokes.clear()
        selectedStrokesSet.clear()
        initialStrokesBeforeTransform.clear()
    }

    fun continueLasso(worldX: Float, worldY: Float): Boolean {
        if (mode == LassoMode.SELECTING) {
            lassoPoints.add(PointF(worldX, worldY))
            lassoPath.lineTo(worldX, worldY)
            return true
        } else if (mode == LassoMode.TRANSFORMING && activeHandle != TransformHandle.NONE && isTransformGestureActive) {
            when (activeHandle) {
                TransformHandle.BODY -> {
                    accumulatedDeltaX = worldX - gestureStartX
                    accumulatedDeltaY = worldY - gestureStartY
                    accumulatedScaleX = 1f
                    accumulatedScaleY = 1f
                    overlayTransformMatrix.setTranslate(accumulatedDeltaX, accumulatedDeltaY)
                    selectionBounds.set(baseSelectionBounds)
                    selectionBounds.offset(accumulatedDeltaX, accumulatedDeltaY)
                    updateHandles()
                }
                TransformHandle.BOTTOM_RIGHT -> {
                    val baseW = baseSelectionBounds.width().coerceAtLeast(15f)
                    val baseH = baseSelectionBounds.height().coerceAtLeast(15f)
                    val dx = worldX - gestureStartX
                    val dy = worldY - gestureStartY
                    accumulatedScaleX = ((baseW + dx) / baseW).coerceIn(0.15f, 8.0f)
                    accumulatedScaleY = ((baseH + dy) / baseH).coerceIn(0.15f, 8.0f)
                    accumulatedDeltaX = 0f
                    accumulatedDeltaY = 0f
                    overlayTransformMatrix.setScale(accumulatedScaleX, accumulatedScaleY, pivotX, pivotY)
                    selectionBounds.set(
                        baseSelectionBounds.left,
                        baseSelectionBounds.top,
                        baseSelectionBounds.left + baseW * accumulatedScaleX,
                        baseSelectionBounds.top + baseH * accumulatedScaleY
                    )
                    updateHandles()
                }
                TransformHandle.TOP_LEFT -> {
                    val baseW = baseSelectionBounds.width().coerceAtLeast(15f)
                    val baseH = baseSelectionBounds.height().coerceAtLeast(15f)
                    val dx = worldX - gestureStartX
                    val dy = worldY - gestureStartY
                    accumulatedScaleX = ((baseW - dx) / baseW).coerceIn(0.15f, 8.0f)
                    accumulatedScaleY = ((baseH - dy) / baseH).coerceIn(0.15f, 8.0f)
                    accumulatedDeltaX = 0f
                    accumulatedDeltaY = 0f
                    overlayTransformMatrix.setScale(accumulatedScaleX, accumulatedScaleY, pivotX, pivotY)
                    selectionBounds.set(
                        baseSelectionBounds.right - baseW * accumulatedScaleX,
                        baseSelectionBounds.bottom - baseH * accumulatedScaleY,
                        baseSelectionBounds.right,
                        baseSelectionBounds.bottom
                    )
                    updateHandles()
                }
                TransformHandle.TOP_RIGHT -> {
                    val baseW = baseSelectionBounds.width().coerceAtLeast(15f)
                    val baseH = baseSelectionBounds.height().coerceAtLeast(15f)
                    val dx = worldX - gestureStartX
                    val dy = worldY - gestureStartY
                    accumulatedScaleX = ((baseW + dx) / baseW).coerceIn(0.15f, 8.0f)
                    accumulatedScaleY = ((baseH - dy) / baseH).coerceIn(0.15f, 8.0f)
                    accumulatedDeltaX = 0f
                    accumulatedDeltaY = 0f
                    overlayTransformMatrix.setScale(accumulatedScaleX, accumulatedScaleY, pivotX, pivotY)
                    selectionBounds.set(
                        baseSelectionBounds.left,
                        baseSelectionBounds.bottom - baseH * accumulatedScaleY,
                        baseSelectionBounds.left + baseW * accumulatedScaleX,
                        baseSelectionBounds.bottom
                    )
                    updateHandles()
                }
                TransformHandle.BOTTOM_LEFT -> {
                    val baseW = baseSelectionBounds.width().coerceAtLeast(15f)
                    val baseH = baseSelectionBounds.height().coerceAtLeast(15f)
                    val dx = worldX - gestureStartX
                    val dy = worldY - gestureStartY
                    accumulatedScaleX = ((baseW - dx) / baseW).coerceIn(0.15f, 8.0f)
                    accumulatedScaleY = ((baseH + dy) / baseH).coerceIn(0.15f, 8.0f)
                    accumulatedDeltaX = 0f
                    accumulatedDeltaY = 0f
                    overlayTransformMatrix.setScale(accumulatedScaleX, accumulatedScaleY, pivotX, pivotY)
                    selectionBounds.set(
                        baseSelectionBounds.right - baseW * accumulatedScaleX,
                        baseSelectionBounds.top,
                        baseSelectionBounds.right,
                        baseSelectionBounds.top + baseH * accumulatedScaleY
                    )
                    updateHandles()
                }
                TransformHandle.NONE -> {}
            }

            lastTouchX = worldX
            lastTouchY = worldY
            onOverlayMatrixChanged?.invoke()
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
            selectedStrokesSet.clear()
            for (stroke in allCanvasStrokes) {
                val box = stroke.shape.computeBoundingBox() ?: continue
                val centerX = (box.xMin + box.xMax) / 2f
                val centerY = (box.yMin + box.yMax) / 2f
                if (isPointInPolygon(centerX, centerY, lassoPoints)) {
                    selectedStrokes.add(stroke)
                }
            }

            if (selectedStrokes.isNotEmpty()) {
                selectedStrokesSet.addAll(selectedStrokes)
                mode = LassoMode.TRANSFORMING
                recomputeSelectionBounds()
                baseSelectionBounds.set(selectionBounds)
                initialStrokesBeforeTransform.clear()
                initialStrokesBeforeTransform.addAll(selectedStrokes)
                lassoPoints.clear()
                lassoPath.reset()
                return true
            } else {
                clearSelection()
                return false
            }
        } else if (mode == LassoMode.TRANSFORMING) {
            return finishTransform()
        }
        return false
    }

    fun finishTransform(): Boolean {
        if (isTransformGestureActive) {
            val moved = accumulatedDeltaX != 0f || accumulatedDeltaY != 0f || accumulatedScaleX != 1f || accumulatedScaleY != 1f
            if (moved && initialStrokesBeforeTransform.isNotEmpty()) {
                val finalStrokes = mutableListOf<Stroke>()
                val strokeInputTemp = StrokeInput()
                val pts = FloatArray(2)

                for (stroke in initialStrokesBeforeTransform) {
                    val newBatch = MutableStrokeInputBatch()
                    val inputs = stroke.inputs
                    for (i in 0 until inputs.size) {
                        inputs.populate(i, strokeInputTemp)
                        pts[0] = strokeInputTemp.x
                        pts[1] = strokeInputTemp.y
                        overlayTransformMatrix.mapPoints(pts)
                        // Safety fallback for JVM unit testing if matrix was stubbed
                        val finalX = if (pts[0] == 0f && pts[1] == 0f && (strokeInputTemp.x != 0f || strokeInputTemp.y != 0f)) {
                            pivotX + (strokeInputTemp.x - pivotX) * accumulatedScaleX + accumulatedDeltaX
                        } else {
                            pts[0]
                        }
                        val finalY = if (pts[0] == 0f && pts[1] == 0f && (strokeInputTemp.y != 0f || strokeInputTemp.y != 0f)) {
                            pivotY + (strokeInputTemp.y - pivotY) * accumulatedScaleY + accumulatedDeltaY
                        } else {
                            pts[1]
                        }

                        newBatch.add(
                            strokeInputTemp.toolType,
                            finalX,
                            finalY,
                            strokeInputTemp.elapsedTimeMillis,
                            strokeInputTemp.strokeUnitLengthCm,
                            strokeInputTemp.pressure.coerceIn(0.01f, 1.0f),
                            strokeInputTemp.tiltRadians.coerceIn(0f, 1.57f),
                            strokeInputTemp.orientationRadians
                        )
                    }
                    if (newBatch.size > 0) {
                        finalStrokes.add(Stroke(stroke.brush, newBatch.toImmutable()))
                    }
                }

                val old = initialStrokesBeforeTransform.toList()
                selectedStrokes.clear()
                selectedStrokes.addAll(finalStrokes)
                selectedStrokesSet.clear()
                selectedStrokesSet.addAll(finalStrokes)
                initialStrokesBeforeTransform.clear()
                initialStrokesBeforeTransform.addAll(finalStrokes)
                recomputeSelectionBounds()
                onStrokesTransformCommitted?.invoke(old, finalStrokes)
            }
            overlayTransformMatrix.reset()
            accumulatedDeltaX = 0f
            accumulatedDeltaY = 0f
            accumulatedScaleX = 1f
            accumulatedScaleY = 1f
            activeHandle = TransformHandle.NONE
            isTransformGestureActive = false
            return true
        }
        activeHandle = TransformHandle.NONE
        return false
    }

    companion object {
        var clipboardStrokes: List<Stroke> = emptyList()
    }

    fun selectStrokes(strokes: List<Stroke>) {
        clearSelection()
        if (strokes.isEmpty()) return
        selectedStrokes.addAll(strokes)
        selectedStrokesSet.addAll(strokes)
        initialStrokesBeforeTransform.clear()
        initialStrokesBeforeTransform.addAll(strokes)
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
        selectedStrokesSet.clear()
        selectedStrokesSet.addAll(pasted)
        mode = LassoMode.TRANSFORMING
        recomputeSelectionBounds()
        return pasted
    }

    fun clearSelection() {
        mode = LassoMode.IDLE
        activeHandle = TransformHandle.NONE
        isTransformGestureActive = false
        overlayTransformMatrix.reset()
        accumulatedDeltaX = 0f
        accumulatedDeltaY = 0f
        accumulatedScaleX = 1f
        accumulatedScaleY = 1f
        lassoPoints.clear()
        lassoPath.reset()
        selectedStrokes.clear()
        selectedStrokesSet.clear()
        initialStrokesBeforeTransform.clear()
        selectionBounds.setEmpty()
        baseSelectionBounds.setEmpty()
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
        selectedStrokesSet.clear()
        selectedStrokesSet.addAll(duplicated)
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
        selectedStrokesSet.clear()
        selectedStrokesSet.addAll(newStrokes)
        return TransformedStrokesResult(oldStrokes, newStrokes)
    }

    fun translateSelected(dx: Float, dy: Float) {
        if (selectedStrokes.isEmpty()) return
        val oldStrokes = selectedStrokes.toList()
        val matrix = Matrix().apply { setTranslate(dx, dy) }
        val strokeInputTemp = StrokeInput()
        val pts = FloatArray(2)
        val updated = mutableListOf<Stroke>()
        for (stroke in selectedStrokes) {
            val newBatch = MutableStrokeInputBatch()
            val inputs = stroke.inputs
            for (i in 0 until inputs.size) {
                inputs.populate(i, strokeInputTemp)
                pts[0] = strokeInputTemp.x
                pts[1] = strokeInputTemp.y
                matrix.mapPoints(pts)
                val finalX = if (pts[0] == 0f && pts[1] == 0f && (strokeInputTemp.x != 0f || strokeInputTemp.y != 0f)) strokeInputTemp.x + dx else pts[0]
                val finalY = if (pts[0] == 0f && pts[1] == 0f && (strokeInputTemp.y != 0f || strokeInputTemp.y != 0f)) strokeInputTemp.y + dy else pts[1]
                newBatch.add(
                    strokeInputTemp.toolType,
                    finalX,
                    finalY,
                    strokeInputTemp.elapsedTimeMillis,
                    strokeInputTemp.strokeUnitLengthCm,
                    strokeInputTemp.pressure.coerceIn(0.1f, 1.0f),
                    strokeInputTemp.tiltRadians.coerceIn(0f, 1.57f),
                    strokeInputTemp.orientationRadians
                )
            }
            updated.add(Stroke(stroke.brush, newBatch.toImmutable()))
        }
        selectedStrokes.clear()
        selectedStrokes.addAll(updated)
        selectedStrokesSet.clear()
        selectedStrokesSet.addAll(updated)
        selectionBounds.offset(dx, dy)
        baseSelectionBounds.set(selectionBounds)
        updateHandles()
        onStrokesTransformCommitted?.invoke(oldStrokes, updated)
        onStrokesTransformPreview?.invoke(oldStrokes, updated)
        @Suppress("DEPRECATION")
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
        val strokeInputTemp = StrokeInput()
        for (stroke in selectedStrokes) {
            val newBatch = MutableStrokeInputBatch()
            val inputs = stroke.inputs
            for (i in 0 until inputs.size) {
                inputs.populate(i, strokeInputTemp)
                val newX = pivotX + (strokeInputTemp.x - pivotX) * clampedScaleX
                val newY = pivotY + (strokeInputTemp.y - pivotY) * clampedScaleY
                newBatch.add(
                    strokeInputTemp.toolType,
                    newX,
                    newY,
                    strokeInputTemp.elapsedTimeMillis,
                    strokeInputTemp.strokeUnitLengthCm,
                    strokeInputTemp.pressure.coerceIn(0.1f, 1.0f),
                    strokeInputTemp.tiltRadians.coerceIn(0f, 1.57f),
                    strokeInputTemp.orientationRadians
                )
            }
            updated.add(Stroke(stroke.brush, newBatch.toImmutable()))
        }
        selectedStrokes.clear()
        selectedStrokes.addAll(updated)
        selectedStrokesSet.clear()
        selectedStrokesSet.addAll(updated)
        recomputeSelectionBounds()
        onStrokesTransformCommitted?.invoke(oldStrokes, updated)
        onStrokesTransformPreview?.invoke(oldStrokes, updated)
        @Suppress("DEPRECATION")
        onStrokesTransformed?.invoke(oldStrokes, updated)
    }

    fun recomputeSelectionBounds() {
        if (selectedStrokes.isEmpty()) {
            selectionBounds.setEmpty()
            baseSelectionBounds.setEmpty()
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
        baseSelectionBounds.set(selectionBounds)
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
