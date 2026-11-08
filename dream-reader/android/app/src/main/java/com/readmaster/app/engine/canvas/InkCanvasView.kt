package com.readmaster.app.engine.canvas

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.PointF
import android.os.SystemClock
import android.util.AttributeSet
import android.view.GestureDetector
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
import com.readmaster.app.engine.lasso.LassoTool
import com.readmaster.app.engine.palm.InputMode
import com.readmaster.app.engine.palm.PalmRejectionFilter
import com.readmaster.app.engine.pdf.PdfPageEngine
import kotlin.math.abs
import kotlin.math.hypot

enum class CanvasTool {
    READ_BOOK, // Book Reading Mode: single-finger horizontal swipe flips page like a book
    PEN,       // Ultra-low latency pen inking (<2ms)
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
    var isPalmFilterActive: Boolean = true
        set(value) {
            field = value
            palmFilter.config = palmFilter.config.copy(
                inputMode = if (value) InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM else InputMode.PEN_AND_FINGER_DRAW
            )
        }

    private val predictor = MotionEventPredictor.newInstance(this)
    private val identityMatrix = Matrix()

    // Active tool & brush properties
    var currentTool: CanvasTool = CanvasTool.PEN
        set(value) {
            if (field == CanvasTool.LASSO && value != CanvasTool.LASSO) {
                lassoTool.clearSelection()
                dryInkView.invalidate()
                onLassoSelectionChanged?.invoke(false)
            }
            if (value != CanvasTool.TEXT_SELECT && value != CanvasTool.READ_BOOK) {
                dryInkView.selectedWordRect = null
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

    // Lasso & Unified PDF Page Engine
    val lassoTool = LassoTool()
    val pageEngine = PdfPageEngine()

    // Gesture tracking for 2-finger pan & pinch-zoom
    private var isGestureActive = false
    private var lastGestureDistance = 0f
    private var lastGestureCenterX = 0f
    private var lastGestureCenterY = 0f
    private var gestureStartCenterX = 0f
    private var gestureStartCenterY = 0f
    private var gestureStartTime = 0L
    private var totalGestureMovement = 0f
    private var initialGestureDistance = 0f
    private var isPinchZooming = false
    private val tempPoint = PointF()

    // 1.0s to 1.2s Long-Press Translation Handler (Prevents accidental tap lookup)
    private val longPressHandler = android.os.Handler(android.os.Looper.getMainLooper())
    private var pendingLookupRunnable: Runnable? = null
    private var longPressStartX = 0f
    private var longPressStartY = 0f

    // Horizontal Swipe Tracking for Book-Like Page Turning
    private var swipeStartX = 0f
    private var swipeStartY = 0f
    private var isTrackingSwipe = false

    // Single finger gesture tracking for non-stylus touches
    private var fingerStartX = 0f
    private var fingerStartY = 0f
    private var lastFingerX = 0f
    private var lastFingerY = 0f
    private var fingerStartTime = 0L
    private var isTrackingFinger = false

    // Reading Mode (Book Page Flip vs Continuous Vertical Scroll)
    var readingMode: ReadingMode
        get() = dryInkView.readingMode
        set(value) {
            dryInkView.readingMode = value
            if (value == ReadingMode.BOOK_FLIP && width > 0 && height > 0) {
                autoFitPage(width.toFloat(), height.toFloat())
            }
        }

    private var swipeStartTime = 0L
    private var lastMultiTouchReleaseTime = 0L
    private var isMultiTouchSession = false

    // Callbacks
    var onWordSelected: ((word: String, screenX: Float, screenY: Float) -> Unit)? = null
    var onPageChanged: ((Int) -> Unit)? = null
    var onLassoSelectionChanged: ((hasSelection: Boolean) -> Unit)? = null

    init {
        addView(dryInkView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        addView(inProgressStrokesView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))

        inProgressStrokesView.eagerInit()

        dryInkView.lassoTool = lassoTool
        dryInkView.pageEngine = pageEngine

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

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (w > 0 && h > 0 && pageEngine.pageCount > 0) {
            post {
                autoFitPage(w.toFloat(), h.toFloat())
            }
        }
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
            CanvasTool.ERASER, CanvasTool.LASSO, CanvasTool.TEXT_SELECT, CanvasTool.READ_BOOK -> {
                Brush.createWithColorIntArgb(StockBrushes.marker(), color, size.coerceAtLeast(3f), 0.01f)
            }
        }
    }

    fun setPdfPage(pageIndex: Int, fitToScreen: Boolean = true) {
        if (pageIndex in 0 until pageEngine.pageCount) {
            dryInkView.currentPdfPageIndex = pageIndex
            dryInkView.clearAllStrokes()
            undoStack.clear()
            redoStack.clear()
            notifyUndoRedoState()
            onPageChanged?.invoke(pageIndex)

            if (fitToScreen && width > 0 && height > 0) {
                autoFitPage(width.toFloat(), height.toFloat())
            } else {
                dryInkView.invalidate()
            }
        }
    }

    fun nextPage() {
        val next = dryInkView.currentPdfPageIndex + 1
        if (next < pageEngine.pageCount) {
            setPdfPage(next, fitToScreen = (readingMode == ReadingMode.BOOK_FLIP))
        }
    }

    fun prevPage() {
        val prev = dryInkView.currentPdfPageIndex - 1
        if (prev >= 0) {
            setPdfPage(prev, fitToScreen = (readingMode == ReadingMode.BOOK_FLIP))
        }
    }

    fun deleteLassoSelection() {
        val removed = lassoTool.deleteSelected()
        if (removed.isNotEmpty()) {
            dryInkView.removeStrokes(removed)
            undoStack.add(StrokeAction(removedStrokes = removed))
            redoStack.clear()
            notifyUndoRedoState()
            dryInkView.invalidate()
            onLassoSelectionChanged?.invoke(false)
        }
    }

    fun changeLassoSelectionColor(newColor: Int) {
        val (oldStrokes, newStrokes) = lassoTool.changeColor(newColor)
        if (oldStrokes.isNotEmpty()) {
            dryInkView.replaceStrokes(oldStrokes, newStrokes)
            undoStack.add(StrokeAction(addedStrokes = newStrokes, removedStrokes = oldStrokes))
            redoStack.clear()
            notifyUndoRedoState()
            dryInkView.invalidate()
        }
    }

    fun duplicateLassoSelection() {
        val duplicates = lassoTool.duplicateSelected(40f, 40f)
        if (duplicates.isNotEmpty()) {
            dryInkView.addStrokes(duplicates)
            undoStack.add(StrokeAction(addedStrokes = duplicates))
            redoStack.clear()
            notifyUndoRedoState()
            dryInkView.invalidate()
            onLassoSelectionChanged?.invoke(true)
        }
    }

    fun clearLassoSelection() {
        lassoTool.clearSelection()
        dryInkView.invalidate()
        onLassoSelectionChanged?.invoke(false)
    }

    fun zoomIn() {
        dryInkView.transform.postScale(1.25f, width / 2f, height / 2f)
        dryInkView.invalidate()
    }

    fun zoomOut() {
        dryInkView.transform.postScale(0.8f, width / 2f, height / 2f)
        dryInkView.invalidate()
    }

    fun autoFitPage(viewWidth: Float, viewHeight: Float) {
        val pageSize = pageEngine.getPageSize(dryInkView.currentPdfPageIndex) ?: return
        val (pw, ph) = pageSize
        if (pw <= 0 || ph <= 0 || viewWidth <= 0 || viewHeight <= 0) return

        // Fill 92% of screen to leave a clean book margin
        val scaleX = (viewWidth * 0.92f) / pw.toFloat()
        val scaleY = (viewHeight * 0.92f) / ph.toFloat()
        val targetScale = minOf(scaleX, scaleY).coerceIn(0.5f, 5.0f)

        val tx = (viewWidth - pw * targetScale) / 2f
        val ty = (viewHeight - ph * targetScale) / 2f

        dryInkView.transform.setTransform(targetScale, tx, ty)
        dryInkView.invalidate()
    }

    fun fitWidth(w: Float, h: Float) {
        val pageSize = pageEngine.getPageSize(dryInkView.currentPdfPageIndex) ?: return
        val (pw, ph) = pageSize
        if (pw > 0 && w > 0) {
            val targetScale = (w * 0.96f / pw.toFloat()).coerceIn(0.5f, 5.0f)
            val tx = (w - pw * targetScale) / 2f
            val ty = 16f
            dryInkView.transform.setTransform(targetScale, tx, ty)
            dryInkView.invalidate()
        }
    }

    fun fitPage(w: Float, h: Float) {
        autoFitPage(w, h)
    }

    fun resetZoom() {
        if (width > 0 && height > 0) {
            autoFitPage(width.toFloat(), height.toFloat())
        } else {
            dryInkView.transform.reset()
            dryInkView.invalidate()
        }
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

    private fun scheduleLongPressLookup(screenX: Float, screenY: Float) {
        cancelPendingLongPress()
        longPressStartX = screenX
        longPressStartY = screenY

        val runnable = Runnable {
            dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
            val hitWord = pageEngine.findWordAt(tempPoint.x, tempPoint.y, dryInkView.currentPdfPageIndex)
            if (hitWord != null) {
                performHapticFeedback(android.view.HapticFeedbackConstants.LONG_PRESS)
                dryInkView.selectedWordRect = hitWord.boundsInPoints
                dryInkView.invalidate()
                onWordSelected?.invoke(hitWord.text, screenX, screenY)
            }
            pendingLookupRunnable = null
        }
        pendingLookupRunnable = runnable
        longPressHandler.postDelayed(runnable, 1200L) // 1.2s intentional hold
    }

    private fun cancelPendingLongPress() {
        pendingLookupRunnable?.let {
            longPressHandler.removeCallbacks(it)
            pendingLookupRunnable = null
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        requestUnbufferedDispatch(event)
        parent?.requestDisallowInterceptTouchEvent(true)

        val w = width.toFloat()
        val h = height.toFloat()
        val action = event.actionMasked
        val pointerCount = event.pointerCount
        val pointerIndex = event.actionIndex.coerceIn(0, (pointerCount - 1).coerceAtLeast(0))
        val pointerId = event.getPointerId(pointerIndex)

        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)

        // 1. Multi-Touch Tracking (Pinch-to-zoom & two-finger pan)
        if (pointerCount >= 2) {
            isMultiTouchSession = true
            cancelPendingLongPress()
            isTrackingFinger = false
            isTrackingSwipe = false
            handleMultiFingerGesture(event)
            return true
        }

        // 2. Trailing events from an active multi-touch pinch session
        if (isMultiTouchSession) {
            cancelPendingLongPress()
            if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
                isMultiTouchSession = false
                lastMultiTouchReleaseTime = SystemClock.uptimeMillis()
                isGestureActive = false
                isPinchZooming = false
                isTrackingFinger = false
                isTrackingSwipe = false
            }
            // During multi-finger liftoff, suppress single-finger moves and translation jumps
            return true
        }

        // 3. Post-pinch release grace window (350ms): ignore stray liftoff moves
        if (SystemClock.uptimeMillis() - lastMultiTouchReleaseTime < 350L) {
            cancelPendingLongPress()
            isTrackingFinger = false
            isTrackingSwipe = false
            return true
        }

        // 4. Stylus vs Finger routing via PalmRejectionFilter
        val filterResult = palmFilter.evaluatePointer(event, pointerIndex, w, h)

        when (filterResult) {
            is PalmRejectionFilter.FilteredResult.StylusAction -> {
                handleStylusAction(event, pointerIndex, pointerId, filterResult.isEraser)
            }
            is PalmRejectionFilter.FilteredResult.FingerEraser -> {
                handleEraserAction(event, pointerIndex)
            }
            is PalmRejectionFilter.FilteredResult.MultiFingerGesture -> {
                // Unified finger interaction: Book Swipe / Continuous Scroll / Zoom Pan / Long-Press Lookup
                handleFingerInteraction(event, pointerIndex, screenX, screenY, w, h)
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
        cancelPendingLongPress()
        val action = event.actionMasked
        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)

        dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
        val worldX = tempPoint.x
        val worldY = tempPoint.y

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
                    onLassoSelectionChanged?.invoke(lassoTool.selectedStrokes.isNotEmpty())
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

    private fun handleFingerInteraction(
        event: MotionEvent,
        pointerIndex: Int,
        screenX: Float,
        screenY: Float,
        w: Float,
        h: Float
    ) {
        val action = event.actionMasked

        when (action) {
            MotionEvent.ACTION_DOWN -> {
                fingerStartX = screenX
                fingerStartY = screenY
                lastFingerX = screenX
                lastFingerY = screenY
                fingerStartTime = SystemClock.uptimeMillis()
                isTrackingFinger = true

                if (currentTool == CanvasTool.READ_BOOK || currentTool == CanvasTool.TEXT_SELECT) {
                    scheduleLongPressLookup(screenX, screenY)
                }
            }
            MotionEvent.ACTION_MOVE -> {
                if (!isTrackingFinger) {
                    fingerStartX = screenX
                    fingerStartY = screenY
                    lastFingerX = screenX
                    lastFingerY = screenY
                    fingerStartTime = SystemClock.uptimeMillis()
                    isTrackingFinger = true
                }

                val moveDist = hypot(screenX - fingerStartX, screenY - fingerStartY)
                if (moveDist > 16f) {
                    cancelPendingLongPress()
                }

                if (readingMode == ReadingMode.CONTINUOUS_SCROLL) {
                    val dy = screenY - lastFingerY
                    dryInkView.transform.postTranslate(0f, dy)
                    val centerPage = dryInkView.findCenterPageIndex()
                    if (centerPage != dryInkView.currentPdfPageIndex) {
                        dryInkView.currentPdfPageIndex = centerPage
                        onPageChanged?.invoke(centerPage)
                    }
                    dryInkView.invalidate()
                } else {
                    // BOOK_FLIP mode
                    if (dryInkView.transform.scale > 1.15f) {
                        // User is zoomed in: allow smooth 1-finger panning across the page
                        val dx = screenX - lastFingerX
                        val dy = screenY - lastFingerY
                        dryInkView.transform.postTranslate(dx, dy)
                        dryInkView.invalidate()
                    }
                }

                lastFingerX = screenX
                lastFingerY = screenY
            }
            MotionEvent.ACTION_UP -> {
                cancelPendingLongPress()

                if (isTrackingFinger && readingMode == ReadingMode.BOOK_FLIP) {
                    val dx = screenX - fingerStartX
                    val dy = screenY - fingerStartY
                    val dt = (SystemClock.uptimeMillis() - fingerStartTime).coerceAtLeast(1)
                    val vx = (dx / dt) * 1000f

                    val isHorizontal = abs(dx) > abs(dy) * 0.65f
                    val isFlick = abs(vx) > 280f && abs(dx) > 25f
                    val isDragSwipe = abs(dx) > 45f

                    if (isHorizontal && (isFlick || isDragSwipe)) {
                        // SWIPE LIKE A BOOK! 100% reliable page turn!
                        if (dx < 0 || vx < -280f) {
                            nextPage()
                        } else {
                            prevPage()
                        }
                    } else if (hypot(dx, dy) < 25f) {
                        // Single-finger margin tap: turn page (left 18% = prev, right 18% = next)
                        if (screenX > w * 0.82f) {
                            nextPage()
                        } else if (screenX < w * 0.18f) {
                            prevPage()
                        }
                    } else if (dryInkView.transform.scale <= 1.15f) {
                        // User dragged slightly but didn't swipe: snap back centered so page NEVER drifts off!
                        autoFitPage(w, h)
                    }
                }

                isTrackingFinger = false
            }
            MotionEvent.ACTION_CANCEL -> {
                cancelPendingLongPress()
                isTrackingFinger = false
            }
        }
    }

    private fun handleMultiFingerGesture(event: MotionEvent) {
        cancelPendingLongPress()
        val action = event.actionMasked

        if (event.pointerCount >= 2) {
            val p0X = event.getX(0)
            val p0Y = event.getY(0)
            val p1X = event.getX(1)
            val p1Y = event.getY(1)

            val currentDist = hypot(p0X - p1X, p0Y - p1Y)
            val centerX = (p0X + p1X) / 2f
            val centerY = (p0Y + p1Y) / 2f

            when (action) {
                MotionEvent.ACTION_POINTER_DOWN, MotionEvent.ACTION_DOWN -> {
                    isGestureActive = true
                    initialGestureDistance = currentDist
                    lastGestureDistance = currentDist
                    lastGestureCenterX = centerX
                    lastGestureCenterY = centerY
                    gestureStartCenterX = centerX
                    gestureStartCenterY = centerY
                    gestureStartTime = SystemClock.uptimeMillis()
                    totalGestureMovement = 0f
                    isPinchZooming = false
                }
                MotionEvent.ACTION_MOVE -> {
                    if (!isGestureActive || lastGestureDistance <= 0f) {
                        isGestureActive = true
                        initialGestureDistance = currentDist
                        lastGestureDistance = currentDist
                        lastGestureCenterX = centerX
                        lastGestureCenterY = centerY
                        gestureStartCenterX = centerX
                        gestureStartCenterY = centerY
                        gestureStartTime = SystemClock.uptimeMillis()
                        totalGestureMovement = 0f
                        isPinchZooming = false
                    } else {
                        val dx = centerX - lastGestureCenterX
                        val dy = centerY - lastGestureCenterY
                        totalGestureMovement += hypot(dx, dy)

                        if (abs(currentDist - initialGestureDistance) > 15f) {
                            isPinchZooming = true
                        }

                        // Smooth two-finger pan
                        dryInkView.transform.postTranslate(dx, dy)

                        // Smooth pinch-zoom around focal center
                        if (lastGestureDistance > 10f && currentDist > 10f) {
                            val scaleFactor = (currentDist / lastGestureDistance).coerceIn(0.7f, 1.4f)
                            dryInkView.transform.postScale(scaleFactor, centerX, centerY)
                        }

                        lastGestureDistance = currentDist
                        lastGestureCenterX = centerX
                        lastGestureCenterY = centerY
                        dryInkView.invalidate()
                    }
                }
                MotionEvent.ACTION_POINTER_UP -> {
                    // One finger lifted: invalidate distance so remaining finger does not cause scale jump
                    lastGestureDistance = -1f
                    val remainingIdx = if (event.actionIndex == 0) 1 else 0
                    if (remainingIdx < event.pointerCount) {
                        lastGestureCenterX = event.getX(remainingIdx)
                        lastGestureCenterY = event.getY(remainingIdx)
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    finalizeGesture(event, centerX, centerY)
                }
            }
        } else {
            // pointerCount < 2 (e.g. final finger lifting)
            if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
                finalizeGesture(event, event.x, event.y)
            }
        }
    }

    private fun finalizeGesture(event: MotionEvent, centerX: Float, centerY: Float) {
        lastMultiTouchReleaseTime = SystemClock.uptimeMillis()
        val duration = SystemClock.uptimeMillis() - gestureStartTime

        if (totalGestureMovement < 25f && duration < 350L && !isPinchZooming) {
            // Two-finger tap -> Undo, Three-finger tap -> Redo
            if (event.pointerCount == 2) {
                undo()
            } else if (event.pointerCount == 3) {
                redo()
            }
        }

        isGestureActive = false
        isPinchZooming = false
        isTrackingFinger = false
        isTrackingSwipe = false
        isMultiTouchSession = false
    }
}
