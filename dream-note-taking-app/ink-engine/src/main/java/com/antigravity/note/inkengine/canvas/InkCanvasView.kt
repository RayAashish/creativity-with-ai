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
import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PaperTemplate
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
    var holdToEraseDelayMs: Long = 1200L // 1.2s stationary hold activates eraser
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

        // Erase strokes intersecting current stylus tip point
        dryInkView.transform.screenToWorld(lastMoveX, lastMoveY, tempPoint)
        val currentScale = dryInkView.transform.scale.coerceAtLeast(0.1f)
        val eraseRadius = (strokeWidth * 4.5f / currentScale).coerceAtLeast(36f / currentScale)
        val removed = dryInkView.eraseStrokesAt(tempPoint.x, tempPoint.y, eraseRadius)
        if (removed.isNotEmpty()) {
            val actionRecord = StrokeAction(removedStrokes = removed)
            undoStack.add(actionRecord)
            redoStack.clear()
            notifyUndoRedoState()
            for (r in removed) {
                onUndoCommitted?.invoke(r)
            }
        }
        dryInkView.invalidate()
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

    // Gesture tracking for 2-finger pan & pinch-zoom
    private var isGestureActive = false
    private var lastGestureDistance = 0f
    private var lastGestureCenterX = 0f
    private var lastGestureCenterY = 0f
    private var gestureStartTime = 0L
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

        lassoTool.onStrokesTransformed = { oldStrokes, newStrokes ->
            dryInkView.replaceStrokes(oldStrokes, newStrokes)
            for (s in newStrokes) {
                onStrokeCommitted?.invoke(s)
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

    fun loadPage(page: DocumentPage, openLatencyMs: Long = 0L) {
        pageOpenLatencyMs = openLatencyMs
        pageTitle = page.metadata.title
        activeStrokeIds.clear()
        inProgressStrokesView.cancelUnfinishedStrokes()
        inProgressStrokesView.removeFinishedStrokes(inProgressStrokesView.getFinishedStrokes().keys)
        lassoTool.clearSelection()
        isTransformingSelection = false
        onLassoSelectionChanged?.invoke(false)
        dryInkView.loadStrokes(page.strokes)
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

        val w = width.toFloat()
        val h = height.toFloat()
        val pointerIndex = event.actionIndex.coerceIn(0, (event.pointerCount - 1).coerceAtLeast(0))
        val pointerId = event.getPointerId(pointerIndex)

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

        if (isEraser) {
            // Eraser mode: Erase dry strokes intersecting current world point
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            val currentScale = dryInkView.transform.scale.coerceAtLeast(0.1f)
            val eraseRadius = (strokeWidth * 4f / currentScale).coerceAtLeast(36f / currentScale)
            val removed = dryInkView.eraseStrokesAt(tempPoint.x, tempPoint.y, eraseRadius)
            if (removed.isNotEmpty()) {
                val actionRecord = StrokeAction(removedStrokes = removed)
                undoStack.add(actionRecord)
                redoStack.clear()
                notifyUndoRedoState()
                for (r in removed) {
                    onUndoCommitted?.invoke(r)
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
                    lassoTool.startLasso(tempPoint.x, tempPoint.y)
                    dryInkView.invalidate()
                }
                MotionEvent.ACTION_MOVE -> {
                    val changed = lassoTool.continueLasso(tempPoint.x, tempPoint.y)
                    if (changed) dryInkView.invalidate()
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    val hasSelection = lassoTool.finishLasso(dryInkView.strokes)
                    dryInkView.invalidate()
                    onLassoSelectionChanged?.invoke(hasSelection)
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
                    val currentScale = dryInkView.transform.scale.coerceAtLeast(0.1f)
                    val eraseRadius = (strokeWidth * 4.5f / currentScale).coerceAtLeast(36f / currentScale)
                    val removed = dryInkView.eraseStrokesAt(tempPoint.x, tempPoint.y, eraseRadius)
                    if (removed.isNotEmpty()) {
                        val actionRecord = StrokeAction(removedStrokes = removed)
                        undoStack.add(actionRecord)
                        redoStack.clear()
                        notifyUndoRedoState()
                        for (r in removed) {
                            onUndoCommitted?.invoke(r)
                        }
                    }
                    dryInkView.invalidate()
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

        when (action) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                isFingerErasing = true
                fingerEraseScreenX = screenX
                fingerEraseScreenY = screenY
                performFingerEraseAt(screenX, screenY)
                invalidate()
            }
            MotionEvent.ACTION_MOVE -> {
                if (isFingerErasing) {
                    fingerEraseScreenX = screenX
                    fingerEraseScreenY = screenY
                    performFingerEraseAt(screenX, screenY)
                    invalidate()
                }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_CANCEL -> {
                isFingerErasing = false
                fingerEraseScreenX = 0f
                fingerEraseScreenY = 0f
                invalidate()
            }
        }
    }

    private fun performFingerEraseAt(screenX: Float, screenY: Float) {
        dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
        val currentScale = dryInkView.transform.scale.coerceAtLeast(0.1f)
        val eraseRadius = (44f / currentScale).coerceAtLeast(24f / currentScale)
        val removed = dryInkView.eraseStrokesAt(tempPoint.x, tempPoint.y, eraseRadius)
        if (removed.isNotEmpty()) {
            val actionRecord = StrokeAction(removedStrokes = removed)
            undoStack.add(actionRecord)
            redoStack.clear()
            notifyUndoRedoState()
            for (r in removed) {
                onUndoCommitted?.invoke(r)
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
                }
                MotionEvent.ACTION_MOVE -> {
                    if (isGestureActive && lastGestureDistance > 0f) {
                        val dx = centerX - lastGestureCenterX
                        val dy = centerY - lastGestureCenterY
                        val scaleFactor = currentDist / lastGestureDistance

                        dryInkView.transform.postTranslate(dx, dy)
                        if (scaleFactor > 0.05f && scaleFactor < 20f) {
                            dryInkView.transform.postScale(scaleFactor, centerX, centerY)
                        }

                        lastGestureDistance = currentDist
                        lastGestureCenterX = centerX
                        lastGestureCenterY = centerY
                        dryInkView.invalidate()
                    }
                }
                MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_UP -> {
                    val duration = SystemClock.uptimeMillis() - gestureStartTime
                    if (duration < palmFilter.config.gestureDisambiguationWindowMs * 4) {
                        // Rapid 2-finger tap detected -> Undo
                        if (event.pointerCount == 2) {
                            undo()
                        } else if (event.pointerCount == 3) {
                            redo()
                        }
                    }
                    isGestureActive = false
                    lastGestureDistance = 0f
                }
            }
        }
    }

    fun undo() {
        if (undoStack.isEmpty()) return
        val action = undoStack.removeAt(undoStack.lastIndex)
        // Revert added strokes
        if (action.addedStrokes.isNotEmpty()) {
            dryInkView.removeStrokes(action.addedStrokes)
            onUndoCommitted?.invoke(action.addedStrokes.firstOrNull())
        }
        // Restore removed strokes
        if (action.removedStrokes.isNotEmpty()) {
            dryInkView.addStrokes(action.removedStrokes)
        }
        redoStack.add(action)
        notifyUndoRedoState()
    }

    fun redo() {
        if (redoStack.isEmpty()) return
        val action = redoStack.removeAt(redoStack.lastIndex)
        // Re-apply added strokes
        if (action.addedStrokes.isNotEmpty()) {
            dryInkView.addStrokes(action.addedStrokes)
        }
        // Re-apply removals
        if (action.removedStrokes.isNotEmpty()) {
            dryInkView.removeStrokes(action.removedStrokes)
        }
        undoStack.add(action)
        notifyUndoRedoState()
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
        val result = lassoTool.changeColorSelected(color)
        if (result.newStrokes.isNotEmpty()) {
            dryInkView.removeStrokes(result.oldStrokes)
            dryInkView.addStrokes(result.newStrokes)
            undoStack.add(StrokeAction(addedStrokes = result.newStrokes, removedStrokes = result.oldStrokes))
            redoStack.clear()
            notifyUndoRedoState()
            dryInkView.invalidate()
        }
    }

    fun deleteLassoSelection() {
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
