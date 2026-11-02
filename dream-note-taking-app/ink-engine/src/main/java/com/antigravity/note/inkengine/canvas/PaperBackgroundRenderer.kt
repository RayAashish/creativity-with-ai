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
}
