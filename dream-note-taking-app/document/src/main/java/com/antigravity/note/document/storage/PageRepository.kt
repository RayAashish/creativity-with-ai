package com.antigravity.note.document.storage

import androidx.ink.strokes.Stroke
import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PageMetadata
import com.antigravity.note.document.model.PaperTemplate
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.UUID

class PageRepository(
    private val rootDir: File,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val repositoryScope = CoroutineScope(SupervisorJob() + ioDispatcher)

    init {
        if (!rootDir.exists()) {
            rootDir.mkdirs()
        }
    }

    private fun getNotebookDir(notebookId: String): File {
        val dir = File(rootDir, notebookId)
        if (!dir.exists()) dir.mkdirs()
        return dir
    }

    private fun getPagesDir(notebookId: String): File {
        val dir = File(getNotebookDir(notebookId), "pages")
        if (!dir.exists()) dir.mkdirs()
        return dir
    }

    private fun getPageFile(notebookId: String, pageId: String): File {
        return File(getPagesDir(notebookId), "$pageId.inkpage")
    }

    private fun getWalFile(notebookId: String, pageId: String): File {
        return File(getPagesDir(notebookId), "$pageId.wal")
    }

    suspend fun loadPage(notebookId: String, pageId: String): Pair<DocumentPage, Long> = withContext(ioDispatcher) {
        val startTime = System.currentTimeMillis()
        val pageFile = getPageFile(notebookId, pageId)
        val walFile = getWalFile(notebookId, pageId)
        val wal = PageWal(walFile)

        val page: DocumentPage = if (pageFile.exists() && pageFile.length() > 0L) {
            FileInputStream(pageFile).use { fis ->
                BufferedInputStream(fis).use { bis ->
                    PageSerializer.deserialize(bis)
                }
            }
        } else {
            // New blank/ruled page
            DocumentPage(
                metadata = PageMetadata(
                    pageId = pageId,
                    notebookId = notebookId,
                    pageIndex = 0,
                    title = "Page 1",
                    template = PaperTemplate.RULED
                )
            )
        }

        // Replay WAL if present (crash recovery)
        if (wal.exists()) {
            val recovered = wal.replayInto(page)
            if (recovered) {
                // Compact asynchronously
                savePageAtomic(page)
            }
        }

        val openLatencyMs = System.currentTimeMillis() - startTime
        Pair(page, openLatencyMs)
    }

    suspend fun savePageAtomic(page: DocumentPage): Boolean = withContext(ioDispatcher) {
        val meta = page.metadata
        val pageFile = getPageFile(meta.notebookId, meta.pageId)
        val tmpFile = File(pageFile.parentFile, "${meta.pageId}.tmp")
        val wal = PageWal(getWalFile(meta.notebookId, meta.pageId))

        try {
            FileOutputStream(tmpFile).use { fos ->
                BufferedOutputStream(fos).use { bos ->
                    PageSerializer.serialize(page, bos)
                    bos.flush()
                }
                try {
                    fos.fd.sync() // Ensure physical flush to storage media
                } catch (_: Exception) {
                    // Ignored if host filesystem does not support fsync (e.g. test environment)
                }
            }

            // Atomic rename
            val renamed = tmpFile.renameTo(pageFile)
            if (renamed) {
                // Compaction: clean up replayed WAL
                wal.deleteWal()
            }
            renamed
        } catch (e: Exception) {
            e.printStackTrace()
            if (tmpFile.exists()) tmpFile.delete()
            false
        }
    }

    fun appendStrokeAsync(notebookId: String, pageId: String, stroke: Stroke) {
        repositoryScope.launch {
            val wal = PageWal(getWalFile(notebookId, pageId))
            wal.appendAddStroke(stroke)
        }
    }

    fun appendUndoAsync(notebookId: String, pageId: String) {
        repositoryScope.launch {
            val wal = PageWal(getWalFile(notebookId, pageId))
            wal.appendRemoveLast()
        }
    }

    fun appendClearAsync(notebookId: String, pageId: String) {
        repositoryScope.launch {
            val wal = PageWal(getWalFile(notebookId, pageId))
            wal.appendClear()
        }
    }

    suspend fun listPages(notebookId: String): List<PageMetadata> = withContext(ioDispatcher) {
        val pagesDir = getPagesDir(notebookId)
        val pageFiles = pagesDir.listFiles { _, name -> name.endsWith(".inkpage") } ?: emptyArray()

        val list = mutableListOf<PageMetadata>()
        for (file in pageFiles) {
            try {
                FileInputStream(file).use { fis ->
                    BufferedInputStream(fis).use { bis ->
                        val page = PageSerializer.deserialize(bis)
                        list.add(page.metadata)
                    }
                }
            } catch (e: Exception) {
                // Ignore corrupt or incomplete file
            }
        }
        list.sortBy { it.pageIndex }
        list
    }

    fun createPage(
        notebookId: String,
        pageIndex: Int,
        template: PaperTemplate = PaperTemplate.RULED,
        title: String? = null
    ): DocumentPage {
        val pageId = UUID.randomUUID().toString()
        val defaultTitle = title ?: "Page ${pageIndex + 1}"
        return DocumentPage(
            metadata = PageMetadata(
                pageId = pageId,
                notebookId = notebookId,
                pageIndex = pageIndex,
                title = defaultTitle,
                template = template
            )
        )
    }

    suspend fun deletePage(notebookId: String, pageId: String): Boolean = withContext(ioDispatcher) {
        val pageFile = getPageFile(notebookId, pageId)
        val walFile = getWalFile(notebookId, pageId)
        var deleted = true
        if (pageFile.exists()) deleted = deleted && pageFile.delete()
        if (walFile.exists()) walFile.delete()
        deleted
    }
}
