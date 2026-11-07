package org.ledger.pdf.ui.screens.sign

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Draw
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.unit.dp
import org.ledger.pdf.data.model.DigitalCertificate
import org.ledger.pdf.data.model.SignatureInfo
import org.ledger.pdf.ui.components.LedgerBadge
import org.ledger.pdf.ui.components.LedgerButton
import org.ledger.pdf.ui.components.LedgerCard
import org.ledger.pdf.ui.components.LedgerTextField
import org.ledger.pdf.ui.components.LedgerTopBar
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun SignScreen(
    uri: Uri,
    viewModel: SignViewModel,
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

    val visualSavePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/pdf")
    ) { outUri: Uri? ->
        outUri?.let {
            viewModel.executeVisualSign(it) {
                haptics.confirm()
                onBack()
            }
        }
    }

    val cryptoSavePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/pdf")
    ) { outUri: Uri? ->
        outUri?.let {
            viewModel.executeCryptoSign(it) {
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
            title = "Sign Document",
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
            // Mode Tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(spacing.cornerSmall))
                    .background(colors.surface)
                    .border(spacing.borderWidthThin, colors.border, RoundedCornerShape(spacing.cornerSmall))
                    .padding(spacing.xxs)
            ) {
                SignTabButton(
                    title = "VISUAL STAMP",
                    isSelected = state.selectedTab == SignTab.VISUAL_STAMP,
                    onClick = { viewModel.setTab(SignTab.VISUAL_STAMP) },
                    modifier = Modifier.weight(1f)
                )
                SignTabButton(
                    title = "PADES DIGITAL",
                    isSelected = state.selectedTab == SignTab.DIGITAL_PADES,
                    onClick = { viewModel.setTab(SignTab.DIGITAL_PADES) },
                    modifier = Modifier.weight(1f)
                )
                SignTabButton(
                    title = "VERIFY",
                    isSelected = state.selectedTab == SignTab.VERIFY,
                    onClick = { viewModel.setTab(SignTab.VERIFY) },
                    modifier = Modifier.weight(1f)
                )
            }

            when (state.selectedTab) {
                SignTab.VISUAL_STAMP -> {
                    Text(
                        text = "DRAW SIGNATURE",
                        style = typography.sectionHeader,
                        color = colors.textSecondary
                    )

                    SignatureCanvas(
                        onSignatureCaptured = { bmp ->
                            viewModel.setStampBitmap(bmp)
                        }
                    )

                    if (state.stampBitmap != null) {
                        LedgerCard(modifier = Modifier.fillMaxWidth()) {
                            Column(verticalArrangement = Arrangement.spacedBy(spacing.m)) {
                                Text(
                                    text = "ACTIVE SIGNATURE STAMP PREVIEW",
                                    style = typography.sectionHeader,
                                    color = colors.accent
                                )
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(100.dp)
                                        .clip(RoundedCornerShape(spacing.cornerSmall))
                                        .background(colors.surfaceElevated),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Image(
                                        bitmap = state.stampBitmap!!.asImageBitmap(),
                                        contentDescription = "Drawn signature preview",
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "FLATTEN ONTO PAGE STREAM",
                                            style = typography.sectionHeader,
                                            color = colors.textPrimary
                                        )
                                        Text(
                                            text = "Permanent raster seal, prevents layer extraction.",
                                            style = typography.label,
                                            color = colors.textSecondary
                                        )
                                    }
                                    Switch(
                                        checked = state.flattenVisual,
                                        onCheckedChange = { viewModel.toggleFlatten() },
                                        colors = SwitchDefaults.colors(
                                            checkedThumbColor = colors.accent,
                                            checkedTrackColor = colors.accentSubtle
                                        )
                                    )
                                }

                                LedgerButton(
                                    text = "Stamp & Save As...",
                                    icon = Icons.Default.Check,
                                    fullWidth = true,
                                    onClick = { visualSavePicker.launch("signed_${state.docInfo?.name ?: "doc.pdf"}") }
                                )
                            }
                        }
                    }
                }

                SignTab.DIGITAL_PADES -> {
                    Text(
                        text = "AVAILABLE CERTIFICATES",
                        style = typography.sectionHeader,
                        color = colors.textSecondary
                    )

                    if (state.certificates.isEmpty()) {
                        LedgerCard(modifier = Modifier.fillMaxWidth()) {
                            Column(verticalArrangement = Arrangement.spacedBy(spacing.s)) {
                                Text(
                                    text = "No Digital Certificates Found",
                                    style = typography.titleMedium,
                                    color = colors.textPrimary
                                )
                                Text(
                                    text = "Generate a self-signed key in Settings or import an existing PKCS#12 (.p12/.pfx) certificate.",
                                    style = typography.body,
                                    color = colors.textSecondary
                                )
                            }
                        }
                    } else {
                        state.certificates.forEach { cert ->
                            val isSelected = state.selectedCertAlias == cert.alias
                            LedgerCard(
                                modifier = Modifier.fillMaxWidth(),
                                isSelected = isSelected,
                                onClick = { viewModel.selectCert(cert.alias) }
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = cert.commonName,
                                            style = typography.monoBody,
                                            color = colors.textPrimary
                                        )
                                        Text(
                                            text = "Alias: ${cert.alias} • RSA 2048",
                                            style = typography.monoLabel,
                                            color = colors.textMuted
                                        )
                                    }
                                    LedgerBadge(
                                        text = if (cert.isSelfSigned) "SELF-SIGNED" else "CA SIGNED",
                                        isAccent = isSelected
                                    )
                                }
                            }
                        }

                        LedgerTextField(
                            value = state.signReason,
                            onValueChange = { viewModel.updateReason(it) },
                            label = "Signing Reason / Justification",
                            placeholder = "e.g. Document approval & verification"
                        )

                        LedgerTextField(
                            value = state.signLocation,
                            onValueChange = { viewModel.updateLocation(it) },
                            label = "Signing Location",
                            placeholder = "e.g. Air-Gapped Terminal"
                        )

                        LedgerButton(
                            text = "Apply PAdES Signature & Save As...",
                            icon = Icons.Default.Lock,
                            fullWidth = true,
                            enabled = state.selectedCertAlias != null && !state.isProcessing,
                            onClick = { cryptoSavePicker.launch("pades_${state.docInfo?.name ?: "doc.pdf"}") }
                        )
                    }
                }

                SignTab.VERIFY -> {
                    Text(
                        text = "EXISTING DIGITAL SIGNATURES",
                        style = typography.sectionHeader,
                        color = colors.textSecondary
                    )

                    if (state.verifiedSignatures.isEmpty()) {
                        LedgerCard(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = "No cryptographic digital signatures detected in this document.",
                                style = typography.body,
                                color = colors.textSecondary
                            )
                        }
                    } else {
                        state.verifiedSignatures.forEach { sig ->
                            LedgerCard(modifier = Modifier.fillMaxWidth()) {
                                Column(verticalArrangement = Arrangement.spacedBy(spacing.s)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = sig.signerName,
                                            style = typography.monoBody,
                                            color = colors.textPrimary
                                        )
                                        LedgerBadge(
                                            text = if (sig.isValid) "INTEGRITY VALID" else "TAMPERED / INVALID",
                                            isSuccess = sig.isValid,
                                            isAccent = !sig.isValid
                                        )
                                    }
                                    Text(
                                        text = "Subject: ${sig.certificateSubject}",
                                        style = typography.monoLabel,
                                        color = colors.textMuted
                                    )
                                    if (!sig.reason.isNullOrBlank()) {
                                        Text(
                                            text = "Reason: ${sig.reason}",
                                            style = typography.label,
                                            color = colors.textSecondary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SignTabButton(
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
