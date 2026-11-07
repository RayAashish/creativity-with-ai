package com.readmaster.app.engine.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import androidx.ink.rendering.android.canvas.CanvasStrokeRenderer
import androidx.ink.strokes.Stroke
import com.readmaster.app.engine.eraser.EraserMode
import com.readmaster.app.engine.eraser.PrecisionEraser
import com.readmaster.app.engine.eraser.SpatialStrokeIndex
import com.readmaster.app.engine.lasso.LassoTool
import com.readmaster.app.engine.pdf.PdfTiler

data class EraseModification(
    val removedStrokes: List<Stroke> = emptyList(),
    val addedStrokes: List<Stroke> = emptyList(),
    val replacements: List<StrokeReplacement> = emptyList()
)

data class StrokeReplacement(
    val oldStroke: Stroke,
    val newStrokes: List<Stroke>
)

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

    var lassoTool: LassoTool? = null
    var pdfTiler: PdfTiler? = null
    var currentPdfPageIndex: Int = 0
        set(value) {
            field = value
            invalidate()
        }

    private val viewportRect = RectF()
    private val identityMatrix = Matrix()

    private val paperPaint = Paint().apply {
        color = Color.parseColor("#FCFAF6")
        style = Paint.Style.FILL
    }

    private val pdfPageShadowPaint = Paint().apply {
        color = Color.parseColor("#20000000")
        style = Paint.Style.FILL
    }

    init {
        setLayerType(LAYER_TYPE_HARDWARE, null)
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

        // Draw background canvas
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paperPaint)

        canvas.save()
        canvas.concat(transform.worldToScreenMatrix)

        val tiler = pdfTiler
        if (tiler != null && tiler.pageCount > 0) {
            // Draw page border/shadow in world coordinates
            val pageSize = tiler.getPageSize(currentPdfPageIndex)
            if (pageSize != null) {
                val (pw, ph) = pageSize
                canvas.drawRect(4f, 4f, pw.toFloat() + 8f, ph.toFloat() + 8f, pdfPageShadowPaint)
                canvas.drawRect(0f, 0f, pw.toFloat(), ph.toFloat(), paperPaint)
            }

            viewportRect.set(0f, 0f, width.toFloat(), height.toFloat())
            transform.screenToWorld(viewportRect)

            tiler.drawVisibleTiles(
                canvas = canvas,
                pageIndex = currentPdfPageIndex,
                viewportRect = viewportRect,
                zoomScale = transform.scale,
                onTileLoaded = { postInvalidateOnAnimation() }
            )
        }

        // Draw dry vector strokes (highlighters first underneath, opaque pen strokes on top)
        for (i in 0 until strokes.size) {
            val stroke = strokes[i]
            if (isHighlighterStroke(stroke)) {
                strokeRenderer.draw(canvas, stroke, identityMatrix)
            }
        }
        for (i in 0 until strokes.size) {
            val stroke = strokes[i]
            if (!isHighlighterStroke(stroke)) {
                strokeRenderer.draw(canvas, stroke, identityMatrix)
            }
        }

        // Draw lasso selection overlay if active
        lassoTool?.draw(canvas)

        canvas.restore()
    }
}
