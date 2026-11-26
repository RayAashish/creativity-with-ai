// app/src/main/java/com/raysi/launcher/ui/home/HomeScreen.kt
package com.raysi.launcher.ui.home

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.displayCutout
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.R
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.domain.model.AppIconMode
import com.raysi.launcher.domain.model.PinnedAppItem
import com.raysi.launcher.domain.model.StatusBarMode
import com.raysi.launcher.domain.model.SwipeDownAction
import com.raysi.launcher.service.FocusAccessibilityService
import com.raysi.launcher.ui.components.AppIconImage
import com.raysi.launcher.ui.gesture.homeGestureDetector
import com.raysi.launcher.ui.home.components.CustomStatusBar
import com.raysi.launcher.ui.home.components.DailyFocusLine
import com.raysi.launcher.ui.home.components.DayProgressBar
import com.raysi.launcher.ui.home.components.PinnedAppsList
import com.raysi.launcher.ui.home.components.StatusQuickPanelDialog
import com.raysi.launcher.ui.home.components.TelemetryHud
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.FocusTypography
import com.raysi.launcher.ui.theme.HudAmber
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite

private val PillSurface = Color(0xFF0E0E0E)
private val PillBorder = Color(0xFF242424)

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    modifier: Modifier = Modifier,
    onOpenDrawer: () -> Unit = {},
    onOpenDrawerSearch: () -> Unit = {},
    onOpenSettings: () -> Unit = {},
    onOpenQuarantine: () -> Unit = {},
    onOpenScratchpad: () -> Unit = {},
    onRequestDefaultLauncher: () -> Unit = {},
    onRequestPhonePermission: () -> Unit = {},
    onOpenUsageAccessSettings: () -> Unit = {},
    onLaunchApp: (AppInfo) -> Unit = {}
) {
    val context = LocalContext.current
    val telemetryState by viewModel.telemetryUiState.collectAsState()
    val dailyProgress by viewModel.dailyProgress.collectAsState()
    val dailyFocusGoal by viewModel.dailyFocusGoal.collectAsState()
    val pinnedApps by viewModel.pinnedApps.collectAsState()
    val dockApps by viewModel.dockApps.collectAsState()
    val isDefaultLauncher by viewModel.isDefaultLauncher.collectAsState()
    val statusBarMode by viewModel.statusBarMode.collectAsState()
    val appIconMode by viewModel.appIconMode.collectAsState()
    val swipeDownAction by viewModel.swipeDownAction.collectAsState()
    val systemStatus by viewModel.systemStatusState.collectAsState()
    val dialogState by viewModel.dialogState.collectAsState()

    var showStatusPanel by remember { mutableStateOf(false) }
    var showHomeMenu by remember { mutableStateOf(false) }

    val handleSwipeDown: () -> Unit = {
        if (swipeDownAction == SwipeDownAction.SCRATCHPAD) {
            onOpenScratchpad()
        } else {
            if (!FocusAccessibilityService.expandNotifications()) {
                showStatusPanel = true
            }
        }
    }

    val handleDoubleTap: () -> Unit = {
        if (!FocusAccessibilityService.lockScreen()) {
            showHomeMenu = true
        }
    }

    val rootInsetsModifier = when (statusBarMode) {
        StatusBarMode.SYSTEM -> Modifier.statusBarsPadding()
        StatusBarMode.CUSTOM -> Modifier
        StatusBarMode.STEALTH -> Modifier.windowInsetsPadding(WindowInsets.displayCutout)
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(OledBlack)
            .navigationBarsPadding()
            .homeGestureDetector(
                onSwipeUp = onOpenDrawer,
                onSwipeDown = handleSwipeDown,
                onSwipeLeft = onOpenSettings,
                onSwipeRight = onOpenScratchpad,
                onDoubleTap = handleDoubleTap,
                onLongPress = { showHomeMenu = true }
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .then(rootInsetsModifier)
        ) {
            // CUSTOM STATUS BAR (when StatusBarMode.CUSTOM is active — default)
            if (statusBarMode == StatusBarMode.CUSTOM) {
                CustomStatusBar(
                    status = systemStatus,
                    quietAlertsCount = telemetryState.quietAlertsCount,
                    onBarClick = { showStatusPanel = true },
                    onAlertsClick = onOpenQuarantine
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp, vertical = 12.dp)
            ) {
                // TOP ZONE: Setup banner + Telemetry HUD + Day Progress
                Column(modifier = Modifier.fillMaxWidth()) {
                    if (!isDefaultLauncher) {
                        Text(
                            text = "${stringResource(R.string.set_default_launcher)} →",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp,
                            color = HudAmber,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable(onClick = onRequestDefaultLauncher)
                                .padding(bottom = 8.dp)
                        )
                    }

                    TelemetryHud(
                        state = telemetryState,
                        onOpenQuarantine = onOpenQuarantine,
                        onOpenUsageSettings = onOpenUsageAccessSettings,
                        onOpenSettings = onOpenSettings
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    DayProgressBar(progress = dailyProgress)
                }

                Spacer(modifier = Modifier.weight(1f))

                // CENTER ZONE: Intentional Focus Card + Pinned Essentials List
                Column(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(PillSurface)
                            .border(1.dp, PillBorder, RoundedCornerShape(10.dp))
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                    ) {
                        DailyFocusLine(
                            focusGoal = dailyFocusGoal,
                            onSaveFocusGoal = { viewModel.saveFocusGoal(it) }
                        )
                    }

                    Spacer(modifier = Modifier.height(22.dp))

                    PinnedAppsList(
                        pinnedApps = pinnedApps,
                        iconMode = appIconMode,
                        onLaunchApp = { pin ->
                            viewModel.getAppInfoForPin(pin)?.let(onLaunchApp)
                        },
                        onLongClickApp = { pin ->
                            viewModel.onPinLongClick(pin)
                        },
                        onOpenAddApps = onOpenDrawer
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                // BOTTOM LAUNCHER ANCHOR: Minimal Search Pill + Favorites Dock
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    SearchQuickPill(
                        onSearchClick = onOpenDrawerSearch,
                        onScratchClick = onOpenScratchpad,
                        onSettingsClick = onOpenSettings
                    )

                    if (dockApps.isNotEmpty()) {
                        FavoritesDockRow(
                            dockApps = dockApps,
                            iconMode = appIconMode,
                            onLaunchApp = { item ->
                                viewModel.getAppInfoForPin(item)?.let(onLaunchApp)
                            },
                            onLongClickApp = { item ->
                                viewModel.onDockLongClick(item)
                            }
                        )
                    }
                }
            }
        }
    }

    // Custom Status Quick Panel
    if (showStatusPanel) {
        StatusQuickPanelDialog(
            status = systemStatus,
            currentMode = statusBarMode,
            hasAccessibilityEnabled = FocusAccessibilityService.isConnected(),
            onSelectMode = { mode -> viewModel.setStatusBarMode(mode) },
            onExpandNotifications = { FocusAccessibilityService.expandNotifications() },
            onRequestPhonePermission = onRequestPhonePermission,
            onOpenSettings = {
                showStatusPanel = false
                onOpenSettings()
            },
            onDismiss = { showStatusPanel = false }
        )
    }

    // Home Canvas Long-Press Menu (like Pixel / Nova / Niagara)
    if (showHomeMenu) {
        HomeCanvasMenuDialog(
            isDefaultLauncher = isDefaultLauncher,
            statusBarMode = statusBarMode,
            iconMode = appIconMode,
            onPinApps = {
                showHomeMenu = false
                onOpenDrawer()
            },
            onStatusPanel = {
                showHomeMenu = false
                showStatusPanel = true
            },
            onToggleIconMode = {
                val next = when (appIconMode) {
                    AppIconMode.REAL -> AppIconMode.MONOCHROME
                    AppIconMode.MONOCHROME -> AppIconMode.TEXT_ONLY
                    AppIconMode.TEXT_ONLY -> AppIconMode.REAL
                }
                viewModel.setAppIconMode(next)
            },
            onOpenScratchpad = {
                showHomeMenu = false
                onOpenScratchpad()
            },
            onOpenSettings = {
                showHomeMenu = false
                onOpenSettings()
            },
            onRequestDefaultLauncher = {
                showHomeMenu = false
                onRequestDefaultLauncher()
            },
            onDismiss = { showHomeMenu = false }
        )
    }

    // Pinned / Dock App Action Dialogs
    when (val state = dialogState) {
        is HomeDialogState.Options -> {
            PinnedOptionsDialog(
                pin = state.pin,
                canMoveUp = state.canMoveUp,
                canMoveDown = state.canMoveDown,
                onMoveUp = { viewModel.onMoveUp(state.pin) },
                onMoveDown = { viewModel.onMoveDown(state.pin) },
                onRename = { viewModel.onStartRename(state.pin) },
                onSetLimit = { viewModel.onStartSetLimit(state.pin) },
                onUnpin = { viewModel.onUnpin(state.pin) },
                onAppInfo = {
                    viewModel.dismissDialog()
                    try {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.fromParts("package", state.pin.packageName, null)
                        }
                        context.startActivity(intent)
                    } catch (_: Exception) {}
                },
                onDismiss = { viewModel.dismissDialog() }
            )
        }
        is HomeDialogState.DockOptions -> {
            DockAppOptionsDialog(
                item = state.dockItem,
                onRemoveFromDock = { viewModel.removeFromDock(state.dockItem) },
                onSetLimit = { viewModel.onStartSetLimit(state.dockItem) },
                onAppInfo = {
                    viewModel.dismissDialog()
                    try {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.fromParts("package", state.dockItem.packageName, null)
                        }
                        context.startActivity(intent)
                    } catch (_: Exception) {}
                },
                onDismiss = { viewModel.dismissDialog() }
            )
        }
        is HomeDialogState.Rename -> {
            RenameDialog(
                currentText = state.currentText,
                error = state.error,
                onConfirm = { newName -> viewModel.onConfirmRename(state.pin, newName) },
                onDismiss = { viewModel.dismissDialog() }
            )
        }
        is HomeDialogState.SetLimit -> {
            SetTimeLimitDialog(
                currentLimitMinutes = state.currentLimit,
                onSelectLimit = { limit -> viewModel.onConfirmSetLimit(state.pin, limit) },
                onDismiss = { viewModel.dismissDialog() }
            )
        }
        HomeDialogState.None -> Unit
    }
}

