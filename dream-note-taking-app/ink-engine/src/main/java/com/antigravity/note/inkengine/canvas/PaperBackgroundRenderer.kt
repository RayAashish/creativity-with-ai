package com.antigravity.note.inkengine.canvas

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import com.antigravity.note.document.model.PaperTemplate

/**
 * Shared renderer for paper backgrounds across the live canvas, PDF exporter, and PNG exporter.
 * Features high-contrast, mathematically precise grids and patterns for 120Hz tablet screens.
 */
object PaperBackgroundRenderer {

    private val paperPaint by lazy {
        Paint().apply {
            color = Color.parseColor("#FCFAF6")
            style = Paint.Style.FILL
        }
    }

    private val darkPaperPaint by lazy {
        Paint().apply {
            color = Color.parseColor("#18191D")
            style = Paint.Style.FILL
        }
    }

    // Math Grid / Sub-grid Lines
    private val gridLinePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#2E000000") // Crisp 18% black in light mode
            strokeWidth = 1.8f
        }
    }

    private val darkGridLinePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#38FFFFFF") // Crisp 22% white in dark mode
            strokeWidth = 1.8f
        }
    }

    // Major Grid Lines (every 5th line)
    private val majorGridLinePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#45000000") // 27% black
            strokeWidth = 2.4f
        }
    }

    private val darkMajorGridLinePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#55FFFFFF") // 33% white
            strokeWidth = 2.4f
        }
    }

    // Margin Lines (Ruled / Cornell)
    private val marginLinePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#55D32F2F")
            strokeWidth = 2.4f
        }
    }

    private val darkMarginLinePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#77EF5350")
            strokeWidth = 2.4f
        }
    }

    // Dot Grid
    private val dotPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#4A000000")
            style = Paint.Style.FILL
        }
    }

    private val darkDotPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#55FFFFFF")
            style = Paint.Style.FILL
        }
    }

    // Fixed Page Boundary Border
    private val pageBorderPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#33000000")
            style = Paint.Style.STROKE
            strokeWidth = 3f
        }
    }

    private val darkPageBorderPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#44FFFFFF")
            style = Paint.Style.STROKE
            strokeWidth = 3f
        }
    }

    fun drawPaper(
        canvas: Canvas,
        template: PaperTemplate,
        width: Float,
        height: Float,
        isDark: Boolean = false
    ) {
        val currentPaperPaint = if (isDark) darkPaperPaint else paperPaint
        val currentGridLinePaint = if (isDark) darkGridLinePaint else gridLinePaint
        val currentMajorGridLinePaint = if (isDark) darkMajorGridLinePaint else majorGridLinePaint
        val currentMarginLinePaint = if (isDark) darkMarginLinePaint else marginLinePaint
        val currentDotPaint = if (isDark) darkDotPaint else dotPaint
        val currentBorderPaint = if (isDark) darkPageBorderPaint else pageBorderPaint

        // Draw base paper background color
        canvas.drawRect(0f, 0f, width, height, currentPaperPaint)

        when (template) {
            PaperTemplate.BLANK -> {
                // Pure clean paper
            }
            PaperTemplate.RULED -> {
                val lineSpacing = 64f
                var y = 140f
                while (y < height) {
                    canvas.drawLine(0f, y, width, y, currentGridLinePaint)
                    y += lineSpacing
                }
                canvas.drawLine(180f, 0f, 180f, height, currentMarginLinePaint)
            }
            PaperTemplate.GRID -> {
                val gridSize = 64f
                var lineIdx = 0
                var y = gridSize
                while (y < height) {
                    val p = if (lineIdx % 5 == 0) currentMajorGridLinePaint else currentGridLinePaint
                    canvas.drawLine(0f, y, width, y, p)
                    y += gridSize
                    lineIdx++
                }
                lineIdx = 0
                var x = gridSize
                while (x < width) {
                    val p = if (lineIdx % 5 == 0) currentMajorGridLinePaint else currentGridLinePaint
                    canvas.drawLine(x, 0f, x, height, p)
                    x += gridSize
                    lineIdx++
                }
            }
            PaperTemplate.DOT -> {
                val dotSpacing = 64f
                var y = dotSpacing
                while (y < height) {
                    var x = dotSpacing
                    while (x < width) {
                        canvas.drawCircle(x, y, 2.8f, currentDotPaint)
                        x += dotSpacing
                    }
                    y += dotSpacing
                }
            }
            PaperTemplate.CORNELL -> {
                val cueColumnX = 400f
                val summaryY = (height - 800f).coerceAtLeast(600f)
                val lineSpacing = 64f

                canvas.drawLine(cueColumnX, 140f, cueColumnX, summaryY, currentMarginLinePaint)
                canvas.drawLine(0f, 140f, width, 140f, currentMarginLinePaint)
                canvas.drawLine(0f, summaryY, width, summaryY, currentMarginLinePaint)

                var y = 140f + lineSpacing
                while (y < summaryY) {
                    canvas.drawLine(cueColumnX, y, width, y, currentGridLinePaint)
                    y += lineSpacing
                }
            }
        }

        // Draw subtle page boundary border
        canvas.drawRect(0f, 0f, width, height, currentBorderPaint)
    }

    fun drawInfinitePaper(
        canvas: Canvas,
        template: PaperTemplate,
        viewport: android.graphics.RectF,
        isDark: Boolean = false
    ) {
        val currentGridLinePaint = if (isDark) darkGridLinePaint else gridLinePaint
        val currentMajorGridLinePaint = if (isDark) darkMajorGridLinePaint else majorGridLinePaint
        val currentMarginLinePaint = if (isDark) darkMarginLinePaint else marginLinePaint
        val currentDotPaint = if (isDark) darkDotPaint else dotPaint

        when (template) {
            PaperTemplate.BLANK -> {
                // Pure blank infinite canvas
            }
            PaperTemplate.RULED -> {
                val lineSpacing = 64f
                val startY = kotlin.math.floor((viewport.top - 50f) / lineSpacing) * lineSpacing
                val endY = kotlin.math.ceil((viewport.bottom + 50f) / lineSpacing) * lineSpacing
                var y = startY
                while (y <= endY) {
                    canvas.drawLine(viewport.left - 100f, y, viewport.right + 100f, y, currentGridLinePaint)
                    y += lineSpacing
                }
                // Optional vertical margin line for ruled layout
                if (viewport.left <= 200f && viewport.right >= 160f) {
                    canvas.drawLine(180f, viewport.top - 100f, 180f, viewport.bottom + 100f, currentMarginLinePaint)
                }
            }
            PaperTemplate.GRID -> {
                val gridSize = 64f
                val startY = kotlin.math.floor((viewport.top - 50f) / gridSize) * gridSize
                val endY = kotlin.math.ceil((viewport.bottom + 50f) / gridSize) * gridSize
                var y = startY
                while (y <= endY) {
                    val idx = kotlin.math.round(y / gridSize).toInt()
                    val p = if (idx % 5 == 0) currentMajorGridLinePaint else currentGridLinePaint
                    canvas.drawLine(viewport.left - 100f, y, viewport.right + 100f, y, p)
                    y += gridSize
                }
                val startX = kotlin.math.floor((viewport.left - 50f) / gridSize) * gridSize
                val endX = kotlin.math.ceil((viewport.right + 50f) / gridSize) * gridSize
                var x = startX
                while (x <= endX) {
                    val idx = kotlin.math.round(x / gridSize).toInt()
                    val p = if (idx % 5 == 0) currentMajorGridLinePaint else currentGridLinePaint
                    canvas.drawLine(x, viewport.top - 100f, x, viewport.bottom + 100f, p)
                    x += gridSize
                }
            }
            PaperTemplate.DOT -> {
                val dotSpacing = 64f
                val startY = kotlin.math.floor((viewport.top - 50f) / dotSpacing) * dotSpacing
                val endY = kotlin.math.ceil((viewport.bottom + 50f) / dotSpacing) * dotSpacing
                val startX = kotlin.math.floor((viewport.left - 50f) / dotSpacing) * dotSpacing
                val endX = kotlin.math.ceil((viewport.right + 50f) / dotSpacing) * dotSpacing
                var y = startY
                while (y <= endY) {
                    var x = startX
                    while (x <= endX) {
                        canvas.drawCircle(x, y, 2.8f, currentDotPaint)
                        x += dotSpacing
                    }
                    y += dotSpacing
                }
            }
            PaperTemplate.CORNELL -> {
                val lineSpacing = 64f
                val startY = kotlin.math.floor((viewport.top - 50f) / lineSpacing) * lineSpacing
                val endY = kotlin.math.ceil((viewport.bottom + 50f) / lineSpacing) * lineSpacing
                var y = startY
                while (y <= endY) {
                    canvas.drawLine(viewport.left - 100f, y, viewport.right + 100f, y, currentGridLinePaint)
                    y += lineSpacing
                }
                // Cue column divider
                if (viewport.left <= 420f && viewport.right >= 380f) {
                    canvas.drawLine(400f, viewport.top - 100f, 400f, viewport.bottom + 100f, currentMarginLinePaint)
                }
            }
        }
    }
}
