package org.ledger.pdf.ui.screens.settings

import android.content.Intent
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Coffee
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import org.ledger.pdf.ui.components.LedgerBadge
import org.ledger.pdf.ui.components.LedgerButton
import org.ledger.pdf.ui.components.LedgerButtonStyle
import org.ledger.pdf.ui.components.LedgerCard
import org.ledger.pdf.ui.components.LedgerDialog
import org.ledger.pdf.ui.components.LedgerIconButton
import org.ledger.pdf.ui.components.LedgerTextField
import org.ledger.pdf.ui.components.LedgerTopBar
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.ThemeMode
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    val state by viewModel.uiState.collectAsState()

    var newCertAlias by remember { mutableStateOf("my_offline_key") }
    var newCertName by remember { mutableStateOf("Alice Professional") }

    var p12Password by remember { mutableStateOf("") }
    var pendingImportUri by remember { mutableStateOf<Uri?>(null) }

    val pkcs12Picker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        uri?.let {
            pendingImportUri = it
            viewModel.showImportCert(true)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        LedgerTopBar(
            title = "Settings & Security",
            subtitle = "AIR-GAPPED ENVIRONMENT",
            onBack = onBack
        )

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(spacing.l),
            verticalArrangement = Arrangement.spacedBy(spacing.l)
        ) {
            // Theme selection
            item {
                Text(
                    text = "VISUAL THEME",
                    style = typography.sectionHeader,
                    color = colors.textSecondary
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(spacing.s)
                ) {
                    ThemeOptionButton(
                        title = "PAPER LIGHT",
                        isSelected = state.themeMode == ThemeMode.LIGHT,
                        onClick = { viewModel.setTheme(ThemeMode.LIGHT) },
                        modifier = Modifier.weight(1f)
                    )
                    ThemeOptionButton(
                        title = "CHARCOAL DARK",
                        isSelected = state.themeMode == ThemeMode.DARK,
                        onClick = { viewModel.setTheme(ThemeMode.DARK) },
                        modifier = Modifier.weight(1f)
                    )
                    ThemeOptionButton(
                        title = "SYSTEM DEFAULT",
                        isSelected = state.themeMode == ThemeMode.SYSTEM,
                        onClick = { viewModel.setTheme(ThemeMode.SYSTEM) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Scratch Cache Management
            item {
                Text(
                    text = "STORAGE & SCRATCH DISK",
                    style = typography.sectionHeader,
                    color = colors.textSecondary
                )

                LedgerCard(modifier = Modifier.fillMaxWidth()) {
                    Column(verticalArrangement = Arrangement.spacedBy(spacing.m)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "SCRATCH CACHE USAGE",
                                    style = typography.sectionHeader,
                                    color = colors.accent
                                )
                                Text(
                                    text = "Intermediates wiped automatically on exit",
                                    style = typography.label,
                                    color = colors.textSecondary
                                )
                            }
                            LedgerBadge(text = state.formattedScratchSize)
                        }

                        LedgerButton(
                            text = "Wipe Scratch Memory Now",
                            icon = Icons.Default.CleaningServices,
                            style = LedgerButtonStyle.OUTLINE,
                            onClick = { viewModel.wipeScratch() }
                        )
                    }
                }
            }

            // Digital Certificates Management
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "DIGITAL SIGNATURE KEYS",
                        style = typography.sectionHeader,
                        color = colors.textSecondary
                    )
                    LedgerBadge(text = "${state.certificates.size} CERTIFICATES")
                }

                Spacer(modifier = Modifier.height(spacing.s))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(spacing.s)
                ) {
                    LedgerButton(
                        text = "+ Create Key",
                        icon = Icons.Default.Add,
                        onClick = { viewModel.showCreateCert(true) },
                        modifier = Modifier.weight(1f)
                    )
                    LedgerButton(
                        text = "Import .p12",
                        icon = Icons.Default.FileUpload,
                        style = LedgerButtonStyle.OUTLINE,
                        onClick = { pkcs12Picker.launch(arrayOf("*/*")) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            if (state.certificates.isEmpty()) {
                item {
                    LedgerCard(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "No cryptographic certificates stored. Create a self-signed RSA-2048 identity above to digitally sign PDFs.",
                            style = typography.body,
                            color = colors.textSecondary
                        )
                    }
                }
            } else {
                items(state.certificates) { cert ->
                    LedgerCard(modifier = Modifier.fillMaxWidth()) {
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
                                    text = "Alias: ${cert.alias} • ${if (cert.isSelfSigned) "Self-signed" else "Imported"}",
                                    style = typography.monoLabel,
                                    color = colors.textMuted
                                )
                            }
                            LedgerIconButton(
                                icon = Icons.Default.Delete,
                                contentDescription = "Delete certificate",
                                tint = colors.destructive,
                                onClick = { viewModel.deleteCert(cert.alias) },
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }
                }
            }

            // About & Transparency
            item {
                Text(
                    text = "ABOUT LEDGER & LICENSE",
                    style = typography.sectionHeader,
                    color = colors.textSecondary
                )

                LedgerCard(modifier = Modifier.fillMaxWidth()) {
                    Column(verticalArrangement = Arrangement.spacedBy(spacing.m)) {
                        Text(
                            text = "Ledger v1.0.0 — Offline-Only Air-Gapped Toolkit",
                            style = typography.titleMedium,
                            color = colors.textPrimary
                        )

                        Text(
                            text = "Built under the GNU General Public License v3.0 (GPL-3.0). Free and open-source software forever. No accounts, no servers, no telemetry, no crash trackers, no ads.",
                            style = typography.body,
                            color = colors.textSecondary
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(spacing.s)
                        ) {
                            LedgerButton(
                                text = "Source Code (GPL-3.0)",
                                icon = Icons.Default.Code,
                                style = LedgerButtonStyle.OUTLINE,
                                onClick = {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/ledger-pdf/ledger"))
                                    context.startActivity(intent)
                                },
                                modifier = Modifier.weight(1f)
                            )
                            LedgerButton(
                                text = "Buy Me a Coffee",
                                icon = Icons.Default.Coffee,
                                style = LedgerButtonStyle.OUTLINE,
                                onClick = {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://buymeacoffee.com/ledgerpdf"))
                                    context.startActivity(intent)
                                },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }
        }

        // Create Cert Dialog
        if (state.showCreateCertDialog) {
            LedgerDialog(
                title = "Generate Self-Signed X.509 Key",
                onDismissRequest = { viewModel.showCreateCert(false) },
                confirmButton = {
                    LedgerButton(
                        text = "Generate Keypair",
                        onClick = { viewModel.createSelfSignedCert(newCertAlias, newCertName) }
                    )
                },
                dismissButton = {
                    LedgerButton(
                        text = "Cancel",
                        style = LedgerButtonStyle.GHOST,
                        onClick = { viewModel.showCreateCert(false) }
                    )
                }
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(spacing.m)) {
                    LedgerTextField(
                        value = newCertAlias,
                        onValueChange = { newCertAlias = it },
                        label = "Key Alias",
                        isMonospace = true
                    )
                    LedgerTextField(
                        value = newCertName,
                        onValueChange = { newCertName = it },
                        label = "Signer Common Name (CN)",
                        placeholder = "e.g. Alice Professional"
                    )
                }
            }
        }

        // Import PKCS#12 Dialog
        if (state.showImportCertDialog && pendingImportUri != null) {
            LedgerDialog(
                title = "Enter PKCS#12 Keystore Password",
                onDismissRequest = { viewModel.showImportCert(false) },
                confirmButton = {
                    LedgerButton(
                        text = "Import Certificate",
                        onClick = {
                            viewModel.importPkcs12Cert(pendingImportUri!!, p12Password)
                        }
                    )
                },
                dismissButton = {
                    LedgerButton(
                        text = "Cancel",
                        style = LedgerButtonStyle.GHOST,
                        onClick = { viewModel.showImportCert(false) }
                    )
                }
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(spacing.m)) {
                    Text(
                        text = "Enter the password used to protect this .p12 / .pfx file:",
                        style = typography.body,
                        color = colors.textSecondary
                    )
                    LedgerTextField(
                        value = p12Password,
                        onValueChange = { p12Password = it },
                        label = "Keystore Password",
                        isMonospace = true
                    )
                }
            }
        }
    }
}

@Composable
private fun ThemeOptionButton(
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
            text = title,
            style = typography.monoLabel,
            color = if (isSelected) colors.accent else colors.textPrimary
        )
    }
}
