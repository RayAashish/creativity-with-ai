// app/src/main/java/com/raysi/launcher/ui/drawer/DrawerScreen.kt
package com.raysi.launcher.ui.drawer

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.displayCutout
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.union
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.R
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.domain.model.AppIconMode
import com.raysi.launcher.ui.components.AppIconImage
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.FocusTypography
import com.raysi.launcher.ui.theme.HudAmber
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite
import kotlinx.coroutines.launch

private val DrawerSurface = Color(0xFF0E0E0E)
private val DrawerBorder = Color(0xFF242424)

/**
 * Full-featured minimalist app drawer with:
 * - Fast Rust NDK / Kotlin search pill
 * - Real / Monochrome app icons
 * - Right-edge interactive A-Z alphabetical fast-scrubber rail
 * - Long-press options (Pin to Home, Pin to Dock, Gate app, App Info, Uninstall)
 */
@Composable
fun DrawerScreen(
    viewModel: DrawerViewModel,
    modifier: Modifier = Modifier,
    onCloseDrawer: () -> Unit = {},
    onLaunchApp: (AppInfo) -> Unit = { viewModel.launchApp(it) }
) {
    val context = LocalContext.current
    val query by viewModel.query.collectAsState()
    val searchResults by viewModel.searchResults.collectAsState()
    val dialogState by viewModel.dialogState.collectAsState()
    val appIconMode by viewModel.appIconMode.collectAsState()
    val focusSearchOnOpen by viewModel.focusSearchOnOpen.collectAsState()
    val pinnedKeys by viewModel.pinnedKeys.collectAsState()
    val dockKeys by viewModel.dockKeys.collectAsState()
    val distractingPkgs by viewModel.distractingPackages.collectAsState()

    val focusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    var activeScrubLetter by remember { mutableStateOf<Char?>(null) }

    val alphabetIndexMap = remember(searchResults) {
        val map = LinkedHashMap<Char, Int>()
        searchResults.forEachIndexed { idx, app ->
            val first = app.label.firstOrNull()?.uppercaseChar()
            val bucket = if (first != null && first in 'A'..'Z') first else '#'
            if (!map.containsKey(bucket)) {
                map[bucket] = idx
            }
        }
        map
    }
    val letters = remember(alphabetIndexMap) { alphabetIndexMap.keys.toList() }

    BackHandler {
        keyboardController?.hide()
        viewModel.closeDrawer()
        onCloseDrawer()
    }

    LaunchedEffect(focusSearchOnOpen) {
        if (focusSearchOnOpen) {
            focusRequester.requestFocus()
            keyboardController?.show()
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(OledBlack)
            .windowInsetsPadding(WindowInsets.statusBars.union(WindowInsets.displayCutout))
            .navigationBarsPadding()
            .imePadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(start = 20.dp, end = 8.dp, top = 12.dp, bottom = 8.dp)
        ) {
            // Top Search Bar + Close Action
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(end = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(24.dp))
                        .background(DrawerSurface)
                        .border(1.dp, DrawerBorder, RoundedCornerShape(24.dp))
                        .clickable {
                            focusRequester.requestFocus()
                            keyboardController?.show()
                        }
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
                        if (query.isEmpty()) {
                            Text(
                                text = stringResource(R.string.search_placeholder),
                                fontFamily = FontFamily.Monospace,
                                fontSize = 14.sp,
                                color = DimGray
                            )
                        }

                        BasicTextField(
                            value = query,
                            onValueChange = { viewModel.onQueryChange(it) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .focusRequester(focusRequester),
                            textStyle = FocusTypography.bodyMedium.copy(
                                fontFamily = FontFamily.Monospace,
                                fontSize = 14.sp,
                                color = PureWhite
                            ),
                            cursorBrush = SolidColor(PureWhite),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Go),
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

                    if (query.isNotEmpty()) {
                        Text(
                            text = "[×]",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 13.sp,
                            color = DimGray,
                            modifier = Modifier
                                .clickable { viewModel.onQueryChange("") }
                                .padding(start = 8.dp)
                        )
                    }
                }

                Text(
                    text = "[↓]",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    color = DimGray,
                    modifier = Modifier
                        .clickable {
                            keyboardController?.hide()
                            viewModel.closeDrawer()
                            onCloseDrawer()
                        }
                        .padding(horizontal = 6.dp, vertical = 10.dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Main Drawer Body: Scrollable App List + Right A-Z Scrubber
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                if (searchResults.isEmpty() && query.isNotBlank()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(end = 24.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Text(
                            text = stringResource(R.string.no_apps_found),
                            style = FocusTypography.bodyMedium,
                            color = DimGray
                        )
                    }
                } else {
                    Row(modifier = Modifier.fillMaxSize()) {
                        LazyColumn(
                            state = listState,
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight(),
                            verticalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            items(
                                items = searchResults,
                                key = { it.uniqueKey }
                            ) { app ->
                                DrawerAppRow(
                                    app = app,
                                    iconMode = appIconMode,
                                    isPinned = pinnedKeys.contains(app.uniqueKey),
                                    isInDock = dockKeys.contains(app.uniqueKey),
                                    isDistracting = distractingPkgs.contains(app.packageName),
                                    onClick = {
                                        keyboardController?.hide()
                                        viewModel.closeDrawer()
                                        onLaunchApp(app)
                                    },
                                    onLongClick = {
                                        keyboardController?.hide()
                                        viewModel.onAppLongClick(app)
                                    }
                                )
                            }
                        }

                        if (query.isBlank() && letters.size > 2) {
                            AlphabetScrubberRail(
                                letters = letters,
                                activeLetter = activeScrubLetter,
                                onSelectLetter = { letter ->
                                    activeScrubLetter = letter
                                    val idx = alphabetIndexMap[letter]
                                    if (idx != null) {
                                        scope.launch { listState.scrollToItem(idx) }
                                    }
                                },
                                onScrubEnd = {
                                    activeScrubLetter = null
                                }
                            )
                        }
                    }
                }

                // Floating Scrub Letter Bubble when dragging A-Z rail
                activeScrubLetter?.let { letter ->
                    Box(
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .padding(end = 44.dp)
                            .size(56.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFF1A1A1A))
                            .border(1.dp, PureWhite.copy(alpha = 0.4f), RoundedCornerShape(14.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = letter.toString(),
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp,
                            color = PureWhite
                        )
                    }
                }
            }
        }
    }

    // Rich App Options Dialog (Pin Home, Dock, Launch Gate, App Info, Uninstall)
    when (val state = dialogState) {
        is DrawerDialogState.AppOptions -> {
            AppOptionsDialog(
                state = state,
                onPin = { viewModel.pinApp(state.app) },
                onUnpin = { viewModel.unpinApp(state.app) },
                onPinDock = { viewModel.pinToDock(state.app) },
                onUnpinDock = { viewModel.unpinFromDock(state.app) },
                onToggleDistracting = { viewModel.toggleDistractingPackage(state.app) },
                onAppInfo = {
                    viewModel.dismissDialog()
                    try {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.fromParts("package", state.app.packageName, null)
                        }
                        context.startActivity(intent)
                    } catch (_: Exception) {}
                },
                onUninstall = {
                    viewModel.dismissDialog()
                    try {
                        val intent = Intent(Intent.ACTION_DELETE).apply {
                            data = Uri.parse("package:${state.app.packageName}")
                        }
                        context.startActivity(intent)
                    } catch (_: Exception) {}
                },
                onDismiss = { viewModel.dismissDialog() }
            )
        }
        DrawerDialogState.None -> Unit
    }
}

