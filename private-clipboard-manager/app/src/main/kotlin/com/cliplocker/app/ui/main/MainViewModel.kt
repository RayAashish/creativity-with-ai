package com.cliplocker.app.ui.main

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.core.model.FilterOptions
import com.cliplocker.app.data.preferences.PreferencesManager
import com.cliplocker.app.data.repository.ClipRepository
import com.cliplocker.app.data.storage.ImageStorageManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
@HiltViewModel
class MainViewModel @Inject constructor(
    private val repository: ClipRepository,
    private val preferencesManager: PreferencesManager,
    private val imageStorageManager: ImageStorageManager
) : ViewModel() {

    private val _filterOptions = MutableStateFlow(FilterOptions())
    private val _selectedClipIds = MutableStateFlow<Set<Long>>(emptySet())
    private val _unmaskedClipIds = MutableStateFlow<Set<Long>>(emptySet())
    private val _showCopiedBadge = MutableStateFlow(false)

    // Debounce search query changes by 250ms for instant feel without lagging DB
    private val debouncedFilters = _filterOptions
        .debounce { options -> if (options.query.isNotBlank()) 250L else 0L }
        .distinctUntilChanged()

    private val clipsFlow = debouncedFilters.flatMapLatest { filter ->
        repository.searchClips(filter)
    }

    private val pinnedFlow = repository.getPinnedClips()

    private val dataFlow = combine(
        clipsFlow,
        pinnedFlow,
        _filterOptions,
        preferencesManager.userPreferences
    ) { clips, pinned, filter, prefs ->
        MainUiState(
            clips = clips,
            pinnedClips = pinned,
            filterOptions = filter,
            isCaptureEnabled = prefs.isCaptureEnabled
        )
    }

    val uiState: StateFlow<MainUiState> = combine(
        dataFlow,
        _selectedClipIds,
        _unmaskedClipIds,
        _showCopiedBadge
    ) { base, selectedIds, unmaskedIds, showBadge ->
        base.copy(
            selectedClipIds = selectedIds,
            unmaskedClipIds = unmaskedIds,
            showCopiedBadge = showBadge,
            isLoading = false
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = MainUiState(isLoading = true)
    )

    fun onSearchQueryChanged(newQuery: String) {
        _filterOptions.update { it.copy(query = newQuery) }
    }

    fun onSelectFilterType(type: ClipType?) {
        _filterOptions.update { it.copy(selectedType = type) }
    }

    fun onTogglePinnedFilter() {
        _filterOptions.update { it.copy(onlyPinned = !it.onlyPinned) }
    }

    fun onToggleSecretsFilter() {
        _filterOptions.update { it.copy(onlySecrets = !it.onlySecrets) }
    }

    fun onToggleCapture(enabled: Boolean) {
        preferencesManager.updatePreferences { it.copy(isCaptureEnabled = enabled) }
    }

    fun copyClipToClipboard(clip: ClipItem, context: Context) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return

        val clipData = if (clip.type == ClipType.IMAGE && clip.imageUri != null) {
            val uri = imageStorageManager.getShareableUri(clip.imageUri)
            if (uri != null) {
                ClipData.newUri(context.contentResolver, "Image", uri)
            } else {
                ClipData.newPlainText("Cliplocker", clip.content)
            }
        } else {
            ClipData.newPlainText("Cliplocker", clip.content)
        }

        clipboard.setPrimaryClip(clipData)

        // Show "JUST COPIED" ink stamp badge for 900ms
        viewModelScope.launch {
            _showCopiedBadge.value = true
            delay(900L)
            _showCopiedBadge.value = false
        }
    }

    fun toggleSelectClip(id: Long) {
        _selectedClipIds.update { set ->
            if (set.contains(id)) set - id else set + id
        }
    }

    fun selectAll() {
        val allIds = uiState.value.clips.map { it.id }.toSet()
        _selectedClipIds.value = allIds
    }

    fun clearSelection() {
        _selectedClipIds.value = emptySet()
    }

    fun deleteSelected() {
        val idsToDelete = _selectedClipIds.value.toList()
        viewModelScope.launch {
            repository.deleteClips(idsToDelete)
            clearSelection()
        }
    }

    fun pinSelected() {
        val idsToPin = _selectedClipIds.value.toList()
        viewModelScope.launch {
            idsToPin.forEach { repository.setPinned(it, true) }
            clearSelection()
        }
    }

    fun markSelectedSecret(ttlMillis: Long) {
        val ids = _selectedClipIds.value.toList()
        viewModelScope.launch {
            ids.forEach { repository.setSecret(it, isSecret = true, ttlMillis = ttlMillis) }
            clearSelection()
        }
    }

    fun unmaskClip(id: Long) {
        _unmaskedClipIds.update { it + id }
    }

    fun deleteClip(id: Long) {
        viewModelScope.launch {
            repository.deleteClip(id)
        }
    }
}
