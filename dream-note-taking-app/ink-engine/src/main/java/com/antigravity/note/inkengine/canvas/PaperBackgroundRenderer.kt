package com.antigravity.note.inkengine.canvas

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import com.antigravity.note.document.model.PaperTemplate

/**
 * Shared renderer for paper backgrounds across the live canvas, PDF exporter, and PNG exporter.
 */
object PaperBackgroundRenderer {

    private val paperPaint by lazy {
        Paint().apply {
            color = Color.parseColor("#FCFAF6")
            style = Paint.Style.FILL
        }
    }

    private val gridLinePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#15000000")
            strokeWidth = 1.5f
        }
    }

    private val marginLinePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#25D32F2F")
            strokeWidth = 2.0f
        }
    }

    private val dotPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#35000000")
            style = Paint.Style.FILL
        }
    }

    fun drawPaper(
        canvas: Canvas,
        template: PaperTemplate,
        width: Float,
        height: Float
    ) {
        // Draw base paper background color
        canvas.drawRect(0f, 0f, width, height, paperPaint)

        when (template) {
            PaperTemplate.BLANK -> {
                // Pure paper
            }
            PaperTemplate.RULED -> {
                val lineSpacing = 44f
                var y = 140f
                while (y < height) {
                    canvas.drawLine(0f, y, width, y, gridLinePaint)
                    y += lineSpacing
                }
                canvas.drawLine(180f, 0f, 180f, height, marginLinePaint)
            }
            PaperTemplate.GRID -> {
                val gridSize = 36f
                var y = gridSize
                while (y < height) {
                    canvas.drawLine(0f, y, width, y, gridLinePaint)
                    y += gridSize
                }
                var x = gridSize
                while (x < width) {
                    canvas.drawLine(x, 0f, x, height, gridLinePaint)
                    x += gridSize
                }
            }
            PaperTemplate.DOT -> {
                val dotSpacing = 36f
                var y = dotSpacing
                while (y < height) {
                    var x = dotSpacing
                    while (x < width) {
                        canvas.drawCircle(x, y, 1.5f, dotPaint)
                        x += dotSpacing
                    }
                    y += dotSpacing
                }
            }
            PaperTemplate.CORNELL -> {
                val cueColumnX = 320f
                val summaryY = (height - 800f).coerceAtLeast(600f)
                val lineSpacing = 44f

                canvas.drawLine(cueColumnX, 140f, cueColumnX, summaryY, marginLinePaint)
                canvas.drawLine(0f, 140f, width, 140f, marginLinePaint)
                canvas.drawLine(0f, summaryY, width, summaryY, marginLinePaint)

                var y = 140f + lineSpacing
                while (y < summaryY) {
                    canvas.drawLine(cueColumnX, y, width, y, gridLinePaint)
                    y += lineSpacing
                }
            }
        }
    }

    fun drawInfinitePaper(
        canvas: Canvas,
        template: PaperTemplate,
        viewport: android.graphics.RectF
    ) {
        when (template) {
            PaperTemplate.BLANK -> {
                // Pure blank infinite canvas
            }
            PaperTemplate.RULED -> {
                val lineSpacing = 44f
                val startY = kotlin.math.floor(viewport.top / lineSpacing) * lineSpacing
                val endY = kotlin.math.ceil(viewport.bottom / lineSpacing) * lineSpacing
                var y = startY
                while (y <= endY) {
                    canvas.drawLine(viewport.left - 50f, y, viewport.right + 50f, y, gridLinePaint)
                    y += lineSpacing
                }
            }
            PaperTemplate.GRID -> {
                val gridSize = 36f
                val startY = kotlin.math.floor(viewport.top / gridSize) * gridSize
                val endY = kotlin.math.ceil(viewport.bottom / gridSize) * gridSize
                var y = startY
                while (y <= endY) {
                    canvas.drawLine(viewport.left - 50f, y, viewport.right + 50f, y, gridLinePaint)
                    y += gridSize
                }
                val startX = kotlin.math.floor(viewport.left / gridSize) * gridSize
                val endX = kotlin.math.ceil(viewport.right / gridSize) * gridSize
                var x = startX
                while (x <= endX) {
                    canvas.drawLine(x, viewport.top - 50f, x, viewport.bottom + 50f, gridLinePaint)
                    x += gridSize
                }
            }
            PaperTemplate.DOT -> {
                val dotSpacing = 36f
                val startY = kotlin.math.floor(viewport.top / dotSpacing) * dotSpacing
                val endY = kotlin.math.ceil(viewport.bottom / dotSpacing) * dotSpacing
                val startX = kotlin.math.floor(viewport.left / dotSpacing) * dotSpacing
                val endX = kotlin.math.ceil(viewport.right / dotSpacing) * dotSpacing
                var y = startY
                while (y <= endY) {
                    var x = startX
                    while (x <= endX) {
                        canvas.drawCircle(x, y, 1.5f, dotPaint)
                        x += dotSpacing
                    }
                    y += dotSpacing
                }
            }
            PaperTemplate.CORNELL -> {
                val lineSpacing = 44f
                val startY = kotlin.math.floor(viewport.top / lineSpacing) * lineSpacing
                val endY = kotlin.math.ceil(viewport.bottom / lineSpacing) * lineSpacing
                var y = startY
                while (y <= endY) {
                    canvas.drawLine(viewport.left - 50f, y, viewport.right + 50f, y, gridLinePaint)
                    y += lineSpacing
                }
                canvas.drawLine(320f, viewport.top - 50f, 320f, viewport.bottom + 50f, marginLinePaint)
            }
        }
    }
}
