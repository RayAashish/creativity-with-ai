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
import java.io.File
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

enum class CanvasTool {
    PRESSURE_PEN,
    MARKER,
    HIGHLIGHTER,
    STROKE_ERASER,
    LASSO,
    SHAPE
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

    private val strokePoints = mutableListOf<ShapeRecognizer.Point>()
    private var lastMoveTime = 0L
    private var lastMoveX = 0f
    private var lastMoveY = 0f

    // Real-Time Hold-to-Snap
    private var isStrokeSnapped = false
    private val snappedStrokesForCurrentTouch = mutableListOf<Stroke>()
    private var activePointerIdForSnap = -1

    private val HOLD_TO_SNAP_DELAY_MS = 620L

    private val holdToSnapRunnable = Runnable {
        android.util.Log.d("ANTIGRAVITY_INK", "holdToSnapRunnable triggered! enabled=$holdToSnapEnabled, isSnapped=$isStrokeSnapped, ptCount=${strokePoints.size}")
        if (!holdToSnapEnabled || isStrokeSnapped || strokePoints.size < 6) return@Runnable
        val now = SystemClock.uptimeMillis()
        if (now - lastMoveTime < (HOLD_TO_SNAP_DELAY_MS - 50L)) return@Runnable
        val strokeId = activeStrokeIds[activePointerIdForSnap] ?: return@Runnable
        val shape = shapeRecognizer.recognize(strokePoints)
        android.util.Log.d("ANTIGRAVITY_INK", "holdToSnapRunnable recognize result: $shape")
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
        android.util.Log.d("ANTIGRAVITY_INK", "holdToSnapRunnable created ${snappedStrokes.size} snappedStrokes")
        snappedStrokesForCurrentTouch.clear()
        snappedStrokesForCurrentTouch.addAll(snappedStrokes)
        dryInkView.addStrokes(snappedStrokes)
        isStrokeSnapped = true
        dryInkView.invalidate()
        performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
    }

    // NoteWise-Style Hold-Pen-to-Erase Feature
    var holdToEraseEnabled: Boolean = true
    var holdToEraseDelayMs: Long = 800L // 800ms stationary hold activates eraser
    var isHoldErasing: Boolean = false
        private set

    private val holdToEraseRunnable = Runnable {
        if (!holdToEraseEnabled || isStrokeSnapped || isHoldErasing) return@Runnable
        val now = SystemClock.uptimeMillis()
        if (now - lastMoveTime < (holdToEraseDelayMs - 80L)) return@Runnable
        val strokeId = activeStrokeIds[activePointerIdForSnap] ?: return@Runnable
        if (isStrokeSnapped) return@Runnable

        // Discard wet stroke created during the pause
        val dummyEvent = MotionEvent.obtain(
            now, now, MotionEvent.ACTION_CANCEL, lastMoveX, lastMoveY, 0
        )
        try {
            inProgressStrokesView.cancelStroke(strokeId, dummyEvent)
        } catch (_: Exception) {}
        dummyEvent.recycle()
        activeStrokeIds.remove(activePointerIdForSnap)

        isHoldErasing = true
        performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)

        // Start scoped erase gesture for stationary hold
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

