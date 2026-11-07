package org.ledger.pdf.ui.screens.metadata

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import org.ledger.pdf.data.model.MetadataItem
import org.ledger.pdf.ui.components.LedgerBadge
import org.ledger.pdf.ui.components.LedgerButton
import org.ledger.pdf.ui.components.LedgerCard
import org.ledger.pdf.ui.components.LedgerTopBar
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun MetadataScreen(
    uri: Uri,
    viewModel: MetadataViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(uri) {
        viewModel.load(uri)
    }

    val savePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/pdf")
    ) { outputUri: Uri? ->
        outputUri?.let {
            viewModel.executeStrip(it) {
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
            title = "Strip Metadata",
            subtitle = state.docInfo?.let { "${it.name} • INSPECT & SCRUB" },
            onBack = onBack
        )

        if (state.isInspecting) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = colors.accent)
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(spacing.l),
                verticalArrangement = Arrangement.spacedBy(spacing.m)
            ) {
                // Header Summary Card
                item {
                    val count = state.diff?.totalRemovableCount ?: 0
                    LedgerCard(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "METADATA ARTIFACTS FOUND",
                                    style = typography.sectionHeader,
                                    color = colors.accent
                                )
                                Text(
                                    text = "$count identifiers identified for immediate scrub",
                                    style = typography.body,
                                    color = colors.textPrimary
                                )
                            }
                            LedgerBadge(
                                text = "$count ITEMS",
                                isAccent = count > 0,
                                isSuccess = count == 0
                            )
                        }
                    }
                }

                // Diff Table Header
                item {
                    Text(
                        text = "METADATA DICTIONARY DIFF",
                        style = typography.sectionHeader,
                        color = colors.textSecondary
                    )
                }

                // Diff items
                state.diff?.items?.let { items ->
                    items(items) { item ->
                        MetadataDiffRow(item)
                    }
                }

                // XMP and Annotations rows
                item {
                    MetadataSpecialRow(
                        title = "XMP Metadata Stream",
                        status = if (state.diff?.hasXmpMetadata == true) "Present (Stripping to null)" else "None"
                    )
                }
                item {
                    MetadataSpecialRow(
                        title = "Annotations & Comments",
                        status = "${state.diff?.annotationCount ?: 0} annotation(s) will be stripped"
                    )
                }

                // Bookmarks scrub toggle
                item {
                    LedgerCard(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "STRIP BOOKMARKS & OUTLINES",
                                    style = typography.sectionHeader,
                                    color = colors.textPrimary
                                )
                                Text(
                                    text = "Removes document table of contents and internal links.",
                                    style = typography.label,
                                    color = colors.textSecondary
                                )
                            }
                            Switch(
                                checked = state.stripBookmarks,
                                onCheckedChange = { viewModel.toggleStripBookmarks() },
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
            }

            // Action Strip Button
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colors.surface)
                    .border(spacing.borderWidthThin, colors.border)
                    .padding(spacing.m)
            ) {
                LedgerButton(
                    text = "Scrub All Metadata & Save As...",
                    icon = Icons.Default.DeleteSweep,
                    fullWidth = true,
                    enabled = !state.isProcessing,
                    onClick = { savePicker.launch("scrubbed_${state.docInfo?.name ?: "document.pdf"}") }
                )
            }
        }
    }
}

@Composable
private fun MetadataDiffRow(item: MetadataItem) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    LedgerCard(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 52.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.key,
                    style = typography.monoLabel,
                    color = colors.textSecondary
                )
                Text(
                    text = item.originalValue ?: "<Empty / Not Present>",
                    style = typography.monoBody,
                    color = if (item.originalValue != null) colors.textPrimary else colors.textMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            if (item.originalValue != null) {
                LedgerBadge(
                    text = "STRIP → NULL",
                    isAccent = true
                )
            } else {
                LedgerBadge(text = "CLEAN")
            }
        }
    }
}

@Composable
private fun MetadataSpecialRow(title: String, status: String) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography

    LedgerCard(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = title,
                    style = typography.button,
                    color = colors.textPrimary
                )
                Text(
                    text = status,
                    style = typography.monoLabel,
                    color = colors.textSecondary
                )
            }
            LedgerBadge(text = "STRIP", isAccent = true)
        }
    }
}
