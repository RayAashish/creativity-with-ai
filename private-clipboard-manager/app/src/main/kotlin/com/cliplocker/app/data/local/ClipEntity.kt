package com.cliplocker.app.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.core.model.SensitiveType

@Entity(
    tableName = "clips",
    indices = [
        Index(value = ["contentHash"]),
        Index(value = ["timestamp"]),
        Index(value = ["is_pinned"]),
        Index(value = ["is_secret"])
    ]
)
data class ClipEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "rowid")
    val id: Long = 0,

    @ColumnInfo(name = "content")
    val content: String,

    @ColumnInfo(name = "type")
    val type: String = ClipType.TEXT.name,

    @ColumnInfo(name = "timestamp")
    val timestamp: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "source_app_package")
    val sourceAppPackage: String? = null,

    @ColumnInfo(name = "source_app_label")
    val sourceAppLabel: String? = null,

    @ColumnInfo(name = "is_pinned")
    val isPinned: Boolean = false,

    @ColumnInfo(name = "is_secret")
    val isSecret: Boolean = false,

    @ColumnInfo(name = "sensitive_type")
    val sensitiveType: String = SensitiveType.NONE.name,

    @ColumnInfo(name = "secret_expires_at")
    val secretExpiresAt: Long? = null,

    @ColumnInfo(name = "image_uri")
    val imageUri: String? = null,

    @ColumnInfo(name = "thumbnail_uri")
    val thumbnailUri: String? = null,

    @ColumnInfo(name = "contentHash")
    val contentHash: String = "",

    @ColumnInfo(name = "char_count")
    val charCount: Int = content.length,

    @ColumnInfo(name = "word_count")
    val wordCount: Int = 0
) {
    fun toDomainModel(): ClipItem {
        return ClipItem(
            id = id,
            content = content,
            type = runCatching { ClipType.valueOf(type) }.getOrDefault(ClipType.TEXT),
            timestamp = timestamp,
            sourceAppPackage = sourceAppPackage,
            sourceAppLabel = sourceAppLabel,
            isPinned = isPinned,
            isSecret = isSecret,
            sensitiveType = runCatching { SensitiveType.valueOf(sensitiveType) }.getOrDefault(SensitiveType.NONE),
            secretExpiresAt = secretExpiresAt,
            imageUri = imageUri,
            thumbnailUri = thumbnailUri,
            contentHash = contentHash,
            charCount = charCount,
            wordCount = wordCount
        )
    }

    companion object {
        fun fromDomainModel(item: ClipItem): ClipEntity {
            return ClipEntity(
                id = item.id,
                content = item.content,
                type = item.type.name,
                timestamp = item.timestamp,
                sourceAppPackage = item.sourceAppPackage,
                sourceAppLabel = item.sourceAppLabel,
                isPinned = item.isPinned,
                isSecret = item.isSecret,
                sensitiveType = item.sensitiveType.name,
                secretExpiresAt = item.secretExpiresAt,
                imageUri = item.imageUri,
                thumbnailUri = item.thumbnailUri,
                contentHash = item.contentHash,
                charCount = item.charCount,
                wordCount = item.wordCount
            )
        }
    }
}
