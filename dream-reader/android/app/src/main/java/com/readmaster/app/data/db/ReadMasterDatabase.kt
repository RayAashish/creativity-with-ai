package com.readmaster.app.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.readmaster.app.data.model.DocumentEntity
import com.readmaster.app.data.model.FolderEntity
import com.readmaster.app.data.model.VocabularyEntity

@Database(
    entities = [DocumentEntity::class, VocabularyEntity::class, FolderEntity::class],
    version = 2,
    exportSchema = false
)
abstract class ReadMasterDatabase : RoomDatabase() {
    abstract fun documentDao(): DocumentDao
    abstract fun folderDao(): FolderDao
    abstract fun vocabularyDao(): VocabularyDao

    companion object {
        @Volatile
        private var INSTANCE: ReadMasterDatabase? = null

        fun getDatabase(context: Context): ReadMasterDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ReadMasterDatabase::class.java,
                    "readmaster_database"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
