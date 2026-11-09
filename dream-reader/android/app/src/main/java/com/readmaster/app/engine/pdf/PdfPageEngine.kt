package com.readmaster.app.engine.pdf

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import android.util.LruCache
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.asCoroutineDispatcher
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.concurrent.Executors

data class PageWord(
    val text: String,
    val boundsInPoints: RectF
)

class PdfPageEngine(
    maxMemoryBytes: Int = 96 * 1024 * 1024 // 96MB page bitmap cache for smooth reading
) {
    private val renderExecutor = Executors.newSingleThreadExecutor()
    private val renderDispatcher = renderExecutor.asCoroutineDispatcher()
    private val scope = CoroutineScope(renderDispatcher + SupervisorJob())

    private var pfd: ParcelFileDescriptor? = null
    private var renderer: PdfRenderer? = null
    var pageCount: Int = 0
        private set

    // Dimensions in PDF points (1/72 inch)
    private val pageDimensions = mutableListOf<Pair<Int, Int>>()

    // LRU Cache for complete rendered pages
    private val pageCache = object : LruCache<String, Bitmap>(maxMemoryBytes) {
        override fun sizeOf(key: String, value: Bitmap): Int {
            return value.byteCount
        }

        override fun entryRemoved(evicted: Boolean, key: String, oldValue: Bitmap, newValue: Bitmap?) {
            if (evicted && !oldValue.isRecycled) {
                oldValue.recycle()
            }
        }
    }

    // Extracted words per page for instant bilingual text lookup
    private val pageWords = HashMap<Int, List<PageWord>>()
    private val inFlightOcr = HashSet<Int>()
    private val textRecognizer by lazy { TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS) }

    private val inFlightRequests = HashSet<String>()
    private val paint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)

    fun openPdf(file: File) {
        val descriptor = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
        openPdf(descriptor)
    }

    fun openPdf(descriptor: ParcelFileDescriptor) {
        close()
        pfd = descriptor
        val pdfRenderer = PdfRenderer(descriptor)
        renderer = pdfRenderer
        pageCount = pdfRenderer.pageCount
        pageDimensions.clear()
        for (i in 0 until pageCount) {
            val page = pdfRenderer.openPage(i)
            pageDimensions.add(Pair(page.width, page.height))
            page.close()
        }
    }

    fun getPageSize(pageIndex: Int): Pair<Int, Int>? {
        if (pageIndex in 0 until pageDimensions.size) {
            return pageDimensions[pageIndex]
        }
        return null
    }

    /**
     * Draws the complete page bitmap smoothly centered in world coordinates.
     * Guaranteed NO seams, NO checkerboards, and NO partial missing rectangles!
     */
    fun drawPage(
        canvas: Canvas,
        pageIndex: Int,
        targetWidth: Float,
        onPageLoaded: () -> Unit
    ) {
        if (pageIndex !in 0 until pageCount || renderer == null) return
        val (pageW, pageH) = pageDimensions[pageIndex]
        if (pageW <= 0 || pageH <= 0) return

        // Compute high-definition render scale (at least 2x point size for retina crispness)
        val renderScale = (targetWidth / pageW.toFloat()).coerceIn(1.5f, 3.5f)
        val cacheKey = "${pageIndex}_${(renderScale * 10).toInt()}"
        val cached = pageCache.get(cacheKey)

        val destRect = RectF(0f, 0f, pageW.toFloat(), pageH.toFloat())

        if (cached != null && !cached.isRecycled) {
            canvas.drawBitmap(cached, null, destRect, paint)
        } else {
            // Draw clean white paper card background while high-res render completes
            canvas.drawRect(destRect, Paint().apply { color = Color.WHITE })
            requestPageRender(pageIndex, renderScale, onPageLoaded)
        }

        // Trigger background pre-fetching for adjacent pages (book reading speed)
        prefetchAdjacentPages(pageIndex, renderScale)
    }

    fun prefetchPage(pageIndex: Int, targetWidth: Float, onLoaded: (() -> Unit)? = null) {
        if (pageIndex !in 0 until pageCount) return
        val (pageW, _) = pageDimensions.getOrNull(pageIndex) ?: return
        val renderScale = (targetWidth / pageW.toFloat()).coerceIn(1.5f, 3.5f)
        val key = "${pageIndex}_${(renderScale * 10).toInt()}"
        if (pageCache.get(key) == null) {
            requestPageRender(pageIndex, renderScale) {
                onLoaded?.invoke()
            }
        }
    }

    fun getPageBitmap(pageIndex: Int, targetWidth: Float): Bitmap? {
        if (pageIndex !in 0 until pageCount) return null
        val (pageW, _) = pageDimensions.getOrNull(pageIndex) ?: return null
        val renderScale = (targetWidth / pageW.toFloat()).coerceIn(1.5f, 3.5f)
        val key = "${pageIndex}_${(renderScale * 10).toInt()}"
        val bmp = pageCache.get(key)
        if (bmp != null && !bmp.isRecycled) return bmp
        return null
    }

    private fun prefetchAdjacentPages(currentPage: Int, renderScale: Float) {
        if (currentPage + 1 < pageCount) {
            val nextKey = "${currentPage + 1}_${(renderScale * 10).toInt()}"
            if (pageCache.get(nextKey) == null) {
                requestPageRender(currentPage + 1, renderScale) {}
            }
        }
        if (currentPage - 1 >= 0) {
            val prevKey = "${currentPage - 1}_${(renderScale * 10).toInt()}"
            if (pageCache.get(prevKey) == null) {
                requestPageRender(currentPage - 1, renderScale) {}
            }
        }
    }

    private fun requestPageRender(
        pageIndex: Int,
        renderScale: Float,
        onPageLoaded: () -> Unit
    ) {
        val key = "${pageIndex}_${(renderScale * 10).toInt()}"
        synchronized(inFlightRequests) {
            if (inFlightRequests.contains(key)) return
            inFlightRequests.add(key)
        }

        scope.launch {
            val bitmap = renderPageSync(pageIndex, renderScale)
            if (bitmap != null) {
                pageCache.put(key, bitmap)
                synchronized(inFlightRequests) {
                    inFlightRequests.remove(key)
                }

                // Trigger background OCR for text selection and word lookup
                triggerPageOcr(pageIndex, bitmap)

                withContext(Dispatchers.Main) {
                    onPageLoaded()
                }
            } else {
                synchronized(inFlightRequests) {
                    inFlightRequests.remove(key)
                }
            }
        }
    }

    private fun renderPageSync(pageIndex: Int, renderScale: Float): Bitmap? {
        val pdfRenderer = renderer ?: return null
        if (pageIndex !in 0 until pageCount) return null
        val (pageW, pageH) = pageDimensions[pageIndex]

        return try {
            val pixelW = (pageW * renderScale).toInt().coerceAtLeast(1)
            val pixelH = (pageH * renderScale).toInt().coerceAtLeast(1)

            val bitmap = Bitmap.createBitmap(pixelW, pixelH, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            canvas.drawColor(Color.WHITE)

            // Strictly synchronized single-thread rendering
            synchronized(pdfRenderer) {
                val page = pdfRenderer.openPage(pageIndex)
                val matrix = Matrix().apply {
                    postScale(renderScale, renderScale)
                }
                page.render(
                    bitmap,
                    null,
                    matrix,
                    PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY
                )
                page.close()
            }
            bitmap
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun triggerPageOcr(pageIndex: Int, bitmap: Bitmap) {
        synchronized(inFlightOcr) {
            if (inFlightOcr.contains(pageIndex) || pageWords.containsKey(pageIndex)) return
            inFlightOcr.add(pageIndex)
        }

        val (pageW, pageH) = pageDimensions[pageIndex]
        val scaleX = pageW.toFloat() / bitmap.width.toFloat()
        val scaleY = pageH.toFloat() / bitmap.height.toFloat()

        try {
            val inputImage = InputImage.fromBitmap(bitmap, 0)
            textRecognizer.process(inputImage)
                .addOnSuccessListener { visionText ->
                    val words = mutableListOf<PageWord>()
                    for (block in visionText.textBlocks) {
                        for (line in block.lines) {
                            for (element in line.elements) {
                                val box = element.boundingBox
                                if (box != null) {
                                    val worldRect = RectF(
                                        box.left * scaleX,
                                        box.top * scaleY,
                                        box.right * scaleX,
                                        box.bottom * scaleY
                                    )
                                    words.add(PageWord(element.text, worldRect))
                                }
                            }
                        }
                    }
                    synchronized(pageWords) {
                        pageWords[pageIndex] = words
                    }
                }
                .addOnCompleteListener {
                    synchronized(inFlightOcr) {
                        inFlightOcr.remove(pageIndex)
                    }
                }
        } catch (_: Exception) {}
    }

    /**
     * Hit-tests words at world (x, y) coordinates on the page for instant lookup.
     * Searches for direct containment first, then falls back to the nearest word within [maxDistance].
     */
    fun findWordAt(worldX: Float, worldY: Float, pageIndex: Int, maxDistance: Float = 40f): PageWord? {
        val words = synchronized(pageWords) { pageWords[pageIndex] } ?: return null
        if (words.isEmpty()) return null

        // 1. Direct hit-test with slight padding
        val touchPadding = 12f
        for (w in words) {
            val b = w.boundsInPoints
            if (worldX >= b.left - touchPadding && worldX <= b.right + touchPadding &&
                worldY >= b.top - touchPadding && worldY <= b.bottom + touchPadding) {
                return w
            }
        }

        // 2. Nearest word fallback within maxDistance
        var closestWord: PageWord? = null
        var minDistanceSq = maxDistance * maxDistance

        for (w in words) {
            val b = w.boundsInPoints
            val cx = b.centerX()
            val cy = b.centerY()
            val dx = worldX - cx
            val dy = worldY - cy
            val distSq = dx * dx + dy * dy
            if (distSq < minDistanceSq) {
                minDistanceSq = distSq
                closestWord = w
            }
        }

        return closestWord
    }

    fun close() {
        try {
            renderer?.close()
        } catch (_: Exception) {}
        try {
            pfd?.close()
        } catch (_: Exception) {}
        renderer = null
        pfd = null
        pageCache.evictAll()
        synchronized(pageWords) {
            pageWords.clear()
        }
        synchronized(inFlightRequests) {
            inFlightRequests.clear()
        }
        synchronized(inFlightOcr) {
            inFlightOcr.clear()
        }
    }
}
