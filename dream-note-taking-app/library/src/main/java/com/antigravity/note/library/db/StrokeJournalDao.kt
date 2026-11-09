package com.antigravity.note.library.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface StrokeJournalDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: StrokeJournalEntity): Long

    @Query("SELECT * FROM stroke_journal WHERE is_compacted = 0 ORDER BY id ASC")
    suspend fun getUncompactedStrokes(): List<StrokeJournalEntity>

    @Query("SELECT * FROM stroke_journal WHERE note_id = :noteId AND page_id = :pageId AND is_compacted = 0 ORDER BY id ASC")
    suspend fun getUncompactedForPage(noteId: String, pageId: String): List<StrokeJournalEntity>

    @Query("DELETE FROM stroke_journal WHERE note_id = :noteId AND page_id = :pageId AND stroke_id IN (:strokeIds)")
    suspend fun deleteByStrokeIds(noteId: String, pageId: String, strokeIds: List<String>): Int

    @Query("DELETE FROM stroke_journal WHERE note_id = :noteId AND page_id = :pageId")
    suspend fun deleteForPage(noteId: String, pageId: String): Int

    @Query("UPDATE stroke_journal SET is_compacted = 1 WHERE note_id = :noteId AND page_id = :pageId AND id <= :lastId")
    suspend fun markCompacted(noteId: String, pageId: String, lastId: Long)

    @Query("DELETE FROM stroke_journal WHERE is_compacted = 1")
    suspend fun purgeCompacted(): Int

    @Query("SELECT COUNT(*) FROM stroke_journal WHERE is_compacted = 0")
    suspend fun countUncompacted(): Int
}
