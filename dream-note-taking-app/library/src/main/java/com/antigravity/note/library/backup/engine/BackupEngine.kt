package com.antigravity.note.library.backup.engine

import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.document.storage.PageSerializer
import com.antigravity.note.library.backup.auth.TokenStorage
import com.antigravity.note.library.backup.crypto.BackupEncryptionEngine
import com.antigravity.note.library.backup.manifest.BackupChangeTracker
import com.antigravity.note.library.backup.manifest.ManifestState
import com.antigravity.note.library.backup.model.BackupMetadata
import com.antigravity.note.library.backup.model.ContentBounds
import com.antigravity.note.library.backup.model.EncryptionConfig
import com.antigravity.note.library.backup.model.FolderSummary
import com.antigravity.note.library.backup.model.LibraryIndex
import com.antigravity.note.library.backup.model.NotebookSummary
import com.antigravity.note.library.backup.model.PageSearchItem
import com.antigravity.note.library.backup.model.PageSummary
import com.antigravity.note.library.backup.model.SearchIndex
import com.antigravity.note.library.db.NoteDatabase
import com.antigravity.note.library.db.PageEntity
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.security.MessageDigest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

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
        private const val MIN_COALESCE_INTERVAL_MS = 60_000L
    }

    /**
     * Executes backup snapshot atomically.
     * Backs up only compact, lossless .inkflow files and structured metadata (library.json, search-index.json, backup-meta.json).
     * Strictly preserves viewer/ and fails loudly on data integrity errors.
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

            // Step 1: Export current library hierarchy JSON to manifest
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
                // NEVER touch viewer/ or allow deletion/mutation from app backup
                if (item.path.startsWith("viewer/")) {
                    continue
                }

                if (item.state == ManifestState.DELETED) {
                    if (mirrorDeletions) {
                        treeEntries.add(GitTreeEntry(path = item.path, sha = null))
                    } else {
                        // Move to _trash/ on remote
                        if (item.lastBackedUpCommitSha != null) {
                            treeEntries.add(GitTreeEntry(path = "_trash/${item.path}", sha = item.contentHash))
                        }
                        treeEntries.add(GitTreeEntry(path = item.path, sha = null))
                    }
                    processedCleanPaths.add(item.path)
                    continue
                }

                // Normal / Dirty Item: read content with integrity checking
                val fileBytes = try {
                    readFileBytes(item.path)
                } catch (e: Exception) {
                    return@withContext BackupResult.Failure("Integrity check failed for ${item.path}: ${e.message}", e)
                }

                if (fileBytes == null || fileBytes.isEmpty()) {
                    continue
                }

                if (fileBytes.size > GitHubGitDataClient.MAX_FILE_SIZE_BYTES) {
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
            }

            // Also upload structured metadata files: backup-meta.json, library.json, search-index.json
            val metaEntries = exportMetadataFiles(owner, repo)
            treeEntries.addAll(metaEntries)

            // Auto-generate root README.md index
            val readmeEntry = generateReadmeTreeEntry(owner, repo)
            if (readmeEntry != null) {
                treeEntries.add(readmeEntry)
            }

            if (treeEntries.isEmpty()) {
                return@withContext BackupResult.UpToDate
            }

            // Invariant: Filter out any entries targeting viewer/ to protect the web reader project
            val safeTreeEntries = treeEntries.filterNot { it.path.startsWith("viewer/") }

            // Step 7: Create atomic Git Tree
            val treeShaRes = gitDataClient.createTree(owner, repo, baseTreeSha, safeTreeEntries)
            val newTreeSha = treeShaRes.getOrElse { error ->
                return@withContext BackupResult.Failure("Failed creating tree: ${error.message}", error)
            }

            // Step 8: Create atomic Git Commit
            val timestampStr = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
            val commitMessage = "Backup $timestampStr — ${safeTreeEntries.size} items updated (.inkflow)"
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
                return@withContext BackupResult.Failure("Failed updating branch ref (conflict): ${error.message}", error)
            }

            // Step 10: Single Room transaction updating manifest to CLEAN
            manifestDao.markBatchClean(processedCleanPaths, newCommitSha)
            lastCommitTimeMs = System.currentTimeMillis()

            BackupResult.Success(newCommitSha, safeTreeEntries.size)
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            BackupResult.Failure("Backup error: ${e.message}", e)
        }
    }

    private fun isPathEncryptable(path: String): Boolean {
        return path.endsWith(".inkflow")
    }

    private fun isBinaryPath(path: String): Boolean {
        return path.endsWith(".inkflow") || path.endsWith(".png") || path.endsWith(".webp")
    }

    private suspend fun readFileBytes(path: String): ByteArray? {
        if (path.startsWith("notebooks/") && path.endsWith(".inkflow")) {
            val parts = path.split("/")
            if (parts.size >= 4) {
                val notebookId = parts[1]
                val pageId = parts[3].removeSuffix(".inkflow")
                val pageEntity = pageDao.getPageById(pageId)
                val (docPage, _) = pageRepository.loadPage(notebookId, pageId)

                val bos = ByteArrayOutputStream()
                PageSerializer.serialize(docPage, bos)
                val bytes = bos.toByteArray()

                // Integrity verification: non-empty page must serialize with its strokes
                val decoded = PageSerializer.deserialize(ByteArrayInputStream(bytes))
                if (decoded.strokes.size != docPage.strokes.size) {
                    throw IllegalStateException("Integrity failure: serialized stroke count (${decoded.strokes.size}) != in-memory count (${docPage.strokes.size}) for page '${docPage.metadata.title}' ($pageId)")
                }

                // If page had strokes recorded in database/UI, fail loudly if file is suspiciously tiny (<= 125B)
                val expectedStrokes = pageEntity?.strokeCount ?: docPage.strokes.size
                if (expectedStrokes > 0 && (docPage.strokes.isEmpty() || bytes.size <= 125)) {
                    throw IllegalStateException("Integrity failure: page '${docPage.metadata.title}' ($pageId) has $expectedStrokes strokes recorded in DB, but serialized to ${bytes.size} bytes with ${docPage.strokes.size} strokes. Aborting backup.")
                }

                return bytes
            }
        }
        return null
    }

    private suspend fun exportLibraryIndexJson() {
        val folders = folderDao.getAllFolders().first()
        val notebooks = notebookDao.getAllNotebooks().first()
        val allPages = mutableListOf<PageEntity>()
        for (nb in notebooks) {
            allPages.addAll(pageDao.getPagesForNotebook(nb.notebookId).first())
        }

        val folderSummaries = folders.map { f ->
            FolderSummary(
                folderId = f.folderId,
                parentFolderId = f.parentFolderId,
                name = f.name,
                colorHex = f.colorHex,
                isPinned = f.isPinned,
                createdAt = f.createdAt,
                modifiedAt = f.modifiedAt,
                iconKey = f.iconKey
            )
        }

        val notebookSummaries = notebooks.map { nb ->
            val nbPages = allPages.filter { it.notebookId == nb.notebookId }.sortedBy { it.pageIndex }
            val pageSummaries = nbPages.map { p ->
                val (docPage, _) = pageRepository.loadPage(nb.notebookId, p.pageId)
                val bounds = computeContentBounds(docPage)
                val inkflowFile = pageRepository.getPageFile(nb.notebookId, p.pageId)
                val sizeBytes = if (inkflowFile.exists()) inkflowFile.length() else 0L
                val sha = if (inkflowFile.exists()) computeSha256(inkflowFile.readBytes()) else ""
                PageSummary(
                    pageId = p.pageId,
                    title = p.title,
                    pageIndex = p.pageIndex,
                    filePath = "notebooks/${nb.notebookId}/pages/${p.pageId}.inkflow",
                    strokeCount = docPage.strokes.size,
                    contentBounds = bounds,
                    sizeBytes = sizeBytes,
                    sha256 = sha,
                    updatedAt = p.modifiedAt,
                    template = p.template,
                    difficulty = p.difficulty,
                    status = p.problemStatus,
                    tags = if (p.tags.isNotBlank()) p.tags.split(",").map { it.trim() } else emptyList(),
                    sourceLink = p.sourceUrl
                )
            }
            NotebookSummary(
                notebookId = nb.notebookId,
                folderId = nb.folderId,
                title = nb.title,
                pageCount = pageSummaries.size,
                isStarred = nb.isStarred,
                createdAt = nb.createdAt,
                modifiedAt = nb.modifiedAt,
                iconKey = nb.iconKey,
                pages = pageSummaries
            )
        }

        val libraryIndex = LibraryIndex(
            version = 1,
            exportedAt = System.currentTimeMillis(),
            appVersion = "1.0.0",
            folders = folderSummaries,
            notebooks = notebookSummaries
        )
        val libraryJson = json.encodeToString(libraryIndex)
        val tracker = BackupChangeTracker(manifestDao, ioDispatcher)
        tracker.onContentSaved("library.json", libraryJson.toByteArray(Charsets.UTF_8))
    }

    private suspend fun exportMetadataFiles(owner: String, repo: String): List<GitTreeEntry> {
        val entries = mutableListOf<GitTreeEntry>()
        val folders = folderDao.getAllFolders().first()
        val notebooks = notebookDao.getAllNotebooks().first()
        val allPages = mutableListOf<PageEntity>()
        for (nb in notebooks) {
            allPages.addAll(pageDao.getPagesForNotebook(nb.notebookId).first())
        }

        // 1. backup-meta.json
        val meta = BackupMetadata(
            schemaVersion = 1,
            appVersion = "1.0.0",
            deviceId = "moto_pad_70_pro",
            deviceModel = "Motorola Moto Pad 70 Pro",
            lastBackupTimestamp = System.currentTimeMillis(),
            encryption = EncryptionConfig(enabled = tokenStorage.isEncryptionEnabled())
        )
        val metaJson = json.encodeToString(meta)
        gitDataClient.uploadBlob(owner, repo, metaJson.toByteArray(Charsets.UTF_8), isBinary = false).getOrNull()?.let { sha ->
            entries.add(GitTreeEntry("backup-meta.json", sha))
        }

        // 2. library.json
        val folderSummaries = folders.map { f ->
            FolderSummary(
                folderId = f.folderId,
                parentFolderId = f.parentFolderId,
                name = f.name,
                colorHex = f.colorHex,
                isPinned = f.isPinned,
                createdAt = f.createdAt,
                modifiedAt = f.modifiedAt,
                iconKey = f.iconKey
            )
        }

        val notebookSummaries = notebooks.map { nb ->
            val nbPages = allPages.filter { it.notebookId == nb.notebookId }.sortedBy { it.pageIndex }
            val pageSummaries = nbPages.map { p ->
                val (docPage, _) = pageRepository.loadPage(nb.notebookId, p.pageId)
                val bounds = computeContentBounds(docPage)
                val inkflowFile = pageRepository.getPageFile(nb.notebookId, p.pageId)
                val sizeBytes = if (inkflowFile.exists()) inkflowFile.length() else 0L
                val sha = if (inkflowFile.exists()) computeSha256(inkflowFile.readBytes()) else ""
                PageSummary(
                    pageId = p.pageId,
                    title = p.title,
                    pageIndex = p.pageIndex,
                    filePath = "notebooks/${nb.notebookId}/pages/${p.pageId}.inkflow",
                    strokeCount = docPage.strokes.size,
                    contentBounds = bounds,
                    sizeBytes = sizeBytes,
                    sha256 = sha,
                    updatedAt = p.modifiedAt,
                    template = p.template,
                    difficulty = p.difficulty,
                    status = p.problemStatus,
                    tags = if (p.tags.isNotBlank()) p.tags.split(",").map { it.trim() } else emptyList(),
                    sourceLink = p.sourceUrl
                )
            }
            NotebookSummary(
                notebookId = nb.notebookId,
                folderId = nb.folderId,
                title = nb.title,
                pageCount = pageSummaries.size,
                isStarred = nb.isStarred,
                createdAt = nb.createdAt,
                modifiedAt = nb.modifiedAt,
                iconKey = nb.iconKey,
                pages = pageSummaries
            )
        }

        val libraryIndex = LibraryIndex(
            version = 1,
            exportedAt = System.currentTimeMillis(),
            appVersion = "1.0.0",
            folders = folderSummaries,
            notebooks = notebookSummaries
        )
        val libraryJson = json.encodeToString(libraryIndex)
        gitDataClient.uploadBlob(owner, repo, libraryJson.toByteArray(Charsets.UTF_8), isBinary = false).getOrNull()?.let { sha ->
            entries.add(GitTreeEntry("library.json", sha))
        }

        // 3. search-index.json
        val searchPages = mutableMapOf<String, PageSearchItem>()
        for (p in allPages) {
            val nb = notebooks.find { it.notebookId == p.notebookId }
            val folder = folders.find { it.folderId == nb?.folderId }
            val typedParts = mutableListOf<String>()
            if (p.approachSummary.isNotBlank()) typedParts.add(p.approachSummary)
            if (p.codeSnippet.isNotBlank()) typedParts.add(p.codeSnippet)
            if (p.tags.isNotBlank()) typedParts.add(p.tags)
            if (!p.problemDescriptionHtml.isNullOrBlank()) {
                val plainDesc = p.problemDescriptionHtml.replace(Regex("<[^>]*>"), " ").trim()
                if (plainDesc.isNotBlank()) typedParts.add(plainDesc)
            }
            searchPages[p.pageId] = PageSearchItem(
                title = p.title,
                notebookTitle = nb?.title ?: "Notebook",
                folderName = folder?.name,
                typedText = typedParts.joinToString(" "),
                ocrText = ""
            )
        }
        val searchIndex = SearchIndex(
            version = 1,
            updatedAt = System.currentTimeMillis(),
            pages = searchPages
        )
        val searchJson = json.encodeToString(searchIndex)
        gitDataClient.uploadBlob(owner, repo, searchJson.toByteArray(Charsets.UTF_8), isBinary = false).getOrNull()?.let { sha ->
            entries.add(GitTreeEntry("search-index.json", sha))
        }

        return entries
    }

    private suspend fun generateReadmeTreeEntry(owner: String, repo: String): GitTreeEntry? {
        try {
            val folders = folderDao.getAllFolders().first()
            val notebooks = notebookDao.getAllNotebooks().first()
            val allPages = mutableListOf<PageEntity>()
            for (nb in notebooks) {
                allPages.addAll(pageDao.getPagesForNotebook(nb.notebookId).first())
            }

            val timestampStr = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
            val sb = StringBuilder()
            sb.append("# 📓 InkFlow Notes & Knowledge Base\n\n")
            sb.append("> **Device:** Motorola Moto Pad 70 Pro (Android 16, 144Hz)  \n")
            sb.append("> **Last Backup:** ").append(timestampStr).append("  \n")
            sb.append("> **Total Active Pages:** ").append(allPages.size).append("  \n")
            sb.append("> **Format:** Authoritative Lossless Vector `.inkflow`  \n\n")
            sb.append("---\n\n")
            sb.append("## 📚 Library Directory\n\n")

            val rootFolders = folders.filter { it.parentFolderId == null }
            for (subject in rootFolders) {
                sb.append("### 📂 ").append(subject.name).append("\n\n")
                val subFolders = folders.filter { it.parentFolderId == subject.folderId }
                for (topic in subFolders) {
                    sb.append("#### 📁 ").append(topic.name).append("\n\n")
                    val topicNotebooks = notebooks.filter { it.folderId == topic.folderId }
                    for (nb in topicNotebooks) {
                        sb.append("##### 📘 ").append(nb.title).append("\n\n")
                        val pages = allPages.filter { it.notebookId == nb.notebookId }.sortedBy { it.pageIndex }
                        for (p in pages) {
                            val diffBadge = if (p.difficulty != null) " `[${p.difficulty}]`" else ""
                            sb.append("- 📝 **[").append(p.title).append("](notebooks/")
                                .append(nb.notebookId).append("/pages/").append(p.pageId).append(".inkflow)**")
                                .append(diffBadge).append(" &nbsp;•&nbsp; `")
                                .append(p.template).append("`\n")
                        }
                        sb.append("\n")
                    }
                }
            }

            // Root notebooks
            val rootNotebooks = notebooks.filter { it.folderId == null }
            if (rootNotebooks.isNotEmpty()) {
                sb.append("### 📘 General Notebooks\n\n")
                for (nb in rootNotebooks) {
                    sb.append("#### ").append(nb.title).append("\n\n")
                    val pages = allPages.filter { it.notebookId == nb.notebookId }.sortedBy { it.pageIndex }
                    for (p in pages) {
                        sb.append("- 📝 **[").append(p.title).append("](notebooks/")
                            .append(nb.notebookId).append("/pages/").append(p.pageId).append(".inkflow)**\n")
                    }
                    sb.append("\n")
                }
            }

            val blobSha = gitDataClient.uploadBlob(
                owner = owner,
                repo = repo,
                contentBytes = sb.toString().toByteArray(Charsets.UTF_8),
                isBinary = false
            ).getOrNull() ?: return null

            return GitTreeEntry(path = "README.md", sha = blobSha)
        } catch (_: Exception) {
            return null
        }
    }

    private fun computeContentBounds(page: DocumentPage): ContentBounds? {
        val bounds = page.computeContentBounds() ?: return null
        return ContentBounds(bounds[0], bounds[1], bounds[2], bounds[3])
    }

    private fun computeSha256(bytes: ByteArray): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(bytes)
        return hash.joinToString("") { "%02x".format(it) }
    }

    /**
     * Scan remote repository tree for legacy heavyweight files (exports/, .svg, .webp, companion .md).
     */
    suspend fun scanForSlimDown(): Result<SlimDownScanResult> = withContext(ioDispatcher) {
        try {
            val repoSelection = tokenStorage.getSelectedRepo()
                ?: return@withContext Result.failure(IllegalStateException("No backup repository configured in settings."))
            val (owner, repo, branch) = repoSelection

            val branchRef = gitDataClient.getBranchHeadRef(owner, repo, branch).getOrThrow()
            val commit = gitDataClient.getCommit(owner, repo, branchRef.`object`.sha).getOrThrow()
            val treeRes = gitDataClient.getTreeRecursive(owner, repo, commit.tree.sha).getOrThrow()

            val legacyItems = treeRes.tree.filter { item ->
                item.path.startsWith("exports/") ||
                item.path.endsWith(".svg", ignoreCase = true) ||
                item.path.endsWith(".webp", ignoreCase = true) ||
                (item.path.startsWith("notebooks/") && item.path.endsWith(".md", ignoreCase = true))
            }
            val totalBytes = legacyItems.sumOf { it.size ?: 0L }
            Result.success(
                SlimDownScanResult(
                    svgCount = legacyItems.size,
                    totalSvgBytes = totalBytes,
                    svgPaths = legacyItems.map { it.path }
                )
            )
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Delete legacy remote exports (exports/, .svg, .webp, companion .md), keeping only .inkflow and metadata.
     */
    suspend fun executeSlimDown(): Result<SlimDownExecutionResult> = withContext(ioDispatcher) {
        try {
            val repoSelection = tokenStorage.getSelectedRepo()
                ?: return@withContext Result.failure(IllegalStateException("No backup repository configured in settings."))
            val (owner, repo, branch) = repoSelection

            val branchRef = gitDataClient.getBranchHeadRef(owner, repo, branch).getOrThrow()
            val remoteHeadSha = branchRef.`object`.sha
            val commit = gitDataClient.getCommit(owner, repo, remoteHeadSha).getOrThrow()
            val baseTreeSha = commit.tree.sha
            val treeRes = gitDataClient.getTreeRecursive(owner, repo, baseTreeSha).getOrThrow()

            val legacyItems = treeRes.tree.filter { item ->
                item.path.startsWith("exports/") ||
                item.path.endsWith(".svg", ignoreCase = true) ||
                item.path.endsWith(".webp", ignoreCase = true) ||
                (item.path.startsWith("notebooks/") && item.path.endsWith(".md", ignoreCase = true))
            }
            if (legacyItems.isEmpty()) {
                return@withContext Result.success(SlimDownExecutionResult(0, 0L, 0, remoteHeadSha))
            }

            val treeEntries = mutableListOf<GitTreeEntry>()
            for (item in legacyItems) {
                treeEntries.add(GitTreeEntry(path = item.path, sha = null))
            }

            // Create new tree & commit
            val newTreeSha = gitDataClient.createTree(owner, repo, baseTreeSha, treeEntries).getOrThrow()
            val reclaimedMb = String.format(Locale.US, "%.1f", legacyItems.sumOf { it.size ?: 0L } / (1024f * 1024f))
            val commitMessage = "Slim down repository: Removed ${legacyItems.size} legacy export files (~$reclaimedMb MB), keeping compact .inkflow data"
            val newCommitSha = gitDataClient.createCommit(
                owner = owner,
                repo = repo,
                message = commitMessage,
                treeSha = newTreeSha,
                parentCommitShas = listOf(remoteHeadSha)
            ).getOrThrow()

            gitDataClient.updateBranchRef(owner, repo, branch, newCommitSha, force = false).getOrThrow()
            lastCommitTimeMs = System.currentTimeMillis()

            Result.success(
                SlimDownExecutionResult(
                    removedSvgCount = legacyItems.size,
                    reclaimedBytes = legacyItems.sumOf { it.size ?: 0L },
                    pushedWebpCount = 0,
                    commitSha = newCommitSha
                )
            )
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }
}

data class SlimDownScanResult(
    val svgCount: Int,
    val totalSvgBytes: Long,
    val svgPaths: List<String>
)

data class SlimDownExecutionResult(
    val removedSvgCount: Int,
    val reclaimedBytes: Long,
    val pushedWebpCount: Int,
    val commitSha: String
)
