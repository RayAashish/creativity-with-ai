package com.cliplocker.app.data.repository

import android.net.Uri
import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.core.model.FilterOptions
import com.cliplocker.app.data.local.IgnoreAppEntity
import kotlinx.coroutines.flow.Flow

interface ClipRepository {
    fun getAllClips(): Flow<List<ClipItem>>
    fun getPinnedClips(): Flow<List<ClipItem>>
    fun getRecentClips(limit: Int): Flow<List<ClipItem>>
    fun getClipById(id: Long): Flow<ClipItem?>
    suspend fun getClipByIdSync(id: Long): ClipItem?
    fun searchClips(options: FilterOptions): Flow<List<ClipItem>>

    suspend fun insertClip(item: ClipItem): Long
    suspend fun saveNewClipFromCapture(
        content: String,
        sourceAppPackage: String?,
        imageUri: Uri? = null
    ): Long?

    suspend fun setPinned(id: Long, isPinned: Boolean)
    suspend fun setSecret(id: Long, isSecret: Boolean, ttlMillis: Long?)
    suspend fun deleteClip(id: Long)
    suspend fun deleteClips(ids: List<Long>)
    suspend fun clearAllNonPinned(): Int
    suspend fun pruneOldClips(maxCount: Int, maxDays: Int): Int
    suspend fun purgeExpiredSecrets(): List<ClipItem>

    suspend fun exportEncryptedBackup(password: CharArray): ByteArray
    suspend fun importEncryptedBackup(backupData: ByteArray, password: CharArray): Int

    fun getAllIgnoredApps(): Flow<List<IgnoreAppEntity>>
    suspend fun isAppIgnored(packageName: String): Boolean
    suspend fun addIgnoredApp(packageName: String, label: String)
    suspend fun removeIgnoredApp(packageName: String)
}
