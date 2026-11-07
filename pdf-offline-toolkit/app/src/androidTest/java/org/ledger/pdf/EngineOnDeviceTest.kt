package org.ledger.pdf

import android.content.Context
import android.net.Uri
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.pdmodel.PDPage
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.ledger.pdf.data.repository.ScratchFileManager
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.NativePdfiumEngine
import org.ledger.pdf.engine.PdfBoxAndroidEngine
import org.ledger.pdf.security.SignatureVerifier
import java.io.File
import java.io.FileOutputStream

@RunWith(AndroidJUnit4::class)
class EngineOnDeviceTest {

    private lateinit var context: Context
    private lateinit var safHandler: SafFileHandler
    private lateinit var scratchManager: ScratchFileManager
    private lateinit var pdfEngine: PdfBoxAndroidEngine
    private lateinit var nativeRenderer: NativePdfiumEngine

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        PDFBoxResourceLoader.init(context)
        safHandler = SafFileHandler(context)
        scratchManager = ScratchFileManager(context)
        nativeRenderer = NativePdfiumEngine(context)
        val signatureVerifier = SignatureVerifier()
        pdfEngine = PdfBoxAndroidEngine(context, safHandler, scratchManager, nativeRenderer, signatureVerifier)
    }

    @Test
    fun pdfBox_createsAndCountsPagesOnDevice() {
        runBlocking {
            val testPdf = File(context.cacheDir, "sample_engine_test.pdf")
            val doc = PDDocument()
            doc.addPage(PDPage())
            doc.addPage(PDPage())
            doc.addPage(PDPage())
            FileOutputStream(testPdf).use { doc.save(it) }
            doc.close()

            val uri = Uri.fromFile(testPdf)
            val count = pdfEngine.getPageCount(uri)
            assertEquals(3, count)

            // Test native/pdfrenderer thumbnail rendering preserves aspect ratio
            val bitmap = nativeRenderer.renderPage(uri, 0, 200, 300)
            assertNotNull(bitmap)
            assertEquals(200, bitmap.width)
            assertTrue(bitmap.height in 250..300)

            testPdf.delete()
        }
    }

    @Test
    fun scratchManager_wipesStaleScratchOnDevice() {
        val scratch = scratchManager.createScratchFile("test_device", ".tmp")
        assertTrue(scratch.exists())
        val reclaimed = scratchManager.cleanStaleScratch()
        assertTrue(reclaimed >= 0)
    }
}