@Composable
private fun AlphabetScrubberRail(
    letters: List<Char>,
    activeLetter: Char?,
    onSelectLetter: (Char) -> Unit,
    onScrubEnd: () -> Unit
) {
    var railHeightPx by remember { mutableIntStateOf(1) }

    Column(
        modifier = Modifier
            .width(26.dp)
            .fillMaxHeight()
            .onSizeChanged { railHeightPx = it.height.coerceAtLeast(1) }
            .pointerInput(letters) {
                detectTapGestures { offset ->
                    val idx = ((offset.y / railHeightPx.toFloat()) * letters.size)
                        .toInt()
                        .coerceIn(0, letters.lastIndex)
                    onSelectLetter(letters[idx])
                    onScrubEnd()
                }
            }
            .pointerInput(letters) {
                detectVerticalDragGestures(
                    onDragStart = { offset ->
                        val idx = ((offset.y / railHeightPx.toFloat()) * letters.size)
                            .toInt()
                            .coerceIn(0, letters.lastIndex)
                        onSelectLetter(letters[idx])
                    },
                    onVerticalDrag = { change, _ ->
                        change.consume()
                        val idx = ((change.position.y / railHeightPx.toFloat()) * letters.size)
                            .toInt()
                            .coerceIn(0, letters.lastIndex)
                        onSelectLetter(letters[idx])
                    },
                    onDragEnd = { onScrubEnd() },
                    onDragCancel = { onScrubEnd() }
                )
            }
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceEvenly
    ) {
        letters.forEach { ch ->
            val isActive = ch == activeLetter
            Text(
                text = ch.toString(),
                fontFamily = FontFamily.Monospace,
                fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                fontSize = if (isActive) 12.sp else 10.sp,
                color = if (isActive) PureWhite else DimGray
            )
        }
    }
}

