package com.antigravity.note.library.backup.gdrive

object GoogleDriveConfig {
    const val UPLOAD_ENDPOINT = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
    const val FILES_ENDPOINT = "https://www.googleapis.com/drive/v3/files"
    const val BACKUP_FILENAME = "inkflow_vault_backup.zip"

    const val SCOPE_APPDATA = "https://www.googleapis.com/auth/drive.appdata"
    const val SCOPE_FILE = "https://www.googleapis.com/auth/drive.file"

    const val PREFS_NAME = "inkflow_gdrive_backup_prefs"
    const val PREF_ACCESS_TOKEN = "gdrive_access_token"
    const val PREF_REFRESH_TOKEN = "gdrive_refresh_token"
    const val PREF_API_KEY = "gdrive_api_key"
    const val PREF_ACCOUNT_EMAIL = "gdrive_account_email"
    const val PREF_USE_VISIBLE_FOLDER = "gdrive_use_visible_folder"
    const val PREF_LAST_BACKUP_TIME = "gdrive_last_backup_time"
    const val PREF_LAST_BACKUP_SIZE = "gdrive_last_backup_size"
    const val PREF_LAST_BACKUP_HASH = "gdrive_last_backup_hash"

    const val DEFAULT_ACCOUNT_EMAIL = "2002raysi@gmail.com"
    const val DEFAULT_API_KEY = "AIzaSyC1S3Iu_iBJxO4dKCJYNVLuqkfsW_2_u2Y"
}
