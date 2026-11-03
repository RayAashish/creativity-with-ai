package com.antigravity.note.library.backup.engine

import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.library.backup.auth.TokenStorage
import com.antigravity.note.library.backup.crypto.BackupEncryptionEngine
import com.antigravity.note.library.backup.export.MarkdownExporter
import com.antigravity.note.library.backup.manifest.BackupChangeTracker
import com.antigravity.note.library.backup.manifest.BackupManifestDao
import com.antigravity.note.library.backup.manifest.ManifestState
import com.antigravity.note.library.backup.model.BackupMetadata
import com.antigravity.note.library.backup.model.EncryptionConfig
import com.antigravity.note.library.db.NoteDatabase
import com.antigravity.note.library.db.PageEntity
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

sealed interface BackupResult {
    data class Success(val commitSha: String, val itemsChanged: Int) : BackupResult
    data object UpToDate : BackupResult
    data class Conflicted(val resolvedCount: Int, val commitSha: String) : BackupResult
    data class Failure(val message: String, val throwable: Throwable? = null) : BackupResult
}

class BackupEngine(
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

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        prettyPrint = true
    }

    private var lastCommitTimeMs = 0L

    companion object {
        private const val MIN_COALESCE_INTERVAL_MS = 60_000L // 1 minute coalesce during rapid operations
    }

    /**
     * Executes backup snapshot atomically.
     */
    suspend fun performBackup(isManualExpedited: Boolean = false): BackupResult = withContext(ioDispatcher) {
        try {
            val now = System.currentTimeMillis()
            if (!isManualExpedited && (now - lastCommitTimeMs < MIN_COALESCE_INTERVAL_MS)) {
                return@withContext BackupResult.UpToDate
            }

            val repoSelection = tokenStorage.getSelectedRepo()
                ?: return@withContext BackupResult.Failure("No backup repository configured in settings.")
            val (owner, repo, branch) = repoSelection

            // Step 1: Export current library hierarchy JSON
            exportLibraryIndexJson()

            // Step 2: Fetch dirty and deleted manifest items
            val dirtyItems = manifestDao.getDirtyOrDeleted()
            if (dirtyItems.isEmpty()) {
                return@withContext BackupResult.UpToDate
            }

            // Step 3: Get remote branch head ref
            val branchRefRes = gitDataClient.getBranchHeadRef(owner, repo, branch)
            val branchRef = branchRefRes.getOrElse { error ->
                return@withContext BackupResult.Failure("Unable to read branch ref $branch: ${error.message}", error)
            }
            val remoteHeadSha = branchRef.`object`.sha

            // Step 4: Get remote tree from commit
            val baseCommitRes = gitDataClient.getCommit(owner, repo, remoteHeadSha)
            val baseCommit = baseCommitRes.getOrElse { error ->
                return@withContext BackupResult.Failure("Unable to read base commit: ${error.message}", error)
            }
            val baseTreeSha = baseCommit.tree.sha

            // Step 5: Check encryption setting
            val isEncryptionEnabled = tokenStorage.isEncryptionEnabled()
            val encryptionPassphrase = tokenStorage.getEncryptionPassphrase()
            val encryptionEngine = if (isEncryptionEnabled && !encryptionPassphrase.isNullOrBlank()) {
                val salt = BackupEncryptionEngine.generateRandomSalt()
                val secretKey = BackupEncryptionEngine.deriveKey(encryptionPassphrase.toCharArray(), salt)
                BackupEncryptionEngine(secretKey)
            } else null

            // Step 6: Process changed items into blobs & tree entries
            val treeEntries = mutableListOf<GitTreeEntry>()
            val processedCleanPaths = mutableListOf<String>()
            val mirrorDeletions = tokenStorage.isMirrorDeletions()

            for (item in dirtyItems) {
                if (item.state == ManifestState.DELETED) {
                    if (mirrorDeletions) {
                        treeEntries.add(GitTreeEntry(path = item.path, sha = null))
                    } else {
                        // Move to .trash/ on remote
                        if (item.lastBackedUpCommitSha != null) {
                            treeEntries.add(GitTreeEntry(path = ".trash/${item.path}", sha = item.contentHash))
                        }
                        treeEntries.add(GitTreeEntry(path = item.path, sha = null))
                    }
                    processedCleanPaths.add(item.path)
                    continue
                }

                // Normal / Dirty Item: read content
                val fileBytes = readFileBytes(item.path)
                if (fileBytes == null || fileBytes.isEmpty()) {
                    continue
                }

                if (fileBytes.size > GitHubGitDataClient.MAX_FILE_SIZE_BYTES) {
                    // Skip files > 50 MiB with warning as required by spec
                    continue
                }

                val payloadToUpload = if (encryptionEngine != null && isPathEncryptable(item.path)) {
                    encryptionEngine.packEncrypted(fileBytes)
                } else {
                    fileBytes
                }

                val isBinary = isBinaryPath(item.path)
                val blobShaRes = gitDataClient.uploadBlob(owner, repo, payloadToUpload, isBinary = isBinary)
                val blobSha = blobShaRes.getOrElse { error ->
                    return@withContext BackupResult.Failure("Failed uploading blob for ${item.path}: ${error.message}", error)
                }

                treeEntries.add(GitTreeEntry(path = item.path, sha = blobSha))
                processedCleanPaths.add(item.path)

                // If this is a page, also generate readable Markdown export (Step 5)
                if (item.path.startsWith("notebooks/") && item.path.endsWith(".inkflow") && !isEncryptionEnabled) {
                    val mdEntry = generateMarkdownTreeEntry(item.path, owner, repo)
                    if (mdEntry != null) {
                        treeEntries.add(mdEntry)
                    }
                }
            }

            if (treeEntries.isEmpty()) {
                return@withContext BackupResult.UpToDate
            }

            // Step 7: Create atomic Git Tree
            val treeShaRes = gitDataClient.createTree(owner, repo, baseTreeSha, treeEntries)
            val newTreeSha = treeShaRes.getOrElse { error ->
                return@withContext BackupResult.Failure("Failed creating tree: ${error.message}", error)
            }

            // Step 8: Create atomic Git Commit
            val timestampStr = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
            val commitMessage = "Backup $timestampStr — ${treeEntries.size} items changed"
            val commitShaRes = gitDataClient.createCommit(
                owner = owner,
                repo = repo,
                message = commitMessage,
                treeSha = newTreeSha,
                parentCommitShas = listOf(remoteHeadSha)
            )
            val newCommitSha = commitShaRes.getOrElse { error ->
                return@withContext BackupResult.Failure("Failed creating commit: ${error.message}", error)
            }

            // Step 9: Update Branch Ref (force = false)
            val updateRefRes = gitDataClient.updateBranchRef(
                owner = owner,
                repo = repo,
                branch = branch,
                newCommitSha = newCommitSha,
                force = false
            )

            updateRefRes.getOrElse { error ->
                return@withContext BackupResult.Failure("Failed updating branch ref (non-fast-forward conflict): ${error.message}", error)
            }

            // Step 10: Single Room transaction updating manifest to CLEAN
            manifestDao.markBatchClean(processedCleanPaths, newCommitSha)
            lastCommitTimeMs = System.currentTimeMillis()

            BackupResult.Success(newCommitSha, treeEntries.size)
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            BackupResult.Failure("Backup error: ${e.message}", e)
        }
    }

    private suspend fun exportLibraryIndexJson() {
        val folders = folderDao.getAllFolders().first()
        val notebooks = notebookDao.getAllNotebooks().first()
        val allPages = mutableListOf<PageEntity>()
        for (nb in notebooks) {
            allPages.addAll(pageDao.getPagesForNotebook(nb.notebookId).first())
        }

        val libraryJson = buildJsonObject {
            put("exportedAt", System.currentTimeMillis())
            put("folderCount", folders.size)
            put("notebookCount", notebooks.size)
            put("pageCount", allPages.size)
        }.toString()

        val tracker = BackupChangeTracker(manifestDao, ioDispatcher)
        tracker.onContentSaved("library.json", libraryJson.toByteArray(Charsets.UTF_8))
    }

    private fun isPathEncryptable(path: String): Boolean {
        // Only content files are encrypted; metadata headers allow indexing
        return path.endsWith(".inkflow") || path.endsWith(".webp") || path.endsWith(".md")
    }

    private fun isBinaryPath(path: String): Boolean {
        return path.endsWith(".inkflow") || path.endsWith(".webp") || path.endsWith(".pdf") || path.endsWith(".png")
    }

    private suspend fun readFileBytes(path: String): ByteArray? {
        if (path == "library.json") {
            val folders = folderDao.getAllFolders().first()
            val notebooks = notebookDao.getAllNotebooks().first()
            return json.encodeToString(mapOf("folders" to folders.size, "notebooks" to notebooks.size)).toByteArray(Charsets.UTF_8)
        }

        // Form: notebooks/<nbId>/pages/<pageId>.inkflow
        if (path.startsWith("notebooks/") && path.endsWith(".inkflow")) {
            val parts = path.split("/")
            if (parts.size >= 4) {
                val notebookId = parts[1]
                val pageFile = parts[3].removeSuffix(".inkflow")
                // Check on disk via PageRepository
                val pages = pageRepository.listPages(notebookId)
                val target = pages.find { it.pageId == pageFile }
                if (target != null) {
                    val (docPage, _) = pageRepository.loadPage(notebookId, target.pageId)
                    val bos = java.io.ByteArrayOutputStream()
                    com.antigravity.note.document.storage.PageSerializer.serialize(docPage, bos)
                    return bos.toByteArray()
                }
            }
        }
        return null
    }

    private suspend fun generateMarkdownTreeEntry(
        inkflowPath: String,
        owner: String,
        repo: String
    ): GitTreeEntry? {
        try {
            val parts = inkflowPath.split("/")
            if (parts.size < 4) return null
            val notebookId = parts[1]
            val pageId = parts[3].removeSuffix(".inkflow")

            val pageEntity = pageDao.getPageById(pageId) ?: return null
            val notebook = notebookDao.getNotebookById(notebookId)
            val notebookTitle = notebook?.title ?: "Notebook"

            val mdContent = MarkdownExporter.exportToMarkdown(
                page = pageEntity,
                folderPath = "Exports",
                notebookTitle = notebookTitle
            )

            val safeTitle = MarkdownExporter.sanitizeName(pageEntity.title)
            val mdPath = "exports/${MarkdownExporter.sanitizeName(notebookTitle)}/$safeTitle.md"

            val blobSha = gitDataClient.uploadBlob(
                owner = owner,
                repo = repo,
                contentBytes = mdContent.toByteArray(Charsets.UTF_8),
                isBinary = false
            ).getOrNull() ?: return null

            return GitTreeEntry(path = mdPath, sha = blobSha)
        } catch (_: Exception) {
            return null
        }
    }
}
