package com.readmaster.app.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.readmaster.app.data.model.DocumentEntity
import com.readmaster.app.data.model.FolderEntity
import com.readmaster.app.data.model.VocabularyEntity

@Database(
    entities = [DocumentEntity::class, VocabularyEntity::class, FolderEntity::class],
    version = 3,
    exportSchema = false
)
abstract class ReadMasterDatabase : RoomDatabase() {
    abstract fun documentDao(): DocumentDao
    abstract fun folderDao(): FolderDao
    abstract fun vocabularyDao(): VocabularyDao

    companion object {
        @Volatile
        private var INSTANCE: ReadMasterDatabase? = null

        val MIGRATION_2_3 = object : Migration(2, 3) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE folders ADD COLUMN parentFolderId TEXT DEFAULT NULL")
            }
        }

        fun getDatabase(context: Context): ReadMasterDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ReadMasterDatabase::class.java,
                    "readmaster_database"
                )
                    .addMigrations(MIGRATION_2_3)
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
