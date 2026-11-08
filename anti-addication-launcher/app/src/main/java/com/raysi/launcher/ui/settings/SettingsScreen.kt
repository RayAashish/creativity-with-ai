// app/src/main/java/com/raysi/launcher/ui/settings/SettingsScreen.kt
package com.raysi.launcher.ui.settings

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.provider.Settings
import androidx.activity.compose.BackHandler
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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.R
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.service.AccessibilityUtils
import com.raysi.launcher.service.notification.NotificationUtils
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.FocusTypography
import com.raysi.launcher.ui.theme.HudAmber
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onRequestDefaultLauncher: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val snapshot by viewModel.snapshot.collectAsState()
    val permissions by viewModel.permissionsState.collectAsState()
    val activePicker by viewModel.activePicker.collectAsState()
    val isStealthMode by viewModel.isStealthMode.collectAsState()
    val isSystemGrayscale by viewModel.isSystemGrayscale.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.refreshPermissions(context)
    }

    BackHandler {
        if (activePicker != null) {
            viewModel.closePicker()
        } else {
            onDismiss()
        }
    }

    if (activePicker != null) {
        AppPickerDialog(
            pickerType = activePicker!!,
            viewModel = viewModel,
            onClose = { viewModel.closePicker() }
        )
    } else {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(OledBlack)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 24.dp, vertical = 16.dp)
        ) {
            // Top Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "← back",
                    style = FocusTypography.bodyMedium,
                    color = DimGray,
                    modifier = Modifier
                        .clickable { onDismiss() }
                        .padding(vertical = 8.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "SETTINGS",
                style = FocusTypography.headlineMedium,
                color = PureWhite
            )

            Spacer(modifier = Modifier.height(20.dp))

            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(28.dp)
            ) {
                // Section 1: Permissions
                item {
                    SettingsSection(title = "PERMISSIONS & ACCESS") {
                        PermissionRow(
                            label = "Default Launcher",
                            description = "Required for Home button and system navigation",
                            isGranted = permissions.isDefaultLauncher,
                            onFix = onRequestDefaultLauncher
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        PermissionRow(
                            label = "Usage Access",
                            description = "Calculates local daily screen time without network egress",
                            isGranted = permissions.isUsageGranted,
                            onFix = {
                                try {
                                    context.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
                                } catch (ignored: Exception) {
                                }
                            }
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        PermissionRow(
                            label = "Session Warden (Accessibility)",
                            description = "Intercepts bypass launches for distracting apps without reading screen text",
                            isGranted = permissions.isAccessibilityEnabled,
                            onFix = {
                                try {
                                    context.startActivity(AccessibilityUtils.createAccessibilitySettingsIntent())
                                } catch (ignored: Exception) {
                                }
                            }
                        )

                        if (!permissions.isAccessibilityEnabled) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = stringResource(R.string.restricted_settings_guide),
                                style = FocusTypography.bodySmall,
                                color = DimGray,
                                lineHeight = 14.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        PermissionRow(
                            label = "Notification Quarantine",
                            description = "Intercepts non-essential notifications into intentional scheduled digests",
                            isGranted = permissions.isNotificationListenerEnabled,
                            onFix = {
                                try {
                                    context.startActivity(NotificationUtils.getNotificationListenerSettingsIntent())
                                } catch (ignored: Exception) {
                                }
                            }
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        PermissionRow(
                            label = "Hardware Grayscale (Secure Settings)",
                            description = "Enables system-wide grayscale Daltonizer via ADB",
                            isGranted = permissions.isSecureSettingsGranted,
                            onFix = {}
                        )

                        if (!permissions.isSecureSettingsGranted) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "adb shell pm grant com.raysi.launcher android.permission.WRITE_SECURE_SETTINGS",
                                style = FocusTypography.bodySmall,
                                color = DimGray,
                                fontSize = 11.sp,
                                lineHeight = 14.sp
                            )
                        }
                    }
                }

                // Section 2: Intentional Launch Gate
                item {
                    SettingsSection(title = "INTENTIONAL LAUNCH GATE") {
                        SettingSelectorRow(
                            title = "Breathing countdown",
                            subtitle = "Pause duration before opening distracting apps",
                            options = listOf(5, 10, 15),
                            selected = snapshot.gateDelaySeconds,
                            labelFormatter = { "${it}s" },
                            onSelect = { viewModel.setGateDelay(it) }
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        SettingSelectorRow(
                            title = "Default session length",
                            subtitle = "Initial intentional usage duration limit",
                            options = listOf(5, 10, 15),
                            selected = snapshot.sessionDurationMinutes,
                            labelFormatter = { "${it}m" },
                            onSelect = { viewModel.setSessionDuration(it) }
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        SettingSelectorRow(
                            title = "Maximum extensions cap",
                            subtitle = "Hard ceiling on 5-minute session extensions",
                            options = listOf(1, 2, 3),
                            selected = snapshot.maxExtensionsAllowed,
                            labelFormatter = { "${it}x" },
                            onSelect = { viewModel.setMaxExtensions(it) }
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        // Distracting Apps Picker
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Distracting apps (${snapshot.distractingPackages.size})",
                                    style = FocusTypography.bodyMedium,
                                    color = PureWhite
                                )
                                Text(
                                    text = "Apps gated by breathing countdown and timer",
                                    style = FocusTypography.bodySmall,
                                    color = DimGray
                                )
                            }
                            Text(
                                text = "Select →",
                                style = FocusTypography.bodyMedium,
                                color = PureWhite,
                                modifier = Modifier
                                    .clickable { viewModel.openPicker(AppPickerType.DISTRACTING) }
                                    .padding(8.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "+ Add suggested (Social, Video, Games)",
                            style = FocusTypography.bodySmall,
                            color = DimGray,
                            modifier = Modifier
                                .clickable { viewModel.addSuggestedDistractingPackages() }
                                .padding(vertical = 4.dp)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Never Block Apps
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Never-block apps (${snapshot.neverBlockPackages.size})",
                                    style = FocusTypography.bodyMedium,
                                    color = PureWhite
                                )
                                Text(
                                    text = "Whitelisted from Session Warden interception",
                                    style = FocusTypography.bodySmall,
                                    color = DimGray
                                )
                            }
                            Text(
                                text = "Select →",
                                style = FocusTypography.bodyMedium,
                                color = PureWhite,
                                modifier = Modifier
                                    .clickable { viewModel.openPicker(AppPickerType.NEVER_BLOCK) }
                                    .padding(8.dp)
                            )
                        }
                    }
                }

                // Section 3: Notification Quarantine & Digest
                item {
                    SettingsSection(title = "NOTIFICATION QUARANTINE") {
                        Text(
                            text = "Daily digest schedule",
                            style = FocusTypography.bodyMedium,
                            color = PureWhite
                        )
                        Text(
                            text = "Times when batched notifications are summarized",
                            style = FocusTypography.bodySmall,
                            color = DimGray
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(12, 18, 21).forEach { hour ->
                                val selected = snapshot.digestHours.contains(hour)
                                PillButton(
                                    label = "$hour:00",
                                    isSelected = selected,
                                    onClick = { viewModel.toggleDigestHour(context, hour) }
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Always Allow Apps
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Always-allow notifications (${snapshot.alwaysAllowPackages.size})",
                                    style = FocusTypography.bodyMedium,
                                    color = PureWhite
                                )
                                Text(
                                    text = "Apps whose notifications pass through instantly",
                                    style = FocusTypography.bodySmall,
                                    color = DimGray
                                )
                            }
                            Text(
                                text = "Select →",
                                style = FocusTypography.bodyMedium,
                                color = PureWhite,
                                modifier = Modifier
                                    .clickable { viewModel.openPicker(AppPickerType.ALWAYS_ALLOW) }
                                    .padding(8.dp)
                            )
                        }
                    }
                }

                // Section 4: Usage HUD
                item {
                    SettingsSection(title = "LIVE USAGE HUD") {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    viewModel.setScreenTimeIncludesLauncher(!snapshot.screenTimeIncludesLauncher)
                                }
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Include launcher in screen time",
                                    style = FocusTypography.bodyMedium,
                                    color = PureWhite
                                )
                                Text(
                                    text = if (snapshot.screenTimeIncludesLauncher) {
                                        "Screen time counts time spent in launcher"
                                    } else {
                                        "Screen time only counts external apps"
                                    },
                                    style = FocusTypography.bodySmall,
                                    color = DimGray
                                )
                            }

                            Text(
                                text = if (snapshot.screenTimeIncludesLauncher) "[YES]" else "[NO]",
                                style = FocusTypography.bodyMedium,
                                color = if (snapshot.screenTimeIncludesLauncher) PureWhite else DimGray
                            )
                        }
                    }
                }

                // Section 5: System Bar & Hardware Display
                item {
                    SettingsSection(title = "SYSTEM BAR & DISPLAY") {
                        SettingSelectorRow(
                            title = "Status bar style",
                            subtitle = "Stealth pure black or custom monospaced telemetry bar",
                            options = listOf(true, false),
                            selected = isStealthMode,
                            labelFormatter = { if (it) "Stealth (Hidden)" else "Monospace Bar" },
                            onSelect = { viewModel.setStealthMode(it) }
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable(enabled = permissions.isSecureSettingsGranted) {
                                    viewModel.setSystemGrayscale(context, !isSystemGrayscale)
                                }
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "System-wide hardware grayscale",
                                    style = FocusTypography.bodyMedium,
                                    color = PureWhite
                                )
                                Text(
                                    text = if (permissions.isSecureSettingsGranted) {
                                        "Force OS-wide monochromacy to eliminate dopamine cues"
                                    } else {
                                        "Requires WRITE_SECURE_SETTINGS permission via ADB"
                                    },
                                    style = FocusTypography.bodySmall,
                                    color = DimGray
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Text(
                                text = if (!permissions.isSecureSettingsGranted) {
                                    "[ADB]"
                                } else if (isSystemGrayscale) {
                                    "[ON]"
                                } else {
                                    "[OFF]"
                                },
                                style = FocusTypography.bodyMedium,
                                color = if (isSystemGrayscale) PureWhite else DimGray
                            )
                        }
                    }
                }

                // Section 6: Architecture & Privacy
                item {
                    SettingsSection(title = "ARCHITECTURAL GUARANTEES") {
                        Text(
                            text = "FocusLauncher is 100% offline. Zero network permissions, zero analytics, zero reflection, zero tracking.",
                            style = FocusTypography.bodySmall,
                            color = DimGray,
                            lineHeight = 16.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

@Composable
private fun SettingsSection(
    title: String,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = title,
            style = FocusTypography.bodySmall,
            color = DimGray,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(12.dp))
        content()
    }
}

@Composable
private fun PermissionRow(
    label: String,
    description: String,
    isGranted: Boolean,
    onFix: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = !isGranted, onClick = onFix)
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label,
                style = FocusTypography.bodyMedium,
                color = PureWhite
            )
            Text(
                text = description,
                style = FocusTypography.bodySmall,
                color = DimGray
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Text(
            text = if (isGranted) "[Active]" else "[Enable →]",
            style = FocusTypography.bodySmall,
            color = if (isGranted) DimGray else HudAmber
        )
    }
}

