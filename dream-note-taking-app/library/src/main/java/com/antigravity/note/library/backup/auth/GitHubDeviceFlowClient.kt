package com.antigravity.note.library.backup.auth

import com.antigravity.note.library.BuildConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

class GitHubDeviceFlowClient(
    private val tokenStorage: TokenStorage,
    private val okHttpClient: OkHttpClient = OkHttpClient.Builder().build(),
    private val clientId: String = BuildConfig.GITHUB_CLIENT_ID,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val json = Json { ignoreUnknownKeys = true }

    companion object {
        private const val DEVICE_CODE_URL = "https://github.com/login/device/code"
        private const val ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token"
        private const val USER_API_URL = "https://api.github.com/user"
        const val REQUIRED_SCOPE = "repo"
    }

    /**
     * Step 1: Request Device and User verification codes from GitHub
     */
    suspend fun requestDeviceCode(): Result<DeviceCodeResponse> = withContext(ioDispatcher) {
        try {
            if (clientId.isBlank()) {
                return@withContext Result.failure(IllegalStateException("GitHub Client ID is not configured in local.properties"))
            }

            val formBody = FormBody.Builder()
                .add("client_id", clientId)
                .add("scope", REQUIRED_SCOPE)
                .build()

            val request = Request.Builder()
                .url(DEVICE_CODE_URL)
                .header("Accept", "application/json")
                .post(formBody)
                .build()

            okHttpClient.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (!response.isSuccessful) {
                    return@withContext Result.failure(
                        IOException("Failed to request device code: HTTP ${response.code} - $body")
                    )
                }
                val deviceCodeResponse = json.decodeFromString<DeviceCodeResponse>(body)
                Result.success(deviceCodeResponse)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Step 2: Poll GitHub for authorization token with interval and slow_down support
     */
    fun pollForToken(
        deviceCode: String,
        initialIntervalSeconds: Int = 5,
        expiresInSeconds: Int = 900
    ): Flow<AuthState> = flow {
        var intervalSeconds = if (initialIntervalSeconds >= 0) initialIntervalSeconds else 5
        val deadlineMs = System.currentTimeMillis() + (expiresInSeconds * 1000L)

        while (System.currentTimeMillis() < deadlineMs) {
            delay(intervalSeconds * 1000L)

            val formBody = FormBody.Builder()
                .add("client_id", clientId)
                .add("device_code", deviceCode)
                .add("grant_type", "urn:ietf:params:oauth:grant-type:device_code")
                .build()

            val request = Request.Builder()
                .url(ACCESS_TOKEN_URL)
                .header("Accept", "application/json")
                .post(formBody)
                .build()

            val pollResult: DeviceTokenResponse? = try {
                okHttpClient.newCall(request).execute().use { response ->
                    val body = response.body?.string() ?: ""
                    json.decodeFromString<DeviceTokenResponse>(body)
                }
            } catch (e: IOException) {
                // Transient network drop or background network sleep; continue polling
                null
            }

            if (pollResult != null) {
                val token = pollResult.accessToken
                if (!token.isNullOrBlank()) {
                    // Success!
                    tokenStorage.saveToken(token)
                    val userResult = fetchUserProfile(token)
                    val user = userResult.getOrNull()
                    emit(
                        AuthState.Authenticated(
                            username = user?.login ?: "GitHub User",
                            avatarUrl = user?.avatarUrl,
                            token = token
                        )
                    )
                    return@flow
                }

                when (pollResult.error) {
                    "authorization_pending" -> {
                        // User has not entered code yet; continue polling
                    }
                    "slow_down" -> {
                        // GitHub rate limit guideline: increase interval by 5 seconds
                        intervalSeconds += 5
                    }
                    "expired_token" -> {
                        emit(AuthState.Error("Authorization code expired. Please request a new code.", isRecoverable = false))
                        return@flow
                    }
                    "access_denied" -> {
                        emit(AuthState.Error("Access was denied by user.", isRecoverable = false))
                        return@flow
                    }
                    else -> {
                        val desc = pollResult.errorDescription ?: pollResult.error ?: "Unknown error"
                        emit(AuthState.Error("Authorization error: $desc", isRecoverable = false))
                        return@flow
                    }
                }
            }
        }

        emit(AuthState.Error("Authorization timed out. Please try again.", isRecoverable = false))
    }.flowOn(ioDispatcher)

    /**
     * Fetch user profile info with the acquired token
     */
    suspend fun fetchUserProfile(token: String): Result<GitHubUser> = withContext(ioDispatcher) {
        try {
            val request = Request.Builder()
                .url(USER_API_URL)
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            okHttpClient.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (response.code == 401) {
                    tokenStorage.clearToken()
                    return@withContext Result.failure(SecurityException("Token expired or revoked (401)"))
                }
                if (!response.isSuccessful) {
                    return@withContext Result.failure(IOException("Failed to fetch user: HTTP ${response.code}"))
                }
                val user = json.decodeFromString<GitHubUser>(body)
                Result.success(user)
            }
        } catch (e: Exception) {
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    /**
     * Sign out and clear stored tokens
     */
    fun signOut() {
        tokenStorage.clearToken()
        tokenStorage.clearSelectedRepo()
    }

    /**
     * Check if currently authenticated and valid
     */
    suspend fun getCurrentAuthState(): AuthState = withContext(ioDispatcher) {
        val token = tokenStorage.getToken()
        if (token.isNullOrBlank()) {
            return@withContext AuthState.SignedOut
        }
        val userRes = fetchUserProfile(token)
        userRes.fold(
            onSuccess = { user ->
                AuthState.Authenticated(user.login, user.avatarUrl, token)
            },
            onFailure = { error ->
                if (error is SecurityException) {
                    AuthState.ReconnectionRequired
                } else {
                    // Network issue, assume authenticated with cached credentials
                    AuthState.Authenticated("GitHub User", null, token)
                }
            }
        )
    }
}
