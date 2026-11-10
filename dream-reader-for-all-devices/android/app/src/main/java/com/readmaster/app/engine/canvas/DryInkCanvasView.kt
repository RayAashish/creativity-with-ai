package com.readmaster.app.engine.canvas

import android.content.Context
import android.graphics.BlendMode
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.graphics.Shader
import android.os.Build
import android.util.AttributeSet
import android.view.View
import androidx.ink.brush.StockBrushes
import androidx.ink.rendering.android.canvas.CanvasStrokeRenderer
import androidx.ink.strokes.Stroke
import com.readmaster.app.engine.eraser.EraserMode
import com.readmaster.app.engine.eraser.PrecisionEraser
import com.readmaster.app.engine.eraser.SpatialStrokeIndex
import com.readmaster.app.engine.lasso.LassoMode
import com.readmaster.app.engine.lasso.LassoTool
import com.readmaster.app.engine.pdf.PdfPageEngine

data class EraseModification(
    val removedStrokes: List<Stroke> = emptyList(),
    val addedStrokes: List<Stroke> = emptyList(),
    val replacements: List<StrokeReplacement> = emptyList()
)

data class StrokeReplacement(
    val oldStroke: Stroke,
    val newStrokes: List<Stroke>
)

enum class ReadingMode {
    BOOK_FLIP,           // Classic single-page book reading with swipe / tap page turn
    CONTINUOUS_SCROLL    // Smooth vertical scroll through entire book
}

enum class CurlDirection {
    NONE,
    FORWARD,
    BACKWARD
}