@Composable
private fun SearchQuickPill(
    onSearchClick: () -> Unit,
    onScratchClick: () -> Unit,
    onSettingsClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(PillSurface)
            .border(1.dp, PillBorder, RoundedCornerShape(24.dp))
            .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "> search apps...",
            fontFamily = FontFamily.Monospace,
            fontSize = 13.sp,
            color = DimGray,
            modifier = Modifier
                .weight(1f)
                .clickable(onClick = onSearchClick)
        )

        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "[note]",
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                color = DimGray,
                modifier = Modifier.clickable(onClick = onScratchClick)
            )
            Text(
                text = "[settings]",
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                color = DimGray,
                modifier = Modifier.clickable(onClick = onSettingsClick)
            )
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun FavoritesDockRow(
    dockApps: List<PinnedAppItem>,
    iconMode: AppIconMode,
    onLaunchApp: (PinnedAppItem) -> Unit,
    onLongClickApp: (PinnedAppItem) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 2.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        dockApps.forEach { item ->
            val alpha = if (item.isSatiated) 0.45f else 1f
            Column(
                modifier = Modifier
                    .width(64.dp)
                    .combinedClickable(
                        onClick = { onLaunchApp(item) },
                        onLongClick = { onLongClickApp(item) }
                    )
                    .padding(vertical = 4.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                if (iconMode != AppIconMode.TEXT_ONLY) {
                    AppIconImage(
                        packageName = item.packageName,
                        className = item.className,
                        label = item.label,
                        iconMode = iconMode,
                        size = 44.dp,
                        alpha = alpha,
                        isSatiated = item.isSatiated
                    )
                } else {
                    Text(
                        text = item.label.take(7),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = PureWhite.copy(alpha = alpha),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}

@Composable
private fun HomeCanvasMenuDialog(
    isDefaultLauncher: Boolean,
    statusBarMode: StatusBarMode,
    iconMode: AppIconMode,
    onPinApps: () -> Unit,
    onStatusPanel: () -> Unit,
    onToggleIconMode: () -> Unit,
    onOpenScratchpad: () -> Unit,
    onOpenSettings: () -> Unit,
    onRequestDefaultLauncher: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = PillSurface,
        title = {
            Text(
                text = "HOME OPTIONS",
                fontFamily = FontFamily.Monospace,
                fontSize = 15.sp,
                color = PureWhite
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(
                    text = "+ Pin / browse all apps",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onPinApps)
                )
                Text(
                    text = "Status bar (${statusBarMode.name.lowercase()})",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onStatusPanel)
                )
                Text(
                    text = "App icon style (${iconMode.name.lowercase().replace('_', ' ')})",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onToggleIconMode)
                )
                Text(
                    text = "Quick scratchpad",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onOpenScratchpad)
                )
                Text(
                    text = "Launcher settings",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onOpenSettings)
                )
                if (!isDefaultLauncher) {
                    Text(
                        text = "Set as default launcher →",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 14.sp,
                        color = HudAmber,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onRequestDefaultLauncher)
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = stringResource(R.string.action_cancel),
                    fontFamily = FontFamily.Monospace,
                    color = DimGray
                )
            }
        }
    )
}

