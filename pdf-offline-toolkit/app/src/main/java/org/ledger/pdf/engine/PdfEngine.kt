package org.ledger.pdf.engine

import android.graphics.Bitmap
import android.net.Uri
import org.ledger.pdf.data.model.CompressMode
import org.ledger.pdf.data.model.MetadataDiff
import org.ledger.pdf.data.model.PageInfo
import org.ledger.pdf.data.model.SignatureInfo
import org.ledger.pdf.data.model.SplitMode
import java.io.OutputStream
import java.security.PrivateKey
import java.security.cert.Certificate

interface PdfEngine {
    /**
     * Gets total page count for the PDF at uri.
     */
    suspend fun getPageCount(uri: Uri): Int

    /**
     * Returns detailed metadata for each page in the document.
     */
    suspend fun getPageList(uri: Uri): List<PageInfo>

    /**
     * Renders a specific page into an Android Bitmap using native Pdfium / PdfRenderer.
     */
    suspend fun renderPage(uri: Uri, pageIndex: Int, targetWidth: Int, targetHeight: Int): Bitmap

    /**
     * Merges multiple PDF files into one output stream.
     * If interleave is true, pages are taken round-robin from each document (e.g. front/back scan).
     */
    suspend fun merge(
        sources: List<Uri>,
        output: OutputStream,
        interleave: Boolean = false,
        onProgress: (Float) -> Unit = {}
    )

    /**
     * Splits a PDF according to the given SplitMode.
     */
    suspend fun split(
        source: Uri,
        splitMode: SplitMode,
        outputSupplier: (partIndex: Int, totalParts: Int) -> OutputStream
    )

    /**
     * Compresses the PDF via JPEG re-encoding, image downscaling, or rasterize-and-rebuild.
     * Returns Pair(originalBytes, newBytes).
     */
    suspend fun compress(
        source: Uri,
        output: OutputStream,
        mode: CompressMode,
        onProgress: (Float) -> Unit = {}
    ): Pair<Long, Long>

    /**
     * Inspects the PDF's metadata, annotations, XMP, and thumbnails to produce a diff preview.
     */
    suspend fun inspectMetadata(source: Uri): MetadataDiff

    /**
     * Strips all metadata (Info dictionary, XMP, annotations, embedded thumbnails, and optionally bookmarks).
     */
    suspend fun stripMetadata(
        source: Uri,
        output: OutputStream,
        stripBookmarks: Boolean = true
    ): MetadataDiff

    /**
     * Embeds a visual signature stamp onto a specific page.
     */
    suspend fun signWithImageStamp(
        source: Uri,
        output: OutputStream,
        pageIndex: Int,
        stampBitmap: Bitmap,
        xPt: Float,
        yPt: Float,
        widthPt: Float,
        heightPt: Float,
        flatten: Boolean = true
    )

    /**
     * Cryptographically signs the PDF using BouncyCastle PAdES.
     */
    suspend fun signCryptographic(
        source: Uri,
        output: OutputStream,
        privateKey: PrivateKey,
        certificateChain: Array<Certificate>,
        reason: String? = null,
        location: String? = null
    )

    /**
     * Verifies existing digital signatures in the PDF.
     */
    suspend fun verifySignatures(source: Uri): List<SignatureInfo>

    /**
     * Rotates specified pages clockwise (e.g. pageIndex -> 90, 180, 270).
     */
    suspend fun rotatePages(
        source: Uri,
        output: OutputStream,
        rotations: Map<Int, Int>
    )

    /**
     * Reorders pages by a list of 0-based indices.
     */
    suspend fun reorderPages(
        source: Uri,
        output: OutputStream,
        newOrder: List<Int>
    )

    /**
     * Deletes specified pages from the document.
     */
    suspend fun deletePages(
        source: Uri,
        output: OutputStream,
        pagesToDelete: Set<Int>
    )

    /**
     * Extracts selected pages into a new PDF.
     */
    suspend fun extractPages(
        source: Uri,
        output: OutputStream,
        pagesToExtract: List<Int>
    )

    /**
     * Runs air-gapped OCR using bundled Tesseract, rasterizing pages and injecting searchable text.
     */
    suspend fun ocrPages(
        source: Uri,
        output: OutputStream,
        language: String,
        pageIndices: List<Int>? = null,
        onProgress: (current: Int, total: Int) -> Unit = { _, _ -> }
    )
}
