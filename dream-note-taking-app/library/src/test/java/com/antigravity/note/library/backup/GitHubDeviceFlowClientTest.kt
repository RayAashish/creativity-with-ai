package com.antigravity.note.library.backup

import com.antigravity.note.library.backup.auth.AuthState
import com.antigravity.note.library.backup.auth.GitHubDeviceFlowClient
import com.antigravity.note.library.backup.auth.TokenStorage
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.io.IOException

class GitHubDeviceFlowClientTest {

    private lateinit var fakeStorage: FakeTokenStorage

    @Before
    fun setup() {
        fakeStorage = FakeTokenStorage()
    }

    @Test
    fun testRequestDeviceCodeSuccess() = runBlocking {
        val mockInterceptor = Interceptor { chain ->
            val request = chain.request()
            if (request.url.encodedPath == "/login/device/code") {
                Response.Builder()
                    .request(request)
                    .protocol(Protocol.HTTP_1_1)
                    .code(200)
                    .message("OK")
                    .body(
                        """
                        {
                            "device_code": "dev_12345",
                            "user_code": "ABCD-1234",
                            "verification_uri": "https://github.com/login/device",
                            "expires_in": 900,
                            "interval": 1
                        }
                        """.trimIndent().toResponseBody("application/json".toMediaType())
                    )
                    .build()
            } else {
                chain.proceed(request)
            }
        }

        val client = OkHttpClient.Builder().addInterceptor(mockInterceptor).build()
        val deviceClient = GitHubDeviceFlowClient(
            tokenStorage = fakeStorage,
            okHttpClient = client,
            clientId = "test_client_id",
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )

        val result = deviceClient.requestDeviceCode()
        assertTrue(result.isSuccess)
        val codeRes = result.getOrThrow()
        assertEquals("dev_12345", codeRes.deviceCode)
        assertEquals("ABCD-1234", codeRes.userCode)
        assertEquals("https://github.com/login/device", codeRes.verificationUri)
    }

    @Test
    fun testPollForTokenSuccess() = runBlocking {
        var pollCount = 0
        val mockInterceptor = Interceptor { chain ->
            val request = chain.request()
            when (request.url.encodedPath) {
                "/login/oauth/access_token" -> {
                    pollCount++
                    if (pollCount == 1) {
                        // First poll: pending
                        Response.Builder()
                            .request(request)
                            .protocol(Protocol.HTTP_1_1)
                            .code(200)
                            .message("OK")
                            .body("""{"error": "authorization_pending"}""".toResponseBody("application/json".toMediaType()))
                            .build()
                    } else {
                        // Second poll: authenticated!
                        Response.Builder()
                            .request(request)
                            .protocol(Protocol.HTTP_1_1)
                            .code(200)
                            .message("OK")
                            .body("""{"access_token": "gho_valid_token_123", "token_type": "bearer", "scope": "repo"}""".toResponseBody("application/json".toMediaType()))
                            .build()
                    }
                }
                "/user" -> {
                    Response.Builder()
                        .request(request)
                        .protocol(Protocol.HTTP_1_1)
                        .code(200)
                        .message("OK")
                        .body("""{"login": "octocat", "id": 1}""".toResponseBody("application/json".toMediaType()))
                        .build()
                }
                else -> chain.proceed(request)
            }
        }

        val client = OkHttpClient.Builder().addInterceptor(mockInterceptor).build()
        val deviceClient = GitHubDeviceFlowClient(
            tokenStorage = fakeStorage,
            okHttpClient = client,
            clientId = "test_client_id",
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )

        val states = deviceClient.pollForToken("dev_12345", initialIntervalSeconds = 0, expiresInSeconds = 5).toList()
        assertEquals(1, states.size)
        assertTrue(states[0] is AuthState.Authenticated)
        val auth = states[0] as AuthState.Authenticated
        assertEquals("octocat", auth.username)
        assertEquals("gho_valid_token_123", auth.token)
        assertEquals("gho_valid_token_123", fakeStorage.getToken())
    }

    @Test
    fun testPollForTokenUserDenies() = runBlocking {
        val mockInterceptor = Interceptor { chain ->
            val request = chain.request()
            Response.Builder()
                .request(request)
                .protocol(Protocol.HTTP_1_1)
                .code(200)
                .message("OK")
                .body("""{"error": "access_denied", "error_description": "User denied"}""".toResponseBody("application/json".toMediaType()))
                .build()
        }

        val client = OkHttpClient.Builder().addInterceptor(mockInterceptor).build()
        val deviceClient = GitHubDeviceFlowClient(
            tokenStorage = fakeStorage,
            okHttpClient = client,
            clientId = "test_client_id",
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )

        val states = deviceClient.pollForToken("dev_12345", initialIntervalSeconds = 0, expiresInSeconds = 5).toList()
        assertEquals(1, states.size)
        assertTrue(states[0] is AuthState.Error)
        val err = states[0] as AuthState.Error
        assertTrue(err.message.contains("Access was denied"))
        assertNull(fakeStorage.getToken())
    }

