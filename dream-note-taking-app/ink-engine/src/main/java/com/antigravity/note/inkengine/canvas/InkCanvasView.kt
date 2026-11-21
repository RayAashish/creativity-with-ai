package com.antigravity.note.inkengine.canvas

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.PointF
import android.graphics.RectF
import android.os.SystemClock
import android.util.AttributeSet
import android.view.HapticFeedbackConstants
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.ink.authoring.InProgressStrokeId
import androidx.ink.authoring.InProgressStrokesFinishedListener
import androidx.ink.authoring.InProgressStrokesView
import androidx.ink.brush.Brush
import androidx.ink.brush.BrushFamily
import androidx.ink.brush.StockBrushes
import androidx.ink.strokes.Stroke
import androidx.input.motionprediction.MotionEventPredictor
import com.antigravity.note.document.model.CanvasImage
import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.inkengine.eraser.EraserMode
import com.antigravity.note.inkengine.lasso.LassoMode
import com.antigravity.note.inkengine.lasso.LassoTool
import com.antigravity.note.inkengine.palm.InputMode
import com.antigravity.note.inkengine.palm.PalmRejectionConfig
import com.antigravity.note.inkengine.palm.PalmRejectionFilter
import com.antigravity.note.inkengine.palm.PointerStatus
import com.antigravity.note.inkengine.ml.DigitalInkManager
import com.antigravity.note.inkengine.pdf.PdfTiler
import com.antigravity.note.inkengine.shape.RecognizedShape
import com.antigravity.note.inkengine.shape.ShapeRecognizer
import com.antigravity.note.document.model.CanvasTextBox
import com.antigravity.note.document.model.StrokeStyle
import com.antigravity.note.inkengine.laser.LaserDecayType
import com.antigravity.note.inkengine.laser.LaserMode
import com.antigravity.note.inkengine.laser.LaserPointerOverlay
import android.graphics.DashPathEffect
import android.graphics.Path
import android.graphics.Typeface
import java.io.File
import kotlin.math.abs
import kotlin.math.hypot

enum class ImageHandle {
    NONE,
    BODY,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT,
    TOP,
    BOTTOM,
    LEFT,
    RIGHT
}

enum class TextBoxHandle {
    NONE,
    BODY,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
}

enum class CanvasTool {
    PRESSURE_PEN,
    MARKER,
    HIGHLIGHTER,
    STROKE_ERASER,
    LASSO,
    SHAPE,
    TEXT,
    GLOW_PEN
}

enum class GlowPenPersistenceMode {
    TEMPORARY,
    PERMANENT
}

enum class StationaryLongPressAction {
    ERASER,
    LASSO,
    TEXT_BOX,
    COLOR_PICKER,
    PAN,
    DISABLED
}

enum class BarrelButtonAction {
    ERASER,
    LASSO,
    COLOR_PICKER,
    PAN,
    UNDO,
    TEMPORARY_LASER,
    DISABLED
}

enum class ShapePlacementType {
    RECTANGLE,
    SQUARE,
    CIRCLE,
    ELLIPSE,
    TRIANGLE,
    DIAMOND,
    STAR,
    LINE,
    ARROW,
    BIDIRECTIONAL_ARROW,
    CACHE_PILL,
    DATABASE_CYLINDER,
    CLOUD,
    LINKED_LIST_NODE,
    ARRAY_CELLS,
    DYNAMIC_ARRAY,
    DYNAMIC_LINKED_LIST,
    STACK,
    QUEUE,
    BINARY_TREE,
    UML_CLASS,
    UML_INTERFACE,
    UML_ACTOR,
    UML_LIFELINE,
    UML_ACTIVATION,
    UML_FRAGMENT,
    UML_USE_CASE,
    UML_INITIAL_NODE,
    UML_FINAL_NODE,
    UML_FORK_JOIN,
    UML_CONNECTOR
}

data class StrokeAction(
    val addedStrokes: List<Stroke> = emptyList(),
    val removedStrokes: List<Stroke> = emptyList()
)

