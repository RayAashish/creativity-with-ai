// app/src/main/java/com/raysi/launcher/ui/home/HomeScreen.kt
package com.raysi.launcher.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.raysi.launcher.R
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.ui.home.model.PinnedAppUiModel
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.FocusTypography
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite

/**
 * Minimalist OLED home screen with pinned essentials and Live Usage HUD.
 * Displays max 5 pinned apps (text only, zero icons), dynamic status color, and search trigger.
 */
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    modifier: Modifier = Modifier,
    onOpenDrawer: () -> Unit = {},
    onOpenSettings: () -> Unit = {},
    onOpenQuarantine: () -> Unit = {},
    onRequestDefaultLauncher: () -> Unit = {},
    onOpenUsageAccessSettings: () -> Unit = {},
    onLaunchApp: (AppInfo) -> Unit = {}
) {
    val pinnedApps by viewModel.pinnedApps.collectAsState()
    val isDefaultLauncher by viewModel.isDefaultLauncher.collectAsState()
    val hudState by viewModel.hudState.collectAsState()
    val quarantinedCount by viewModel.quarantinedCount.collectAsState()
    val dialogState by viewModel.dialogState.collectAsState()

    var dragOffsetY by remember { mutableFloatStateOf(0f) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(OledBlack)
            .systemBarsPadding()
            .pointerInput(Unit) {
                detectVerticalDragGestures(
                    onDragStart = { dragOffsetY = 0f },
                    onDragEnd = {
                        if (dragOffsetY < -50f) {
                            onOpenDrawer()
                        }
                    },
                    onVerticalDrag = { change, dragAmount ->
                        change.consume()
                        dragOffsetY += dragAmount
                    }
                )
            }
            .padding(horizontal = 24.dp, vertical = 20.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header / HUD Area
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                if (!isDefaultLauncher) {
                    Text(
                        text = stringResource(R.string.set_default_launcher),
                        style = FocusTypography.bodyMedium,
                        color = DimGray,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onRequestDefaultLauncher)
                            .padding(bottom = 8.dp)
                    )
                }

                val hudClickAction = if (hudState.hasPermission) {
                    onOpenSettings
                } else {
                    onOpenUsageAccessSettings
                }

                Text(
                    text = if (hudState.formattedText.isNotBlank()) {
                        hudState.formattedText
                    } else {
                        stringResource(R.string.hud_loading)
                    },
                    style = FocusTypography.bodyMedium,
                    color = hudState.statusColor,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = hudClickAction)
                )

                if (quarantinedCount > 0) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Quarantined: $quarantinedCount • tap to review",
                        style = FocusTypography.bodySmall,
                        color = DimGray,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onOpenQuarantine)
                    )
                }
            }

            // Center: Pinned Essentials Area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f, fill = false),
                contentAlignment = Alignment.CenterStart
            ) {
                if (pinnedApps.isEmpty()) {
                    Text(
                        text = stringResource(R.string.pinned_empty_hint),
                        style = FocusTypography.bodyMedium,
                        color = DimGray
                    )
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(20.dp)
                    ) {
                        items(
                            items = pinnedApps,
                            key = { it.id }
                        ) { pin ->
                            PinnedAppRow(
                                pin = pin,
                                onClick = {
                                    val app = viewModel.getAppInfoForPin(pin)
                                    if (app != null) {
                                        onLaunchApp(app)
                                    } else {
                                        viewModel.onAppClick(pin)
                                    }
                                },
                                onLongClick = { viewModel.onPinLongClick(pin) }
                            )
                        }
                    }
                }
            }

            // Bottom: Search Drawer Trigger & Settings Link
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.search_hint),
                    style = FocusTypography.bodyLarge,
                    color = PureWhite,
                    modifier = Modifier.clickable(onClick = onOpenDrawer)
                )

                Text(
                    text = "settings",
                    style = FocusTypography.bodySmall,
                    color = DimGray,
                    modifier = Modifier
                        .clickable(onClick = onOpenSettings)
                        .padding(8.dp)
                )
            }
        }
    }

    // Dialogs for Pin Actions
    when (val state = dialogState) {
        is HomeDialogState.Options -> {
            PinnedOptionsDialog(
                pin = state.pin,
                canMoveUp = state.canMoveUp,
                canMoveDown = state.canMoveDown,
                onMoveUp = { viewModel.onMoveUp(state.pin) },
                onMoveDown = { viewModel.onMoveDown(state.pin) },
                onRename = { viewModel.onStartRename(state.pin) },
                onUnpin = { viewModel.onUnpin(state.pin) },
                onDismiss = { viewModel.dismissDialog() }
            )
        }
        is HomeDialogState.Rename -> {
            RenamePinDialog(
                pin = state.pin,
                initialText = state.currentText,
                error = state.error,
                onConfirm = { newName -> viewModel.onConfirmRename(state.pin, newName) },
                onDismiss = { viewModel.dismissDialog() }
            )
        }
        HomeDialogState.None -> Unit
    }
}

