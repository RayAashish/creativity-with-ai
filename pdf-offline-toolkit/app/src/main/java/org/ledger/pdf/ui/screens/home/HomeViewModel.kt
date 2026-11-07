package org.ledger.pdf.ui.screens.home

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.ledger.pdf.data.db.RecentDocumentEntity
import org.ledger.pdf.data.repository.DocumentRepository
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val documentRepository: DocumentRepository,
    private val safFileHandler: SafFileHandler,
    private val pdfEngine: PdfEngine
) : ViewModel() {

    val recentDocuments: StateFlow<List<RecentDocumentEntity>> =
        documentRepository.getRecentDocuments()
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun onDocumentSelected(uri: Uri, onReady: (Uri) -> Unit) {
        viewModelScope.launch {
            safFileHandler.takePersistablePermission(uri)
            onReady(uri)
        }
    }

    fun togglePin(entity: RecentDocumentEntity) {
        viewModelScope.launch {
            documentRepository.togglePin(entity)
        }
    }

    fun removeRecent(entity: RecentDocumentEntity) {
        viewModelScope.launch {
            documentRepository.removeRecent(entity.uriString)
        }
    }
}