@Composable
private fun DockAppOptionsDialog(
    item: PinnedAppItem,
    onRemoveFromDock: () -> Unit,
    onSetLimit: () -> Unit,
    onAppInfo: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = PillSurface,
        title = {
            Text(
                text = "${item.label} (Dock)",
                fontFamily = FontFamily.Monospace,
                fontSize = 16.sp,
                color = PureWhite
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text(
                    text = "Set daily time cap (${item.timeLimitMinutes}m)",
                    fontFamily = FontFamily.Monospace,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onSetLimit)
                )
                Text(
                    text = "App info",
                    fontFamily = FontFamily.Monospace,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onAppInfo)
                )
                Text(
                    text = "Remove from dock",
                    fontFamily = FontFamily.Monospace,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onRemoveFromDock)
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = stringResource(R.string.action_cancel),
                    fontFamily = FontFamily.Monospace,
                    color = DimGray
                )
            }
        }
    )
}

@Composable
private fun PinnedOptionsDialog(
    pin: PinnedAppItem,
    canMoveUp: Boolean,
    canMoveDown: Boolean,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onRename: () -> Unit,
    onSetLimit: () -> Unit,
    onUnpin: () -> Unit,
    onAppInfo: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = PillSurface,
        title = {
            Text(
                text = pin.label,
                fontFamily = FontFamily.Monospace,
                fontSize = 16.sp,
                color = PureWhite
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                if (canMoveUp) {
                    Text(
                        text = stringResource(R.string.action_move_up),
                        fontFamily = FontFamily.Monospace,
                        color = PureWhite,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onMoveUp)
                    )
                }
                if (canMoveDown) {
                    Text(
                        text = stringResource(R.string.action_move_down),
                        fontFamily = FontFamily.Monospace,
                        color = PureWhite,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onMoveDown)
                    )
                }
                Text(
                    text = "Set daily time cap (${pin.timeLimitMinutes}m)",
                    fontFamily = FontFamily.Monospace,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onSetLimit)
                )
                Text(
                    text = stringResource(R.string.action_rename),
                    fontFamily = FontFamily.Monospace,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onRename)
                )
                Text(
                    text = "App info",
                    fontFamily = FontFamily.Monospace,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onAppInfo)
                )
                Text(
                    text = stringResource(R.string.action_unpin),
                    fontFamily = FontFamily.Monospace,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onUnpin)
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = stringResource(R.string.action_cancel),
                    fontFamily = FontFamily.Monospace,
                    color = DimGray
                )
            }
        }
    )
}

