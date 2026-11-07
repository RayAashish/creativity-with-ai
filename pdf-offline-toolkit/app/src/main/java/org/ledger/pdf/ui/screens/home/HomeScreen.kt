package org.ledger.pdf.ui.screens.home

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CallMerge
import androidx.compose.material.icons.filled.CallSplit
import androidx.compose.material.icons.filled.Compress
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Draw
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import org.ledger.pdf.data.db.RecentDocumentEntity
import org.ledger.pdf.data.model.DocumentInfo
import org.ledger.pdf.ui.components.LedgerBadge
import org.ledger.pdf.ui.components.LedgerButton
import org.ledger.pdf.ui.components.LedgerButtonStyle
import org.ledger.pdf.ui.components.LedgerCard
import org.ledger.pdf.ui.components.LedgerEmptyState
import org.ledger.pdf.ui.components.LedgerIconButton
import org.ledger.pdf.ui.components.LedgerTopBar
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onOpenWorkspace: (Uri) -> Unit,
    onNavigateMerge: () -> Unit,
    onNavigateBatch: () -> Unit,
    onNavigateSettings: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    val recentDocs by viewModel.recentDocuments.collectAsState()

    val filePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let {
            viewModel.onDocumentSelected(it) { readyUri ->
                onOpenWorkspace(readyUri)
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        LedgerTopBar(
            title = "Ledger",
            subtitle = "Offline PDF Toolkit",
            actions = {
                LedgerIconButton(
                    icon = Icons.Default.Settings,
                    contentDescription = "Settings",
                    onClick = onNavigateSettings
                )
            }
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(spacing.l),
            verticalArrangement = Arrangement.spacedBy(spacing.l)
        ) {
            // Air-Gapped Security Banner
            item {
                SecurityNoticeBanner()
            }

            // Primary Action Bar
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(spacing.m)
                ) {
                    LedgerButton(
                        text = "Open PDF",
                        icon = Icons.Default.Add,
                        onClick = { filePicker.launch(arrayOf("application/pdf")) },
                        modifier = Modifier.weight(1f)
                    )
                    LedgerButton(
                        text = "Merge PDFs",
                        icon = Icons.Default.CallMerge,
                        style = LedgerButtonStyle.OUTLINE,
                        onClick = onNavigateMerge,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Tools Quick Access
            item {
                Text(
                    text = "TOOLBOX",
                    style = typography.sectionHeader,
                    color = colors.textSecondary,
                    modifier = Modifier.padding(top = spacing.s, bottom = spacing.xs)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(spacing.s)
                ) {
                    ToolShortcutCard(
                        title = "Batch Queue",
                        icon = Icons.Default.Layers,
                        onClick = onNavigateBatch,
                        modifier = Modifier.weight(1f)
                    )
                    ToolShortcutCard(
                        title = "Merge Files",
                        icon = Icons.Default.CallMerge,
                        onClick = onNavigateMerge,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Recent Documents Section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "RECENT FILES",
                        style = typography.sectionHeader,
                        color = colors.textSecondary
                    )
                    if (recentDocs.isNotEmpty()) {
                        LedgerBadge(text = "${recentDocs.size} CACHED")
                    }
                }
            }

            if (recentDocs.isEmpty()) {
                item {
                    LedgerEmptyState(
                        headline = "No documents opened yet.",
                        action = {
                            LedgerButton(
                                text = "Select PDF from Device",
                                icon = Icons.Default.Description,
                                onClick = { filePicker.launch(arrayOf("application/pdf")) }
                            )
                        }
                    )
                }
            } else {
                items(recentDocs, key = { it.uriString }) { doc ->
                    RecentDocumentRow(
                        doc = doc,
                        onClick = {
                            val uri = Uri.parse(doc.uriString)
                            viewModel.onDocumentSelected(uri) { onOpenWorkspace(it) }
                        },
                        onTogglePin = { viewModel.togglePin(doc) },
                        onRemove = { viewModel.removeRecent(doc) }
                    )
                }
            }
        }
    }
}

@Composable
private fun SecurityNoticeBanner() {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(spacing.cornerSmall))
            .background(colors.surface)
            .border(spacing.borderWidthThin, colors.border, RoundedCornerShape(spacing.cornerSmall))
            .padding(spacing.m),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(spacing.m)
    ) {
        Icon(
            imageVector = Icons.Default.Lock,
            contentDescription = "Air-gapped security verified",
            tint = colors.accent,
            modifier = Modifier.size(spacing.iconSizeMedium)
        )
        Column {
            Text(
                text = "AIR-GAPPED ENVIRONMENT",
                style = typography.sectionHeader,
                color = colors.accent
            )
            Text(
                text = "Zero internet permission compiled. No server calls, telemetry, or analytics.",
                style = typography.label,
                color = colors.textSecondary
            )
        }
    }
}

@Composable
private fun ToolShortcutCard(
    title: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    LedgerCard(
        modifier = modifier.height(spacing.compactRowHeight),
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(spacing.m)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = colors.accent,
                modifier = Modifier.size(spacing.iconSizeMedium)
            )
            Text(
                text = title,
                style = typography.button,
                color = colors.textPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun RecentDocumentRow(
    doc: RecentDocumentEntity,
    onClick: () -> Unit,
    onTogglePin: () -> Unit,
    onRemove: () -> Unit
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    LedgerCard(
        modifier = Modifier
            .fillMaxWidth()
            .height(spacing.compactRowHeight),
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.m),
                modifier = Modifier.weight(1f)
            ) {
                Icon(
                    imageVector = Icons.Default.Description,
                    contentDescription = null,
                    tint = colors.textSecondary,
                    modifier = Modifier.size(spacing.iconSizeMedium)
                )

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = doc.displayName,
                        style = typography.monoBody,
                        color = colors.textPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(spacing.s),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${doc.pageCount} pgs",
                            style = typography.monoLabel,
                            color = colors.textMuted
                        )
                        Text(
                            text = "•",
                            style = typography.monoLabel,
                            color = colors.textMuted
                        )
                        Text(
                            text = DocumentInfo.formatBytes(doc.sizeBytes),
                            style = typography.monoLabel,
                            color = colors.textMuted
                        )
                    }
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.xs)
            ) {
                LedgerIconButton(
                    icon = Icons.Default.PushPin,
                    contentDescription = if (doc.isPinned) "Unpin document" else "Pin document",
                    tint = if (doc.isPinned) colors.accent else colors.textMuted,
                    onClick = onTogglePin,
                    modifier = Modifier.size(36.dp)
                )
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Open",
                    tint = colors.textMuted,
                    modifier = Modifier.size(spacing.iconSizeSmall)
                )
            }
        }
    }
}
