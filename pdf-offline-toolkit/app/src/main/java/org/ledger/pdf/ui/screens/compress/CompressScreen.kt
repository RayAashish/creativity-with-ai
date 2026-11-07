package org.ledger.pdf.ui.screens.compress

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.ledger.pdf.data.model.CompressLevel
import org.ledger.pdf.ui.components.LedgerBadge
import org.ledger.pdf.ui.components.LedgerButton
import org.ledger.pdf.ui.components.LedgerCard
import org.ledger.pdf.ui.components.LedgerProgressBar
import org.ledger.pdf.ui.components.LedgerTextField
import org.ledger.pdf.ui.components.LedgerTopBar
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun CompressScreen(
    uri: Uri,
    viewModel: CompressViewModel,
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
            viewModel.executeCompress(it) {
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
            title = "Compress Document",
            subtitle = state.docInfo?.let { "${it.name} • ${it.formattedSize}" },
            onBack = onBack
        )

        if (state.isExecuting) {
            LedgerProgressBar(
                progress = state.progress,
                statusText = "Optimizing stream & re-encoding images...",
                modifier = Modifier.padding(spacing.m)
            )
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(spacing.l),
            verticalArrangement = Arrangement.spacedBy(spacing.l)
        ) {
            // Delta Readout Card (Dense, monospace, technical)
            LedgerCard(modifier = Modifier.fillMaxWidth()) {
                Column(verticalArrangement = Arrangement.spacedBy(spacing.s)) {
                    Text(
                        text = "SIZE REDUCTION READOUT",
                        style = typography.sectionHeader,
                        color = colors.accent
                    )

                    Text(
                        text = state.sizeDeltaText ?: "Calculating projection...",
                        style = typography.monoLarge,
                        color = colors.textPrimary
                    )

                    Text(
                        text = "Local raster downscaling + JPEG re-quantization. Zero cloud conversion.",
                        style = typography.label,
                        color = colors.textSecondary
                    )
                }
            }

            // Presets
            Text(
                text = "OPTIMIZATION PRESETS",
                style = typography.sectionHeader,
                color = colors.textSecondary
            )

            CompressLevel.values().forEach { level ->
                val isSelected = !state.isTargetKbMode && state.selectedLevel == level
                LedgerCard(
                    modifier = Modifier.fillMaxWidth(),
                    isSelected = isSelected,
                    onClick = { viewModel.selectPreset(level) }
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(spacing.s)
                            ) {
                                Text(
                                    text = level.title,
                                    style = typography.button,
                                    color = colors.textPrimary
                                )
                                LedgerBadge(text = "${level.dpi} DPI / ${level.quality}% Q")
                            }
                            Spacer(modifier = Modifier.height(spacing.xxs))
                            Text(
                                text = level.description,
                                style = typography.body,
                                color = colors.textSecondary
                            )
                        }
                    }
                }
            }

            // Target KB Mode
            LedgerCard(
                modifier = Modifier.fillMaxWidth(),
                isSelected = state.isTargetKbMode
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(spacing.m)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "CUSTOM TARGET FILE SIZE",
                                style = typography.sectionHeader,
                                color = colors.textPrimary
                            )
                            Text(
                                text = "Iterative binary search for desired file cap",
                                style = typography.label,
                                color = colors.textSecondary
                            )
                        }
                        Switch(
                            checked = state.isTargetKbMode,
                            onCheckedChange = { viewModel.setTargetKbMode(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = colors.accent,
                                checkedTrackColor = colors.accentSubtle,
                                uncheckedThumbColor = colors.textMuted,
                                uncheckedTrackColor = colors.surfaceElevated
                            )
                        )
                    }

                    if (state.isTargetKbMode) {
                        LedgerTextField(
                            value = state.targetKbText,
                            onValueChange = { viewModel.updateTargetKb(it) },
                            label = "Target Size (Kilobytes)",
                            placeholder = "500",
                            isMonospace = true
                        )
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
                text = "Compress & Save As...",
                icon = Icons.Default.Check,
                fullWidth = true,
                enabled = !state.isExecuting,
                onClick = { savePicker.launch("compressed_${state.docInfo?.name ?: "doc.pdf"}") }
            )
        }
    }
}
