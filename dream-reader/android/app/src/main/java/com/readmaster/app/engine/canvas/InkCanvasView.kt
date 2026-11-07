package com.readmaster.app.engine.canvas

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.PointF
import android.os.SystemClock
import android.util.AttributeSet
import android.view.MotionEvent
import android.widget.FrameLayout
import androidx.ink.authoring.InProgressStrokeId
import androidx.ink.authoring.InProgressStrokesFinishedListener
import androidx.ink.authoring.InProgressStrokesView
import androidx.ink.brush.Brush
import androidx.ink.brush.StockBrushes
import androidx.ink.strokes.Stroke
import androidx.input.motionprediction.MotionEventPredictor
import com.readmaster.app.engine.eraser.EraserMode
import com.readmaster.app.engine.lasso.LassoMode
import com.readmaster.app.engine.lasso.LassoTool
import com.readmaster.app.engine.palm.PalmRejectionConfig
import com.readmaster.app.engine.palm.PalmRejectionFilter
import com.readmaster.app.engine.pdf.PdfTiler
import kotlin.math.hypot

enum class CanvasTool {
    PEN,
    HIGHLIGHTER,
    ERASER,
    LASSO,
    TEXT_SELECT
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
    var currentTool: CanvasTool = CanvasTool.PEN
        set(value) {
            if (field == CanvasTool.LASSO && value != CanvasTool.LASSO) {
                lassoTool.clearSelection()
                dryInkView.invalidate()
            }
            field = value
            activeBrush = createBrushForTool(value, strokeColor, strokeWidth)
        }

    var strokeColor: Int = Color.parseColor("#111318")
        set(value) {
            field = value
            activeBrush = createBrushForTool(currentTool, value, strokeWidth)
        }

    var strokeWidth: Float = 4.0f
        set(value) {
            field = value
            activeBrush = createBrushForTool(currentTool, strokeColor, value)
        }

    private var activeBrush: Brush = createBrushForTool(currentTool, strokeColor, strokeWidth)
    private val activeStrokeIds = HashMap<Int, InProgressStrokeId>()

    // Undo / Redo Command Stack
    private val undoStack = mutableListOf<StrokeAction>()
    private val redoStack = mutableListOf<StrokeAction>()
    var onUndoRedoStateChanged: ((canUndo: Boolean, canRedo: Boolean) -> Unit)? = null

    // Lasso & PDF Tiler
    val lassoTool = LassoTool()
    val pdfTiler = PdfTiler()

    // Gesture tracking for 2-finger pan & pinch-zoom
    private var isGestureActive = false
    private var lastGestureDistance = 0f
    private var lastGestureCenterX = 0f
    private var lastGestureCenterY = 0f
    private var gestureStartTime = 0L
    private var totalGestureMovement = 0f
    private val tempPoint = PointF()

    // Long press detection for word lookup in TEXT_SELECT mode
    private var downTime = 0L
    private var downX = 0f
    private var downY = 0f
    private var hasMovedSignificantly = false
    var onWordLookupRequested: ((screenX: Float, screenY: Float, worldX: Float, worldY: Float) -> Unit)? = null
    var onPageChanged: ((Int) -> Unit)? = null

    init {
        addView(dryInkView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        addView(inProgressStrokesView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))

        inProgressStrokesView.eagerInit()

        dryInkView.lassoTool = lassoTool
        dryInkView.pdfTiler = pdfTiler

        lassoTool.onStrokesTransformPreview = { oldStrokes, newStrokes ->
            dryInkView.replaceStrokes(oldStrokes, newStrokes)
        }

        lassoTool.onStrokesTransformCommitted = { oldStrokes, newStrokes ->
            undoStack.add(StrokeAction(addedStrokes = newStrokes, removedStrokes = oldStrokes))
            redoStack.clear()
            notifyUndoRedoState()
            dryInkView.invalidate()
        }

        inProgressStrokesView.addFinishedStrokesListener(object : InProgressStrokesFinishedListener {
            override fun onStrokesFinished(strokes: Map<InProgressStrokeId, Stroke>) {
                val finishedList = strokes.values.toList()
                if (finishedList.isNotEmpty()) {
                    dryInkView.addStrokes(finishedList)
                    undoStack.add(StrokeAction(addedStrokes = finishedList))
                    redoStack.clear()
                    notifyUndoRedoState()
                    inProgressStrokesView.removeFinishedStrokes(strokes.keys)
                    dryInkView.invalidate()
                }
            }
        })
    }

