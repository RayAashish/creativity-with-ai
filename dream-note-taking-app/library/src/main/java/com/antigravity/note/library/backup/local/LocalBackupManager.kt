package com.antigravity.note.library.backup.local

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import androidx.documentfile.provider.DocumentFile
import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.library.backup.model.FolderBackupItem
import com.antigravity.note.library.backup.model.LibraryHierarchyBackup
import com.antigravity.note.library.backup.model.NotebookBackupItem
import com.antigravity.note.library.backup.model.PageBackupItem
import com.antigravity.note.library.db.FolderEntity
import com.antigravity.note.library.db.NoteDatabase
import com.antigravity.note.library.db.NotebookEntity
import com.antigravity.note.library.db.PageEntity
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream
import java.util.concurrent.ConcurrentHashMap

enum class LocalSyncStatus {
    SYNCED,
    DIRTY,
    SYNCING,
    OFFLINE,
    ERROR
}

sealed class ExistingNotesDetection {
    object NotFound : ExistingNotesDetection()
    data class Found(
        val folderDisplayPath: String,
        val pageCount: Int,
        val notebookCount: Int,
        val sourceUri: Uri? = null,
        val sourceDirectDir: File? = null
    ) : ExistingNotesDetection()
}

data class LocalMirrorResult(
    val success: Boolean,
    val mirroredPages: Int = 0,
    val error: String? = null
)

data class LocalRestoreResult(
    val success: Boolean,
    val restoredPages: Int = 0,
    val restoredNotebooks: Int = 0,
    val error: String? = null
)

