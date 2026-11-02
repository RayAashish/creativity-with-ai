package com.antigravity.note.inkengine.export

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.pdf.PdfDocument
import androidx.ink.rendering.android.canvas.CanvasStrokeRenderer
import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.storage.PageSerializer
import com.antigravity.note.inkengine.canvas.PaperBackgroundRenderer
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

/**
 * High-performance exporter for vector notebooks and pages.
 * Supports:
 * 1. Lossless .inkflow ZIP bundles (manifest, binary stroke pages, audio/media).
 * 2. Multi-page vector PDF documents.
 * 3. High-resolution flattened PNG images.
 */
object PageExporter {

    private val strokeRenderer by lazy { CanvasStrokeRenderer.create() }
    private val identityMatrix by lazy { Matrix() }

    /**
     * Export a single page to a flattened vector PDF document.
     */
    fun exportToPdf(
        page: DocumentPage,
        outputStream: OutputStream,
        width: Int = 2190,
        height: Int = 3504
    ) {
        exportMultiplePagesToPdf(listOf(page), outputStream, width, height)
    }

    /**
     * Export multiple pages to a single multi-page vector PDF document.
     */
    fun exportMultiplePagesToPdf(
        pages: List<DocumentPage>,
        outputStream: OutputStream,
        width: Int = 2190,
        height: Int = 3504
    ) {
        val pdfDocument = PdfDocument()

        try {
            for ((index, page) in pages.withIndex()) {
                val pageInfo = PdfDocument.PageInfo.Builder(width, height, index + 1).create()
                val pdfPage = pdfDocument.startPage(pageInfo)
                val canvas = pdfPage.canvas

                // Draw paper template
                PaperBackgroundRenderer.drawPaper(
                    canvas = canvas,
                    template = page.metadata.template,
                    width = width.toFloat(),
                    height = height.toFloat()
                )

                // Render vector ink strokes
                for (stroke in page.strokes) {
                    strokeRenderer.draw(canvas, stroke, identityMatrix)
                }

                pdfDocument.finishPage(pdfPage)
            }

            pdfDocument.writeTo(outputStream)
        } finally {
            pdfDocument.close()
        }
    }

    /**
     * Export a single page to a high-resolution PNG image.
     */
    fun exportToPng(
        page: DocumentPage,
        outputStream: OutputStream,
        width: Int = 2190,
        height: Int = 3504
    ) {
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        try {
            // Draw paper template
            PaperBackgroundRenderer.drawPaper(
                canvas = canvas,
                template = page.metadata.template,
                width = width.toFloat(),
                height = height.toFloat()
            )

            // Render vector ink strokes
            for (stroke in page.strokes) {
                strokeRenderer.draw(canvas, stroke, identityMatrix)
            }

            bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
        } finally {
            bitmap.recycle()
        }
    }

    /**
     * Export an entire notebook as a lossless .inkflow ZIP bundle.
     */
    fun exportToInkflow(
        manifest: InkflowManifest,
        pages: List<DocumentPage>,
        mediaFiles: Map<String, File> = emptyMap(),
        outputStream: OutputStream
    ) {
        val zipOut = ZipOutputStream(outputStream.buffered())

        try {
            // 1. Write manifest.json
            val manifestEntry = ZipEntry("manifest.json")
            zipOut.putNextEntry(manifestEntry)
            val manifestBytes = manifest.toJsonString().toByteArray(Charsets.UTF_8)
            zipOut.write(manifestBytes)
            zipOut.closeEntry()

            // 2. Write each page binary file
            for (page in pages) {
                val pageEntry = ZipEntry("pages/${page.metadata.pageId}.inkpage")
                zipOut.putNextEntry(pageEntry)
                // Write page directly into zip stream
                PageSerializer.serialize(page, zipOut)
                zipOut.closeEntry()
            }

            // 3. Write media files (audio recordings, etc.)
            for ((fileName, file) in mediaFiles) {
                if (file.exists() && file.isFile) {
                    val mediaEntry = ZipEntry("media/$fileName")
                    zipOut.putNextEntry(mediaEntry)
                    file.inputStream().buffered().use { fileIn ->
                        fileIn.copyTo(zipOut)
                    }
                    zipOut.closeEntry()
                }
            }

            zipOut.flush()
        } finally {
            zipOut.close()
        }
    }

    /**
     * Import and deserialize a lossless .inkflow ZIP bundle.
     */
    fun importFromInkflow(
        inputStream: InputStream
    ): Pair<InkflowManifest, List<DocumentPage>> {
        val zipIn = ZipInputStream(inputStream.buffered())
        var manifest: InkflowManifest? = null
        val pages = mutableListOf<DocumentPage>()
        val pageByteMap = mutableMapOf<String, ByteArray>()

        try {
            var entry: ZipEntry? = zipIn.nextEntry
            while (entry != null) {
                val name = entry.name
                if (name == "manifest.json") {
                    val baos = ByteArrayOutputStream()
                    zipIn.copyTo(baos)
                    manifest = InkflowManifest.fromJsonString(baos.toString("UTF-8"))
                } else if (name.startsWith("pages/") && name.endsWith(".inkpage")) {
                    val baos = ByteArrayOutputStream()
                    zipIn.copyTo(baos)
                    pageByteMap[name] = baos.toByteArray()
                }
                zipIn.closeEntry()
                entry = zipIn.nextEntry
            }

            if (manifest == null) {
                throw IllegalStateException("Invalid .inkflow archive: manifest.json missing")
            }

            // Deserialize pages in the manifest order
            for (pageEntry in manifest.pages) {
                val path = "pages/${pageEntry.pageId}.inkpage"
                val bytes = pageByteMap[path]
                if (bytes != null) {
                    val page = PageSerializer.deserialize(ByteArrayInputStream(bytes))
                    pages.add(page)
                }
            }

            return Pair(manifest, pages)
        } finally {
            zipIn.close()
        }
    }
}
