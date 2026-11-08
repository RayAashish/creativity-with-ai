package com.readmaster.app.engine.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import androidx.ink.rendering.android.canvas.CanvasStrokeRenderer
import androidx.ink.strokes.Stroke
import com.readmaster.app.engine.eraser.EraserMode
import com.readmaster.app.engine.eraser.PrecisionEraser
import com.readmaster.app.engine.eraser.SpatialStrokeIndex
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

class DryInkCanvasView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    val strokes = mutableListOf<Stroke>()
    val spatialIndex = SpatialStrokeIndex(cellSize = 256f)
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

    private val deskBackgroundPaint = Paint().apply {
        color = Color.parseColor("#EBECEF") // Soft reading desk background
        style = Paint.Style.FILL
    }

    private val paperPaint = Paint().apply {
        color = Color.WHITE
        style = Paint.Style.FILL
    }

    private val pageShadowPaint = Paint().apply {
        color = Color.parseColor("#25000000") // Realistic page shadow
        style = Paint.Style.FILL
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

    fun getPageTopOffset(pageIndex: Int): Float {
        if (pageOffsetsY.isEmpty()) updatePageLayout()
        return pageOffsetsY.getOrElse(pageIndex) { 0f }
    }

    private fun isHighlighterStroke(stroke: Stroke): Boolean {
        val alpha = (stroke.brush.colorIntArgb ushr 24) and 0xFF
        return alpha <= 0x99
    }

    fun loadStrokes(newStrokes: List<Stroke>) {
        strokes.clear()
        strokes.addAll(newStrokes)
        spatialIndex.rebuild(strokes)
        invalidate()
    }

    fun addStrokes(newStrokes: List<Stroke>) {
        strokes.addAll(newStrokes)
        for (s in newStrokes) {
            spatialIndex.add(s)
        }
        invalidate()
    }

    fun replaceStrokes(oldStrokes: List<Stroke>, newStrokes: List<Stroke>) {
        if (oldStrokes.isEmpty() && newStrokes.isEmpty()) return
        for (old in oldStrokes) {
            strokes.remove(old)
            spatialIndex.remove(old)
        }
        for (newS in newStrokes) {
            strokes.add(newS)
            spatialIndex.add(newS)
        }
        invalidate()
    }

    fun removeStrokes(strokesToRemove: List<Stroke>) {
        for (s in strokesToRemove) {
            strokes.remove(s)
            spatialIndex.remove(s)
        }
        invalidate()
    }

    fun clearAllStrokes() {
        strokes.clear()
        spatialIndex.clear()
        invalidate()
    }

    fun eraseStrokesWithDetails(
        worldX: Float,
        worldY: Float,
        eraseRadius: Float,
        mode: EraserMode = EraserMode.PRECISION
    ): EraseModification {
        spatialIndex.query(
            worldX - eraseRadius,
            worldY - eraseRadius,
            worldX + eraseRadius,
            worldY + eraseRadius,
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
                strokes.remove(stroke)
                spatialIndex.remove(stroke)
                replacements.add(StrokeReplacement(stroke, emptyList()))
            } else {
                val cutResult = PrecisionEraser.cutStroke(stroke, worldX, worldY, eraseRadius)
                if (cutResult.wasCut) {
                    removed.add(stroke)
                    strokes.remove(stroke)
                    spatialIndex.remove(stroke)

                    for (surviving in cutResult.survivingStrokes) {
                        added.add(surviving)
                        strokes.add(surviving)
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
            val targetWidth = width.toFloat() * transform.scale

            if (readingMode == ReadingMode.CONTINUOUS_SCROLL) {
                if (pageOffsetsY.isEmpty()) updatePageLayout()
                val visibleRect = RectF(0f, 0f, width.toFloat(), height.toFloat())
                transform.screenToWorld(visibleRect)

                for (i in 0 until engine.pageCount) {
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

                        engine.drawPage(
                            canvas = canvas,
                            pageIndex = i,
                            targetWidth = targetWidth,
                            onPageLoaded = { postInvalidateOnAnimation() }
                        )

                        canvas.restore()
                    }
                }
            } else {
                // BOOK_FLIP mode: Single page centered
                val pageSize = engine.getPageSize(currentPdfPageIndex)
                if (pageSize != null) {
                    val (pw, ph) = pageSize
                    val pwF = pw.toFloat()
                    val phF = ph.toFloat()

                    // Realistic book page drop shadow
                    canvas.drawRoundRect(4f, 6f, pwF + 8f, phF + 10f, 6f, 6f, pageShadowPaint)
                    canvas.drawRect(0f, 0f, pwF, phF, paperPaint)

                    // Draw complete, crisp unified page bitmap without seams
                    engine.drawPage(
                        canvas = canvas,
                        pageIndex = currentPdfPageIndex,
                        targetWidth = targetWidth,
                        onPageLoaded = { postInvalidateOnAnimation() }
                    )

                    // Highlight selected word if active
                    selectedWordRect?.let { r ->
                        canvas.drawRoundRect(r, 4f, 4f, wordHighlightFillPaint)
                        canvas.drawRoundRect(r, 4f, 4f, wordHighlightStrokePaint)
                    }
                }
            }
        }

        // Draw dry vector strokes
        // 1. Highlighters: Rendered using MULTIPLY blend mode so text beneath stays 100% black and razor-sharp!
        val hasHighlighters = strokes.any { isHighlighterStroke(it) }
        if (hasHighlighters) {
            val highlighterPaint = Paint().apply {
                xfermode = PorterDuffXfermode(PorterDuff.Mode.MULTIPLY)
            }
            val saveCount = canvas.saveLayer(null, highlighterPaint)
            for (i in 0 until strokes.size) {
                val stroke = strokes[i]
                if (isHighlighterStroke(stroke)) {
                    strokeRenderer.draw(canvas, stroke, identityMatrix)
                }
            }
            canvas.restoreToCount(saveCount)
        }

        // 2. Opaque Pen / Marker strokes on top
        for (i in 0 until strokes.size) {
            val stroke = strokes[i]
            if (!isHighlighterStroke(stroke)) {
                strokeRenderer.draw(canvas, stroke, identityMatrix)
            }
        }

        // 3. Draw lasso selection overlay if active
        lassoTool?.draw(canvas)

        canvas.restore()
    }
}
