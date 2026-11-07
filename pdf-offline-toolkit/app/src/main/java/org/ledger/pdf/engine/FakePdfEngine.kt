package org.ledger.pdf.engine

import android.graphics.Bitmap
import android.net.Uri
import org.ledger.pdf.data.model.CompressLevel
import org.ledger.pdf.data.model.CompressMode
import org.ledger.pdf.data.model.MetadataDiff
import org.ledger.pdf.data.model.MetadataItem
import org.ledger.pdf.data.model.PageInfo
import org.ledger.pdf.data.model.SignatureInfo
import org.ledger.pdf.data.model.SplitMode
import java.io.OutputStream
import java.security.PrivateKey
import java.security.cert.Certificate

class FakePdfEngine : PdfEngine {
    var pageCountToReturn: Int = 5
    val executedOperations = mutableListOf<String>()

    override suspend fun getPageCount(uri: Uri): Int = pageCountToReturn

    override suspend fun getPageList(uri: Uri): List<PageInfo> {
        return (0 until pageCountToReturn).map { index ->
            PageInfo(pageIndex = index, width = 595, height = 842, rotation = 0)
        }
    }

    override suspend fun renderPage(
        uri: Uri,
        pageIndex: Int,
        targetWidth: Int,
        targetHeight: Int
    ): Bitmap {
        executedOperations.add("renderPage:$pageIndex")
        return Bitmap.createBitmap(targetWidth.coerceAtLeast(10), targetHeight.coerceAtLeast(10), Bitmap.Config.ARGB_8888)
    }

    override suspend fun merge(
        sources: List<Uri>,
        output: OutputStream,
        interleave: Boolean,
        onProgress: (Float) -> Unit
    ) {
        executedOperations.add("merge:${sources.size}:interleave=$interleave")
        output.write("PDF_MERGED_DATA".toByteArray())
        output.flush()
        onProgress(1.0f)
    }

    override suspend fun split(
        source: Uri,
        splitMode: SplitMode,
        outputSupplier: (partIndex: Int, totalParts: Int) -> OutputStream
    ) {
        executedOperations.add("split:$splitMode")
        outputSupplier(0, 1).use { out ->
            out.write("PDF_SPLIT_PART_0".toByteArray())
            out.flush()
        }
    }

    override suspend fun compress(
        source: Uri,
        output: OutputStream,
        mode: CompressMode,
        onProgress: (Float) -> Unit
    ): Pair<Long, Long> {
        executedOperations.add("compress:$mode")
        val fakeOriginal = 2_400_000L
        val fakeCompressed = 780_000L
        output.write("PDF_COMPRESSED_DATA".toByteArray())
        output.flush()
        onProgress(1.0f)
        return Pair(fakeOriginal, fakeCompressed)
    }

    override suspend fun inspectMetadata(source: Uri): MetadataDiff {
        executedOperations.add("inspectMetadata")
        return MetadataDiff(
            items = listOf(
                MetadataItem("Title", "Confidential Document"),
                MetadataItem("Author", "Paranoid Professional"),
                MetadataItem("Producer", "macOS Quartz PDF"),
                MetadataItem("Creator", "Ledger Offline"),
                MetadataItem("Creation Date", "2026-11-06"),
                MetadataItem("Modification Date", "2026-11-06"),
                MetadataItem("Keywords", "internal, financial"),
                MetadataItem("Subject", "Audit"),
                MetadataItem("Trapped", "False")
            ),
            hasXmpMetadata = true,
            annotationCount = 4,
            thumbnailCount = 2
        )
    }

    override suspend fun stripMetadata(
        source: Uri,
        output: OutputStream,
        stripBookmarks: Boolean
    ): MetadataDiff {
        executedOperations.add("stripMetadata:stripBookmarks=$stripBookmarks")
        output.write("PDF_STRIPPED_DATA".toByteArray())
        output.flush()
        return inspectMetadata(source)
    }

    override suspend fun signWithImageStamp(
        source: Uri,
        output: OutputStream,
        pageIndex: Int,
        stampBitmap: Bitmap,
        xPt: Float,
        yPt: Float,
        widthPt: Float,
        heightPt: Float,
        flatten: Boolean
    ) {
        executedOperations.add("signWithImageStamp:page=$pageIndex:flatten=$flatten")
        output.write("PDF_STAMPED_DATA".toByteArray())
        output.flush()
    }

    override suspend fun signCryptographic(
        source: Uri,
        output: OutputStream,
        privateKey: PrivateKey,
        certificateChain: Array<Certificate>,
        reason: String?,
        location: String?
    ) {
        executedOperations.add("signCryptographic:reason=$reason:location=$location")
        output.write("PDF_CRYPTO_SIGNED_DATA".toByteArray())
        output.flush()
    }

    override suspend fun verifySignatures(source: Uri): List<SignatureInfo> {
        executedOperations.add("verifySignatures")
        return listOf(
            SignatureInfo(
                signerName = "CN=Alice Smith",
                signDate = System.currentTimeMillis() - 86400000L,
                reason = "Approval",
                location = "Air-gapped Lab",
                isValid = true,
                digestAlgorithm = "2.16.840.1.101.3.4.2.1", // SHA-256
                certificateSubject = "CN=Alice Smith, O=Security Org, C=US"
            )
        )
    }

    override suspend fun rotatePages(
        source: Uri,
        output: OutputStream,
        rotations: Map<Int, Int>
    ) {
        executedOperations.add("rotatePages:$rotations")
        output.write("PDF_ROTATED_DATA".toByteArray())
        output.flush()
    }

    override suspend fun reorderPages(
        source: Uri,
        output: OutputStream,
        newOrder: List<Int>
    ) {
        executedOperations.add("reorderPages:$newOrder")
        output.write("PDF_REORDERED_DATA".toByteArray())
        output.flush()
    }

    override suspend fun deletePages(
        source: Uri,
        output: OutputStream,
        pagesToDelete: Set<Int>
    ) {
        executedOperations.add("deletePages:$pagesToDelete")
        output.write("PDF_DELETED_DATA".toByteArray())
        output.flush()
    }

    override suspend fun extractPages(
        source: Uri,
        output: OutputStream,
        pagesToExtract: List<Int>
    ) {
        executedOperations.add("extractPages:$pagesToExtract")
        output.write("PDF_EXTRACTED_DATA".toByteArray())
        output.flush()
    }

    override suspend fun ocrPages(
        source: Uri,
        output: OutputStream,
        language: String,
        pageIndices: List<Int>?,
        onProgress: (current: Int, total: Int) -> Unit
    ) {
        executedOperations.add("ocrPages:$language")
        output.write("PDF_OCR_DATA".toByteArray())
        output.flush()
        onProgress(pageCountToReturn, pageCountToReturn)
    }
}
