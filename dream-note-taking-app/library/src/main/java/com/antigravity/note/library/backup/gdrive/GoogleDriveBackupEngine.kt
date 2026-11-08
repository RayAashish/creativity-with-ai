package com.antigravity.note.library.backup.gdrive

import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.library.backup.manifest.HashUtils
import com.antigravity.note.library.backup.model.FolderBackupItem
import com.antigravity.note.library.backup.model.LibraryHierarchyBackup
import com.antigravity.note.library.backup.model.NotebookBackupItem
import com.antigravity.note.library.backup.model.PageBackupItem
import com.antigravity.note.library.db.NoteDatabase
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

data class GoogleDriveBackupResult(
    val success: Boolean,
    val fileId: String? = null,
    val bytesUploaded: Long = 0L,
    val sha256: String? = null,
    val notebooksCount: Int = 0,
    val pagesCount: Int = 0,
    val error: String? = null
)

class GoogleDriveBackupEngine(
    private val database: NoteDatabase,
    private val pageRepository: PageRepository,
    private val authStorage: GoogleDriveAuthStorage,
    private val driveClient: GoogleDriveClient,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val json = Json { ignoreUnknownKeys = true; prettyPrint = true }

    suspend fun uploadBackup(
        forceFullSnapshot: Boolean = false,
        onProgress: (progress: Float, status: String) -> Unit = { _, _ -> }
    ): Result<GoogleDriveBackupResult> = withContext(ioDispatcher) {
        try {
            onProgress(0.05f, "Querying local notebook state...")

            // 1. Query dirty notebooks (or all if forceFullSnapshot)
            val allNotebooks = database.notebookDao().getAllNotebooks().first()
            val dirtyNotebooks = if (forceFullSnapshot) allNotebooks else database.notebookDao().getDirtyNotebooks()
            val targetNotebooks = if (dirtyNotebooks.isEmpty() && allNotebooks.isNotEmpty()) allNotebooks else dirtyNotebooks

            val allFolders = database.folderDao().getAllFolders().first()
            val allPages = database.pageDao().getAllActivePages().first()

            onProgress(0.15f, "Generating library metadata...")
            val hierarchy = LibraryHierarchyBackup(
                version = 2,
                exportedAt = System.currentTimeMillis(),
                folders = allFolders.map {
                    FolderBackupItem(
                        folderId = it.folderId,
                        parentFolderId = it.parentFolderId,
                        name = it.name,
                        colorHex = it.colorHex,
                        isPinned = it.isPinned,
                        createdAt = it.createdAt,
                        modifiedAt = it.modifiedAt,
                        iconKey = it.iconKey
                    )
                },
                notebooks = allNotebooks.map { nb ->
                    NotebookBackupItem(
                        notebookId = nb.notebookId,
                        folderId = nb.folderId,
                        title = nb.title,
                        pageCount = nb.pageCount,
                        isStarred = nb.isStarred,
                        iconKey = nb.iconKey,
                        createdAt = nb.createdAt,
                        modifiedAt = nb.modifiedAt
                    )
                },
                pages = allPages.map { p ->
                    PageBackupItem(
                        pageId = p.pageId,
                        notebookId = p.notebookId,
                        pageIndex = p.pageIndex,
                        title = p.title,
                        template = p.template,
                        strokeCount = p.strokeCount,
                        createdAt = p.createdAt,
                        modifiedAt = p.modifiedAt,
                        difficulty = p.difficulty,
                        problemStatus = p.problemStatus,
                        tags = p.tags,
                        sourceUrl = p.sourceUrl
                    )
                }
            )

            onProgress(0.25f, "Compressing atomic backup archive...")
            val stagingDir = File(pageRepository.rootDir.parentFile ?: pageRepository.rootDir, "backup_staging").apply {
                if (!exists()) mkdirs()
            }
            val archiveFile = File(stagingDir, "inkflow_vault_backup_${System.currentTimeMillis()}.zip")
            val manifestEntries = StringBuilder()

            ZipOutputStream(FileOutputStream(archiveFile).buffered()).use { zipOut ->
                // 1. library.json
                val libJsonBytes = json.encodeToString(hierarchy).toByteArray(Charsets.UTF_8)
                val libSha = HashUtils.computeSha256(libJsonBytes)
                manifestEntries.append("library.json: $libSha\n")
                zipOut.putNextEntry(ZipEntry("library.json"))
                zipOut.write(libJsonBytes)
                zipOut.closeEntry()

                // 2. Notebooks & Pages & Assets
                for (nb in targetNotebooks) {
                    val nbDir = File(pageRepository.rootDir, nb.notebookId)
                    if (nbDir.exists() && nbDir.isDirectory) {
                        val files = nbDir.walkTopDown().filter { it.isFile }.toList()
                        for (f in files) {
                            val relPath = "notebooks/${nb.notebookId}/${f.relativeTo(nbDir).path}"
                            val fSha = HashUtils.computeSha256(f)
                            manifestEntries.append("$relPath: $fSha\n")
                            zipOut.putNextEntry(ZipEntry(relPath))
                            FileInputStream(f).buffered().use { fis ->
                                fis.copyTo(zipOut)
                            }
                            zipOut.closeEntry()
                        }
                    }
                }

                // 3. manifest.sha256
                val manifestBytes = manifestEntries.toString().toByteArray(Charsets.UTF_8)
                zipOut.putNextEntry(ZipEntry("manifest.sha256"))
                zipOut.write(manifestBytes)
                zipOut.closeEntry()
                zipOut.flush()
            }

            onProgress(0.50f, "Computing SHA-256 archive checksum...")
            val archiveSha256 = HashUtils.computeSha256(archiveFile)
            val archiveBytes = archiveFile.readBytes()

            onProgress(0.65f, "Connecting to Google Drive...")
            val useVisibleFolder = authStorage.isUseVisibleFolder()
            val existingBackup = driveClient.queryLatestBackup(useVisibleFolder).getOrNull()

            onProgress(0.80f, "Uploading multipart payload (${archiveBytes.size / 1024} KB)...")
            val uploadResult = driveClient.uploadMultipart(
                archiveBytes = archiveBytes,
                useVisibleFolder = useVisibleFolder,
                existingFileId = existingBackup?.id
            ).getOrThrow()

            onProgress(0.95f, "Resetting local change flags...")
            database.notebookDao().resetAllDirtyFlags()
            authStorage.saveLastBackupTime(System.currentTimeMillis())
            authStorage.saveLastBackupSize(archiveBytes.size.toLong())
            authStorage.saveLastBackupHash(archiveSha256)

            // Cleanup staging
            archiveFile.delete()

            onProgress(1.0f, "Backup completed successfully!")
            Result.success(
                GoogleDriveBackupResult(
                    success = true,
                    fileId = uploadResult.id,
                    bytesUploaded = archiveBytes.size.toLong(),
                    sha256 = archiveSha256,
                    notebooksCount = targetNotebooks.size,
                    pagesCount = allPages.size
                )
            )
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }
}
