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
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.UUID

class PageRepository(
    val rootDir: File,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val repositoryScope = CoroutineScope(SupervisorJob() + ioDispatcher)
    private val fileMutex = Mutex()

    var onPageSavedListener: ((notebookId: String, pageId: String, file: File) -> Unit)? = null
    var onPageDeletedListener: ((notebookId: String, pageId: String) -> Unit)? = null

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

    fun getAssetsDir(notebookId: String): File {
        val dir = File(getNotebookDir(notebookId), "assets")
        if (!dir.exists()) dir.mkdirs()
        return dir
    }

    fun getAssetFile(notebookId: String, assetRef: String): File {
        return File(getAssetsDir(notebookId), assetRef)
    }

    fun getPageFile(notebookId: String, pageId: String): File {
        return File(getPagesDir(notebookId), "$pageId.inkpage")
    }

    private fun getWalFile(notebookId: String, pageId: String): File {
        return File(getPagesDir(notebookId), "$pageId.wal")
    }

    private fun getSnapshotsDir(notebookId: String, pageId: String): File {
        return File(getPagesDir(notebookId), "snapshots_$pageId").apply {
            if (!exists()) mkdirs()
        }
    }

    private fun createSnapshot(notebookId: String, pageId: String, pageFile: File) {
        try {
            val dir = getSnapshotsDir(notebookId, pageId)
            val timestamp = System.currentTimeMillis()
            val snapFile = File(dir, "$pageId.$timestamp.snapshot")
            pageFile.copyTo(snapFile, overwrite = true)

            // Keep only the last 5 rolling versions
            val allSnaps = dir.listFiles { f -> f.name.endsWith(".snapshot") }
                ?.sortedBy { it.lastModified() } ?: emptyList()
            if (allSnaps.size > 5) {
                for (i in 0 until (allSnaps.size - 5)) {
                    allSnaps[i].delete()
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun restoreFromBestSnapshot(notebookId: String, pageId: String): DocumentPage? {
        val dir = getSnapshotsDir(notebookId, pageId)
        val allSnaps = dir.listFiles { f -> f.name.endsWith(".snapshot") }
            ?.sortedByDescending { it.lastModified() } ?: emptyList()

        for (snap in allSnaps) {
            try {
                val page = FileInputStream(snap).use { fis ->
                    BufferedInputStream(fis).use { bis ->
                        PageSerializer.deserialize(bis)
                    }
                }
                val pageFile = getPageFile(notebookId, pageId)
                snap.copyTo(pageFile, overwrite = true)
                android.util.Log.w("PageRepository", "Restored corrupted page $pageId from rolling snapshot: ${snap.name}")
                return page
            } catch (_: Exception) {
                // Try next snapshot
            }
        }
        return null
    }

    suspend fun loadPage(notebookId: String, pageId: String): Pair<DocumentPage, Long> = withContext(ioDispatcher) {
        fileMutex.withLock {
            val startTime = System.currentTimeMillis()
            val pageFile = getPageFile(notebookId, pageId)
            val walFile = getWalFile(notebookId, pageId)
            val wal = PageWal(walFile)

            var page: DocumentPage = try {
                if (pageFile.exists() && pageFile.length() > 0L) {
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
                            template = PaperTemplate.GRID
                        )
                    )
                }
            } catch (e: Throwable) {
                android.util.Log.e("PageRepository", "Page load failure (corruption/checksum), attempting snapshot restore", e)
                val restored = restoreFromBestSnapshot(notebookId, pageId)
                restored ?: DocumentPage(
                    metadata = PageMetadata(
                        pageId = pageId,
                        notebookId = notebookId,
                        pageIndex = 0,
                        title = "Page 1",
                        template = PaperTemplate.GRID
                    )
                )
            }

            // Replay WAL only if it is strictly newer than pageFile (crash recovery)
            if (wal.exists()) {
                if (pageFile.exists() && walFile.lastModified() <= pageFile.lastModified()) {
                    // Stale WAL already compacted; delete to prevent stroke duplication
                    wal.deleteWal()
                } else {
                    val recovered = wal.replayInto(page)
                    if (recovered) {
                        savePageAtomicInternal(page)
                    }
                }
            }

            val openLatencyMs = System.currentTimeMillis() - startTime
            Pair(page, openLatencyMs)
        }
    }

    suspend fun savePageAtomic(page: DocumentPage): Boolean = withContext(ioDispatcher) {
        fileMutex.withLock {
            savePageAtomicInternal(page)
        }
    }

    private fun savePageAtomicInternal(page: DocumentPage): Boolean {
        val meta = page.metadata
        val pageFile = getPageFile(meta.notebookId, meta.pageId)
        val tmpFile = File(pageFile.parentFile, "${meta.pageId}.tmp")
        val wal = PageWal(getWalFile(meta.notebookId, meta.pageId))

        return try {
            FileOutputStream(tmpFile).use { fos ->
                BufferedOutputStream(fos).use { bos ->
                    PageSerializer.serialize(page, bos)
                    bos.flush()
                }
                try {
                    fos.fd.sync()
                } catch (_: Exception) {}
            }

            val renamed = tmpFile.renameTo(pageFile)
            if (renamed) {
                createSnapshot(meta.notebookId, meta.pageId, pageFile)
                wal.deleteWal()
                onPageSavedListener?.invoke(meta.notebookId, meta.pageId, pageFile)
            }
            renamed
        } catch (e: Exception) {
            e.printStackTrace()
            if (tmpFile.exists()) tmpFile.delete()
            false
        }
    }

    fun appendStrokeAsync(notebookId: String, pageId: String, stroke: Stroke, strokeId: String = java.util.UUID.randomUUID().toString()) {
        repositoryScope.launch {
            fileMutex.withLock {
                val wal = PageWal(getWalFile(notebookId, pageId))
                wal.appendAddStroke(stroke, strokeId)
            }
        }
    }

    fun appendUndoAsync(notebookId: String, pageId: String) {
        repositoryScope.launch {
            fileMutex.withLock {
                val wal = PageWal(getWalFile(notebookId, pageId))
                wal.appendRemoveLast()
            }
        }
    }

    fun appendClearAsync(notebookId: String, pageId: String) {
        repositoryScope.launch {
            fileMutex.withLock {
                val wal = PageWal(getWalFile(notebookId, pageId))
                wal.appendClear()
            }
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
                        val meta = PageSerializer.deserializeMetadata(bis)
                        list.add(meta)
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
        template: PaperTemplate = PaperTemplate.GRID,
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
        if (deleted) {
            onPageDeletedListener?.invoke(notebookId, pageId)
        }
        deleted
    }
}
