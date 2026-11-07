// app/src/main/java/com/raysi/launcher/ui/drawer/DrawerScreen.kt
package com.raysi.launcher.ui.drawer

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.raysi.launcher.R
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.FocusTypography
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite

/**
 * Keyboard-first minimalist app drawer.
 * Automatically requests focus and brings up the IME without layout jump.
 * Real-time zero-allocation search results with stable keys.
 */
@Composable
fun DrawerScreen(
    viewModel: DrawerViewModel,
    modifier: Modifier = Modifier,
    onCloseDrawer: () -> Unit = {},
    onLaunchApp: (AppInfo) -> Unit = { viewModel.launchApp(it) }
) {
    val query by viewModel.query.collectAsState()
    val searchResults by viewModel.searchResults.collectAsState()
    val dialogState by viewModel.dialogState.collectAsState()

    val focusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current

    // Predictive back / Back gesture handling: close drawer and dismiss keyboard
    BackHandler {
        keyboardController?.hide()
        viewModel.closeDrawer()
        onCloseDrawer()
    }

    // Automatically focus text field and open keyboard on drawer launch
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
        keyboardController?.show()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(OledBlack)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .imePadding()
                .padding(horizontal = 24.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Top Search Input Field
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                if (query.isEmpty()) {
                    Text(
                        text = stringResource(R.string.search_placeholder),
                        style = FocusTypography.bodyLarge,
                        color = DimGray
                    )
                }

                BasicTextField(
                    value = query,
                    onValueChange = { viewModel.onQueryChange(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(focusRequester),
                    textStyle = FocusTypography.bodyLarge.copy(color = PureWhite),
                    cursorBrush = SolidColor(PureWhite),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(
                        imeAction = ImeAction.Go
                    ),
                    keyboardActions = KeyboardActions(
                        onGo = {
                            keyboardController?.hide()
                            val top = searchResults.firstOrNull()
                            if (top != null) {
                                viewModel.closeDrawer()
                                onLaunchApp(top)
                            }
                        },
                        onDone = {
                            keyboardController?.hide()
                            val top = searchResults.firstOrNull()
                            if (top != null) {
                                viewModel.closeDrawer()
                                onLaunchApp(top)
                            }
                        }
                    )
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // App List or Empty Results
            if (searchResults.isEmpty() && query.isNotBlank()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.CenterStart
                ) {
                    Text(
                        text = stringResource(R.string.no_apps_found),
                        style = FocusTypography.bodyMedium,
                        color = DimGray
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    items(
                        items = searchResults,
                        key = { it.uniqueKey }
                    ) { app ->
                        DrawerAppRow(
                            app = app,
                            onClick = {
                                keyboardController?.hide()
                                viewModel.closeDrawer()
                                onLaunchApp(app)
                            },
                            onLongClick = {
                                viewModel.onAppLongClick(app)
                            }
                        )
                    }
                }
            }
        }
    }

    // App Options Dialog (Pin/Unpin)
    when (val state = dialogState) {
        is DrawerDialogState.AppOptions -> {
            AppOptionsDialog(
                state = state,
                onPin = { viewModel.pinApp(state.app) },
                onUnpin = { viewModel.unpinApp(state.app) },
                onDismiss = { viewModel.dismissDialog() }
            )
        }
        DrawerDialogState.None -> Unit
    }
}

@Composable
private fun DrawerAppRow(
    app: AppInfo,
    onClick: () -> Unit,
    onLongClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .pointerInput(app.uniqueKey) {
                detectTapGestures(
                    onTap = { onClick() },
                    onLongPress = { onLongClick() }
                )
            }
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = app.label,
            style = FocusTypography.bodyLarge,
            color = PureWhite,
            modifier = Modifier.weight(1f, fill = false)
        )

        if (app.isWorkProfile) {
            Text(
                text = " ${stringResource(R.string.work_profile_indicator)}",
                style = FocusTypography.bodyMedium,
                color = DimGray
            )
        }
    }
}

@Composable
private fun AppOptionsDialog(
    state: DrawerDialogState.AppOptions,
    onPin: () -> Unit,
    onUnpin: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = OledBlack,
        title = {
            Text(
                text = state.app.label,
                style = FocusTypography.bodyLarge,
                color = PureWhite
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (state.isPinned) {
                    TextButton(
                        onClick = onUnpin,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = stringResource(R.string.action_unpin),
                            color = PureWhite,
                            style = FocusTypography.bodyMedium
                        )
                    }
                } else if (state.canPin) {
                    TextButton(
                        onClick = onPin,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = stringResource(R.string.action_pin_to_home),
                            color = PureWhite,
                            style = FocusTypography.bodyMedium
                        )
                    }
                } else {
                    Text(
                        text = stringResource(R.string.pin_limit_reached),
                        color = DimGray,
                        style = FocusTypography.bodyMedium
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = stringResource(R.string.action_cancel),
                    color = DimGray,
                    style = FocusTypography.bodyMedium
                )
            }
        }
    )
}