@Composable
private fun <T> SettingSelectorRow(
    title: String,
    subtitle: String,
    options: List<T>,
    selected: T,
    labelFormatter: (T) -> String,
    onSelect: (T) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = title,
            style = FocusTypography.bodyMedium,
            color = PureWhite
        )
        Text(
            text = subtitle,
            style = FocusTypography.bodySmall,
            color = DimGray
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            options.forEach { option ->
                val isSelected = option == selected
                PillButton(
                    label = labelFormatter(option),
                    isSelected = isSelected,
                    onClick = { onSelect(option) }
                )
            }
        }
    }
}

@Composable
private fun PillButton(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .border(
                width = 1.dp,
                color = if (isSelected) PureWhite else DimGray
            )
            .background(if (isSelected) PureWhite else OledBlack)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 6.dp)
    ) {
        Text(
            text = label,
            style = FocusTypography.bodySmall,
            color = if (isSelected) OledBlack else DimGray
        )
    }
}

@Composable
private fun AppPickerDialog(
    pickerType: AppPickerType,
    viewModel: SettingsViewModel,
    onClose: () -> Unit
) {
    val snapshot by viewModel.snapshot.collectAsState()
    val filteredApps by viewModel.filteredPickerApps.collectAsState()
    val searchQuery by viewModel.pickerSearchQuery.collectAsState()
    val categoryFilter by viewModel.pickerCategoryFilter.collectAsState()

    val selectedPackages = when (pickerType) {
        AppPickerType.DISTRACTING -> snapshot.distractingPackages
        AppPickerType.NEVER_BLOCK -> snapshot.neverBlockPackages
        AppPickerType.ALWAYS_ALLOW -> snapshot.alwaysAllowPackages
    }

    val title = when (pickerType) {
        AppPickerType.DISTRACTING -> "DISTRACTING APPS"
        AppPickerType.NEVER_BLOCK -> "NEVER-BLOCK APPS"
        AppPickerType.ALWAYS_ALLOW -> "ALWAYS-ALLOW APPS"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(OledBlack)
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(horizontal = 24.dp, vertical = 16.dp)
    ) {
        // Dialog Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "← done",
                style = FocusTypography.bodyMedium,
                color = PureWhite,
                modifier = Modifier
                    .clickable { onClose() }
                    .padding(vertical = 8.dp)
            )

            Text(
                text = "${selectedPackages.size} selected",
                style = FocusTypography.bodySmall,
                color = DimGray
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = title,
            style = FocusTypography.headlineMedium,
            color = PureWhite
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Search Input
        BasicTextField(
            value = searchQuery,
            onValueChange = { viewModel.setPickerSearchQuery(it) },
            singleLine = true,
            cursorBrush = SolidColor(PureWhite),
            textStyle = FocusTypography.bodyMedium.copy(color = PureWhite),
            decorationBox = { innerTextField ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DimGray)
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                ) {
                    if (searchQuery.isEmpty()) {
                        Text(
                            text = "Search apps…",
                            style = FocusTypography.bodyMedium,
                            color = DimGray
                        )
                    }
                    innerTextField()
                }
            }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Category Filter Chips
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val chips = listOf(
                "All" to null,
                "Social" to ApplicationInfo.CATEGORY_SOCIAL,
                "Video" to ApplicationInfo.CATEGORY_VIDEO,
                "Games" to ApplicationInfo.CATEGORY_GAME
            )

            chips.forEach { (name, cat) ->
                val isSelected = categoryFilter == cat
                PillButton(
                    label = name,
                    isSelected = isSelected,
                    onClick = { viewModel.setPickerCategoryFilter(cat) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // App List
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(
                items = filteredApps,
                key = { it.uniqueKey }
            ) { app ->
                val isChecked = selectedPackages.contains(app.packageName)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { viewModel.togglePackageInActivePicker(app.packageName) }
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = app.label,
                            style = FocusTypography.bodyMedium,
                            color = PureWhite
                        )
                        Text(
                            text = app.packageName,
                            style = FocusTypography.bodySmall,
                            color = DimGray
                        )
                    }

                    Text(
                        text = if (isChecked) "[✓]" else "[ ]",
                        style = FocusTypography.bodyMedium,
                        color = if (isChecked) PureWhite else DimGray
                    )
                }
            }
        }
    }
}
