package com.cliplocker.app.ui.detail

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.core.model.SecretTtl
import com.cliplocker.app.data.repository.ClipRepository
import com.cliplocker.app.data.storage.ImageStorageManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ClipDetailUiState(
    val clip: ClipItem? = null,
    val isUnmasked: Boolean = false,
    val showCopiedBadge: Boolean = false,
    val isDeleted: Boolean = false
)

@HiltViewModel
class ClipDetailViewModel @Inject constructor(
    private val repository: ClipRepository,
    private val imageStorageManager: ImageStorageManager,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    val clipId: Long = savedStateHandle.get<Long>("clipId") ?: 0L

    private val _isUnmasked = MutableStateFlow(false)
    val isUnmasked: StateFlow<Boolean> = _isUnmasked.asStateFlow()

    private val _isDeleted = MutableStateFlow(false)
    val isDeleted: StateFlow<Boolean> = _isDeleted.asStateFlow()

    val clip: StateFlow<ClipItem?> = repository.getClipById(clipId)
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    fun unmask() {
        _isUnmasked.value = true
    }

    fun togglePin() {
        val current = clip.value ?: return
        viewModelScope.launch {
            repository.setPinned(clipId, !current.isPinned)
        }
    }

    fun updateSecret(isSecret: Boolean, ttl: SecretTtl) {
        viewModelScope.launch {
            val duration = if (ttl.durationMillis > 0) ttl.durationMillis else 5 * 60_000L
            repository.setSecret(clipId, isSecret, if (isSecret) duration else null)
        }
    }

    fun deleteClip() {
        viewModelScope.launch {
            repository.deleteClip(clipId)
            _isDeleted.value = true
        }
    }

    fun copyToClipboard(context: Context) {
        val current = clip.value ?: return
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return

        val clipData = if (current.type == ClipType.IMAGE && current.imageUri != null) {
            val uri = imageStorageManager.getShareableUri(current.imageUri)
            if (uri != null) {
                ClipData.newUri(context.contentResolver, "Image", uri)
            } else {
                ClipData.newPlainText("Cliplocker", current.content)
            }
        } else {
            ClipData.newPlainText("Cliplocker", current.content)
        }
        clipboard.setPrimaryClip(clipData)
    }

    fun shareClip(context: Context) {
        val current = clip.value ?: return
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            if (current.type == ClipType.IMAGE && current.imageUri != null) {
                val uri = imageStorageManager.getShareableUri(current.imageUri)
                putExtra(Intent.EXTRA_STREAM, uri)
                type = "image/png"
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            } else {
                putExtra(Intent.EXTRA_TEXT, current.content)
                type = "text/plain"
            }
        }
        val shareIntent = Intent.createChooser(sendIntent, "Share clip via")
        context.startActivity(shareIntent)
    }
}
