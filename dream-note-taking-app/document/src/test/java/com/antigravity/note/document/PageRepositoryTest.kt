package com.antigravity.note.document

import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PageMetadata
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.document.storage.PageRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.io.File

class PageRepositoryTest {

    private lateinit var tempDir: File
    private lateinit var repository: PageRepository

    @Before
    fun setup() {
        tempDir = File.createTempFile("repo_test", "").apply {
            delete()
            mkdirs()
        }
        repository = PageRepository(tempDir, Dispatchers.Unconfined)
    }

    @After
    fun teardown() {
        tempDir.deleteRecursively()
    }

    @Test
    fun testAtomicSaveAndLoadPage() = runBlocking {
        val page = repository.createPage("nb_algo", 0, PaperTemplate.CORNELL, "DSA Array Two Pointers")
        val saved = repository.savePageAtomic(page)
        assertTrue(saved)

        val (loadedPage, openLatencyMs) = repository.loadPage("nb_algo", page.metadata.pageId)
        assertNotNull(loadedPage)
        assertEquals(page.metadata.pageId, loadedPage.metadata.pageId)
        assertEquals("DSA Array Two Pointers", loadedPage.metadata.title)
        assertEquals(PaperTemplate.CORNELL, loadedPage.metadata.template)
        assertEquals(0, loadedPage.strokes.size)

        // Hard budget: Page load must be < 100 ms
        assertTrue("Page open latency ($openLatencyMs ms) must be < 100ms", openLatencyMs < 100L)
    }

    @Test
    fun testListMultiplePagesSorted() = runBlocking {
        val p2 = repository.createPage("nb_list", 1, PaperTemplate.GRID, "Page 2")
        val p1 = repository.createPage("nb_list", 0, PaperTemplate.RULED, "Page 1")
        val p3 = repository.createPage("nb_list", 2, PaperTemplate.BLANK, "Page 3")

        repository.savePageAtomic(p2)
        repository.savePageAtomic(p1)
        repository.savePageAtomic(p3)

        val pages = repository.listPages("nb_list")
        assertEquals(3, pages.size)
        assertEquals("Page 1", pages[0].title)
        assertEquals(0, pages[0].pageIndex)
        assertEquals("Page 2", pages[1].title)
        assertEquals(1, pages[1].pageIndex)
        assertEquals("Page 3", pages[2].title)
        assertEquals(2, pages[2].pageIndex)
    }

    @Test
    fun testDeletePage() = runBlocking {
        val p = repository.createPage("nb_del", 0, PaperTemplate.RULED, "To Delete")
        repository.savePageAtomic(p)

        val initialList = repository.listPages("nb_del")
        assertEquals(1, initialList.size)

        val deleted = repository.deletePage("nb_del", p.metadata.pageId)
        assertTrue(deleted)

        val afterList = repository.listPages("nb_del")
        assertEquals(0, afterList.size)
    }
}
