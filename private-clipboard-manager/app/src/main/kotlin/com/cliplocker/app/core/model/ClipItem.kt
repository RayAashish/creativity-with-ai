package com.cliplocker.app.core.model

import kotlinx.serialization.Serializable

@Serializable
data class ClipItem(
    val id: Long = 0,
    val content: String,
    val type: ClipType = ClipType.TEXT,
    val timestamp: Long = System.currentTimeMillis(),
    val sourceAppPackage: String? = null,
    val sourceAppLabel: String? = null,
    val isPinned: Boolean = false,
    val isSecret: Boolean = false,
    val sensitiveType: SensitiveType = SensitiveType.NONE,
    val secretExpiresAt: Long? = null,
    val imageUri: String? = null,
    val thumbnailUri: String? = null,
    val contentHash: String = "",
    val charCount: Int = content.length,
    val wordCount: Int = calculateWordCount(content)
) {
    val isExpired: Boolean
        get() = isSecret && secretExpiresAt != null && System.currentTimeMillis() >= secretExpiresAt

    val remainingTtlMillis: Long?
        get() = if (isSecret && secretExpiresAt != null) {
            (secretExpiresAt - System.currentTimeMillis()).coerceAtLeast(0L)
        } else null

    companion object {
        fun calculateWordCount(text: String): Int {
            if (text.isBlank()) return 0
            return text.trim().split(Regex("\\s+")).size
        }
    }
}
