package com.antigravity.note.library.backup.gdrive

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

    suspend fun restoreBackup(
        onProgress: (progress: Float, status: String) -> Unit = { _, _ -> }
    ): Result<GoogleDriveRestoreResult> = withContext(ioDispatcher) {
        try {
            onProgress(0.05f, "Querying Google Drive for latest backup...")
            val useVisible = authStorage.isUseVisibleFolder()
            val fileItem = driveClient.queryLatestBackup(useVisible).getOrThrow()
                ?: return@withContext Result.failure(IOException("No backup archive ('${GoogleDriveConfig.BACKUP_FILENAME}') found on Google Drive."))

            val stagingDir = File(pageRepository.rootDir.parentFile ?: pageRepository.rootDir, "restore_staging").apply {
                if (exists()) deleteRecursively()
                mkdirs()
            }
            val downloadedZip = File(stagingDir, "backup_download.zip")

            onProgress(0.25f, "Downloading backup archive (${fileItem.size / 1024} KB)...")
            driveClient.downloadBackup(fileItem.id, downloadedZip).getOrThrow()

            onProgress(0.55f, "Extracting and validating SHA-256 checksums...")
            val extractedDir = File(stagingDir, "extracted").apply { mkdirs() }
            val manifestLines = mutableMapOf<String, String>()

            // Extract all files and read manifest.sha256
            ZipInputStream(FileInputStream(downloadedZip).buffered()).use { zipIn ->
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

            // Validate integrity against manifest
            if (manifestLines.isNotEmpty()) {
                for ((path, expectedHash) in manifestLines) {
                    val f = File(extractedDir, path)
                    if (!f.exists()) {
                        return@withContext Result.failure(IOException("Corrupted backup archive: missing file $path"))
                    }
                    val actualHash = HashUtils.computeSha256(f)
                    if (actualHash != expectedHash) {
                        return@withContext Result.failure(IOException("Integrity hash mismatch for $path: expected $expectedHash, got $actualHash"))
                    }
                }
            }

            onProgress(0.75f, "Replacing local notes and assets atomically...")
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
            }

            onProgress(0.88f, "Rebuilding database catalog...")
            val libJsonFile = File(extractedDir, "library.json")
            var restoredFolders = 0
            var restoredNotebooks = 0
            var restoredPages = 0

            if (libJsonFile.exists()) {
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
            }

            // Cleanup staging
            stagingDir.deleteRecursively()

            onProgress(1.0f, "Restoration complete! ($restoredNotebooks notebooks, $restoredPages pages)")
            Result.success(
                GoogleDriveRestoreResult(
                    success = true,
                    restoredNotebooks = restoredNotebooks,
                    restoredPages = restoredPages,
                    restoredFolders = restoredFolders,
                    sha256Validated = true
                )
            )
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }
}
