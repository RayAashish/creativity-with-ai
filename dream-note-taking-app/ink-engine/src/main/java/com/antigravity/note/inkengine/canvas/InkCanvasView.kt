package com.antigravity.note.inkengine.canvas

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
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
import com.antigravity.note.inkengine.palm.PalmRejectionConfig
import com.antigravity.note.inkengine.palm.PalmRejectionFilter
import com.antigravity.note.inkengine.palm.PointerStatus
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
    LASSO
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

    private val strokePoints = mutableListOf<ShapeRecognizer.Point>()
    private var lastMoveTime = 0L
    private var lastMoveX = 0f
    private var lastMoveY = 0f

    var onLassoSelectionChanged: ((hasSelection: Boolean) -> Unit)? = null

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
                }
            }
        })

        // Enable custom drawing for debug HUD
        setWillNotDraw(false)
    }

    fun loadPage(page: DocumentPage, openLatencyMs: Long = 0L) {
        pageOpenLatencyMs = openLatencyMs
        pageTitle = page.metadata.title
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
        val family: BrushFamily = when (tool) {
            CanvasTool.PRESSURE_PEN -> StockBrushes.pressurePen()
            CanvasTool.MARKER -> StockBrushes.marker()
            CanvasTool.HIGHLIGHTER -> StockBrushes.highlighter()
            CanvasTool.STROKE_ERASER, CanvasTool.LASSO -> StockBrushes.marker()
        }
        return Brush.createWithColorIntArgb(family, color, size, 0.01f)
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        // Enforce unbuffered dispatch for sub-millisecond input path
        requestUnbufferedDispatch(event)

        val w = width.toFloat()
        val h = height.toFloat()
        val pointerIndex = event.actionIndex.coerceIn(0, (event.pointerCount - 1).coerceAtLeast(0))
        val pointerId = event.getPointerId(pointerIndex)

        // Evaluate Palm Rejection & Pointer Classification
        val filterResult = palmFilter.evaluatePointer(event, pointerIndex, w, h)

        when (filterResult) {
            is PalmRejectionFilter.FilteredResult.StylusAction -> {
                handleStylusAction(event, pointerIndex, pointerId, filterResult.isEraser)
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
                (event.buttonState and MotionEvent.BUTTON_TERTIARY) != 0

        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)

        if (isEraser) {
            // Eraser mode: Erase dry strokes intersecting current world point
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            val eraseRadius = (strokeWidth * 4f).coerceAtLeast(24f)
            val removed = dryInkView.eraseStrokesAt(tempPoint.x, tempPoint.y, eraseRadius)
            if (removed.isNotEmpty()) {
                val actionRecord = StrokeAction(removedStrokes = removed)
                undoStack.add(actionRecord)
                redoStack.clear()
                notifyUndoRedoState()
            }
            return
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

        // Pen Drawing Mode with Hold-to-Snap Shape Recognition
        when (action) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                strokePoints.clear()
                dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
                strokePoints.add(ShapeRecognizer.Point(tempPoint.x, tempPoint.y, event.eventTime))
                lastMoveTime = SystemClock.uptimeMillis()
                lastMoveX = screenX
                lastMoveY = screenY

                predictor.record(event)
                val strokeId = inProgressStrokesView.startStroke(
                    event,
                    pointerId,
                    activeBrush,
                    dryInkView.transform.worldToScreenMatrix,
                    dryInkView.transform.screenToWorldMatrix
                )
                activeStrokeIds[pointerId] = strokeId
            }
            MotionEvent.ACTION_MOVE -> {
                dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
                strokePoints.add(ShapeRecognizer.Point(tempPoint.x, tempPoint.y, event.eventTime))
                val moveDist = hypot(screenX - lastMoveX, screenY - lastMoveY)
                if (moveDist > 8f) {
                    lastMoveTime = SystemClock.uptimeMillis()
                    lastMoveX = screenX
                    lastMoveY = screenY
                }

                predictor.record(event)
                val strokeId = activeStrokeIds[pointerId] ?: return
                val predictedEvent = predictor.predict()
                inProgressStrokesView.addToStroke(event, pointerId, strokeId, predictedEvent)
                predictedEvent?.recycle()
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                val strokeId = activeStrokeIds.remove(pointerId) ?: return
                val holdDuration = SystemClock.uptimeMillis() - lastMoveTime

                // Hold-to-Snap: Check if stylus paused at the end of the stroke
                if (holdToSnapEnabled && holdDuration >= 280L && strokePoints.size >= 8) {
                    val shape = shapeRecognizer.recognize(strokePoints)
                    if (shape != null) {
                        inProgressStrokesView.cancelStroke(strokeId, event)
                        val snappedStroke = shapeRecognizer.createStrokeForShape(shape, activeBrush)
                        dryInkView.addStroke(snappedStroke)
                        val actionRecord = StrokeAction(addedStrokes = listOf(snappedStroke))
                        undoStack.add(actionRecord)
                        redoStack.clear()
                        notifyUndoRedoState()
                        onStrokeCommitted?.invoke(snappedStroke)
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
        val strokeId = activeStrokeIds.remove(pointerId)
        if (strokeId != null) {
            inProgressStrokesView.cancelStroke(strokeId, event)
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
        if (dryInkView.strokes.isNotEmpty()) {
            val action = StrokeAction(removedStrokes = dryInkView.strokes.toList())
            dryInkView.clearAllStrokes()
            undoStack.add(action)
            redoStack.clear()
            notifyUndoRedoState()
            onClearCommitted?.invoke()
        }
    }

    fun resetZoom() {
        dryInkView.transform.reset()
        dryInkView.invalidate()
    }

    // Phase 4 Lasso Operations
    fun duplicateLassoSelection() {
        val duplicated = lassoTool.duplicateSelected()
        if (duplicated.isNotEmpty()) {
            dryInkView.addStrokes(duplicated)
            undoStack.add(StrokeAction(addedStrokes = duplicated))
            redoStack.clear()
            notifyUndoRedoState()
            dryInkView.invalidate()
        }
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

        // Draw HUD / Palm Rejection overlay if enabled
        if (palmFilter.config.debugOverlayEnabled) {
            drawDebugOverlay(canvas)
        }
    }

    private fun drawDebugOverlay(canvas: Canvas) {
        val leftPad = 32f
        val topPad = 180f
        val boxWidth = 660f
        val boxHeight = 216f
        val cornerRadius = 16f
        canvas.drawRoundRect(leftPad, topPad, leftPad + boxWidth, topPad + boxHeight, cornerRadius, cornerRadius, debugBgPaint)
        canvas.drawRoundRect(leftPad, topPad, leftPad + boxWidth, topPad + boxHeight, cornerRadius, cornerRadius, debugBorderPaint)

        val fpsText = "Sustained FPS: %.1f fps (Budget: 6.94 ms)".format(measuredFps)
        val docText = "Doc: $pageTitle | ${dryInkView.currentTemplate.displayName} | Open: ${pageOpenLatencyMs}ms"
        val toolText = "Tool: $currentTool | Mode: ${palmFilter.config.inputMode}"
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
