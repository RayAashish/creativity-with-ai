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

        // Draw subtle ruled lines / grid
        drawPaperGrid(canvas)

        // Draw dry vector strokes
        for (i in 0 until strokes.size) {
            val stroke = strokes[i]
            strokeRenderer.draw(canvas, stroke, identityMatrix)
        }

        canvas.restore()
    }

    private fun drawPaperGrid(canvas: Canvas) {
        val gridSize = 40f
        val virtualWidth = 4000f
        val virtualHeight = 6000f

        var y = gridSize
        while (y < virtualHeight) {
            canvas.drawLine(0f, y, virtualWidth, y, gridLinePaint)
            y += gridSize
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
