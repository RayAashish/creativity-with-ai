package com.antigravity.note.library.backup.engine

import com.antigravity.note.library.backup.auth.TokenStorage
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.util.Base64
import kotlin.random.Random

class GitHubGitDataClient(
    private val tokenStorage: TokenStorage,
    private val okHttpClient: OkHttpClient = OkHttpClient.Builder().build(),
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
    private val uploadConcurrencyLimit: Int = 4
) {
    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    private val blobUploadSemaphore = Semaphore(uploadConcurrencyLimit)

    companion object {
        private const val API_BASE = "https://api.github.com"
        const val MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024L // 50 MiB
        private const val MAX_RETRIES = 3
    }

    private fun getAuthToken(): String {
        return tokenStorage.getToken()
            ?: throw IllegalStateException("GitHub account not authenticated. Please sign in.")
    }

    private suspend fun executeWithRetry(
        maxAttempts: Int = MAX_RETRIES,
        action: suspend () -> Response
    ): Response {
        var attempt = 0
        var backoffMs = 1000L

        while (true) {
            attempt++
            try {
                val response = action()
                if (response.code == 429 || response.code == 403) {
                    val retryAfter = response.header("Retry-After")?.toLongOrNull()
                    val waitTimeMs = if (retryAfter != null) {
                        retryAfter * 1000L
                    } else {
                        backoffMs + Random.nextLong(100, 500)
                    }

                    if (attempt < maxAttempts) {
                        response.close()
                        delay(waitTimeMs)
                        backoffMs *= 2
                        continue
                    }
                }
                return response
            } catch (e: IOException) {
                if (attempt < maxAttempts) {
                    val waitTimeMs = backoffMs + Random.nextLong(100, 500)
                    delay(waitTimeMs)
                    backoffMs *= 2
                } else {
                    throw e
                }
            }
        }
    }

    /**
     * Get branch head ref (e.g. refs/heads/main)
     */
    suspend fun getBranchHeadRef(owner: String, repo: String, branch: String): Result<GitRef> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val request = Request.Builder()
                .url("$API_BASE/repos/$owner/$repo/git/ref/heads/$branch")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            executeWithRetry { okHttpClient.newCall(request).execute() }.use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Failed to get ref heads/$branch: HTTP ${response.code} - $body"))
                }
                val gitRef = json.decodeFromString<GitRef>(body)
                Result.success(gitRef)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Get commit object to retrieve tree SHA
     */
    suspend fun getCommit(owner: String, repo: String, commitSha: String): Result<GitCommit> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val request = Request.Builder()
                .url("$API_BASE/repos/$owner/$repo/git/commits/$commitSha")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            executeWithRetry { okHttpClient.newCall(request).execute() }.use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Failed to get commit $commitSha: HTTP ${response.code}"))
                }
                val commit = json.decodeFromString<GitCommit>(body)
                Result.success(commit)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Upload single file as Git blob with bounded concurrency and 50MB check.
     */
    suspend fun uploadBlob(
        owner: String,
        repo: String,
        contentBytes: ByteArray,
        isBinary: Boolean = true
    ): Result<String> = blobUploadSemaphore.withPermit {
        withContext(ioDispatcher) {
            try {
                if (contentBytes.size > MAX_FILE_SIZE_BYTES) {
                    return@withContext Result.failure(
                        IllegalArgumentException("File size ${contentBytes.size} exceeds maximum 50 MiB limit. Skipping standard blob upload.")
                    )
                }

                val token = getAuthToken()
                val (contentStr, encodingStr) = if (isBinary) {
                    Pair(Base64.getEncoder().encodeToString(contentBytes), "base64")
                } else {
                    Pair(String(contentBytes, Charsets.UTF_8), "utf-8")
                }

                val payload = buildJsonObject {
                    put("content", contentStr)
                    put("encoding", encodingStr)
                }.toString()

                val request = Request.Builder()
                    .url("$API_BASE/repos/$owner/$repo/git/blobs")
                    .header("Accept", "application/vnd.github+json")
                    .header("Authorization", "Bearer $token")
                    .post(payload.toRequestBody("application/json".toMediaType()))
                    .build()

                executeWithRetry { okHttpClient.newCall(request).execute() }.use { response ->
                    val body = response.body?.string() ?: ""
                    if (!response.isSuccessful) {
                        return@withContext Result.failure(IOException("Failed to upload blob: HTTP ${response.code} - $body"))
                    }
                    val blob = json.decodeFromString<CreateBlobResponse>(body)
                    Result.success(blob.sha)
                }
            } catch (e: Exception) {
                if (e is CancellationException) throw e
                Result.failure(e)
            }
        }
    }

    /**
     * Create tree referencing base_tree, with new/updated blobs and null sha deletions
     */
    suspend fun createTree(
        owner: String,
        repo: String,
        baseTreeSha: String?,
        entries: List<GitTreeEntry>
    ): Result<String> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val entriesArray = buildJsonArray {
                for (entry in entries) {
                    add(
                        buildJsonObject {
                            put("path", entry.path)
                            put("mode", entry.mode)
                            put("type", entry.type)
                            if (entry.sha != null) {
                                put("sha", entry.sha)
                            } else {
                                // Explicit null removes file from tree
                                put("sha", null as String?)
                            }
                        }
                    )
                }
            }

            val payload = buildJsonObject {
                if (baseTreeSha != null) {
                    put("base_tree", baseTreeSha)
                }
                put("tree", entriesArray)
            }.toString()

            val request = Request.Builder()
                .url("$API_BASE/repos/$owner/$repo/git/trees")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .post(payload.toRequestBody("application/json".toMediaType()))
                .build()

            executeWithRetry { okHttpClient.newCall(request).execute() }.use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Failed to create tree: HTTP ${response.code} - $body"))
                }
                val treeRes = json.decodeFromString<CreateTreeResponse>(body)
                Result.success(treeRes.sha)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Fetch tree recursively to scan files and sizes
     */
    suspend fun getTreeRecursive(
        owner: String,
        repo: String,
        treeSha: String
    ): Result<GitTreeDetailResponse> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val request = Request.Builder()
                .url("$API_BASE/repos/$owner/$repo/git/trees/$treeSha?recursive=1")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            executeWithRetry { okHttpClient.newCall(request).execute() }.use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Failed to fetch tree: HTTP ${response.code}"))
                }
                val treeRes = json.decodeFromString<GitTreeDetailResponse>(body)
                Result.success(treeRes)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Create atomic commit
     */
    suspend fun createCommit(
        owner: String,
        repo: String,
        message: String,
        treeSha: String,
        parentCommitShas: List<String>
    ): Result<String> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val parentsArray = buildJsonArray {
                for (parent in parentCommitShas) {
                    add(kotlinx.serialization.json.JsonPrimitive(parent))
                }
            }

            val payload = buildJsonObject {
                put("message", message)
                put("tree", treeSha)
                put("parents", parentsArray)
            }.toString()

            val request = Request.Builder()
                .url("$API_BASE/repos/$owner/$repo/git/commits")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .post(payload.toRequestBody("application/json".toMediaType()))
                .build()

            executeWithRetry { okHttpClient.newCall(request).execute() }.use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Failed to create commit: HTTP ${response.code} - $body"))
                }
                val commit = json.decodeFromString<GitCommit>(body)
                Result.success(commit.sha)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Update branch ref (fast-forward, force = false)
     */
    suspend fun updateBranchRef(
        owner: String,
        repo: String,
        branch: String,
        newCommitSha: String,
        force: Boolean = false
    ): Result<Unit> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val payload = buildJsonObject {
                put("sha", newCommitSha)
                put("force", force)
            }.toString()

            val request = Request.Builder()
                .url("$API_BASE/repos/$owner/$repo/git/refs/heads/$branch")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .patch(payload.toRequestBody("application/json".toMediaType()))
                .build()

            executeWithRetry { okHttpClient.newCall(request).execute() }.use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(
                        IOException("Failed to update branch ref: HTTP ${response.code} - $body")
                    )
                }
                Result.success(Unit)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Download blob content by SHA
     */
    suspend fun getBlob(owner: String, repo: String, fileSha: String): Result<ByteArray> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val request = Request.Builder()
                .url("$API_BASE/repos/$owner/$repo/git/blobs/$fileSha")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            executeWithRetry { okHttpClient.newCall(request).execute() }.use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Failed to fetch blob $fileSha: HTTP ${response.code}"))
                }
                val root = json.parseToJsonElement(body)
                val content = root.toString().let {
                    val regex = """"content"\s*:\s*"([^"]+)"""".toRegex()
                    regex.find(it)?.groupValues?.get(1) ?: ""
                }.replace("\n", "").replace("\\n", "")
                val decoded = Base64.getDecoder().decode(content)
                Result.success(decoded)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }
}
