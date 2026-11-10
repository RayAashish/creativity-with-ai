package com.readmaster.app.engine.canvas

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.PointF
import android.graphics.Rect
import android.os.Build
import android.os.SystemClock
import android.util.AttributeSet
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.VelocityTracker
import android.view.ViewConfiguration
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.OverScroller
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
    BOOK,        // Single-source Book Reading Mode (Pen is OFF, gestures arbitrated: curl, tap, 500ms long press, pinch zoom)
    PEN,         // Ultra-low latency pen inking (<2ms)
    HIGHLIGHT,   // Translucent highlighter directly on page
    ERASER,      // Precision stroke cutting & stroke eraser
    LASSO,       // Freehand vector lasso selection, move & color change
    TRANSLATE;   // Dedicated instant dictionary lookup

    companion object {
        val READ_BOOK get() = BOOK
        val HIGHLIGHTER get() = HIGHLIGHT
        val TEXT_SELECT get() = TRANSLATE
    }
}
typealias ActiveTool = CanvasTool

data class StrokeAction(
    val pageIndex: Int,
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

    // Single source of truth for Active Tool
    var activeTool: CanvasTool = CanvasTool.BOOK
        set(value) {
            val previous = field
            field = value
            if (previous == CanvasTool.LASSO && value != CanvasTool.LASSO) {
                lassoTool.clearSelection()
                dryInkView.invalidate()
                onLassoSelectionChanged?.invoke(false)
            }
            if (value != CanvasTool.TRANSLATE && value != CanvasTool.BOOK) {
                dryInkView.selectedWordRect = null
            }
            if (value == CanvasTool.BOOK) {
                // Detach pointer handling from drawing layer entirely
                inProgressStrokesView.isEnabled = false
                inProgressStrokesView.isClickable = false
            } else if (value == CanvasTool.PEN || value == CanvasTool.HIGHLIGHT) {
                inProgressStrokesView.isEnabled = true
                activeBrush = createBrushForTool(value, strokeColor, strokeWidth)
            } else {
                inProgressStrokesView.isEnabled = false
            }
        }

    // Property alias for currentTool
    var currentTool: CanvasTool
        get() = activeTool
        set(value) {
            activeTool = value
        }

    var strokeColor: Int = Color.parseColor("#111318")
        set(value) {
            field = value
            activeBrush = createBrushForTool(activeTool, value, strokeWidth)
        }

    var strokeWidth: Float = 0.6f
        set(value) {
            field = value
            activeBrush = createBrushForTool(activeTool, strokeColor, value)
        }

    private var activeBrush: Brush = createBrushForTool(activeTool, strokeColor, strokeWidth)
    private val activeStrokeIds = HashMap<Int, InProgressStrokeId>()
    private val activeStrokePages = HashMap<Int, Int>()
    private var lastActiveStrokeTargetPage: Int = 0

    // Ultra-smooth 120Hz/144Hz Fling Physics
    private val scroller = OverScroller(context)
    private var velocityTracker: VelocityTracker? = null

    // Fixed Screen Viewport Lock Toggle
    var isFixedScreen: Boolean = false
        set(value) {
            field = value
            if (value && width > 0 && height > 0) {
                if (readingMode == ReadingMode.BOOK_FLIP) {
                    autoFitPage(width.toFloat(), height.toFloat())
                } else {
                    fitWidth(width.toFloat(), height.toFloat())
                    clampScrollBounds()
                }
            }
        }

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
            dryInkView.replacePageStrokes(lassoTool.activePageIndex, oldStrokes, newStrokes)
        }

        lassoTool.onStrokesTransformCommitted = { oldStrokes, newStrokes ->
            val page = lassoTool.activePageIndex
            undoStack.add(StrokeAction(pageIndex = page, addedStrokes = newStrokes, removedStrokes = oldStrokes))
            redoStack.clear()
            notifyUndoRedoState()
            dryInkView.invalidate()
        }

        inProgressStrokesView.addFinishedStrokesListener(object : InProgressStrokesFinishedListener {
            override fun onStrokesFinished(strokes: Map<InProgressStrokeId, Stroke>) {
                val finishedList = strokes.values.toList()
                if (finishedList.isNotEmpty()) {
                    val targetPage = lastActiveStrokeTargetPage.coerceIn(0, (pageEngine.pageCount - 1).coerceAtLeast(0))
                    dryInkView.addPageStrokes(targetPage, finishedList)
                    undoStack.add(StrokeAction(pageIndex = targetPage, addedStrokes = finishedList))
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
        updateGestureExclusion()
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        updateGestureExclusion()
    }

    private fun updateGestureExclusion() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && width > 0 && height > 0) {
            // Exclude vertical strips along the left and right edges from Android's system edge back gesture
            val edgeWidth = (56 * resources.displayMetrics.density).toInt()
            val topBound = (height * 0.10f).toInt()
            val bottomBound = (height * 0.90f).toInt()
            val leftRect = Rect(0, topBound, edgeWidth, bottomBound)
            val rightRect = Rect(width - edgeWidth, topBound, width, bottomBound)
            systemGestureExclusionRects = listOf(leftRect, rightRect)
        }
    }

    override fun computeScroll() {
        super.computeScroll()
        if (scroller.computeScrollOffset()) {
            val newY = scroller.currY.toFloat()
            dryInkView.transform.setTransform(dryInkView.transform.scale, dryInkView.transform.translationX, newY)
            clampScrollBounds()
            val centerPage = dryInkView.findCenterPageIndex()
            if (centerPage != dryInkView.currentPdfPageIndex) {
                dryInkView.currentPdfPageIndex = centerPage
                onPageChanged?.invoke(centerPage)
            }
            dryInkView.invalidate()
            postInvalidateOnAnimation()
        }
    }

    fun clampScrollBounds() {
        if (readingMode != ReadingMode.CONTINUOUS_SCROLL) return
        val totalH = dryInkView.totalDocumentHeight * dryInkView.transform.scale
        val h = height.toFloat()
        val w = width.toFloat()
        if (h <= 0f || totalH <= 0f) return

        if (isFixedScreen) {
            // Lock horizontal translation strictly to center
            val pageSize = pageEngine.getPageSize(0)
            val pw = pageSize?.first?.toFloat() ?: 612f
            val expectedTx = (w - pw * dryInkView.transform.scale) / 2f

            // Clamp vertical translation so it can't exceed document viewing bounds
            val minY = (h - totalH).coerceAtMost(0f)
            val maxY = 0f
            val clampedTy = dryInkView.transform.translationY.coerceIn(minY, maxY)
            dryInkView.transform.setTransform(dryInkView.transform.scale, expectedTx, clampedTy)
        }
    }

    private fun createBrushForTool(tool: CanvasTool, color: Int, size: Float): Brush {
        return when (tool) {
            CanvasTool.PEN -> {
                Brush.createWithColorIntArgb(StockBrushes.pressurePen(), color, size, 0.01f)
            }
            CanvasTool.HIGHLIGHT -> {
                // In PDF points: standard text line height in printed books is ~14-18 pt.
                // Size directly specifies the highlighter height in PDF points.
                val highlighterSize = size.coerceIn(10f, 36f)
                val translucentColor = (color and 0x00FFFFFF) or (0x55 shl 24) // 33% alpha matching note engine
                Brush.createWithColorIntArgb(StockBrushes.highlighter(), translucentColor, highlighterSize, 0.01f)
            }
            CanvasTool.ERASER, CanvasTool.LASSO, CanvasTool.TRANSLATE, CanvasTool.BOOK -> {
                Brush.createWithColorIntArgb(StockBrushes.marker(), Color.TRANSPARENT, 1f, 0.01f)
            }
        }
    }

    fun setPdfPage(pageIndex: Int, fitToScreen: Boolean = true) {
        if (pageIndex in 0 until pageEngine.pageCount) {
            dryInkView.currentPdfPageIndex = pageIndex
            notifyUndoRedoState()
            onPageChanged?.invoke(pageIndex)

            if (readingMode == ReadingMode.CONTINUOUS_SCROLL) {
                val pageTop = dryInkView.getPageTopOffset(pageIndex)
                val targetTy = -pageTop * dryInkView.transform.scale + 16f
                val targetTx = if (isFixedScreen && width > 0) {
                    val pageSize = pageEngine.getPageSize(pageIndex)
                    val pw = pageSize?.first?.toFloat() ?: 612f
                    (width.toFloat() - pw * dryInkView.transform.scale) / 2f
                } else {
                    dryInkView.transform.translationX
                }
                dryInkView.transform.setTransform(dryInkView.transform.scale, targetTx, targetTy)
                clampScrollBounds()
                dryInkView.invalidate()
            } else {
                if (fitToScreen && width > 0 && height > 0) {
                    autoFitPage(width.toFloat(), height.toFloat())
                } else {
                    dryInkView.invalidate()
                }
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
            val page = lassoTool.activePageIndex
            dryInkView.removePageStrokes(page, removed)
            undoStack.add(StrokeAction(pageIndex = page, removedStrokes = removed))
            redoStack.clear()
            notifyUndoRedoState()
            dryInkView.invalidate()
            onLassoSelectionChanged?.invoke(false)
        }
    }

    fun changeLassoSelectionColor(newColor: Int) {
        val (oldStrokes, newStrokes) = lassoTool.changeColor(newColor)
        if (oldStrokes.isNotEmpty()) {
            val page = lassoTool.activePageIndex
            dryInkView.replacePageStrokes(page, oldStrokes, newStrokes)
            undoStack.add(StrokeAction(pageIndex = page, addedStrokes = newStrokes, removedStrokes = oldStrokes))
            redoStack.clear()
            notifyUndoRedoState()
            dryInkView.invalidate()
        }
    }

    fun duplicateLassoSelection() {
        val duplicates = lassoTool.duplicateSelected(40f, 40f)
        if (duplicates.isNotEmpty()) {
            val page = lassoTool.activePageIndex
            dryInkView.addPageStrokes(page, duplicates)
            undoStack.add(StrokeAction(pageIndex = page, addedStrokes = duplicates))
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
        if (!isFixedScreen) {
            dryInkView.transform.postScale(1.25f, width / 2f, height / 2f)
            dryInkView.invalidate()
        }
    }

    fun zoomOut() {
        if (!isFixedScreen) {
            dryInkView.transform.postScale(0.8f, width / 2f, height / 2f)
            dryInkView.invalidate()
        }
    }

    var baseFitScale: Float = 1.0f

    fun autoFitPage(viewWidth: Float, viewHeight: Float) {
        val pageSize = pageEngine.getPageSize(dryInkView.currentPdfPageIndex) ?: return
        val (pw, ph) = pageSize
        if (pw <= 0 || ph <= 0 || viewWidth <= 0 || viewHeight <= 0) return

        // Fill 92% of screen to leave a clean book margin
        val scaleX = (viewWidth * 0.92f) / pw.toFloat()
        val scaleY = (viewHeight * 0.92f) / ph.toFloat()
        val targetScale = minOf(scaleX, scaleY).coerceIn(0.5f, 6.0f)

        val tx = (viewWidth - pw * targetScale) / 2f
        val ty = if (readingMode == ReadingMode.CONTINUOUS_SCROLL) {
            val pageTop = dryInkView.getPageTopOffset(dryInkView.currentPdfPageIndex)
            -pageTop * targetScale + 16f
        } else {
            (viewHeight - ph * targetScale) / 2f
        }

        baseFitScale = targetScale
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

            dryInkView.removePageStrokes(action.pageIndex, action.addedStrokes)
            dryInkView.addPageStrokes(action.pageIndex, action.removedStrokes)
            notifyUndoRedoState()
            dryInkView.invalidate()
        }
    }

    fun redo() {
        if (redoStack.isNotEmpty()) {
            val action = redoStack.removeAt(redoStack.lastIndex)
            undoStack.add(action)

            dryInkView.removePageStrokes(action.pageIndex, action.removedStrokes)
            dryInkView.addPageStrokes(action.pageIndex, action.addedStrokes)
            notifyUndoRedoState()
            dryInkView.invalidate()
        }
    }

    fun clearPageInk() {
        val page = dryInkView.currentPdfPageIndex
        val current = dryInkView.getPageStrokes(page).toList()
        if (current.isNotEmpty()) {
            undoStack.add(StrokeAction(pageIndex = page, removedStrokes = current))
            redoStack.clear()
            dryInkView.clearPageStrokes(page)
            notifyUndoRedoState()
        }
    }

    private fun notifyUndoRedoState() {
        post {
            onUndoRedoStateChanged?.invoke(undoStack.isNotEmpty(), redoStack.isNotEmpty())
        }
    }

    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        // In BOOK mode, intercept all touches so drawing layer never consumes or sees them
        if (activeTool == CanvasTool.BOOK) {
            return true
        }
        return super.onInterceptTouchEvent(ev)
    }

    private var hasFiredLongPress: Boolean = false
    private var isPageCurling: Boolean = false
    private var curlAnimator: ValueAnimator? = null

    private fun cancelPageCurlAnimation() {
        curlAnimator?.cancel()
        curlAnimator = null
    }

    private fun animatePageCurl(commit: Boolean, direction: CurlDirection) {
        cancelPageCurlAnimation()
        val startProgress = dryInkView.curlProgress
        val endProgress = if (commit) 1.0f else 0.0f
        val duration = if (commit) {
            ((1f - startProgress) * 320L).toLong().coerceIn(200L, 380L)
        } else {
            (startProgress * 280L).toLong().coerceIn(180L, 320L)
        }

        val anim = ValueAnimator.ofFloat(startProgress, endProgress).apply {
            this.duration = duration
            interpolator = DecelerateInterpolator(1.5f)
            addUpdateListener { va ->
                val p = va.animatedValue as Float
                dryInkView.updatePageCurl(direction, p, lastFingerY)
            }
            addListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    if (commit) {
                        if (direction == CurlDirection.FORWARD) {
                            nextPage()
                        } else if (direction == CurlDirection.BACKWARD) {
                            prevPage()
                        }
                    }
                    dryInkView.resetPageCurl()
                    isPageCurling = false
                    curlAnimator = null
                }

                override fun onAnimationCancel(animation: Animator) {
                    dryInkView.resetPageCurl()
                    isPageCurling = false
                    curlAnimator = null
                }
            })
        }
        curlAnimator = anim
        anim.start()
    }

    private fun animateEdgeFlip(direction: CurlDirection) {
        cancelPageCurlAnimation()
        isPageCurling = true
        dryInkView.curlDirection = direction
        val anim = ValueAnimator.ofFloat(0f, 1.0f).apply {
            duration = 300L
            interpolator = DecelerateInterpolator(1.5f)
            addUpdateListener { va ->
                val p = va.animatedValue as Float
                dryInkView.updatePageCurl(direction, p, height / 2f)
            }
            addListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    if (direction == CurlDirection.FORWARD) {
                        nextPage()
                    } else if (direction == CurlDirection.BACKWARD) {
                        prevPage()
                    }
                    dryInkView.resetPageCurl()
                    isPageCurling = false
                    curlAnimator = null
                }

                override fun onAnimationCancel(animation: Animator) {
                    dryInkView.resetPageCurl()
                    isPageCurling = false
                    curlAnimator = null
                }
            })
        }
        curlAnimator = anim
        anim.start()
    }

    private fun scheduleLongPressLookup(screenX: Float, screenY: Float) {
        cancelPendingLongPress()
        longPressStartX = screenX
        longPressStartY = screenY
        hasFiredLongPress = false

        val runnable = Runnable {
            if (!isPageCurling) {
                dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
                val hitWord = pageEngine.findWordAt(tempPoint.x, tempPoint.y, dryInkView.currentPdfPageIndex, maxDistance = 48f)
                if (hitWord != null) {
                    hasFiredLongPress = true
                    performHapticFeedback(android.view.HapticFeedbackConstants.LONG_PRESS)
                    dryInkView.selectedWordRect = hitWord.boundsInPoints
                    dryInkView.invalidate()
                    onWordSelected?.invoke(hitWord.text, screenX, screenY)
                }
            }
            pendingLookupRunnable = null
        }
        pendingLookupRunnable = runnable
        longPressHandler.postDelayed(runnable, 500L) // 500ms intentional hold with touch slop cancellation
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

        if (velocityTracker == null) {
            velocityTracker = VelocityTracker.obtain()
        }
        velocityTracker?.addMovement(event)

        val w = width.toFloat()
        val h = height.toFloat()
        val action = event.actionMasked
        val pointerCount = event.pointerCount
        val pointerIndex = event.actionIndex.coerceIn(0, (pointerCount - 1).coerceAtLeast(0))
        val pointerId = event.getPointerId(pointerIndex)

        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)

        // 1. Central Multi-Touch Handler (Pinch-to-zoom & two-finger pan)
        if (pointerCount >= 2) {
            isMultiTouchSession = true
            cancelPendingLongPress()
            if (isPageCurling) {
                cancelPageCurlAnimation()
                dryInkView.resetPageCurl()
                isPageCurling = false
            }
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
            return true
        }

        // 3. Post-pinch release grace window (300ms)
        if (SystemClock.uptimeMillis() - lastMultiTouchReleaseTime < 300L) {
            cancelPendingLongPress()
            isTrackingFinger = false
            isTrackingSwipe = false
            return true
        }

        // =========================================================================
        // CENTRAL GESTURE ARBITRATOR
        // Decides routing based strictly on activeTool
        // =========================================================================

        if (activeTool == CanvasTool.BOOK) {
            // BOOK MODE: Single source of truth.
            // Drawing is COMPLETELY DETACHED and DISABLED. Stylus and finger do not draw.
            // Touch routes to:
            // - Horizontal drag: Real-time Page Curl (follows finger, dynamic fold & shadows)
            // - Edge tap (15% margins): Short flip animation (300ms)
            // - Long-press (500ms): Bilingual dictionary lookup with touch slop cancellation
            // - Pinch: Zoom and Pan
            handleBookModeGesture(event, pointerIndex, screenX, screenY, w, h)
            return true
        }

        if (activeTool == CanvasTool.TRANSLATE) {
            // TRANSLATE MODE: Dedicated dictionary inspection
            handleTranslateModeGesture(event, pointerIndex, screenX, screenY)
            return true
        }

        // DRAWING TOOLS: PEN, HIGHLIGHT, ERASER, LASSO
        // Page-curl and page-swiping are 100% DISABLED so ink strokes never turn pages!
        val filterResult = palmFilter.evaluatePointer(event, pointerIndex, w, h)

        when (filterResult) {
            is PalmRejectionFilter.FilteredResult.StylusAction -> {
                handleStylusAction(event, pointerIndex, pointerId, filterResult.isEraser)
            }
            is PalmRejectionFilter.FilteredResult.FingerEraser -> {
                handleEraserAction(event, pointerIndex)
            }
            is PalmRejectionFilter.FilteredResult.MultiFingerGesture -> {
                if (activeTool == CanvasTool.ERASER) {
                    handleEraserAction(event, pointerIndex)
                } else if (!isPalmFilterActive) {
                    // Finger drawing enabled: draw with finger
                    handleStylusAction(event, pointerIndex, pointerId, false)
                }
            }
            is PalmRejectionFilter.FilteredResult.CancelStroke -> {
                val strokeId = activeStrokeIds.remove(pointerId)
                activeStrokePages.remove(pointerId)
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

        val targetPageIndex = if (readingMode == ReadingMode.BOOK_FLIP) {
            dryInkView.currentPdfPageIndex
        } else {
            dryInkView.findPageIndexAtWorldY(worldY)
        }
        val pageTop = if (readingMode == ReadingMode.BOOK_FLIP) 0f else dryInkView.getPageTopOffset(targetPageIndex)
        val localX = worldX
        val localY = worldY - pageTop

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
                    lassoTool.startLasso(localX, localY, targetPageIndex, pageTop)
                    dryInkView.invalidate()
                }
                MotionEvent.ACTION_MOVE -> {
                    if (lassoTool.continueLasso(localX, localY)) {
                        dryInkView.invalidate()
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    lassoTool.finishLasso(dryInkView.getPageStrokes(targetPageIndex))
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
                activeStrokePages[pointerId] = targetPageIndex
                lastActiveStrokeTargetPage = targetPageIndex

                // Map touch events to page coordinates
                val pageTop = if (readingMode == ReadingMode.BOOK_FLIP) 0f else dryInkView.getPageTopOffset(targetPageIndex)
                val screenToPage = Matrix(dryInkView.transform.screenToWorldMatrix).apply {
                    postTranslate(0f, -pageTop)
                }

                val strokeId = inProgressStrokesView.startStroke(
                    event,
                    pointerId,
                    activeBrush,
                    screenToPage,
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
                predictor.record(event)
                val strokeId = activeStrokeIds.remove(pointerId) ?: return
                activeStrokePages.remove(pointerId)
                inProgressStrokesView.finishStroke(event, pointerId, strokeId)
            }
            MotionEvent.ACTION_CANCEL -> {
                val strokeId = activeStrokeIds.remove(pointerId) ?: return
                activeStrokePages.remove(pointerId)
                inProgressStrokesView.cancelStroke(strokeId, event)
            }
        }
    }

    private fun handleEraserAction(event: MotionEvent, pointerIndex: Int) {
        val screenX = event.getX(pointerIndex)
        val screenY = event.getY(pointerIndex)
        dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)

        val targetPageIndex = if (readingMode == ReadingMode.BOOK_FLIP) {
            dryInkView.currentPdfPageIndex
        } else {
            dryInkView.findPageIndexAtWorldY(tempPoint.y)
        }
        val pageTop = if (readingMode == ReadingMode.BOOK_FLIP) 0f else dryInkView.getPageTopOffset(targetPageIndex)
        val localX = tempPoint.x
        val localY = tempPoint.y - pageTop

        val eraseRadius = (strokeWidth * 4f / dryInkView.transform.scale).coerceAtLeast(24f)
        val mod = dryInkView.eraseStrokesWithDetails(targetPageIndex, localX, localY, eraseRadius, EraserMode.PRECISION)

        if (mod.removedStrokes.isNotEmpty() || mod.addedStrokes.isNotEmpty()) {
            undoStack.add(StrokeAction(pageIndex = targetPageIndex, addedStrokes = mod.addedStrokes, removedStrokes = mod.removedStrokes))
            redoStack.clear()
            notifyUndoRedoState()
        }
    }

    private fun handleBookModeGesture(
        event: MotionEvent,
        pointerIndex: Int,
        screenX: Float,
        screenY: Float,
        w: Float,
        h: Float
    ) {
        val action = event.actionMasked
        val touchSlop = ViewConfiguration.get(context).scaledTouchSlop.toFloat()

        when (action) {
            MotionEvent.ACTION_DOWN -> {
                if (!scroller.isFinished) {
                    scroller.abortAnimation()
                }
                cancelPageCurlAnimation()
                fingerStartX = screenX
                fingerStartY = screenY
                lastFingerX = screenX
                lastFingerY = screenY
                fingerStartTime = SystemClock.uptimeMillis()
                isTrackingFinger = true
                isPageCurling = false
                hasFiredLongPress = false

                // Pre-render adjacent pages into bitmap cache
                pageEngine.prefetchPage(dryInkView.currentPdfPageIndex + 1, w)
                pageEngine.prefetchPage(dryInkView.currentPdfPageIndex - 1, w)

                // Schedule 500ms long press dictionary lookup
                scheduleLongPressLookup(screenX, screenY)
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

                val dx = screenX - fingerStartX
                val dy = screenY - fingerStartY
                val moveDist = hypot(dx, dy)

                if (moveDist > touchSlop) {
                    cancelPendingLongPress()
                }

                if (hasFiredLongPress) {
                    return
                }

                if (readingMode == ReadingMode.CONTINUOUS_SCROLL) {
                    // SCROLL MODE UNTOUCHED
                    val scrollDy = screenY - lastFingerY
                    dryInkView.transform.postTranslate(0f, scrollDy)
                    clampScrollBounds()
                    val centerPage = dryInkView.findCenterPageIndex()
                    if (centerPage != dryInkView.currentPdfPageIndex) {
                        dryInkView.currentPdfPageIndex = centerPage
                        onPageChanged?.invoke(centerPage)
                    }
                    dryInkView.invalidate()
                } else {
                    // BOOK_FLIP mode
                    val isZoomed = !isFixedScreen && dryInkView.transform.scale > baseFitScale * 1.15f
                    val isHorizontal = abs(dx) > abs(dy) * 0.55f

                    if (isZoomed && !isHorizontal) {
                        // User is zoomed in and moving vertically: allow smooth 1-finger vertical panning
                        val panDy = screenY - lastFingerY
                        dryInkView.transform.postTranslate(0f, panDy)
                        dryInkView.invalidate()
                    } else {
                        // Real-time Page Curl!
                        if (!isPageCurling && moveDist > touchSlop) {
                            if (isHorizontal) {
                                if (dx < 0 && dryInkView.currentPdfPageIndex < pageEngine.pageCount - 1) {
                                    isPageCurling = true
                                    dryInkView.curlDirection = CurlDirection.FORWARD
                                } else if (dx > 0 && dryInkView.currentPdfPageIndex > 0) {
                                    isPageCurling = true
                                    dryInkView.curlDirection = CurlDirection.BACKWARD
                                }
                            }
                        }

                        if (isPageCurling) {
                            val dragSpan = (w * 0.75f).coerceAtLeast(100f)
                            val progress = if (dryInkView.curlDirection == CurlDirection.FORWARD) {
                                (-dx / dragSpan).coerceIn(0f, 1f)
                            } else {
                                (dx / dragSpan).coerceIn(0f, 1f)
                            }
                            dryInkView.updatePageCurl(dryInkView.curlDirection, progress, screenY)
                        } else if (isZoomed) {
                            // User is zoomed in but not curling: allow horizontal panning
                            val panDx = screenX - lastFingerX
                            dryInkView.transform.postTranslate(panDx, 0f)
                            dryInkView.invalidate()
                        }
                    }
                }

                lastFingerX = screenX
                lastFingerY = screenY
            }
            MotionEvent.ACTION_UP -> {
                cancelPendingLongPress()

                if (hasFiredLongPress) {
                    isTrackingFinger = false
                    return
                }

                if (readingMode == ReadingMode.CONTINUOUS_SCROLL) {
                    // CONTINUOUS_SCROLL fling physics preserved
                    velocityTracker?.computeCurrentVelocity(1000)
                    val vy = velocityTracker?.yVelocity ?: 0f
                    if (abs(vy) > 250f) {
                        val startY = dryInkView.transform.translationY.toInt()
                        val totalH = dryInkView.totalDocumentHeight * dryInkView.transform.scale
                        val minY = (h - totalH - 120f).coerceAtMost(0f).toInt()
                        val maxY = 60
                        scroller.fling(0, startY, 0, vy.toInt(), 0, 0, minY, maxY, 0, 100)
                        postInvalidateOnAnimation()
                    }
                } else if (isPageCurling) {
                    velocityTracker?.computeCurrentVelocity(1000)
                    val vx = velocityTracker?.xVelocity ?: 0f
                    val commitThreshold = 0.38f // 38% drag distance threshold

                    val isCommit = if (dryInkView.curlDirection == CurlDirection.FORWARD) {
                        dryInkView.curlProgress >= commitThreshold || vx < -900f
                    } else {
                        dryInkView.curlProgress >= commitThreshold || vx > 900f
                    }

                    animatePageCurl(commit = isCommit, direction = dryInkView.curlDirection)
                } else {
                    val moveDist = hypot(screenX - fingerStartX, screenY - fingerStartY)
                    if (moveDist < touchSlop) {
                        // Edge Tap Navigation (15% edge zones)
                        if (screenX > w * 0.85f && dryInkView.currentPdfPageIndex < pageEngine.pageCount - 1) {
                            animateEdgeFlip(CurlDirection.FORWARD)
                        } else if (screenX < w * 0.15f && dryInkView.currentPdfPageIndex > 0) {
                            animateEdgeFlip(CurlDirection.BACKWARD)
                        } else {
                            // Center tap: dismiss active word highlight if any
                            if (dryInkView.selectedWordRect != null) {
                                dryInkView.selectedWordRect = null
                                dryInkView.invalidate()
                            }
                        }
                    } else if (isFixedScreen || dryInkView.transform.scale <= baseFitScale * 1.15f) {
                        autoFitPage(w, h)
                    }
                }

                isTrackingFinger = false
            }
            MotionEvent.ACTION_CANCEL -> {
                cancelPendingLongPress()
                if (isPageCurling) {
                    animatePageCurl(commit = false, direction = dryInkView.curlDirection)
                }
                isTrackingFinger = false
            }
        }
    }

    private fun handleTranslateModeGesture(
        event: MotionEvent,
        pointerIndex: Int,
        screenX: Float,
        screenY: Float
    ) {
        val action = event.actionMasked
        val touchSlop = ViewConfiguration.get(context).scaledTouchSlop.toFloat()

        when (action) {
            MotionEvent.ACTION_DOWN -> {
                fingerStartX = screenX
                fingerStartY = screenY
                scheduleLongPressLookup(screenX, screenY)
            }
            MotionEvent.ACTION_MOVE -> {
                if (hypot(screenX - fingerStartX, screenY - fingerStartY) > touchSlop) {
                    cancelPendingLongPress()
                }
            }
            MotionEvent.ACTION_UP -> {
                if (hypot(screenX - fingerStartX, screenY - fingerStartY) < touchSlop && !hasFiredLongPress) {
                    cancelPendingLongPress()
                    dryInkView.transform.screenToWorld(screenX, screenY, tempPoint)
                    val hitWord = pageEngine.findWordAt(tempPoint.x, tempPoint.y, dryInkView.currentPdfPageIndex, maxDistance = 48f)
                    if (hitWord != null) {
                        performHapticFeedback(android.view.HapticFeedbackConstants.LONG_PRESS)
                        dryInkView.selectedWordRect = hitWord.boundsInPoints
                        dryInkView.invalidate()
                        onWordSelected?.invoke(hitWord.text, screenX, screenY)
                    }
                }
            }
            MotionEvent.ACTION_CANCEL -> {
                cancelPendingLongPress()
            }
        }
    }

    private fun handleMultiFingerGesture(event: MotionEvent) {
        cancelPendingLongPress()
        if (isFixedScreen) {
            // Viewport locked to screen when Fixed Screen is ON
            return
        }
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
