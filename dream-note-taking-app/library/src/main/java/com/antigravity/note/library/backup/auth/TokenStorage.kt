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

    private val masterKey: MasterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "inkflow_backup_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    override fun saveToken(token: String) {
        prefs.edit().putString(KEY_AUTH_TOKEN, token).apply()
    }

    override fun getToken(): String? {
        return prefs.getString(KEY_AUTH_TOKEN, null)
    }

    override fun clearToken() {
        prefs.edit().remove(KEY_AUTH_TOKEN).apply()
    }

    override fun saveSelectedRepo(owner: String, repo: String, branch: String) {
        prefs.edit()
            .putString(KEY_REPO_OWNER, owner)
            .putString(KEY_REPO_NAME, repo)
            .putString(KEY_REPO_BRANCH, branch)
            .apply()
    }

    override fun getSelectedRepo(): Triple<String, String, String>? {
        val owner = prefs.getString(KEY_REPO_OWNER, null) ?: return null
        val repo = prefs.getString(KEY_REPO_NAME, null) ?: return null
        val branch = prefs.getString(KEY_REPO_BRANCH, "main") ?: "main"
        return Triple(owner, repo, branch)
    }

    override fun clearSelectedRepo() {
        prefs.edit()
            .remove(KEY_REPO_OWNER)
            .remove(KEY_REPO_NAME)
            .remove(KEY_REPO_BRANCH)
            .apply()
    }

    override fun isWifiOnly(): Boolean {
        return prefs.getBoolean(KEY_WIFI_ONLY, true)
    }

    override fun setWifiOnly(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_WIFI_ONLY, enabled).apply()
    }

    override fun isChargingOnly(): Boolean {
        return prefs.getBoolean(KEY_CHARGING_ONLY, false)
    }

    override fun setChargingOnly(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_CHARGING_ONLY, enabled).apply()
    }

    override fun isEncryptionEnabled(): Boolean {
        return prefs.getBoolean(KEY_ENCRYPTION_ENABLED, false)
    }

    override fun setEncryptionEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_ENCRYPTION_ENABLED, enabled).apply()
    }

    override fun getEncryptionPassphrase(): String? {
        return prefs.getString(KEY_ENCRYPTION_PASSPHRASE, null)
    }

    override fun setEncryptionPassphrase(passphrase: String?) {
        prefs.edit().putString(KEY_ENCRYPTION_PASSPHRASE, passphrase).apply()
    }

    override fun isMirrorDeletions(): Boolean {
        return prefs.getBoolean(KEY_MIRROR_DELETIONS, false)
    }

    override fun setMirrorDeletions(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_MIRROR_DELETIONS, enabled).apply()
    }

    override fun isExportSvg(): Boolean {
        return prefs.getBoolean(KEY_EXPORT_SVG, false)
    }

    override fun setExportSvg(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_EXPORT_SVG, enabled).apply()
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
