package com.cliplocker.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import net.sqlcipher.database.SupportFactory

@Database(
    entities = [
        ClipEntity::class,
        ClipFtsEntity::class,
        IgnoreAppEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun clipDao(): ClipDao
    abstract fun ignoreAppDao(): IgnoreAppDao

    companion object {
        const val DATABASE_NAME = "cliplocker_encrypted.db"

        fun buildEncrypted(context: Context, passphraseBytes: ByteArray): AppDatabase {
            // clearPassphrase = false ensures Room doesn't crash when opening SQLite connections
            val factory = SupportFactory(passphraseBytes, null, false)

            return Room.databaseBuilder(
                context.applicationContext,
                AppDatabase::class.java,
                DATABASE_NAME
            )
                .openHelperFactory(factory)
                .fallbackToDestructiveMigration()
                .addCallback(object : Callback() {
                    override fun onCreate(db: SupportSQLiteDatabase) {
                        super.onCreate(db)
                        val now = System.currentTimeMillis()
                        val defaultIgnored = listOf(
                            "('com.onepassword.android', '1Password', $now)",
                            "('com.x8bit.bitwarden', 'Bitwarden', $now)",
                            "('keepass2android.keepass2android', 'KeePass2Android', $now)",
                            "('com.dashlane', 'Dashlane', $now)",
                            "('com.lastpass.lpandroid', 'LastPass', $now)",
                            "('com.google.android.apps.authenticator2', 'Google Authenticator', $now)",
                            "('com.authy.authy', 'Twilio Authy', $now)",
                            "('org.proninyaroslav.openkeychain', 'OpenKeychain', $now)"
                        )
                        db.execSQL(
                            "INSERT OR IGNORE INTO ignored_apps (package_name, app_label, date_added) VALUES ${defaultIgnored.joinToString(", ")}"
                        )
                    }
                })
                .build()
        }
    }
}
