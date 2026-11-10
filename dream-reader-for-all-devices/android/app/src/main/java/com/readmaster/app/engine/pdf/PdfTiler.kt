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
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max

data class TileKey(val pageIndex: Int, val level: Int, val col: Int, val row: Int) {
    override fun toString(): String = "${pageIndex}_${level}_${col}_${row}"
}

class PdfTiler(
    private val tileSize: Int = 512,
    maxMemoryBytes: Int = 48 * 1024 * 1024 // 48MB cache limit for fast tablet rendering
) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var pfd: ParcelFileDescriptor? = null
    private var renderer: PdfRenderer? = null
    var pageCount: Int = 0
        private set

    // Dimensions of each PDF page in points (72 dpi)
    private val pageDimensions = mutableListOf<Pair<Int, Int>>()

    // LRU Cache for rendered tile bitmaps
    private val tileCache = object : LruCache<String, Bitmap>(maxMemoryBytes) {
        override fun sizeOf(key: String, value: Bitmap): Int {
            return value.byteCount
        }

        override fun entryRemoved(evicted: Boolean, key: String, oldValue: Bitmap, newValue: Bitmap?) {
            if (evicted && !oldValue.isRecycled) {
                oldValue.recycle()
            }
        }
    }

    private val inFlightRequests = HashSet<String>()
    private val paint = Paint(Paint.FILTER_BITMAP_FLAG)

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
     * Draws the visible tiles for the requested page and world viewport.
     * Triggers asynchronous background tile rendering for any cache misses.
     */
    fun drawVisibleTiles(
        canvas: Canvas,
        pageIndex: Int,
        viewportRect: RectF,
        zoomScale: Float,
        onTileLoaded: () -> Unit
    ) {
        if (pageIndex !in 0 until pageCount || renderer == null) return
        val (pageW, pageH) = pageDimensions[pageIndex]

        // Determine zoom level (1x, 2x, 4x)
        val level = when {
            zoomScale > 2.5f -> 4
            zoomScale > 1.2f -> 2
            else -> 1
        }

        val scaledW = pageW * level * 2f
        val scaledH = pageH * level * 2f

        val cols = ceil(scaledW / tileSize).toInt().coerceAtLeast(1)
        val rows = ceil(scaledH / tileSize).toInt().coerceAtLeast(1)

        val tileWidthWorld = pageW.toFloat() / cols
        val tileHeightWorld = pageH.toFloat() / rows

        // Calculate tile range intersecting the viewport
        val startCol = max(0, floor(viewportRect.left / tileWidthWorld).toInt())
        val endCol = (ceil(viewportRect.right / tileWidthWorld).toInt()).coerceAtMost(cols - 1)
        val startRow = max(0, floor(viewportRect.top / tileHeightWorld).toInt())
        val endRow = (ceil(viewportRect.bottom / tileHeightWorld).toInt()).coerceAtMost(rows - 1)

        val destRect = RectF()

        for (c in startCol..endCol) {
            for (r in startRow..endRow) {
                val key = TileKey(pageIndex, level, c, r).toString()
                val cached = tileCache.get(key)

                destRect.set(
                    c * tileWidthWorld,
                    r * tileHeightWorld,
                    (c + 1) * tileWidthWorld,
                    (r + 1) * tileHeightWorld
                )

                if (cached != null && !cached.isRecycled) {
                    canvas.drawBitmap(cached, null, destRect, paint)
                } else {
                    requestTileRender(pageIndex, level, c, r, onTileLoaded)
                }
            }
        }
    }

    private fun requestTileRender(
        pageIndex: Int,
        level: Int,
        col: Int,
        row: Int,
        onTileLoaded: () -> Unit
    ) {
        val key = TileKey(pageIndex, level, col, row).toString()
        synchronized(inFlightRequests) {
            if (inFlightRequests.contains(key)) return
            inFlightRequests.add(key)
        }

        scope.launch {
            val bitmap = renderTileBackground(pageIndex, level, col, row)
            if (bitmap != null) {
                tileCache.put(key, bitmap)
                synchronized(inFlightRequests) {
                    inFlightRequests.remove(key)
                }
                withContext(Dispatchers.Main) {
                    onTileLoaded()
                }
            } else {
                synchronized(inFlightRequests) {
                    inFlightRequests.remove(key)
                }
            }
        }
    }

    private fun renderTileBackground(
        pageIndex: Int,
        level: Int,
        col: Int,
        row: Int
    ): Bitmap? {
        val pdfRenderer = renderer ?: return null
        return try {
            val bitmap = Bitmap.createBitmap(tileSize, tileSize, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            canvas.drawColor(Color.WHITE)

            synchronized(pdfRenderer) {
                val page = pdfRenderer.openPage(pageIndex)
                val scale = level * 2f
                val matrix = Matrix().apply {
                    postScale(scale, scale)
                    postTranslate(-col * tileSize.toFloat(), -row * tileSize.toFloat())
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
            null
        }
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
        tileCache.evictAll()
        synchronized(inFlightRequests) {
            inFlightRequests.clear()
        }
    }
}
