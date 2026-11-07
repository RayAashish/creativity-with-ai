package com.cliplocker.app.ui.settings

import android.content.Intent
import android.net.Uri
import android.provider.Settings
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import com.cliplocker.app.ui.components.liquidGlass
import com.cliplocker.app.ui.components.spatialBackgroundBrush
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliplocker.app.core.model.ThemeMode
import com.cliplocker.app.ui.theme.CliplockerTheme

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val prefs by viewModel.preferences.collectAsState()
    val ignoredApps by viewModel.ignoredApps.collectAsState()
    val statusMsg by viewModel.statusMessage.collectAsState()

    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val shapes = CliplockerTheme.shapes
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    // Dialog states
    var showAddAppDialog by remember { mutableStateOf(false) }
    var showExportPasswordDialog by remember { mutableStateOf(false) }
    var showImportPasswordDialog by remember { mutableStateOf(false) }
    var pendingExportUri by remember { mutableStateOf<Uri?>(null) }
    var pendingImportUri by remember { mutableStateOf<Uri?>(null) }
    var backupPassword by remember { mutableStateOf("") }

    val exportLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/octet-stream")
    ) { uri ->
        if (uri != null) {
            pendingExportUri = uri
            showExportPasswordDialog = true
        }
    }

    val importLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri != null) {
            pendingImportUri = uri
            showImportPasswordDialog = true
        }
    }

    LaunchedEffect(statusMsg) {
        statusMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearStatusMessage()
        }
    }

    val scrollState = rememberScrollState()
    val scrollToBottom = remember {
        (context as? android.app.Activity)?.intent?.getBooleanExtra("scroll_to_bottom", false) == true
    }
    LaunchedEffect(scrollToBottom) {
        if (scrollToBottom) {
            scrollState.scrollTo(scrollState.maxValue)
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(spatialBackgroundBrush(colors))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Floating Spatial Glass Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 14.dp, vertical = 6.dp)
                    .liquidGlass(colors = colors, shape = shapes.card, elevation = 2.dp)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = colors.inkPrimary
                        )
                    }
                    Text(
                        text = "SETTINGS & PREFERENCES",
                        style = typography.title,
                        color = colors.inkPrimary,
                        modifier = Modifier.padding(start = 6.dp)
                    )
                }
            }

            // Scrollable Settings Sections
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(scrollState)
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Section 1: CAPTURE
                val isA11yEnabled = remember {
                    com.cliplocker.app.service.AccessibilityHelper.isAccessibilityServiceEnabled(
                        context,
                        com.cliplocker.app.service.ClipboardAccessibilityService::class.java
                    )
                }

                SettingsSection(title = "CLIPBOARD CAPTURE & PERMISSIONS") {
                    SettingsSwitchRow(
                        title = "Enable Clipboard Capture",
                        subtitle = "Captures clipboard changes into on-device encrypted storage.",
                        checked = prefs.isCaptureEnabled,
                        onCheckedChange = { v -> viewModel.updatePreferences { it.copy(isCaptureEnabled = v) } }
                    )

                    // Passive Background Capture via Accessibility Service
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
                            Text(
                                text = "Passive Background Capture",
                                style = typography.label,
                                color = colors.inkPrimary
                            )
                            Text(
                                text = if (isA11yEnabled)
                                    "✓ Accessibility service active. Hands-free background capture working."
                                else
                                    "Required on Android 10+ for passive background capture without switching apps.",
                                style = typography.timestamp,
                                color = if (isA11yEnabled) colors.liveActive else colors.accent
                            )
                        }

                        Button(
                            onClick = {
                                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                }
                                context.startActivity(intent)
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isA11yEnabled) colors.surfaceVariant else colors.accent,
                                contentColor = if (isA11yEnabled) colors.liveActive else colors.onAccent
                            ),
                            shape = shapes.chip,
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text(
                                text = if (isA11yEnabled) "ACTIVE" else "ENABLE",
                                style = typography.badge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (isA11yEnabled) colors.liveActive else colors.onAccent
                                )
                            )
                        }
                    }

                    // Floating Search Bubble (Overlay)
                    val canDrawOverlays = remember { Settings.canDrawOverlays(context) }
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
                            Text(
                                text = "Floating Search Bubble",
                                style = typography.label,
                                color = colors.inkPrimary
                            )
                            Text(
                                text = "Floating shortcut icon over any app to capture or pull up search.",
                                style = typography.timestamp,
                                color = colors.inkSecondary
                            )
                        }

                        Button(
                            onClick = {
                                if (!canDrawOverlays) {
                                    val intent = Intent(
                                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                        Uri.parse("package:${context.packageName}")
                                    ).apply {
                                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                    }
                                    context.startActivity(intent)
                                } else {
                                    val bubbleIntent = Intent(context, com.cliplocker.app.service.ClipboardBubbleService::class.java)
                                    context.startService(bubbleIntent)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (canDrawOverlays) colors.surfaceVariant else colors.accent,
                                contentColor = if (canDrawOverlays) colors.liveActive else colors.onAccent
                            ),
                            shape = shapes.chip,
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text(
                                text = if (canDrawOverlays) "START" else "GRANT",
                                style = typography.badge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (canDrawOverlays) colors.liveActive else colors.onAccent
                                )
                            )
                        }
                    }

                    SettingsSwitchRow(
                        title = "Keep Duplicate Copies",
                        subtitle = "Save a new clip entry every time identical text is copied, instead of moving the existing clip to the top. Default: Off.",
                        checked = prefs.allowDuplicates,
                        onCheckedChange = { v -> viewModel.updatePreferences { it.copy(allowDuplicates = v) } }
                    )
                    SettingsSwitchRow(
                        title = "Incognito Mode",
                        subtitle = "Pauses persistence. Captured clips are discarded immediately.",
                        checked = prefs.isIncognito,
                        onCheckedChange = { v -> viewModel.updatePreferences { it.copy(isIncognito = v) } }
                    )
                    SettingsSwitchRow(
                        title = "Auto-detect Sensitive Secrets",
                        subtitle = "Detects API keys, private keys, JWTs, cards & passwords and masks them securely.",
                        checked = prefs.autoDetectSecrets,
                        onCheckedChange = { v -> viewModel.updatePreferences { it.copy(autoDetectSecrets = v) } }
                    )
                }

                // Section 2: PER-APP IGNORE LIST
                SettingsSection(title = "PER-APP IGNORE LIST (${ignoredApps.size})") {
                    Text(
                        text = "Clips originating from these apps are never captured or saved.",
                        style = typography.timestamp,
                        color = colors.inkSecondary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    ignoredApps.forEach { app ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = app.appLabel, style = typography.label, color = colors.inkPrimary)
                                Text(text = app.packageName, style = typography.timestamp, color = colors.inkMuted)
                            }
                            IconButton(
                                onClick = { viewModel.removeIgnoredApp(app.packageName) },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Remove",
                                    tint = colors.inkSecondary,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Button(
                        onClick = { showAddAppDialog = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = colors.background,
                            contentColor = colors.inkPrimary
                        ),
                        shape = shapes.chip,
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, colors.border, shapes.chip)
                    ) {
                        Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Add Package to Ignore List", style = typography.badge)
                    }
                }

                // Section 3: RETENTION POLICY
                SettingsSection(title = "RETENTION & PRUNING") {
                    Text(
                        text = "Pinned clips are always immune to pruning.",
                        style = typography.timestamp,
                        color = colors.accent,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Max History Limit", style = typography.label, color = colors.inkPrimary)
                        Text(text = "${prefs.maxClipsRetention} clips", style = typography.badge, color = colors.accent)
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Max Retention Age", style = typography.label, color = colors.inkPrimary)
                        Text(text = "${prefs.maxDaysRetention} days", style = typography.badge, color = colors.accent)
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { viewModel.pruneNow() },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = colors.background,
                                contentColor = colors.inkPrimary
                            ),
                            shape = shapes.chip,
                            modifier = Modifier.weight(1f).border(1.dp, colors.border, shapes.chip)
                        ) {
                            Text(text = "Prune Old Now", style = typography.badge)
                        }

                        Button(
                            onClick = { viewModel.clearAllNonPinned() },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = colors.accentSubtle,
                                contentColor = colors.accent
                            ),
                            shape = shapes.chip,
                            modifier = Modifier.weight(1f).border(1.dp, colors.accent, shapes.chip)
                        ) {
                            Text(text = "Clear Non-Pinned", style = typography.badge)
                        }
                    }
                }

                // Section 4: SECURITY
                SettingsSection(title = "SECURITY & PRIVACY") {
                    SettingsSwitchRow(
                        title = "Biometric Lock to Open App",
                        subtitle = "Requires fingerprint or face unlock every time the app opens.",
                        checked = prefs.biometricLockEnabled,
                        onCheckedChange = { v -> viewModel.updatePreferences { it.copy(biometricLockEnabled = v) } }
                    )
                    SettingsSwitchRow(
                        title = "Hide Content in Recents (FLAG_SECURE)",
                        subtitle = "Blocks screenshots and masks app preview in Android task switcher.",
                        checked = prefs.flagSecureEnabled,
                        onCheckedChange = { v -> viewModel.updatePreferences { it.copy(flagSecureEnabled = v) } }
                    )
                    SettingsSwitchRow(
                        title = "Wipe on Screen Off",
                        subtitle = "Clears active system clipboard immediately when device screen turns off.",
                        checked = prefs.wipeOnScreenOff,
                        onCheckedChange = { v -> viewModel.updatePreferences { it.copy(wipeOnScreenOff = v) } }
                    )
                    SettingsSwitchRow(
                        title = "Wipe Clipboard on Secret Expiry",
                        subtitle = "Clears system clipboard if it still contains the expired secret.",
                        checked = prefs.wipeClipboardOnSecretExpiry,
                        onCheckedChange = { v -> viewModel.updatePreferences { it.copy(wipeClipboardOnSecretExpiry = v) } }
                    )
                    SettingsSwitchRow(
                        title = "Auto-Expiry Timer for Sensitive Data",
                        subtitle = "Automatically delete sensitive secrets (passwords, tokens, API keys) after a timer expires. When off, sensitive clips remain securely masked indefinitely. Default: Off.",
                        checked = prefs.sensitiveDataTimerEnabled,
                        onCheckedChange = { v -> viewModel.updatePreferences { it.copy(sensitiveDataTimerEnabled = v) } }
                    )
                }

                // Section 5: BACKUP & DATA
                SettingsSection(title = "ENCRYPTED BACKUP") {
                    Text(
                        text = "Export and import your clips with PBKDF2 + AES-GCM encryption. Merges without overwriting existing clips.",
                        style = typography.timestamp,
                        color = colors.inkSecondary,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { exportLauncher.launch("cliplocker_backup_${System.currentTimeMillis()}.clpk") },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = colors.background,
                                contentColor = colors.inkPrimary
                            ),
                            shape = shapes.chip,
                            modifier = Modifier.weight(1f).border(1.dp, colors.border, shapes.chip)
                        ) {
                            Text(text = "Export Encrypted", style = typography.badge)
                        }

                        Button(
                            onClick = { importLauncher.launch(arrayOf("*/*")) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = colors.background,
                                contentColor = colors.inkPrimary
                            ),
                            shape = shapes.chip,
                            modifier = Modifier.weight(1f).border(1.dp, colors.border, shapes.chip)
                        ) {
                            Text(text = "Import Backup", style = typography.badge)
                        }
                    }
                }

                // Section 6: THEME
                SettingsSection(title = "APPEARANCE") {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(ThemeMode.SYSTEM, ThemeMode.LIGHT, ThemeMode.DARK).forEach { mode ->
                            val isSelected = prefs.themeMode == mode
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(shapes.chip)
                                    .background(
                                        if (isSelected) {
                                            Brush.horizontalGradient(
                                                listOf(colors.accentGradientStart, colors.accentGradientEnd)
                                            )
                                        } else {
                                            SolidColor(colors.surfaceVariant)
                                        }
                                    )
                                    .border(
                                        1.dp,
                                        if (isSelected) Color(0x66FFFFFF) else colors.border,
                                        shapes.chip
                                    )
                                    .clickable { viewModel.setThemeMode(mode) }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = mode.label,
                                    style = typography.badge.copy(
                                        fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.SemiBold
                                    ),
                                    color = if (isSelected) colors.onAccent else colors.inkPrimary
                                )
                            }
                        }
                    }
                }

                // Section 7: ABOUT & DONATE
                SettingsSection(title = "ABOUT CLIPLOCKER") {
                    Text(
                        text = "Cliplocker is free & open-source software (GPL-3.0).\nNo accounts, no telemetry, no cloud sync, no tracking.\nAll clipboard history is stored encrypted at rest with SQLCipher.",
                        style = typography.body,
                        color = colors.inkPrimary
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(colors.accentSubtle)
                            .border(1.dp, colors.accent.copy(alpha = 0.35f), RoundedCornerShape(10.dp))
                            .padding(10.dp)
                    ) {
                        Text(
                            text = "ZERO NETWORK VARIANT",
                            style = typography.badge.copy(fontWeight = FontWeight.Bold),
                            color = colors.accent
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "This app has a dedicated 'noInternet' build variant that contains ZERO network permissions in its manifest.",
                            style = typography.timestamp.copy(fontSize = 11.sp, lineHeight = 15.sp),
                            color = colors.inkPrimary
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Buy Me a Coffee Button
                    Button(
                        onClick = {
                            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://buymeacoffee.com/cliplocker"))
                            context.startActivity(browserIntent)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = colors.accent,
                            contentColor = colors.onAccent
                        ),
                        shape = shapes.chip,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Favorite,
                            contentDescription = null,
                            tint = colors.onAccent,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Support Development (Buy Me a Coffee)",
                            style = typography.badge.copy(
                                fontWeight = FontWeight.Bold,
                                color = colors.onAccent
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
            }

            SnackbarHost(hostState = snackbarHostState)
        }

        // Add App Dialog
        if (showAddAppDialog) {
            var pkgName by remember { mutableStateOf("") }
            var appLabel by remember { mutableStateOf("") }

            AlertDialog(
                onDismissRequest = { showAddAppDialog = false },
                title = { Text(text = "Ignore App", style = typography.title) },
                text = {
                    Column {
                        OutlinedTextField(
                            value = pkgName,
                            onValueChange = { pkgName = it },
                            label = { Text("Package name (e.g. com.example.app)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = appLabel,
                            onValueChange = { appLabel = it },
                            label = { Text("Label (e.g. Banking App)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            if (pkgName.isNotBlank()) {
                                viewModel.addIgnoredApp(pkgName, appLabel)
                                showAddAppDialog = false
                            }
                        }
                    ) {
                        Text("Add", color = colors.accent)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showAddAppDialog = false }) {
                        Text("Cancel", color = colors.inkSecondary)
                    }
                }
            )
        }

        // Export Password Dialog
        if (showExportPasswordDialog) {
            AlertDialog(
                onDismissRequest = { showExportPasswordDialog = false },
                title = { Text(text = "Encrypt Backup", style = typography.title) },
                text = {
                    Column {
                        Text(text = "Enter a strong password to encrypt your backup export:", style = typography.timestamp)
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = backupPassword,
                            onValueChange = { backupPassword = it },
                            label = { Text("Backup Password") },
                            visualTransformation = PasswordVisualTransformation(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            if (backupPassword.isNotBlank() && pendingExportUri != null) {
                                viewModel.exportBackup(context, pendingExportUri!!, backupPassword.toCharArray())
                                showExportPasswordDialog = false
                                backupPassword = ""
                            }
                        }
                    ) {
                        Text("Export", color = colors.accent)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showExportPasswordDialog = false }) {
                        Text("Cancel", color = colors.inkSecondary)
                    }
                }
            )
        }

        // Import Password Dialog
        if (showImportPasswordDialog) {
            AlertDialog(
                onDismissRequest = { showImportPasswordDialog = false },
                title = { Text(text = "Decrypt Backup", style = typography.title) },
                text = {
                    Column {
                        Text(text = "Enter the password used to encrypt this backup:", style = typography.timestamp)
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = backupPassword,
                            onValueChange = { backupPassword = it },
                            label = { Text("Backup Password") },
                            visualTransformation = PasswordVisualTransformation(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            if (backupPassword.isNotBlank() && pendingImportUri != null) {
                                viewModel.importBackup(context, pendingImportUri!!, backupPassword.toCharArray())
                                showImportPasswordDialog = false
                                backupPassword = ""
                            }
                        }
                    ) {
                        Text("Import & Merge", color = colors.accent)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showImportPasswordDialog = false }) {
                        Text("Cancel", color = colors.inkSecondary)
                    }
                }
            )
        }
    }
}

@Composable
private fun SettingsSection(
    title: String,
    content: @Composable () -> Unit
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val shapes = CliplockerTheme.shapes

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .liquidGlass(colors = colors, shape = shapes.card, elevation = 2.dp)
            .padding(16.dp)
    ) {
        Text(
            text = title,
            style = typography.sectionHeader,
            color = colors.accent,
            modifier = Modifier.padding(bottom = 10.dp)
        )
        content()
    }
}

@Composable
private fun SettingsSwitchRow(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!checked) }
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
            Text(text = title, style = typography.label, color = colors.inkPrimary)
            Text(text = subtitle, style = typography.timestamp, color = colors.inkSecondary)
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = androidx.compose.ui.graphics.Color.White,
                checkedTrackColor = colors.accent,
                uncheckedThumbColor = colors.inkMuted,
                uncheckedTrackColor = colors.border.copy(alpha = 0.5f)
            )
        )
    }
}