    private val fingerEraserFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = 0x261976D2.toInt() // Soft translucent primary blue
    }
    private val fingerEraserOutlinePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 3f
        color = 0xCC1976D2.toInt()
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

        if (surviving.isNotEmpty()) {
            onStrokesReplaced?.invoke(originals, surviving)
        } else {
            for (orig in originals) {
                onUndoCommitted?.invoke(orig)
            }
        }
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
    var onUndoCommitted: ((Stroke?) -> Unit)? = null
    var onClearCommitted: (() -> Unit)? = null
    var onStrokesReplaced: ((oldStrokes: List<Stroke>, newStrokes: List<Stroke>) -> Unit)? = null
    var onImageDropped: ((uri: android.net.Uri, worldX: Float, worldY: Float) -> Unit)? = null

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
                    dryInkView.addStrokes(finishedList)
                    val action = StrokeAction(addedStrokes = finishedList)
                    undoStack.add(action)
                    redoStack.clear()
                    notifyUndoRedoState()
                    for (stroke in finishedList) {
                        onStrokeCommitted?.invoke(stroke)
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
        dryInkView.loadStrokes(page.strokes)
        dryInkView.setImages(page.images, assetsDir)
        dryInkView.setPaperTemplate(page.metadata.template)
        undoStack.clear()
        redoStack.clear()
        notifyUndoRedoState()
        invalidate()
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
        currentTool = tool
        activeBrush = createBrushForTool(tool, strokeColor, strokeWidth)
    }

    fun setInkColor(color: Int) {
        strokeColor = color
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
            CanvasTool.STROKE_ERASER, CanvasTool.LASSO, CanvasTool.SHAPE -> {
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

        // Allow finger/stylus touch to resize/move active image selection handles!
        val selImg = selectedImage
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
        val isEraser = isHardwareEraser || currentTool == CanvasTool.STROKE_ERASER ||
                (event.buttonState and MotionEvent.BUTTON_STYLUS_PRIMARY) != 0 ||
                (event.buttonState and MotionEvent.BUTTON_STYLUS_SECONDARY) != 0 ||
                (event.buttonState and MotionEvent.BUTTON_SECONDARY) != 0 ||
                (event.buttonState and MotionEvent.BUTTON_TERTIARY) != 0

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

        // Pen Drawing Mode with Real-Time Hold-to-Snap Shape Recognition
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

                removeCallbacks(holdToSnapRunnable)
                if (holdToSnapEnabled && currentTool != CanvasTool.STROKE_ERASER && currentTool != CanvasTool.LASSO) {
                    postDelayed(holdToSnapRunnable, HOLD_TO_SNAP_DELAY_MS)
                }
                isHoldErasing = false
                removeCallbacks(holdToEraseRunnable)
                if (holdToEraseEnabled && currentTool != CanvasTool.STROKE_ERASER && currentTool != CanvasTool.LASSO) {
                    postDelayed(holdToEraseRunnable, holdToEraseDelayMs)
                }

                predictor.record(event)
                val strokeId = inProgressStrokesView.startStroke(
                    event,
                    pointerId,
                    activeBrush,
                    dryInkView.transform.screenToWorldMatrix,
                    identityMatrix
                )
                activeStrokeIds[pointerId] = strokeId
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
                    dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
                    strokePoints.add(ShapeRecognizer.Point(tempPoint.x, tempPoint.y, event.eventTime))
                    val moveDist = hypot(screenX - lastMoveX, screenY - lastMoveY)
                    if (moveDist > 14f) {
                        lastMoveTime = SystemClock.uptimeMillis()
                        lastMoveX = screenX
                        lastMoveY = screenY
                        removeCallbacks(holdToSnapRunnable)
                        if (holdToSnapEnabled && currentTool != CanvasTool.STROKE_ERASER && currentTool != CanvasTool.LASSO) {
                            postDelayed(holdToSnapRunnable, HOLD_TO_SNAP_DELAY_MS)
                        }
                        removeCallbacks(holdToEraseRunnable)
                        if (holdToEraseEnabled && currentTool != CanvasTool.STROKE_ERASER && currentTool != CanvasTool.LASSO) {
                            postDelayed(holdToEraseRunnable, holdToEraseDelayMs)
                        }
                    }

                    predictor.record(event)
                    val strokeId = activeStrokeIds[pointerId] ?: return
                    val predictedEvent = predictor.predict()
                    inProgressStrokesView.addToStroke(event, pointerId, strokeId, predictedEvent)
                    predictedEvent?.recycle()
                }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                removeCallbacks(holdToSnapRunnable)
                removeCallbacks(holdToEraseRunnable)
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
                    for (s in snappedStrokesForCurrentTouch) {
                        onStrokeCommitted?.invoke(s)
                    }
                    isStrokeSnapped = false
                    snappedStrokesForCurrentTouch.clear()
                    dryInkView.invalidate()
                    return
                }

                if (strokeId == null) return

                // Crucial: In normal Pen/Marker mode, NEVER retroactively snap on release!
                // Only explicit SHAPE tool mode converts strokes on release without holding.
                val isExplicitShapeTool = currentTool == CanvasTool.SHAPE
                if (isExplicitShapeTool && strokePoints.size >= 5) {
                    val shape = shapeRecognizer.recognize(strokePoints)
                    if (shape != null) {
                        try {
                            inProgressStrokesView.cancelStroke(strokeId, event)
                        } catch (_: Exception) {}
                        val snappedStrokes = shapeRecognizer.createStrokesForShape(shape, activeBrush)
                        dryInkView.addStrokes(snappedStrokes)
                        val actionRecord = StrokeAction(addedStrokes = snappedStrokes)
                        undoStack.add(actionRecord)
                        redoStack.clear()
                        notifyUndoRedoState()
                        for (s in snappedStrokes) {
                            onStrokeCommitted?.invoke(s)
                        }
                        dryInkView.invalidate()
                        performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                        return
                    }
                }

                predictor.record(event)
                inProgressStrokesView.finishStroke(event, pointerId, strokeId)
            }
        }
    }

    private fun handleCancelStroke(event: MotionEvent, pointerId: Int) {
        removeCallbacks(holdToSnapRunnable)
        removeCallbacks(holdToEraseRunnable)
        isHoldErasing = false
        if (pointerId == activePointerIdForSnap) {
            if (isStrokeSnapped && snappedStrokesForCurrentTouch.isNotEmpty()) {
                // If it was already snapped while holding, treat cancel as release/commit! Ink is never lost!
                val actionRecord = StrokeAction(addedStrokes = snappedStrokesForCurrentTouch.toList())
                undoStack.add(actionRecord)
                redoStack.clear()
                notifyUndoRedoState()
                for (s in snappedStrokesForCurrentTouch) {
                    onStrokeCommitted?.invoke(s)
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

            when (event.actionMasked) {
                MotionEvent.ACTION_POINTER_DOWN, MotionEvent.ACTION_DOWN -> {
                    isGestureActive = true
                    lastGestureDistance = currentDist
                    lastGestureCenterX = centerX
                    lastGestureCenterY = centerY
                    gestureStartTime = SystemClock.uptimeMillis()
                    totalGestureMovement = 0f
                }
                MotionEvent.ACTION_MOVE -> {
                    if (!isGestureActive || lastGestureDistance <= 0f) {
                        // Resilient gesture recovery:
                        // If POINTER_DOWN was missed or merged by Android OS,
                        // activate gesture tracking immediately on first MOVE!
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
                    }
                }
                MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    val duration = SystemClock.uptimeMillis() - gestureStartTime
                    // Only trigger undo/redo if fingers were tapped in place without significant drag
                    if (totalGestureMovement < 20f && duration < palmFilter.config.gestureDisambiguationWindowMs * 4) {
                        // Rapid 2-finger tap detected -> Undo
                        if (event.pointerCount == 2) {
                            undo()
                        } else if (event.pointerCount == 3) {
                            redo()
                        }
                    }
                    isGestureActive = false
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
                for (s in action.addedStrokes) {
                    onUndoCommitted?.invoke(s)
                }
            }
            // Restore removed strokes
            if (action.removedStrokes.isNotEmpty()) {
                dryInkView.addStrokes(action.removedStrokes)
                for (s in action.removedStrokes) {
                    onStrokeCommitted?.invoke(s)
                }
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
                for (s in action.addedStrokes) {
                    onStrokeCommitted?.invoke(s)
                }
            }
            // Re-apply removals
            if (action.removedStrokes.isNotEmpty()) {
                dryInkView.removeStrokes(action.removedStrokes)
                for (s in action.removedStrokes) {
                    onUndoCommitted?.invoke(s)
                }
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
}
