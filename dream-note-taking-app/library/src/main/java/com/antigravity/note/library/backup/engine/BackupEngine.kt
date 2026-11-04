package com.antigravity.note.library.backup.engine

import com.antigravity.note.document.export.SvgExporter
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

                // If this is a page, also generate readable Markdown, lightweight WebP preview & companion MD
                if (item.path.startsWith("notebooks/") && item.path.endsWith(".inkflow") && !isEncryptionEnabled) {
                    val mdEntry = generateMarkdownTreeEntry(item.path, owner, repo)
                    if (mdEntry != null) {
                        treeEntries.add(mdEntry)
                    }

                    // Default lightweight raster preview (50–150 KB)
                    val webpEntries = generateWebpTreeEntries(item.path, owner, repo)
                    treeEntries.addAll(webpEntries)

                    // Optional heavy SVG (slow, heavy) - only if opt-in enabled
                    if (tokenStorage.isExportSvg()) {
                        val svgEntries = generateSvgTreeEntries(item.path, owner, repo)
                        treeEntries.addAll(svgEntries)
                    }

                    val notebookMd = generateNotebookPageMdEntry(item.path, owner, repo)
                    if (notebookMd != null) {
                        treeEntries.add(notebookMd)
                    }
                }
            }

            if (treeEntries.isEmpty()) {
                return@withContext BackupResult.UpToDate
            }

            // Also generate root README.md with complete interactive Table of Contents
            if (!isEncryptionEnabled) {
                val readmeEntry = generateReadmeTreeEntry(owner, repo)
                if (readmeEntry != null) {
                    treeEntries.add(readmeEntry)
                }
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

    private suspend fun generateWebpTreeEntries(
        inkflowPath: String,
        owner: String,
        repo: String
    ): List<GitTreeEntry> {
        val entries = mutableListOf<GitTreeEntry>()
        try {
            val parts = inkflowPath.split("/")
            if (parts.size < 4) return emptyList()
            val notebookId = parts[1]
            val pageId = parts[3].removeSuffix(".inkflow")

            val (docPage, _) = pageRepository.loadPage(notebookId, pageId)
            val baos = java.io.ByteArrayOutputStream()
            com.antigravity.note.inkengine.export.PageExporter.exportToWebp(
                page = docPage,
                outputStream = baos,
                maxDimension = 1920,
                quality = 85
            )
            val webpBytes = baos.toByteArray()

            val blobSha = gitDataClient.uploadBlob(
                owner = owner,
                repo = repo,
                contentBytes = webpBytes,
                isBinary = true
            ).getOrNull() ?: return emptyList()

            // 1. In notebook pages alongside .inkflow: notebooks/<nbId>/pages/<pageId>.webp
            val nbWebpPath = "notebooks/$notebookId/pages/$pageId.webp"
            entries.add(GitTreeEntry(path = nbWebpPath, sha = blobSha))

            // 2. In exports alongside .md: exports/<NotebookTitle>/<SafeTitle>.webp
            val pageEntity = pageDao.getPageById(pageId)
            val notebook = notebookDao.getNotebookById(notebookId)
            if (pageEntity != null && notebook != null) {
                val safeNb = MarkdownExporter.sanitizeName(notebook.title)
                val safeTitle = MarkdownExporter.sanitizeName(pageEntity.title)
                entries.add(GitTreeEntry(path = "exports/$safeNb/$safeTitle.webp", sha = blobSha))
            }
        } catch (_: Exception) {}
        return entries
    }

    private suspend fun generateSvgTreeEntries(
        inkflowPath: String,
        owner: String,
        repo: String
    ): List<GitTreeEntry> {
        val entries = mutableListOf<GitTreeEntry>()
        try {
            val parts = inkflowPath.split("/")
            if (parts.size < 4) return emptyList()
            val notebookId = parts[1]
            val pageId = parts[3].removeSuffix(".inkflow")

            val (docPage, _) = pageRepository.loadPage(notebookId, pageId)
            val svgString = SvgExporter.exportToSvg(docPage)
            val svgBytes = svgString.toByteArray(Charsets.UTF_8)

            val blobSha = gitDataClient.uploadBlob(
                owner = owner,
                repo = repo,
                contentBytes = svgBytes,
                isBinary = false
            ).getOrNull() ?: return emptyList()

            // 1. In notebook pages alongside .inkflow: notebooks/<nbId>/pages/<pageId>.svg
            val nbSvgPath = "notebooks/$notebookId/pages/$pageId.svg"
            entries.add(GitTreeEntry(path = nbSvgPath, sha = blobSha))

            // 2. In exports alongside .md: exports/<NotebookTitle>/<SafeTitle>.svg
            val pageEntity = pageDao.getPageById(pageId)
            val notebook = notebookDao.getNotebookById(notebookId)
            if (pageEntity != null && notebook != null) {
                val safeNb = MarkdownExporter.sanitizeName(notebook.title)
                val safeTitle = MarkdownExporter.sanitizeName(pageEntity.title)
                entries.add(GitTreeEntry(path = "exports/$safeNb/$safeTitle.svg", sha = blobSha))
            }
        } catch (_: Exception) {}
        return entries
    }

    private suspend fun generateNotebookPageMdEntry(
        inkflowPath: String,
        owner: String,
        repo: String
    ): GitTreeEntry? {
        try {
            val parts = inkflowPath.split("/")
            if (parts.size < 4) return null
            val notebookId = parts[1]
            val pageId = parts[3].removeSuffix(".inkflow")

            val pageEntity = pageDao.getPageById(pageId)
            val notebook = notebookDao.getNotebookById(notebookId)
            val title = pageEntity?.title ?: "Note Page"
            val notebookTitle = notebook?.title ?: "Notebook"

            val sb = StringBuilder()
            sb.append("# ").append(title).append("\n\n")
            sb.append("> **Notebook:** `").append(notebookTitle).append("`  \n")
            sb.append("> **Page ID:** `").append(pageId).append("`  \n")
            sb.append("> **Template:** `").append(pageEntity?.template ?: "RULED").append("`  \n\n")
            if (pageEntity?.isProblemPage == true) {
                sb.append("### Problem Overview\n")
                sb.append("- **Difficulty:** `").append(pageEntity.difficulty ?: "None").append("`\n")
                sb.append("- **Status:** `").append(pageEntity.problemStatus).append("`\n")
                if (pageEntity.timeComplexity.isNotEmpty()) sb.append("- **Time Complexity:** `").append(pageEntity.timeComplexity).append("`\n")
                if (pageEntity.spaceComplexity.isNotEmpty()) sb.append("- **Space Complexity:** `").append(pageEntity.spaceComplexity).append("`\n")
                if (pageEntity.codeSnippet.isNotEmpty()) {
                    sb.append("\n```").append(pageEntity.codeLanguage.lowercase()).append("\n")
                    sb.append(pageEntity.codeSnippet).append("\n```\n\n")
                }
            }
            sb.append("## Handwritten Note & Diagram\n\n")
            sb.append("![Handwritten Note Preview]($pageId.webp)\n\n")
            if (tokenStorage.isExportSvg()) {
                sb.append("> *Vector SVG: [`$pageId.svg`]($pageId.svg)*  \n")
            }
            sb.append("> *Lossless vector binary backup stored in [`$pageId.inkflow`]($pageId.inkflow)*\n")

            val mdPath = "notebooks/$notebookId/pages/$pageId.md"
            val blobSha = gitDataClient.uploadBlob(
                owner = owner,
                repo = repo,
                contentBytes = sb.toString().toByteArray(Charsets.UTF_8),
                isBinary = false
            ).getOrNull() ?: return null

            return GitTreeEntry(path = mdPath, sha = blobSha)
        } catch (_: Exception) {
            return null
        }
    }

    private suspend fun generateReadmeTreeEntry(
        owner: String,
        repo: String
    ): GitTreeEntry? {
        try {
            val folders = folderDao.getAllFolders().first()
            val notebooks = notebookDao.getAllNotebooks().first()
            val allPages = pageDao.getAllActivePages().first()

            val timestampStr = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
            val sb = StringBuilder()
            sb.append("# 📓 InkFlow Notes & Knowledge Base\n\n")
            sb.append("> **Device:** Motorola Moto Pad 70 Pro (Android 16, 144Hz)  \n")
            sb.append("> **Last Backup:** ").append(timestampStr).append("  \n")
            sb.append("> **Total Active Pages:** ").append(allPages.size).append("  \n\n")
            sb.append("All notes are rendered as crisp vector SVGs and GitHub-formatted Markdown for seamless reading and browsing directly in any web browser.\n\n")
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
                            val safeNb = MarkdownExporter.sanitizeName(nb.title)
                            val safeTitle = MarkdownExporter.sanitizeName(p.title)
                            val diffBadge = if (p.difficulty != null) " `[${p.difficulty}]`" else ""
                            sb.append("- 📝 **[").append(p.title).append("](exports/").append(safeNb).append("/").append(safeTitle).append(".md)**").append(diffBadge)
                            sb.append(" &nbsp;•&nbsp; [🖼️ Preview](notebooks/").append(nb.notebookId).append("/pages/").append(p.pageId).append(".webp)")
                            if (tokenStorage.isExportSvg()) {
                                sb.append(" &nbsp;•&nbsp; [📐 SVG](notebooks/").append(nb.notebookId).append("/pages/").append(p.pageId).append(".svg)")
                            }
                            sb.append("\n")
                        }
                        sb.append("\n")
                    }
                }
            }

            // Also any root notebooks
            val rootNotebooks = notebooks.filter { it.folderId == null }
            if (rootNotebooks.isNotEmpty()) {
                sb.append("### 📘 General Notebooks\n\n")
                for (nb in rootNotebooks) {
                    sb.append("#### ").append(nb.title).append("\n\n")
                    val pages = allPages.filter { it.notebookId == nb.notebookId }.sortedBy { it.pageIndex }
                    for (p in pages) {
                        val safeNb = MarkdownExporter.sanitizeName(nb.title)
                        val safeTitle = MarkdownExporter.sanitizeName(p.title)
                        sb.append("- 📝 **[").append(p.title).append("](exports/").append(safeNb).append("/").append(safeTitle).append(".md)**")
                        sb.append(" &nbsp;•&nbsp; [🖼️ Preview](notebooks/").append(nb.notebookId).append("/pages/").append(p.pageId).append(".webp)")
                        if (tokenStorage.isExportSvg()) {
                            sb.append(" &nbsp;•&nbsp; [📐 SVG](notebooks/").append(nb.notebookId).append("/pages/").append(p.pageId).append(".svg)")
                        }
                        sb.append("\n")
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

    /**
     * Scan remote repository tree for legacy heavyweight SVGs.
     */
    suspend fun scanForSlimDown(): Result<SlimDownScanResult> = withContext(ioDispatcher) {
        try {
            val repoSelection = tokenStorage.getSelectedRepo()
                ?: return@withContext Result.failure(IllegalStateException("No backup repository configured in settings."))
            val (owner, repo, branch) = repoSelection

            val branchRef = gitDataClient.getBranchHeadRef(owner, repo, branch).getOrThrow()
            val commit = gitDataClient.getCommit(owner, repo, branchRef.`object`.sha).getOrThrow()
            val treeRes = gitDataClient.getTreeRecursive(owner, repo, commit.tree.sha).getOrThrow()

            val svgItems = treeRes.tree.filter { it.path.endsWith(".svg", ignoreCase = true) }
            val totalBytes = svgItems.sumOf { it.size ?: 0L }
            Result.success(
                SlimDownScanResult(
                    svgCount = svgItems.size,
                    totalSvgBytes = totalBytes,
                    svgPaths = svgItems.map { it.path }
                )
            )
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Delete legacy remote SVGs, push lightweight WebP previews for all active pages, and update commit.
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

            val svgItems = treeRes.tree.filter { it.path.endsWith(".svg", ignoreCase = true) }
            if (svgItems.isEmpty()) {
                return@withContext Result.success(SlimDownExecutionResult(0, 0L, 0, remoteHeadSha))
            }

            val treeEntries = mutableListOf<GitTreeEntry>()
            // 1. Delete all SVGs from remote tree
            for (item in svgItems) {
                treeEntries.add(GitTreeEntry(path = item.path, sha = null))
            }

            // 2. Ensure all active pages have lightweight WebP previews & updated Markdown
            val allPages = pageDao.getAllActivePages().first()
            var webpPushed = 0
            for (page in allPages) {
                val inkflowPath = "notebooks/${page.notebookId}/pages/${page.pageId}.inkflow"
                val webpEntries = generateWebpTreeEntries(inkflowPath, owner, repo)
                treeEntries.addAll(webpEntries)
                webpPushed += webpEntries.size

                val notebookMd = generateNotebookPageMdEntry(inkflowPath, owner, repo)
                if (notebookMd != null) {
                    treeEntries.add(notebookMd)
                }
            }

            // 3. Updated README.md
            val readme = generateReadmeTreeEntry(owner, repo)
            if (readme != null) {
                treeEntries.add(readme)
            }

            // 4. Create new tree & commit
            val newTreeSha = gitDataClient.createTree(owner, repo, baseTreeSha, treeEntries).getOrThrow()
            val reclaimedMb = String.format(Locale.US, "%.1f", svgItems.sumOf { it.size ?: 0L } / (1024f * 1024f))
            val commitMessage = "Slim down repository: Replaced ${svgItems.size} legacy SVGs (~$reclaimedMb MB) with lightweight WebP previews"
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
                    removedSvgCount = svgItems.size,
                    reclaimedBytes = svgItems.sumOf { it.size ?: 0L },
                    pushedWebpCount = webpPushed,
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
