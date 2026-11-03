package com.antigravity.note.inkengine.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import androidx.ink.brush.StockBrushes
import androidx.ink.rendering.android.canvas.CanvasStrokeRenderer
import androidx.ink.strokes.Stroke
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.inkengine.lasso.LassoTool
import com.antigravity.note.inkengine.pdf.PdfTiler

/**
 * Underlying view responsible for rendering finalized "dry" ink strokes.
 * Uses hardware-accelerated Canvas with CanvasStrokeRenderer.
 */
class DryInkCanvasView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    val strokes = mutableListOf<Stroke>()
    private val strokeRenderer: CanvasStrokeRenderer = CanvasStrokeRenderer.create()
    val transform = CanvasTransform()
    var currentTemplate: PaperTemplate = PaperTemplate.RULED
        private set

    // Phase 4 Tools & Background Tiling
    var lassoTool: LassoTool? = null
    var pdfTiler: PdfTiler? = null
    var currentPdfPageIndex: Int = 0
    private val viewportRect = RectF()

    // Phase 5 Search Match Highlights
    val searchHighlights = mutableListOf<RectF>()
    private val searchHighlightFillPaint by lazy {
        Paint().apply {
            color = Color.parseColor("#40FFEB3B")
            style = Paint.Style.FILL
        }
    }
    private val searchHighlightStrokePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#FBC02D")
            style = Paint.Style.STROKE
            strokeWidth = 3f
        }
    }

    // Pre-allocated objects for zero allocations in onDraw
    private val identityMatrix = Matrix()
    private val paperPaint = Paint().apply {
        color = Color.parseColor("#FCFAF6")
        style = Paint.Style.FILL
    }
    private val gridLinePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#15000000")
        strokeWidth = 1.5f
    }
    private val marginLinePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#25D32F2F")
        strokeWidth = 2.0f
    }
    private val dotPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#35000000")
        style = Paint.Style.FILL
    }
    private val eraseQueryRect = RectF()

    init {
        // Ensure hardware acceleration is enabled
        setLayerType(LAYER_TYPE_HARDWARE, null)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // Draw paper background
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paperPaint)

        canvas.save()
        canvas.concat(transform.worldToScreenMatrix)

        // Draw background PDF tiles if loaded
        val tiler = pdfTiler
        if (tiler != null && tiler.pageCount > 0) {
            viewportRect.set(0f, 0f, width.toFloat(), height.toFloat())
            transform.screenToWorld(viewportRect)
            tiler.drawVisibleTiles(
                canvas = canvas,
                pageIndex = currentPdfPageIndex,
                viewportRect = viewportRect,
                zoomScale = transform.scale,
                onTileLoaded = { postInvalidateOnAnimation() }
            )
        } else {
            // Draw subtle ruled lines / grid
            drawPaperGrid(canvas)
        }

        // Draw dry vector strokes (2-pass: highlighters first so text stays crisp on top)
        val highlighterFamily = StockBrushes.highlighter()
        for (i in 0 until strokes.size) {
            val stroke = strokes[i]
            if (stroke.brush.family == highlighterFamily) {
                strokeRenderer.draw(canvas, stroke, identityMatrix)
            }
        }
        for (i in 0 until strokes.size) {
            val stroke = strokes[i]
            if (stroke.brush.family != highlighterFamily) {
                strokeRenderer.draw(canvas, stroke, identityMatrix)
            }
        }

        // Draw search match highlights
        if (searchHighlights.isNotEmpty()) {
            for (i in 0 until searchHighlights.size) {
                val rect = searchHighlights[i]
                canvas.drawRoundRect(rect, 8f, 8f, searchHighlightFillPaint)
                canvas.drawRoundRect(rect, 8f, 8f, searchHighlightStrokePaint)
            }
        }

        // Draw lasso selection overlay if active
        lassoTool?.draw(canvas)

        canvas.restore()
    }

    fun setSearchHighlights(highlights: List<RectF>) {
        searchHighlights.clear()
        searchHighlights.addAll(highlights)
        invalidate()
    }

    fun clearSearchHighlights() {
        searchHighlights.clear()
        invalidate()
    }

    fun setPaperTemplate(template: PaperTemplate) {
        if (currentTemplate != template) {
            currentTemplate = template
            invalidate()
        }
    }

    fun loadStrokes(newStrokes: List<Stroke>) {
        strokes.clear()
        val unique = mutableListOf<Stroke>()
        for (s in newStrokes) {
            val sBox = s.shape.computeBoundingBox()
            val isDup = unique.any { u ->
                val uBox = u.shape.computeBoundingBox()
                u.inputs.size == s.inputs.size &&
                u.brush.colorIntArgb == s.brush.colorIntArgb &&
                sBox != null && uBox != null &&
                kotlin.math.abs(sBox.xMin - uBox.xMin) < 0.01f &&
                kotlin.math.abs(sBox.yMin - uBox.yMin) < 0.01f &&
                kotlin.math.abs(sBox.xMax - uBox.xMax) < 0.01f &&
                kotlin.math.abs(sBox.yMax - uBox.yMax) < 0.01f
            }
            if (!isDup) unique.add(s)
        }
        strokes.addAll(unique)
        invalidate()
    }

    var isInfiniteCanvas: Boolean = true

    private fun drawPaperGrid(canvas: Canvas) {
        if (isInfiniteCanvas) {
            viewportRect.set(0f, 0f, width.toFloat(), height.toFloat())
            transform.screenToWorld(viewportRect)
            PaperBackgroundRenderer.drawInfinitePaper(canvas, currentTemplate, viewportRect)
        } else {
            val virtualWidth = 2400f
            val virtualHeight = 3400f
            PaperBackgroundRenderer.drawPaper(canvas, currentTemplate, virtualWidth, virtualHeight)
        }
    }

    /**
     * Erase any stroke near the world coordinate (worldX, worldY).
     * Returns true if any stroke was removed.
     */
    fun eraseStrokesAt(worldX: Float, worldY: Float, eraseRadius: Float): List<Stroke> {
        val removed = mutableListOf<Stroke>()
        val eraseRadiusSq = eraseRadius * eraseRadius

        val iterator = strokes.iterator()
        while (iterator.hasNext()) {
            val stroke = iterator.next()
            val bounds = stroke.shape.computeBoundingBox()
            if (bounds != null) {
                // Quick bounding box rejection
                if (worldX >= bounds.xMin - eraseRadius &&
                    worldX <= bounds.xMax + eraseRadius &&
                    worldY >= bounds.yMin - eraseRadius &&
                    worldY <= bounds.yMax + eraseRadius
                ) {
                    // Check if stroke is small or if eraser is near any sampled point
                    val boxW = bounds.xMax - bounds.xMin
                    val boxH = bounds.yMax - bounds.yMin
                    var hit = (boxW <= eraseRadius * 2.5f && boxH <= eraseRadius * 2.5f)

                    if (!hit) {
                        val inputs = stroke.inputs
                        val step = (inputs.size / 40).coerceAtLeast(1)
                        for (i in 0 until inputs.size step step) {
                            val pt = inputs.get(i)
                            val dx = pt.x - worldX
                            val dy = pt.y - worldY
                            if (dx * dx + dy * dy <= eraseRadiusSq) {
                                hit = true
                                break
                            }
                        }
                    }

                    if (hit) {
                        removed.add(stroke)
                        iterator.remove()
                    }
                }
            }
        }

        if (removed.isNotEmpty()) {
            invalidate()
        }
        return removed
    }

    fun addStroke(stroke: Stroke) {
        strokes.add(stroke)
        invalidate()
    }

    fun addStrokes(newStrokes: List<Stroke>) {
        strokes.addAll(newStrokes)
        invalidate()
    }

    fun removeStrokes(strokesToRemove: List<Stroke>) {
        strokes.removeAll(strokesToRemove)
        invalidate()
    }

    fun clearAllStrokes() {
        strokes.clear()
        invalidate()
    }
}