    @Test
    fun testPollForTokenCodeExpires() = runBlocking {
        val mockInterceptor = Interceptor { chain ->
            val request = chain.request()
            Response.Builder()
                .request(request)
                .protocol(Protocol.HTTP_1_1)
                .code(200)
                .message("OK")
                .body("""{"error": "expired_token"}""".toResponseBody("application/json".toMediaType()))
                .build()
        }

        val client = OkHttpClient.Builder().addInterceptor(mockInterceptor).build()
        val deviceClient = GitHubDeviceFlowClient(
            tokenStorage = fakeStorage,
            okHttpClient = client,
            clientId = "test_client_id",
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )

        val states = deviceClient.pollForToken("dev_12345", initialIntervalSeconds = 0, expiresInSeconds = 5).toList()
        assertEquals(1, states.size)
        assertTrue(states[0] is AuthState.Error)
        val err = states[0] as AuthState.Error
        assertTrue(err.message.contains("expired"))
    }

    @Test
    fun testPollForTokenNetworkDropMidPollRecovers() = runBlocking {
        var attempts = 0
        val mockInterceptor = Interceptor { chain ->
            val request = chain.request()
            when (request.url.encodedPath) {
                "/login/oauth/access_token" -> {
                    attempts++
                    if (attempts == 1) {
                        throw IOException("Connection dropped")
                    } else {
                        Response.Builder()
                            .request(request)
                            .protocol(Protocol.HTTP_1_1)
                            .code(200)
                            .message("OK")
                            .body("""{"access_token": "gho_recovered_token", "token_type": "bearer"}""".toResponseBody("application/json".toMediaType()))
                            .build()
                    }
                }
                "/user" -> {
                    Response.Builder()
                        .request(request)
                        .protocol(Protocol.HTTP_1_1)
                        .code(200)
                        .message("OK")
                        .body("""{"login": "recovered_user"}""".toResponseBody("application/json".toMediaType()))
                        .build()
                }
                else -> chain.proceed(request)
            }
        }

        val client = OkHttpClient.Builder().addInterceptor(mockInterceptor).build()
        val deviceClient = GitHubDeviceFlowClient(
            tokenStorage = fakeStorage,
            okHttpClient = client,
            clientId = "test_client_id",
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )

        val states = deviceClient.pollForToken("dev_12345", initialIntervalSeconds = 0, expiresInSeconds = 5).toList()
        assertEquals(1, states.size)
        assertTrue(states[0] is AuthState.Authenticated)
        assertEquals("gho_recovered_token", fakeStorage.getToken())
    }

    @Test
    fun testUnauthorized401TriggersReconnection() = runBlocking {
        fakeStorage.saveToken("expired_token")
        val mockInterceptor = Interceptor { chain ->
            val request = chain.request()
            Response.Builder()
                .request(request)
                .protocol(Protocol.HTTP_1_1)
                .code(401)
                .message("Unauthorized")
                .body("""{"message": "Bad credentials"}""".toResponseBody("application/json".toMediaType()))
                .build()
        }

        val client = OkHttpClient.Builder().addInterceptor(mockInterceptor).build()
        val deviceClient = GitHubDeviceFlowClient(
            tokenStorage = fakeStorage,
            okHttpClient = client,
            clientId = "test_client_id",
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )

        val state = deviceClient.getCurrentAuthState()
        assertEquals(AuthState.ReconnectionRequired, state)
        assertNull("Token should be cleared on 401", fakeStorage.getToken())
    }

    @Test
    fun testSignOutClearsStoredCredentials() {
        fakeStorage.saveToken("some_token")
        fakeStorage.saveSelectedRepo("owner", "repo", "main")

        val deviceClient = GitHubDeviceFlowClient(
            tokenStorage = fakeStorage,
            clientId = "test_client_id",
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )

        deviceClient.signOut()
        assertNull(fakeStorage.getToken())
        assertNull(fakeStorage.getSelectedRepo())
    }
}

class FakeTokenStorage : TokenStorage {
    private var token: String? = null
    private var repo: Triple<String, String, String>? = null
    private var wifiOnly = true
    private var chargingOnly = false
    private var encryption = false
    private var passphrase: String? = null
    private var mirrorDeletions = false

    override fun saveToken(token: String) { this.token = token }
    override fun getToken(): String? = token
    override fun clearToken() { token = null }

    override fun saveSelectedRepo(owner: String, repo: String, branch: String) {
        this.repo = Triple(owner, repo, branch)
    }
    override fun getSelectedRepo(): Triple<String, String, String>? = repo
    override fun clearSelectedRepo() { repo = null }

    override fun isWifiOnly(): Boolean = wifiOnly
    override fun setWifiOnly(enabled: Boolean) { wifiOnly = enabled }

    override fun isChargingOnly(): Boolean = chargingOnly
    override fun setChargingOnly(enabled: Boolean) { chargingOnly = enabled }

    override fun isEncryptionEnabled(): Boolean = encryption
    override fun setEncryptionEnabled(enabled: Boolean) { encryption = enabled }

    override fun getEncryptionPassphrase(): String? = passphrase
    override fun setEncryptionPassphrase(passphrase: String?) { this.passphrase = passphrase }

    override fun isMirrorDeletions(): Boolean = mirrorDeletions
    override fun setMirrorDeletions(enabled: Boolean) { mirrorDeletions = enabled }
}
