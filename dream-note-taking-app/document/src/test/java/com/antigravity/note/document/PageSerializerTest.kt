package com.antigravity.note.document

import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PageMetadata
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.document.storage.PageSerializer
import org.junit.Assert.assertEquals
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

class PageSerializerTest {

    @Test
    fun testEmptyPageSerializationAndDeserialization() {
        val metadata = PageMetadata(
            pageId = "test_page_1",
            notebookId = "test_notebook",
            pageIndex = 0,
            title = "Algorithmic Analysis",
            template = PaperTemplate.GRID,
            strokeCount = 0
        )
        val originalPage = DocumentPage(metadata = metadata)

        val out = ByteArrayOutputStream()
        PageSerializer.serialize(originalPage, out)
        val bytes = out.toByteArray()

        val inStream = ByteArrayInputStream(bytes)
        val deserialized = PageSerializer.deserialize(inStream)

        assertEquals("test_page_1", deserialized.metadata.pageId)
        assertEquals("test_notebook", deserialized.metadata.notebookId)
        assertEquals(0, deserialized.metadata.pageIndex)
        assertEquals("Algorithmic Analysis", deserialized.metadata.title)
        assertEquals(PaperTemplate.GRID, deserialized.metadata.template)
        assertEquals(0, deserialized.strokes.size)
    }
}
