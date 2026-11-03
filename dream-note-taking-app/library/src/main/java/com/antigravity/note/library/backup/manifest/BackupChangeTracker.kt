package com.antigravity.note.library.backup.manifest

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.io.File
import java.util.concurrent.ConcurrentHashMap

class BackupChangeTracker(
    private val manifestDao: BackupManifestDao,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + ioDispatcher)
) {
    private val debounceJobs = ConcurrentHashMap<String, Job>()
    private val lock = Mutex()

    companion object {
        fun makePagePath(notebookId: String, pageId: String): String =
            "notebooks/$notebookId/pages/$pageId.inkflow"

        fun makePageThumbPath(notebookId: String, pageId: String): String =
            "notebooks/$notebookId/pages/$pageId.thumb.webp"

        const val LIBRARY_METADATA_PATH = "library.json"
        const val BACKUP_META_PATH = "backup-meta.json"
    }

    /**
     * Debounced save notification called after auto-save / stroke batch commit.
     * Guarantees calculation occurs off-thread and only once writing stabilizes.
     */
    fun schedulePageSave(
        notebookId: String,
        pageId: String,
        pageFile: File,
        debounceMs: Long = 1000L
    ) {
        val path = makePagePath(notebookId, pageId)
        debounceJobs[path]?.cancel()
        debounceJobs[path] = scope.launch {
            delay(debounceMs)
            onPageSavedImmediate(notebookId, pageId, pageFile)
            debounceJobs.remove(path)
        }
    }

    /**
     * Immediate hash and dirty evaluation (for explicit saves or unit tests).
     */
    suspend fun onPageSavedImmediate(
        notebookId: String,
        pageId: String,
        pageFile: File
    ) = withContext(ioDispatcher) {
        val path = makePagePath(notebookId, pageId)
        if (!pageFile.exists() || pageFile.length() == 0L) return@withContext

        val hash = HashUtils.computeSha256(pageFile)
        val size = pageFile.length()

        lock.withLock {
            val existing = manifestDao.getByPath(path)
            if (existing != null && existing.contentHash == hash && existing.state == ManifestState.CLEAN) {
                // Content is identical and already clean: no-op edit, keep clean
                return@withLock
            }

            // Otherwise, marked as DIRTY with new hash
            val updated = BackupManifestEntity(
                path = path,
                contentHash = hash,
                sizeBytes = size,
                lastBackedUpCommitSha = existing?.lastBackedUpCommitSha,
                state = ManifestState.DIRTY,
                updatedAt = System.currentTimeMillis()
            )
            manifestDao.insertOrUpdate(updated)
        }
    }

    suspend fun onPageDeleted(notebookId: String, pageId: String) = withContext(ioDispatcher) {
        val path = makePagePath(notebookId, pageId)
        debounceJobs.remove(path)?.cancel()

        lock.withLock {
            val existing = manifestDao.getByPath(path)
            if (existing != null) {
                if (existing.lastBackedUpCommitSha != null) {
                    // It was previously backed up to remote: mark DELETED tombstone
                    manifestDao.insertOrUpdate(
                        existing.copy(
                            state = ManifestState.DELETED,
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                } else {
                    // Never backed up to remote: simply delete from local manifest
                    manifestDao.deletePermanently(path)
                }
            }
        }
    }

    suspend fun onContentSaved(path: String, bytes: ByteArray) = withContext(ioDispatcher) {
        val hash = HashUtils.computeSha256(bytes)
        val size = bytes.size.toLong()

        lock.withLock {
            val existing = manifestDao.getByPath(path)
            if (existing != null && existing.contentHash == hash && existing.state == ManifestState.CLEAN) {
                return@withLock
            }

            val updated = BackupManifestEntity(
                path = path,
                contentHash = hash,
                sizeBytes = size,
                lastBackedUpCommitSha = existing?.lastBackedUpCommitSha,
                state = ManifestState.DIRTY,
                updatedAt = System.currentTimeMillis()
            )
            manifestDao.insertOrUpdate(updated)
        }
    }

    suspend fun onContentDeleted(path: String) = withContext(ioDispatcher) {
        lock.withLock {
            val existing = manifestDao.getByPath(path)
            if (existing != null) {
                if (existing.lastBackedUpCommitSha != null) {
                    manifestDao.insertOrUpdate(
                        existing.copy(
                            state = ManifestState.DELETED,
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                } else {
                    manifestDao.deletePermanently(path)
                }
            }
        }
    }
}