class InkCanvasView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    val dryInkView = DryInkCanvasView(context)
    val inProgressStrokesView = InProgressStrokesView(context)
    val palmFilter = PalmRejectionFilter()

    private val predictor = MotionEventPredictor.newInstance(this)
    private val identityMatrix = Matrix()

    // Active tool & brush properties
    var currentTool: CanvasTool = CanvasTool.PRESSURE_PEN
    var strokeColor: Int = Color.parseColor("#111318")
    var strokeWidth: Float = 6.0f

    private var activeBrush: Brush = createBrushForTool(currentTool, strokeColor, strokeWidth)
    private val activeStrokeIds = HashMap<Int, InProgressStrokeId>()

    // Undo / Redo Command Stack
    private val undoStack = mutableListOf<StrokeAction>()
    private val redoStack = mutableListOf<StrokeAction>()

    // Phase 4: Lasso Tool & Shape Recognition
    val lassoTool = LassoTool()
    val shapeRecognizer = ShapeRecognizer()
    var holdToSnapEnabled = true
    val pdfTiler = PdfTiler()

    // Phase 5: On-Device ML Kit Digital Ink Recognition
    val digitalInkManager = DigitalInkManager()

    // Two-Finger Tap to Undo gesture setting and qualification flags
    var isTwoFingerUndoEnabled: Boolean = true
    private var isDisqualifiedFromUndoTap = false

    // Viewport change listener for real-time persistence
    var onViewportTransformChanged: ((scale: Float, translationX: Float, translationY: Float) -> Unit)? = null

    fun setViewport(zoomScale: Float, offsetX: Float, offsetY: Float) {
        val safeScale = if (zoomScale <= 0f) 1.0f else zoomScale.coerceIn(0.2f, 4.0f)
        var tx = -offsetX * safeScale
        var ty = -offsetY * safeScale

        val strokes = dryInkView.strokes
        val images = dryInkView.images
        val textBoxes = dryInkView.textBoxes
        if (strokes.isNotEmpty() || images.isNotEmpty() || textBoxes.isNotEmpty()) {
            var minX = Float.MAX_VALUE
            var minY = Float.MAX_VALUE
            var maxX = -Float.MAX_VALUE
            var maxY = -Float.MAX_VALUE
            for (s in strokes) {
                val b = s.shape.computeBoundingBox() ?: continue
                if (b.xMin < minX) minX = b.xMin
                if (b.yMin < minY) minY = b.yMin
                if (b.xMax > maxX) maxX = b.xMax
                if (b.yMax > maxY) maxY = b.yMax
            }
            for (img in images) {
                if (img.x < minX) minX = img.x
                if (img.y < minY) minY = img.y
                if (img.x + img.width > maxX) maxX = img.x + img.width
                if (img.y + img.height > maxY) maxY = img.y + img.height
            }
            for (tb in textBoxes) {
                if (tb.x < minX) minX = tb.x
                if (tb.y < minY) minY = tb.y
                if (tb.x + tb.width > maxX) maxX = tb.x + tb.width
                if (tb.y + tb.height > maxY) maxY = tb.y + tb.height
            }

            if (minX != Float.MAX_VALUE) {
                val viewW = width.toFloat().coerceAtLeast(800f)
                val viewH = height.toFloat().coerceAtLeast(1000f)
                val screenLeftWorld = -tx / safeScale
                val screenTopWorld = -ty / safeScale
                val screenRightWorld = screenLeftWorld + viewW / safeScale
                val screenBottomWorld = screenTopWorld + viewH / safeScale

                val isContentVisible = !(maxX < screenLeftWorld - 200f || minX > screenRightWorld + 200f ||
                                         maxY < screenTopWorld - 200f || minY > screenBottomWorld + 200f)
                if (!isContentVisible) {
                    tx = (-minX + 60f).coerceAtMost(0f) * safeScale
                    ty = (-minY + 80f).coerceAtMost(0f) * safeScale
                }
            }
        }

        dryInkView.transform.setTransform(safeScale, tx, ty)
        dryInkView.invalidate()
        invalidate()
    }

    fun getViewportState(): Triple<Float, Float, Float> {
        val scale = dryInkView.transform.scale
        val safeScale = if (scale <= 0f) 1.0f else scale
        val offsetX = -dryInkView.transform.translationX / safeScale
        val offsetY = -dryInkView.transform.translationY / safeScale
        return Triple(safeScale, offsetX, offsetY)
    }

    private val strokePoints = mutableListOf<ShapeRecognizer.Point>()
    private var lastMoveTime = 0L
    private var lastMoveX = 0f
    private var lastMoveY = 0f

    // Real-Time Hold-to-Snap
    private var isStrokeSnapped = false
    private val snappedStrokesForCurrentTouch = mutableListOf<Stroke>()
    private var activePointerIdForSnap = -1

    var holdToSnapDelayMs: Long = 400L // 350-450ms default (configurable 250-700ms)
    var stationaryLongPressAction: StationaryLongPressAction = StationaryLongPressAction.ERASER
    var barrelButtonAction: BarrelButtonAction = BarrelButtonAction.ERASER
    var pendingPlacementShape: ShapePlacementType? = null
    var is1to1AspectLocked: Boolean = false

    private var totalStrokePathLength = 0f
    private var lastTouchScreenX = 0f
    private var lastTouchScreenY = 0f
    private var isStationaryLongPressCancelled = false

    var onStationaryColorPickerTriggered: ((screenX: Float, screenY: Float) -> Unit)? = null

    private val holdToSnapRunnable = Runnable {
        if (!holdToSnapEnabled || isStrokeSnapped || strokePoints.size < 6 || totalStrokePathLength < 24f) return@Runnable
        val now = SystemClock.uptimeMillis()
        if (now - lastMoveTime < (holdToSnapDelayMs - 50L)) return@Runnable
        val strokeId = activeStrokeIds[activePointerIdForSnap] ?: return@Runnable
        val shape = shapeRecognizer.recognize(strokePoints)
        if (shape == null) return@Runnable

        // Morph rough wet ink into clean geometric shape!
        val dummyEvent = MotionEvent.obtain(
            SystemClock.uptimeMillis(),
            SystemClock.uptimeMillis(),
            MotionEvent.ACTION_CANCEL,
            lastMoveX,
            lastMoveY,
            0
        )
        try {
            inProgressStrokesView.cancelStroke(strokeId, dummyEvent)
        } catch (_: Exception) {}
        dummyEvent.recycle()

        val snappedStrokes = shapeRecognizer.createStrokesForShape(shape, activeBrush)
        val isNeonGlow = (currentTool == CanvasTool.GLOW_PEN && glowPenMode == GlowPenPersistenceMode.PERMANENT)
        if (isNeonGlow) {
            for (s in snappedStrokes) {
                dryInkView.tagNeonStroke(s)
            }
        }
        snappedStrokesForCurrentTouch.clear()
        snappedStrokesForCurrentTouch.addAll(snappedStrokes)
        dryInkView.addStrokes(snappedStrokes)
        isStrokeSnapped = true
        dryInkView.invalidate()
        performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
    }

    // Stationary Long-Press (ONLY triggers if totalPathLength < touchSlop e.g. < 14px)
    var holdToEraseEnabled: Boolean = true
    var holdToEraseDelayMs: Long = 650L
    var isHoldErasing: Boolean = false
        private set

    private val stationaryLongPressRunnable = Runnable {
        if (isStationaryLongPressCancelled || totalStrokePathLength >= 14f || isStrokeSnapped || isHoldErasing) return@Runnable
        val strokeId = activeStrokeIds[activePointerIdForSnap] ?: return@Runnable

        // Discard stationary touch dot created during pause
        val dummyEvent = MotionEvent.obtain(
            SystemClock.uptimeMillis(), SystemClock.uptimeMillis(), MotionEvent.ACTION_CANCEL, lastMoveX, lastMoveY, 0
        )
        try {
            inProgressStrokesView.cancelStroke(strokeId, dummyEvent)
        } catch (_: Exception) {}
        dummyEvent.recycle()
        activeStrokeIds.remove(activePointerIdForSnap)

        when (stationaryLongPressAction) {
            StationaryLongPressAction.ERASER -> {
                isHoldErasing = true
                performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                dryInkView.transform.screenToWorld(lastMoveX, lastMoveY, tempPoint)
                val currentScale = dryInkView.transform.scale.coerceAtLeast(0.1f)
                val eraseRadius = (strokeWidth * 4.5f / currentScale).coerceAtLeast(24f / currentScale)

                val gesture = ActiveEraseGesture()
                gesture.previousWorldX = tempPoint.x
                gesture.previousWorldY = tempPoint.y
                activeEraseGesture = gesture
                executeEraseStep(tempPoint.x, tempPoint.y, eraseRadius, gesture)
                invalidate()
            }
            StationaryLongPressAction.LASSO -> {
                performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                setTool(CanvasTool.LASSO)
            }
            StationaryLongPressAction.TEXT_BOX -> {
                performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                dryInkView.transform.screenToWorld(lastMoveX, lastMoveY, tempPoint)
                val newBox = CanvasTextBox(x = tempPoint.x, y = tempPoint.y, width = 280f, height = 80f, textColorArgb = strokeColor)
                dryInkView.addTextBox(newBox)
                selectTextBox(newBox)
                onRequestEditText?.invoke(newBox)
                dryInkView.invalidate()
            }
            StationaryLongPressAction.COLOR_PICKER -> {
                performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                onStationaryColorPickerTriggered?.invoke(lastMoveX, lastMoveY)
            }
            StationaryLongPressAction.PAN -> {
                performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                isReadOnlyPanDragging = true
                lastReadOnlyPanX = lastMoveX
                lastReadOnlyPanY = lastMoveY
            }
            StationaryLongPressAction.DISABLED -> {}
        }
    }

    // Finger as Eraser Feature (Stylus writes, single finger erases, palm rejected)
    var isFingerEraserEnabled: Boolean
        get() = palmFilter.config.isFingerEraserEnabled || palmFilter.config.inputMode == InputMode.PEN_DRAWS_FINGER_ERASES
        set(value) {
            palmFilter.config = palmFilter.config.copy(isFingerEraserEnabled = value)
            if (value && palmFilter.config.inputMode != InputMode.PEN_DRAWS_FINGER_ERASES) {
                palmFilter.config = palmFilter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGER_ERASES)
            } else if (!value && palmFilter.config.inputMode == InputMode.PEN_DRAWS_FINGER_ERASES) {
                palmFilter.config = palmFilter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM)
            }
        }

    private var isFingerErasing = false
    private var fingerEraseScreenX = 0f
    private var fingerEraseScreenY = 0f

    // Zero Blue: Imperial Amber styling (#F59E0B)
    private val fingerEraserFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = 0x26F59E0B.toInt()
    }
    private val fingerEraserOutlinePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 3f
        color = 0xCCF59E0B.toInt()
    }

    // Live previews for Shape Placement & Text Box dragging (Zero Blue: Imperial Amber)
    private val previewShapePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 3.5f
        color = 0xFFF59E0B.toInt()
        pathEffect = DashPathEffect(floatArrayOf(12f, 8f), 0f)
    }
    private val previewShapeFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = 0x18F59E0B.toInt()
    }
    private val previewTextBoxPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 3f
        color = 0xFFF59E0B.toInt()
        pathEffect = DashPathEffect(floatArrayOf(8f, 6f), 0f)
    }
    private val previewShapeSolidPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2.5f
        color = 0xFFF59E0B.toInt()
    }
    private val previewShapeTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = 0xFFF59E0B.toInt()
        textSize = 24f
        typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
        textAlign = Paint.Align.CENTER
    }

    // OneNote-Style Shape Placement State
    var onShapePlacementFinished: (() -> Unit)? = null
    private var isDraggingShapePlacement = false
    private var shapePlacementStartWorldX = 0f
    private var shapePlacementStartWorldY = 0f
    private var shapePlacementCurrentWorldX = 0f
    private var shapePlacementCurrentWorldY = 0f

    // Text Box Drag-to-Size & Interaction State
    var onTextBoxSelectionChanged: ((CanvasTextBox?) -> Unit)? = null
    var onTextBoxChanged: ((CanvasTextBox) -> Unit)? = null
    var onTextBoxRemoved: ((CanvasTextBox) -> Unit)? = null
    var onRequestEditText: ((CanvasTextBox) -> Unit)? = null

    var selectedTextBox: CanvasTextBox?
        get() = dryInkView.selectedTextBox
        set(value) {
            dryInkView.selectedTextBox = value
            onTextBoxSelectionChanged?.invoke(value)
        }

    private var isTransformingTextBox = false
    private var activeTextBoxHandle = TextBoxHandle.NONE
    private val textBoxTransformStartBounds = RectF()
    private var textBoxTransformDownX = 0f
    private var textBoxTransformDownY = 0f

    private var isDraggingNewTextBox = false
    private var textBoxDragStartX = 0f
    private var textBoxDragStartY = 0f
    private var textBoxDragCurrentX = 0f
    private var textBoxDragCurrentY = 0f

    private var lastTappedTextBox: CanvasTextBox? = null
    private var lastTextBoxTapTime = 0L

    fun getTextBoxScreenBounds(): RectF? {
        val box = selectedTextBox ?: return null
        val tl = PointF()
        val br = PointF()
        dryInkView.transform.worldToScreen(box.x, box.y, tl)
        dryInkView.transform.worldToScreen(box.x + box.width, box.y + box.height, br)
        return RectF(minOf(tl.x, br.x), minOf(tl.y, br.y), maxOf(tl.x, br.x), maxOf(tl.y, br.y))
    }

    fun selectTextBox(box: CanvasTextBox?) {
        selectedTextBox = box
        if (box != null) {
            clearImageSelection()
            lassoTool.clearSelection()
            onLassoSelectionChanged?.invoke(false)
        }
        dryInkView.invalidate()
        onTextBoxSelectionChanged?.invoke(box)
    }

    fun clearTextBoxSelection() {
        selectedTextBox = null
        isTransformingTextBox = false
        activeTextBoxHandle = TextBoxHandle.NONE
        dryInkView.invalidate()
        onTextBoxSelectionChanged?.invoke(null)
    }

    fun removeSelectedTextBox() {
        val box = selectedTextBox ?: return
        dryInkView.removeTextBox(box.id)
        clearTextBoxSelection()
        onTextBoxRemoved?.invoke(box)
    }

    fun updateTextBox(box: CanvasTextBox) {
        val idx = dryInkView.textBoxes.indexOfFirst { it.id == box.id }
        if (idx >= 0) {
            dryInkView.textBoxes[idx] = box
        } else {
            dryInkView.textBoxes.add(box)
        }
        if (selectedTextBox?.id == box.id) {
            selectedTextBox = box
        }
        dryInkView.invalidate()
        invalidate()
        onTextBoxChanged?.invoke(box)
    }

    fun hitTestTextBoxHandle(box: CanvasTextBox, worldX: Float, worldY: Float): TextBoxHandle {
        val scale = dryInkView.transform.scale.coerceAtLeast(0.1f)
        val hr = 28f / scale // generous touch radius for handles

        if (hypot(worldX - box.x, worldY - box.y) <= hr) return TextBoxHandle.TOP_LEFT
        if (hypot(worldX - (box.x + box.width), worldY - box.y) <= hr) return TextBoxHandle.TOP_RIGHT
        if (hypot(worldX - box.x, worldY - (box.y + box.height)) <= hr) return TextBoxHandle.BOTTOM_LEFT
        if (hypot(worldX - (box.x + box.width), worldY - (box.y + box.height)) <= hr) return TextBoxHandle.BOTTOM_RIGHT
        if (box.contains(worldX, worldY)) return TextBoxHandle.BODY

        return TextBoxHandle.NONE
    }

    private fun applyTextBoxTransform(box: CanvasTextBox, handle: TextBoxHandle, dx: Float, dy: Float) {
        val minW = 60f
        val minH = 30f
        val start = textBoxTransformStartBounds
        when (handle) {
            TextBoxHandle.BODY -> {
                box.x = start.left + dx
                box.y = start.top + dy
            }
            TextBoxHandle.TOP_LEFT -> {
                val newR = start.right
                val newB = start.bottom
                val newL = minOf(start.left + dx, newR - minW)
                val newT = minOf(start.top + dy, newB - minH)
                box.x = newL
                box.y = newT
                box.width = newR - newL
                box.height = newB - newT
            }
            TextBoxHandle.TOP_RIGHT -> {
                val newL = start.left
                val newB = start.bottom
                val newR = maxOf(start.right + dx, newL + minW)
                val newT = minOf(start.top + dy, newB - minH)
                box.x = newL
                box.y = newT
                box.width = newR - newL
                box.height = newB - newT
            }
            TextBoxHandle.BOTTOM_LEFT -> {
                val newR = start.right
                val newT = start.top
                val newL = minOf(start.left + dx, newR - minW)
                val newB = maxOf(start.bottom + dy, newT + minH)
                box.x = newL
                box.y = newT
                box.width = newR - newL
                box.height = newB - newT
            }
            TextBoxHandle.BOTTOM_RIGHT -> {
                val newL = start.left
                val newT = start.top
                val newR = maxOf(start.right + dx, newL + minW)
                val newB = maxOf(start.bottom + dy, newT + minH)
                box.x = newL
                box.y = newT
                box.width = newR - newL
                box.height = newB - newT
            }
            TextBoxHandle.NONE -> {}
        }
    }

    var onLassoSelectionChanged: ((hasSelection: Boolean) -> Unit)? = null
    private var isTransformingSelection = false

    var isReadOnly: Boolean = false
        set(value) {
            field = value
            if (value) {
                inProgressStrokesView.cancelUnfinishedStrokes()
                activeEraseGesture = null
                isTransformingSelection = false
                lassoTool.clearSelection()
                dryInkView.invalidate()
            }
        }

    private var isReadOnlyPanDragging = false
    private var lastReadOnlyPanX = 0f
    private var lastReadOnlyPanY = 0f

    fun getLassoScreenBounds(): RectF? {
        if (lassoTool.selectedStrokes.isEmpty() || lassoTool.selectionBounds.isEmpty) return null
        val b = lassoTool.selectionBounds
        val tl = PointF()
        val br = PointF()
        dryInkView.transform.worldToScreen(b.left, b.top, tl)
        dryInkView.transform.worldToScreen(b.right, b.bottom, br)
        val left = minOf(tl.x, br.x)
        val right = maxOf(tl.x, br.x)
        val top = minOf(tl.y, br.y)
        val bottom = maxOf(tl.y, br.y)
        return RectF(left, top, right, bottom)
    }

    fun getTextBoxScreenBounds(box: CanvasTextBox? = selectedTextBox): RectF? {
        val b = box ?: return null
        val tl = PointF()
        val br = PointF()
        dryInkView.transform.worldToScreen(b.x, b.y, tl)
        dryInkView.transform.worldToScreen(b.x + b.width, b.y + b.height, br)
        val left = minOf(tl.x, br.x)
        val right = maxOf(tl.x, br.x)
        val top = minOf(tl.y, br.y)
        val bottom = maxOf(tl.y, br.y)
        return RectF(left, top, right, bottom)
    }

    // Image Selection & Transformation
    var onImageSelectionChanged: ((CanvasImage?) -> Unit)? = null
    var onImageChanged: ((CanvasImage) -> Unit)? = null
    var onImageRemoved: ((CanvasImage) -> Unit)? = null

    var selectedImage: CanvasImage?
        get() = dryInkView.selectedImage
        set(value) {
            dryInkView.selectedImage = value
        }

    private var isTransformingImage = false
    private var activeImageHandle = ImageHandle.NONE
    private val imageTransformStartBounds = RectF()
    private var imageTransformDownX = 0f
    private var imageTransformDownY = 0f

    fun getImageScreenBounds(): RectF? {
        val img = selectedImage ?: return null
        val tl = PointF()
        val br = PointF()
        dryInkView.transform.worldToScreen(img.x, img.y, tl)
        dryInkView.transform.worldToScreen(img.x + img.width, img.y + img.height, br)
        return RectF(minOf(tl.x, br.x), minOf(tl.y, br.y), maxOf(tl.x, br.x), maxOf(tl.y, br.y))
    }

    fun selectImage(image: CanvasImage?) {
        selectedImage = image
        if (image != null) {
            lassoTool.clearSelection()
            onLassoSelectionChanged?.invoke(false)
        }
        dryInkView.invalidate()
        onImageSelectionChanged?.invoke(image)
    }

    fun clearImageSelection() {
        selectedImage = null
        isTransformingImage = false
        activeImageHandle = ImageHandle.NONE
        dryInkView.invalidate()
        onImageSelectionChanged?.invoke(null)
    }

    fun rotateSelectedImage(degrees: Float = 90f) {
        val img = selectedImage ?: return
        img.rotation = (img.rotation + degrees) % 360f
        dryInkView.invalidate()
        onImageSelectionChanged?.invoke(img)
        onImageChanged?.invoke(img)
    }

    fun duplicateSelectedImage(): CanvasImage? {
        val img = selectedImage ?: return null
        val dup = img.copyElement()
        dryInkView.addImage(dup)
        selectImage(dup)
        onImageChanged?.invoke(dup)
        return dup
    }

    fun deleteSelectedImage(): Boolean {
        val img = selectedImage ?: return false
        dryInkView.removeImage(img.id)
        clearImageSelection()
        onImageRemoved?.invoke(img)
        return true
    }

    fun fitSelectedImageToWidth() {
        val img = selectedImage ?: return
        val screenW = width.toFloat().takeIf { it > 0 } ?: 1200f
        val targetW = screenW * 0.8f
        val aspect = if (img.width > 0) img.height / img.width else 0.75f
        img.width = targetW
        img.height = targetW * aspect
        val centerPt = PointF()
        dryInkView.transform.screenToWorld(width / 2f, height / 2f, centerPt)
        img.x = centerPt.x - (targetW / 2f)
        img.y = centerPt.y - (img.height / 2f)
        dryInkView.invalidate()
        onImageSelectionChanged?.invoke(img)
        onImageChanged?.invoke(img)
    }

    fun hitTestImageHandle(img: CanvasImage, worldX: Float, worldY: Float): ImageHandle {
        val cx = img.x + img.width / 2f
        val cy = img.y + img.height / 2f
        val rad = Math.toRadians(-img.rotation.toDouble())
        val unrotX = (Math.cos(rad) * (worldX - cx) - Math.sin(rad) * (worldY - cy) + cx).toFloat()
        val unrotY = (Math.sin(rad) * (worldX - cx) + Math.cos(rad) * (worldY - cy) + cy).toFloat()

        val hr = 55f
        if (Math.hypot((unrotX - img.x).toDouble(), (unrotY - img.y).toDouble()) <= hr) return ImageHandle.TOP_LEFT
        if (Math.hypot((unrotX - (img.x + img.width)).toDouble(), (unrotY - img.y).toDouble()) <= hr) return ImageHandle.TOP_RIGHT
        if (Math.hypot((unrotX - img.x).toDouble(), (unrotY - (img.y + img.height)).toDouble()) <= hr) return ImageHandle.BOTTOM_LEFT
        if (Math.hypot((unrotX - (img.x + img.width)).toDouble(), (unrotY - (img.y + img.height)).toDouble()) <= hr) return ImageHandle.BOTTOM_RIGHT

        val midX = img.x + img.width / 2f
        val midY = img.y + img.height / 2f
        if (Math.hypot((unrotX - midX).toDouble(), (unrotY - img.y).toDouble()) <= hr) return ImageHandle.TOP
        if (Math.hypot((unrotX - midX).toDouble(), (unrotY - (img.y + img.height)).toDouble()) <= hr) return ImageHandle.BOTTOM
        if (Math.hypot((unrotX - img.x).toDouble(), (unrotY - midY).toDouble()) <= hr) return ImageHandle.LEFT
        if (Math.hypot((unrotX - (img.x + img.width)).toDouble(), (unrotY - midY).toDouble()) <= hr) return ImageHandle.RIGHT

        if (unrotX >= img.x && unrotX <= img.x + img.width && unrotY >= img.y && unrotY <= img.y + img.height) {
            return ImageHandle.BODY
        }
        return ImageHandle.NONE
    }

    private fun applyImageTransform(img: CanvasImage, handle: ImageHandle, dx: Float, dy: Float) {
        val b = imageTransformStartBounds
        val aspect = if (b.width() > 0) b.height() / b.width() else 1f
        when (handle) {
            ImageHandle.BODY -> {
                img.x = b.left + dx
                img.y = b.top + dy
            }
            ImageHandle.BOTTOM_RIGHT -> {
                val newW = (b.width() + dx).coerceAtLeast(80f)
                img.width = newW
                img.height = newW * aspect
            }
            ImageHandle.BOTTOM_LEFT -> {
                val newW = (b.width() - dx).coerceAtLeast(80f)
                img.x = b.right - newW
                img.width = newW
                img.height = newW * aspect
            }
            ImageHandle.TOP_RIGHT -> {
                val newW = (b.width() + dx).coerceAtLeast(80f)
                val newH = newW * aspect
                img.y = b.bottom - newH
                img.width = newW
                img.height = newH
            }
            ImageHandle.TOP_LEFT -> {
                val newW = (b.width() - dx).coerceAtLeast(80f)
                val newH = newW * aspect
                img.x = b.right - newW
                img.y = b.bottom - newH
                img.width = newW
                img.height = newH
            }
            ImageHandle.RIGHT -> {
                img.width = (b.width() + dx).coerceAtLeast(80f)
            }
            ImageHandle.BOTTOM -> {
                img.height = (b.height() + dy).coerceAtLeast(80f)
            }
            ImageHandle.LEFT -> {
                val newW = (b.width() - dx).coerceAtLeast(80f)
                img.x = b.right - newW
                img.width = newW
            }
            ImageHandle.TOP -> {
                val newH = (b.height() - dy).coerceAtLeast(80f)
                img.y = b.bottom - newH
                img.height = newH
            }
            ImageHandle.NONE -> {}
        }
    }

    fun setAdaptiveContrast(enabled: Boolean) {
        dryInkView.isAdaptiveContrastEnabled = enabled
    }

    // Precision & Stroke Eraser Settings and Scoped Gesture Session
    var eraserMode: EraserMode = EraserMode.PRECISION

    private class ActiveEraseGesture {
        val strokeToOriginal = HashMap<Stroke, Stroke>()
        val touchedOriginals = HashSet<Stroke>()
        var previousWorldX: Float = Float.NaN
        var previousWorldY: Float = Float.NaN
    }
    private var activeEraseGesture: ActiveEraseGesture? = null

    private fun executeEraseSweep(
        x1: Float, y1: Float,
        x2: Float, y2: Float,
        radius: Float,
        gesture: ActiveEraseGesture
    ) {
        val dist = kotlin.math.hypot(x2 - x1, y2 - y1)
        val stepSize = (radius * 0.5f).coerceAtLeast(10f)
        val steps = kotlin.math.ceil(dist / stepSize).toInt().coerceAtLeast(1)

        for (s in 1..steps) {
            val t = s.toFloat() / steps
            val cx = x1 + t * (x2 - x1)
            val cy = y1 + t * (y2 - y1)
            executeEraseStep(cx, cy, radius, gesture)
        }
    }

    private fun executeEraseStep(
        cx: Float, cy: Float,
        radius: Float,
        gesture: ActiveEraseGesture
    ) {
        val mod = dryInkView.eraseStrokesWithDetails(cx, cy, radius, eraserMode)
        if (mod.removedStrokes.isEmpty()) return

        for (rep in mod.replacements) {
            val original = gesture.strokeToOriginal.remove(rep.oldStroke) ?: rep.oldStroke
            gesture.touchedOriginals.add(original)
            for (newS in rep.newStrokes) {
                gesture.strokeToOriginal[newS] = original
            }
        }
    }

    private fun finishEraseGesture() {
        val gesture = activeEraseGesture ?: return
        activeEraseGesture = null

        if (gesture.touchedOriginals.isEmpty()) return

        val originals = gesture.touchedOriginals.toList()
        val surviving = gesture.strokeToOriginal.keys.toList()

        val actionRecord = StrokeAction(
            addedStrokes = surviving,
            removedStrokes = originals
        )
        undoStack.add(actionRecord)
        redoStack.clear()
        notifyUndoRedoState()

        onStrokesReplaced?.invoke(originals, surviving)
    }

    // Gesture tracking for 2-finger pan & pinch-zoom
    private var isGestureActive = false
    private var lastGestureDistance = 0f
    private var lastGestureCenterX = 0f
    private var lastGestureCenterY = 0f
    private var gestureStartTime = 0L
    private var totalGestureMovement = 0f
    private val tempPoint = PointF()

    // Debug overlay objects (zero-allocation)
    private val debugPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = 28f
        typeface = android.graphics.Typeface.MONOSPACE
        color = Color.parseColor("#0D47A1")
    }
    private val debugBgPaint = Paint().apply {
        color = Color.parseColor("#EEFFFFFF")
    }
    private val debugBorderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2f
        color = Color.parseColor("#90CAF9")
    }
    private val palmRejectPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 3f
        color = Color.parseColor("#D32F2F")
    }
    private val acceptedPointerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 3f
        color = Color.parseColor("#388E3C")
    }

    // Callbacks
    var onUndoRedoStateChanged: ((canUndo: Boolean, canRedo: Boolean) -> Unit)? = null
    var onFpsMeasured: ((fps: Float) -> Unit)? = null
    var onStrokeCommitted: ((Stroke) -> Unit)? = null
    var onStrokeCommittedWithStyle: ((Stroke, StrokeStyle) -> Unit)? = null
    var onUndoCommitted: ((Stroke?) -> Unit)? = null
    var onClearCommitted: (() -> Unit)? = null
    var onStrokesReplaced: ((oldStrokes: List<Stroke>, newStrokes: List<Stroke>) -> Unit)? = null
    var onImageDropped: ((uri: android.net.Uri, worldX: Float, worldY: Float) -> Unit)? = null

    // Dual-Mode Glowing Pen & Laser Pointer Tool
    val laserOverlay = LaserPointerOverlay(this)
    var glowPenMode: GlowPenPersistenceMode = GlowPenPersistenceMode.TEMPORARY
        set(value) {
            field = value
            invalidate()
        }

    fun setLaserMode(mode: LaserMode) {
        laserOverlay.mode = mode
        invalidate()
    }

    fun setLaserDecayType(decay: LaserDecayType) {
        laserOverlay.decayType = decay
        invalidate()
    }

    fun setLaserFadeDuration(durationMs: Long) {
        laserOverlay.fadeDurationMs = durationMs
        invalidate()
    }

    fun setLaserThicknessMultiplier(multiplier: Float) {
        laserOverlay.thicknessMultiplier = multiplier
        invalidate()
    }

    // Document state
    var pageOpenLatencyMs: Long = 0L
    var pageTitle: String = "Page 1"

    // Frame timing tracking
    private var lastFrameTimeNanos = 0L
    private var frameCount = 0
    private var measuredFps = 144.0f

    init {
        // Build view hierarchy: Dry canvas at base, wet ink view directly above
        addView(
            dryInkView,
            LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        )
        addView(
            inProgressStrokesView,
            LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        )

        // Low-latency front-buffered initialization
        inProgressStrokesView.eagerInit()

        // Wire Phase 4 Lasso & PDF background
        dryInkView.lassoTool = lassoTool
        dryInkView.pdfTiler = pdfTiler

        lassoTool.onOverlayMatrixChanged = {
            dryInkView.postInvalidateOnAnimation()
        }

        lassoTool.onStrokesTransformCommitted = { oldStrokes, newStrokes ->
            dryInkView.replaceStrokes(oldStrokes, newStrokes)
            undoStack.add(StrokeAction(addedStrokes = newStrokes, removedStrokes = oldStrokes))
            redoStack.clear()
            notifyUndoRedoState()
            onStrokesReplaced?.invoke(oldStrokes, newStrokes)
            dryInkView.invalidate()
        }

        // Setup Drag-and-Drop listener for external images
        setOnDragListener { _, event ->
            when (event.action) {
                android.view.DragEvent.ACTION_DRAG_STARTED -> {
                    val desc = event.clipDescription
                    desc != null && (desc.hasMimeType("image/*") || desc.hasMimeType("image/png") || desc.hasMimeType("image/jpeg") || desc.hasMimeType("image/webp"))
                }
                android.view.DragEvent.ACTION_DRAG_ENTERED -> {
                    dryInkView.isDropTargetActive = true
                    dryInkView.invalidate()
                    true
                }
                android.view.DragEvent.ACTION_DRAG_LOCATION -> {
                    val p = PointF()
                    dryInkView.transform.screenToWorld(event.x, event.y, p)
                    dryInkView.dropTargetBounds.set(p.x - 150f, p.y - 120f, p.x + 150f, p.y + 120f)
                    dryInkView.postInvalidateOnAnimation()
                    true
                }
                android.view.DragEvent.ACTION_DROP -> {
                    dryInkView.isDropTargetActive = false
                    val clipData = event.clipData
                    if (clipData != null && clipData.itemCount > 0) {
                        val uri = clipData.getItemAt(0).uri
                        if (uri != null) {
                            val p = PointF()
                            dryInkView.transform.screenToWorld(event.x, event.y, p)
                            onImageDropped?.invoke(uri, p.x, p.y)
                        }
                    }
                    dryInkView.invalidate()
                    true
                }
                android.view.DragEvent.ACTION_DRAG_EXITED, android.view.DragEvent.ACTION_DRAG_ENDED -> {
                    dryInkView.isDropTargetActive = false
                    dryInkView.invalidate()
                    true
                }
                else -> false
            }
        }

        // Commit finished wet ink into dry ink view
        inProgressStrokesView.addFinishedStrokesListener(object : InProgressStrokesFinishedListener {
            override fun onStrokesFinished(strokes: Map<InProgressStrokeId, Stroke>) {
                val finishedList = strokes.values.toList()
                if (finishedList.isNotEmpty()) {
                    val isNeonGlow = (currentTool == CanvasTool.GLOW_PEN && glowPenMode == GlowPenPersistenceMode.PERMANENT)
                    if (isNeonGlow) {
                        for (stroke in finishedList) {
                            dryInkView.tagNeonStroke(stroke)
                        }
                    }
                    dryInkView.addStrokes(finishedList)
                    val action = StrokeAction(addedStrokes = finishedList)
                    undoStack.add(action)
                    redoStack.clear()
                    notifyUndoRedoState()
                    for (stroke in finishedList) {
                        if (isNeonGlow) {
                            onStrokeCommittedWithStyle?.invoke(stroke, StrokeStyle.NEON_GLOW)
                                ?: onStrokeCommitted?.invoke(stroke)
                        } else {
                            onStrokeCommittedWithStyle?.invoke(stroke, StrokeStyle.STANDARD)
                                ?: onStrokeCommitted?.invoke(stroke)
                        }
                    }
                    inProgressStrokesView.removeFinishedStrokes(strokes.keys)
                    dryInkView.invalidate()
                }
            }
        })

        // Enable custom drawing for debug HUD
        setWillNotDraw(false)
    }

    fun loadPage(page: DocumentPage, openLatencyMs: Long = 0L, assetsDir: java.io.File? = null) {
        pageOpenLatencyMs = openLatencyMs
        pageTitle = page.metadata.title
        activeStrokeIds.clear()
        inProgressStrokesView.cancelUnfinishedStrokes()
        inProgressStrokesView.removeFinishedStrokes(inProgressStrokesView.getFinishedStrokes().keys)
        lassoTool.clearSelection()
        isTransformingSelection = false
        onLassoSelectionChanged?.invoke(false)
        val neonStrokesList = page.strokes.filterIndexed { index, _ ->
            val strokeId = page.strokeIds.getOrNull(index)
            strokeId != null && page.isNeonGlowStroke(strokeId)
        }
        dryInkView.loadStrokes(page.strokes, neonStrokesList)
        dryInkView.setImages(page.images, assetsDir)
        dryInkView.setTextBoxes(page.textBoxes)
        clearTextBoxSelection()
        dryInkView.setPaperTemplate(page.metadata.template)
        undoStack.clear()
        redoStack.clear()
        notifyUndoRedoState()
        ensureContentInViewport(page)
        invalidate()
    }

    fun ensureContentInViewport(page: DocumentPage) {
        if (page.strokes.isEmpty() && page.images.isEmpty() && page.textBoxes.isEmpty()) {
            dryInkView.transform.setTransform(1.0f, 0f, 0f)
            return
        }

        var minX = Float.MAX_VALUE
        var minY = Float.MAX_VALUE
        var maxX = -Float.MAX_VALUE
        var maxY = -Float.MAX_VALUE

        for (s in page.strokes) {
            val b = s.shape.computeBoundingBox() ?: continue
            if (b.xMin < minX) minX = b.xMin
            if (b.yMin < minY) minY = b.yMin
            if (b.xMax > maxX) maxX = b.xMax
            if (b.yMax > maxY) maxY = b.yMax
        }
        for (img in page.images) {
            if (img.x < minX) minX = img.x
            if (img.y < minY) minY = img.y
            if (img.x + img.width > maxX) maxX = img.x + img.width
            if (img.y + img.height > maxY) maxY = img.y + img.height
        }
        for (tb in page.textBoxes) {
            if (tb.x < minX) minX = tb.x
            if (tb.y < minY) minY = tb.y
            if (tb.x + tb.width > maxX) maxX = tb.x + tb.width
            if (tb.y + tb.height > maxY) maxY = tb.y + tb.height
        }

        if (minX == Float.MAX_VALUE) {
            dryInkView.transform.setTransform(1.0f, 0f, 0f)
            return
        }

        val currentScale = dryInkView.transform.scale.coerceIn(0.2f, 4.0f)
        val viewW = width.toFloat().coerceAtLeast(800f)
        val viewH = height.toFloat().coerceAtLeast(1000f)

        val screenLeftWorld = -dryInkView.transform.translationX / currentScale
        val screenTopWorld = -dryInkView.transform.translationY / currentScale
        val screenRightWorld = screenLeftWorld + viewW / currentScale
        val screenBottomWorld = screenTopWorld + viewH / currentScale

        val intersects = !(maxX < screenLeftWorld - 300f || minX > screenRightWorld + 300f ||
                           maxY < screenTopWorld - 300f || minY > screenBottomWorld + 300f)

        if (!intersects) {
            val targetScale = 1.0f
            val targetTx = (-minX + 60f).coerceAtMost(0f) * targetScale
            val targetTy = (-minY + 80f).coerceAtMost(0f) * targetScale
            dryInkView.transform.setTransform(targetScale, targetTx, targetTy)
        }
    }

    fun setPaperTemplate(template: PaperTemplate) {
        dryInkView.setPaperTemplate(template)
        invalidate()
    }

    var isDarkMode: Boolean = false
        private set

    fun setDarkMode(isDark: Boolean) {
        if (isDarkMode != isDark) {
            isDarkMode = isDark
            dryInkView.isDarkMode = isDark
            invalidate()
        }
    }

    fun setTool(tool: CanvasTool) {
        if (currentTool == CanvasTool.LASSO && tool != CanvasTool.LASSO) {
            lassoTool.clearSelection()
            dryInkView.invalidate()
            onLassoSelectionChanged?.invoke(false)
        }
        if (currentTool == CanvasTool.TEXT && tool != CanvasTool.TEXT) {
            clearTextBoxSelection()
        }
        currentTool = tool
        if (tool == CanvasTool.GLOW_PEN) {
            laserOverlay.neonColor = strokeColor
        }
        activeBrush = createBrushForTool(tool, strokeColor, strokeWidth)
    }

    fun setInkColor(color: Int) {
        strokeColor = color
        laserOverlay.neonColor = color
        activeBrush = createBrushForTool(currentTool, color, strokeWidth)
    }

    fun setInkWidth(width: Float) {
        strokeWidth = width
        activeBrush = createBrushForTool(currentTool, strokeColor, width)
    }

    private fun createBrushForTool(tool: CanvasTool, color: Int, size: Float): Brush {
        return when (tool) {
            CanvasTool.PRESSURE_PEN -> {
                Brush.createWithColorIntArgb(StockBrushes.pressurePen(), color, size, 0.01f)
            }
            CanvasTool.MARKER -> {
                val markerSize = size.coerceAtLeast(6f)
                Brush.createWithColorIntArgb(StockBrushes.marker(), color, markerSize, 0.01f)
            }
            CanvasTool.HIGHLIGHTER -> {
                val highlighterSize = size.coerceAtLeast(16f)
                // Enforce 40% translucent alpha (0x55) so underlying handwriting stays sharp
                val translucentColor = (color and 0x00FFFFFF) or (0x55 shl 24)
                Brush.createWithColorIntArgb(StockBrushes.highlighter(), translucentColor, highlighterSize, 0.01f)
            }
            CanvasTool.GLOW_PEN -> {
                val glowPenSize = size.coerceAtLeast(3.5f)
                Brush.createWithColorIntArgb(StockBrushes.pressurePen(), color, glowPenSize, 0.01f)
            }
            CanvasTool.STROKE_ERASER, CanvasTool.LASSO, CanvasTool.SHAPE, CanvasTool.TEXT -> {
                Brush.createWithColorIntArgb(StockBrushes.marker(), color, size.coerceAtLeast(3.5f), 0.01f)
            }
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        // Enforce unbuffered dispatch for sub-millisecond input path
        requestUnbufferedDispatch(event)
        parent?.requestDisallowInterceptTouchEvent(true)

        val w = width.toFloat()
        val h = height.toFloat()
        val pointerIndex = event.actionIndex.coerceIn(0, (event.pointerCount - 1).coerceAtLeast(0))
        val pointerId = event.getPointerId(pointerIndex)

        // OneNote-Style Shape Placement Tool (Interactive Drag-to-Stretch with 120fps Preview)
        if (currentTool == CanvasTool.SHAPE && pendingPlacementShape != null && lassoTool.selectedStrokes.isEmpty()) {
            val screenX = event.getX(pointerIndex)
            val screenY = event.getY(pointerIndex)
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            val worldX = tempPoint.x
            val worldY = tempPoint.y
            val action = event.actionMasked

            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    shapePlacementStartWorldX = worldX
                    shapePlacementStartWorldY = worldY
                    shapePlacementCurrentWorldX = worldX
                    shapePlacementCurrentWorldY = worldY
                    isDraggingShapePlacement = true
                    invalidate()
                    return true
                }
                MotionEvent.ACTION_MOVE -> {
                    if (isDraggingShapePlacement) {
                        shapePlacementCurrentWorldX = worldX
                        shapePlacementCurrentWorldY = worldY
                        invalidate()
                        return true
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    if (isDraggingShapePlacement) {
                        isDraggingShapePlacement = false
                        shapePlacementCurrentWorldX = worldX
                        shapePlacementCurrentWorldY = worldY
                        commitStretchedShapePlacement()
                        invalidate()
                        return true
                    }
                }
                MotionEvent.ACTION_CANCEL -> {
                    isDraggingShapePlacement = false
                    invalidate()
                    return true
                }
            }
        }

        // Allow finger/stylus touch to resize/move active image selection handles!
        val selImg = selectedImage
        if (event.pointerCount == 1 && selImg == null && event.getToolType(pointerIndex) == MotionEvent.TOOL_TYPE_FINGER && currentTool != CanvasTool.STROKE_ERASER) {
            val screenX = event.getX(pointerIndex)
            val screenY = event.getY(pointerIndex)
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            if (event.actionMasked == MotionEvent.ACTION_DOWN) {
                val hit = dryInkView.findImageAt(tempPoint.x, tempPoint.y)
                if (hit != null) {
                    selectImage(hit)
                    isTransformingImage = true
                    activeImageHandle = ImageHandle.BODY
                    imageTransformStartBounds.set(hit.x, hit.y, hit.x + hit.width, hit.y + hit.height)
                    imageTransformDownX = tempPoint.x
                    imageTransformDownY = tempPoint.y
                    dryInkView.invalidate()
                    return true
                }
            }
        }
        if (event.pointerCount == 1 && selImg != null) {
            val screenX = event.getX(pointerIndex)
            val screenY = event.getY(pointerIndex)
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            val action = event.actionMasked

            if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_POINTER_DOWN) {
                val handle = hitTestImageHandle(selImg, tempPoint.x, tempPoint.y)
                if (handle != ImageHandle.NONE) {
                    isTransformingImage = true
                    activeImageHandle = handle
                    imageTransformStartBounds.set(selImg.x, selImg.y, selImg.x + selImg.width, selImg.y + selImg.height)
                    imageTransformDownX = tempPoint.x
                    imageTransformDownY = tempPoint.y
                    dryInkView.invalidate()
                    return true
                } else {
                    val otherImg = dryInkView.findImageAt(tempPoint.x, tempPoint.y)
                    if (otherImg != null) {
                        selectImage(otherImg)
                        isTransformingImage = true
                        activeImageHandle = ImageHandle.BODY
                        imageTransformStartBounds.set(otherImg.x, otherImg.y, otherImg.x + otherImg.width, otherImg.y + otherImg.height)
                        imageTransformDownX = tempPoint.x
                        imageTransformDownY = tempPoint.y
                        dryInkView.invalidate()
                        return true
                    } else {
                        clearImageSelection()
                    }
                }
            } else if (isTransformingImage) {
                if (action == MotionEvent.ACTION_MOVE) {
                    val dx = tempPoint.x - imageTransformDownX
                    val dy = tempPoint.y - imageTransformDownY
                    applyImageTransform(selImg, activeImageHandle, dx, dy)
                    dryInkView.invalidate()
                    onImageSelectionChanged?.invoke(selImg)
                    return true
                } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_CANCEL) {
                    isTransformingImage = false
                    activeImageHandle = ImageHandle.NONE
                    onImageChanged?.invoke(selImg)
                    dryInkView.invalidate()
                    return true
                }
            }
        }

        // Text Box Manipulation & Creation (Tap-to-Type and Drag-to-Size)
        val selBox = selectedTextBox
        if (event.pointerCount == 1 && selBox == null && (currentTool == CanvasTool.TEXT || event.getToolType(pointerIndex) == MotionEvent.TOOL_TYPE_FINGER) && currentTool != CanvasTool.STROKE_ERASER) {
            val screenX = event.getX(pointerIndex)
            val screenY = event.getY(pointerIndex)
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            if (event.actionMasked == MotionEvent.ACTION_DOWN) {
                val hit = dryInkView.findTextBoxAt(tempPoint.x, tempPoint.y)
                if (hit != null) {
                    val now = SystemClock.uptimeMillis()
                    if (hit == lastTappedTextBox && now - lastTextBoxTapTime < 450L) {
                        selectTextBox(hit)
                        onRequestEditText?.invoke(hit)
                        return true
                    }
                    lastTappedTextBox = hit
                    lastTextBoxTapTime = now
                    selectTextBox(hit)
                    isTransformingTextBox = true
                    activeTextBoxHandle = TextBoxHandle.BODY
                    textBoxTransformStartBounds.set(hit.x, hit.y, hit.x + hit.width, hit.y + hit.height)
                    textBoxTransformDownX = tempPoint.x
                    textBoxTransformDownY = tempPoint.y
                    dryInkView.invalidate()
                    return true
                }
            }
        }
        if (event.pointerCount == 1 && selBox != null) {
            val screenX = event.getX(pointerIndex)
            val screenY = event.getY(pointerIndex)
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            val action = event.actionMasked

            if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_POINTER_DOWN) {
                val handle = hitTestTextBoxHandle(selBox, tempPoint.x, tempPoint.y)
                if (handle != TextBoxHandle.NONE) {
                    val now = SystemClock.uptimeMillis()
                    if (handle == TextBoxHandle.BODY && selBox == lastTappedTextBox && now - lastTextBoxTapTime < 450L) {
                        onRequestEditText?.invoke(selBox)
                        return true
                    }
                    lastTappedTextBox = selBox
                    lastTextBoxTapTime = now
                    isTransformingTextBox = true
                    activeTextBoxHandle = handle
                    textBoxTransformStartBounds.set(selBox.x, selBox.y, selBox.x + selBox.width, selBox.y + selBox.height)
                    textBoxTransformDownX = tempPoint.x
                    textBoxTransformDownY = tempPoint.y
                    dryInkView.invalidate()
                    return true
                } else {
                    val otherBox = dryInkView.findTextBoxAt(tempPoint.x, tempPoint.y)
                    if (otherBox != null) {
                        selectTextBox(otherBox)
                        isTransformingTextBox = true
                        activeTextBoxHandle = TextBoxHandle.BODY
                        textBoxTransformStartBounds.set(otherBox.x, otherBox.y, otherBox.x + otherBox.width, otherBox.y + otherBox.height)
                        textBoxTransformDownX = tempPoint.x
                        textBoxTransformDownY = tempPoint.y
                        dryInkView.invalidate()
                        return true
                    } else {
                        // Tapped outside active text box: cleanly deselect without spawning a new box!
                        clearTextBoxSelection()
                        dryInkView.invalidate()
                        return true
                    }
                }
            } else if (isTransformingTextBox) {
                if (action == MotionEvent.ACTION_MOVE) {
                    val dx = tempPoint.x - textBoxTransformDownX
                    val dy = tempPoint.y - textBoxTransformDownY
                    applyTextBoxTransform(selBox, activeTextBoxHandle, dx, dy)
                    dryInkView.invalidate()
                    onTextBoxChanged?.invoke(selBox)
                    return true
                } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_CANCEL) {
                    isTransformingTextBox = false
                    activeTextBoxHandle = TextBoxHandle.NONE
                    onTextBoxChanged?.invoke(selBox)
                    dryInkView.invalidate()
                    return true
                }
            }
        }

        if (currentTool == CanvasTool.TEXT && event.pointerCount == 1 && selectedTextBox == null) {
            val screenX = event.getX(pointerIndex)
            val screenY = event.getY(pointerIndex)
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            val action = event.actionMasked

            when (action) {
                MotionEvent.ACTION_DOWN -> {
                    textBoxDragStartX = tempPoint.x
                    textBoxDragStartY = tempPoint.y
                    textBoxDragCurrentX = tempPoint.x
                    textBoxDragCurrentY = tempPoint.y
                    isDraggingNewTextBox = true
                    invalidate()
                    return true
                }
                MotionEvent.ACTION_MOVE -> {
                    if (isDraggingNewTextBox) {
                        textBoxDragCurrentX = tempPoint.x
                        textBoxDragCurrentY = tempPoint.y
                        invalidate()
                        return true
                    }
                }
                MotionEvent.ACTION_UP -> {
                    if (isDraggingNewTextBox) {
                        isDraggingNewTextBox = false
                        val dx = abs(textBoxDragCurrentX - textBoxDragStartX)
                        val dy = abs(textBoxDragCurrentY - textBoxDragStartY)
                        val newBox = if (hypot(dx, dy) < 18f) {
                            // Tap-to-Type: Auto-expanding text box
                            CanvasTextBox(
                                x = textBoxDragStartX,
                                y = textBoxDragStartY,
                                width = 280f,
                                height = 70f,
                                textColorArgb = strokeColor
                            )
                        } else {
                            // Drag-to-Size: Fixed width / height
                            CanvasTextBox(
                                x = minOf(textBoxDragStartX, textBoxDragCurrentX),
                                y = minOf(textBoxDragStartY, textBoxDragCurrentY),
                                width = maxOf(100f, dx),
                                height = maxOf(40f, dy),
                                textColorArgb = strokeColor
                            )
                        }
                        dryInkView.addTextBox(newBox)
                        selectTextBox(newBox)
                        onRequestEditText?.invoke(newBox)
                        dryInkView.invalidate()
                        invalidate()
                        return true
                    }
                }
                MotionEvent.ACTION_CANCEL -> {
                    isDraggingNewTextBox = false
                    invalidate()
                    return true
                }
            }
        }

        // Allow finger touch to resize/move active selection handles!
        if (event.pointerCount == 1 && lassoTool.mode == com.antigravity.note.inkengine.lasso.LassoMode.TRANSFORMING && lassoTool.selectedStrokes.isNotEmpty()) {
            val screenX = event.getX(pointerIndex)
            val screenY = event.getY(pointerIndex)
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            if (lassoTool.hitTest(tempPoint.x, tempPoint.y) || isTransformingSelection) {
                handleStylusAction(event, pointerIndex, pointerId, false)
                return true
            }
        }

        // Temporary Laser Pointer via single finger or stylus (supports presentation pointing & walkthroughs)
        if (event.pointerCount == 1 && currentTool == CanvasTool.GLOW_PEN && glowPenMode == GlowPenPersistenceMode.TEMPORARY) {
            val toolType = event.getToolType(pointerIndex)
            if (toolType == MotionEvent.TOOL_TYPE_STYLUS || (!palmFilter.isStylusDown && !palmFilter.isStylusHovering)) {
                handleStylusAction(event, pointerIndex, pointerId, false)
                return true
            }
        }

        // Evaluate Palm Rejection & Pointer Classification
        val filterResult = palmFilter.evaluatePointer(event, pointerIndex, w, h)

        when (filterResult) {
            is PalmRejectionFilter.FilteredResult.StylusAction -> {
                handleStylusAction(event, pointerIndex, pointerId, filterResult.isEraser)
            }
            is PalmRejectionFilter.FilteredResult.FingerEraser -> {
                handleFingerEraser(event, pointerIndex, pointerId)
            }
            is PalmRejectionFilter.FilteredResult.CancelStroke -> {
                handleCancelStroke(event, pointerId)
            }
            is PalmRejectionFilter.FilteredResult.MultiFingerGesture -> {
                handleMultiFingerGesture(event)
            }
            is PalmRejectionFilter.FilteredResult.RejectedPalm -> {
                // Drop palm contact with zero allocations
            }
            is PalmRejectionFilter.FilteredResult.Ignore -> {
                // Ignore
            }
        }

        if (palmFilter.config.debugOverlayEnabled) {
            invalidate()
        }
        return true
    }

    override fun onGenericMotionEvent(event: MotionEvent): Boolean {
        if (event.actionMasked == MotionEvent.ACTION_HOVER_MOVE ||
            event.actionMasked == MotionEvent.ACTION_HOVER_ENTER ||
            event.actionMasked == MotionEvent.ACTION_HOVER_EXIT) {
            requestUnbufferedDispatch(event)
            palmFilter.onHoverEvent(event)
            if (palmFilter.config.debugOverlayEnabled) {
                invalidate()
            }
            return true
        }
        return super.onGenericMotionEvent(event)
    }

    private fun handleStylusAction(event: MotionEvent, pointerIndex: Int, pointerId: Int, isHardwareEraser: Boolean) {
        val action = event.actionMasked

        val hasBarrelButton = (event.buttonState and MotionEvent.BUTTON_STYLUS_PRIMARY) != 0 ||
                (event.buttonState and MotionEvent.BUTTON_STYLUS_SECONDARY) != 0 ||
                (event.buttonState and MotionEvent.BUTTON_SECONDARY) != 0 ||
                (event.buttonState and MotionEvent.BUTTON_TERTIARY) != 0

        val isTemporaryLaserDrawing = (currentTool == CanvasTool.GLOW_PEN && glowPenMode == GlowPenPersistenceMode.TEMPORARY) ||
                (hasBarrelButton && barrelButtonAction == BarrelButtonAction.TEMPORARY_LASER)

        // Strict Pen Only Mode: reject any non-stylus pointer attempting to ink (unless using temporary laser pointer)
        if (!isTemporaryLaserDrawing && palmFilter.config.inputMode == com.antigravity.note.inkengine.palm.InputMode.PEN_ONLY) {
            val toolType = event.getToolType(pointerIndex)
            if (toolType != MotionEvent.TOOL_TYPE_STYLUS && toolType != MotionEvent.TOOL_TYPE_ERASER) {
                return
            }
        }

        val isEraser = isHardwareEraser || currentTool == CanvasTool.STROKE_ERASER ||
                (hasBarrelButton && barrelButtonAction == BarrelButtonAction.ERASER)

        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)

        if (hasBarrelButton) {
            when (barrelButtonAction) {
                BarrelButtonAction.LASSO -> {
                    if (currentTool != CanvasTool.LASSO) {
                        setTool(CanvasTool.LASSO)
                    }
                }
                BarrelButtonAction.UNDO -> {
                    if (action == MotionEvent.ACTION_DOWN) {
                        undo()
                    }
                }
                BarrelButtonAction.COLOR_PICKER -> {
                    if (action == MotionEvent.ACTION_DOWN) {
                        onStationaryColorPickerTriggered?.invoke(screenX, screenY)
                    }
                }
                BarrelButtonAction.PAN -> {
                    if (action == MotionEvent.ACTION_DOWN) {
                        isReadOnlyPanDragging = true
                        lastReadOnlyPanX = screenX
                        lastReadOnlyPanY = screenY
                    }
                }
                BarrelButtonAction.TEMPORARY_LASER -> {}
                BarrelButtonAction.ERASER, BarrelButtonAction.DISABLED -> {}
            }
        }

        // Temporary Laser Pointer Mode (Zero Side Effects, Works Even When Locked)
        if (isTemporaryLaserDrawing) {
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            val worldX = tempPoint.x
            val worldY = tempPoint.y

            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    laserOverlay.onActionDown(worldX, worldY, event.eventTime)
                }
                MotionEvent.ACTION_MOVE -> {
                    val historySize = event.historySize
                    for (h in 0 until historySize) {
                        dryInkView.transform.screenToWorld(event.getHistoricalX(pointerIndex, h), event.getHistoricalY(pointerIndex, h), tempPoint)
                        laserOverlay.onHistoricalMove(tempPoint.x, tempPoint.y, event.getHistoricalEventTime(h))
                    }
                    laserOverlay.onActionMove(worldX, worldY, event.eventTime)
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    laserOverlay.onActionUp(event.eventTime)
                }
                MotionEvent.ACTION_CANCEL -> {
                    laserOverlay.onActionCancel()
                }
            }
            return
        }

        if (isReadOnly) {
            // Read-Only Lock Mode: all write/erase actions are blocked.
            // Support single pointer scrolling/panning to read comfortably.
            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    isReadOnlyPanDragging = true
                    lastReadOnlyPanX = screenX
                    lastReadOnlyPanY = screenY
                }
                MotionEvent.ACTION_MOVE -> {
                    if (isReadOnlyPanDragging) {
                        val dx = screenX - lastReadOnlyPanX
                        val dy = screenY - lastReadOnlyPanY
                        dryInkView.transform.postTranslate(dx, dy)
                        lastReadOnlyPanX = screenX
                        lastReadOnlyPanY = screenY
                        dryInkView.invalidate()
                        onViewportTransformChanged?.invoke(
                            dryInkView.transform.scale,
                            dryInkView.transform.translationX,
                            dryInkView.transform.translationY
                        )
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_CANCEL -> {
                    isReadOnlyPanDragging = false
                }
            }
            return
        }

        if (isEraser) {
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            val worldX = tempPoint.x
            val worldY = tempPoint.y
            val currentScale = dryInkView.transform.scale.coerceAtLeast(0.1f)
            val eraseRadius = (strokeWidth * 4f / currentScale).coerceAtLeast(24f / currentScale)

            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    val gesture = ActiveEraseGesture()
                    gesture.previousWorldX = worldX
                    gesture.previousWorldY = worldY
                    activeEraseGesture = gesture
                    executeEraseStep(worldX, worldY, eraseRadius, gesture)
                }
                MotionEvent.ACTION_MOVE -> {
                    val gesture = activeEraseGesture ?: ActiveEraseGesture().also {
                        it.previousWorldX = worldX
                        it.previousWorldY = worldY
                        activeEraseGesture = it
                    }
                    if (!gesture.previousWorldX.isNaN()) {
                        executeEraseSweep(gesture.previousWorldX, gesture.previousWorldY, worldX, worldY, eraseRadius, gesture)
                    } else {
                        executeEraseStep(worldX, worldY, eraseRadius, gesture)
                    }
                    gesture.previousWorldX = worldX
                    gesture.previousWorldY = worldY
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_CANCEL -> {
                    finishEraseGesture()
                }
            }
            return
        }

        // Selection Transform Mode (handles resize/move when shape is inserted or lassoed)
        if (lassoTool.mode == com.antigravity.note.inkengine.lasso.LassoMode.TRANSFORMING && lassoTool.selectedStrokes.isNotEmpty()) {
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_POINTER_DOWN) {
                if (lassoTool.hitTest(tempPoint.x, tempPoint.y)) {
                    isTransformingSelection = true
                    lassoTool.startLasso(tempPoint.x, tempPoint.y)
                    dryInkView.invalidate()
                    return
                } else {
                    // Tap outside selection: deselect handles so normal drawing proceeds seamlessly
                    isTransformingSelection = false
                    lassoTool.clearSelection()
                    dryInkView.invalidate()
                    onLassoSelectionChanged?.invoke(false)
                }
            } else if (isTransformingSelection) {
                if (action == MotionEvent.ACTION_MOVE) {
                    val changed = lassoTool.continueLasso(tempPoint.x, tempPoint.y)
                    if (changed) dryInkView.invalidate()
                    return
                } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_CANCEL) {
                    isTransformingSelection = false
                    lassoTool.finishTransform()
                    dryInkView.invalidate()
                    return
                }
            }
        }

        // Lasso Tool Mode
        if (currentTool == CanvasTool.LASSO) {
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    val hitImg = dryInkView.findImageAt(tempPoint.x, tempPoint.y)
                    if (hitImg != null) {
                        selectImage(hitImg)
                        return
                    }
                    lassoTool.startLasso(tempPoint.x, tempPoint.y)
                    dryInkView.invalidate()
                }
                MotionEvent.ACTION_MOVE -> {
                    val changed = lassoTool.continueLasso(tempPoint.x, tempPoint.y)
                    if (changed) dryInkView.invalidate()
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    if (lassoTool.mode == com.antigravity.note.inkengine.lasso.LassoMode.TRANSFORMING) {
                        lassoTool.finishTransform()
                        dryInkView.invalidate()
                    } else {
                        val hasSelection = lassoTool.finishLasso(dryInkView.strokes)
                        dryInkView.invalidate()
                        onLassoSelectionChanged?.invoke(hasSelection)
                    }
                }
            }
            return
        }

        // Pen Drawing Mode with Decoupled Stationary Long-Press & Real-Time Hold-to-Snap
        when (action) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                strokePoints.clear()
                isStrokeSnapped = false
                snappedStrokesForCurrentTouch.clear()
                activePointerIdForSnap = pointerId

                dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
                strokePoints.add(ShapeRecognizer.Point(tempPoint.x, tempPoint.y, event.eventTime))
                lastMoveTime = SystemClock.uptimeMillis()
                lastMoveX = screenX
                lastMoveY = screenY
                lastTouchScreenX = screenX
                lastTouchScreenY = screenY
                totalStrokePathLength = 0f
                isStationaryLongPressCancelled = false

                removeCallbacks(holdToSnapRunnable)
                removeCallbacks(stationaryLongPressRunnable)

                // Stationary long-press ONLY starts on initial contact (movement < 14px)
                if (stationaryLongPressAction != StationaryLongPressAction.DISABLED && currentTool != CanvasTool.STROKE_ERASER && currentTool != CanvasTool.LASSO) {
                    postDelayed(stationaryLongPressRunnable, holdToEraseDelayMs)
                }
                isHoldErasing = false

                predictor.record(event)
                val strokeId = inProgressStrokesView.startStroke(
                    event,
                    pointerId,
                    activeBrush,
                    dryInkView.transform.screenToWorldMatrix,
                    identityMatrix
                )
                activeStrokeIds[pointerId] = strokeId

                if (currentTool == CanvasTool.GLOW_PEN && glowPenMode == GlowPenPersistenceMode.PERMANENT) {
                    laserOverlay.neonColor = strokeColor
                    laserOverlay.startLivePermanentGlow(tempPoint.x, tempPoint.y, event.eventTime)
                }
            }
            MotionEvent.ACTION_MOVE -> {
                if (isHoldErasing) {
                    lastMoveX = screenX
                    lastMoveY = screenY
                    dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
                    val worldX = tempPoint.x
                    val worldY = tempPoint.y
                    val currentScale = dryInkView.transform.scale.coerceAtLeast(0.1f)
                    val eraseRadius = (strokeWidth * 4.5f / currentScale).coerceAtLeast(24f / currentScale)
                    val gesture = activeEraseGesture ?: ActiveEraseGesture().also {
                        it.previousWorldX = worldX
                        it.previousWorldY = worldY
                        activeEraseGesture = it
                    }
                    if (!gesture.previousWorldX.isNaN()) {
                        executeEraseSweep(gesture.previousWorldX, gesture.previousWorldY, worldX, worldY, eraseRadius, gesture)
                    } else {
                        executeEraseStep(worldX, worldY, eraseRadius, gesture)
                    }
                    gesture.previousWorldX = worldX
                    gesture.previousWorldY = worldY
                    invalidate()
                    return
                }

                if (!isStrokeSnapped) {
                    // Ultra-low latency: process historical points at 120Hz+
                    val historySize = event.historySize
                    for (h in 0 until historySize) {
                        val histX = event.getHistoricalX(pointerIndex, h)
                        val histY = event.getHistoricalY(pointerIndex, h)
                        val histTime = event.getHistoricalEventTime(h)
                        dryInkView.transform.screenToWorld(histX, histY, tempPoint)
                        strokePoints.add(ShapeRecognizer.Point(tempPoint.x, tempPoint.y, histTime))
                    }

                    dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
                    strokePoints.add(ShapeRecognizer.Point(tempPoint.x, tempPoint.y, event.eventTime))

                    val stepDist = hypot(screenX - lastTouchScreenX, screenY - lastTouchScreenY)
                    totalStrokePathLength += stepDist
                    lastTouchScreenX = screenX
                    lastTouchScreenY = screenY

                    // Once stylus moves beyond touchSlop (>= 14px), permanently cancel stationary long-press timer!
                    if (totalStrokePathLength >= 14f && !isStationaryLongPressCancelled) {
                        isStationaryLongPressCancelled = true
                        removeCallbacks(stationaryLongPressRunnable)
                    }

                    val moveDist = hypot(screenX - lastMoveX, screenY - lastMoveY)
                    if (moveDist > 14f) {
                        lastMoveTime = SystemClock.uptimeMillis()
                        lastMoveX = screenX
                        lastMoveY = screenY
                        // Hold-to-Shape ONLY activates if totalPathLength >= 24px and pen pauses
                        if (holdToSnapEnabled && totalStrokePathLength >= 24f && currentTool != CanvasTool.STROKE_ERASER && currentTool != CanvasTool.LASSO) {
                            removeCallbacks(holdToSnapRunnable)
                            postDelayed(holdToSnapRunnable, holdToSnapDelayMs)
                        }
                    }

                    predictor.record(event)
                    val strokeId = activeStrokeIds[pointerId] ?: return
                    val predictedEvent = predictor.predict()
                    inProgressStrokesView.addToStroke(event, pointerId, strokeId, predictedEvent)
                    predictedEvent?.recycle()

                    if (currentTool == CanvasTool.GLOW_PEN && glowPenMode == GlowPenPersistenceMode.PERMANENT) {
                        for (h in 0 until historySize) {
                            val histX = event.getHistoricalX(pointerIndex, h)
                            val histY = event.getHistoricalY(pointerIndex, h)
                            dryInkView.transform.screenToWorld(histX, histY, tempPoint)
                            laserOverlay.updateLivePermanentGlow(tempPoint.x, tempPoint.y, event.getHistoricalEventTime(h))
                        }
                        dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
                        laserOverlay.updateLivePermanentGlow(tempPoint.x, tempPoint.y, event.eventTime)
                    }
                }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                if (currentTool == CanvasTool.GLOW_PEN && glowPenMode == GlowPenPersistenceMode.PERMANENT) {
                    laserOverlay.finishLivePermanentGlow()
                }
                removeCallbacks(holdToSnapRunnable)
                removeCallbacks(stationaryLongPressRunnable)
                if (isHoldErasing) {
                    isHoldErasing = false
                    finishEraseGesture()
                    dryInkView.invalidate()
                    invalidate()
                    return
                }
                val strokeId = activeStrokeIds.remove(pointerId)

                if (isStrokeSnapped && snappedStrokesForCurrentTouch.isNotEmpty()) {
                    val actionRecord = StrokeAction(addedStrokes = snappedStrokesForCurrentTouch.toList())
                    undoStack.add(actionRecord)
                    redoStack.clear()
                    notifyUndoRedoState()
                    val isNeonGlow = (currentTool == CanvasTool.GLOW_PEN && glowPenMode == GlowPenPersistenceMode.PERMANENT)
                    for (s in snappedStrokesForCurrentTouch) {
                        if (isNeonGlow) {
                            onStrokeCommittedWithStyle?.invoke(s, StrokeStyle.NEON_GLOW)
                                ?: onStrokeCommitted?.invoke(s)
                        } else {
                            onStrokeCommittedWithStyle?.invoke(s, StrokeStyle.STANDARD)
                                ?: onStrokeCommitted?.invoke(s)
                        }
                    }
                    isStrokeSnapped = false
                    snappedStrokesForCurrentTouch.clear()
                    dryInkView.invalidate()
                    return
                }

                if (strokeId == null) return

                predictor.record(event)
                inProgressStrokesView.finishStroke(event, pointerId, strokeId)
            }
        }
    }

    private fun handleCancelStroke(event: MotionEvent, pointerId: Int) {
        laserOverlay.finishLivePermanentGlow()
        removeCallbacks(holdToSnapRunnable)
        removeCallbacks(stationaryLongPressRunnable)
        isHoldErasing = false
        if (pointerId == activePointerIdForSnap) {
            if (isStrokeSnapped && snappedStrokesForCurrentTouch.isNotEmpty()) {
                // If it was already snapped while holding, treat cancel as release/commit! Ink is never lost!
                val actionRecord = StrokeAction(addedStrokes = snappedStrokesForCurrentTouch.toList())
                undoStack.add(actionRecord)
                redoStack.clear()
                notifyUndoRedoState()
                val isNeonGlow = (currentTool == CanvasTool.GLOW_PEN && glowPenMode == GlowPenPersistenceMode.PERMANENT)
                for (s in snappedStrokesForCurrentTouch) {
                    if (isNeonGlow) {
                        onStrokeCommittedWithStyle?.invoke(s, StrokeStyle.NEON_GLOW)
                            ?: onStrokeCommitted?.invoke(s)
                    } else {
                        onStrokeCommittedWithStyle?.invoke(s, StrokeStyle.STANDARD)
                            ?: onStrokeCommitted?.invoke(s)
                    }
                }
                isStrokeSnapped = false
                snappedStrokesForCurrentTouch.clear()
                dryInkView.invalidate()
            }
            val strokeId = activeStrokeIds.remove(pointerId)
            if (strokeId != null) {
                try {
                    inProgressStrokesView.cancelStroke(strokeId, event)
                } catch (_: Exception) {}
            }
        }
    }

    private fun handleFingerEraser(event: MotionEvent, pointerIndex: Int, pointerId: Int) {
        val action = event.actionMasked
        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)

        if (isReadOnly) {
            // Read-Only Lock Mode: all write/erase actions are blocked.
            // Support single pointer scrolling/panning to read comfortably.
            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    isReadOnlyPanDragging = true
                    lastReadOnlyPanX = screenX
                    lastReadOnlyPanY = screenY
                }
                MotionEvent.ACTION_MOVE -> {
                    if (isReadOnlyPanDragging) {
                        val dx = screenX - lastReadOnlyPanX
                        val dy = screenY - lastReadOnlyPanY
                        dryInkView.transform.postTranslate(dx, dy)
                        lastReadOnlyPanX = screenX
                        lastReadOnlyPanY = screenY
                        dryInkView.invalidate()
                        onViewportTransformChanged?.invoke(
                            dryInkView.transform.scale,
                            dryInkView.transform.translationX,
                            dryInkView.transform.translationY
                        )
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_CANCEL -> {
                    isReadOnlyPanDragging = false
                }
            }
            return
        }

        dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
        val worldX = tempPoint.x
        val worldY = tempPoint.y
        val currentScale = dryInkView.transform.scale.coerceAtLeast(0.1f)
        val eraseRadius = (44f / currentScale).coerceAtLeast(24f / currentScale)

        when (action) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                isFingerErasing = true
                fingerEraseScreenX = screenX
                fingerEraseScreenY = screenY
                val gesture = ActiveEraseGesture()
                gesture.previousWorldX = worldX
                gesture.previousWorldY = worldY
                activeEraseGesture = gesture
                executeEraseStep(worldX, worldY, eraseRadius, gesture)
                invalidate()
            }
            MotionEvent.ACTION_MOVE -> {
                if (isFingerErasing) {
                    fingerEraseScreenX = screenX
                    fingerEraseScreenY = screenY
                    val gesture = activeEraseGesture ?: ActiveEraseGesture().also {
                        it.previousWorldX = worldX
                        it.previousWorldY = worldY
                        activeEraseGesture = it
                    }
                    if (!gesture.previousWorldX.isNaN()) {
                        executeEraseSweep(gesture.previousWorldX, gesture.previousWorldY, worldX, worldY, eraseRadius, gesture)
                    } else {
                        executeEraseStep(worldX, worldY, eraseRadius, gesture)
                    }
                    gesture.previousWorldX = worldX
                    gesture.previousWorldY = worldY
                    invalidate()
                }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_CANCEL -> {
                isFingerErasing = false
                fingerEraseScreenX = 0f
                fingerEraseScreenY = 0f
                finishEraseGesture()
                invalidate()
            }
        }
    }

    private fun handleMultiFingerGesture(event: MotionEvent) {
        if (event.pointerCount >= 2) {
            val p0X = event.getX(0)
            val p0Y = event.getY(0)
            val p1X = event.getX(1)
            val p1Y = event.getY(1)

            val currentDist = hypot(p0X - p1X, p0Y - p1Y)
            val centerX = (p0X + p1X) / 2f
            val centerY = (p0Y + p1Y) / 2f
            val density = resources.displayMetrics.density

            when (event.actionMasked) {
                MotionEvent.ACTION_POINTER_DOWN, MotionEvent.ACTION_DOWN -> {
                    // Instantly cancel any accidental in-progress stroke started by the first finger contact
                    if (activeStrokeIds.isNotEmpty()) {
                        for ((_, sId) in activeStrokeIds) {
                            try {
                                inProgressStrokesView.cancelStroke(sId, event)
                            } catch (_: Exception) {}
                        }
                        activeStrokeIds.clear()
                        strokePoints.clear()
                        removeCallbacks(holdToSnapRunnable)
                        removeCallbacks(stationaryLongPressRunnable)
                    }
                    isGestureActive = true
                    lastGestureDistance = currentDist
                    lastGestureCenterX = centerX
                    lastGestureCenterY = centerY
                    gestureStartTime = SystemClock.uptimeMillis()
                    totalGestureMovement = 0f

                    // Hardened Two-Finger Tap Validation:
                    // 1. Both pointers must be TOOL_TYPE_FINGER
                    // 2. Both touchMajor must not exceed palm threshold
                    // 3. Distance between fingers must be reasonable (e.g. 18dp to 140dp)
                    val p0Tool = event.getToolType(0)
                    val p1Tool = event.getToolType(1)
                    val p0Major = event.getTouchMajor(0)
                    val p1Major = event.getTouchMajor(1)
                    val distDp = currentDist / density

                    isDisqualifiedFromUndoTap = (p0Tool != MotionEvent.TOOL_TYPE_FINGER ||
                            p1Tool != MotionEvent.TOOL_TYPE_FINGER ||
                            p0Major > palmFilter.config.palmTouchMajorThresholdPx ||
                            p1Major > palmFilter.config.palmTouchMajorThresholdPx ||
                            distDp < 18f || distDp > 140f)
                }
                MotionEvent.ACTION_MOVE -> {
                    for (i in 0 until event.pointerCount) {
                        if (event.getToolType(i) != MotionEvent.TOOL_TYPE_FINGER ||
                            event.getTouchMajor(i) > palmFilter.config.palmTouchMajorThresholdPx) {
                            isDisqualifiedFromUndoTap = true
                            break
                        }
                    }

                    if (!isGestureActive || lastGestureDistance <= 0f) {
                        // Resilient gesture recovery:
                        // If POINTER_DOWN was missed or merged by Android OS,
                        // activate gesture tracking immediately on first MOVE!
                        if (activeStrokeIds.isNotEmpty()) {
                            for ((_, sId) in activeStrokeIds) {
                                try {
                                    inProgressStrokesView.cancelStroke(sId, event)
                                } catch (_: Exception) {}
                            }
                            activeStrokeIds.clear()
                            strokePoints.clear()
                            removeCallbacks(holdToSnapRunnable)
                            removeCallbacks(stationaryLongPressRunnable)
                        }
                        isGestureActive = true
                        lastGestureDistance = currentDist
                        lastGestureCenterX = centerX
                        lastGestureCenterY = centerY
                        gestureStartTime = SystemClock.uptimeMillis()
                        totalGestureMovement = 0f
                    } else {
                        val dx = centerX - lastGestureCenterX
                        val dy = centerY - lastGestureCenterY
                        val movement = hypot(dx, dy)
                        totalGestureMovement += movement

                        dryInkView.transform.postTranslate(dx, dy)

                        if (lastGestureDistance > 0f) {
                            val scaleFactor = currentDist / lastGestureDistance
                            if (scaleFactor > 0.05f && scaleFactor < 20f) {
                                dryInkView.transform.postScale(scaleFactor, centerX, centerY)
                            }
                        }

                        lastGestureDistance = currentDist
                        lastGestureCenterX = centerX
                        lastGestureCenterY = centerY
                        dryInkView.invalidate()
                        onViewportTransformChanged?.invoke(
                            dryInkView.transform.scale,
                            dryInkView.transform.translationX,
                            dryInkView.transform.translationY
                        )
                    }
                }
                MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    val duration = SystemClock.uptimeMillis() - gestureStartTime
                    val slopPx = 12f * density
                    // Only trigger undo/redo if two-finger undo is enabled and qualified
                    if (isTwoFingerUndoEnabled && !isDisqualifiedFromUndoTap && totalGestureMovement < slopPx && duration in 40L..250L) {
                        // Rapid 2-finger tap detected -> Undo
                        if (event.pointerCount == 2) {
                            undo()
                        } else if (event.pointerCount == 3) {
                            redo()
                        }
                    }
                    isGestureActive = false
                    isDisqualifiedFromUndoTap = false
                    lastGestureDistance = 0f
                    totalGestureMovement = 0f
                }
            }
        }
    }

    fun undo() {
        if (isReadOnly || undoStack.isEmpty()) return
        val action = undoStack.removeAt(undoStack.lastIndex)
        if (action.addedStrokes.isNotEmpty() && action.removedStrokes.isNotEmpty()) {
            dryInkView.replaceStrokes(action.addedStrokes, action.removedStrokes)
            onStrokesReplaced?.invoke(action.addedStrokes, action.removedStrokes)
        } else {
            // Revert added strokes
            if (action.addedStrokes.isNotEmpty()) {
                dryInkView.removeStrokes(action.addedStrokes)
                onStrokesReplaced?.invoke(action.addedStrokes, emptyList())
            }
            // Restore removed strokes
            if (action.removedStrokes.isNotEmpty()) {
                dryInkView.addStrokes(action.removedStrokes)
                onStrokesReplaced?.invoke(emptyList(), action.removedStrokes)
            }
        }
        redoStack.add(action)
        notifyUndoRedoState()
        dryInkView.invalidate()
    }

    fun redo() {
        if (isReadOnly || redoStack.isEmpty()) return
        val action = redoStack.removeAt(redoStack.lastIndex)
        if (action.addedStrokes.isNotEmpty() && action.removedStrokes.isNotEmpty()) {
            dryInkView.replaceStrokes(action.removedStrokes, action.addedStrokes)
            onStrokesReplaced?.invoke(action.removedStrokes, action.addedStrokes)
        } else {
            // Re-apply added strokes
            if (action.addedStrokes.isNotEmpty()) {
                dryInkView.addStrokes(action.addedStrokes)
                onStrokesReplaced?.invoke(emptyList(), action.addedStrokes)
            }
            // Re-apply removals
            if (action.removedStrokes.isNotEmpty()) {
                dryInkView.removeStrokes(action.removedStrokes)
                onStrokesReplaced?.invoke(action.removedStrokes, emptyList())
            }
        }
        undoStack.add(action)
        notifyUndoRedoState()
        dryInkView.invalidate()
    }

    fun clearCanvas() {
        inProgressStrokesView.cancelUnfinishedStrokes()
        inProgressStrokesView.removeFinishedStrokes(inProgressStrokesView.getFinishedStrokes().keys)
        if (dryInkView.strokes.isNotEmpty()) {
            val action = StrokeAction(removedStrokes = dryInkView.strokes.toList())
            dryInkView.clearAllStrokes()
            undoStack.add(action)
            redoStack.clear()
            notifyUndoRedoState()
            onClearCommitted?.invoke()
        }
        dryInkView.invalidate()
    }

    fun resetZoom() {
        dryInkView.transform.reset()
        dryInkView.invalidate()
        onViewportTransformChanged?.invoke(
            dryInkView.transform.scale,
            dryInkView.transform.translationX,
            dryInkView.transform.translationY
        )
    }

    // Phase 4 Lasso Operations
    fun duplicateLassoSelection(): List<Stroke> {
        if (isReadOnly) return emptyList()
        val duplicated = lassoTool.duplicateSelected()
        if (duplicated.isNotEmpty()) {
            dryInkView.addStrokes(duplicated)
            undoStack.add(StrokeAction(addedStrokes = duplicated))
            redoStack.clear()
            notifyUndoRedoState()
            for (s in duplicated) {
                onStrokeCommitted?.invoke(s)
            }
            dryInkView.invalidate()
        }
        return duplicated
    }

    fun copyLassoSelection(): Int = lassoTool.copySelected()

    fun pasteLassoClipboard(): List<Stroke> {
        if (isReadOnly) return emptyList()
        val pasted = lassoTool.pasteClipboard()
        if (pasted.isNotEmpty()) {
            dryInkView.addStrokes(pasted)
            undoStack.add(StrokeAction(addedStrokes = pasted))
            redoStack.clear()
            notifyUndoRedoState()
            for (s in pasted) {
                onStrokeCommitted?.invoke(s)
            }
            dryInkView.invalidate()
            onLassoSelectionChanged?.invoke(true)
        }
        return pasted
    }

    fun getViewportCenter(): Pair<Float, Float> {
        val scrX = if (width > 0) width / 2f else 1000f
        val scrY = if (height > 0) height / 2f else 1400f
        dryInkView.transform.screenToWorld(scrX, scrY, tempPoint)
        return Pair(tempPoint.x, tempPoint.y)
    }

    fun insertShape(shape: RecognizedShape) {
        if (isReadOnly) return
        android.util.Log.d("ANTIGRAVITY_INK", "insertShape: $shape, activeBrushSize=${activeBrush.size}")
        val strokes = shapeRecognizer.createStrokesForShape(shape, activeBrush)
        android.util.Log.d("ANTIGRAVITY_INK", "insertShape generated ${strokes.size} strokes")
        dryInkView.addStrokes(strokes)
        undoStack.add(StrokeAction(addedStrokes = strokes))
        redoStack.clear()
        notifyUndoRedoState()
        for (s in strokes) {
            onStrokeCommitted?.invoke(s)
        }
        lassoTool.selectStrokes(strokes)
        dryInkView.invalidate()
        onLassoSelectionChanged?.invoke(true)
    }

    fun changeLassoSelectionColor(color: Int) {
        if (isReadOnly) return
        val result = lassoTool.changeColorSelected(color)
        if (result.newStrokes.isNotEmpty()) {
            dryInkView.removeStrokes(result.oldStrokes)
            dryInkView.addStrokes(result.newStrokes)
            undoStack.add(StrokeAction(addedStrokes = result.newStrokes, removedStrokes = result.oldStrokes))
            redoStack.clear()
            notifyUndoRedoState()
            onStrokesReplaced?.invoke(result.oldStrokes, result.newStrokes)
            dryInkView.invalidate()
        }
    }

    fun deleteLassoSelection() {
        if (isReadOnly) return
        val toDelete = lassoTool.selectedStrokes.toList()
        if (toDelete.isNotEmpty()) {
            dryInkView.removeStrokes(toDelete)
            undoStack.add(StrokeAction(removedStrokes = toDelete))
            redoStack.clear()
            notifyUndoRedoState()
            lassoTool.clearSelection()
            dryInkView.invalidate()
            onLassoSelectionChanged?.invoke(false)
            onStrokesReplaced?.invoke(toDelete, emptyList())
        }
    }

    fun clearLassoSelection() {
        lassoTool.clearSelection()
        dryInkView.invalidate()
        onLassoSelectionChanged?.invoke(false)
    }

    // Phase 4 Background PDF Tiling Operations
    fun loadPdf(file: File) {
        pdfTiler.openPdf(file)
        dryInkView.pdfTiler = pdfTiler
        dryInkView.currentPdfPageIndex = 0
        dryInkView.invalidate()
    }

    fun setPdfPage(index: Int) {
        dryInkView.currentPdfPageIndex = index.coerceIn(0, (pdfTiler.pageCount - 1).coerceAtLeast(0))
        dryInkView.invalidate()
    }

    fun closePdf() {
        pdfTiler.close()
        dryInkView.invalidate()
    }

    fun setInfiniteCanvasMode(enabled: Boolean) {
        dryInkView.isInfiniteCanvas = enabled
        dryInkView.invalidate()
    }

    fun isInfiniteCanvasMode(): Boolean = dryInkView.isInfiniteCanvas

    // Phase 5 ML Kit Handwriting Recognition & Search
    suspend fun convertLassoSelectionToText(): String? {
        val selected = lassoTool.selectedStrokes.toList()
        if (selected.isEmpty()) return null
        val ready = digitalInkManager.ensureModelReady()
        if (!ready) {
            android.util.Log.w("InkCanvasView", "Digital Ink model not ready or could not download")
            return null
        }
        val candidates = digitalInkManager.recognizeStrokes(selected)
        return candidates.firstOrNull()
    }

    suspend fun searchHandwriting(query: String): List<RectF> {
        if (query.isBlank() || dryInkView.strokes.isEmpty()) {
            dryInkView.clearSearchHighlights()
            return emptyList()
        }
        if (!digitalInkManager.isModelDownloaded()) {
            val ok = digitalInkManager.downloadModelIfNeeded()
            if (!ok) return emptyList()
        }

        val matchedBounds = mutableListOf<RectF>()
        val blockSize = 15
        val strokeChunks = dryInkView.strokes.chunked(blockSize)

        for (chunk in strokeChunks) {
            val candidates = digitalInkManager.recognizeStrokes(chunk)
            val matched = candidates.any { it.contains(query, ignoreCase = true) }
            if (matched) {
                var minX = Float.MAX_VALUE
                var maxX = -Float.MAX_VALUE
                var minY = Float.MAX_VALUE
                var maxY = -Float.MAX_VALUE
                for (s in chunk) {
                    val box = s.shape.computeBoundingBox() ?: continue
                    if (box.xMin < minX) minX = box.xMin
                    if (box.xMax > maxX) maxX = box.xMax
                    if (box.yMin < minY) minY = box.yMin
                    if (box.yMax > maxY) maxY = box.yMax
                }
                if (minX < maxX && minY < maxY) {
                    matchedBounds.add(RectF(minX - 8f, minY - 8f, maxX + 8f, maxY + 8f))
                }
            }
        }

        dryInkView.setSearchHighlights(matchedBounds)
        return matchedBounds
    }

    fun clearSearchHighlights() {
        dryInkView.clearSearchHighlights()
    }

    private fun notifyUndoRedoState() {
        onUndoRedoStateChanged?.invoke(undoStack.isNotEmpty(), redoStack.isNotEmpty())
    }

    override fun dispatchDraw(canvas: Canvas) {
        super.dispatchDraw(canvas)

        // Draw temporary laser pointer overlay (above committed dry ink and in-progress ink)
        if (laserOverlay.hasActiveContent()) {
            canvas.save()
            canvas.concat(dryInkView.transform.worldToScreenMatrix)
            laserOverlay.draw(canvas)
            canvas.restore()
        }

        // Measure sustained frame rate
        val nowNanos = SystemClock.elapsedRealtimeNanos()
        if (lastFrameTimeNanos > 0L) {
            val deltaNanos = nowNanos - lastFrameTimeNanos
            if (deltaNanos > 0L) {
                val instantFps = (1_000_000_000f / deltaNanos).coerceIn(30f, 144f)
                measuredFps = (measuredFps * 0.9f) + (instantFps * 0.1f)
                frameCount++
                if (frameCount % 30 == 0) {
                    onFpsMeasured?.invoke(measuredFps)
                }
            }
        }
        lastFrameTimeNanos = nowNanos

        // Draw visual cursor indicator for active finger eraser or hold-to-erase
        if (isHoldErasing && lastMoveX > 0f) {
            canvas.drawCircle(lastMoveX, lastMoveY, 36f, fingerEraserFillPaint)
            canvas.drawCircle(lastMoveX, lastMoveY, 36f, fingerEraserOutlinePaint)
        }
        if (isFingerErasing && fingerEraseScreenX > 0f) {
            canvas.drawCircle(fingerEraseScreenX, fingerEraseScreenY, 44f, fingerEraserFillPaint)
            canvas.drawCircle(fingerEraseScreenX, fingerEraseScreenY, 44f, fingerEraserOutlinePaint)
        }

        // Live 120fps Preview: OneNote-Style Drag-to-Stretch Shape Placement
        if (isDraggingShapePlacement) {
            val p1 = PointF()
            val p2 = PointF()
            dryInkView.transform.worldToScreen(shapePlacementStartWorldX, shapePlacementStartWorldY, p1)
            dryInkView.transform.worldToScreen(shapePlacementCurrentWorldX, shapePlacementCurrentWorldY, p2)
            var left = minOf(p1.x, p2.x)
            var top = minOf(p1.y, p2.y)
            var right = maxOf(p1.x, p2.x)
            var bottom = maxOf(p1.y, p2.y)
            var w = right - left
            var h = bottom - top
            val shapeType = pendingPlacementShape ?: ShapePlacementType.RECTANGLE

            if (is1to1AspectLocked || shapeType == ShapePlacementType.SQUARE || shapeType == ShapePlacementType.CIRCLE) {
                val maxSide = maxOf(w, h)
                w = maxSide
                h = maxSide
                right = left + w
                bottom = top + h
            }

            when (shapeType) {
                ShapePlacementType.CIRCLE -> {
                    val r = minOf(w, h) / 2f
                    val midX = (left + right) / 2f
                    val midY = (top + bottom) / 2f
                    canvas.drawCircle(midX, midY, r, previewShapeFillPaint)
                    canvas.drawCircle(midX, midY, r, previewShapePaint)
                }
                ShapePlacementType.ELLIPSE -> {
                    canvas.drawOval(left, top, right, bottom, previewShapeFillPaint)
                    canvas.drawOval(left, top, right, bottom, previewShapePaint)
                }
                ShapePlacementType.SQUARE, ShapePlacementType.RECTANGLE -> {
                    canvas.drawRoundRect(left, top, right, bottom, 12f, 12f, previewShapeFillPaint)
                    canvas.drawRoundRect(left, top, right, bottom, 12f, 12f, previewShapePaint)
                }
                ShapePlacementType.TRIANGLE -> {
                    val path = Path()
                    val midX = (left + right) / 2f
                    path.moveTo(midX, top)
                    path.lineTo(right, bottom)
                    path.lineTo(left, bottom)
                    path.close()
                    canvas.drawPath(path, previewShapeFillPaint)
                    canvas.drawPath(path, previewShapePaint)
                }
                ShapePlacementType.DIAMOND -> {
                    val path = Path()
                    val midX = (left + right) / 2f
                    val midY = (top + bottom) / 2f
                    path.moveTo(midX, top)
                    path.lineTo(right, midY)
                    path.lineTo(midX, bottom)
                    path.lineTo(left, midY)
                    path.close()
                    canvas.drawPath(path, previewShapeFillPaint)
                    canvas.drawPath(path, previewShapePaint)
                }
                ShapePlacementType.STAR -> {
                    val path = Path()
                    val midX = (left + right) / 2f
                    val midY = (top + bottom) / 2f
                    val outerR = minOf(w, h) / 2f
                    val innerR = outerR * 0.40f
                    for (i in 0 until 10) {
                        val r = if (i % 2 == 0) outerR else innerR
                        val angle = (i * Math.PI / 5.0 - Math.PI / 2.0).toFloat()
                        val px = midX + r * kotlin.math.cos(angle)
                        val py = midY + r * kotlin.math.sin(angle)
                        if (i == 0) path.moveTo(px, py) else path.lineTo(px, py)
                    }
                    path.close()
                    canvas.drawPath(path, previewShapeFillPaint)
                    canvas.drawPath(path, previewShapePaint)
                }
                ShapePlacementType.LINE -> {
                    canvas.drawLine(p1.x, p1.y, p2.x, p2.y, previewShapePaint)
                }
                ShapePlacementType.ARROW -> {
                    canvas.drawLine(p1.x, p1.y, p2.x, p2.y, previewShapePaint)
                    val angle = kotlin.math.atan2(p2.y - p1.y, p2.x - p1.x)
                    val tipLen = 24f
                    val a1 = angle - Math.PI / 6.0
                    val a2 = angle + Math.PI / 6.0
                    canvas.drawLine(p2.x, p2.y, (p2.x - tipLen * kotlin.math.cos(a1)).toFloat(), (p2.y - tipLen * kotlin.math.sin(a1)).toFloat(), previewShapeSolidPaint)
                    canvas.drawLine(p2.x, p2.y, (p2.x - tipLen * kotlin.math.cos(a2)).toFloat(), (p2.y - tipLen * kotlin.math.sin(a2)).toFloat(), previewShapeSolidPaint)
                }
                ShapePlacementType.BIDIRECTIONAL_ARROW, ShapePlacementType.UML_CONNECTOR -> {
                    canvas.drawLine(p1.x, p1.y, p2.x, p2.y, previewShapePaint)
                    val angle = kotlin.math.atan2(p2.y - p1.y, p2.x - p1.x)
                    val tipLen = 22f
                    canvas.drawLine(p2.x, p2.y, (p2.x - tipLen * kotlin.math.cos(angle - Math.PI / 6.0)).toFloat(), (p2.y - tipLen * kotlin.math.sin(angle - Math.PI / 6.0)).toFloat(), previewShapeSolidPaint)
                    canvas.drawLine(p2.x, p2.y, (p2.x - tipLen * kotlin.math.cos(angle + Math.PI / 6.0)).toFloat(), (p2.y - tipLen * kotlin.math.sin(angle + Math.PI / 6.0)).toFloat(), previewShapeSolidPaint)
                    canvas.drawLine(p1.x, p1.y, (p1.x + tipLen * kotlin.math.cos(angle - Math.PI / 6.0)).toFloat(), (p1.y + tipLen * kotlin.math.sin(angle - Math.PI / 6.0)).toFloat(), previewShapeSolidPaint)
                    canvas.drawLine(p1.x, p1.y, (p1.x + tipLen * kotlin.math.cos(angle + Math.PI / 6.0)).toFloat(), (p1.y + tipLen * kotlin.math.sin(angle + Math.PI / 6.0)).toFloat(), previewShapeSolidPaint)
                }
                ShapePlacementType.CACHE_PILL -> {
                    val r = minOf(w, h) / 2f
                    canvas.drawRoundRect(left, top, right, bottom, r, r, previewShapeFillPaint)
                    canvas.drawRoundRect(left, top, right, bottom, r, r, previewShapePaint)
                }
                ShapePlacementType.DATABASE_CYLINDER -> {
                    val ellipseH = minOf(40f, h * 0.22f)
                    canvas.drawOval(left, top, right, top + ellipseH * 2f, previewShapeFillPaint)
                    canvas.drawOval(left, top, right, top + ellipseH * 2f, previewShapePaint)
                    canvas.drawLine(left, top + ellipseH, left, bottom - ellipseH, previewShapePaint)
                    canvas.drawLine(right, top + ellipseH, right, bottom - ellipseH, previewShapePaint)
                    canvas.drawArc(left, bottom - ellipseH * 2f, right, bottom, 0f, 180f, false, previewShapePaint)
                }
                ShapePlacementType.CLOUD -> {
                    canvas.drawRoundRect(left, top, right, bottom, 32f, 32f, previewShapeFillPaint)
                    canvas.drawRoundRect(left, top, right, bottom, 32f, 32f, previewShapePaint)
                }
                ShapePlacementType.UML_CLASS -> {
                    canvas.drawRoundRect(left, top, right, bottom, 12f, 12f, previewShapeFillPaint)
                    canvas.drawRoundRect(left, top, right, bottom, 12f, 12f, previewShapePaint)
                    val div1Y = top + h * 0.28f
                    val div2Y = top + h * 0.62f
                    canvas.drawLine(left, div1Y, right, div1Y, previewShapeSolidPaint)
                    canvas.drawLine(left, div2Y, right, div2Y, previewShapeSolidPaint)
                    val midX = (left + right) / 2f
                    canvas.drawText("ClassName", midX, top + h * 0.20f, previewShapeTextPaint)
                }
                ShapePlacementType.UML_INTERFACE -> {
                    canvas.drawRoundRect(left, top, right, bottom, 12f, 12f, previewShapeFillPaint)
                    canvas.drawRoundRect(left, top, right, bottom, 12f, 12f, previewShapePaint)
                    val divY = top + h * 0.35f
                    canvas.drawLine(left, divY, right, divY, previewShapeSolidPaint)
                    val midX = (left + right) / 2f
                    canvas.drawText("<<interface>>", midX, top + h * 0.24f, previewShapeTextPaint)
                }
                ShapePlacementType.UML_ACTOR -> {
                    val midX = (left + right) / 2f
                    val headR = minOf(w * 0.28f, h * 0.16f)
                    val headCenterY = top + headR + 4f
                    canvas.drawCircle(midX, headCenterY, headR, previewShapePaint)
                    val neckY = headCenterY + headR
                    val hipY = top + h * 0.62f
                    canvas.drawLine(midX, neckY, midX, hipY, previewShapeSolidPaint)
                    val armY = top + h * 0.38f
                    canvas.drawLine(left + w * 0.12f, armY, right - w * 0.12f, armY, previewShapeSolidPaint)
                    canvas.drawLine(midX, hipY, left + w * 0.18f, bottom, previewShapeSolidPaint)
                    canvas.drawLine(midX, hipY, right - w * 0.18f, bottom, previewShapeSolidPaint)
                }
                ShapePlacementType.UML_LIFELINE -> {
                    val headerH = minOf(50f, h * 0.22f)
                    val midX = (left + right) / 2f
                    canvas.drawRoundRect(left, top, right, top + headerH, 8f, 8f, previewShapeFillPaint)
                    canvas.drawRoundRect(left, top, right, top + headerH, 8f, 8f, previewShapePaint)
                    canvas.drawText("Service", midX, top + headerH * 0.70f, previewShapeTextPaint)
                    canvas.drawLine(midX, top + headerH, midX, bottom, previewShapePaint)
                }
                ShapePlacementType.UML_ACTIVATION -> {
                    val barW = minOf(36f, w)
                    val midX = (left + right) / 2f
                    canvas.drawRoundRect(midX - barW / 2f, top, midX + barW / 2f, bottom, 6f, 6f, previewShapeFillPaint)
                    canvas.drawRoundRect(midX - barW / 2f, top, midX + barW / 2f, bottom, 6f, 6f, previewShapePaint)
                }
                ShapePlacementType.UML_FRAGMENT -> {
                    canvas.drawRoundRect(left, top, right, bottom, 8f, 8f, previewShapeFillPaint)
                    canvas.drawRoundRect(left, top, right, bottom, 8f, 8f, previewShapePaint)
                    val tabW = minOf(120f, w * 0.32f)
                    val tabH = minOf(44f, h * 0.22f)
                    val tabPath = Path()
                    tabPath.moveTo(left, top)
                    tabPath.lineTo(left + tabW, top)
                    tabPath.lineTo(left + tabW + 12f, top + tabH)
                    tabPath.lineTo(left, top + tabH)
                    tabPath.close()
                    canvas.drawPath(tabPath, previewShapeSolidPaint)
                    canvas.drawText("loop", left + tabW / 2f, top + tabH * 0.72f, previewShapeTextPaint)
                    val midY = (top + bottom) / 2f
                    canvas.drawLine(left, midY, right, midY, previewShapePaint)
                }
                ShapePlacementType.UML_USE_CASE -> {
                    canvas.drawOval(left, top, right, bottom, previewShapeFillPaint)
                    canvas.drawOval(left, top, right, bottom, previewShapePaint)
                    val midX = (left + right) / 2f
                    val midY = (top + bottom) / 2f
                    canvas.drawText("Use Case", midX, midY + 8f, previewShapeTextPaint)
                }
                ShapePlacementType.UML_INITIAL_NODE -> {
                    val r = minOf(w, h) / 2f
                    val midX = (left + right) / 2f
                    val midY = (top + bottom) / 2f
                    canvas.drawCircle(midX, midY, r, previewShapeSolidPaint)
                }
                ShapePlacementType.UML_FINAL_NODE -> {
                    val r = minOf(w, h) / 2f
                    val midX = (left + right) / 2f
                    val midY = (top + bottom) / 2f
                    canvas.drawCircle(midX, midY, r, previewShapePaint)
                    canvas.drawCircle(midX, midY, r * 0.60f, previewShapeSolidPaint)
                }
                ShapePlacementType.UML_FORK_JOIN -> {
                    canvas.drawRoundRect(left, top, right, bottom, 6f, 6f, previewShapeSolidPaint)
                }
                ShapePlacementType.DYNAMIC_ARRAY, ShapePlacementType.ARRAY_CELLS -> {
                    canvas.drawRoundRect(left, top, right, bottom, 8f, 8f, previewShapeFillPaint)
                    canvas.drawRoundRect(left, top, right, bottom, 8f, 8f, previewShapePaint)
                    val cells = 5
                    val cellW = w / cells
                    for (c in 1 until cells) {
                        val cxLine = left + c * cellW
                        canvas.drawLine(cxLine, top, cxLine, bottom, previewShapeSolidPaint)
                    }
                }
                ShapePlacementType.DYNAMIC_LINKED_LIST, ShapePlacementType.LINKED_LIST_NODE -> {
                    val nodes = 3
                    val nodeW = w / (nodes * 1.4f)
                    val nodeGap = (w - nodes * nodeW) / (nodes - 1)
                    var nx = left
                    for (n in 0 until nodes) {
                        canvas.drawRoundRect(nx, top, nx + nodeW, bottom, 8f, 8f, previewShapeFillPaint)
                        canvas.drawRoundRect(nx, top, nx + nodeW, bottom, 8f, 8f, previewShapePaint)
                        canvas.drawLine(nx + nodeW * 0.65f, top, nx + nodeW * 0.65f, bottom, previewShapeSolidPaint)
                        if (n < nodes - 1) {
                            val arrowStartX = nx + nodeW
                            val arrowEndX = arrowStartX + nodeGap
                            val midY = (top + bottom) / 2f
                            canvas.drawLine(arrowStartX, midY, arrowEndX, midY, previewShapeSolidPaint)
                            canvas.drawLine(arrowEndX - 10f, midY - 6f, arrowEndX, midY, previewShapeSolidPaint)
                            canvas.drawLine(arrowEndX - 10f, midY + 6f, arrowEndX, midY, previewShapeSolidPaint)
                        }
                        nx += nodeW + nodeGap
                    }
                }
                ShapePlacementType.STACK -> {
                    // Vertical U-Container open at top
                    val uPath = Path()
                    uPath.moveTo(left, top)
                    uPath.lineTo(left, bottom)
                    uPath.lineTo(right, bottom)
                    uPath.lineTo(right, top)
                    canvas.drawPath(uPath, previewShapePaint)
                    val slots = 4
                    val slotH = h / (slots + 0.5f)
                    for (s in 1..slots) {
                        val sy = bottom - s * slotH
                        canvas.drawLine(left, sy, right, sy, previewShapeSolidPaint)
                    }
                    val topY = bottom - slots * slotH + slotH / 2f
                    canvas.drawLine(left - 40f, topY, left, topY, previewShapeSolidPaint)
                    canvas.drawLine(left - 8f, topY - 6f, left, topY, previewShapeSolidPaint)
                    canvas.drawLine(left - 8f, topY + 6f, left, topY, previewShapeSolidPaint)
                    canvas.drawText("TOP", left - 55f, topY + 8f, previewShapeTextPaint)
                }
                ShapePlacementType.QUEUE -> {
                    // Open pipe with vertical slot dividers
                    canvas.drawLine(left, top, right, top, previewShapePaint)
                    canvas.drawLine(left, bottom, right, bottom, previewShapePaint)
                    val slots = 4
                    val slotW = w / slots
                    for (s in 1 until slots) {
                        val sx = left + s * slotW
                        canvas.drawLine(sx, top, sx, bottom, previewShapeSolidPaint)
                    }
                    val midY = (top + bottom) / 2f
                    canvas.drawLine(left, midY, left - 35f, midY, previewShapeSolidPaint)
                    canvas.drawLine(left - 27f, midY - 6f, left - 35f, midY, previewShapeSolidPaint)
                    canvas.drawLine(left - 27f, midY + 6f, left - 35f, midY, previewShapeSolidPaint)
                    canvas.drawLine(right + 35f, midY, right, midY, previewShapeSolidPaint)
                    canvas.drawLine(right + 8f, midY - 6f, right, midY, previewShapeSolidPaint)
                    canvas.drawLine(right + 8f, midY + 6f, right, midY, previewShapeSolidPaint)
                }
                ShapePlacementType.BINARY_TREE -> {
                    val midX = (left + right) / 2f
                    val rootR = minOf(w * 0.18f, h * 0.18f)
                    val rootY = top + rootR + 6f
                    canvas.drawCircle(midX, rootY, rootR, previewShapePaint)
                    val childR = rootR * 0.85f
                    val leftChildX = left + w * 0.22f
                    val rightChildX = right - w * 0.22f
                    val childY = bottom - childR - 6f
                    canvas.drawLine(midX - rootR * 0.707f, rootY + rootR * 0.707f, leftChildX + childR * 0.707f, childY - childR * 0.707f, previewShapeSolidPaint)
                    canvas.drawLine(midX + rootR * 0.707f, rootY + rootR * 0.707f, rightChildX - childR * 0.707f, childY - childR * 0.707f, previewShapeSolidPaint)
                    canvas.drawCircle(leftChildX, childY, childR, previewShapePaint)
                    canvas.drawCircle(rightChildX, childY, childR, previewShapePaint)
                }
            }
        }

        // Live Preview: Text Box Drag-to-Size
        if (isDraggingNewTextBox) {
            val p1 = PointF()
            val p2 = PointF()
            dryInkView.transform.worldToScreen(textBoxDragStartX, textBoxDragStartY, p1)
            dryInkView.transform.worldToScreen(textBoxDragCurrentX, textBoxDragCurrentY, p2)
            val left = minOf(p1.x, p2.x)
            val top = minOf(p1.y, p2.y)
            val right = maxOf(p1.x, p2.x)
            val bottom = maxOf(p1.y, p2.y)
            if (hypot(right - left, bottom - top) >= 16f) {
                canvas.drawRoundRect(left, top, right, bottom, 8f, 8f, previewShapeFillPaint)
                canvas.drawRoundRect(left, top, right, bottom, 8f, 8f, previewTextBoxPaint)
            }
        }

        // Draw HUD / Palm Rejection overlay if enabled
        if (palmFilter.config.debugOverlayEnabled) {
            drawDebugOverlay(canvas)
        }
    }

    private fun drawDebugOverlay(canvas: Canvas) {
        val leftPad = 32f
        val topPad = 220f
        val boxWidth = 680f
        val boxHeight = 216f
        val cornerRadius = 16f
        canvas.drawRoundRect(leftPad, topPad, leftPad + boxWidth, topPad + boxHeight, cornerRadius, cornerRadius, debugBgPaint)
        canvas.drawRoundRect(leftPad, topPad, leftPad + boxWidth, topPad + boxHeight, cornerRadius, cornerRadius, debugBorderPaint)

        val fpsText = "Sustained FPS: %.1f fps (Budget: 6.94 ms)".format(measuredFps)
        val docText = "Doc: $pageTitle | ${dryInkView.currentTemplate.displayName} | Open: ${pageOpenLatencyMs}ms"
        val toolText = "Tool: $currentTool | Mode: ${palmFilter.config.inputMode} | FingerErase: ${palmFilter.config.isFingerEraserEnabled}"
        val strokesText = "Strokes: ${dryInkView.strokes.size} | Zoom: %.2fx".format(dryInkView.transform.scale)
        val palmsText = "Palms Rejected: ${palmFilter.palmsRejectedCount} | Grace: ${palmFilter.config.graceWindowMs}ms"

        canvas.drawText(fpsText, leftPad + 20f, topPad + 38f, debugPaint)
        canvas.drawText(docText, leftPad + 20f, topPad + 74f, debugPaint)
        canvas.drawText(toolText, leftPad + 20f, topPad + 110f, debugPaint)
        canvas.drawText(strokesText, leftPad + 20f, topPad + 146f, debugPaint)
        canvas.drawText(palmsText, leftPad + 20f, topPad + 182f, debugPaint)

        // Draw pointer tracking circles & status
        for (info in palmFilter.activePointersDebug) {
            val paint = if (info.status == PointerStatus.ACCEPTED_STYLUS || info.status == PointerStatus.ACCEPTED_GESTURE) {
                acceptedPointerPaint
            } else {
                palmRejectPaint
            }
            val radius = (info.touchMajor / 2f).coerceAtLeast(16f)
            canvas.drawCircle(info.x, info.y, radius, paint)
            canvas.drawText(info.status.name, info.x + radius + 8f, info.y, paint)
        }
    }

    private fun commitStretchedShapePlacement() {
        val dx = shapePlacementCurrentWorldX - shapePlacementStartWorldX
        val dy = shapePlacementCurrentWorldY - shapePlacementStartWorldY
        val dist = hypot(dx, dy)
        val shapeType = pendingPlacementShape ?: ShapePlacementType.RECTANGLE

        val shapeToInsert: RecognizedShape = if (dist < 18f) {
            // Quick tap: place default-sized shape at tapped spot
            createDefaultShapeAt(shapeType, shapePlacementStartWorldX, shapePlacementStartWorldY)
        } else {
            var left = minOf(shapePlacementStartWorldX, shapePlacementCurrentWorldX)
            var top = minOf(shapePlacementStartWorldY, shapePlacementCurrentWorldY)
            var right = maxOf(shapePlacementStartWorldX, shapePlacementCurrentWorldX)
            var bottom = maxOf(shapePlacementStartWorldY, shapePlacementCurrentWorldY)
            var w = right - left
            var h = bottom - top

            if (is1to1AspectLocked || shapeType == ShapePlacementType.SQUARE || shapeType == ShapePlacementType.CIRCLE) {
                val maxSide = maxOf(w, h)
                w = maxSide
                h = maxSide
                right = left + w
                bottom = top + h
            }

            createStretchedShape(shapeType, left, top, right, bottom, shapePlacementStartWorldX, shapePlacementStartWorldY, shapePlacementCurrentWorldX, shapePlacementCurrentWorldY)
        }

        val strokes = shapeRecognizer.createStrokesForShape(shapeToInsert, activeBrush)
        if (strokes.isNotEmpty()) {
            dryInkView.addStrokes(strokes)
            undoStack.add(StrokeAction(addedStrokes = strokes))
            redoStack.clear()
            notifyUndoRedoState()
            for (s in strokes) {
                onStrokeCommitted?.invoke(s)
            }
            // Automatically select the placed vector shape with resize/rotation handles!
            lassoTool.selectStrokes(strokes)
            onLassoSelectionChanged?.invoke(true)
            performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
        }
        pendingPlacementShape = null
        onShapePlacementFinished?.invoke()
        dryInkView.invalidate()
    }

    fun insertShapePlacement(shape: RecognizedShape) {
        val strokes = shapeRecognizer.createStrokesForShape(shape, activeBrush)
        if (strokes.isNotEmpty()) {
            dryInkView.addStrokes(strokes)
            undoStack.add(StrokeAction(addedStrokes = strokes))
            redoStack.clear()
            notifyUndoRedoState()
            for (s in strokes) {
                onStrokeCommitted?.invoke(s)
            }
            lassoTool.selectStrokes(strokes)
            onLassoSelectionChanged?.invoke(true)
            performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
        }
        pendingPlacementShape = null
        onShapePlacementFinished?.invoke()
        dryInkView.invalidate()
    }

    private fun createDefaultShapeAt(type: ShapePlacementType, cx: Float, cy: Float): RecognizedShape {
        return when (type) {
            ShapePlacementType.RECTANGLE -> RecognizedShape.Rectangle(cx - 140f, cy - 90f, cx + 140f, cy + 90f)
            ShapePlacementType.SQUARE -> RecognizedShape.Square(cx, cy, 220f)
            ShapePlacementType.CIRCLE -> RecognizedShape.Circle(cx, cy, 110f)
            ShapePlacementType.ELLIPSE -> RecognizedShape.Ellipse(cx, cy, 140f, 90f)
            ShapePlacementType.TRIANGLE -> {
                val side = 220f
                val h = side * 0.866f
                RecognizedShape.Triangle(cx, cy - h / 2f, cx + side / 2f, cy + h / 2f, cx - side / 2f, cy + h / 2f)
            }
            ShapePlacementType.DIAMOND -> RecognizedShape.Diamond(cx, cy, 200f, 200f)
            ShapePlacementType.STAR -> RecognizedShape.Star(cx, cy, 120f)
            ShapePlacementType.LINE -> RecognizedShape.Line(cx - 120f, cy, cx + 120f, cy)
            ShapePlacementType.ARROW -> RecognizedShape.Arrow(cx - 120f, cy, cx + 120f, cy)
            ShapePlacementType.BIDIRECTIONAL_ARROW -> RecognizedShape.BidirectionalArrow(cx - 120f, cy, cx + 120f, cy)
            ShapePlacementType.CACHE_PILL -> RecognizedShape.CachePill(cx, cy, 260f, 120f)
            ShapePlacementType.DATABASE_CYLINDER -> RecognizedShape.DatabaseCylinder(cx, cy, 220f, 280f)
            ShapePlacementType.CLOUD -> RecognizedShape.Cloud(cx, cy, 300f, 180f)
            ShapePlacementType.LINKED_LIST_NODE -> RecognizedShape.LinkedListNode(cx, cy, 240f, 100f)
            ShapePlacementType.ARRAY_CELLS -> RecognizedShape.ArrayCellSequence(cx, cy, 70f, 70f, 4)
            ShapePlacementType.DYNAMIC_ARRAY -> RecognizedShape.DynamicArray(centerX = cx, centerY = cy, size = 5, cellWidth = 80f, cellHeight = 80f)
            ShapePlacementType.DYNAMIC_LINKED_LIST -> RecognizedShape.DynamicLinkedList(centerX = cx, centerY = cy, nodeCount = 3, includeHeadNull = true)
            ShapePlacementType.STACK -> RecognizedShape.Stack(centerX = cx, centerY = cy, width = 180f, height = 260f)
            ShapePlacementType.QUEUE -> RecognizedShape.Queue(centerX = cx, centerY = cy, width = 320f, height = 120f)
            ShapePlacementType.BINARY_TREE -> RecognizedShape.BinaryTreeNode(centerX = cx, centerY = cy, radius = 30f, branchLength = 90f)
            ShapePlacementType.UML_CLASS -> RecognizedShape.UmlClass(centerX = cx, centerY = cy, width = 320f, height = 240f)
            ShapePlacementType.UML_INTERFACE -> RecognizedShape.UmlInterface(centerX = cx, centerY = cy, width = 320f, height = 200f)
            ShapePlacementType.UML_ACTOR -> RecognizedShape.UmlActor(centerX = cx, centerY = cy, width = 100f, height = 180f)
            ShapePlacementType.UML_LIFELINE -> RecognizedShape.UmlLifeline(centerX = cx, centerY = cy, width = 140f, height = 360f)
            ShapePlacementType.UML_ACTIVATION -> RecognizedShape.UmlActivationBar(centerX = cx, centerY = cy, width = 28f, height = 200f)
            ShapePlacementType.UML_FRAGMENT -> RecognizedShape.UmlCombinedFragment(centerX = cx, centerY = cy, width = 400f, height = 240f)
            ShapePlacementType.UML_USE_CASE -> RecognizedShape.UmlUseCase(centerX = cx, centerY = cy, width = 320f, height = 180f)
            ShapePlacementType.UML_INITIAL_NODE -> RecognizedShape.UmlInitialNode(centerX = cx, centerY = cy, radius = 24f)
            ShapePlacementType.UML_FINAL_NODE -> RecognizedShape.UmlFinalNode(centerX = cx, centerY = cy, radius = 28f)
            ShapePlacementType.UML_FORK_JOIN -> RecognizedShape.UmlForkJoin(centerX = cx, centerY = cy, width = 240f, height = 18f)
            ShapePlacementType.UML_CONNECTOR -> RecognizedShape.UmlConnector(cx - 120f, cy, cx + 120f, cy)
        }
    }

    private fun createStretchedShape(
        type: ShapePlacementType,
        left: Float, top: Float, right: Float, bottom: Float,
        startX: Float, startY: Float, curX: Float, curY: Float
    ): RecognizedShape {
        val cx = (left + right) / 2f
        val cy = (top + bottom) / 2f
        val w = maxOf(20f, right - left)
        val h = maxOf(20f, bottom - top)

        return when (type) {
            ShapePlacementType.RECTANGLE -> RecognizedShape.Rectangle(left, top, right, bottom)
            ShapePlacementType.SQUARE -> RecognizedShape.Square(cx, cy, maxOf(w, h))
            ShapePlacementType.CIRCLE -> RecognizedShape.Circle(cx, cy, maxOf(w, h) / 2f)
            ShapePlacementType.ELLIPSE -> RecognizedShape.Ellipse(cx, cy, w / 2f, h / 2f)
            ShapePlacementType.TRIANGLE -> {
                if (curY >= startY) {
                    RecognizedShape.Triangle(cx, top, right, bottom, left, bottom)
                } else {
                    RecognizedShape.Triangle(cx, bottom, right, top, left, top)
                }
            }
            ShapePlacementType.DIAMOND -> RecognizedShape.Diamond(cx, cy, w, h)
            ShapePlacementType.STAR -> RecognizedShape.Star(cx, cy, minOf(w, h) / 2f)
            ShapePlacementType.LINE -> RecognizedShape.Line(startX, startY, curX, curY)
            ShapePlacementType.ARROW -> RecognizedShape.Arrow(startX, startY, curX, curY)
            ShapePlacementType.BIDIRECTIONAL_ARROW -> RecognizedShape.BidirectionalArrow(startX, startY, curX, curY)
            ShapePlacementType.CACHE_PILL -> RecognizedShape.CachePill(cx, cy, w, h)
            ShapePlacementType.DATABASE_CYLINDER -> RecognizedShape.DatabaseCylinder(cx, cy, w, h)
            ShapePlacementType.CLOUD -> RecognizedShape.Cloud(cx, cy, w, h)
            ShapePlacementType.LINKED_LIST_NODE -> RecognizedShape.LinkedListNode(cx, cy, w, h)
            ShapePlacementType.ARRAY_CELLS -> RecognizedShape.ArrayCellSequence(cx, cy, w / 4f, h, 4)
            ShapePlacementType.DYNAMIC_ARRAY -> RecognizedShape.DynamicArray(centerX = cx, centerY = cy, size = 5, cellWidth = w / 5f, cellHeight = h)
            ShapePlacementType.DYNAMIC_LINKED_LIST -> RecognizedShape.DynamicLinkedList(centerX = cx, centerY = cy, nodeCount = 3, includeHeadNull = true)
            ShapePlacementType.STACK -> RecognizedShape.Stack(centerX = cx, centerY = cy, width = w, height = h)
            ShapePlacementType.QUEUE -> RecognizedShape.Queue(centerX = cx, centerY = cy, width = w, height = h)
            ShapePlacementType.BINARY_TREE -> RecognizedShape.BinaryTreeNode(centerX = cx, centerY = cy, radius = minOf(w, h) / 6f, branchLength = minOf(w, h) / 3f)
            ShapePlacementType.UML_CLASS -> RecognizedShape.UmlClass(centerX = cx, centerY = cy, width = w, height = h)
            ShapePlacementType.UML_INTERFACE -> RecognizedShape.UmlInterface(centerX = cx, centerY = cy, width = w, height = h)
            ShapePlacementType.UML_ACTOR -> RecognizedShape.UmlActor(centerX = cx, centerY = cy, width = w, height = h)
            ShapePlacementType.UML_LIFELINE -> RecognizedShape.UmlLifeline(centerX = cx, centerY = cy, width = w, height = h)
            ShapePlacementType.UML_ACTIVATION -> RecognizedShape.UmlActivationBar(centerX = cx, centerY = cy, width = minOf(w, 36f), height = h)
            ShapePlacementType.UML_FRAGMENT -> RecognizedShape.UmlCombinedFragment(centerX = cx, centerY = cy, width = w, height = h)
            ShapePlacementType.UML_USE_CASE -> RecognizedShape.UmlUseCase(centerX = cx, centerY = cy, width = w, height = h)
            ShapePlacementType.UML_INITIAL_NODE -> RecognizedShape.UmlInitialNode(centerX = cx, centerY = cy, radius = minOf(w, h) / 2f)
            ShapePlacementType.UML_FINAL_NODE -> RecognizedShape.UmlFinalNode(centerX = cx, centerY = cy, radius = minOf(w, h) / 2f)
            ShapePlacementType.UML_FORK_JOIN -> RecognizedShape.UmlForkJoin(centerX = cx, centerY = cy, width = w, height = maxOf(14f, h / 4f))
            ShapePlacementType.UML_CONNECTOR -> RecognizedShape.UmlConnector(startX, startY, curX, curY)
        }
    }
}
