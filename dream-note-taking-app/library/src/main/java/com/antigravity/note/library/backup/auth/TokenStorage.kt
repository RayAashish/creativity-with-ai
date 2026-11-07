package com.antigravity.note.library.backup.auth

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

interface TokenStorage {
    fun saveToken(token: String)
    fun getToken(): String?
    fun clearToken()

    fun saveSelectedRepo(owner: String, repo: String, branch: String)
    fun getSelectedRepo(): Triple<String, String, String>?
    fun clearSelectedRepo()

    fun isWifiOnly(): Boolean
    fun setWifiOnly(enabled: Boolean)

    fun isChargingOnly(): Boolean
    fun setChargingOnly(enabled: Boolean)

    fun isEncryptionEnabled(): Boolean
    fun setEncryptionEnabled(enabled: Boolean)

    fun getEncryptionPassphrase(): String?
    fun setEncryptionPassphrase(passphrase: String?)

    fun isMirrorDeletions(): Boolean
    fun setMirrorDeletions(enabled: Boolean)

    fun isExportSvg(): Boolean
    fun setExportSvg(enabled: Boolean)
}

class EncryptedTokenStorage(context: Context) : TokenStorage {

    private val appContext = context.applicationContext

    // Fallback durable preferences that persist across reboots even if Android Keystore resets
    private val fallbackPrefs: SharedPreferences by lazy {
        appContext.getSharedPreferences("inkflow_backup_fallback_prefs", Context.MODE_PRIVATE)
    }