    private fun createBrushForTool(tool: CanvasTool, color: Int, size: Float): Brush {
        return when (tool) {
            CanvasTool.PEN -> {
                Brush.createWithColorIntArgb(StockBrushes.pressurePen(), color, size, 0.01f)
            }
            CanvasTool.HIGHLIGHTER -> {
                val highlighterSize = (size * 3.5f).coerceAtLeast(18f)
                val translucentColor = (color and 0x00FFFFFF) or (0x55 shl 24)
                Brush.createWithColorIntArgb(StockBrushes.highlighter(), translucentColor, highlighterSize, 0.01f)
            }
            CanvasTool.ERASER, CanvasTool.LASSO, CanvasTool.TEXT_SELECT -> {
                Brush.createWithColorIntArgb(StockBrushes.marker(), color, size.coerceAtLeast(3f), 0.01f)
            }
        }
    }

    fun setPdfPage(pageIndex: Int) {
        if (dryInkView.currentPdfPageIndex != pageIndex) {
            dryInkView.currentPdfPageIndex = pageIndex
            dryInkView.clearAllStrokes()
            undoStack.clear()
            redoStack.clear()
            notifyUndoRedoState()
            onPageChanged?.invoke(pageIndex)
            dryInkView.invalidate()
        }
    }

    fun nextPage() {
        val next = dryInkView.currentPdfPageIndex + 1
        if (next < pdfTiler.pageCount) {
            setPdfPage(next)
        }
    }

    fun prevPage() {
        val prev = dryInkView.currentPdfPageIndex - 1
        if (prev >= 0) {
            setPdfPage(prev)
        }
    }

    fun zoomIn() {
        dryInkView.transform.postScale(1.25f, width / 2f, height / 2f)
        dryInkView.invalidate()
    }

    fun zoomOut() {
        dryInkView.transform.postScale(0.8f, width / 2f, height / 2f)
        dryInkView.invalidate()
    }

    fun fitWidth(w: Float, h: Float) {
        val pageSize = pdfTiler.getPageSize(dryInkView.currentPdfPageIndex) ?: return
        val (pw, _) = pageSize
        if (pw > 0) {
            val targetScale = (w / pw.toFloat()).coerceIn(0.5f, 5.0f)
            dryInkView.transform.setTransform(targetScale, 0f, 0f)
            dryInkView.invalidate()
        }
    }

    fun fitPage(w: Float, h: Float) {
        val pageSize = pdfTiler.getPageSize(dryInkView.currentPdfPageIndex) ?: return
        val (pw, ph) = pageSize
        if (pw > 0 && ph > 0) {
            val scaleX = w / pw.toFloat()
            val scaleY = h / ph.toFloat()
            val targetScale = minOf(scaleX, scaleY).coerceIn(0.5f, 5.0f)
            val tx = (w - pw * targetScale) / 2f
            val ty = (h - ph * targetScale) / 2f
            dryInkView.transform.setTransform(targetScale, tx, ty)
            dryInkView.invalidate()
        }
    }

    fun resetZoom() {
        dryInkView.transform.reset()
        dryInkView.invalidate()
    }

    fun undo() {
        if (undoStack.isNotEmpty()) {
            val action = undoStack.removeAt(undoStack.lastIndex)
            redoStack.add(action)

            dryInkView.removeStrokes(action.addedStrokes)
            dryInkView.addStrokes(action.removedStrokes)
            notifyUndoRedoState()
            dryInkView.invalidate()
        }
    }

    fun redo() {
        if (redoStack.isNotEmpty()) {
            val action = redoStack.removeAt(redoStack.lastIndex)
            undoStack.add(action)

            dryInkView.removeStrokes(action.removedStrokes)
            dryInkView.addStrokes(action.addedStrokes)
            notifyUndoRedoState()
            dryInkView.invalidate()
        }
    }

    fun clearPageInk() {
        if (dryInkView.strokes.isNotEmpty()) {
            val current = dryInkView.strokes.toList()
            undoStack.add(StrokeAction(removedStrokes = current))
            redoStack.clear()
            dryInkView.clearAllStrokes()
            notifyUndoRedoState()
        }
    }

    private fun notifyUndoRedoState() {
        onUndoRedoStateChanged?.invoke(undoStack.isNotEmpty(), redoStack.isNotEmpty())
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        requestUnbufferedDispatch(event)
        parent?.requestDisallowInterceptTouchEvent(true)

        val w = width.toFloat()
        val h = height.toFloat()
        val pointerIndex = event.actionIndex.coerceIn(0, (event.pointerCount - 1).coerceAtLeast(0))
        val pointerId = event.getPointerId(pointerIndex)

        // Filter palm touches
        val filterResult = palmFilter.evaluatePointer(event, pointerIndex, w, h)

        when (filterResult) {
            is PalmRejectionFilter.FilteredResult.StylusAction -> {
                handleStylusAction(event, pointerIndex, pointerId, filterResult.isEraser)
            }
            is PalmRejectionFilter.FilteredResult.FingerEraser -> {
                handleEraserAction(event, pointerIndex)
            }
            is PalmRejectionFilter.FilteredResult.MultiFingerGesture -> {
                handleMultiFingerGesture(event)
            }
            is PalmRejectionFilter.FilteredResult.CancelStroke -> {
                val strokeId = activeStrokeIds.remove(pointerId)
                if (strokeId != null) {
                    try {
                        inProgressStrokesView.cancelStroke(strokeId, event)
                    } catch (_: Exception) {}
                }
            }
            is PalmRejectionFilter.FilteredResult.RejectedPalm,
            is PalmRejectionFilter.FilteredResult.Ignore -> {
                // Ignore palm contacts
            }
        }
        return true
    }

