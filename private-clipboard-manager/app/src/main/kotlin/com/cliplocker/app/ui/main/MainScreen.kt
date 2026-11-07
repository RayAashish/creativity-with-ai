package com.cliplocker.app.ui.main

import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.unit.dp
import androidx.fragment.app.FragmentActivity
import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.service.AccessibilityHelper
import com.cliplocker.app.service.ClipboardAccessibilityService
import com.cliplocker.app.ui.components.AccessibilityBanner
import com.cliplocker.app.ui.components.BiometricPromptHelper
import com.cliplocker.app.ui.components.ClipRowItem
import com.cliplocker.app.ui.components.CliplockerSearchBar
import com.cliplocker.app.ui.components.CliplockerTopBar
import com.cliplocker.app.ui.components.CopiedBadge
import com.cliplocker.app.ui.components.EmptyState
import com.cliplocker.app.ui.components.PinnedShelf
import com.cliplocker.app.ui.theme.CliplockerTheme

import com.cliplocker.app.ui.components.spatialBackgroundBrush

@Composable
fun MainScreen(
    viewModel: MainViewModel,
    onNavigateToDetail: (Long) -> Unit,
    onNavigateToSettings: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val isAccessibilityEnabled = remember(uiState) {
        AccessibilityHelper.isAccessibilityServiceEnabled(context, ClipboardAccessibilityService::class.java)
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(spatialBackgroundBrush(colors))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Spatial Liquid Glass Top Bar
            CliplockerTopBar(
                isCaptureEnabled = uiState.isCaptureEnabled,
                onToggleCapture = viewModel::onToggleCapture,
                onOpenSettings = onNavigateToSettings,
                selectedCount = uiState.selectedClipIds.size,
                onClearSelection = viewModel::clearSelection,
                onSelectAll = viewModel::selectAll,
                onDeleteSelected = viewModel::deleteSelected,
                onPinSelected = viewModel::pinSelected,
                onSecretSelected = { viewModel.markSelectedSecret(5 * 60_000L) }
            )

            // Main Content Area
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Accessibility Guidance Banner
                    if (!isAccessibilityEnabled) {
                        item(key = "accessibility_banner") {
                            AccessibilityBanner(
                                onEnableClick = {
                                    val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                    }
                                    context.startActivity(intent)
                                }
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                        }
                    }

                    // Pinned Shelf at the top
                    if (uiState.pinnedClips.isNotEmpty() && !uiState.filterOptions.isActive) {
                        item(key = "pinned_shelf_header") {
                            PinnedShelf(
                                pinnedClips = uiState.pinnedClips,
                                onClipClick = { clip ->
                                    if (clip.isSecret && !uiState.unmaskedClipIds.contains(clip.id)) {
                                        authenticateAndUnmask(context, clip.id, viewModel)
                                    } else {
                                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                        viewModel.copyClipToClipboard(clip, context)
                                    }
                                }
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                        }
                    }

                    if (uiState.clips.isEmpty() && uiState.pinnedClips.isEmpty()) {
                        item(key = "empty_state") {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(380.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                EmptyState(isSearching = uiState.filterOptions.isActive)
                            }
                        }
                    } else {
                        // Section Header: HISTORY
                        item(key = "history_section_header") {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 4.dp, vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "HISTORY (${uiState.clips.size})",
                                    style = typography.sectionHeader,
                                    color = colors.inkSecondary
                                )
                                if (uiState.filterOptions.isActive) {
                                    Text(
                                        text = "FILTERED",
                                        style = typography.badge,
                                        color = colors.accent
                                    )
                                }
                            }
                        }

                        // History Clip Rows
                        items(
                            items = uiState.clips,
                            key = { it.id }
                        ) { clip ->
                            val isSelected = uiState.selectedClipIds.contains(clip.id)
                            val isUnmasked = uiState.unmaskedClipIds.contains(clip.id)

                            ClipRowItem(
                                clip = clip,
                                isSelected = isSelected,
                                isSelectionMode = uiState.isSelectionMode,
                                isUnmasked = isUnmasked,
                                searchHighlight = uiState.filterOptions.query,
                                onClick = {
                                    if (uiState.isSelectionMode) {
                                        viewModel.toggleSelectClip(clip.id)
                                    } else {
                                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                        viewModel.copyClipToClipboard(clip, context)
                                    }
                                },
                                onLongClick = {
                                    if (!uiState.isSelectionMode) {
                                        viewModel.toggleSelectClip(clip.id)
                                    } else {
                                        onNavigateToDetail(clip.id)
                                    }
                                },
                                onSecretClick = {
                                    authenticateAndUnmask(context, clip.id, viewModel)
                                }
                            )
                        }
                    }
                }

                // Transient "JUST COPIED" Ink Stamp Badge
                CopiedBadge(
                    visible = uiState.showCopiedBadge,
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 16.dp)
                )
            }

            // Fixed Bottom Search Bar & Filter Chips
            CliplockerSearchBar(
                query = uiState.filterOptions.query,
                onQueryChange = viewModel::onSearchQueryChanged,
                filterOptions = uiState.filterOptions,
                onSelectType = viewModel::onSelectFilterType,
                onTogglePinnedOnly = viewModel::onTogglePinnedFilter,
                onToggleSecretsOnly = viewModel::onToggleSecretsFilter
            )
        }
    }
}

private fun authenticateAndUnmask(
    context: android.content.Context,
    clipId: Long,
    viewModel: MainViewModel
) {
    val activity = context as? FragmentActivity ?: return
    BiometricPromptHelper.authenticate(
        activity = activity,
        title = "Reveal Secret Clip",
        subtitle = "Confirm biometric or device credential to view secret",
        onSuccess = {
            viewModel.unmaskClip(clipId)
        },
        onError = { /* Keep masked */ }
    )
}
