package com.cliplocker.app.core.model

import kotlinx.serialization.Serializable

@Serializable
enum class ThemeMode(val label: String) {
    SYSTEM("Follow System"),
    LIGHT("Paper Light"),
    DARK("Charcoal Dark")
}

@Serializable
data class UserPreferences(
    val isCaptureEnabled: Boolean = true,
    val isIncognito: Boolean = false,
    val biometricLockEnabled: Boolean = false,
    val flagSecureEnabled: Boolean = false,
    val wipeOnScreenOff: Boolean = false,
    val wipeClipboardOnSecretExpiry: Boolean = true,
    val maxClipsRetention: Int = 500,
    val maxDaysRetention: Int = 30,
    val autoDetectSecrets: Boolean = true,
    val sensitiveDataTimerEnabled: Boolean = false,
    val allowDuplicates: Boolean = false,
    val defaultSecretTtlMillis: Long = 5 * 60_000L,
    val themeMode: ThemeMode = ThemeMode.SYSTEM
)
