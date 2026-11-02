package com.antigravity.note.library.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface PageDao {

    @Query("SELECT * FROM pages WHERE notebookId = :notebookId ORDER BY pageIndex ASC")
    fun getPagesForNotebook(notebookId: String): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE pageId = :pageId")
    suspend fun getPageById(pageId: String): PageEntity?

    @Query("SELECT * FROM pages WHERE isProblemPage = 1 AND problemStatus = :status ORDER BY modifiedAt DESC")
    fun getProblemPagesByStatus(status: String): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE isProblemPage = 1 AND difficulty = :difficulty ORDER BY modifiedAt DESC")
    fun getProblemPagesByDifficulty(difficulty: String): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE isProblemPage = 1 AND nextReviewTimestamp > 0 AND nextReviewTimestamp <= :currentTimestamp ORDER BY nextReviewTimestamp ASC")
    fun getDueReviewPages(currentTimestamp: Long): Flow<List<PageEntity>>

    @Query("SELECT * FROM pages WHERE title LIKE '%' || :query || '%' OR tags LIKE '%' || :query || '%' OR approachSummary LIKE '%' || :query || '%' ORDER BY modifiedAt DESC")
    fun searchPages(query: String): Flow<List<PageEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPage(page: PageEntity)

    @Update
    suspend fun updatePage(page: PageEntity)

    @Query("DELETE FROM pages WHERE pageId = :pageId")
    suspend fun deletePage(pageId: String)

    @Query("SELECT COUNT(*) FROM pages WHERE notebookId = :notebookId")
    suspend fun getPageCount(notebookId: String): Int
}