class LocalBackupManager(
    private val context: Context,
    private val database: NoteDatabase,
    private val pageRepository: PageRepository,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val scope = CoroutineScope(SupervisorJob() + ioDispatcher)
    private val prefs = context.getSharedPreferences("inkflow_local_backup_prefs", Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true; prettyPrint = true }

    private val debounceJobs = ConcurrentHashMap<String, Job>()
    private val mirrorLock = Mutex()

    companion object {
        const val PREF_TREE_URI = "backup_tree_uri"
        const val PREF_LAST_SYNC_TIME = "last_sync_time"
        const val PREF_LAST_SYNC_STATUS = "last_sync_status"
        const val PREF_USE_DIRECT_IO = "use_direct_io"
        const val DEFAULT_FOLDER_NAME = "InkFlow"
        const val MAX_SNAPSHOT_VERSIONS = 10
    }

    fun getSavedTreeUri(): Uri? {
        val uriStr = prefs.getString(PREF_TREE_URI, null) ?: return null
        return try {
            Uri.parse(uriStr)
        } catch (_: Exception) {
            null
        }
    }

    fun saveTreeUri(uri: Uri) {
        try {
            val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
            context.contentResolver.takePersistableUriPermission(uri, flags)
        } catch (e: Exception) {
            android.util.Log.w("LocalBackupManager", "Could not take persistable permission: ${e.message}")
        }
        prefs.edit().putString(PREF_TREE_URI, uri.toString()).apply()
    }

    fun clearTreeUri() {
        prefs.edit().remove(PREF_TREE_URI).apply()
    }

    fun isUsingDirectIo(): Boolean = prefs.getBoolean(PREF_USE_DIRECT_IO, false)

    fun setUsingDirectIo(enabled: Boolean) {
        prefs.edit().putBoolean(PREF_USE_DIRECT_IO, enabled).apply()
    }

    fun getLastSyncTimestamp(): Long = prefs.getLong(PREF_LAST_SYNC_TIME, 0L)

    fun getSyncStatus(): LocalSyncStatus {
        val statusStr = prefs.getString(PREF_LAST_SYNC_STATUS, LocalSyncStatus.OFFLINE.name)
        return try {
            LocalSyncStatus.valueOf(statusStr ?: LocalSyncStatus.OFFLINE.name)
        } catch (_: Exception) {
            LocalSyncStatus.OFFLINE
        }
    }

    private fun setSyncStatus(status: LocalSyncStatus) {
        prefs.edit().putString(PREF_LAST_SYNC_STATUS, status.name).apply()
    }

    fun getDefaultDirectDirectory(): File {
        val docsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
        return File(docsDir, DEFAULT_FOLDER_NAME)
    }

    fun getDisplayFolderPath(): String {
        val treeUri = getSavedTreeUri()
        if (treeUri != null) {
            return treeUri.lastPathSegment ?: "SAF Documents/InkFlow"
        }
        return "Documents/InkFlow"
    }

    /**
     * Debounced mirror called whenever a page settles (1s after last stroke/commit).
     * Runs off-thread, never touching ink path or main thread.
     */
    fun schedulePageMirror(notebookId: String, pageId: String, pageFile: File, debounceMs: Long = 1000L) {
        val key = "$notebookId/$pageId"
        debounceJobs[key]?.cancel()
        debounceJobs[key] = scope.launch {
            delay(debounceMs)
            mirrorLock.withLock {
                mirrorPageInternal(notebookId, pageId, pageFile)
            }
            debounceJobs.remove(key)
        }
    }

    private suspend fun mirrorPageInternal(notebookId: String, pageId: String, pageFile: File) = withContext(ioDispatcher) {
        if (!pageFile.exists() || pageFile.length() == 0L) return@withContext
        val bytes = try { pageFile.readBytes() } catch (_: Exception) { return@withContext }

        val treeUri = getSavedTreeUri()
        if (treeUri != null) {
            mirrorToSaf(notebookId, pageId, bytes)
        } else {
            mirrorToDirect(notebookId, pageId, bytes)
        }
    }

    private fun mirrorToDirect(notebookId: String, pageId: String, bytes: ByteArray) {
        try {
            val root = getDefaultDirectDirectory()
            val pagesDir = File(File(File(root, "notebooks"), notebookId), "pages")
            if (!pagesDir.exists()) pagesDir.mkdirs()

            val inkflowFile = File(pagesDir, "$pageId.inkflow")
            val tmpFile = File(pagesDir, "$pageId.inkflow.tmp")
            FileOutputStream(tmpFile).use { it.write(bytes) }
            tmpFile.renameTo(inkflowFile)

            // Rolling snapshot
            val snapDir = File(File(root, "snapshots"), pageId)
            if (!snapDir.exists()) snapDir.mkdirs()
            val snapFile = File(snapDir, "$pageId.${System.currentTimeMillis()}.inkflow")
            FileOutputStream(snapFile).use { it.write(bytes) }

            // Prune snapshots beyond MAX_SNAPSHOT_VERSIONS
            val snaps = snapDir.listFiles()?.sortedByDescending { it.lastModified() } ?: emptyList()
            if (snaps.size > MAX_SNAPSHOT_VERSIONS) {
                for (s in snaps.drop(MAX_SNAPSHOT_VERSIONS)) {
                    s.delete()
                }
            }

            prefs.edit()
                .putLong(PREF_LAST_SYNC_TIME, System.currentTimeMillis())
                .putString(PREF_LAST_SYNC_STATUS, LocalSyncStatus.SYNCED.name)
                .apply()
        } catch (e: Exception) {
            android.util.Log.e("LocalBackupManager", "Direct mirror failed: ${e.message}")
            prefs.edit().putString(PREF_LAST_SYNC_STATUS, LocalSyncStatus.ERROR.name).apply()
        }
    }

    private fun mirrorToSaf(notebookId: String, pageId: String, bytes: ByteArray) {
        val treeUri = getSavedTreeUri() ?: return
        val rootDoc = DocumentFile.fromTreeUri(context, treeUri) ?: return
        if (!rootDoc.canWrite()) return

        try {
            val notebooksDoc = getOrCreateSubdir(rootDoc, "notebooks") ?: return
            val nbDoc = getOrCreateSubdir(notebooksDoc, notebookId) ?: return
            val pagesDoc = getOrCreateSubdir(nbDoc, "pages") ?: return

            val inkflowDoc = pagesDoc.findFile("$pageId.inkflow") ?: pagesDoc.createFile("application/octet-stream", "$pageId.inkflow")
            if (inkflowDoc != null) {
                context.contentResolver.openOutputStream(inkflowDoc.uri, "wt")?.use { os ->
                    os.write(bytes)
                }
            }

            // Snapshots
            val snapsRoot = getOrCreateSubdir(rootDoc, "snapshots")
            if (snapsRoot != null) {
                val pageSnaps = getOrCreateSubdir(snapsRoot, pageId)
                if (pageSnaps != null) {
                    val snapDoc = pageSnaps.createFile("application/octet-stream", "$pageId.${System.currentTimeMillis()}.inkflow")
                    if (snapDoc != null) {
                        context.contentResolver.openOutputStream(snapDoc.uri, "wt")?.use { os ->
                            os.write(bytes)
                        }
                    }
                }
            }

            prefs.edit()
                .putLong(PREF_LAST_SYNC_TIME, System.currentTimeMillis())
                .putString(PREF_LAST_SYNC_STATUS, LocalSyncStatus.SYNCED.name)
                .apply()
        } catch (e: Exception) {
            android.util.Log.e("LocalBackupManager", "SAF mirror failed: ${e.message}")
            prefs.edit().putString(PREF_LAST_SYNC_STATUS, LocalSyncStatus.ERROR.name).apply()
        }
    }

    private fun getOrCreateSubdir(parent: DocumentFile, name: String): DocumentFile? {
        val existing = parent.findFile(name)
        if (existing != null && existing.isDirectory) return existing
        return parent.createDirectory(name)
    }

    /**
     * Mirrors all current notes, library hierarchy, and manifests to the persistent local backup folder.
     */
    suspend fun mirrorAllNow(): LocalMirrorResult = withContext(ioDispatcher) {
        mirrorLock.withLock {
            setSyncStatus(LocalSyncStatus.SYNCING)
            try {
                val folders = database.folderDao().getAllFolders().first()
                val notebooks = database.notebookDao().getAllNotebooks().first()
                val allPages = database.pageDao().searchPages("").first()

                val libraryBackup = LibraryHierarchyBackup(
                    exportedAt = System.currentTimeMillis(),
                    folders = folders.map {
                        FolderBackupItem(it.folderId, it.parentFolderId, it.name, it.colorHex, it.isPinned, it.createdAt, it.modifiedAt, it.iconKey)
                    },
                    notebooks = notebooks.map {
                        NotebookBackupItem(it.notebookId, it.folderId, it.title, it.pageCount, it.isStarred, it.createdAt, it.modifiedAt, it.iconKey)
                    },
                    pages = allPages.map {
                        PageBackupItem(
                            it.pageId, it.notebookId, it.pageIndex, it.title, it.template, it.strokeCount,
                            it.createdAt, it.modifiedAt, it.isProblemPage, it.sourceUrl, it.difficulty,
                            it.problemStatus, it.timeTakenMinutes, it.tags, it.approachSummary,
                            it.timeComplexity, it.spaceComplexity, it.codeSnippet, it.codeLanguage,
                            it.revisitIntervalDays, it.nextReviewTimestamp, it.isDeleted, it.deletedAt,
                            it.problemDescriptionHtml, it.testCasesJson, it.hintsJson
                        )
                    }
                )

                val libraryJsonStr = json.encodeToString(libraryBackup)
                var mirroredCount = 0

                val treeUri = getSavedTreeUri()
                if (treeUri != null) {
                    val root = DocumentFile.fromTreeUri(context, treeUri)
                    if (root != null && root.canWrite()) {
                        val libDoc = root.findFile("library.json") ?: root.createFile("application/json", "library.json")
                        libDoc?.let {
                            context.contentResolver.openOutputStream(it.uri, "wt")?.use { os ->
                                os.write(libraryJsonStr.toByteArray(Charsets.UTF_8))
                            }
                        }

                        for (page in allPages) {
                            val f = pageRepository.getPageFile(page.notebookId, page.pageId)
                            if (f.exists()) {
                                mirrorToSaf(page.notebookId, page.pageId, f.readBytes())
                                mirroredCount++
                            }
                        }
                    }
                } else {
                    val root = getDefaultDirectDirectory()
                    if (!root.exists()) root.mkdirs()

                    File(root, "library.json").writeText(libraryJsonStr)

                    for (page in allPages) {
                        val f = pageRepository.getPageFile(page.notebookId, page.pageId)
                        if (f.exists()) {
                            mirrorToDirect(page.notebookId, page.pageId, f.readBytes())
                            mirroredCount++
                        }
                    }
                }

                setSyncStatus(LocalSyncStatus.SYNCED)
                LocalMirrorResult(success = true, mirroredPages = mirroredCount)
            } catch (e: Exception) {
                setSyncStatus(LocalSyncStatus.ERROR)
                LocalMirrorResult(success = false, error = e.message)
            }
        }
    }

    /**
     * Auto-detect if app-private storage is empty (fresh install, clear data),
     * and checks whether the persistent local backup folder has existing notes to restore.
     */
    suspend fun detectExistingNotes(): ExistingNotesDetection = withContext(ioDispatcher) {
        val totalPages = database.pageDao().searchPages("").first()
        // If private storage already has substantive notes, do not prompt auto-restore
        if (totalPages.size > 1) {
            return@withContext ExistingNotesDetection.NotFound
        }

        // 1. Check custom SAF directory
        val treeUri = getSavedTreeUri()
        if (treeUri != null) {
            val root = DocumentFile.fromTreeUri(context, treeUri)
            if (root != null && root.exists()) {
                val libDoc = root.findFile("library.json")
                if (libDoc != null) {
                    val content = context.contentResolver.openInputStream(libDoc.uri)?.use { it.reader().readText() }
                    if (!content.isNullOrBlank()) {
                        try {
                            val lib = json.decodeFromString<LibraryHierarchyBackup>(content)
                            if (lib.pages.isNotEmpty()) {
                                return@withContext ExistingNotesDetection.Found(
                                    folderDisplayPath = root.name ?: "Documents/InkFlow",
                                    pageCount = lib.pages.size,
                                    notebookCount = lib.notebooks.size,
                                    sourceUri = treeUri
                                )
                            }
                        } catch (_: Exception) {}
                    }
                }
            }
        }

        // 2. Check default direct directory: Documents/InkFlow
        val defaultDir = getDefaultDirectDirectory()
        if (defaultDir.exists() && defaultDir.isDirectory) {
            val libFile = File(defaultDir, "library.json")
            if (libFile.exists()) {
                try {
                    val lib = json.decodeFromString<LibraryHierarchyBackup>(libFile.readText())
                    if (lib.pages.isNotEmpty()) {
                        return@withContext ExistingNotesDetection.Found(
                            folderDisplayPath = "Documents/InkFlow",
                            pageCount = lib.pages.size,
                            notebookCount = lib.notebooks.size,
                            sourceDirectDir = defaultDir
                        )
                    }
                } catch (_: Exception) {}
            }

            // Fallback: scan for any .inkflow files directly
            val inkflowFiles = defaultDir.walkTopDown().filter { it.extension == "inkflow" }.toList()
            if (inkflowFiles.isNotEmpty()) {
                return@withContext ExistingNotesDetection.Found(
                    folderDisplayPath = "Documents/InkFlow",
                    pageCount = inkflowFiles.size,
                    notebookCount = 1,
                    sourceDirectDir = defaultDir
                )
            }
        }

        ExistingNotesDetection.NotFound
    }

    /**
     * Single-tap restore from the persistent backup folder into private app storage and Room database.
     */
    suspend fun restoreFromPersistentFolder(detection: ExistingNotesDetection.Found): LocalRestoreResult = withContext(ioDispatcher) {
        try {
            var restoredPages = 0
            var restoredNotebooks = 0

            if (detection.sourceDirectDir != null) {
                val root = detection.sourceDirectDir
                val libFile = File(root, "library.json")
                if (libFile.exists()) {
                    val lib = json.decodeFromString<LibraryHierarchyBackup>(libFile.readText())
                    for (f in lib.folders) {
                        database.folderDao().insertFolder(
                            FolderEntity(f.folderId, f.parentFolderId, f.name, f.colorHex, f.isPinned, f.createdAt, f.modifiedAt, f.iconKey)
                        )
                    }
                    for (nb in lib.notebooks) {
                        database.notebookDao().insertNotebook(
                            NotebookEntity(nb.notebookId, nb.folderId, nb.title, nb.pageCount, nb.isStarred, nb.createdAt, nb.modifiedAt, nb.iconKey)
                        )
                        restoredNotebooks++
                    }
                    for (p in lib.pages) {
                        database.pageDao().insertPage(
                            PageEntity(
                                pageId = p.pageId,
                                notebookId = p.notebookId,
                                pageIndex = p.pageIndex,
                                title = p.title,
                                template = p.template,
                                strokeCount = p.strokeCount,
                                createdAt = p.createdAt,
                                modifiedAt = p.modifiedAt,
                                isProblemPage = p.isProblemPage,
                                sourceUrl = p.sourceUrl,
                                difficulty = p.difficulty,
                                problemStatus = p.problemStatus,
                                timeTakenMinutes = p.timeTakenMinutes,
                                tags = p.tags,
                                approachSummary = p.approachSummary,
                                timeComplexity = p.timeComplexity,
                                spaceComplexity = p.spaceComplexity,
                                codeSnippet = p.codeSnippet,
                                codeLanguage = p.codeLanguage,
                                revisitIntervalDays = p.revisitIntervalDays,
                                nextReviewTimestamp = p.nextReviewTimestamp,
                                isDeleted = p.isDeleted,
                                deletedAt = p.deletedAt,
                                problemDescriptionHtml = p.problemDescriptionHtml,
                                testCasesJson = p.testCasesJson,
                                hintsJson = p.hintsJson
                            )
                        )
                    }
                }

                // Copy all .inkflow files into private storage as .inkpage files
                val inkflowFiles = root.walkTopDown().filter { it.extension == "inkflow" && !it.path.contains("snapshots") }
                for (file in inkflowFiles) {
                    val pageId = file.nameWithoutExtension
                    val nbId = file.parentFile?.parentFile?.name ?: "default_notebook"
                    val destPageFile = pageRepository.getPageFile(nbId, pageId)
                    file.copyTo(destPageFile, overwrite = true)
                    restoredPages++
                }
            } else if (detection.sourceUri != null) {
                val root = DocumentFile.fromTreeUri(context, detection.sourceUri) ?: throw IllegalStateException("Cannot access tree Uri")
                val libDoc = root.findFile("library.json")
                if (libDoc != null) {
                    val content = context.contentResolver.openInputStream(libDoc.uri)?.use { it.reader().readText() } ?: ""
                    val lib = json.decodeFromString<LibraryHierarchyBackup>(content)
                    for (f in lib.folders) {
                        database.folderDao().insertFolder(
                            FolderEntity(f.folderId, f.parentFolderId, f.name, f.colorHex, f.isPinned, f.createdAt, f.modifiedAt, f.iconKey)
                        )
                    }
                    for (nb in lib.notebooks) {
                        database.notebookDao().insertNotebook(
                            NotebookEntity(nb.notebookId, nb.folderId, nb.title, nb.pageCount, nb.isStarred, nb.createdAt, nb.modifiedAt, nb.iconKey)
                        )
                        restoredNotebooks++
                    }
                    for (p in lib.pages) {
                        database.pageDao().insertPage(
                            PageEntity(
                                pageId = p.pageId,
                                notebookId = p.notebookId,
                                pageIndex = p.pageIndex,
                                title = p.title,
                                template = p.template,
                                strokeCount = p.strokeCount,
                                createdAt = p.createdAt,
                                modifiedAt = p.modifiedAt,
                                isProblemPage = p.isProblemPage,
                                sourceUrl = p.sourceUrl,
                                difficulty = p.difficulty,
                                problemStatus = p.problemStatus,
                                timeTakenMinutes = p.timeTakenMinutes,
                                tags = p.tags,
                                approachSummary = p.approachSummary,
                                timeComplexity = p.timeComplexity,
                                spaceComplexity = p.spaceComplexity,
                                codeSnippet = p.codeSnippet,
                                codeLanguage = p.codeLanguage,
                                revisitIntervalDays = p.revisitIntervalDays,
                                nextReviewTimestamp = p.nextReviewTimestamp,
                                isDeleted = p.isDeleted,
                                deletedAt = p.deletedAt,
                                problemDescriptionHtml = p.problemDescriptionHtml,
                                testCasesJson = p.testCasesJson,
                                hintsJson = p.hintsJson
                            )
                        )
                    }
                }

                val nbDocs = root.findFile("notebooks")
                if (nbDocs != null && nbDocs.isDirectory) {
                    for (nbDir in nbDocs.listFiles()) {
                        if (!nbDir.isDirectory) continue
                        val nbId = nbDir.name ?: continue
                        val pagesDir = nbDir.findFile("pages") ?: continue
                        for (pageFile in pagesDir.listFiles()) {
                            if (pageFile.name?.endsWith(".inkflow") == true) {
                                val pageId = pageFile.name!!.removeSuffix(".inkflow")
                                val destFile = pageRepository.getPageFile(nbId, pageId)
                                context.contentResolver.openInputStream(pageFile.uri)?.use { ins: InputStream ->
                                    FileOutputStream(destFile).use { outs: OutputStream ->
                                        ins.copyTo(outs)
                                    }
                                }
                                restoredPages++
                            }
                        }
                    }
                }
            }

            LocalRestoreResult(success = true, restoredPages = restoredPages, restoredNotebooks = restoredNotebooks)
        } catch (e: Exception) {
            LocalRestoreResult(success = false, error = e.message)
        }
    }
}