@Composable
private fun SetTimeLimitDialog(
    currentLimitMinutes: Int,
    onSelectLimit: (Int) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = PillSurface,
        title = {
            Text(
                text = "DAILY TIME CAP",
                fontFamily = FontFamily.Monospace,
                fontSize = 16.sp,
                color = PureWhite
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                listOf(15, 30, 45, 60, 90).forEach { mins ->
                    val isSelected = mins == currentLimitMinutes
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelectLimit(mins) }
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "$mins minutes",
                            fontFamily = FontFamily.Monospace,
                            color = if (isSelected) PureWhite else DimGray
                        )
                        if (isSelected) {
                            Text(
                                text = "[✓]",
                                fontFamily = FontFamily.Monospace,
                                color = PureWhite
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = stringResource(R.string.action_cancel),
                    fontFamily = FontFamily.Monospace,
                    color = DimGray
                )
            }
        }
    )
}

@Composable
private fun RenameDialog(
    currentText: String,
    error: String?,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var text by remember { mutableStateOf(currentText) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = PillSurface,
        title = {
            Text(
                text = stringResource(R.string.rename_dialog_title),
                fontFamily = FontFamily.Monospace,
                fontSize = 16.sp,
                color = PureWhite
            )
        },
        text = {
            Column {
                BasicTextField(
                    value = text,
                    onValueChange = { text = it },
                    singleLine = true,
                    cursorBrush = SolidColor(PureWhite),
                    textStyle = FocusTypography.bodyMedium.copy(
                        fontFamily = FontFamily.Monospace,
                        color = PureWhite
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(onDone = { onConfirm(text) }),
                    modifier = Modifier.fillMaxWidth()
                )
                if (error != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = error,
                        fontFamily = FontFamily.Monospace,
                        style = FocusTypography.bodySmall,
                        color = DimGray
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { onConfirm(text) }) {
                Text(
                    text = stringResource(R.string.rename_dialog_save),
                    fontFamily = FontFamily.Monospace,
                    color = PureWhite
                )
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = stringResource(R.string.rename_dialog_cancel),
                    fontFamily = FontFamily.Monospace,
                    color = DimGray
                )
            }
        }
    )
}
