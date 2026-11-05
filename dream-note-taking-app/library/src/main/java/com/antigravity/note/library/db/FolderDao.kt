package com.antigravity.note.library.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface FolderDao {

    @Query("SELECT * FROM folders ORDER BY name ASC")
    fun getAllFolders(): Flow<List<FolderEntity>>

    @Query("SELECT * FROM folders WHERE parentFolderId IS NULL ORDER BY name ASC")
    fun getRootFolders(): Flow<List<FolderEntity>>

    @Query("SELECT * FROM folders WHERE parentFolderId = :parentId ORDER BY name ASC")
    fun getSubFolders(parentId: String): Flow<List<FolderEntity>>

    @Query("SELECT * FROM folders WHERE folderId = :folderId")
    suspend fun getFolderById(folderId: String): FolderEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFolder(folder: FolderEntity)

    @Update
    suspend fun updateFolder(folder: FolderEntity)

    @Query("UPDATE folders SET name = :newName WHERE folderId = :folderId")
    suspend fun updateFolderName(folderId: String, newName: String)

    @Query("UPDATE folders SET iconKey = :iconKey WHERE folderId = :folderId")
    suspend fun updateFolderIcon(folderId: String, iconKey: String?)

    @Query("DELETE FROM folders WHERE folderId = :folderId")
    suspend fun deleteFolder(folderId: String)
}
