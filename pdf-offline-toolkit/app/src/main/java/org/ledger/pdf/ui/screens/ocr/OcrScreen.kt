package org.ledger.pdf.ui.screens.ocr

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
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
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
import org.ledger.pdf.ui.components.LedgerProgressBar
import org.ledger.pdf.ui.components.LedgerTopBar
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun OcrScreen(
    uri: Uri,
    viewModel: OcrViewModel,
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
            viewModel.startOcr(it)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        LedgerTopBar(
            title = "Air-Gapped OCR",
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
            // Live Progress Indicator with Cancel
            if (state.isRunning) {
                val current = state.currentProgress
                val total = state.totalProgress.coerceAtLeast(1)
                val progressFloat = current.toFloat() / total
                LedgerProgressBar(
                    progress = progressFloat,
                    statusText = "Processing $current/$total pages",
                    onCancel = { viewModel.cancelJob() }
                )
            }

            // Architecture Banner
            LedgerCard(modifier = Modifier.fillMaxWidth()) {
                Column(verticalArrangement = Arrangement.spacedBy(spacing.xs)) {
                    Text(
                        text = "EMBEDDED TESSERACT OCR",
                        style = typography.sectionHeader,
                        color = colors.accent
                    )
                    Text(
                        text = "Rasterizes pages locally at 200 DPI, runs optical character recognition, and synthesizes an invisible text layer to create a searchable PDF. No images or text ever leave this device.",
                        style = typography.body,
                        color = colors.textPrimary
                    )
                }
            }

            // Language Selector
            Text(
                text = "RECOGNITION LANGUAGE",
                style = typography.sectionHeader,
                color = colors.textSecondary
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(spacing.s)
            ) {
                state.availableLanguages.forEach { lang ->
                    val isSelected = state.selectedLanguage == lang
                    LanguageChip(
                        language = lang,
                        isSelected = isSelected,
                        onClick = { viewModel.selectLanguage(lang) },
                        modifier = Modifier.weight(1f)
                    )
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
                text = if (state.isRunning) "Running OCR..." else "Start OCR & Save As...",
                icon = Icons.Default.PlayArrow,
                fullWidth = true,
                enabled = !state.isRunning,
                onClick = { savePicker.launch("ocr_${state.docInfo?.name ?: "searchable.pdf"}") }
            )
        }
    }
}

@Composable
private fun LanguageChip(
    language: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    Box(
        modifier = modifier
            .height(44.dp)
            .clip(RoundedCornerShape(spacing.cornerSmall))
            .background(if (isSelected) colors.surfaceElevated else colors.surface)
            .border(
                spacing.borderWidthThin,
                if (isSelected) colors.accent else colors.border,
                RoundedCornerShape(spacing.cornerSmall)
            )
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = language.uppercase(),
            style = typography.monoLabel,
            color = if (isSelected) colors.accent else colors.textPrimary
        )
    }
}
