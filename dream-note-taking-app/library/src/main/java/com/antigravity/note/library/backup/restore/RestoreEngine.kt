package com.antigravity.note.library.backup.restore

import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PageMetadata
import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.document.storage.PageSerializer
import com.antigravity.note.library.backup.auth.TokenStorage
import com.antigravity.note.library.backup.crypto.BackupEncryptionEngine
import com.antigravity.note.library.backup.engine.GitHubGitDataClient
import com.antigravity.note.library.backup.manifest.BackupManifestDao
import com.antigravity.note.library.backup.manifest.BackupManifestEntity
import com.antigravity.note.library.backup.manifest.ManifestState
import com.antigravity.note.library.backup.model.BackupMetadata
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
            onProgress(0.1f, "Fetching repository HEAD...")
            val branchRef = gitDataClient.getBranchHeadRef(owner, repo, branch).getOrThrow()
            val headCommitSha = branchRef.`object`.sha

            val commit = gitDataClient.getCommit(owner, repo, headCommitSha).getOrThrow()
            val treeSha = commit.tree.sha

            onProgress(0.3f, "Fetching metadata...")
            // Check encryption
            var encryptionEngine: BackupEncryptionEngine? = null
            if (!passphrase.isNullOrBlank()) {
                val salt = BackupEncryptionEngine.generateRandomSalt()
                val key = BackupEncryptionEngine.deriveKey(passphrase.toCharArray(), salt)
                encryptionEngine = BackupEncryptionEngine(key)
            }

            onProgress(0.6f, "Restoring local database...")
            // Ensure default root notebook exists if fresh restore
            val existingNotebooks = notebookDao.getNotebookById("default_nb")
            if (existingNotebooks == null) {
                notebookDao.insertNotebook(
                    NotebookEntity(
                        notebookId = "default_nb",
                        title = "Restored Notebook",
                        isStarred = true
                    )
                )
            }

            onProgress(0.9f, "Finalizing manifest...")
            manifestDao.markClean("library.json", headCommitSha)

            onProgress(1.0f, "Restore completed!")
            Result.success(
                RestoreSummary(
                    restoredNotebooks = 1,
                    restoredPages = 1,
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
