package com.antigravity.note.library.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface NotebookDao {

    @Query("SELECT * FROM notebooks ORDER BY modifiedAt DESC")
    fun getAllNotebooks(): Flow<List<NotebookEntity>>

    @Query("SELECT * FROM notebooks WHERE folderId = :folderId ORDER BY title ASC")
    fun getNotebooksInFolder(folderId: String): Flow<List<NotebookEntity>>

    @Query("SELECT * FROM notebooks WHERE folderId IS NULL ORDER BY title ASC")
    fun getRootNotebooks(): Flow<List<NotebookEntity>>

    @Query("SELECT * FROM notebooks WHERE isStarred = 1 ORDER BY modifiedAt DESC")
    fun getStarredNotebooks(): Flow<List<NotebookEntity>>

    @Query("SELECT * FROM notebooks WHERE notebookId = :notebookId")
    suspend fun getNotebookById(notebookId: String): NotebookEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotebook(notebook: NotebookEntity)

    @Update
    suspend fun updateNotebook(notebook: NotebookEntity)

    @Query("UPDATE notebooks SET title = :newTitle, modifiedAt = :timestamp WHERE notebookId = :notebookId")
    suspend fun updateNotebookTitle(notebookId: String, newTitle: String, timestamp: Long = System.currentTimeMillis())

    @Query("UPDATE notebooks SET iconKey = :iconKey, modifiedAt = :timestamp WHERE notebookId = :notebookId")
    suspend fun updateNotebookIcon(notebookId: String, iconKey: String?, timestamp: Long = System.currentTimeMillis())

    @Query("SELECT * FROM notebooks WHERE is_dirty = 1")
    suspend fun getDirtyNotebooks(): List<NotebookEntity>

    @Query("UPDATE notebooks SET is_dirty = :isDirty WHERE notebookId = :notebookId")
    suspend fun setNotebookDirty(notebookId: String, isDirty: Boolean)

    @Query("UPDATE notebooks SET is_dirty = 0")
    suspend fun resetAllDirtyFlags()

    @Query("DELETE FROM notebooks WHERE notebookId = :notebookId")
    suspend fun deleteNotebook(notebookId: String)
}
