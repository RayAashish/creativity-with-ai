package org.ledger.pdf.ui.screens.workspace

import android.graphics.Bitmap
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CallSplit
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Compress
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Draw
import androidx.compose.material.icons.filled.RotateRight
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SelectAll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.data.model.PageInfo
import org.ledger.pdf.ui.components.LedgerBadge
import org.ledger.pdf.ui.components.LedgerButton
import org.ledger.pdf.ui.components.LedgerButtonStyle
import org.ledger.pdf.ui.components.LedgerCard
import org.ledger.pdf.ui.components.LedgerIconButton
import org.ledger.pdf.ui.components.LedgerProgressBar
import org.ledger.pdf.ui.components.LedgerTopBar
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun WorkspaceScreen(
    uri: Uri,
    viewModel: WorkspaceViewModel,
    onBack: () -> Unit,
    onNavigateSplit: (Uri) -> Unit,
    onNavigateCompress: (Uri) -> Unit,
    onNavigateOcr: (Uri) -> Unit,
    onNavigateStrip: (Uri) -> Unit,
    onNavigateSign: (Uri) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(uri) {
        viewModel.loadDocument(uri)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        LedgerTopBar(
            title = state.docInfo?.name ?: "Document",
            subtitle = state.docInfo?.let { "${it.pageCount} PAGES • ${it.formattedSize}" } ?: "WORKSPACE",
            onBack = onBack,
            actions = {
                if (state.selectedIndices.isNotEmpty()) {
                    LedgerBadge(
                        text = "${state.selectedIndices.size} SELECTED",
                        isAccent = true
                    )
                }
            }
        )

        // Progress readout if operation is in progress
        if (state.progress != null) {
            Box(modifier = Modifier.padding(spacing.m)) {
                LedgerProgressBar(
                    progress = state.progress ?: 0f,
                    statusText = state.progressMessage ?: "Processing..."
                )
            }
        }

        // Action Toolbar (Dense, compact)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.surface)
                .border(spacing.borderWidthThin, colors.border)
                .padding(horizontal = spacing.m, vertical = spacing.xs),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.xs)
            ) {
                LedgerIconButton(
                    icon = Icons.Default.SelectAll,
                    contentDescription = "Select all pages",
                    onClick = {
                        if (state.selectedIndices.size == state.pages.size) {
                            viewModel.clearSelection()
                        } else {
                            viewModel.selectAll()
                        }
                    }
                )
                LedgerIconButton(
                    icon = Icons.Default.RotateRight,
                    contentDescription = "Rotate selected 90 degrees",
                    enabled = state.selectedIndices.isNotEmpty(),
                    onClick = { viewModel.rotateSelected(90) }
                )
                LedgerIconButton(
                    icon = Icons.Default.Delete,
                    contentDescription = "Delete selected pages",
                    enabled = state.selectedIndices.isNotEmpty(),
                    tint = colors.destructive,
                    onClick = { viewModel.deleteSelected() }
                )
            }

            // Quick Tool Launchers
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.xs)
            ) {
                LedgerIconButton(
                    icon = Icons.Default.CallSplit,
                    contentDescription = "Split PDF",
                    onClick = { onNavigateSplit(uri) }
                )
                LedgerIconButton(
                    icon = Icons.Default.Compress,
                    contentDescription = "Compress PDF",
                    onClick = { onNavigateCompress(uri) }
                )
                LedgerIconButton(
                    icon = Icons.Default.Search,
                    contentDescription = "OCR PDF",
                    onClick = { onNavigateOcr(uri) }
                )
                LedgerIconButton(
                    icon = Icons.Default.DeleteSweep,
                    contentDescription = "Strip Metadata",
                    onClick = { onNavigateStrip(uri) }
                )
                LedgerIconButton(
                    icon = Icons.Default.Draw,
                    contentDescription = "Sign PDF",
                    onClick = { onNavigateSign(uri) }
                )
            }
        }

        if (state.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(spacing.m)
                ) {
                    CircularProgressIndicator(color = colors.accent)
                    Text(
                        text = "Loading document...",
                        style = typography.label,
                        color = colors.textSecondary
                    )
                }
            }
        } else if (state.errorMessage != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(spacing.xl),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(spacing.m)
                ) {
                    Text(
                        text = "Unable to load PDF",
                        style = typography.titleMedium,
                        color = colors.destructive
                    )
                    Text(
                        text = state.errorMessage ?: "Unknown error",
                        style = typography.body,
                        color = colors.textSecondary
                    )
                    Spacer(modifier = Modifier.height(spacing.s))
                    LedgerButton(
                        text = "Retry",
                        onClick = { viewModel.loadDocument(uri) }
                    )
                }
            }
        } else if (state.pages.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(spacing.xl),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No pages found in this document.",
                    style = typography.body,
                    color = colors.textSecondary
                )
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 100.dp),
                contentPadding = PaddingValues(spacing.m),
                horizontalArrangement = Arrangement.spacedBy(spacing.m),
                verticalArrangement = Arrangement.spacedBy(spacing.m),
                modifier = Modifier.fillMaxSize()
            ) {
                items(state.pages, key = { it.pageIndex }) { page ->
                    val isSelected = state.selectedIndices.contains(page.pageIndex)
                    PageThumbnailCard(
                        page = page,
                        thumbnail = state.thumbnails[page.pageIndex],
                        isSelected = isSelected,
                        onClick = {
                            haptics.tick()
                            viewModel.togglePageSelection(page.pageIndex)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun PageThumbnailCard(
    page: PageInfo,
    thumbnail: Bitmap?,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    // Selection indicator is a sharp ink border, not a colored blob!
    val borderColor = if (isSelected) colors.accent else colors.border
    val borderWidth = if (isSelected) 2.5.dp else spacing.borderWidthThin

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(100.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(0.707f) // Standard A4 ratio
                .clip(RoundedCornerShape(spacing.cornerSmall))
                .background(colors.surfaceElevated)
                .border(borderWidth, borderColor, RoundedCornerShape(spacing.cornerSmall))
                .clickable(
                    role = Role.Checkbox,
                    onClick = onClick
                ),
            contentAlignment = Alignment.Center
        ) {
            if (thumbnail != null) {
                Image(
                    bitmap = thumbnail.asImageBitmap(),
                    contentDescription = "Page ${page.pageNumber}",
                    modifier = Modifier.fillMaxSize()
                )
            } else {
                Text(
                    text = "${page.pageNumber}",
                    style = typography.monoLarge,
                    color = colors.textMuted
                )
            }

            if (isSelected) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(spacing.xs)
                        .size(18.dp)
                        .clip(RoundedCornerShape(spacing.cornerSmall))
                        .background(colors.accent),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = null,
                        tint = colors.surface,
                        modifier = Modifier.size(12.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(spacing.xs))

        Text(
            text = "p. ${page.pageNumber}",
            style = typography.monoLabel,
            color = if (isSelected) colors.accent else colors.textSecondary
        )
    }
}