class DryInkCanvasView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    // Per-page isolated stroke storage: Key = PDF Page Index -> Strokes in page-local coordinates [0..pw, 0..ph]
    val pageStrokesMap = HashMap<Int, MutableList<Stroke>>()
    private val pageSpatialIndexMap = HashMap<Int, SpatialStrokeIndex>()

    // Compatibility getter: returns strokes of the active book page
    val strokes: List<Stroke>
        get() = getPageStrokes(currentPdfPageIndex)

    private val queryCandidates = ArrayList<Stroke>(32)
    private val strokeRenderer: CanvasStrokeRenderer = CanvasStrokeRenderer.create()
    val transform = CanvasTransform()

    var readingMode: ReadingMode = ReadingMode.BOOK_FLIP
        set(value) {
            field = value
            invalidate()
        }

    val pageOffsetsY = mutableListOf<Float>()
    var totalDocumentHeight: Float = 0f
        private set

    var lassoTool: LassoTool? = null
    var pageEngine: PdfPageEngine? = null
        set(value) {
            field = value
            updatePageLayout()
        }

    var currentPdfPageIndex: Int = 0
        set(value) {
            field = value
            selectedWordRect = null
            invalidate()
        }

    // Selected word highlight
    var selectedWordRect: RectF? = null
        set(value) {
            field = value
            invalidate()
        }

    private val wordHighlightFillPaint = Paint().apply {
        color = Color.parseColor("#4D3B82F6") // 30% translucent blue
        style = Paint.Style.FILL
    }
    private val wordHighlightStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#3B82F6")
        style = Paint.Style.STROKE
        strokeWidth = 2f
    }

    private val identityMatrix = Matrix()
    private val scratchPageToScreenMatrix = Matrix()

    init {
        // Explicitly enable GPU hardware acceleration layer for retina-sharp anti-aliasing
        setLayerType(LAYER_TYPE_HARDWARE, null)
    }

    private val deskBackgroundPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#EBECEF") // Soft reading desk background
        style = Paint.Style.FILL
    }

    private val paperPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        style = Paint.Style.FILL
    }

    private val pageShadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#25000000") // Realistic page shadow
        style = Paint.Style.FILL
    }

    // Dedicated Highlighter Layer Paint: Multiplies translucent ink with paper so printed text is NEVER occluded
    private val highlighterLayerPaint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            blendMode = BlendMode.MULTIPLY
        } else {
            xfermode = PorterDuffXfermode(PorterDuff.Mode.MULTIPLY)
        }
    }
    private val highlighterBounds = RectF()

    // Realistic Page-Curl state & cached path buffers
    var curlDirection: CurlDirection = CurlDirection.NONE
    var curlProgress: Float = 0f
    var curlTouchY: Float = 0f

    private val flapBackPaperPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#FDFBF7") // Creamy warm back of page
        style = Paint.Style.FILL
    }

    private val curlFrontPath = Path()
    private val curlRevealedPath = Path()
    private val curlFlapPath = Path()
    private val curlShadowPath = Path()

    fun updatePageCurl(direction: CurlDirection, progress: Float, touchY: Float) {
        curlDirection = direction
        curlProgress = progress.coerceIn(0f, 1f)
        curlTouchY = touchY
        invalidate()
    }

    fun resetPageCurl() {
        curlDirection = CurlDirection.NONE
        curlProgress = 0f
        invalidate()
    }

    fun updatePageLayout() {
        pageOffsetsY.clear()
        val engine = pageEngine ?: return
        var currentY = 0f
        val gap = 36f
        for (i in 0 until engine.pageCount) {
            pageOffsetsY.add(currentY)
            val size = engine.getPageSize(i)
            val h = size?.second?.toFloat() ?: 792f
            currentY += h + gap
        }
        totalDocumentHeight = currentY
    }

    fun findCenterPageIndex(): Int {
        if (pageOffsetsY.isEmpty()) updatePageLayout()
        if (pageOffsetsY.isEmpty() || readingMode == ReadingMode.BOOK_FLIP) return currentPdfPageIndex
        val centerWorldY = (-transform.translationY + height / 2f) / transform.scale
        for (i in pageOffsetsY.indices.reversed()) {
            if (centerWorldY >= pageOffsetsY[i]) {
                return i
            }
        }
        return 0
    }

    fun findPageIndexAtWorldY(worldY: Float): Int {
        if (pageOffsetsY.isEmpty()) updatePageLayout()
        for (i in pageOffsetsY.indices.reversed()) {
            if (worldY >= pageOffsetsY[i]) {
                return i
            }
        }
        return 0
    }

    fun getPageTopOffset(pageIndex: Int): Float {
        if (pageOffsetsY.isEmpty()) updatePageLayout()
        return pageOffsetsY.getOrElse(pageIndex) { 0f }
    }

    fun isHighlighterStroke(stroke: Stroke): Boolean {
        if (stroke.brush.family == StockBrushes.highlighter()) return true
        val familyId = stroke.brush.family.clientBrushFamilyId
        if (familyId.contains("highlighter", ignoreCase = true)) return true
        val alpha = (stroke.brush.colorIntArgb ushr 24) and 0xFF
        return alpha <= 0x99
    }

    fun getPageStrokes(pageIndex: Int): MutableList<Stroke> {
        return pageStrokesMap.getOrPut(pageIndex) { mutableListOf() }
    }

    fun getPageSpatialIndex(pageIndex: Int): SpatialStrokeIndex {
        return pageSpatialIndexMap.getOrPut(pageIndex) { SpatialStrokeIndex(cellSize = 256f) }
    }

    fun addPageStrokes(pageIndex: Int, newStrokes: List<Stroke>) {
        val pageStrokes = getPageStrokes(pageIndex)
        val spatialIndex = getPageSpatialIndex(pageIndex)
        pageStrokes.addAll(newStrokes)
        for (s in newStrokes) {
            spatialIndex.add(s)
        }
        invalidate()
    }

    fun removePageStrokes(pageIndex: Int, strokesToRemove: List<Stroke>) {
        val pageStrokes = getPageStrokes(pageIndex)
        val spatialIndex = getPageSpatialIndex(pageIndex)
        for (s in strokesToRemove) {
            pageStrokes.remove(s)
            spatialIndex.remove(s)
        }
        invalidate()
    }

    fun replacePageStrokes(pageIndex: Int, oldStrokes: List<Stroke>, newStrokes: List<Stroke>) {
        if (oldStrokes.isEmpty() && newStrokes.isEmpty()) return
        val pageStrokes = getPageStrokes(pageIndex)
        val spatialIndex = getPageSpatialIndex(pageIndex)
        for (old in oldStrokes) {
            pageStrokes.remove(old)
            spatialIndex.remove(old)
        }
        for (newS in newStrokes) {
            pageStrokes.add(newS)
            spatialIndex.add(newS)
        }
        invalidate()
    }

    fun clearPageStrokes(pageIndex: Int) {
        pageStrokesMap[pageIndex]?.clear()
        pageSpatialIndexMap[pageIndex]?.clear()
        invalidate()
    }

    fun clearAllStrokes() {
        pageStrokesMap.clear()
        pageSpatialIndexMap.clear()
        invalidate()
    }

    fun eraseStrokesWithDetails(
        pageIndex: Int,
        localX: Float,
        localY: Float,
        eraseRadius: Float,
        mode: EraserMode = EraserMode.PRECISION
    ): EraseModification {
        val pageStrokes = getPageStrokes(pageIndex)
        val spatialIndex = getPageSpatialIndex(pageIndex)

        spatialIndex.query(
            localX - eraseRadius,
            localY - eraseRadius,
            localX + eraseRadius,
            localY + eraseRadius,
            queryCandidates
        )
        if (queryCandidates.isEmpty()) {
            return EraseModification()
        }

        val removed = mutableListOf<Stroke>()
        val added = mutableListOf<Stroke>()
        val replacements = mutableListOf<StrokeReplacement>()

        for (i in 0 until queryCandidates.size) {
            val stroke = queryCandidates[i]
            if (mode == EraserMode.HIGHLIGHTER && !isHighlighterStroke(stroke)) {
                continue
            }

            if (mode == EraserMode.STROKE) {
                removed.add(stroke)
                pageStrokes.remove(stroke)
                spatialIndex.remove(stroke)
                replacements.add(StrokeReplacement(stroke, emptyList()))
            } else {
                val cutResult = PrecisionEraser.cutStroke(stroke, localX, localY, eraseRadius)
                if (cutResult.wasCut) {
                    removed.add(stroke)
                    pageStrokes.remove(stroke)
                    spatialIndex.remove(stroke)

                    for (surviving in cutResult.survivingStrokes) {
                        added.add(surviving)
                        pageStrokes.add(surviving)
                        spatialIndex.add(surviving)
                    }
                    replacements.add(StrokeReplacement(stroke, cutResult.survivingStrokes))
                }
            }
        }

        if (removed.isNotEmpty() || added.isNotEmpty()) {
            invalidate()
        }
        return EraseModification(
            removedStrokes = removed,
            addedStrokes = added,
            replacements = replacements
        )
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // Draw reading desk background
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), deskBackgroundPaint)

        canvas.save()
        canvas.concat(transform.worldToScreenMatrix)

        val engine = pageEngine
        if (engine != null && engine.pageCount > 0) {
            if (readingMode == ReadingMode.CONTINUOUS_SCROLL) {
                if (pageOffsetsY.isEmpty()) updatePageLayout()
                val visibleRect = RectF(0f, 0f, width.toFloat(), height.toFloat())
                transform.screenToWorld(visibleRect)

                val startPage = (findPageIndexAtWorldY(visibleRect.top) - 1).coerceAtLeast(0)
                val endPage = (findPageIndexAtWorldY(visibleRect.bottom) + 1).coerceAtMost(engine.pageCount - 1)

                for (i in startPage..endPage) {
                    val pageTop = pageOffsetsY.getOrElse(i) { 0f }
                    val pageSize = engine.getPageSize(i) ?: continue
                    val (pw, ph) = pageSize
                    val pwF = pw.toFloat()
                    val phF = ph.toFloat()
                    val pageBottom = pageTop + phF

                    // Only render pages currently intersecting the viewport
                    if (pageBottom >= visibleRect.top && pageTop <= visibleRect.bottom) {
                        canvas.save()
                        canvas.translate(0f, pageTop)

                        canvas.drawRoundRect(4f, 6f, pwF + 8f, phF + 10f, 6f, 6f, pageShadowPaint)
                        canvas.drawRect(0f, 0f, pwF, phF, paperPaint)

                        val pageTargetWidth = pwF * transform.scale
                        engine.drawPage(
                            canvas = canvas,
                            pageIndex = i,
                            screenScale = pageTargetWidth,
                            onPageLoaded = { postInvalidateOnAnimation() }
                        )

                        // Draw dry vector strokes attached strictly to this page
                        drawPageStrokes(canvas, i)

                        canvas.restore()
                    }
                }
            } else {
                // BOOK_FLIP mode: Realistic Page Curl or Static Single Page
                val pageSize = engine.getPageSize(currentPdfPageIndex)
                val pwF = pageSize?.first?.toFloat() ?: 612f
                val phF = pageSize?.second?.toFloat() ?: 792f
                val pageTargetWidth = pwF * transform.scale

                if (curlDirection != CurlDirection.NONE && curlProgress > 0.001f) {
                    drawPageCurl(canvas, engine, pageTargetWidth)
                } else {
                    if (pageSize != null) {
                        // Realistic book page drop shadow
                        canvas.drawRoundRect(4f, 6f, pwF + 8f, phF + 10f, 6f, 6f, pageShadowPaint)
                        canvas.drawRect(0f, 0f, pwF, phF, paperPaint)

                        // Draw complete, crisp unified page bitmap without seams
                        engine.drawPage(
                            canvas = canvas,
                            pageIndex = currentPdfPageIndex,
                            screenScale = pageTargetWidth,
                            onPageLoaded = { postInvalidateOnAnimation() }
                        )

                        // Highlight selected word if active
                        selectedWordRect?.let { r ->
                            canvas.drawRoundRect(r, 4f, 4f, wordHighlightFillPaint)
                            canvas.drawRoundRect(r, 4f, 4f, wordHighlightStrokePaint)
                        }

                        // Draw dry vector strokes attached strictly to this page
                        drawPageStrokes(canvas, currentPdfPageIndex)
                    }
                }
            }
        }

        // Draw lasso selection overlay if active (translated by activePageTop in scroll mode)
        val lasso = lassoTool
        if (lasso != null && lasso.mode != LassoMode.IDLE) {
            canvas.save()
            if (readingMode == ReadingMode.CONTINUOUS_SCROLL) {
                canvas.translate(0f, lasso.activePageTop)
            }
            lasso.draw(canvas)
            canvas.restore()
        }

        canvas.restore()
    }

    /**
     * Renders a photorealistic dynamic page-curl folding in real-time.
     * The fold crease tracks touch progress; the underside flap renders warm cream paper with crease
     * gradient shading and drop shadows onto the revealed next or previous page.
     */
    private fun drawPageCurl(canvas: Canvas, engine: PdfPageEngine, targetWidth: Float) {
        val pageSize = engine.getPageSize(currentPdfPageIndex) ?: return
        val pw = pageSize.first.toFloat()
        val ph = pageSize.second.toFloat()

        // Base book drop shadow behind the page stack
        canvas.drawRoundRect(4f, 6f, pw + 8f, ph + 10f, 6f, 6f, pageShadowPaint)

        if (curlDirection == CurlDirection.FORWARD) {
            val targetIndex = currentPdfPageIndex + 1
            val hasNext = targetIndex < engine.pageCount

            // 1. Draw underneath page (Page N+1) if available, or clean white paper
            canvas.save()
            canvas.drawRect(0f, 0f, pw, ph, paperPaint)
            if (hasNext) {
                engine.drawPage(canvas, targetIndex, targetWidth) {}
                drawPageStrokes(canvas, targetIndex)
            }
            canvas.restore()

            // Fold crease geometry: moves from pw down to 0
            val X_F = pw * (1f - curlProgress)
            val X_E = 2f * X_F - pw

            // Subtle vertical angle based on finger Y relative to page center
            val touchNormY = if (ph > 0) (curlTouchY / ph).coerceIn(0.1f, 0.9f) else 0.5f
            val tiltOffset = (touchNormY - 0.5f) * (pw * 0.12f * (1f - curlProgress)).coerceIn(-pw * 0.15f, pw * 0.15f)
            val xfTop = (X_F + tiltOffset).coerceIn(0f, pw)
            val xfBottom = (X_F - tiltOffset).coerceIn(0f, pw)

            val xeTop = (2f * xfTop - pw)
            val xeBottom = (2f * xfBottom - pw)

            // 2. Draw front of current page (Page N) visible to left of fold
            curlFrontPath.reset()
            curlFrontPath.moveTo(0f, 0f)
            curlFrontPath.lineTo(xfTop, 0f)
            curlFrontPath.lineTo(xfBottom, ph)
            curlFrontPath.lineTo(0f, ph)
            curlFrontPath.close()

            canvas.save()
            canvas.clipPath(curlFrontPath)
            canvas.drawRect(0f, 0f, pw, ph, paperPaint)
            engine.drawPage(canvas, currentPdfPageIndex, targetWidth) {}
            selectedWordRect?.let { r ->
                canvas.drawRoundRect(r, 4f, 4f, wordHighlightFillPaint)
                canvas.drawRoundRect(r, 4f, 4f, wordHighlightStrokePaint)
            }
            drawPageStrokes(canvas, currentPdfPageIndex)
            canvas.restore()

            // 3. Drop shadow cast from fold crease onto revealed page (to right of fold)
            val shadowW = (pw * 0.08f).coerceIn(24f, 64f)
            curlShadowPath.reset()
            curlShadowPath.moveTo(xfTop, 0f)
            curlShadowPath.lineTo(xfTop + shadowW, 0f)
            curlShadowPath.lineTo(xfBottom + shadowW, ph)
            curlShadowPath.lineTo(xfBottom, ph)
            curlShadowPath.close()

            val foldShadowPaint = Paint().apply {
                shader = LinearGradient(
                    X_F, 0f, X_F + shadowW, 0f,
                    Color.argb(90, 0, 0, 0),
                    Color.TRANSPARENT,
                    Shader.TileMode.CLAMP
                )
            }
            canvas.save()
            curlRevealedPath.reset()
            curlRevealedPath.moveTo(xfTop, 0f)
            curlRevealedPath.lineTo(pw, 0f)
            curlRevealedPath.lineTo(pw, ph)
            curlRevealedPath.lineTo(xfBottom, ph)
            curlRevealedPath.close()
            canvas.clipPath(curlRevealedPath)
            canvas.drawPath(curlShadowPath, foldShadowPaint)
            canvas.restore()

            // 4. Draw curling flap (back of page N lifting up)
            if (X_F > X_E) {
                curlFlapPath.reset()
                curlFlapPath.moveTo(xfTop, 0f)
                curlFlapPath.lineTo(xeTop, 0f)
                curlFlapPath.lineTo(xeBottom, ph)
                curlFlapPath.lineTo(xfBottom, ph)
                curlFlapPath.close()

                // Drop shadow cast from flap edge onto front page
                val edgeShadowW = (pw * 0.06f).coerceIn(16f, 48f)
                curlShadowPath.reset()
                curlShadowPath.moveTo(xeTop - edgeShadowW, 0f)
                curlShadowPath.lineTo(xeTop, 0f)
                curlShadowPath.lineTo(xeBottom, ph)
                curlShadowPath.lineTo(xeBottom - edgeShadowW, ph)
                curlShadowPath.close()

                val edgeShadowPaint = Paint().apply {
                    shader = LinearGradient(
                        X_E, 0f, X_E - edgeShadowW, 0f,
                        Color.argb(80, 0, 0, 0),
                        Color.TRANSPARENT,
                        Shader.TileMode.CLAMP
                    )
                }
                canvas.save()
                canvas.clipPath(curlFrontPath)
                canvas.drawPath(curlShadowPath, edgeShadowPaint)
                canvas.restore()

                // Flap paper body
                canvas.save()
                canvas.clipRect(0f, 0f, pw, ph)
                canvas.clipPath(curlFlapPath)
                canvas.drawPath(curlFlapPath, flapBackPaperPaint)

                // Crease shadow on the flap
                val flapCurlShadowW = (pw * 0.14f).coerceIn(30f, 80f)
                val flapCurlPaint = Paint().apply {
                    shader = LinearGradient(
                        X_F, 0f, X_F - flapCurlShadowW, 0f,
                        intArrayOf(Color.argb(75, 0, 0, 0), Color.argb(20, 0, 0, 0), Color.TRANSPARENT),
                        floatArrayOf(0f, 0.45f, 1f),
                        Shader.TileMode.CLAMP
                    )
                }
                canvas.drawPath(curlFlapPath, flapCurlPaint)

                // Cylindrical highlight along bend
                val highlightPaint = Paint().apply {
                    shader = LinearGradient(
                        X_F - flapCurlShadowW * 0.25f, 0f, X_F - flapCurlShadowW * 0.65f, 0f,
                        intArrayOf(Color.TRANSPARENT, Color.argb(40, 255, 255, 255), Color.TRANSPARENT),
                        floatArrayOf(0f, 0.5f, 1f),
                        Shader.TileMode.CLAMP
                    )
                }
                canvas.drawPath(curlFlapPath, highlightPaint)
                canvas.restore()
            }
        } else if (curlDirection == CurlDirection.BACKWARD) {
            val targetIndex = currentPdfPageIndex - 1
            val hasPrev = targetIndex >= 0

            // 1. Draw Page N as underneath page
            canvas.save()
            canvas.drawRect(0f, 0f, pw, ph, paperPaint)
            engine.drawPage(canvas, currentPdfPageIndex, targetWidth) {}
            drawPageStrokes(canvas, currentPdfPageIndex)
            canvas.restore()

            if (hasPrev) {
                // Fold line moves from 0 to pw
                val X_F = pw * curlProgress
                val X_E = 2f * X_F

                val touchNormY = if (ph > 0) (curlTouchY / ph).coerceIn(0.1f, 0.9f) else 0.5f
                val tiltOffset = (touchNormY - 0.5f) * (pw * 0.12f * (1f - curlProgress)).coerceIn(-pw * 0.15f, pw * 0.15f)
                val xfTop = (X_F + tiltOffset).coerceIn(0f, pw)
                val xfBottom = (X_F - tiltOffset).coerceIn(0f, pw)

                val xeTop = 2f * xfTop
                val xeBottom = 2f * xfBottom

                // 2. Draw front of Page N-1 visible to left of fold
                curlFrontPath.reset()
                curlFrontPath.moveTo(0f, 0f)
                curlFrontPath.lineTo(xfTop, 0f)
                curlFrontPath.lineTo(xfBottom, ph)
                curlFrontPath.lineTo(0f, ph)
                curlFrontPath.close()

                canvas.save()
                canvas.clipPath(curlFrontPath)
                canvas.drawRect(0f, 0f, pw, ph, paperPaint)
                engine.drawPage(canvas, targetIndex, targetWidth) {}
                drawPageStrokes(canvas, targetIndex)
                canvas.restore()

                // 3. Drop shadow cast from fold crease to left onto Page N-1
                val shadowW = (pw * 0.08f).coerceIn(24f, 64f)
                val foldShadowPaint = Paint().apply {
                    shader = LinearGradient(
                        X_F, 0f, X_F - shadowW, 0f,
                        Color.argb(90, 0, 0, 0),
                        Color.TRANSPARENT,
                        Shader.TileMode.CLAMP
                    )
                }
                canvas.save()
                canvas.clipPath(curlFrontPath)
                canvas.drawRect(0f, 0f, pw, ph, foldShadowPaint)
                canvas.restore()

                // 4. Curling flap (back of page N-1) from X_F to X_E
                if (X_E > X_F) {
                    curlFlapPath.reset()
                    curlFlapPath.moveTo(xfTop, 0f)
                    curlFlapPath.lineTo(xeTop, 0f)
                    curlFlapPath.lineTo(xeBottom, ph)
                    curlFlapPath.lineTo(xfBottom, ph)
                    curlFlapPath.close()

                    // Drop shadow cast by flap edge to right onto Page N
                    val edgeShadowW = (pw * 0.06f).coerceIn(16f, 48f)
                    val edgeShadowPaint = Paint().apply {
                        shader = LinearGradient(
                            X_E, 0f, X_E + edgeShadowW, 0f,
                            Color.argb(80, 0, 0, 0),
                            Color.TRANSPARENT,
                            Shader.TileMode.CLAMP
                        )
                    }
                    canvas.save()
                    canvas.clipRect(0f, 0f, pw, ph)
                    canvas.drawRect(0f, 0f, pw, ph, edgeShadowPaint)
                    canvas.restore()

                    // Flap paper body
                    canvas.save()
                    canvas.clipRect(0f, 0f, pw, ph)
                    canvas.clipPath(curlFlapPath)
                    canvas.drawPath(curlFlapPath, flapBackPaperPaint)

                    // Crease shadow on the flap
                    val flapCurlShadowW = (pw * 0.14f).coerceIn(30f, 80f)
                    val flapCurlPaint = Paint().apply {
                        shader = LinearGradient(
                            X_F, 0f, X_F + flapCurlShadowW, 0f,
                            intArrayOf(Color.argb(75, 0, 0, 0), Color.argb(20, 0, 0, 0), Color.TRANSPARENT),
                            floatArrayOf(0f, 0.45f, 1f),
                            Shader.TileMode.CLAMP
                        )
                    }
                    canvas.drawPath(curlFlapPath, flapCurlPaint)

                    // Bend specular highlight
                    val highlightPaint = Paint().apply {
                        shader = LinearGradient(
                            X_F + flapCurlShadowW * 0.25f, 0f, X_F + flapCurlShadowW * 0.65f, 0f,
                            intArrayOf(Color.TRANSPARENT, Color.argb(40, 255, 255, 255), Color.TRANSPARENT),
                            floatArrayOf(0f, 0.5f, 1f),
                            Shader.TileMode.CLAMP
                        )
                    }
                    canvas.drawPath(curlFlapPath, highlightPaint)
                    canvas.restore()
                }
            }
        }
    }

    /**
     * Draws vector strokes belonging strictly to [pageIndex] in page-local coordinates.
     * Highlighters are drawn onto a bounded layer with BlendMode.MULTIPLY so printed black text stays 100% crisp & visible.
     */
    private fun drawPageStrokes(canvas: Canvas, pageIndex: Int) {
        val pageStrokes = pageStrokesMap[pageIndex] ?: return
        if (pageStrokes.isEmpty()) return

        // 1. Highlighters drawn with MULTIPLY blend mode so underlying printed text stays 100% crisp & legible
        var hasHighlighters = false
        highlighterBounds.setEmpty()
        for (i in 0 until pageStrokes.size) {
            val stroke = pageStrokes[i]
            if (isHighlighterStroke(stroke)) {
                hasHighlighters = true
                val box = stroke.shape.computeBoundingBox()
                if (box != null) {
                    if (highlighterBounds.isEmpty) {
                        highlighterBounds.set(box.xMin - 12f, box.yMin - 12f, box.xMax + 12f, box.yMax + 12f)
                    } else {
                        highlighterBounds.union(box.xMin - 12f, box.yMin - 12f, box.xMax + 12f, box.yMax + 12f)
                    }
                }
            }
        }

        if (hasHighlighters) {
            val saveCount = if (!highlighterBounds.isEmpty) {
                canvas.saveLayer(highlighterBounds, highlighterLayerPaint)
            } else {
                canvas.saveLayer(null, highlighterLayerPaint)
            }
            for (i in 0 until pageStrokes.size) {
                val stroke = pageStrokes[i]
                if (isHighlighterStroke(stroke)) {
                    strokeRenderer.draw(canvas, stroke, identityMatrix)
                }
            }
            canvas.restoreToCount(saveCount)
        }

        // 2. Opaque Pen / Marker strokes on top
        for (i in 0 until pageStrokes.size) {
            val stroke = pageStrokes[i]
            if (!isHighlighterStroke(stroke)) {
                strokeRenderer.draw(canvas, stroke, identityMatrix)
            }
        }
    }
}
