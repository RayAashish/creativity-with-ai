package com.readmaster.app.data.db

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.readmaster.app.data.model.DocumentEntity
import com.readmaster.app.data.model.FolderEntity
import com.readmaster.app.data.model.VocabularyEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FolderDao {
    @Query("SELECT * FROM folders ORDER BY createdAt ASC")
    fun getAllFolders(): Flow<List<FolderEntity>>

    @Query("SELECT * FROM folders WHERE parentFolderId IS NULL ORDER BY createdAt ASC")
    fun getRootFolders(): Flow<List<FolderEntity>>

    @Query("SELECT * FROM folders WHERE parentFolderId = :parentId ORDER BY createdAt ASC")
    fun getSubfolders(parentId: String): Flow<List<FolderEntity>>

    @Query("SELECT * FROM folders WHERE id = :id LIMIT 1")
    suspend fun getFolderById(id: String): FolderEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(folder: FolderEntity)

    @Update
    suspend fun update(folder: FolderEntity)

    @Delete
    suspend fun delete(folder: FolderEntity)

    @Query("UPDATE documents SET folderId = NULL WHERE folderId = :folderId")
    suspend fun unassignDocuments(folderId: String)

    @Query("UPDATE documents SET folderId = :newFolderId WHERE folderId = :oldFolderId")
    suspend fun reassignDocuments(oldFolderId: String, newFolderId: String?)

    @Query("UPDATE folders SET parentFolderId = :newParentId WHERE parentFolderId = :oldParentId")
    suspend fun reassignSubfolders(oldParentId: String, newParentId: String?)
}

@Dao
interface DocumentDao {
    @Query("SELECT * FROM documents ORDER BY lastReadTime DESC")
    fun getAllDocuments(): Flow<List<DocumentEntity>>

    @Query("SELECT * FROM documents WHERE folderId = :folderId ORDER BY lastReadTime DESC")
    fun getDocumentsByFolder(folderId: String): Flow<List<DocumentEntity>>

    @Query("SELECT * FROM documents WHERE id = :id LIMIT 1")
    suspend fun getDocumentById(id: String): DocumentEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(document: DocumentEntity)

    @Update
    suspend fun update(document: DocumentEntity)

    @Query("UPDATE documents SET folderId = :folderId WHERE id = :documentId")
    suspend fun setDocumentFolder(documentId: String, folderId: String?)

    @Query("UPDATE documents SET lastPage = :page, lastReadTime = :time WHERE id = :documentId")
    suspend fun updatePageProgress(documentId: String, page: Int, time: Long = System.currentTimeMillis())

    @Delete
    suspend fun delete(document: DocumentEntity)
}

@Dao
interface VocabularyDao {
    @Query("SELECT * FROM vocabulary ORDER BY createdAt DESC")
    fun getAllVocabulary(): Flow<List<VocabularyEntity>>

    @Query("SELECT * FROM vocabulary WHERE nextReviewDate <= :now ORDER BY nextReviewDate ASC")
    suspend fun getDueVocabulary(now: Long): List<VocabularyEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(vocab: VocabularyEntity): Long

    @Update
    suspend fun update(vocab: VocabularyEntity)

    @Delete
    suspend fun delete(vocab: VocabularyEntity)
}
