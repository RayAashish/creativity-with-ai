package com.antigravity.note.ui.dsa

import android.view.View
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AspectRatio
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DragHandle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Opacity
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.antigravity.note.library.db.PageEntity
import com.antigravity.note.library.model.TestCaseItem
import com.antigravity.note.ui.settings.AppSettings
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.math.roundToInt

@Composable
fun FloatingDsaProblemWindow(
    page: PageEntity,
    onUpdatePage: (PageEntity) -> Unit,
    onCloseWindow: () -> Unit,
    onInsertTraceTable: (() -> Unit)? = null,
    isAppDark: Boolean = false,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val appSettings = remember { AppSettings(context) }
    var isWindowDark by remember(page.pageId, isAppDark) {
        mutableStateOf(appSettings.isFloatingWindowDarkMode ?: isAppDark)
    }

    val coroutineScope = rememberCoroutineScope()
    val configuration = LocalConfiguration.current
    val density = LocalDensity.current

    val screenWidthPx = with(density) { configuration.screenWidthDp.dp.toPx() }
    val screenHeightPx = with(density) { configuration.screenHeightDp.dp.toPx() }

    // Position State (Initialized from DB, clamped safely to screen)
    var offsetX by remember(page.pageId) {
        mutableFloatStateOf(page.descriptionWindowX.coerceIn(0f, maxOf(100f, screenWidthPx - 300f)))
    }
    var offsetY by remember(page.pageId) {
        mutableFloatStateOf(page.descriptionWindowY.coerceIn(0f, maxOf(100f, screenHeightPx - 200f)))
    }

    // Dynamic Resizable Dimensions (Width: 320..950 dp, Height: 260..1000 dp)
    var windowWidthDp by remember(page.pageId) {
        mutableFloatStateOf(page.descriptionWindowWidth.coerceIn(320f, 950f))
    }
    var windowHeightDp by remember(page.pageId) {
        mutableFloatStateOf(page.descriptionWindowHeight.coerceIn(260f, 1000f))
    }

    // Minimized / Expanded State
    var isMinimized by remember(page.pageId) { mutableStateOf(page.isDescriptionMinimized) }

    // Opacity / Ghost Mode (Game Changer for stylus note-taking over problem description)
    var windowAlpha by remember { mutableFloatStateOf(0.98f) }

    // Hints Accordion State
    var showHints by remember { mutableStateOf(false) }
    var activeHintIndex by remember { mutableIntStateOf(0) }
    val hintsList = remember(page.pageId, page.hintsJson) {
        mutableStateListOf<String>().apply {
            val jsonStr = page.hintsJson
            if (!jsonStr.isNullOrBlank()) {
                try {
                    addAll(Json.decodeFromString<List<String>>(jsonStr))
                } catch (_: Exception) {}
            }
        }
    }

    // Content State
    var descriptionHtml by remember(page.pageId) { mutableStateOf(page.problemDescriptionHtml.orEmpty()) }
    var isFetching by remember { mutableStateOf(false) }
    var fetchError by remember { mutableStateOf<String?>(null) }

    // Minimal Test Cases (Checklist ribbon only for user reference)
    val testCases = remember(page.pageId) {
        mutableStateListOf<TestCaseItem>().apply {
            val jsonStr = page.testCasesJson
            if (!jsonStr.isNullOrBlank()) {
                try {
                    addAll(Json.decodeFromString<List<TestCaseItem>>(jsonStr))
                } catch (_: Exception) {}
            }
            if (isEmpty()) {
                // Default 3 standard test checkmarks if none parsed
                add(TestCaseItem(1, "Case 1", "", "", false))
                add(TestCaseItem(2, "Case 2", "", "", false))
                add(TestCaseItem(3, "Case 3", "", "", false))
            }
        }
    }

    // Auto-fetch if sourceUrl is present and description is empty
    LaunchedEffect(page.pageId, page.sourceUrl) {
        val sUrl = page.sourceUrl
        if (descriptionHtml.isBlank() && !sUrl.isNullOrBlank()) {
            isFetching = true
            fetchError = null
            coroutineScope.launch {
                val res = DsaProblemFetcher.fetchProblem(sUrl)
                res.onSuccess { details ->
                    descriptionHtml = details.descriptionHtml
                    testCases.clear()
                    if (details.testCases.isNotEmpty()) {
                        testCases.addAll(details.testCases)
                    } else {
                        testCases.add(TestCaseItem(1, "Case 1", "", "", false))
                        testCases.add(TestCaseItem(2, "Case 2", "", "", false))
                        testCases.add(TestCaseItem(3, "Case 3", "", "", false))
                    }
                    if (details.hints.isNotEmpty()) {
                        hintsList.clear()
                        hintsList.addAll(details.hints)
                    }
                    val jsonStr = Json.encodeToString(testCases.toList())
                    val hintsJsonStr = Json.encodeToString(hintsList.toList())
                    onUpdatePage(
                        page.copy(
                            problemDescriptionHtml = details.descriptionHtml,
                            testCasesJson = jsonStr,
                            hintsJson = hintsJsonStr,
                            difficulty = details.difficulty ?: page.difficulty
                        )
                    )
                }.onFailure { err ->
                    fetchError = err.message ?: "Failed to load problem statement"
                }
                isFetching = false
            }
        }
    }

    // Manual Re-fetch Live
    fun reloadFromSource() {
        val url = page.sourceUrl ?: return
        isFetching = true
        fetchError = null
        coroutineScope.launch {
            val res = DsaProblemFetcher.fetchProblem(url)
            res.onSuccess { details ->
                descriptionHtml = details.descriptionHtml
                testCases.clear()
                if (details.testCases.isNotEmpty()) {
                    testCases.addAll(details.testCases)
                } else {
                    testCases.add(TestCaseItem(1, "Case 1", "", "", false))
                    testCases.add(TestCaseItem(2, "Case 2", "", "", false))
                    testCases.add(TestCaseItem(3, "Case 3", "", "", false))
                }
                if (details.hints.isNotEmpty()) {
                    hintsList.clear()
                    hintsList.addAll(details.hints)
                }
                val jsonStr = Json.encodeToString(testCases.toList())
                val hintsJsonStr = Json.encodeToString(hintsList.toList())
                onUpdatePage(
                    page.copy(
                        problemDescriptionHtml = details.descriptionHtml,
                        testCasesJson = jsonStr,
                        hintsJson = hintsJsonStr,
                        difficulty = details.difficulty ?: page.difficulty
                    )
                )
            }.onFailure { err ->
                fetchError = err.message ?: "Failed to load"
            }
            isFetching = false
        }
    }

    var testCaseToEdit by remember { mutableStateOf<TestCaseItem?>(null) }
    var isNewTestCaseDialog by remember { mutableStateOf(false) }

    fun toggleTestCaseCheck(index: Int) {
        if (index in testCases.indices) {
            val old = testCases[index]
            testCases[index] = old.copy(isChecked = !old.isChecked)
            val jsonStr = Json.encodeToString(testCases.toList())
            onUpdatePage(page.copy(testCasesJson = jsonStr))
        }
    }

    fun updateTestCase(updated: TestCaseItem) {
        val idx = testCases.indexOfFirst { it.id == updated.id }
        if (idx != -1) {
            testCases[idx] = updated
            val jsonStr = Json.encodeToString(testCases.toList())
            onUpdatePage(page.copy(testCasesJson = jsonStr))
        }
    }

    fun deleteTestCase(id: Int) {
        testCases.removeAll { it.id == id }
        val jsonStr = Json.encodeToString(testCases.toList())
        onUpdatePage(page.copy(testCasesJson = jsonStr))
    }

    fun openNewTestCaseDialog() {
        val nextId = (testCases.maxOfOrNull { it.id } ?: 0) + 1
        testCaseToEdit = TestCaseItem(nextId, "Case $nextId", "", "", false)
        isNewTestCaseDialog = true
    }

    val difficultyColor = when (page.difficulty?.lowercase()) {
        "easy" -> Color(0xFF146C2E)
        "medium" -> Color(0xFFB26A00)
        "hard" -> Color(0xFFBA1A1A)
        else -> MaterialTheme.colorScheme.primary
    }

    val windowBg = if (isWindowDark) Color(0xFF1E1F24) else Color(0xFFFFFFFF)
    val headerBg = if (isWindowDark) Color(0xFF26272E) else Color(0xFFF0F2F6)
    val ribbonBg = if (isWindowDark) Color(0xFF26272E).copy(alpha = 0.95f) else Color(0xFFF0F2F6).copy(alpha = 0.95f)
    val headerTextColor = if (isWindowDark) Color(0xFFF0F0F4) else Color(0xFF1B1B1F)
    val borderColor = if (isWindowDark) Color(0xFF3E404D) else Color(0xFFD6D9E3)

    Box(
        modifier = modifier
            .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
    ) {
        if (isMinimized) {
            // ================= MINIMIZED FLOATING PILL =================
            Surface(
                shape = RoundedCornerShape(22.dp),
                color = MaterialTheme.colorScheme.surfaceContainerHigh.copy(alpha = 0.95f),
                shadowElevation = 8.dp,
                modifier = Modifier
                    .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(22.dp))
                    .pointerInput(Unit) {
                        detectDragGestures(
                            onDrag = { change, dragAmount ->
                                change.consume()
                                offsetX = (offsetX + dragAmount.x).coerceIn(0f, maxOf(10f, screenWidthPx - 260f))
                                offsetY = (offsetY + dragAmount.y).coerceIn(0f, maxOf(10f, screenHeightPx - 80f))
                            },
                            onDragEnd = {
                                onUpdatePage(page.copy(descriptionWindowX = offsetX, descriptionWindowY = offsetY))
                            }
                        )
                    }
                    .clickable {
                        isMinimized = false
                        onUpdatePage(page.copy(isDescriptionMinimized = false))
                    }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.DragHandle,
                        contentDescription = "Drag Pill",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = page.title,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    page.difficulty?.let { diff ->
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = difficultyColor.copy(alpha = 0.16f)
                        ) {
                            Text(
                                text = diff,
                                color = difficultyColor,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    val checkedCount = testCases.count { it.isChecked }
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = if (checkedCount == testCases.size && testCases.isNotEmpty()) Color(0xFF146C2E).copy(alpha = 0.15f) else MaterialTheme.colorScheme.secondaryContainer
                    ) {
                        Text(
                            text = "✓ $checkedCount/${testCases.size}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (checkedCount == testCases.size && testCases.isNotEmpty()) Color(0xFF146C2E) else MaterialTheme.colorScheme.onSecondaryContainer,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    IconButton(
                        onClick = {
                            isMinimized = false
                            onUpdatePage(page.copy(isDescriptionMinimized = false))
                        },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ExpandMore,
                            contentDescription = "Expand Window",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        } else {
            // ================= FULL RESIZABLE FLOATING WINDOW =================
            Card(
                modifier = Modifier
                    .width(windowWidthDp.dp)
                    .height(windowHeightDp.dp),
                shape = RoundedCornerShape(18.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, borderColor),
                colors = CardDefaults.cardColors(
                    containerColor = windowBg.copy(alpha = windowAlpha)
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Column(modifier = Modifier.fillMaxSize()) {
                    // Top Drag Pill Handle (High Contrast visual drag anchor)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(18.dp)
                            .background(headerBg.copy(alpha = 0.7f))
                            .pointerInput(Unit) {
                                detectDragGestures(
                                    onDrag = { change, dragAmount ->
                                        change.consume()
                                        offsetX = (offsetX + dragAmount.x).coerceIn(0f, maxOf(10f, screenWidthPx - 100f))
                                        offsetY = (offsetY + dragAmount.y).coerceIn(0f, maxOf(10f, screenHeightPx - 80f))
                                    },
                                    onDragEnd = {
                                        onUpdatePage(page.copy(descriptionWindowX = offsetX, descriptionWindowY = offsetY))
                                    }
                                )
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .width(44.dp)
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp))
                                .background(MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.45f))
                        )
                    }

                    // Window Header Bar (Draggable across entire surface)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(headerBg)
                            .pointerInput(Unit) {
                                detectDragGestures(
                                    onDrag = { change, dragAmount ->
                                        change.consume()
                                        offsetX = (offsetX + dragAmount.x).coerceIn(0f, maxOf(10f, screenWidthPx - 100f))
                                        offsetY = (offsetY + dragAmount.y).coerceIn(0f, maxOf(10f, screenHeightPx - 80f))
                                    },
                                    onDragEnd = {
                                        onUpdatePage(page.copy(descriptionWindowX = offsetX, descriptionWindowY = offsetY))
                                    }
                                )
                            }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.DragHandle,
                                contentDescription = "Drag to Move",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = page.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = headerTextColor,
                                maxLines = 1
                            )
                            page.difficulty?.let { diff ->
                                Surface(
                                    shape = RoundedCornerShape(5.dp),
                                    color = difficultyColor.copy(alpha = 0.16f)
                                ) {
                                    Text(
                                        text = diff,
                                        color = difficultyColor,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                                    )
                                }
                            }

                            // Hints Button (Game Changer for DSA problem-solving)
                            if (hintsList.isNotEmpty()) {
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (showHints) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier.clickable { showHints = !showHints }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Lightbulb,
                                            contentDescription = "Hints",
                                            tint = if (showHints) MaterialTheme.colorScheme.primary else Color(0xFFB26A00),
                                            modifier = Modifier.size(13.dp)
                                        )
                                        Text(
                                            text = "Hint (${hintsList.size})",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (showHints) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(1.dp)
                        ) {
                            // Dark / Light Mode Toggle for problem window
                            IconButton(
                                onClick = {
                                    val next = !isWindowDark
                                    isWindowDark = next
                                    appSettings.isFloatingWindowDarkMode = next
                                },
                                modifier = Modifier.size(26.dp)
                            ) {
                                Icon(
                                    imageVector = if (isWindowDark) Icons.Default.LightMode else Icons.Default.DarkMode,
                                    contentDescription = if (isWindowDark) "Switch to Light Mode" else "Switch to Dark Mode",
                                    tint = if (isWindowDark) Color(0xFFFFD54F) else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                            }

                            // Ghost / Opacity Mode Toggle (Cycles 0.98 -> 0.65 -> 0.35)
                            IconButton(
                                onClick = {
                                    windowAlpha = when {
                                        windowAlpha > 0.85f -> 0.65f
                                        windowAlpha > 0.50f -> 0.35f
                                        else -> 0.98f
                                    }
                                },
                                modifier = Modifier.size(26.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Opacity,
                                    contentDescription = "Toggle Glassmorphism Opacity",
                                    tint = if (windowAlpha < 0.9f) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                            }

                            if (isFetching) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(14.dp),
                                    strokeWidth = 2.dp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                            } else {
                                IconButton(onClick = { reloadFromSource() }, modifier = Modifier.size(26.dp)) {
                                    Icon(
                                        imageVector = Icons.Default.Refresh,
                                        contentDescription = "Sync from URL",
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            // Minimize Button
                            IconButton(
                                onClick = {
                                    isMinimized = true
                                    onUpdatePage(page.copy(isDescriptionMinimized = true))
                                },
                                modifier = Modifier.size(26.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ExpandLess,
                                    contentDescription = "Minimize Window",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                            }

                            // Close Button
                            IconButton(onClick = onCloseWindow, modifier = Modifier.size(26.dp)) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Close Window",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    // Progressive Hints Drawer
                    AnimatedVisibility(
                        visible = showHints && hintsList.isNotEmpty(),
                        enter = fadeIn() + expandVertically(),
                        exit = fadeOut() + shrinkVertically()
                    ) {
                        Surface(
                            color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.85f),
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 4.dp),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "💡 Hint ${activeHintIndex + 1} of ${hintsList.size}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSecondaryContainer
                                    )
                                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        if (activeHintIndex > 0) {
                                            Text(
                                                text = "◀ Prev",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = MaterialTheme.colorScheme.primary,
                                                modifier = Modifier.clickable { activeHintIndex-- }
                                            )
                                        }
                                        if (activeHintIndex < hintsList.size - 1) {
                                            Text(
                                                text = "Next Hint ▶",
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = MaterialTheme.colorScheme.primary,
                                                modifier = Modifier.clickable { activeHintIndex++ }
                                            )
                                        }
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = hintsList.getOrElse(activeHintIndex) { "" },
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSecondaryContainer,
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }

                    HorizontalDivider(thickness = 0.6.dp, color = MaterialTheme.colorScheme.outlineVariant)

                    // Error Banner if needed
                    if (fetchError != null && descriptionHtml.isBlank()) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.errorContainer,
                            modifier = Modifier.fillMaxWidth().padding(8.dp)
                        ) {
                            Text(
                                text = "⚠️ $fetchError",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onErrorContainer,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }

                    // Problem Statement Body: Direct Native WebView Momentum Scrolling (WEIGHT 1f)
                    // Zero nested-scroll conflicts! Smooth, continuous flick scrolling through full statement,
                    // code blocks, examples, and images!
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .background(Color.Transparent)
                    ) {
                        if (descriptionHtml.isNotBlank()) {
                            AndroidView(
                                factory = { ctx ->
                                    WebView(ctx).apply {
                                        setLayerType(View.LAYER_TYPE_HARDWARE, null)
                                        isVerticalScrollBarEnabled = true
                                        isHorizontalScrollBarEnabled = false
                                        overScrollMode = View.OVER_SCROLL_IF_CONTENT_SCROLLS
                                        settings.apply {
                                            javaScriptEnabled = false
                                            loadWithOverviewMode = true
                                            useWideViewPort = false
                                            domStorageEnabled = false
                                        }
                                        setBackgroundColor(0x00000000)
                                        webViewClient = WebViewClient()
                                    }
                                },
                                update = { webView ->
                                    val textColor = if (isWindowDark) "#F0F0F4" else "#1B1B1F"
                                    val codeBg = if (isWindowDark) "#2B2B30" else "#F1F3F8"
                                    val preBorder = if (isWindowDark) "#44444A" else "#D4D7E2"
                                    val bodyBg = if (isWindowDark) "#1E1F24" else "#FFFFFF"
                                    webView.setBackgroundColor(if (isWindowDark) 0xFF1E1F24.toInt() else 0xFFFFFFFF.toInt())

                                    val styledHtml = """
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
                                        <style>
                                            body {
                                                font-family: -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
                                                font-size: 13.5px;
                                                line-height: 1.55;
                                                color: $textColor;
                                                margin: 0;
                                                padding: 12px;
                                                background-color: $bodyBg;
                                                word-break: break-word;
                                            }
                                            img {
                                                max-width: 100%;
                                                height: auto;
                                                border-radius: 8px;
                                                display: block;
                                                margin: 10px auto;
                                                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                                            }
                                            pre {
                                                background-color: $codeBg;
                                                border-radius: 6px;
                                                padding: 8px 10px;
                                                font-family: ui-monospace, SFMono-Regular, monospace;
                                                font-size: 12px;
                                                overflow-x: auto;
                                                border: 1px solid $preBorder;
                                                white-space: pre-wrap;
                                                word-break: break-word;
                                            }
                                            code {
                                                background-color: $codeBg;
                                                padding: 2px 4px;
                                                border-radius: 4px;
                                                font-family: ui-monospace, SFMono-Regular, monospace;
                                                font-size: 12px;
                                            }
                                            ul, ol {
                                                padding-left: 20px;
                                                margin: 6px 0;
                                            }
                                            li {
                                                margin-bottom: 4px;
                                            }
                                            p {
                                                margin: 6px 0;
                                            }
                                            strong {
                                                color: ${if (isWindowDark) "#90CAF9" else "#005AC1"};
                                            }
                                        </style>
                                        </head>
                                        <body>
                                        $descriptionHtml
                                        </body>
                                        </html>
                                    """.trimIndent()
                                    webView.loadDataWithBaseURL("https://leetcode.com", styledHtml, "text/html", "UTF-8", null)
                                },
                                modifier = Modifier.fillMaxSize()
                            )
                        } else if (!isFetching) {
                            Box(
                                modifier = Modifier.fillMaxSize().padding(16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "No description loaded yet.\nTap 🔄 to fetch from URL or paste problem link in Problem Details.",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }

                    HorizontalDivider(thickness = 0.6.dp, color = borderColor)

                    // ================= MINIMAL BOTTOM CONTROLS RIBBON =================
                    // (Takes only ~38 dp height; Minimal testcase checklist, Game-changer trace stamp, Resize thumb)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(ribbonBg)
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Left: Minimal Test Case Checklist Chips (User reference only; actual details in statement)
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier
                                .weight(1f)
                                .horizontalScroll(rememberScrollState())
                        ) {
                            Text(
                                text = "✓ Tests:",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isWindowDark) Color(0xFFBBC7DB) else MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            testCases.forEachIndexed { index, tc ->
                                val isChecked = tc.isChecked
                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = if (isChecked) Color(0xFF146C2E).copy(alpha = 0.18f) else if (isWindowDark) Color(0xFF2E303B) else Color.White,
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        if (isChecked) Color(0xFF146C2E) else borderColor
                                    ),
                                    modifier = Modifier.clickable { toggleTestCaseCheck(index) }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(start = 8.dp, end = 4.dp, top = 3.dp, bottom = 3.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Check,
                                            contentDescription = "Test passed toggle",
                                            tint = if (isChecked) Color(0xFF146C2E) else borderColor,
                                            modifier = Modifier.size(12.dp)
                                        )
                                        Text(
                                            text = tc.title,
                                            fontSize = 11.sp,
                                            fontWeight = if (isChecked) FontWeight.Bold else FontWeight.Normal,
                                            color = if (isChecked) Color(0xFF146C2E) else if (isWindowDark) Color(0xFFE2E2E6) else Color(0xFF1B1B1F)
                                        )
                                        IconButton(
                                            onClick = {
                                                testCaseToEdit = tc
                                                isNewTestCaseDialog = false
                                            },
                                            modifier = Modifier.size(18.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Edit,
                                                contentDescription = "Modify or Delete Test Case",
                                                tint = if (isWindowDark) Color(0xFFAAAAAA) else Color(0xFF757575),
                                                modifier = Modifier.size(10.dp)
                                            )
                                        }
                                    }
                                }
                            }

                            // Add Test Case Chip
                            Surface(
                                shape = CircleShape,
                                color = if (isWindowDark) Color(0xFF3A3C4A) else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .size(24.dp)
                                    .clickable { openNewTestCaseDialog() }
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = "Add Test Case",
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.padding(4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(6.dp))

                        // Middle: Game Changer - Dry-Run Trace Table Stamp Trigger
                        if (onInsertTraceTable != null) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = MaterialTheme.colorScheme.primaryContainer,
                                modifier = Modifier
                                    .clickable { onInsertTraceTable() }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(3.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.TableChart,
                                        contentDescription = "Stamp Trace Grid",
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Text(
                                        text = "Trace ▦",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                        }

                        // Right: Quick Size Presets & Drag Resize Grip Handle
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            // Size Preset Pills (S, M, L)
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (windowWidthDp < 400f) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clickable {
                                    windowWidthDp = 360f
                                    windowHeightDp = 440f
                                    onUpdatePage(page.copy(descriptionWindowWidth = 360f, descriptionWindowHeight = 440f))
                                }
                            ) {
                                Text(
                                    text = "S",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (windowWidthDp < 400f) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (windowWidthDp in 400f..560f) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clickable {
                                    windowWidthDp = 480f
                                    windowHeightDp = 580f
                                    onUpdatePage(page.copy(descriptionWindowWidth = 480f, descriptionWindowHeight = 580f))
                                }
                            ) {
                                Text(
                                    text = "M",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (windowWidthDp in 400f..560f) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (windowWidthDp > 560f) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clickable {
                                    windowWidthDp = 720f
                                    windowHeightDp = 700f
                                    onUpdatePage(page.copy(descriptionWindowWidth = 720f, descriptionWindowHeight = 700f))
                                }
                            ) {
                                Text(
                                    text = "L",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (windowWidthDp > 560f) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                )
                            }

                            // Dynamic Corner Resize Handle (◢)
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .pointerInput(Unit) {
                                        detectDragGestures(
                                            onDrag = { change, dragAmount ->
                                                change.consume()
                                                val deltaXdp = dragAmount.x / density.density
                                                val deltaYdp = dragAmount.y / density.density
                                                windowWidthDp = (windowWidthDp + deltaXdp).coerceIn(320f, 950f)
                                                windowHeightDp = (windowHeightDp + deltaYdp).coerceIn(260f, 1000f)
                                            },
                                            onDragEnd = {
                                                onUpdatePage(
                                                    page.copy(
                                                        descriptionWindowWidth = windowWidthDp,
                                                        descriptionWindowHeight = windowHeightDp
                                                    )
                                                )
                                            }
                                        )
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AspectRatio,
                                    contentDescription = "Drag to Resize Window",
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // Dialog: Modify or Delete Test Case
    testCaseToEdit?.let { tc ->
        var editTitle by remember(tc.id) { mutableStateOf(tc.title) }
        var editInput by remember(tc.id) { mutableStateOf(tc.input) }
        var editOutput by remember(tc.id) { mutableStateOf(tc.output) }

        AlertDialog(
            onDismissRequest = { testCaseToEdit = null },
            icon = {
                Icon(
                    imageVector = if (isNewTestCaseDialog) Icons.Default.Add else Icons.Default.Edit,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
            },
            title = {
                Text(if (isNewTestCaseDialog) "Add Test Case" else "Modify Test Case")
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = editTitle,
                        onValueChange = { editTitle = it },
                        label = { Text("Case Title (e.g. Example 1, Edge Case)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editInput,
                        onValueChange = { editInput = it },
                        label = { Text("Input (e.g. n = 4)") },
                        minLines = 2,
                        maxLines = 4,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editOutput,
                        onValueChange = { editOutput = it },
                        label = { Text("Expected Output (e.g. 5)") },
                        minLines = 1,
                        maxLines = 3,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val finalTitle = editTitle.trim().ifEmpty { "Case ${tc.id}" }
                        val updated = tc.copy(title = finalTitle, input = editInput.trim(), output = editOutput.trim())
                        if (isNewTestCaseDialog) {
                            testCases.add(updated)
                            val jsonStr = Json.encodeToString(testCases.toList())
                            onUpdatePage(page.copy(testCasesJson = jsonStr))
                        } else {
                            updateTestCase(updated)
                        }
                        testCaseToEdit = null
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (!isNewTestCaseDialog) {
                        OutlinedButton(
                            onClick = {
                                deleteTestCase(tc.id)
                                testCaseToEdit = null
                            },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Delete")
                        }
                    }
                    OutlinedButton(onClick = { testCaseToEdit = null }) {
                        Text("Cancel")
                    }
                }
            }
        )
    }
}
