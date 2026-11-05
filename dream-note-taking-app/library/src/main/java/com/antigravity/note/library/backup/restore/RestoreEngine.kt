package com.antigravity.note.library.backup.restore

import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.document.storage.PageSerializer
import com.antigravity.note.library.backup.auth.TokenStorage
import com.antigravity.note.library.backup.crypto.BackupEncryptionEngine
import com.antigravity.note.library.backup.engine.GitHubGitDataClient
import com.antigravity.note.library.backup.manifest.BackupManifestDao
import com.antigravity.note.library.backup.manifest.BackupManifestEntity
import com.antigravity.note.library.backup.manifest.ManifestState
import com.antigravity.note.library.backup.model.BackupMetadata
import com.antigravity.note.library.backup.model.LibraryIndex
import com.antigravity.note.library.db.FolderEntity
import com.antigravity.note.library.db.NoteDatabase
import com.antigravity.note.library.db.NotebookEntity
import com.antigravity.note.library.db.PageEntity
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.ByteArrayInputStream
import java.io.IOException

@Serializable
data class RestoreSummary(
    val restoredNotebooks: Int,
    val restoredPages: Int,
    val isLazy: Boolean,
    val commitSha: String
)

class RestoreEngine(
    private val database: NoteDatabase,
    private val pageRepository: PageRepository,
    private val tokenStorage: TokenStorage,
    private val gitDataClient: GitHubGitDataClient,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val manifestDao = database.backupManifestDao()
    private val folderDao = database.folderDao()
    private val notebookDao = database.notebookDao()
    private val pageDao = database.pageDao()

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun restoreLibrary(
        owner: String,
        repo: String,
        branch: String = "main",
        passphrase: String? = null,
        lazyDownload: Boolean = false,
        onProgress: (progress: Float, message: String) -> Unit = { _, _ -> }
    ): Result<RestoreSummary> = withContext(ioDispatcher) {
        try {
            onProgress(0.05f, "Fetching repository HEAD...")
            val branchRef = gitDataClient.getBranchHeadRef(owner, repo, branch).getOrThrow()
            val headCommitSha = branchRef.`object`.sha

            val commit = gitDataClient.getCommit(owner, repo, headCommitSha).getOrThrow()
            val treeSha = commit.tree.sha

            onProgress(0.15f, "Scanning backup files...")
            val treeDetail = gitDataClient.getTreeRecursive(owner, repo, treeSha).getOrThrow()
            val treeMap = treeDetail.tree.associateBy { it.path }

            // 1. Fetch and parse backup-meta.json (if present)
            onProgress(0.25f, "Reading backup metadata...")
            var isEncrypted = false
            val metaEntry = treeMap["backup-meta.json"]
            if (metaEntry?.sha != null) {
                val metaBytes = gitDataClient.getBlob(owner, repo, metaEntry.sha).getOrNull()
                if (metaBytes != null) {
                    try {
                        val meta = json.decodeFromString<BackupMetadata>(String(metaBytes, Charsets.UTF_8))
                        isEncrypted = meta.encryption.enabled
                    } catch (_: Exception) {}
                }
            }

            var encryptionEngine: BackupEncryptionEngine? = null
            if (isEncrypted) {
                if (passphrase.isNullOrBlank()) {
                    return@withContext Result.failure(IllegalStateException("Backup is encrypted. Passphrase is required to restore."))
                }
                val salt = BackupEncryptionEngine.generateRandomSalt()
                val key = BackupEncryptionEngine.deriveKey(passphrase.toCharArray(), salt)
                encryptionEngine = BackupEncryptionEngine(key)
            }

            // 2. Fetch library.json
            onProgress(0.35f, "Restoring library index...")
            val libEntry = treeMap["library.json"]
                ?: return@withContext Result.failure(IOException("library.json not found in backup repository."))
            val libBytes = gitDataClient.getBlob(owner, repo, libEntry.sha ?: "").getOrThrow()
            val libContent = if (encryptionEngine != null) {
                encryptionEngine.unpackAndDecrypt(libBytes)
            } else {
                libBytes
            }
            val libraryIndex = json.decodeFromString<LibraryIndex>(String(libContent, Charsets.UTF_8))

            // 3. Restore Folders
            onProgress(0.45f, "Restoring folders (${libraryIndex.folders.size})...")
            for (f in libraryIndex.folders) {
                folderDao.insertFolder(
                    FolderEntity(
                        folderId = f.folderId,
                        parentFolderId = f.parentFolderId,
                        name = f.name,
                        colorHex = f.colorHex,
                        isPinned = f.isPinned,
                        createdAt = if (f.createdAt > 0) f.createdAt else System.currentTimeMillis(),
                        modifiedAt = if (f.modifiedAt > 0) f.modifiedAt else System.currentTimeMillis(),
                        iconKey = f.iconKey
                    )
                )
            }

            // 4. Restore Notebooks and Pages
            var restoredPagesCount = 0
            val totalNotebooks = libraryIndex.notebooks.size
            for ((nbIndex, nb) in libraryIndex.notebooks.withIndex()) {
                val progressFrac = 0.5f + 0.4f * (nbIndex.toFloat() / maxOf(1, totalNotebooks))
                onProgress(progressFrac, "Restoring notebook ${nb.title} (${nbIndex + 1}/$totalNotebooks)...")

                notebookDao.insertNotebook(
                    NotebookEntity(
                        notebookId = nb.notebookId,
                        folderId = nb.folderId,
                        title = nb.title,
                        pageCount = nb.pages.size,
                        isStarred = nb.isStarred,
                        createdAt = if (nb.createdAt > 0) nb.createdAt else System.currentTimeMillis(),
                        modifiedAt = if (nb.modifiedAt > 0) nb.modifiedAt else System.currentTimeMillis(),
                        iconKey = nb.iconKey
                    )
                )

                for (p in nb.pages) {
                    val candidatePaths = listOf(
                        p.filePath,
                        "notebooks/${nb.notebookId}/pages/${p.pageId}.inkflow",
                        "notebooks/${nb.notebookId}/pages/${p.pageId}.inkpage"
                    ).filter { it.isNotBlank() }

                    val pageEntry = candidatePaths.firstNotNullOfOrNull { treeMap[it] }

                    if (!lazyDownload && pageEntry?.sha != null) {
                        try {
                            val rawBytes = gitDataClient.getBlob(owner, repo, pageEntry.sha).getOrThrow()
                            val pageBytes = if (encryptionEngine != null) {
                                encryptionEngine.unpackAndDecrypt(rawBytes)
                            } else {
                                rawBytes
                            }
                            val docPage = PageSerializer.deserialize(ByteArrayInputStream(pageBytes))
                            pageRepository.savePageAtomic(docPage)
                            manifestDao.insertOrUpdate(
                                BackupManifestEntity(
                                    path = pageEntry.path,
                                    contentHash = pageEntry.sha,
                                    sizeBytes = rawBytes.size.toLong(),
                                    lastBackedUpCommitSha = headCommitSha,
                                    state = ManifestState.CLEAN
                                )
                            )
                        } catch (e: Exception) {
                            if (e is CancellationException) throw e
                            // If deserialize fails or file missing, log/continue without crashing entire restore
                        }
                    }

                    pageDao.insertPage(
                        PageEntity(
                            pageId = p.pageId,
                            notebookId = nb.notebookId,
                            pageIndex = p.pageIndex,
                            title = p.title,
                            template = p.template,
                            strokeCount = p.strokeCount,
                            createdAt = if (p.updatedAt > 0) p.updatedAt else System.currentTimeMillis(),
                            modifiedAt = if (p.updatedAt > 0) p.updatedAt else System.currentTimeMillis(),
                            difficulty = p.difficulty,
                            problemStatus = p.status ?: "Unsolved",
                            tags = p.tags.joinToString(","),
                            sourceUrl = p.sourceLink
                        )
                    )
                    restoredPagesCount++
                }
            }

            // Mark manifest clean for library.json
            if (libEntry.sha != null) {
                manifestDao.insertOrUpdate(
                    BackupManifestEntity(
                        path = "library.json",
                        contentHash = libEntry.sha,
                        sizeBytes = libBytes.size.toLong(),
                        lastBackedUpCommitSha = headCommitSha,
                        state = ManifestState.CLEAN
                    )
                )
            }
            if (metaEntry?.sha != null) {
                manifestDao.insertOrUpdate(
                    BackupManifestEntity(
                        path = "backup-meta.json",
                        contentHash = metaEntry.sha,
                        sizeBytes = 0L,
                        lastBackedUpCommitSha = headCommitSha,
                        state = ManifestState.CLEAN
                    )
                )
            }

            onProgress(1.0f, "Restore completed! Restored $totalNotebooks notebooks, $restoredPagesCount pages.")
            Result.success(
                RestoreSummary(
                    restoredNotebooks = totalNotebooks,
                    restoredPages = restoredPagesCount,
                    isLazy = lazyDownload,
                    commitSha = headCommitSha
                )
            )
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }
}