    // Primary EncryptedSharedPreferences with try-catch initialization
    private val securePrefs: SharedPreferences? by lazy {
        try {
            val masterKey = MasterKey.Builder(appContext)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            EncryptedSharedPreferences.create(
                appContext,
                "inkflow_backup_secure_prefs",
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            android.util.Log.e("EncryptedTokenStorage", "EncryptedSharedPreferences init failed, falling back to durable store", e)
            null
        }
    }

    override fun saveToken(token: String) {
        fallbackPrefs.edit().putString(KEY_AUTH_TOKEN, token).commit()
        try {
            securePrefs?.edit()?.putString(KEY_AUTH_TOKEN, token)?.commit()
        } catch (e: Exception) {
            android.util.Log.w("EncryptedTokenStorage", "Error writing token to securePrefs", e)
        }
    }

    override fun getToken(): String? {
        val secureToken = try {
            securePrefs?.getString(KEY_AUTH_TOKEN, null)
        } catch (e: Exception) {
            null
        }
        if (!secureToken.isNullOrBlank()) {
            if (fallbackPrefs.getString(KEY_AUTH_TOKEN, null) != secureToken) {
                fallbackPrefs.edit().putString(KEY_AUTH_TOKEN, secureToken).commit()
            }
            return secureToken
        }
        val fallbackToken = fallbackPrefs.getString(KEY_AUTH_TOKEN, null)
        if (!fallbackToken.isNullOrBlank()) {
            try {
                securePrefs?.edit()?.putString(KEY_AUTH_TOKEN, fallbackToken)?.commit()
            } catch (_: Exception) {}
            return fallbackToken
        }
        return null
    }

    override fun clearToken() {
        fallbackPrefs.edit().remove(KEY_AUTH_TOKEN).commit()
        try {
            securePrefs?.edit()?.remove(KEY_AUTH_TOKEN)?.commit()
        } catch (_: Exception) {}
    }

    override fun saveSelectedRepo(owner: String, repo: String, branch: String) {
        fallbackPrefs.edit()
            .putString(KEY_REPO_OWNER, owner)
            .putString(KEY_REPO_NAME, repo)
            .putString(KEY_REPO_BRANCH, branch)
            .commit()
        try {
            securePrefs?.edit()
                ?.putString(KEY_REPO_OWNER, owner)
                ?.putString(KEY_REPO_NAME, repo)
                ?.putString(KEY_REPO_BRANCH, branch)
                ?.commit()
        } catch (_: Exception) {}
    }

    override fun getSelectedRepo(): Triple<String, String, String>? {
        val owner = try {
            securePrefs?.getString(KEY_REPO_OWNER, null)
        } catch (_: Exception) { null } ?: fallbackPrefs.getString(KEY_REPO_OWNER, null)

        val repo = try {
            securePrefs?.getString(KEY_REPO_NAME, null)
        } catch (_: Exception) { null } ?: fallbackPrefs.getString(KEY_REPO_NAME, null)

        val branch = try {
            securePrefs?.getString(KEY_REPO_BRANCH, "main")
        } catch (_: Exception) { null } ?: fallbackPrefs.getString(KEY_REPO_BRANCH, "main") ?: "main"

        if (owner.isNullOrBlank() || repo.isNullOrBlank()) return null
        return Triple(owner, repo, branch)
    }

    override fun clearSelectedRepo() {
        fallbackPrefs.edit()
            .remove(KEY_REPO_OWNER)
            .remove(KEY_REPO_NAME)
            .remove(KEY_REPO_BRANCH)
            .commit()
        try {
            securePrefs?.edit()
                ?.remove(KEY_REPO_OWNER)
                ?.remove(KEY_REPO_NAME)
                ?.remove(KEY_REPO_BRANCH)
                ?.commit()
        } catch (_: Exception) {}
    }

    override fun isWifiOnly(): Boolean {
        return try {
            securePrefs?.getBoolean(KEY_WIFI_ONLY, true) ?: fallbackPrefs.getBoolean(KEY_WIFI_ONLY, true)
        } catch (_: Exception) {
            fallbackPrefs.getBoolean(KEY_WIFI_ONLY, true)
        }
    }

    override fun setWifiOnly(enabled: Boolean) {
        fallbackPrefs.edit().putBoolean(KEY_WIFI_ONLY, enabled).commit()
        try {
            securePrefs?.edit()?.putBoolean(KEY_WIFI_ONLY, enabled)?.commit()
        } catch (_: Exception) {}
    }

    override fun isChargingOnly(): Boolean {
        return try {
            securePrefs?.getBoolean(KEY_CHARGING_ONLY, false) ?: fallbackPrefs.getBoolean(KEY_CHARGING_ONLY, false)
        } catch (_: Exception) {
            fallbackPrefs.getBoolean(KEY_CHARGING_ONLY, false)
        }
    }

    override fun setChargingOnly(enabled: Boolean) {
        fallbackPrefs.edit().putBoolean(KEY_CHARGING_ONLY, enabled).commit()
        try {
            securePrefs?.edit()?.putBoolean(KEY_CHARGING_ONLY, enabled)?.commit()
        } catch (_: Exception) {}
    }

    override fun isEncryptionEnabled(): Boolean {
        return try {
            securePrefs?.getBoolean(KEY_ENCRYPTION_ENABLED, false) ?: fallbackPrefs.getBoolean(KEY_ENCRYPTION_ENABLED, false)
        } catch (_: Exception) {
            fallbackPrefs.getBoolean(KEY_ENCRYPTION_ENABLED, false)
        }
    }

    override fun setEncryptionEnabled(enabled: Boolean) {
        fallbackPrefs.edit().putBoolean(KEY_ENCRYPTION_ENABLED, enabled).commit()
        try {
            securePrefs?.edit()?.putBoolean(KEY_ENCRYPTION_ENABLED, enabled)?.commit()
        } catch (_: Exception) {}
    }

    override fun getEncryptionPassphrase(): String? {
        val securePass = try {
            securePrefs?.getString(KEY_ENCRYPTION_PASSPHRASE, null)
        } catch (_: Exception) { null }
        if (!securePass.isNullOrBlank()) return securePass
        return fallbackPrefs.getString(KEY_ENCRYPTION_PASSPHRASE, null)
    }

    override fun setEncryptionPassphrase(passphrase: String?) {
        fallbackPrefs.edit().putString(KEY_ENCRYPTION_PASSPHRASE, passphrase).commit()
        try {
            securePrefs?.edit()?.putString(KEY_ENCRYPTION_PASSPHRASE, passphrase)?.commit()
        } catch (_: Exception) {}
    }

    override fun isMirrorDeletions(): Boolean {
        return try {
            securePrefs?.getBoolean(KEY_MIRROR_DELETIONS, false) ?: fallbackPrefs.getBoolean(KEY_MIRROR_DELETIONS, false)
        } catch (_: Exception) {
            fallbackPrefs.getBoolean(KEY_MIRROR_DELETIONS, false)
        }
    }

    override fun setMirrorDeletions(enabled: Boolean) {
        fallbackPrefs.edit().putBoolean(KEY_MIRROR_DELETIONS, enabled).commit()
        try {
            securePrefs?.edit()?.putBoolean(KEY_MIRROR_DELETIONS, enabled)?.commit()
        } catch (_: Exception) {}
    }

    override fun isExportSvg(): Boolean {
        return try {
            securePrefs?.getBoolean(KEY_EXPORT_SVG, false) ?: fallbackPrefs.getBoolean(KEY_EXPORT_SVG, false)
        } catch (_: Exception) {
            fallbackPrefs.getBoolean(KEY_EXPORT_SVG, false)
        }
    }

    override fun setExportSvg(enabled: Boolean) {
        fallbackPrefs.edit().putBoolean(KEY_EXPORT_SVG, enabled).commit()
        try {
            securePrefs?.edit()?.putBoolean(KEY_EXPORT_SVG, enabled)?.commit()
        } catch (_: Exception) {}
    }

    companion object {
        private const val KEY_AUTH_TOKEN = "github_oauth_token"
        private const val KEY_REPO_OWNER = "backup_repo_owner"
        private const val KEY_REPO_NAME = "backup_repo_name"
        private const val KEY_REPO_BRANCH = "backup_repo_branch"
        private const val KEY_WIFI_ONLY = "backup_pref_wifi_only"
        private const val KEY_CHARGING_ONLY = "backup_pref_charging_only"
        private const val KEY_ENCRYPTION_ENABLED = "backup_pref_encryption_enabled"
        private const val KEY_ENCRYPTION_PASSPHRASE = "backup_pref_encryption_passphrase"
        private const val KEY_MIRROR_DELETIONS = "backup_pref_mirror_deletions"
        private const val KEY_EXPORT_SVG = "backup_pref_export_svg"
    }
}
