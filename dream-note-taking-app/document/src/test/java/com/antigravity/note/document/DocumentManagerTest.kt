package com.antigravity.note.document

import com.antigravity.note.document.manager.DocumentManager
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.document.storage.PageRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Before
import org.junit.Test
import java.io.File

class DocumentManagerTest {

    private lateinit var tempDir: File
    private lateinit var repository: PageRepository
    private lateinit var documentManager: DocumentManager

    @Before
    fun setup() {
        tempDir = File.createTempFile("doc_mgr_test", "").apply {
            delete()
            mkdirs()
        }
        repository = PageRepository(tempDir, Dispatchers.Unconfined)
        documentManager = DocumentManager(repository, "test_notebook", Dispatchers.Unconfined)
    }

    @After
    fun teardown() {
        tempDir.deleteRecursively()
    }

    @Test
    fun testInitializationCreatesFirstPage() = runBlocking {
        documentManager.initialize("test_notebook")
        val current = documentManager.currentPage.value
        assertNotNull(current)
        assertEquals("Page 1", current?.metadata?.title)
        assertEquals(PaperTemplate.RULED, current?.metadata?.template)
        assertEquals(1, documentManager.pagesList.value.size)
    }

    @Test
    fun testAddNewPageAndNavigation() = runBlocking {
        documentManager.initialize("test_notebook")
        documentManager.addNewPage(PaperTemplate.GRID)

        val current = documentManager.currentPage.value
        assertNotNull(current)
        assertEquals("Page 2", current?.metadata?.title)
        assertEquals(PaperTemplate.GRID, current?.metadata?.template)
        assertEquals(2, documentManager.pagesList.value.size)

        // Previous page
        documentManager.previousPage()
        val prev = documentManager.currentPage.value
        assertEquals("Page 1", prev?.metadata?.title)

        // Next page
        documentManager.nextPage()
        val next = documentManager.currentPage.value
        assertEquals("Page 2", next?.metadata?.title)
    }

    @Test
    fun testChangePaperTemplate() = runBlocking {
        documentManager.initialize("test_notebook")
        documentManager.setPaperTemplate(PaperTemplate.CORNELL)

        val current = documentManager.currentPage.value
        assertEquals(PaperTemplate.CORNELL, current?.metadata?.template)
    }
}
