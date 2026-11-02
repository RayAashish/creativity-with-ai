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

        // Draw dry vector strokes
        for (i in 0 until strokes.size) {
            val stroke = strokes[i]
            strokeRenderer.draw(canvas, stroke, identityMatrix)
        }

        // Draw lasso selection overlay if active
        lassoTool?.draw(canvas)

        canvas.restore()
    }

    fun setPaperTemplate(template: PaperTemplate) {
        if (currentTemplate != template) {
            currentTemplate = template
            invalidate()
        }
    }

    fun loadStrokes(newStrokes: List<Stroke>) {
        strokes.clear()
        strokes.addAll(newStrokes)
        invalidate()
    }

    private fun drawPaperGrid(canvas: Canvas) {
        val virtualWidth = 4000f
        val virtualHeight = 6000f

        when (currentTemplate) {
            PaperTemplate.BLANK -> {
                // Pure clean paper
            }
            PaperTemplate.RULED -> {
                val lineSpacing = 44f
                var y = 140f
                while (y < virtualHeight) {
                    canvas.drawLine(0f, y, virtualWidth, y, gridLinePaint)
                    y += lineSpacing
                }
                // Vertical margin line
                canvas.drawLine(180f, 0f, 180f, virtualHeight, marginLinePaint)
            }
            PaperTemplate.GRID -> {
                val gridSize = 36f
                var y = gridSize
                while (y < virtualHeight) {
                    canvas.drawLine(0f, y, virtualWidth, y, gridLinePaint)
                    y += gridSize
                }
                var x = gridSize
                while (x < virtualWidth) {
                    canvas.drawLine(x, 0f, x, virtualHeight, gridLinePaint)
                    x += gridSize
                }
            }
            PaperTemplate.DOT -> {
                val dotSpacing = 36f
                var y = dotSpacing
                while (y < virtualHeight) {
                    var x = dotSpacing
                    while (x < virtualWidth) {
                        canvas.drawCircle(x, y, 1.5f, dotPaint)
                        x += dotSpacing
                    }
                    y += dotSpacing
                }
            }
            PaperTemplate.CORNELL -> {
                val cueColumnX = 320f
                val summaryY = 5200f
                val lineSpacing = 44f

                // Cue column line
                canvas.drawLine(cueColumnX, 140f, cueColumnX, summaryY, marginLinePaint)
                // Top header line
                canvas.drawLine(0f, 140f, virtualWidth, 140f, marginLinePaint)
                // Bottom summary separator
                canvas.drawLine(0f, summaryY, virtualWidth, summaryY, marginLinePaint)

                // Ruled lines inside note area
                var y = 140f + lineSpacing
                while (y < summaryY) {
                    canvas.drawLine(cueColumnX, y, virtualWidth, y, gridLinePaint)
                    y += lineSpacing
                }
            }
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
                    // Stroke hit
                    removed.add(stroke)
                    iterator.remove()
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
