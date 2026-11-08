// app/src/main/java/com/raysi/launcher/ui/home/HomeScreen.kt
package com.raysi.launcher.ui.home

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.R
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.domain.model.PinnedAppItem
import com.raysi.launcher.service.FocusAccessibilityService
import com.raysi.launcher.ui.gesture.homeGestureDetector
import com.raysi.launcher.ui.home.components.DailyFocusLine
import com.raysi.launcher.ui.home.components.DayProgressBar
import com.raysi.launcher.ui.home.components.PinnedAppsList
import com.raysi.launcher.ui.home.components.TelemetryHud
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.FocusTypography
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    modifier: Modifier = Modifier,
    onOpenDrawer: () -> Unit = {},
    onOpenSettings: () -> Unit = {},
    onOpenQuarantine: () -> Unit = {},
    onOpenScratchpad: () -> Unit = {},
    onRequestDefaultLauncher: () -> Unit = {},
    onOpenUsageAccessSettings: () -> Unit = {},
    onLaunchApp: (AppInfo) -> Unit = {}
) {
    val telemetryState by viewModel.telemetryUiState.collectAsState()
    val dailyProgress by viewModel.dailyProgress.collectAsState()
    val dailyFocusGoal by viewModel.dailyFocusGoal.collectAsState()
    val pinnedApps by viewModel.pinnedApps.collectAsState()
    val isDefaultLauncher by viewModel.isDefaultLauncher.collectAsState()
    val isStealthMode by viewModel.isStealthMode.collectAsState()
    val customStatusBarLine by viewModel.customStatusBarLine.collectAsState()
    val dialogState by viewModel.dialogState.collectAsState()

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(OledBlack)
            .statusBarsPadding()
            .navigationBarsPadding()
            .homeGestureDetector(
                onSwipeUp = onOpenDrawer,
                onSwipeDown = onOpenScratchpad,
                onSwipeLeft = onOpenSettings,
                onDoubleTap = {
                    FocusAccessibilityService.lockScreen()
                },
                onLongPress = {
                    onOpenDrawer()
                }
            )
            .padding(horizontal = 24.dp, vertical = 16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // TOP ZONE: Themed Status Bar (Mode B) + Header + Telemetry HUD + Memento Mori Day Progress Bar
            Column(modifier = Modifier.fillMaxWidth()) {
                if (!isStealthMode && customStatusBarLine.isNotBlank()) {
                    Text(
                        text = customStatusBarLine,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = DimGray,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                    )
                }

                if (!isDefaultLauncher) {
                    Text(
                        text = stringResource(R.string.set_default_launcher),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 13.sp,
                        color = DimGray,
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

            // CENTER ZONE: Focus Goal + Pinned Essentials
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                DailyFocusLine(
                    focusGoal = dailyFocusGoal,
                    onSaveFocusGoal = { viewModel.saveFocusGoal(it) }
                )

                Spacer(modifier = Modifier.height(28.dp))

                PinnedAppsList(
                    pinnedApps = pinnedApps,
                    onLaunchApp = { pin ->
                        val app = viewModel.getAppInfoForPin(pin)
                        if (app != null) {
                            onLaunchApp(app)
                        }
                    },
                    onLongClickApp = { pin ->
                        viewModel.onPinLongClick(pin)
                    }
                )
            }

            Spacer(modifier = Modifier.weight(1.2f))
        }
    }

    // Pinned App Action Dialogs
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
private fun PinnedOptionsDialog(
    pin: PinnedAppItem,
    canMoveUp: Boolean,
    canMoveDown: Boolean,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onRename: () -> Unit,
    onSetLimit: () -> Unit,
    onUnpin: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = OledBlack,
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
        containerColor = OledBlack,
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
        containerColor = OledBlack,
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
