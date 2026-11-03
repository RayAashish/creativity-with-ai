package com.antigravity.note.library.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface PageDao {

    @Query("SELECT * FROM pages WHERE notebookId = :notebookId AND isDeleted = 0 ORDER BY pageIndex ASC")
    fun getPagesForNotebook(notebookId: String): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE isDeleted = 0 ORDER BY modifiedAt DESC")
    fun getAllActivePages(): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE pageId = :pageId")
    suspend fun getPageById(pageId: String): PageEntity?

    @Query("SELECT * FROM pages WHERE isProblemPage = 1 AND isDeleted = 0 AND problemStatus = :status ORDER BY modifiedAt DESC")
    fun getProblemPagesByStatus(status: String): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE isProblemPage = 1 AND isDeleted = 0 AND difficulty = :difficulty ORDER BY modifiedAt DESC")
    fun getProblemPagesByDifficulty(difficulty: String): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE isProblemPage = 1 AND isDeleted = 0 AND (problemStatus = 'Revisit' OR (nextReviewTimestamp > 0 AND nextReviewTimestamp <= :currentTimestamp)) ORDER BY nextReviewTimestamp ASC")
    fun getDueReviewPages(currentTimestamp: Long): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE isDeleted = 0 AND (title LIKE '%' || :query || '%' OR tags LIKE '%' || :query || '%' OR approachSummary LIKE '%' || :query || '%') ORDER BY modifiedAt DESC")
    fun searchPages(query: String): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE isDeleted = 1 ORDER BY deletedAt DESC")
    fun getTrashPages(): Flow<List<PageEntity>>

    @Query("UPDATE pages SET isDeleted = 1, deletedAt = :deletedAt WHERE pageId = :pageId")
    suspend fun moveToTrash(pageId: String, deletedAt: Long = System.currentTimeMillis())

    @Query("UPDATE pages SET isDeleted = 1, deletedAt = :deletedAt WHERE pageId IN (:pageIds)")
    suspend fun moveMultipleToTrash(pageIds: List<String>, deletedAt: Long = System.currentTimeMillis())

    @Query("UPDATE pages SET isDeleted = 0, deletedAt = NULL WHERE pageId = :pageId")
    suspend fun restoreFromTrash(pageId: String)

    @Query("UPDATE pages SET title = :newTitle, modifiedAt = :timestamp WHERE pageId = :pageId")
    suspend fun updatePageTitle(pageId: String, newTitle: String, timestamp: Long = System.currentTimeMillis())

    @Query("DELETE FROM pages WHERE isDeleted = 1 AND deletedAt <= :cutoffTimestamp")
    suspend fun purgeOldTrash(cutoffTimestamp: Long)

    @Query("DELETE FROM pages WHERE isDeleted = 1")
    suspend fun emptyTrash()

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPage(page: PageEntity)

    @Update
    suspend fun updatePage(page: PageEntity)

    @Query("DELETE FROM pages WHERE pageId = :pageId")
    suspend fun deletePage(pageId: String)

    @Query("SELECT COUNT(*) FROM pages WHERE notebookId = :notebookId AND isDeleted = 0")
    suspend fun getPageCount(notebookId: String): Int
}
