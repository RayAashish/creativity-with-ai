package org.ledger.pdf

import android.net.Uri
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.ledger.pdf.engine.FakePdfEngine
import java.io.ByteArrayOutputStream

class MetadataScrubTest {

    private lateinit var fakeEngine: FakePdfEngine
    private val mockUri = mockk<Uri>(relaxed = true)

    @Before
    fun setup() {
        fakeEngine = FakePdfEngine()
    }

    @Test
    fun inspectMetadata_detectsSensitiveFields() = runBlocking {
        val diff = fakeEngine.inspectMetadata(mockUri)

        assertNotNull(diff)
        assertTrue(diff.hasXmpMetadata)
        assertEquals(4, diff.annotationCount)
        assertEquals(2, diff.thumbnailCount)

        val authorItem = diff.items.find { it.key == "Author" }
        assertNotNull(authorItem)
        assertEquals("Paranoid Professional", authorItem?.originalValue)

        val producerItem = diff.items.find { it.key == "Producer" }
        assertNotNull(producerItem)
        assertEquals("macOS Quartz PDF", producerItem?.originalValue)
    }

    @Test
    fun stripMetadata_executesAndOutputsScrubbedStream() = runBlocking {
        val outputStream = ByteArrayOutputStream()
        val diff = fakeEngine.stripMetadata(mockUri, outputStream, stripBookmarks = true)

        assertTrue(fakeEngine.executedOperations.contains("stripMetadata:stripBookmarks=true"))
        val outputBytes = outputStream.toByteArray()
        assertTrue(outputBytes.isNotEmpty())
        assertEquals("PDF_STRIPPED_DATA", String(outputBytes))
        assertTrue(diff.totalRemovableCount > 0)
    }
}