@Composable
private fun PinnedAppRow(
    pin: PinnedAppUiModel,
    onClick: () -> Unit,
    onLongClick: () -> Unit
) {
    val textBuilder = StringBuilder(pin.displayLabel)
    if (pin.usageDurationFormatted != null) {
        textBuilder.append(" (").append(pin.usageDurationFormatted).append(")")
    }
    if (pin.isWorkProfile) {
        textBuilder.append(" ").append(stringResource(R.string.work_profile_indicator))
    }
    if (!pin.isInstalled) {
        textBuilder.append(" ").append(stringResource(R.string.uninstalled_indicator))
    }

    Text(
        text = textBuilder.toString(),
        style = FocusTypography.headlineMedium,
        color = if (pin.isInstalled) PureWhite else DimGray,
        modifier = Modifier
            .fillMaxWidth()
            .pointerInput(pin.id) {
                detectTapGestures(
                    onTap = { onClick() },
                    onLongPress = { onLongClick() }
                )
            }
    )
}

@Composable
private fun PinnedOptionsDialog(
    pin: PinnedAppUiModel,
    canMoveUp: Boolean,
    canMoveDown: Boolean,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onRename: () -> Unit,
    onUnpin: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = OledBlack,
        title = {
            Text(
                text = pin.displayLabel,
                style = FocusTypography.titleLarge,
                color = PureWhite
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (canMoveUp) {
                    Text(
                        text = stringResource(R.string.action_move_up),
                        style = FocusTypography.bodyLarge,
                        color = PureWhite,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onMoveUp)
                    )
                }
                if (canMoveDown) {
                    Text(
                        text = stringResource(R.string.action_move_down),
                        style = FocusTypography.bodyLarge,
                        color = PureWhite,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onMoveDown)
                    )
                }
                Text(
                    text = stringResource(R.string.action_rename),
                    style = FocusTypography.bodyLarge,
                    color = PureWhite,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onRename)
                )
                Text(
                    text = stringResource(R.string.action_unpin),
                    style = FocusTypography.bodyLarge,
                    color = DimGray,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onUnpin)
                )
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = stringResource(R.string.action_cancel),
                    style = FocusTypography.labelLarge,
                    color = DimGray
                )
            }
        }
    )
}

@Composable
private fun RenamePinDialog(
    pin: PinnedAppUiModel,
    initialText: String,
    error: String?,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var text by remember(pin.id) { mutableStateOf(initialText) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = OledBlack,
        title = {
            Text(
                text = stringResource(R.string.rename_dialog_title),
                style = FocusTypography.titleLarge,
                color = PureWhite
            )
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                BasicTextField(
                    value = text,
                    onValueChange = {
                        if (it.length <= 24) {
                            text = it
                        }
                    },
                    textStyle = FocusTypography.bodyLarge.copy(color = PureWhite),
                    cursorBrush = SolidColor(PureWhite),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(onDone = { onConfirm(text) }),
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(OledBlack)
                        .padding(vertical = 8.dp)
                )
                if (error != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = error,
                        style = FocusTypography.labelMedium,
                        color = DimGray
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { onConfirm(text) }) {
                Text(
                    text = stringResource(R.string.rename_dialog_save),
                    style = FocusTypography.labelLarge,
                    color = PureWhite
                )
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = stringResource(R.string.rename_dialog_cancel),
                    style = FocusTypography.labelLarge,
                    color = DimGray
                )
            }
        }
    )
}
