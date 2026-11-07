package com.cliplocker.app.data.preferences

import android.content.Context
import android.content.SharedPreferences
import com.cliplocker.app.core.model.ThemeMode
import com.cliplocker.app.core.model.UserPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class PreferencesManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(
        "cliplocker_preferences",
        Context.MODE_PRIVATE
    )

    private val _userPreferences = MutableStateFlow(loadPreferences())
    val userPreferences: StateFlow<UserPreferences> = _userPreferences.asStateFlow()

    private fun loadPreferences(): UserPreferences {
        return UserPreferences(
            isCaptureEnabled = prefs.getBoolean(KEY_CAPTURE_ENABLED, true),
            isIncognito = prefs.getBoolean(KEY_INCOGNITO, false),
            biometricLockEnabled = prefs.getBoolean(KEY_BIOMETRIC_LOCK, false),
            flagSecureEnabled = prefs.getBoolean(KEY_FLAG_SECURE, false),
            wipeOnScreenOff = prefs.getBoolean(KEY_WIPE_ON_SCREEN_OFF, false),
            wipeClipboardOnSecretExpiry = prefs.getBoolean(KEY_WIPE_CLIPBOARD_ON_SECRET_EXPIRY, true),
            maxClipsRetention = prefs.getInt(KEY_MAX_CLIPS, 500),
            maxDaysRetention = prefs.getInt(KEY_MAX_DAYS, 30),
            autoDetectSecrets = prefs.getBoolean(KEY_AUTO_DETECT_SECRETS, true),
            defaultSecretTtlMillis = prefs.getLong(KEY_DEFAULT_SECRET_TTL, 5 * 60_000L),
            themeMode = runCatching {
                ThemeMode.valueOf(prefs.getString(KEY_THEME_MODE, ThemeMode.SYSTEM.name)!!)
            }.getOrDefault(ThemeMode.SYSTEM)
        )
    }

    fun updatePreferences(transform: (UserPreferences) -> UserPreferences) {
        val updated = transform(_userPreferences.value)
        prefs.edit()
            .putBoolean(KEY_CAPTURE_ENABLED, updated.isCaptureEnabled)
            .putBoolean(KEY_INCOGNITO, updated.isIncognito)
            .putBoolean(KEY_BIOMETRIC_LOCK, updated.biometricLockEnabled)
            .putBoolean(KEY_FLAG_SECURE, updated.flagSecureEnabled)
            .putBoolean(KEY_WIPE_ON_SCREEN_OFF, updated.wipeOnScreenOff)
            .putBoolean(KEY_WIPE_CLIPBOARD_ON_SECRET_EXPIRY, updated.wipeClipboardOnSecretExpiry)
            .putInt(KEY_MAX_CLIPS, updated.maxClipsRetention)
            .putInt(KEY_MAX_DAYS, updated.maxDaysRetention)
            .putBoolean(KEY_AUTO_DETECT_SECRETS, updated.autoDetectSecrets)
            .putLong(KEY_DEFAULT_SECRET_TTL, updated.defaultSecretTtlMillis)
            .putString(KEY_THEME_MODE, updated.themeMode.name)
            .apply()
        _userPreferences.value = updated
    }

    companion object {
        private const val KEY_CAPTURE_ENABLED = "is_capture_enabled"
        private const val KEY_INCOGNITO = "is_incognito"
        private const val KEY_BIOMETRIC_LOCK = "biometric_lock"
        private const val KEY_FLAG_SECURE = "flag_secure"
        private const val KEY_WIPE_ON_SCREEN_OFF = "wipe_on_screen_off"
        private const val KEY_WIPE_CLIPBOARD_ON_SECRET_EXPIRY = "wipe_clipboard_on_expiry"
        private const val KEY_MAX_CLIPS = "max_clips_retention"
        private const val KEY_MAX_DAYS = "max_days_retention"
        private const val KEY_AUTO_DETECT_SECRETS = "auto_detect_secrets"
        private const val KEY_DEFAULT_SECRET_TTL = "default_secret_ttl"
        private const val KEY_THEME_MODE = "theme_mode"
    }
}
