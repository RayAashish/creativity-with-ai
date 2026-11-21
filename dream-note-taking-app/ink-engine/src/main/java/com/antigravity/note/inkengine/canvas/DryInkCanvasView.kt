package com.antigravity.note.inkengine.canvas

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.util.AttributeSet
import android.util.LruCache
import android.view.View
import androidx.ink.brush.Brush
import androidx.ink.brush.StockBrushes
import androidx.ink.rendering.android.canvas.CanvasStrokeRenderer
import androidx.ink.strokes.Stroke
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import com.antigravity.note.document.model.CanvasImage
import com.antigravity.note.document.model.CanvasTextBox
import com.antigravity.note.document.model.FontStyleType
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.inkengine.eraser.EraserMode
import com.antigravity.note.inkengine.eraser.PrecisionEraser
import com.antigravity.note.inkengine.eraser.SpatialStrokeIndex
import com.antigravity.note.inkengine.lasso.LassoTool
import com.antigravity.note.inkengine.pdf.PdfTiler
import java.io.File

data class EraseModification(
    val removedStrokes: List<Stroke> = emptyList(),
    val addedStrokes: List<Stroke> = emptyList(),
    val replacements: List<StrokeReplacement> = emptyList()
)

data class StrokeReplacement(
    val oldStroke: Stroke,
    val newStrokes: List<Stroke>
)

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
    val spatialIndex = SpatialStrokeIndex(cellSize = 256f)
    private val queryCandidates = ArrayList<Stroke>(32)
    private val strokeRenderer: CanvasStrokeRenderer = CanvasStrokeRenderer.create()
    val transform = CanvasTransform()
    var currentTemplate: PaperTemplate = PaperTemplate.GRID
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

    // Canvas Images & Offline Assets
    val images = mutableListOf<CanvasImage>()
    var selectedImage: CanvasImage? = null
    var assetsDir: File? = null
    private val bitmapCache = object : LruCache<String, Bitmap>(32) {
        override fun sizeOf(key: String, value: Bitmap): Int {
            return value.byteCount / 1024
        }
    }
    private val imageDstRect = RectF()
    private val bitmapPaint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)

    // Image selection paints (Imperial Amber & Gold Luxury Theme - Zero Blue)
    private val imageSelectBorderPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 3.5f
            color = Color.parseColor("#F59E0B")
        }
    }
    private val imageSelectFillPaint by lazy {
        Paint().apply {
            style = Paint.Style.FILL
            color = Color.parseColor("#14F59E0B")
        }
    }
    private val imageHandlePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.WHITE
        }
    }
    private val imageHandleBorderPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 3f
            color = Color.parseColor("#F59E0B")
        }
    }

    // Drag-and-drop indicator
    var isDropTargetActive = false
    val dropTargetBounds = RectF()
    private val dropTargetPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 4f
            color = Color.parseColor("#F59E0B")
            pathEffect = DashPathEffect(floatArrayOf(16f, 12f), 0f)
        }
    }
    private val dropTargetFillPaint by lazy {
        Paint().apply {
            style = Paint.Style.FILL
            color = Color.parseColor("#18F59E0B")
        }
    }

    // Canvas Text Boxes (Interactive Typed Notes & Code Snippets)
    val textBoxes = mutableListOf<CanvasTextBox>()
    var selectedTextBox: CanvasTextBox? = null

    // Permanent Neon Glow Pen strokes & hardware baking cache
    val neonStrokes = mutableSetOf<Stroke>()
    val neonStrokePaths = mutableMapOf<Stroke, Path>()

    private val neonOuterHaloPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }
    private val neonMidGlowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }
    private val neonInnerCorePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private var neonBakeBitmap: Bitmap? = null
    private var neonBakeCanvas: Canvas? = null
    private var isNeonBakeDirty = true

    fun invalidateNeonBake() {
        isNeonBakeDirty = true
    }

    fun tagNeonStroke(stroke: Stroke) {
        neonStrokes.add(stroke)
        neonStrokePaths[stroke] = buildPathFromStroke(stroke)
        invalidateNeonBake()
        invalidate()
    }

    fun isNeonStroke(stroke: Stroke): Boolean {
        return stroke in neonStrokes
    }

    fun buildPathFromStroke(stroke: Stroke): Path {
        val path = Path()
        val inputs = stroke.inputs
        val count = inputs.size
        if (count == 0) return path
        val temp = androidx.ink.strokes.StrokeInput()
        inputs.populate(0, temp)
        path.moveTo(temp.x, temp.y)
        if (count == 1) {
            path.lineTo(temp.x + 0.1f, temp.y + 0.1f)
            return path
        }
        var prevX = temp.x
        var prevY = temp.y
        for (i in 1 until count) {
            inputs.populate(i, temp)
            val midX = (prevX + temp.x) * 0.5f
            val midY = (prevY + temp.y) * 0.5f
            path.quadTo(prevX, prevY, midX, midY)
            prevX = temp.x
            prevY = temp.y
        }
        path.lineTo(prevX, prevY)
        return path
    }

    private fun computeInnerCoreColor(color: Int): Int {
        val r = (color ushr 16) and 0xFF
        val g = (color ushr 8) and 0xFF
        val b = color and 0xFF
        val coreR = (255 * 0.85f + r * 0.15f).toInt().coerceIn(0, 255)
        val coreG = (255 * 0.85f + g * 0.15f).toInt().coerceIn(0, 255)
        val coreB = (255 * 0.85f + b * 0.15f).toInt().coerceIn(0, 255)
        return (0xFF shl 24) or (coreR shl 16) or (coreG shl 8) or coreB
    }

    fun drawNeonStroke(canvas: Canvas, stroke: Stroke) {
        val path = neonStrokePaths[stroke] ?: buildPathFromStroke(stroke).also { neonStrokePaths[stroke] = it }
        val color = stroke.brush.colorIntArgb
        val coreColor = computeInnerCoreColor(color)
        val density = resources.displayMetrics.density
        val mult = (stroke.brush.size / 6.0f).coerceIn(0.6f, 2.5f)

        // Outer Halo Pass (16dp base, 22% alpha)
        neonOuterHaloPaint.strokeWidth = 16f * density * mult
        val haloAlpha = (255 * 0.22f).toInt()
        neonOuterHaloPaint.color = (color and 0x00FFFFFF) or (haloAlpha shl 24)
        canvas.drawPath(path, neonOuterHaloPaint)

        // Mid Glow Pass (10dp base, 45% alpha)
        neonMidGlowPaint.strokeWidth = 10f * density * mult
        val midAlpha = (255 * 0.45f).toInt()
        neonMidGlowPaint.color = (color and 0x00FFFFFF) or (midAlpha shl 24)
        canvas.drawPath(path, neonMidGlowPaint)

        // Inner Core Pass (3.5dp base, 95% alpha, bright white blend)
        neonInnerCorePaint.strokeWidth = 3.5f * density * mult
        val coreAlpha = (255 * 0.95f).toInt()
        neonInnerCorePaint.color = (coreColor and 0x00FFFFFF) or (coreAlpha shl 24)
        canvas.drawPath(path, neonInnerCorePaint)
    }

    private val textPaint = TextPaint(Paint.ANTI_ALIAS_FLAG)
    private val textBoxBgPaint = Paint().apply { style = Paint.Style.FILL }
    private val textBoxBorderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeWidth = 1.5f }
    private val textBoxSelectBorderPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 3f
            color = Color.parseColor("#F59E0B")
            pathEffect = DashPathEffect(floatArrayOf(12f, 8f), 0f)
        }
    }
    private val textBoxHandlePaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.WHITE
        }
    }
    private val textBoxHandleBorderPaint by lazy {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2.5f
            color = Color.parseColor("#F59E0B")
        }
    }

    init {
        // Ensure hardware acceleration is enabled
        setLayerType(LAYER_TYPE_HARDWARE, null)
    }

    var isDarkMode: Boolean = false
        set(value) {
            if (field != value) {
                field = value
                paperPaint.color = if (value) Color.parseColor("#18191D") else Color.parseColor("#FCFAF6")
                darkStrokeCache.clear()
                lightStrokeCache.clear()
                invalidate()
            }
        }

    var isAdaptiveContrastEnabled: Boolean = true
        set(value) {
            if (field != value) {
                field = value
                darkStrokeCache.clear()
                lightStrokeCache.clear()
                invalidate()
            }
        }

    private val darkStrokeCache = mutableMapOf<Stroke, Stroke>()
    private val lightStrokeCache = mutableMapOf<Stroke, Stroke>()

    private fun getStrokeForTheme(stroke: Stroke): Stroke {
        if (!isAdaptiveContrastEnabled) return stroke
        val color = stroke.brush.colorIntArgb
        val a = (color ushr 24) and 0xFF
        if (a < 0x80) return stroke // don't alter translucent highlighters
        val r = (color ushr 16) and 0xFF
        val g = (color ushr 8) and 0xFF
        val b = color and 0xFF
        val maxC = maxOf(r, maxOf(g, b))
        val minC = minOf(r, minOf(g, b))
        val sat = maxC - minC
        // Only adapt monochrome ink (black, grays, whites). Colored inks (blue, red, green) preserve hue.
        if (sat > 35) return stroke

        val lum = 0.299f * r + 0.587f * g + 0.114f * b

        if (isDarkMode) {
            // Dark Mode canvas (#18191D): background is near black.
            // If stroke is dark (black, deep gray, low luminance < 85), map to crisp off-white #F5F5F5
            if (lum < 85f) {
                return darkStrokeCache.getOrPut(stroke) {
                    val lightBrush = Brush.createWithColorIntArgb(
                        stroke.brush.family,
                        0xFFF5F5F5.toInt(),
                        stroke.brush.size,
                        stroke.brush.epsilon
                    )
                    stroke.copy(lightBrush)
                }
            }
        } else {
            // Light Mode canvas (#FCFAF6): background is near white.
            // If stroke is light (white, pale gray, high luminance > 175), map to crisp deep ink #111318
            if (lum > 175f) {
                return lightStrokeCache.getOrPut(stroke) {
                    val darkBrush = Brush.createWithColorIntArgb(
                        stroke.brush.family,
                        0xFF111318.toInt(),
                        stroke.brush.size,
                        stroke.brush.epsilon
                    )
                    stroke.copy(darkBrush)
                }
            }
        }
        return stroke
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

        val lasso = lassoTool
        val isTransforming = lasso != null && lasso.isTransformGestureActive && lasso.selectedStrokes.isNotEmpty()

        if (isTransforming) {
            val selectedSet = lasso.selectedStrokesSet

            // 1. Base Layer (Static): Unselected images, text boxes & unselected strokes
            drawImages(canvas)
            drawTextBoxes(canvas)

            for (i in 0 until strokes.size) {
                val stroke = strokes[i]
                if (stroke !in selectedSet && !isNeonStroke(stroke) && isHighlighterStroke(stroke)) {
                    strokeRenderer.draw(canvas, getStrokeForTheme(stroke), identityMatrix)
                }
            }
            for (i in 0 until strokes.size) {
                val stroke = strokes[i]
                if (stroke !in selectedSet && !isNeonStroke(stroke) && !isHighlighterStroke(stroke)) {
                    strokeRenderer.draw(canvas, getStrokeForTheme(stroke), identityMatrix)
                }
            }
            for (i in 0 until strokes.size) {
                val stroke = strokes[i]
                if (stroke !in selectedSet && isNeonStroke(stroke)) {
                    drawNeonStroke(canvas, stroke)
                }
            }

            // 2. Interactive Scratchpad / Overlay Layer (Dynamic): Hardware-accelerated transform
            canvas.save()
            canvas.concat(lasso.overlayTransformMatrix)

            for (i in 0 until lasso.selectedStrokes.size) {
                val stroke = lasso.selectedStrokes[i]
                if (!isNeonStroke(stroke) && isHighlighterStroke(stroke)) {
                    strokeRenderer.draw(canvas, getStrokeForTheme(stroke), identityMatrix)
                }
            }
            for (i in 0 until lasso.selectedStrokes.size) {
                val stroke = lasso.selectedStrokes[i]
                if (!isNeonStroke(stroke) && !isHighlighterStroke(stroke)) {
                    strokeRenderer.draw(canvas, getStrokeForTheme(stroke), identityMatrix)
                }
            }
            for (i in 0 until lasso.selectedStrokes.size) {
                val stroke = lasso.selectedStrokes[i]
                if (isNeonStroke(stroke)) {
                    drawNeonStroke(canvas, stroke)
                }
            }
            canvas.restore()

            // 3. Selection Box & Handles in world space
            lasso.draw(canvas)
        } else {
            // Standard render: all images, text boxes then all strokes
            drawImages(canvas)
            drawTextBoxes(canvas)

            for (i in 0 until strokes.size) {
                val stroke = strokes[i]
                if (!isNeonStroke(stroke) && isHighlighterStroke(stroke)) {
                    strokeRenderer.draw(canvas, getStrokeForTheme(stroke), identityMatrix)
                }
            }
            for (i in 0 until strokes.size) {
                val stroke = strokes[i]
                if (!isNeonStroke(stroke) && !isHighlighterStroke(stroke)) {
                    strokeRenderer.draw(canvas, getStrokeForTheme(stroke), identityMatrix)
                }
            }
            for (i in 0 until strokes.size) {
                val stroke = strokes[i]
                if (isNeonStroke(stroke)) {
                    drawNeonStroke(canvas, stroke)
                }
            }

            // Draw lasso selection overlay if active
            lasso?.draw(canvas)
        }

        // Draw image selection overlay if active
        drawImageSelection(canvas)

        // Draw drag-and-drop indicator
        if (isDropTargetActive && !dropTargetBounds.isEmpty) {
            canvas.drawRoundRect(dropTargetBounds, 16f, 16f, dropTargetFillPaint)
            canvas.drawRoundRect(dropTargetBounds, 16f, 16f, dropTargetPaint)
        }

        // Draw search match highlights
        if (searchHighlights.isNotEmpty()) {
            for (i in 0 until searchHighlights.size) {
                val rect = searchHighlights[i]
                canvas.drawRoundRect(rect, 8f, 8f, searchHighlightFillPaint)
                canvas.drawRoundRect(rect, 8f, 8f, searchHighlightStrokePaint)
            }
        }

        canvas.restore()
    }

    private fun drawImages(canvas: Canvas) {
        if (images.isEmpty()) return
        val dir = assetsDir ?: return
        for (i in 0 until images.size) {
            val img = images[i]
            val bitmap = getBitmap(File(dir, img.assetRef))
            if (bitmap != null) {
                canvas.save()
                if (img.rotation != 0f) {
                    canvas.rotate(img.rotation, img.x + img.width / 2f, img.y + img.height / 2f)
                }
                imageDstRect.set(img.x, img.y, img.x + img.width, img.y + img.height)
                canvas.drawBitmap(bitmap, null, imageDstRect, bitmapPaint)
                canvas.restore()
            }
        }
    }

    private fun drawImageSelection(canvas: Canvas) {
        val img = selectedImage ?: return
        canvas.save()
        if (img.rotation != 0f) {
            canvas.rotate(img.rotation, img.x + img.width / 2f, img.y + img.height / 2f)
        }
        // Fill tint & highlight border
        canvas.drawRect(img.x, img.y, img.x + img.width, img.y + img.height, imageSelectFillPaint)
        canvas.drawRect(img.x, img.y, img.x + img.width, img.y + img.height, imageSelectBorderPaint)

        val hr = 16f
        fun drawHandle(cx: Float, cy: Float) {
            canvas.drawCircle(cx, cy, hr, imageHandlePaint)
            canvas.drawCircle(cx, cy, hr, imageHandleBorderPaint)
        }
        // 4 Corner handles
        drawHandle(img.x, img.y)
        drawHandle(img.x + img.width, img.y)
        drawHandle(img.x, img.y + img.height)
        drawHandle(img.x + img.width, img.y + img.height)

        // 4 Midpoint edge handles
        val midX = img.x + img.width / 2f
        val midY = img.y + img.height / 2f
        drawHandle(midX, img.y)
        drawHandle(midX, img.y + img.height)
        drawHandle(img.x, midY)
        drawHandle(img.x + img.width, midY)

        canvas.restore()
    }

    fun findImageAt(worldX: Float, worldY: Float): CanvasImage? {
        for (i in images.indices.reversed()) {
            val img = images[i]
            val cx = img.x + img.width / 2f
            val cy = img.y + img.height / 2f
            val rad = Math.toRadians(-img.rotation.toDouble())
            val unrotX = (Math.cos(rad) * (worldX - cx) - Math.sin(rad) * (worldY - cy) + cx).toFloat()
            val unrotY = (Math.sin(rad) * (worldX - cx) + Math.cos(rad) * (worldY - cy) + cy).toFloat()
            if (unrotX >= img.x && unrotX <= img.x + img.width && unrotY >= img.y && unrotY <= img.y + img.height) {
                return img
            }
        }
        return null
    }

    private fun getBitmap(file: File): Bitmap? {
        if (!file.exists()) return null
        val path = file.absolutePath
        val cached = bitmapCache.get(path)
        if (cached != null && !cached.isRecycled) return cached
        return try {
            val bmp = android.graphics.BitmapFactory.decodeFile(path)
            if (bmp != null) {
                bitmapCache.put(path, bmp)
            }
            bmp
        } catch (e: Throwable) {
            null
        }
    }

    fun setImages(newImages: List<CanvasImage>, directory: File? = null) {
        images.clear()
        images.addAll(newImages)
        if (directory != null) {
            assetsDir = directory
        }
        invalidate()
    }

    fun addImage(image: CanvasImage) {
        images.add(image)
        invalidate()
    }

    fun removeImage(imageId: String): Boolean {
        val removed = images.removeAll { it.id == imageId }
        if (removed) invalidate()
        return removed
    }

    fun setTextBoxes(newBoxes: List<CanvasTextBox>) {
        textBoxes.clear()
        textBoxes.addAll(newBoxes)
        invalidate()
    }

    fun addTextBox(box: CanvasTextBox) {
        textBoxes.add(box)
        invalidate()
    }

    fun removeTextBox(boxId: String): Boolean {
        val removed = textBoxes.removeAll { it.id == boxId }
        if (removed) invalidate()
        return removed
    }

    fun findTextBoxAt(worldX: Float, worldY: Float): CanvasTextBox? {
        for (i in textBoxes.indices.reversed()) {
            val b = textBoxes[i]
            if (b.contains(worldX, worldY)) {
                return b
            }
        }
        return null
    }

    private fun drawTextBoxes(canvas: Canvas) {
        if (textBoxes.isEmpty()) return
        val pad = 12f

        for (i in 0 until textBoxes.size) {
            val box = textBoxes[i]
            canvas.save()
            if (box.rotation != 0f) {
                canvas.rotate(box.rotation, box.x + box.width / 2f, box.y + box.height / 2f)
            }

            // Fill background
            if (box.isFilled) {
                textBoxBgPaint.color = box.fillColorArgb
                canvas.drawRoundRect(box.x, box.y, box.x + box.width, box.y + box.height, 10f, 10f, textBoxBgPaint)
            }

            // Border
            if (box.isBordered) {
                textBoxBorderPaint.color = box.borderColorArgb
                canvas.drawRoundRect(box.x, box.y, box.x + box.width, box.y + box.height, 10f, 10f, textBoxBorderPaint)
            }

            // Text
            textPaint.color = box.textColorArgb
            textPaint.textSize = box.fontSizeSp * 2.2f
            val baseTf = when (box.fontStyle) {
                FontStyleType.MONOSPACE -> Typeface.MONOSPACE
                FontStyleType.SERIF -> Typeface.SERIF
                else -> Typeface.SANS_SERIF
            }
            val style = when {
                box.isBold && box.isItalic -> Typeface.BOLD_ITALIC
                box.isBold -> Typeface.BOLD
                box.isItalic -> Typeface.ITALIC
                else -> Typeface.NORMAL
            }
            textPaint.typeface = Typeface.create(baseTf, style)
            textPaint.isUnderlineText = box.isUnderline

            val innerW = maxOf(20, (box.width - 2 * pad).toInt())
            val displayText = if (box.text.isEmpty() && selectedTextBox == box) "Type here..." else box.text
            if (displayText.isNotEmpty()) {
                val sl = StaticLayout.Builder.obtain(displayText, 0, displayText.length, textPaint, innerW)
                    .setAlignment(Layout.Alignment.ALIGN_NORMAL)
                    .setLineSpacing(0f, 1.15f)
                    .setIncludePad(true)
                    .build()

                val neededH = sl.height + 2 * pad
                if (neededH > box.height) {
                    box.height = neededH
                }

                canvas.save()
                canvas.translate(box.x + pad, box.y + pad)
                sl.draw(canvas)
                canvas.restore()
            }

            // Selected outline & corner handles
            if (selectedTextBox == box) {
                canvas.drawRoundRect(box.x, box.y, box.x + box.width, box.y + box.height, 10f, 10f, textBoxSelectBorderPaint)
                val hr = 12f
                fun drawHandle(hx: Float, hy: Float) {
                    canvas.drawCircle(hx, hy, hr, textBoxHandlePaint)
                    canvas.drawCircle(hx, hy, hr, textBoxHandleBorderPaint)
                }
                drawHandle(box.x, box.y)
                drawHandle(box.x + box.width, box.y)
                drawHandle(box.x, box.y + box.height)
                drawHandle(box.x + box.width, box.y + box.height)
            }

            canvas.restore()
        }
    }

    private fun isHighlighterStroke(stroke: Stroke): Boolean {
        if (stroke.brush.family == StockBrushes.highlighter()) return true
        val familyId = stroke.brush.family.clientBrushFamilyId
        if (familyId.contains("highlighter", ignoreCase = true)) return true
        // Translucent alpha check (highlighters use 0x55 alpha <= 0x99, whereas pen/marker use 0xFF)
        val alpha = (stroke.brush.colorIntArgb ushr 24) and 0xFF
        return alpha <= 0x99
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

    fun loadStrokes(newStrokes: List<Stroke>, neonStrokesList: Collection<Stroke> = emptyList()) {
        strokes.clear()
        darkStrokeCache.clear()
        lightStrokeCache.clear()
        neonStrokes.clear()
        neonStrokePaths.clear()
        invalidateNeonBake()
        strokes.addAll(newStrokes)
        for (s in neonStrokesList) {
            neonStrokes.add(s)
            neonStrokePaths[s] = buildPathFromStroke(s)
        }
        spatialIndex.rebuild(strokes)
        invalidate()
    }

    var isInfiniteCanvas: Boolean = true

    private fun drawPaperGrid(canvas: Canvas) {
        if (isInfiniteCanvas) {
            viewportRect.set(0f, 0f, width.toFloat(), height.toFloat())
            transform.screenToWorld(viewportRect)
            PaperBackgroundRenderer.drawInfinitePaper(canvas, currentTemplate, viewportRect, isDarkMode)
        } else {
            val virtualWidth = 2400f
            val virtualHeight = 3400f
            PaperBackgroundRenderer.drawPaper(canvas, currentTemplate, virtualWidth, virtualHeight, isDarkMode)
        }
    }

    /**
     * Erases strokes at (worldX, worldY) using the specified [mode].
     * Returns detailed [EraseModification] with surviving and removed strokes.
     */
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
        val eraseRadiusSq = eraseRadius * eraseRadius

        for (i in 0 until queryCandidates.size) {
            val stroke = queryCandidates[i]
            if (mode == EraserMode.HIGHLIGHTER && !isHighlighterStroke(stroke)) {
                continue
            }

            if (mode == EraserMode.STROKE) {
                val bounds = stroke.shape.computeBoundingBox() ?: continue
                val boxW = bounds.xMax - bounds.xMin
                val boxH = bounds.yMax - bounds.yMin
                var hit = (boxW <= eraseRadius * 2.5f && boxH <= eraseRadius * 2.5f)
                if (!hit) {
                    val inputs = stroke.inputs
                    val step = (inputs.size / 40).coerceAtLeast(1)
                    for (j in 0 until inputs.size step step) {
                        val pt = inputs.get(j)
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
                    strokes.remove(stroke)
                    spatialIndex.remove(stroke)
                    replacements.add(StrokeReplacement(stroke, emptyList()))
                }
            } else {
                // Precision / partial eraser mode
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
            darkStrokeCache.clear()
            invalidate()
        }
        return EraseModification(
            removedStrokes = removed,
            addedStrokes = added,
            replacements = replacements
        )
    }

    /**
     * Erase any stroke near the world coordinate (worldX, worldY).
     * Returns list of removed strokes for backward compatibility.
     */
    fun eraseStrokesAt(worldX: Float, worldY: Float, eraseRadius: Float): List<Stroke> {
        return eraseStrokesWithDetails(worldX, worldY, eraseRadius, EraserMode.PRECISION).removedStrokes
    }

    fun replaceStrokes(oldStrokes: List<Stroke>, newStrokes: List<Stroke>) {
        if (oldStrokes.isEmpty() && newStrokes.isEmpty()) return
        darkStrokeCache.clear()
        lightStrokeCache.clear()
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

    fun addStroke(stroke: Stroke) {
        val box = stroke.shape.computeBoundingBox()
        android.util.Log.d("ANTIGRAVITY_INK", "addStroke: inputs=${stroke.inputs.size}, bbox=$box, brushSize=${stroke.brush.size}, color=${Integer.toHexString(stroke.brush.colorIntArgb)}")
        if (stroke.inputs.size > 0) {
            val p0 = stroke.inputs.get(0)
            android.util.Log.d("ANTIGRAVITY_INK", "  p0: x=${p0.x}, y=${p0.y}, time=${p0.elapsedTimeMillis}, tool=${p0.toolType}, unit=${p0.strokeUnitLengthCm}, p=${p0.pressure}, tilt=${p0.tiltRadians}, ori=${p0.orientationRadians}")
        }
        strokes.add(stroke)
        spatialIndex.add(stroke)
        invalidate()
    }

    fun addStrokes(newStrokes: List<Stroke>) {
        for (s in newStrokes) {
            val box = s.shape.computeBoundingBox()
            android.util.Log.d("ANTIGRAVITY_INK", "addStrokes item: inputs=${s.inputs.size}, bbox=$box, brushSize=${s.brush.size}, color=${Integer.toHexString(s.brush.colorIntArgb)}")
            if (s.inputs.size > 0) {
                val p0 = s.inputs.get(0)
                android.util.Log.d("ANTIGRAVITY_INK", "  p0: x=${p0.x}, y=${p0.y}, time=${p0.elapsedTimeMillis}, tool=${p0.toolType}, unit=${p0.strokeUnitLengthCm}, p=${p0.pressure}, tilt=${p0.tiltRadians}, ori=${p0.orientationRadians}")
            }
        }
        strokes.addAll(newStrokes)
        for (s in newStrokes) {
            spatialIndex.add(s)
        }
        invalidate()
    }

    fun removeStrokes(strokesToRemove: List<Stroke>) {
        darkStrokeCache.clear()
        lightStrokeCache.clear()
        for (s in strokesToRemove) {
            strokes.remove(s)
            neonStrokes.remove(s)
            neonStrokePaths.remove(s)
            spatialIndex.remove(s)
        }
        invalidateNeonBake()
        invalidate()
    }

    fun clearAllStrokes() {
        strokes.clear()
        spatialIndex.clear()
        darkStrokeCache.clear()
        lightStrokeCache.clear()
        neonStrokes.clear()
        neonStrokePaths.clear()
        invalidateNeonBake()
        invalidate()
    }
}
