package com.antigravity.note.library.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.antigravity.note.library.backup.manifest.BackupManifestDao
import com.antigravity.note.library.backup.manifest.BackupManifestEntity

@Database(
    entities = [
        FolderEntity::class,
        NotebookEntity::class,
        PageEntity::class,
        BackupManifestEntity::class,
        StrokeJournalEntity::class
    ],
    version = 7,
    exportSchema = false
)
abstract class NoteDatabase : RoomDatabase() {

    abstract fun folderDao(): FolderDao
    abstract fun notebookDao(): NotebookDao
    abstract fun pageDao(): PageDao
    abstract fun backupManifestDao(): BackupManifestDao
    abstract fun strokeJournalDao(): StrokeJournalDao

    companion object {
        val MIGRATION_5_6 = object : Migration(5, 6) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE folders ADD COLUMN iconKey TEXT DEFAULT NULL")
                db.execSQL("ALTER TABLE notebooks ADD COLUMN iconKey TEXT DEFAULT NULL")
            }
        }

        val MIGRATION_6_7 = object : Migration(6, 7) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE notebooks ADD COLUMN is_dirty INTEGER NOT NULL DEFAULT 1")
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS stroke_journal (
                        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        note_id TEXT NOT NULL,
                        page_id TEXT NOT NULL,
                        stroke_id TEXT NOT NULL,
                        stroke_blob BLOB NOT NULL,
                        timestamp INTEGER NOT NULL,
                        is_compacted INTEGER NOT NULL DEFAULT 0
                    )
                """.trimIndent())
                db.execSQL("CREATE INDEX IF NOT EXISTS index_stroke_journal_note_id_page_id_is_compacted ON stroke_journal(note_id, page_id, is_compacted)")
                db.execSQL("CREATE INDEX IF NOT EXISTS index_stroke_journal_is_compacted ON stroke_journal(is_compacted)")
            }
        }

        @Volatile
        private var INSTANCE: NoteDatabase? = null

        fun getInstance(context: Context): NoteDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    NoteDatabase::class.java,
                    "inkflow_library.db"
                )
                    .setJournalMode(RoomDatabase.JournalMode.WRITE_AHEAD_LOGGING)
                    .addCallback(object : RoomDatabase.Callback() {
                        override fun onOpen(db: SupportSQLiteDatabase) {
                            super.onOpen(db)
                            db.execSQL("PRAGMA synchronous = NORMAL;")
                        }
                    })
                    .addMigrations(MIGRATION_5_6, MIGRATION_6_7)
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
