package com.antigravity.note.library.backup.repo

import com.antigravity.note.library.backup.auth.TokenStorage
import com.antigravity.note.library.backup.model.BackupMetadata
import com.antigravity.note.library.backup.model.GitHubRepoSummary
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.Base64

class GitHubRepoManager(
    private val tokenStorage: TokenStorage,
    private val okHttpClient: OkHttpClient = OkHttpClient.Builder().build(),
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        prettyPrint = true
    }

    companion object {
        private const val API_BASE = "https://api.github.com"
        const val DEFAULT_REPO_NAME = "inkflow-notes-backup"
    }

    private fun getAuthToken(): String {
        return tokenStorage.getToken()
            ?: throw IllegalStateException("GitHub account not authenticated. Please sign in.")
    }

    /**
     * Create a new private backup repository with auto_init=true so it is immediately non-empty.
     */
    suspend fun createBackupRepo(
        name: String = DEFAULT_REPO_NAME,
        isPrivate: Boolean = true
    ): Result<GitHubRepoSummary> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val requestJson = buildJsonObject {
                put("name", name)
                put("private", isPrivate)
                put("description", "InkFlow Private Note Backup & Markdown Knowledge Base")
                put("auto_init", true)
            }.toString()

            val request = Request.Builder()
                .url("$API_BASE/user/repos")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .post(requestJson.toRequestBody("application/json".toMediaType()))
                .build()

            okHttpClient.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(
                        IOException("Failed to create repository: HTTP ${response.code} - $body")
                    )
                }
                val repo = json.decodeFromString<GitHubRepoSummary>(body)
                val owner = repo.owner?.login ?: ""
                tokenStorage.saveSelectedRepo(owner, repo.name, repo.defaultBranch)
                Result.success(repo)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * List user's available repositories
     */
    suspend fun listUserRepos(): Result<List<GitHubRepoSummary>> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val request = Request.Builder()
                .url("$API_BASE/user/repos?type=all&sort=updated&per_page=100")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            okHttpClient.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Failed to list repos: HTTP ${response.code}"))
                }
                val repos = json.decodeFromString<List<GitHubRepoSummary>>(body)
                Result.success(repos)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Get repository details and check privacy status
     */
    suspend fun getRepoDetails(owner: String, repoName: String): Result<GitHubRepoSummary> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val request = Request.Builder()
                .url("$API_BASE/repos/$owner/$repoName")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            okHttpClient.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Failed to fetch repository: HTTP ${response.code}"))
                }
                val repo = json.decodeFromString<GitHubRepoSummary>(body)
                Result.success(repo)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Writes backup-meta.json using Contents API.
     * Works on both empty and non-empty repos, ensuring the repository has a base commit.
     */
    suspend fun initializeBackupMeta(
        owner: String,
        repoName: String,
        branch: String,
        metadata: BackupMetadata
    ): Result<String> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val metaJson = json.encodeToString(metadata)
            val base64Content = Base64.getEncoder().encodeToString(metaJson.toByteArray(Charsets.UTF_8))

            // Check if backup-meta.json already exists to pass current file SHA for update
            val getRequest = Request.Builder()
                .url("$API_BASE/repos/$owner/$repoName/contents/backup-meta.json?ref=$branch")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            var existingSha: String? = null
            okHttpClient.newCall(getRequest).execute().use { response ->
                if (response.isSuccessful) {
                    val body = response.body?.string() ?: ""
                    val root = json.parseToJsonElement(body)
                    existingSha = root.toString().let {
                        if (it.contains("\"sha\"")) {
                            val regex = """"sha"\s*:\s*"([^"]+)"""".toRegex()
                            regex.find(it)?.groupValues?.get(1)
                        } else null
                    }
                }
            }

            val requestJson = buildJsonObject {
                put("message", "InkFlow initial backup configuration")
                put("content", base64Content)
                put("branch", branch)
                if (existingSha != null) {
                    put("sha", existingSha)
                }
            }.toString()

            val putRequest = Request.Builder()
                .url("$API_BASE/repos/$owner/$repoName/contents/backup-meta.json")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .put(requestJson.toRequestBody("application/json".toMediaType()))
                .build()

            okHttpClient.newCall(putRequest).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(
                        IOException("Failed to initialize backup-meta.json: HTTP ${response.code} - $body")
                    )
                }
                Result.success(metaJson)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }
}
