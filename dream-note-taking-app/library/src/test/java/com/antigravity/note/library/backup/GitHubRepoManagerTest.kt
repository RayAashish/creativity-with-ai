package com.antigravity.note.library.backup

import com.antigravity.note.library.backup.model.BackupMetadata
import com.antigravity.note.library.backup.repo.GitHubRepoManager
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class GitHubRepoManagerTest {

    private lateinit var fakeStorage: FakeTokenStorage

    @Before
    fun setup() {
        fakeStorage = FakeTokenStorage()
        fakeStorage.saveToken("gho_test_mock_token")
    }

    @Test
    fun testCreateBackupRepoSetsPrivateAndSavesSelection() = runBlocking {
        var requestedPrivate = false
        var requestedAutoInit = false

        val mockInterceptor = Interceptor { chain ->
            val request = chain.request()
            if (request.url.encodedPath == "/user/repos") {
                val bodyStr = request.body?.let {
                    val buffer = okio.Buffer()
                    it.writeTo(buffer)
                    buffer.readUtf8()
                } ?: ""

                requestedPrivate = bodyStr.contains("\"private\":true")
                requestedAutoInit = bodyStr.contains("\"auto_init\":true")

                Response.Builder()
                    .request(request)
                    .protocol(Protocol.HTTP_1_1)
                    .code(201)
                    .message("Created")
                    .body(
                        """
                        {
                            "id": 123456,
                            "name": "inkflow-notes-backup",
                            "full_name": "octocat/inkflow-notes-backup",
                            "private": true,
                            "default_branch": "main",
                            "owner": { "login": "octocat" }
                        }
                        """.trimIndent().toResponseBody("application/json".toMediaType())
                    )
                    .build()
            } else {
                chain.proceed(request)
            }
        }

        val client = OkHttpClient.Builder().addInterceptor(mockInterceptor).build()
        val repoManager = GitHubRepoManager(
            tokenStorage = fakeStorage,
            okHttpClient = client,
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )

        val result = repoManager.createBackupRepo("inkflow-notes-backup", isPrivate = true)
        assertTrue(result.isSuccess)
        val repo = result.getOrThrow()
        assertEquals("inkflow-notes-backup", repo.name)
        assertTrue("Repo must be private", repo.private)
        assertTrue(requestedPrivate)
        assertTrue(requestedAutoInit)

        val selected = fakeStorage.getSelectedRepo()
        assertNotNull(selected)
        assertEquals("octocat", selected?.first)
        assertEquals("inkflow-notes-backup", selected?.second)
        assertEquals("main", selected?.third)
    }

    @Test
    fun testInitializeBackupMetaSendsBase64Content() = runBlocking {
        var putCalled = false
        val mockInterceptor = Interceptor { chain ->
            val request = chain.request()
            if (request.method == "GET" && request.url.encodedPath.contains("contents/backup-meta.json")) {
                // Not found yet (fresh repo)
                Response.Builder()
                    .request(request)
                    .protocol(Protocol.HTTP_1_1)
                    .code(404)
                    .message("Not Found")
                    .body("""{"message": "Not Found"}""".toResponseBody("application/json".toMediaType()))
                    .build()
            } else if (request.method == "PUT" && request.url.encodedPath.contains("contents/backup-meta.json")) {
                putCalled = true
                Response.Builder()
                    .request(request)
                    .protocol(Protocol.HTTP_1_1)
                    .code(201)
                    .message("Created")
                    .body("""{"content": {"name": "backup-meta.json"}}""".toResponseBody("application/json".toMediaType()))
                    .build()
            } else {
                chain.proceed(request)
            }
        }

        val client = OkHttpClient.Builder().addInterceptor(mockInterceptor).build()
        val repoManager = GitHubRepoManager(
            tokenStorage = fakeStorage,
            okHttpClient = client,
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )

        val meta = BackupMetadata(deviceId = "test-device")
        val result = repoManager.initializeBackupMeta("octocat", "inkflow-notes-backup", "main", meta)
        assertTrue(result.isSuccess)
        assertTrue(putCalled)
    }
}
