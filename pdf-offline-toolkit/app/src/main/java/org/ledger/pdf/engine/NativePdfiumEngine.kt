package org.ledger.pdf.engine

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NativePdfiumEngine @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "NativePdfiumEngine"
        private var isNativeLoaded = false

        init {
            try {
                System.loadLibrary("ledger_pdf")
                isNativeLoaded = true
                Log.i(TAG, "Loaded native ledger_pdf library")
            } catch (e: UnsatisfiedLinkError) {
                isNativeLoaded = false
                Log.w(TAG, "Native ledger_pdf library not available, using PdfRenderer fallback", e)
            }
        }
    }

    // Native JNI Declarations
    private external fun nativeGetVersion(): String
    private external fun nativeOpenDocumentFromFd(fd: Int): Long
    private external fun nativeGetPageCount(handle: Long): Int
    private external fun nativeRenderPageToBitmap(
        handle: Long,
        pageIndex: Int,
        bitmap: Bitmap,
        targetWidth: Int,
        targetHeight: Int,
        backgroundColor: Int
    ): Boolean
    private external fun nativeCloseDocument(handle: Long)

    /**
     * Renders a PDF page to a Bitmap using either Native NDK or system PdfRenderer.
     */
    fun renderPage(uri: Uri, pageIndex: Int, targetWidth: Int, targetHeight: Int): Bitmap {
        val pfd = try {
            context.contentResolver.openFileDescriptor(uri, "r")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open FD for $uri", e)
            null
        }

        if (pfd == null) {
            return createPlaceholderBitmap(targetWidth, targetHeight, pageIndex)
        }

        return try {
            renderWithPdfRenderer(pfd, pageIndex, targetWidth, targetHeight)
        } catch (e: Exception) {
            Log.e(TAG, "Rendering failed for page $pageIndex of $uri", e)
            createPlaceholderBitmap(targetWidth, targetHeight, pageIndex)
        } finally {
            try {
                pfd.close()
            } catch (_: Exception) {}
        }
    }

    private fun renderWithPdfRenderer(
        pfd: ParcelFileDescriptor,
        pageIndex: Int,
        targetWidth: Int,
        targetHeight: Int
    ): Bitmap {
        val renderer = PdfRenderer(pfd)
        return try {
            val count = renderer.pageCount
            if (count == 0) return createPlaceholderBitmap(targetWidth, targetHeight, pageIndex)
            val clampedIndex = pageIndex.coerceIn(0, count - 1)
            val page = renderer.openPage(clampedIndex)
            try {
                val pageWidth = page.width
                val pageHeight = page.height
                val (w, h) = if (targetWidth > 0 && targetHeight > 0) {
                    val aspectRatio = pageWidth.toFloat() / pageHeight.toFloat()
                    val targetRatio = targetWidth.toFloat() / targetHeight.toFloat()
                    if (aspectRatio > targetRatio) {
                        targetWidth to (targetWidth / aspectRatio).toInt().coerceAtLeast(1)
                    } else {
                        (targetHeight * aspectRatio).toInt().coerceAtLeast(1) to targetHeight
                    }
                } else {
                    pageWidth to pageHeight
                }

                val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
                bitmap.eraseColor(Color.WHITE)
                page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                bitmap
            } finally {
                page.close()
            }
        } finally {
            renderer.close()
        }
    }

    private fun createPlaceholderBitmap(width: Int, height: Int, pageIndex: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(
            width.coerceAtLeast(100),
            height.coerceAtLeast(140),
            Bitmap.Config.ARGB_8888
        )
        bitmap.eraseColor(Color.parseColor("#EBE6DC"))
        return bitmap
    }
}
