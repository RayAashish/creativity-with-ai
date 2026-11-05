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
        BackupManifestEntity::class
    ],
    version = 6,
    exportSchema = false
)
abstract class NoteDatabase : RoomDatabase() {

    abstract fun folderDao(): FolderDao
    abstract fun notebookDao(): NotebookDao
    abstract fun pageDao(): PageDao
    abstract fun backupManifestDao(): BackupManifestDao

    companion object {
        val MIGRATION_5_6 = object : Migration(5, 6) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE folders ADD COLUMN iconKey TEXT DEFAULT NULL")
                db.execSQL("ALTER TABLE notebooks ADD COLUMN iconKey TEXT DEFAULT NULL")
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
                    .addMigrations(MIGRATION_5_6)
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
