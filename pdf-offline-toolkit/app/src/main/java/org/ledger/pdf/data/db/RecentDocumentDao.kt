package org.ledger.pdf.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface RecentDocumentDao {
    @Query("SELECT * FROM recent_documents ORDER BY isPinned DESC, lastAccessed DESC LIMIT 50")
    fun getAllRecentDocuments(): Flow<List<RecentDocumentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(doc: RecentDocumentEntity)

    @Update
    suspend fun update(doc: RecentDocumentEntity)

    @Query("DELETE FROM recent_documents WHERE uriString = :uriString")
    suspend fun deleteByUri(uriString: String)

    @Query("DELETE FROM recent_documents")
    suspend fun clearAll()
}
