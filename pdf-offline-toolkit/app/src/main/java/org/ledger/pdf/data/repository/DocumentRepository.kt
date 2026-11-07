package org.ledger.pdf.data.repository

import android.net.Uri
import kotlinx.coroutines.flow.Flow
import org.ledger.pdf.data.db.RecentDocumentDao
import org.ledger.pdf.data.db.RecentDocumentEntity
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.saf.SafFileHandler
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DocumentRepository @Inject constructor(
    private val recentDocumentDao: RecentDocumentDao,
    private val safFileHandler: SafFileHandler
) {
    fun getRecentDocuments(): Flow<List<RecentDocumentEntity>> =
        recentDocumentDao.getAllRecentDocuments()

    suspend fun recordDocumentOpened(uri: Uri, pageCount: Int, thumbnailPath: String? = null) {
        val info = safFileHandler.getDocumentInfo(uri)
        val entity = RecentDocumentEntity(
            uriString = uri.toString(),
            displayName = info.name,
            sizeBytes = info.sizeBytes,
            pageCount = pageCount,
            lastAccessed = System.currentTimeMillis(),
            thumbnailPath = thumbnailPath
        )
        recentDocumentDao.insertOrUpdate(entity)
    }

    suspend fun togglePin(entity: RecentDocumentEntity) {
        recentDocumentDao.update(entity.copy(isPinned = !entity.isPinned))
    }

    suspend fun removeRecent(uriString: String) {
        recentDocumentDao.deleteByUri(uriString)
    }

    suspend fun clearAllRecents() {
        recentDocumentDao.clearAll()
    }
}
