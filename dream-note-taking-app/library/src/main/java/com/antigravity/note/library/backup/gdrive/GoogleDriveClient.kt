package com.antigravity.note.library.backup.gdrive

import android.util.Log
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.util.concurrent.TimeUnit

data class DriveFileItem(
    val id: String,
    val name: String,
    val modifiedTime: String? = null,
    val size: Long = 0L
)

class GoogleDriveClient(
    private val authStorage: GoogleDriveAuthStorage,
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build(),
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {

    private fun getAuthToken(): String {
        return authStorage.getFreshToken()
            ?: throw IllegalStateException("Not authenticated with Google Drive. Please connect account first.")
    }

    suspend fun queryLatestBackup(useVisibleFolder: Boolean): Result<DriveFileItem?> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()

            val urlBuilder = GoogleDriveConfig.FILES_ENDPOINT.toHttpUrl().newBuilder()
            if (!useVisibleFolder) {
                urlBuilder.addQueryParameter("spaces", "appDataFolder")
            }
            urlBuilder.addQueryParameter("q", "name='${GoogleDriveConfig.BACKUP_FILENAME}' and trashed=false")
            urlBuilder.addQueryParameter("fields", "files(id,name,modifiedTime,size)")
            urlBuilder.addQueryParameter("orderBy", "modifiedTime desc")
            val requestUrl = urlBuilder.build()
            Log.d("GDriveBackup", "Querying latest backup: $requestUrl")

            val request = Request.Builder()
                .url(requestUrl)
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                val body = response.body?.string().orEmpty()
                Log.d("GDriveBackup", "Query response code ${response.code}: $body")
                if (!response.isSuccessful) {
                    val code = response.code
                    return@withContext Result.failure(IOException("Google Drive Query failed ($code): $body"))
                }

                val idMatch = Regex("\"id\"\\s*:\\s*\"(.*?)\"").find(body)
                val nameMatch = Regex("\"name\"\\s*:\\s*\"(.*?)\"").find(body)
                val modifiedMatch = Regex("\"modifiedTime\"\\s*:\\s*\"(.*?)\"").find(body)
                val sizeMatch = Regex("\"size\"\\s*:\\s*\"?(\\d+)\"?").find(body)

                if (idMatch != null) {
                    val id = idMatch.groupValues[1]
                    val name = nameMatch?.groupValues?.get(1) ?: GoogleDriveConfig.BACKUP_FILENAME
                    val modifiedTime = modifiedMatch?.groupValues?.get(1)
                    val size = sizeMatch?.groupValues?.get(1)?.toLongOrNull() ?: 0L
                    Result.success(DriveFileItem(id, name, modifiedTime, size))
                } else {
                    Result.success(null)
                }
            }
        } catch (e: Exception) {
            Log.e("GDriveBackup", "queryLatestBackup error: ${e.message}", e)
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    suspend fun uploadMultipart(
        archiveBytes: ByteArray,
        useVisibleFolder: Boolean,
        existingFileId: String? = null
    ): Result<DriveFileItem> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()
            val metadataJson = if (!useVisibleFolder) {
                """{"name": "${GoogleDriveConfig.BACKUP_FILENAME}", "parents": ["appDataFolder"]}"""
            } else {
                """{"name": "${GoogleDriveConfig.BACKUP_FILENAME}"}"""
            }

            val multipartBody = MultipartBody.Builder()
                .setType("multipart/related".toMediaType())
                .addPart(
                    metadataJson.toRequestBody("application/json; charset=UTF-8".toMediaType())
                )
                .addPart(
                    archiveBytes.toRequestBody("application/zip".toMediaType())
                )
                .build()

            val requestBuilder = Request.Builder()
                .header("Authorization", "Bearer $token")

            val urlBuilder = if (existingFileId != null) {
                "https://www.googleapis.com/upload/drive/v3/files/$existingFileId".toHttpUrl().newBuilder()
            } else {
                "https://www.googleapis.com/upload/drive/v3/files".toHttpUrl().newBuilder()
            }
            urlBuilder.addQueryParameter("uploadType", "multipart")
            val requestUrl = urlBuilder.build()
            requestBuilder.url(requestUrl)

            if (existingFileId != null) {
                requestBuilder.patch(multipartBody)
            } else {
                requestBuilder.post(multipartBody)
            }

            Log.d("GDriveBackup", "Executing upload to $requestUrl (${archiveBytes.size} bytes)")
            client.newCall(requestBuilder.build()).execute().use { response ->
                val body = response.body?.string().orEmpty()
                Log.d("GDriveBackup", "Upload response code ${response.code}: $body")
                if (!response.isSuccessful) {
                    val code = response.code
                    return@withContext Result.failure(IOException("Google Drive Upload failed ($code): $body"))
                }

                val idMatch = Regex("\"id\"\\s*:\\s*\"(.*?)\"").find(body)
                val id = idMatch?.groupValues?.get(1) ?: (existingFileId ?: "")
                Result.success(DriveFileItem(id, GoogleDriveConfig.BACKUP_FILENAME, size = archiveBytes.size.toLong()))
            }
        } catch (e: Exception) {
            Log.e("GDriveBackup", "uploadMultipart error: ${e.message}", e)
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }

    suspend fun downloadBackup(fileId: String, destinationFile: File): Result<File> = withContext(ioDispatcher) {
        try {
            val token = getAuthToken()

            val urlBuilder = "${GoogleDriveConfig.FILES_ENDPOINT}/$fileId".toHttpUrl().newBuilder()
            urlBuilder.addQueryParameter("alt", "media")
            val requestUrl = urlBuilder.build()
            Log.d("GDriveBackup", "Downloading backup from $requestUrl")

            val request = Request.Builder()
                .url(requestUrl)
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    val code = response.code
                    val errorBody = response.body?.string().orEmpty()
                    return@withContext Result.failure(IOException("Google Drive Download failed ($code): $errorBody"))
                }

                val body = response.body ?: return@withContext Result.failure(IOException("Empty response body"))
                if (destinationFile.exists()) destinationFile.delete()
                destinationFile.parentFile?.mkdirs()

                FileOutputStream(destinationFile).use { fos ->
                    body.byteStream().use { bis ->
                        bis.copyTo(fos)
                    }
                }
                Result.success(destinationFile)
            }
        } catch (e: Exception) {
            Log.e("GDriveBackup", "downloadBackup error: ${e.message}", e)
            if (e is CancellationException) throw e
            Result.failure(e)
        }
    }
}