@Composable
private fun DrawerAppRow(
    app: AppInfo,
    iconMode: AppIconMode,
    isPinned: Boolean,
    isInDock: Boolean,
    isDistracting: Boolean,
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
            .padding(vertical = 8.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (iconMode != AppIconMode.TEXT_ONLY) {
            AppIconImage(
                packageName = app.packageName,
                className = app.className,
                label = app.label,
                iconMode = iconMode,
                userHandle = app.userHandle,
                size = 38.dp
            )
            Spacer(modifier = Modifier.width(14.dp))
        }

        Text(
            text = app.label,
            fontFamily = FontFamily.Monospace,
            fontSize = 16.sp,
            color = PureWhite,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f, fill = false)
        )

        if (app.isWorkProfile) {
            Text(
                text = " ${stringResource(R.string.work_profile_indicator)}",
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                color = DimGray
            )
        }

        if (isPinned || isInDock) {
            Text(
                text = if (isInDock) " [dock]" else " [home]",
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp,
                color = DimGray
            )
        }

        if (isDistracting) {
            Text(
                text = " [gated]",
                fontFamily = FontFamily.Monospace,
                fontSize = 11.sp,
                color = HudAmber
            )
        }
    }
}

@Composable
private fun AppOptionsDialog(
    state: DrawerDialogState.AppOptions,
    onPin: () -> Unit,
    onUnpin: () -> Unit,
    onPinDock: () -> Unit,
    onUnpinDock: () -> Unit,
    onToggleDistracting: () -> Unit,
    onAppInfo: () -> Unit,
    onUninstall: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = DrawerSurface,
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
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (state.isPinned) {
                    Text(
                        text = stringResource(R.string.action_unpin),
                        color = PureWhite,
                        style = FocusTypography.bodyMedium,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onUnpin)
                            .padding(vertical = 4.dp)
                    )
                } else if (state.canPin) {
                    Text(
                        text = stringResource(R.string.action_pin_to_home),
                        color = PureWhite,
                        style = FocusTypography.bodyMedium,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onPin)
                            .padding(vertical = 4.dp)
                    )
                }

                if (state.isInDock) {
                    Text(
                        text = "Remove from bottom dock",
                        color = PureWhite,
                        style = FocusTypography.bodyMedium,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onUnpinDock)
                            .padding(vertical = 4.dp)
                    )
                } else if (state.canPinToDock) {
                    Text(
                        text = "Add to bottom dock",
                        color = PureWhite,
                        style = FocusTypography.bodyMedium,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onPinDock)
                            .padding(vertical = 4.dp)
                    )
                }

                Text(
                    text = if (state.isDistracting) "Remove Launch Gate limit" else "Gate app (Breathing countdown)",
                    color = if (state.isDistracting) HudAmber else PureWhite,
                    style = FocusTypography.bodyMedium,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onToggleDistracting)
                        .padding(vertical = 4.dp)
                )

                Text(
                    text = "App info",
                    color = PureWhite,
                    style = FocusTypography.bodyMedium,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onAppInfo)
                        .padding(vertical = 4.dp)
                )

                Text(
                    text = "Uninstall app",
                    color = DimGray,
                    style = FocusTypography.bodyMedium,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(onClick = onUninstall)
                        .padding(vertical = 4.dp)
                )
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
