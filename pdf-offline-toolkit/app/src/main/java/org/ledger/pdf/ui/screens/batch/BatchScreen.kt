package org.ledger.pdf.ui.screens.batch

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
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.ledger.pdf.data.model.BatchAction
import org.ledger.pdf.data.model.CompressLevel
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
fun BatchScreen(
    viewModel: BatchViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    val state by viewModel.uiState.collectAsState()

    val docPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let { viewModel.setDocument(it) }
    }

    val savePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/pdf")
    ) { outUri: Uri? ->
        outUri?.let { viewModel.startPipeline(it) }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        LedgerTopBar(
            title = "Batch Pipeline Queue",
            subtitle = "${state.pipeline.size} OPERATIONS CHAINED",
            onBack = onBack
        )

        if (state.isRunning) {
            LedgerProgressBar(
                progress = 0.5f,
                statusText = "Executing automated chained operations...",
                onCancel = { viewModel.cancelPipeline() },
                modifier = Modifier.padding(spacing.m)
            )
        }

        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(spacing.l),
            verticalArrangement = Arrangement.spacedBy(spacing.m)
        ) {
            // Source Document Section
            item {
                Text(
                    text = "TARGET DOCUMENT",
                    style = typography.sectionHeader,
                    color = colors.textSecondary
                )

                if (state.selectedDocUri == null) {
                    LedgerCard(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = { docPicker.launch(arrayOf("application/pdf")) }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(spacing.m)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Description,
                                contentDescription = null,
                                tint = colors.accent
                            )
                            Text(
                                text = "Select Target PDF File",
                                style = typography.button,
                                color = colors.textPrimary
                            )
                        }
                    }
                } else {
                    LedgerCard(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = state.docInfo?.name ?: "Selected Document",
                                    style = typography.monoBody,
                                    color = colors.textPrimary
                                )
                                Text(
                                    text = state.docInfo?.formattedSize ?: "",
                                    style = typography.monoLabel,
                                    color = colors.textMuted
                                )
                            }
                            LedgerButton(
                                text = "Change",
                                style = LedgerButtonStyle.OUTLINE,
                                onClick = { docPicker.launch(arrayOf("application/pdf")) }
                            )
                        }
                    }
                }
            }

            // Chained Sequence
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "OPERATION CHAIN (EXECUTED IN ORDER)",
                        style = typography.sectionHeader,
                        color = colors.textSecondary
                    )
                    LedgerBadge(text = "${state.pipeline.size} STEPS")
                }
            }

            itemsIndexed(state.pipeline) { index, action ->
                LedgerCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(spacing.compactRowHeight)
                ) {
                    Row(
                        modifier = Modifier.fillMaxSize(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(spacing.s),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = "[$index]",
                                style = typography.monoLabel,
                                color = colors.accent
                            )
                            Text(
                                text = action.displayTitle,
                                style = typography.monoBody,
                                color = colors.textPrimary
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            LedgerIconButton(
                                icon = Icons.Default.ArrowUpward,
                                contentDescription = "Move step up",
                                enabled = index > 0,
                                onClick = { viewModel.moveAction(index, index - 1) },
                                modifier = Modifier.size(32.dp)
                            )
                            LedgerIconButton(
                                icon = Icons.Default.ArrowDownward,
                                contentDescription = "Move step down",
                                enabled = index < state.pipeline.size - 1,
                                onClick = { viewModel.moveAction(index, index + 1) },
                                modifier = Modifier.size(32.dp)
                            )
                            LedgerIconButton(
                                icon = Icons.Default.Close,
                                contentDescription = "Remove step",
                                tint = colors.destructive,
                                onClick = { viewModel.removeAction(index) },
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }
                }
            }

            // Add action tools
            item {
                Text(
                    text = "ADD STEP TO CHAIN",
                    style = typography.sectionHeader,
                    color = colors.textSecondary,
                    modifier = Modifier.padding(top = spacing.s)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(spacing.s)
                ) {
                    LedgerButton(
                        text = "+ Strip Metadata",
                        style = LedgerButtonStyle.OUTLINE,
                        onClick = { viewModel.addAction(BatchAction.StripMetadata) },
                        modifier = Modifier.weight(1f)
                    )
                    LedgerButton(
                        text = "+ Compress (Web)",
                        style = LedgerButtonStyle.OUTLINE,
                        onClick = { viewModel.addAction(BatchAction.Compress(CompressLevel.WEB)) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Action Run Pipeline Button
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.surface)
                .border(spacing.borderWidthThin, colors.border)
                .padding(spacing.m)
        ) {
            LedgerButton(
                text = "Run Pipeline & Save As...",
                icon = Icons.Default.PlayArrow,
                fullWidth = true,
                enabled = state.selectedDocUri != null && state.pipeline.isNotEmpty() && !state.isRunning,
                onClick = { savePicker.launch("pipelined_${state.docInfo?.name ?: "doc.pdf"}") }
            )
        }
    }
}
