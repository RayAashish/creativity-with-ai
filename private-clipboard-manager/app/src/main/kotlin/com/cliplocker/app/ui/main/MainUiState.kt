package com.cliplocker.app.ui.main

import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.core.model.FilterOptions

data class MainUiState(
    val clips: List<ClipItem> = emptyList(),
    val pinnedClips: List<ClipItem> = emptyList(),
    val filterOptions: FilterOptions = FilterOptions(),
    val isCaptureEnabled: Boolean = true,
    val selectedClipIds: Set<Long> = emptySet(),
    val unmaskedClipIds: Set<Long> = emptySet(),
    val showCopiedBadge: Boolean = false,
    val isLoading: Boolean = false
) {
    val isSelectionMode: Boolean
        get() = selectedClipIds.isNotEmpty()
}
