package com.antigravity.note.document

import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PageMetadata
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.document.storage.PageWal
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.io.File

class PageWalTest {

    private lateinit var tempDir: File
    private lateinit var walFile: File
    private lateinit var wal: PageWal

    @Before
    fun setup() {
        tempDir = File.createTempFile("wal_test", "").apply {
            delete()
            mkdirs()
        }
        walFile = File(tempDir, "test_page.wal")
        wal = PageWal(walFile)
    }

    @After
    fun teardown() {
        tempDir.deleteRecursively()
    }

    @Test
    fun testWalEmptyInitialization() {
        assertFalse(wal.exists())
    }

    @Test
    fun testWalAppendClearAndReplay() {
        wal.appendClear()
        assertTrue(wal.exists())

        val page = DocumentPage(
            metadata = PageMetadata("p1", "nb1", 0, "Page 1")
        )
        val replayed = wal.replayInto(page)
        assertTrue(replayed)
        assertEquals(0, page.strokes.size)
    }

    @Test
    fun testWalDelete() {
        wal.appendClear()
        assertTrue(wal.exists())
        assertTrue(wal.deleteWal())
        assertFalse(wal.exists())
    }
}
