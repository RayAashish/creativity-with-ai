package org.ledger.pdf.ui.screens.split

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import org.ledger.pdf.ui.components.LedgerBadge
import org.ledger.pdf.ui.components.LedgerButton
import org.ledger.pdf.ui.components.LedgerCard
import org.ledger.pdf.ui.components.LedgerTextField
import org.ledger.pdf.ui.components.LedgerTopBar
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun SplitScreen(
    uri: Uri,
    viewModel: SplitViewModel,
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
            viewModel.executeSplit(it) {
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
            title = "Split Document",
            subtitle = state.docInfo?.let { "${it.name} • ${it.pageCount} PGS" },
            onBack = onBack
        )

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(spacing.l),
            verticalArrangement = Arrangement.spacedBy(spacing.l)
        ) {
            // Mode Selector Tabs (Dense, architectural)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(spacing.cornerSmall))
                    .background(colors.surface)
                    .border(spacing.borderWidthThin, colors.border, RoundedCornerShape(spacing.cornerSmall))
                    .padding(spacing.xxs)
            ) {
                SplitTabButton(
                    title = "PAGE RANGE",
                    isSelected = state.selectedTab == SplitTab.BY_RANGE,
                    onClick = { viewModel.setTab(SplitTab.BY_RANGE) },
                    modifier = Modifier.weight(1f)
                )
                SplitTabButton(
                    title = "EVERY N PAGES",
                    isSelected = state.selectedTab == SplitTab.EVERY_N_PAGES,
                    onClick = { viewModel.setTab(SplitTab.EVERY_N_PAGES) },
                    modifier = Modifier.weight(1f)
                )
                SplitTabButton(
                    title = "AT BOOKMARKS",
                    isSelected = state.selectedTab == SplitTab.AT_BOOKMARKS,
                    onClick = { viewModel.setTab(SplitTab.AT_BOOKMARKS) },
                    modifier = Modifier.weight(1f)
                )
            }

            when (state.selectedTab) {
                SplitTab.BY_RANGE -> {
                    LedgerCard(modifier = Modifier.fillMaxWidth()) {
                        Column(verticalArrangement = Arrangement.spacedBy(spacing.m)) {
                            LedgerTextField(
                                value = state.rangeText,
                                onValueChange = { viewModel.updateRangeText(it) },
                                label = "Page Range Expression",
                                placeholder = "e.g. 1-3, 5, 8-10",
                                isMonospace = true
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "PARSED EXTRACT:",
                                    style = typography.sectionHeader,
                                    color = colors.textSecondary
                                )
                                LedgerBadge(
                                    text = "${state.parsedIndices.size} PAGES MATCHED",
                                    isAccent = state.parsedIndices.isNotEmpty()
                                )
                            }

                            Text(
                                text = if (state.parsedIndices.isEmpty()) {
                                    "No valid pages selected in current document range (1..${state.docInfo?.pageCount ?: 1})."
                                } else {
                                    "Pages: " + state.parsedIndices.map { it + 1 }.joinToString(", ")
                                },
                                style = typography.monoBody,
                                color = colors.textPrimary
                            )
                        }
                    }
                }

                SplitTab.EVERY_N_PAGES -> {
                    LedgerCard(modifier = Modifier.fillMaxWidth()) {
                        Column(verticalArrangement = Arrangement.spacedBy(spacing.m)) {
                            LedgerTextField(
                                value = state.everyNText,
                                onValueChange = { viewModel.updateEveryNText(it) },
                                label = "Chunk Size (Interval in pages)",
                                placeholder = "e.g. 2",
                                isMonospace = true
                            )
                            val interval = state.everyNText.toIntOrNull() ?: 1
                            val total = state.docInfo?.pageCount ?: 1
                            val parts = Math.ceil(total.toDouble() / interval.coerceAtLeast(1)).toInt()
                            Text(
                                text = "Will produce $parts independent PDF partition(s) of $interval page(s) each.",
                                style = typography.body,
                                color = colors.textSecondary
                            )
                        }
                    }
                }

                SplitTab.AT_BOOKMARKS -> {
                    LedgerCard(modifier = Modifier.fillMaxWidth()) {
                        Column(verticalArrangement = Arrangement.spacedBy(spacing.s)) {
                            Text(
                                text = "BOOKMARK CHAPTER SPLIT",
                                style = typography.sectionHeader,
                                color = colors.accent
                            )
                            Text(
                                text = "Detects top-level PDF outline titles and generates a separate file for each designated chapter boundary.",
                                style = typography.body,
                                color = colors.textPrimary
                            )
                        }
                    }
                }
            }
        }

        // Action Confirm Button
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.surface)
                .border(spacing.borderWidthThin, colors.border)
                .padding(spacing.m)
        ) {
            LedgerButton(
                text = "Split & Save...",
                icon = Icons.Default.Check,
                fullWidth = true,
                enabled = !state.isProcessing && (state.selectedTab != SplitTab.BY_RANGE || state.parsedIndices.isNotEmpty()),
                onClick = { savePicker.launch("split_${state.docInfo?.name ?: "document.pdf"}") }
            )
        }
    }
}

@Composable
private fun SplitTabButton(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    Box(
        modifier = modifier
            .height(38.dp)
            .clip(RoundedCornerShape(spacing.cornerSmall))
            .background(if (isSelected) colors.surfaceElevated else colors.surface)
            .then(
                if (isSelected) Modifier.border(spacing.borderWidthThin, colors.borderFocus, RoundedCornerShape(spacing.cornerSmall))
                else Modifier
            )
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            style = typography.monoLabel,
            color = if (isSelected) colors.accent else colors.textSecondary
        )
    }
}
