package org.ledger.pdf.ui.screens.merge

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import org.ledger.pdf.ui.components.LedgerBadge
import org.ledger.pdf.ui.components.LedgerButton
import org.ledger.pdf.ui.components.LedgerButtonStyle
import org.ledger.pdf.ui.components.LedgerCard
import org.ledger.pdf.ui.components.LedgerEmptyState
import org.ledger.pdf.ui.components.LedgerIconButton
import org.ledger.pdf.ui.components.LedgerProgressBar
import org.ledger.pdf.ui.components.LedgerTopBar
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun MergeScreen(
    viewModel: MergeViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    val state by viewModel.uiState.collectAsState()

    val multiFilePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenMultipleDocuments()
    ) { uris: List<Uri> ->
        if (uris.isNotEmpty()) {
            viewModel.addFiles(uris)
        }
    }

    val savePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/pdf")
    ) { uri: Uri? ->
        uri?.let {
            viewModel.executeMerge(it) {
                haptics.confirm()
                onBack()
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        LedgerTopBar(
            title = "Merge Documents",
            subtitle = "${state.items.size} FILES SELECTED",
            onBack = onBack
        )

        if (state.isProcessing) {
            LedgerProgressBar(
                progress = state.progress,
                statusText = "Merging PDF streams on-device...",
                modifier = Modifier.padding(spacing.m)
            )
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(spacing.m),
            verticalArrangement = Arrangement.spacedBy(spacing.s)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    LedgerButton(
                        text = "Add PDFs",
                        icon = Icons.Default.Add,
                        onClick = { multiFilePicker.launch(arrayOf("application/pdf")) }
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(spacing.s)
                    ) {
                        Text(
                            text = "INTERLEAVE",
                            style = typography.monoLabel,
                            color = colors.textSecondary
                        )
                        Switch(
                            checked = state.isInterleave,
                            onCheckedChange = { viewModel.toggleInterleave() },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = colors.accent,
                                checkedTrackColor = colors.accentSubtle,
                                uncheckedThumbColor = colors.textMuted,
                                uncheckedTrackColor = colors.surfaceElevated
                            )
                        )
                    }
                }
            }

            if (state.items.isEmpty()) {
                item {
                    LedgerEmptyState(
                        headline = "Select two or more PDFs to merge.",
                        action = {
                            LedgerButton(
                                text = "Choose Files via SAF",
                                icon = Icons.Default.Add,
                                onClick = { multiFilePicker.launch(arrayOf("application/pdf")) }
                            )
                        }
                    )
                }
            } else {
                itemsIndexed(state.items) { index, item ->
                    LedgerCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(spacing.compactRowHeight)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(spacing.s),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = "[#${index + 1}]",
                                    style = typography.monoLabel,
                                    color = colors.accent
                                )
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = item.info.name,
                                        style = typography.monoBody,
                                        color = colors.textPrimary,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "${item.info.pageCount} pgs • ${item.info.formattedSize}",
                                        style = typography.monoLabel,
                                        color = colors.textMuted
                                    )
                                }
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                LedgerIconButton(
                                    icon = Icons.Default.ArrowUpward,
                                    contentDescription = "Move file up",
                                    enabled = index > 0,
                                    onClick = { viewModel.moveItem(index, index - 1) },
                                    modifier = Modifier.size(32.dp)
                                )
                                LedgerIconButton(
                                    icon = Icons.Default.ArrowDownward,
                                    contentDescription = "Move file down",
                                    enabled = index < state.items.size - 1,
                                    onClick = { viewModel.moveItem(index, index + 1) },
                                    modifier = Modifier.size(32.dp)
                                )
                                LedgerIconButton(
                                    icon = Icons.Default.Close,
                                    contentDescription = "Remove file",
                                    tint = colors.destructive,
                                    onClick = { viewModel.removeItem(index) },
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Bottom confirmation action bar
        if (state.items.size >= 2) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colors.surface)
                    .border(spacing.borderWidthThin, colors.border)
                    .padding(spacing.m)
            ) {
                LedgerButton(
                    text = "Merge & Save As...",
                    icon = Icons.Default.Check,
                    enabled = !state.isProcessing,
                    fullWidth = true,
                    onClick = { savePicker.launch("merged_document.pdf") }
                )
            }
        }
    }
}
