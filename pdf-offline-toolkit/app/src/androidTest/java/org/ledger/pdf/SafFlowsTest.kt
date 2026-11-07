package org.ledger.pdf

import android.content.Context
import android.net.Uri
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.ledger.pdf.data.saf.SafFileHandler
import java.io.File
import java.io.FileOutputStream

@RunWith(AndroidJUnit4::class)
class SafFlowsTest {

    private lateinit var context: Context
    private lateinit var safHandler: SafFileHandler

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        safHandler = SafFileHandler(context)
    }

    @Test
    fun getDocumentInfo_readsLocalFileUriCorrectly() {
        val testFile = File(context.cacheDir, "test_document.pdf")
        FileOutputStream(testFile).use { out ->
            out.write("TEST_PDF_BYTES".toByteArray())
        }

        val uri = Uri.fromFile(testFile)
        val info = safHandler.getDocumentInfo(uri)

        assertNotNull(info)
        assertEquals("test_document.pdf", info.name)
        assertEquals(testFile.length(), info.sizeBytes)

        testFile.delete()
    }

    @Test
    fun openStreams_readsAndWritesViaSafHandler() {
        val testFile = File(context.cacheDir, "stream_test.pdf")
        val uri = Uri.fromFile(testFile)

        // Write via openOutputStream
        safHandler.openOutputStream(uri)?.use { out ->
            out.write("LEDGER_OFFLINE_STREAM_DATA".toByteArray())
        }

        // Read via openInputStream
        val readBytes = safHandler.openInputStream(uri)?.use { input ->
            input.readBytes()
        }

        assertNotNull(readBytes)
        assertEquals("LEDGER_OFFLINE_STREAM_DATA", String(readBytes!!))

        testFile.delete()
    }
}
