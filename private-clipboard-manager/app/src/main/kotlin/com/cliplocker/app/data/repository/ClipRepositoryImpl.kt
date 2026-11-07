package com.cliplocker.app.data.repository

import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import com.cliplocker.app.core.crypto.BackupEncryption
import com.cliplocker.app.core.detector.SensitiveContentDetector
import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.core.model.DateFilter
import com.cliplocker.app.core.model.FilterOptions
import com.cliplocker.app.data.local.ClipDao
import com.cliplocker.app.data.local.ClipEntity
import com.cliplocker.app.data.local.IgnoreAppDao
import com.cliplocker.app.data.local.IgnoreAppEntity
import com.cliplocker.app.data.preferences.PreferencesManager
import com.cliplocker.app.data.storage.ImageStorageManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.Calendar

class ClipRepositoryImpl(
    private val context: Context,
    private val clipDao: ClipDao,
    private val ignoreAppDao: IgnoreAppDao,
    private val preferencesManager: PreferencesManager,
    private val imageStorageManager: ImageStorageManager
) : ClipRepository {

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        prettyPrint = false
    }

    override fun getAllClips(): Flow<List<ClipItem>> {
        return clipDao.getAllClips().map { entities ->
            entities.map { it.toDomainModel() }
        }
    }

    override fun getPinnedClips(): Flow<List<ClipItem>> {
        return clipDao.getPinnedClips().map { entities ->
            entities.map { it.toDomainModel() }
        }
    }

    override fun getRecentClips(limit: Int): Flow<List<ClipItem>> {
        return clipDao.getRecentClips(limit).map { entities ->
            entities.map { it.toDomainModel() }
        }
    }

    override fun getClipById(id: Long): Flow<ClipItem?> {
        return clipDao.getClipById(id).map { it?.toDomainModel() }
    }

    override suspend fun getClipByIdSync(id: Long): ClipItem? {
        return clipDao.getClipByIdSync(id)?.toDomainModel()
    }

    override fun searchClips(options: FilterOptions): Flow<List<ClipItem>> {
        val baseFlow = if (options.query.isBlank()) {
            clipDao.getAllClips()
        } else {
            // SQLite FTS4 prefix matching: append '*' to each token
            val sanitized = options.query.trim().replace("\"", "\"\"")
            val ftsQuery = sanitized.split(Regex("\\s+"))
                .filter { it.isNotBlank() }
                .joinToString(" ") { "$it*" }
            clipDao.searchFts(if (ftsQuery.isBlank()) "*" else ftsQuery)
        }

        return baseFlow.map { entities ->
            val now = System.currentTimeMillis()
            val calendar = Calendar.getInstance()

            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            calendar.set(Calendar.MILLISECOND, 0)
            val startOfToday = calendar.timeInMillis

            calendar.add(Calendar.DAY_OF_YEAR, -1)
            val startOfYesterday = calendar.timeInMillis

            calendar.set(Calendar.DAY_OF_WEEK, calendar.firstDayOfWeek)
            val startOfWeek = calendar.timeInMillis

            entities.asSequence()
                .map { it.toDomainModel() }
                .filter { item ->
                    // Type filter
                    if (options.selectedType != null && item.type != options.selectedType) {
                        return@filter false
                    }
                    // Pinned filter
                    if (options.onlyPinned && !item.isPinned) {
                        return@filter false
                    }
                    // Secrets filter
                    if (options.onlySecrets && !item.isSecret) {
                        return@filter false
                    }
                    // Date filter
                    when (options.dateFilter) {
                        DateFilter.ALL -> true
                        DateFilter.TODAY -> item.timestamp >= startOfToday
                        DateFilter.YESTERDAY -> item.timestamp in startOfYesterday until startOfToday
                        DateFilter.THIS_WEEK -> item.timestamp >= startOfWeek
                    }
                }
                .toList()
        }
    }

    override suspend fun insertClip(item: ClipItem): Long {
        return clipDao.insertClip(ClipEntity.fromDomainModel(item))
    }

    override suspend fun saveNewClipFromCapture(
        content: String,
        sourceAppPackage: String?,
        imageUri: Uri?
    ): Long? {
        val prefs = preferencesManager.userPreferences.value
        if (!prefs.isCaptureEnabled || prefs.isIncognito) {
            return null
        }

        // Check if source app is ignored
        if (sourceAppPackage != null && ignoreAppDao.isIgnored(sourceAppPackage)) {
            return null
        }

        val hash = SensitiveContentDetector.computeSha256(content)
        val now = System.currentTimeMillis()

        // Debounce exact duplicate capture within 1.5 seconds
        val latest = clipDao.getLatestClip()
        if (latest != null && latest.contentHash == hash && (now - latest.timestamp) < 1500L) {
            return null
        }

        // If duplicates are not allowed (default), bump existing clip to the top
        val existing = clipDao.findClipByHash(hash)
        if (existing != null && !prefs.allowDuplicates) {
            val updated = existing.copy(
                timestamp = now,
                sourceAppPackage = sourceAppPackage ?: existing.sourceAppPackage
            )
            clipDao.updateClip(updated)
            return updated.id
        }

        var clipType = ClipType.TEXT
        var isSecret = false
        var sensitiveType = com.cliplocker.app.core.model.SensitiveType.NONE
        var secretExpiresAt: Long? = null
        var imageFilePath: String? = null
        var thumbnailFilePath: String? = null

        if (imageUri != null) {
            clipType = ClipType.IMAGE
            val stored = imageStorageManager.storeImageFromUri(imageUri)
            if (stored != null) {
                imageFilePath = stored.imageFilePath
                thumbnailFilePath = stored.thumbnailFilePath
            }
        } else {
            val detection = SensitiveContentDetector.detect(content)
            clipType = detection.detectedClipType
            if (detection.isSensitive && prefs.autoDetectSecrets) {
                isSecret = true
                sensitiveType = detection.type
                // By default, sensitive data timer is OFF (secretExpiresAt = null)
                // If user turns ON the timer toggle, use the suggested/default TTL
                secretExpiresAt = if (prefs.sensitiveDataTimerEnabled) {
                    val ttlMillis = detection.suggestedTtl?.durationMillis ?: prefs.defaultSecretTtlMillis
                    now + ttlMillis
                } else {
                    null
                }
            }
        }

        // Resolve app label
        val appLabel = sourceAppPackage?.let { pkg ->
            runCatching {
                val pm = context.packageManager
                val appInfo = pm.getApplicationInfo(pkg, 0)
                pm.getApplicationLabel(appInfo).toString()
            }.getOrNull()
        }

        val item = ClipItem(
            content = content,
            type = clipType,
            timestamp = now,
            sourceAppPackage = sourceAppPackage,
            sourceAppLabel = appLabel,
            isPinned = false,
            isSecret = isSecret,
            sensitiveType = sensitiveType,
            secretExpiresAt = secretExpiresAt,
            imageUri = imageFilePath,
            thumbnailUri = thumbnailFilePath,
            contentHash = hash,
            charCount = content.length,
            wordCount = ClipItem.calculateWordCount(content)
        )

        return clipDao.insertClip(ClipEntity.fromDomainModel(item))
    }

    override suspend fun setPinned(id: Long, isPinned: Boolean) {
        clipDao.setPinned(id, isPinned)
    }

    override suspend fun setSecret(id: Long, isSecret: Boolean, ttlMillis: Long?) {
        val expiresAt = if (isSecret && ttlMillis != null && ttlMillis > 0) {
            System.currentTimeMillis() + ttlMillis
        } else null
        clipDao.setSecret(id, isSecret, expiresAt)
    }

    override suspend fun deleteClip(id: Long) {
        val clip = clipDao.getClipByIdSync(id)
        if (clip != null) {
            imageStorageManager.deleteImageFiles(clip.imageUri, clip.thumbnailUri)
            clipDao.deleteClipById(id)
        }
    }

    override suspend fun deleteClips(ids: List<Long>) {
        ids.forEach { id ->
            val clip = clipDao.getClipByIdSync(id)
            if (clip != null) {
                imageStorageManager.deleteImageFiles(clip.imageUri, clip.thumbnailUri)
            }
        }
        clipDao.deleteClipsByIds(ids)
    }

    override suspend fun clearAllNonPinned(): Int {
        return clipDao.clearAllNonPinned()
    }

    override suspend fun pruneOldClips(maxCount: Int, maxDays: Int): Int {
        var totalPruned = 0
        if (maxCount > 0) {
            totalPruned += clipDao.pruneOldestNonPinned(maxCount)
        }
        if (maxDays > 0) {
            val cutoff = System.currentTimeMillis() - (maxDays * 86_400_000L)
            totalPruned += clipDao.pruneOlderThan(cutoff)
        }
        return totalPruned
    }

    override suspend fun purgeExpiredSecrets(): List<ClipItem> {
        val now = System.currentTimeMillis()
        val expired = clipDao.getExpiredSecrets(now)
        if (expired.isNotEmpty()) {
            expired.forEach { entity ->
                imageStorageManager.deleteImageFiles(entity.imageUri, entity.thumbnailUri)
            }
            clipDao.deleteExpiredSecrets(now)
        }
        return expired.map { it.toDomainModel() }
    }

    override suspend fun exportEncryptedBackup(password: CharArray): ByteArray {
        val snapshot = clipDao.getAllClips().first()
        val items = snapshot.map { it.toDomainModel() }
        val serialized = json.encodeToString(items)
        return BackupEncryption.encrypt(serialized.toByteArray(Charsets.UTF_8), password)
    }

    override suspend fun importEncryptedBackup(backupData: ByteArray, password: CharArray): Int {
        val decryptedBytes = BackupEncryption.decrypt(backupData, password)
        val jsonString = String(decryptedBytes, Charsets.UTF_8)
        val items = json.decodeFromString<List<ClipItem>>(jsonString)

        var mergedCount = 0
        for (item in items) {
            val existing = clipDao.findClipByHash(item.contentHash)
            if (existing == null) {
                // Insert as new clip (preserve timestamp and content)
                clipDao.insertClip(ClipEntity.fromDomainModel(item.copy(id = 0)))
                mergedCount++
            }
        }
        return mergedCount
    }

    override fun getAllIgnoredApps(): Flow<List<IgnoreAppEntity>> {
        return ignoreAppDao.getAllIgnoredApps()
    }

    override suspend fun isAppIgnored(packageName: String): Boolean {
        return ignoreAppDao.isIgnored(packageName)
    }

    override suspend fun addIgnoredApp(packageName: String, label: String) {
        ignoreAppDao.insertIgnoredApp(
            IgnoreAppEntity(packageName = packageName, appLabel = label)
        )
    }

    override suspend fun removeIgnoredApp(packageName: String) {
        ignoreAppDao.deleteIgnoredApp(packageName)
    }
}
