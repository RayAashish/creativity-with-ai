package com.antigravity.note.library.backup.gdrive

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class GoogleDriveAuthStorage(private val context: Context) {

    private val prefs: SharedPreferences by lazy {
        try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            EncryptedSharedPreferences.create(
                context,
                GoogleDriveConfig.PREFS_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (_: Exception) {
            context.getSharedPreferences(GoogleDriveConfig.PREFS_NAME, Context.MODE_PRIVATE)
        }
    }

    fun getAccessToken(): String? = prefs.getString(GoogleDriveConfig.PREF_ACCESS_TOKEN, null)

    fun getFreshToken(): String? {
        val email = getAccountEmail()
        if (!email.isNullOrBlank()) {
            try {
                val fresh = com.google.android.gms.auth.GoogleAuthUtil.getToken(
                    context,
                    android.accounts.Account(email, "com.google"),
                    "oauth2:https://www.googleapis.com/auth/drive.file"
                )
                if (!fresh.isNullOrBlank()) {
                    saveAccessToken(fresh)
                    return fresh
                }
            } catch (e: Exception) {
                android.util.Log.d("GDriveBackup", "Silent token refresh check: ${e.message}")
            }
        }
        return getAccessToken()
    }

    fun saveAccessToken(token: String?) {
        prefs.edit().putString(GoogleDriveConfig.PREF_ACCESS_TOKEN, token).apply()
    }

    fun getRefreshToken(): String? = prefs.getString(GoogleDriveConfig.PREF_REFRESH_TOKEN, null)

    fun saveRefreshToken(token: String?) {
        prefs.edit().putString(GoogleDriveConfig.PREF_REFRESH_TOKEN, token).apply()
    }

    fun getApiKey(): String = prefs.getString(GoogleDriveConfig.PREF_API_KEY, GoogleDriveConfig.DEFAULT_API_KEY) ?: GoogleDriveConfig.DEFAULT_API_KEY

    fun saveApiKey(apiKey: String?) {
        prefs.edit().putString(GoogleDriveConfig.PREF_API_KEY, apiKey).apply()
    }

    fun getAccountEmail(): String? = prefs.getString(GoogleDriveConfig.PREF_ACCOUNT_EMAIL, GoogleDriveConfig.DEFAULT_ACCOUNT_EMAIL) ?: GoogleDriveConfig.DEFAULT_ACCOUNT_EMAIL

    fun saveAccountEmail(email: String?) {
        prefs.edit().putString(GoogleDriveConfig.PREF_ACCOUNT_EMAIL, email).apply()
    }

    fun isUseVisibleFolder(): Boolean = prefs.getBoolean(GoogleDriveConfig.PREF_USE_VISIBLE_FOLDER, true)

    fun setUseVisibleFolder(useVisible: Boolean) {
        prefs.edit().putBoolean(GoogleDriveConfig.PREF_USE_VISIBLE_FOLDER, useVisible).apply()
    }

    fun getLastBackupTime(): Long = prefs.getLong(GoogleDriveConfig.PREF_LAST_BACKUP_TIME, 0L)

    fun saveLastBackupTime(timestamp: Long) {
        prefs.edit().putLong(GoogleDriveConfig.PREF_LAST_BACKUP_TIME, timestamp).apply()
    }

    fun getLastBackupSize(): Long = prefs.getLong(GoogleDriveConfig.PREF_LAST_BACKUP_SIZE, 0L)

    fun saveLastBackupSize(bytes: Long) {
        prefs.edit().putLong(GoogleDriveConfig.PREF_LAST_BACKUP_SIZE, bytes).apply()
    }

    fun getLastBackupHash(): String? = prefs.getString(GoogleDriveConfig.PREF_LAST_BACKUP_HASH, null)

    fun saveLastBackupHash(sha256: String?) {
        prefs.edit().putString(GoogleDriveConfig.PREF_LAST_BACKUP_HASH, sha256).apply()
    }

    fun clearAuth() {
        prefs.edit()
            .remove(GoogleDriveConfig.PREF_ACCESS_TOKEN)
            .remove(GoogleDriveConfig.PREF_REFRESH_TOKEN)
            .remove(GoogleDriveConfig.PREF_ACCOUNT_EMAIL)
            .apply()
    }
}
