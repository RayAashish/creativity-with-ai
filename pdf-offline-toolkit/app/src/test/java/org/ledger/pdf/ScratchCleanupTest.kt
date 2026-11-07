package org.ledger.pdf

import android.content.Context
import io.mockk.every
import io.mockk.mockk
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.ledger.pdf.data.repository.ScratchFileManager
import java.io.File

class ScratchCleanupTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    private lateinit var mockContext: Context
    private lateinit var scratchFileManager: ScratchFileManager

    @Before
    fun setup() {
        mockContext = mockk(relaxed = true)
        every { mockContext.cacheDir } returns tempFolder.root
        scratchFileManager = ScratchFileManager(mockContext)
    }

    @Test
    fun withScratchFile_deletesFileImmediatelyAfterExecution() {
        var createdFilePath: String? = null

        scratchFileManager.withScratchFile("test_prefix", ".pdf") { file ->
            assertTrue(file.exists())
            file.writeText("sensitive intermediate bytes")
            createdFilePath = file.absolutePath
            assertTrue(File(createdFilePath!!).exists())
        }

        assertNotNull(createdFilePath)
        assertFalse("Scratch file must be deleted after lambda exits", File(createdFilePath!!).exists())
    }

    @Test
    fun withScratchFile_deletesFileEvenWhenExceptionThrown() {
        var createdFilePath: String? = null

        try {
            scratchFileManager.withScratchFile("fail_test", ".pdf") { file ->
                file.writeText("doomed content")
                createdFilePath = file.absolutePath
                throw RuntimeException("Simulated failure during PDF processing")
            }
        } catch (_: RuntimeException) {}

        assertNotNull(createdFilePath)
        assertFalse("Scratch file must be deleted even on exception", File(createdFilePath!!).exists())
    }

    @Test
    fun cleanStaleScratch_wipesAllStaleFilesAndReclaimsBytes() {
        val f1 = scratchFileManager.createScratchFile("stale1")
        f1.writeBytes(ByteArray(1024))

        val f2 = scratchFileManager.createScratchFile("stale2")
        f2.writeBytes(ByteArray(2048))

        assertEquals(3072L, scratchFileManager.getScratchSizeBytes())

        val reclaimed = scratchFileManager.cleanStaleScratch()
        assertEquals(3072L, reclaimed)
        assertEquals(0L, scratchFileManager.getScratchSizeBytes())
        assertFalse(f1.exists())
        assertFalse(f2.exists())
    }
}
