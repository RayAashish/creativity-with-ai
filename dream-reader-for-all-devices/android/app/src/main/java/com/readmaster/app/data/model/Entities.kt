package com.readmaster.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "folders")
data class FolderEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val iconKey: String = "folder",
    val colorHex: String = "#4F46E5",
    val parentFolderId: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "documents")
data class DocumentEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val uriString: String,
    val pageCount: Int,
    val lastPage: Int = 0,
    val lastReadTime: Long = System.currentTimeMillis(),
    val fileSize: Long = 0L,
    val folderId: String? = null
)

@Entity(tableName = "vocabulary")
data class VocabularyEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,
    val word: String,
    val phonetic: String = "",
    val devanagariPhonetic: String = "",
    val hindiMeaning: String = "",
    val nepaliMeaning: String = "",
    val englishDefinition: String = "",
    val exampleSentence: String = "",
    val contextSentence: String = "",
    val documentTitle: String = "",
    val pageNumber: Int = 1,
    val createdAt: Long = System.currentTimeMillis(),
    val nextReviewDate: Long = System.currentTimeMillis(),
    val interval: Int = 1,
    val repetition: Int = 0,
    val easeFactor: Float = 2.5f
)
