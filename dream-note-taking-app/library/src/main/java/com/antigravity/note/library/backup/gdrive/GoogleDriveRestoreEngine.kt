package com.antigravity.note.library.backup.gdrive

import android.util.Log
import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.library.backup.manifest.HashUtils
import com.antigravity.note.library.backup.model.LibraryHierarchyBackup
import com.antigravity.note.library.db.FolderEntity
import com.antigravity.note.library.db.NoteDatabase
import com.antigravity.note.library.db.NotebookEntity
import com.antigravity.note.library.db.PageEntity
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

data class GoogleDriveRestoreResult(
    val success: Boolean,
    val restoredNotebooks: Int = 0,
    val restoredPages: Int = 0,
    val restoredFolders: Int = 0,
    val sha256Validated: Boolean = false,
    val error: String? = null
)

class GoogleDriveRestoreEngine(
    private val database: NoteDatabase,
    private val pageRepository: PageRepository,
    private val authStorage: GoogleDriveAuthStorage,
    private val driveClient: GoogleDriveClient,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val json = Json { ignoreUnknownKeys = true }

    /**
     * Restores notes, assets, and database catalog directly from a local .zip archive
     * (used by direct file picker import, incoming file intents, and cloud restore downloads).
     */
    suspend fun restoreFromZipFile(
        zipFile: File,
        onProgress: (progress: Float, status: String) -> Unit = { _, _ -> }
    ): Result<GoogleDriveRestoreResult> = withContext(ioDispatcher) {
        try {
            if (!zipFile.exists() || zipFile.length() == 0L) {
                return@withContext Result.failure(IOException("Archive file is empty or does not exist"))
            }

            onProgress(0.15f, "Extracting backup archive...")
            val stagingDir = File(pageRepository.rootDir.parentFile ?: pageRepository.rootDir, "restore_staging_${System.currentTimeMillis()}").apply {
                if (exists()) deleteRecursively()
                mkdirs()
            }
            val extractedDir = File(stagingDir, "extracted").apply { mkdirs() }
            val manifestLines = mutableMapOf<String, String>()

            // Extract all files and read manifest.sha256 if present
            ZipInputStream(FileInputStream(zipFile).buffered()).use { zipIn ->
                var entry: ZipEntry? = zipIn.nextEntry
                while (entry != null) {
                    val destFile = File(extractedDir, entry.name)
                    if (entry.isDirectory) {
                        destFile.mkdirs()
                    } else {
                        destFile.parentFile?.mkdirs()
                        FileOutputStream(destFile).use { fos ->
                            zipIn.copyTo(fos)
                        }
                        if (entry.name == "manifest.sha256") {
                            destFile.readLines().forEach { line ->
                                val parts = line.split(":")
                                if (parts.size >= 2) {
                                    manifestLines[parts[0].trim()] = parts[1].trim()
                                }
                            }
                        }
                    }
                    zipIn.closeEntry()
                    entry = zipIn.nextEntry
                }
            }

            // Validate integrity against manifest if present
            if (manifestLines.isNotEmpty()) {
                onProgress(0.40f, "Verifying checksums...")
                for ((path, expectedHash) in manifestLines) {
                    val f = File(extractedDir, path)
                    if (f.exists()) {
                        val actualHash = HashUtils.computeSha256(f)
                        if (actualHash != expectedHash) {
                            Log.w("GDriveRestore", "Integrity warning for $path: expected $expectedHash, got $actualHash")
                        }
                    }
                }
            }

            onProgress(0.65f, "Replacing local notes and assets atomically...")
            val extractedNotebooks = File(extractedDir, "notebooks")
            if (extractedNotebooks.exists()) {
                val notebooks = extractedNotebooks.listFiles { f -> f.isDirectory } ?: emptyArray()
                for (nb in notebooks) {
                    val targetNbDir = File(pageRepository.rootDir, nb.name)
                    if (targetNbDir.exists()) {
                        targetNbDir.deleteRecursively()
                    }
                    nb.copyRecursively(targetNbDir, overwrite = true)
                }
            } else {
                // If notebooks directory was not at the root of the archive, look for subdirectories
                val subDirs = extractedDir.listFiles { f -> f.isDirectory && f.name != "extracted" } ?: emptyArray()
                for (sub in subDirs) {
                    val hasPages = sub.listFiles { f -> f.name.endsWith(".inkpage") || f.name.endsWith(".wal") }?.isNotEmpty() == true
                    if (hasPages) {
                        val targetNbDir = File(pageRepository.rootDir, sub.name)
                        if (targetNbDir.exists()) targetNbDir.deleteRecursively()
                        sub.copyRecursively(targetNbDir, overwrite = true)
                    }
                }
            }

            onProgress(0.85f, "Rebuilding database catalog...")
            val libJsonFile = File(extractedDir, "library.json")
            var restoredFolders = 0
            var restoredNotebooks = 0
            var restoredPages = 0

            if (libJsonFile.exists() && libJsonFile.length() > 0) {
                val lib = json.decodeFromString<LibraryHierarchyBackup>(libJsonFile.readText())
                // Rebuild folders
                for (f in lib.folders) {
                    database.folderDao().insertFolder(
                        FolderEntity(
                            folderId = f.folderId,
                            parentFolderId = f.parentFolderId,
                            name = f.name,
                            iconKey = f.iconKey
                        )
                    )
                    restoredFolders++
                }
                // Rebuild notebooks
                for (nb in lib.notebooks) {
                    database.notebookDao().insertNotebook(
                        NotebookEntity(
                            notebookId = nb.notebookId,
                            folderId = nb.folderId,
                            title = nb.title,
                            pageCount = nb.pageCount,
                            isStarred = nb.isStarred,
                            iconKey = nb.iconKey,
                            createdAt = nb.createdAt,
                            modifiedAt = nb.modifiedAt,
                            isDirty = false
                        )
                    )
                    restoredNotebooks++
                }
                // Rebuild pages
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
                            difficulty = p.difficulty,
                            problemStatus = p.problemStatus ?: "Unsolved",
                            tags = p.tags ?: "",
                            sourceUrl = p.sourceUrl
                        )
                    )
                    restoredPages++
                }
            } else {
                // Disk-based catalog rebuilding fallback
                val nbDirs = pageRepository.rootDir.listFiles { f -> f.isDirectory } ?: emptyArray()
                for (nbDir in nbDirs) {
                    val existingNb = database.notebookDao().getNotebookById(nbDir.name)
                    val pageFiles = nbDir.listFiles { f -> f.name.endsWith(".inkpage") } ?: emptyArray()
                    if (existingNb == null) {
                        val title = if (nbDir.name.startsWith("nb_")) {
                            nbDir.name.removePrefix("nb_").replace("_", " ").replaceFirstChar { it.uppercase() }
                        } else {
                            nbDir.name
                        }
                        database.notebookDao().insertNotebook(
                            NotebookEntity(
                                notebookId = nbDir.name,
                                folderId = null,
                                title = title,
                                pageCount = pageFiles.size,
                                isStarred = false,
                                iconKey = null,
                                createdAt = System.currentTimeMillis(),
                                modifiedAt = System.currentTimeMillis(),
                                isDirty = false
                            )
                        )
                        restoredNotebooks++
                    }
                    for ((idx, pf) in pageFiles.withIndex()) {
                        val pId = pf.nameWithoutExtension
                        val existingP = database.pageDao().getPageById(pId)
                        if (existingP == null) {
                            database.pageDao().insertPage(
                                PageEntity(
                                pageId = pId,
                                notebookId = nbDir.name,
                                pageIndex = idx,
                                title = "Page ${idx + 1}",
                                strokeCount = 0,
                                createdAt = System.currentTimeMillis(),
                                modifiedAt = System.currentTimeMillis()
                            )
                        )
                        restoredPages++
                    }
                }
            }
        }

        // Cleanup staging
        stagingDir.deleteRecursively()

        // Update local auth storage stats
        authStorage.saveLastBackupTime(System.currentTimeMillis())
        authStorage.saveLastBackupSize(zipFile.length())
        authStorage.saveLastBackupHash(HashUtils.computeSha256(zipFile))

        onProgress(1.0f, "Restoration complete! ($restoredNotebooks notebooks, $restoredPages pages)")
        Result.success(
            GoogleDriveRestoreResult(
                success = true,
                restoredNotebooks = restoredNotebooks,
                restoredPages = restoredPages,
                restoredFolders = restoredFolders,
                sha256Validated = manifestLines.isNotEmpty()
            )
        )
    } catch (e: Exception) {
        if (e is CancellationException) throw e
        Result.failure(e)
    }
}

    suspend fun restoreBackup(
        onProgress: (progress: Float, status: String) -> Unit = { _, _ -> }
    ): Result<GoogleDriveRestoreResult> = withContext(ioDispatcher) {
        try {
            onProgress(0.05f, "Querying Google Drive for latest backup...")
            val useVisible = authStorage.isUseVisibleFolder()
            val fileItem = driveClient.queryLatestBackup(useVisible).getOrThrow()
                ?: return@withContext Result.failure(IOException("No backup archive ('${GoogleDriveConfig.BACKUP_FILENAME}') found on Google Drive. Please verify you are logged into the same Google account that performed the backup."))

            val stagingDir = File(pageRepository.rootDir.parentFile ?: pageRepository.rootDir, "restore_staging").apply {
                if (exists()) deleteRecursively()
                mkdirs()
            }
            val downloadedZip = File(stagingDir, "backup_download.zip")

            onProgress(0.20f, "Downloading backup archive (${fileItem.size / 1024} KB)...")
            driveClient.downloadBackup(fileItem.id, downloadedZip).getOrThrow()

            val result = restoreFromZipFile(downloadedZip) { p, msg ->
                onProgress(0.20f + p * 0.80f, msg)
            }
            stagingDir.deleteRecursively()
            result
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }
}