    override fun onGenericMotionEvent(event: MotionEvent): Boolean {
        if (event.actionMasked == MotionEvent.ACTION_HOVER_MOVE ||
            event.actionMasked == MotionEvent.ACTION_HOVER_ENTER ||
            event.actionMasked == MotionEvent.ACTION_HOVER_EXIT) {
            requestUnbufferedDispatch(event)
            palmFilter.onHoverEvent(event)
            return true
        }
        return super.onGenericMotionEvent(event)
    }

    private fun handleStylusAction(event: MotionEvent, pointerIndex: Int, pointerId: Int, isHardwareEraser: Boolean) {
        val action = event.actionMasked
        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)

        dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
        val worldX = tempPoint.x
        val worldY = tempPoint.y

        // Text select mode (tap or long-press triggers lookup)
        if (currentTool == CanvasTool.TEXT_SELECT) {
            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    downTime = SystemClock.uptimeMillis()
                    downX = screenX
                    downY = screenY
                    hasMovedSignificantly = false
                }
                MotionEvent.ACTION_MOVE -> {
                    if (hypot(screenX - downX, screenY - downY) > 20f) {
                        hasMovedSignificantly = true
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    if (!hasMovedSignificantly) {
                        onWordLookupRequested?.invoke(screenX, screenY, worldX, worldY)
                    }
                }
            }
            return
        }

        // Hardware or active Eraser
        val isEraser = isHardwareEraser || currentTool == CanvasTool.ERASER ||
                (event.buttonState and MotionEvent.BUTTON_STYLUS_PRIMARY) != 0 ||
                (event.buttonState and MotionEvent.BUTTON_SECONDARY) != 0

        if (isEraser) {
            handleEraserAction(event, pointerIndex)
            return
        }

        // Lasso Tool
        if (currentTool == CanvasTool.LASSO) {
            when (action) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    lassoTool.startLasso(worldX, worldY)
                    dryInkView.invalidate()
                }
                MotionEvent.ACTION_MOVE -> {
                    if (lassoTool.continueLasso(worldX, worldY)) {
                        dryInkView.invalidate()
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    lassoTool.finishLasso(dryInkView.strokes)
                    dryInkView.invalidate()
                }
            }
            return
        }

        // Pen & Highlighter Hardware Front-Buffered Inking (<2ms latency)
        when (action) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
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
                predictor.record(event)
                val strokeId = activeStrokeIds[pointerId] ?: return
                val predictedEvent = predictor.predict()
                inProgressStrokesView.addToStroke(event, pointerId, strokeId, predictedEvent)
                predictedEvent?.recycle()
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                val strokeId = activeStrokeIds.remove(pointerId) ?: return
                inProgressStrokesView.finishStroke(event, pointerId, strokeId)
            }
            MotionEvent.ACTION_CANCEL -> {
                val strokeId = activeStrokeIds.remove(pointerId) ?: return
                inProgressStrokesView.cancelStroke(strokeId, event)
            }
        }
    }

    private fun handleEraserAction(event: MotionEvent, pointerIndex: Int) {
        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)
        dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)

        val eraseRadius = (strokeWidth * 4f / dryInkView.transform.scale).coerceAtLeast(24f)
        val mod = dryInkView.eraseStrokesWithDetails(tempPoint.x, tempPoint.y, eraseRadius, EraserMode.PRECISION)

        if (mod.removedStrokes.isNotEmpty() || mod.addedStrokes.isNotEmpty()) {
            undoStack.add(StrokeAction(addedStrokes = mod.addedStrokes, removedStrokes = mod.removedStrokes))
            redoStack.clear()
            notifyUndoRedoState()
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

                        // Pan
                        dryInkView.transform.postTranslate(dx, dy)

                        // Pinch-to-zoom
                        if (lastGestureDistance > 0f) {
                            val scaleFactor = currentDist / lastGestureDistance
                            if (scaleFactor in 0.1f..10f) {
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
                    if (totalGestureMovement < 20f && duration < 350L) {
                        // Two finger tap -> Undo
                        if (event.pointerCount == 2) {
                            undo()
                        } else if (event.pointerCount == 3) {
                            redo()
                        }
                    }
                    isGestureActive = false
                }
            }
        }
    }
}
