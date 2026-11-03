package com.antigravity.note.library.backup.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class BackupMetadata(
    val schemaVersion: Int = 1,
    val appVersion: String = "1.0.0",
    val deviceId: String = "moto_pad_70_pro",
    val deviceModel: String = "Motorola Moto Pad 70 Pro",
    val lastBackupTimestamp: Long = System.currentTimeMillis(),
    val encryption: EncryptionConfig = EncryptionConfig()
)

@Serializable
data class EncryptionConfig(
    val enabled: Boolean = false,
    val algorithm: String = "AES-256-GCM",
    val kdf: String = "Argon2id",
    val saltHex: String? = null
)

@Serializable
data class GitHubRepoSummary(
    val id: Long = 0L,
    val name: String,
    @SerialName("full_name") val fullName: String,
    val private: Boolean,
    @SerialName("default_branch") val defaultBranch: String = "main",
    val description: String? = null,
    val owner: GitHubRepoOwner? = null
)

@Serializable
data class GitHubRepoOwner(
    val login: String,
    val id: Long = 0L
)
