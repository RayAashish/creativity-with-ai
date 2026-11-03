package com.antigravity.note.ui.dsa

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DragHandle
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.antigravity.note.library.db.PageEntity
import com.antigravity.note.library.model.TestCaseItem
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.math.roundToInt

@Composable
fun FloatingDsaProblemWindow(
    page: PageEntity,
    onUpdatePage: (PageEntity) -> Unit,
    onCloseWindow: () -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    // Drag position
    var offsetX by remember(page.pageId) { mutableFloatStateOf(page.descriptionWindowX) }
    var offsetY by remember(page.pageId) { mutableFloatStateOf(page.descriptionWindowY) }

    // Minimized / Expanded state
    var isMinimized by remember(page.pageId) { mutableStateOf(page.isDescriptionMinimized) }

    // Content state
    var descriptionHtml by remember(page.pageId) { mutableStateOf(page.problemDescriptionHtml.orEmpty()) }
    var isFetching by remember { mutableStateOf(false) }
    var fetchError by remember { mutableStateOf<String?>(null) }

    // Test cases list
    val testCases = remember(page.pageId) {
        mutableStateListOf<TestCaseItem>().apply {
            val jsonStr = page.testCasesJson
            if (!jsonStr.isNullOrBlank()) {
                try {
                    addAll(Json.decodeFromString<List<TestCaseItem>>(jsonStr))
                } catch (_: Exception) {}
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
                    testCases.addAll(details.testCases)
                    val jsonStr = Json.encodeToString(details.testCases)
                    onUpdatePage(
                        page.copy(
                            problemDescriptionHtml = details.descriptionHtml,
                            testCasesJson = jsonStr,
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

    // Function to re-fetch live
    fun reloadFromSource() {
        val url = page.sourceUrl ?: return
        isFetching = true
        fetchError = null
        coroutineScope.launch {
            val res = DsaProblemFetcher.fetchProblem(url)
            res.onSuccess { details ->
                descriptionHtml = details.descriptionHtml
                testCases.clear()
                testCases.addAll(details.testCases)
                val jsonStr = Json.encodeToString(details.testCases)
                onUpdatePage(
                    page.copy(
                        problemDescriptionHtml = details.descriptionHtml,
                        testCasesJson = jsonStr,
                        difficulty = details.difficulty ?: page.difficulty
                    )
                )
            }.onFailure { err ->
                fetchError = err.message ?: "Failed to load"
            }
            isFetching = false
        }
    }

    fun toggleTestCaseCheck(index: Int) {
        if (index in testCases.indices) {
            val old = testCases[index]
            val updated = old.copy(isChecked = !old.isChecked)
            testCases[index] = updated
            val jsonStr = Json.encodeToString(testCases.toList())
            onUpdatePage(page.copy(testCasesJson = jsonStr))
        }
    }

    val difficultyColor = when (page.difficulty?.lowercase()) {
        "easy" -> Color(0xFF146C2E)
        "medium" -> Color(0xFFB26A00)
        "hard" -> Color(0xFFBA1A1A)
        else -> MaterialTheme.colorScheme.primary
    }

    Box(
        modifier = modifier
            .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
    ) {
        if (isMinimized) {
            // Minimized Floating Pill
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surfaceContainerHigh.copy(alpha = 0.96f),
                shadowElevation = 8.dp,
                modifier = Modifier
                    .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(20.dp))
                    .pointerInput(page.pageId) {
                        detectDragGestures(
                            onDrag = { change, dragAmount ->
                                change.consume()
                                offsetX = (offsetX + dragAmount.x).coerceIn(10f, 1600f)
                                offsetY = (offsetY + dragAmount.y).coerceIn(60f, 3000f)
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
                        contentDescription = "Drag Window",
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

                    if (testCases.isNotEmpty()) {
                        val checkedCount = testCases.count { it.isChecked }
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = if (checkedCount == testCases.size) Color(0xFF146C2E).copy(alpha = 0.15f) else MaterialTheme.colorScheme.secondaryContainer
                        ) {
                            Text(
                                text = "✓ $checkedCount/${testCases.size}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (checkedCount == testCases.size) Color(0xFF146C2E) else MaterialTheme.colorScheme.onSecondaryContainer,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
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
            // Full Floating Window
            Card(
                modifier = Modifier
                    .widthIn(min = 380.dp, max = 500.dp)
                    .heightIn(max = 620.dp),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.98f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 10.dp)
            ) {
                Column {
                    // Header Bar (Draggable)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.surfaceContainerHigh)
                            .pointerInput(page.pageId) {
                                detectDragGestures(
                                    onDrag = { change, dragAmount ->
                                        change.consume()
                                        offsetX = (offsetX + dragAmount.x).coerceIn(10f, 1600f)
                                        offsetY = (offsetY + dragAmount.y).coerceIn(60f, 3000f)
                                    },
                                    onDragEnd = {
                                        onUpdatePage(page.copy(descriptionWindowX = offsetX, descriptionWindowY = offsetY))
                                    }
                                )
                            }
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.DragHandle,
                                contentDescription = "Drag to Move",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = page.title,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                maxLines = 1
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
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            if (isFetching) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                            } else {
                                IconButton(onClick = { reloadFromSource() }, modifier = Modifier.size(28.dp)) {
                                    Icon(
                                        imageVector = Icons.Default.Refresh,
                                        contentDescription = "Sync from URL",
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }

                            // Minimize Button
                            IconButton(
                                onClick = {
                                    isMinimized = true
                                    onUpdatePage(page.copy(isDescriptionMinimized = true))
                                },
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ExpandLess,
                                    contentDescription = "Minimize Window",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(18.dp)
                                )
                            }

                            // Close Button
                            IconButton(onClick = onCloseWindow, modifier = Modifier.size(28.dp)) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Close Window",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }

                    HorizontalDivider(thickness = 0.8.dp, color = MaterialTheme.colorScheme.outlineVariant)

                    // Scrollable Body
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f, fill = false)
                            .verticalScroll(rememberScrollState())
                            .padding(14.dp)
                    ) {
                        // Error banner if any
                        if (fetchError != null && descriptionHtml.isBlank()) {
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = MaterialTheme.colorScheme.errorContainer,
                                modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = "⚠️ $fetchError",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onErrorContainer
                                    )
                                }
                            }
                        }

                        // Problem Description Content (HTML + Images via WebView)
                        if (descriptionHtml.isNotBlank()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = 140.dp, max = 280.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
                                    .padding(4.dp)
                            ) {
                                AndroidView(
                                    factory = { ctx ->
                                        WebView(ctx).apply {
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
                                        val styledHtml = """
                                            <!DOCTYPE html>
                                            <html>
                                            <head>
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <style>
                                                body {
                                                    font-family: -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
                                                    font-size: 13px;
                                                    line-height: 1.5;
                                                    color: #212529;
                                                    margin: 0;
                                                    padding: 8px;
                                                    background: transparent;
                                                }
                                                img {
                                                    max-width: 100%;
                                                    height: auto;
                                                    border-radius: 8px;
                                                    display: block;
                                                    margin: 10px auto;
                                                    border: 1px solid #dee2e6;
                                                }
                                                pre {
                                                    background-color: #f1f3f5;
                                                    border-radius: 6px;
                                                    padding: 8px 10px;
                                                    font-family: ui-monospace, SFMono-Regular, monospace;
                                                    font-size: 12px;
                                                    overflow-x: auto;
                                                    border: 1px solid #e9ecef;
                                                    white-space: pre-wrap;
                                                    word-break: break-word;
                                                }
                                                code {
                                                    background-color: #f1f3f5;
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
                                            </style>
                                            </head>
                                            <body>
                                            $descriptionHtml
                                            </body>
                                            </html>
                                        """.trimIndent()
                                        webView.loadDataWithBaseURL("https://leetcode.com", styledHtml, "text/html", "UTF-8", null)
                                    },
                                    modifier = Modifier.fillMaxWidth().heightIn(min = 140.dp, max = 280.dp)
                                )
                            }
                        } else if (!isFetching) {
                            Text(
                                text = "No description loaded. Tap 🔄 to fetch from URL or enter one in Problem Details.",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(vertical = 12.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Test Cases Section with Interactive Checkboxes (Directly requested by user)
                        Text(
                            text = "Test Cases from Problem Description",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(6.dp))

                        if (testCases.isEmpty()) {
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = "No test cases detected yet. Tap 🔄 to parse examples from the description.",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(10.dp)
                                )
                            }
                        } else {
                            testCases.forEachIndexed { index, tc ->
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = if (tc.isChecked) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.25f) else MaterialTheme.colorScheme.surfaceContainerLow,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 3.dp)
                                        .clickable { toggleTestCaseCheck(index) }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Checkbox(
                                            checked = tc.isChecked,
                                            onCheckedChange = { toggleTestCaseCheck(index) },
                                            colors = CheckboxDefaults.colors(checkedColor = MaterialTheme.colorScheme.primary),
                                            modifier = Modifier.size(24.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = tc.title,
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (tc.isChecked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                                            )
                                            Text(
                                                text = tc.input,
                                                fontSize = 11.sp,
                                                fontFamily = FontFamily.Monospace,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                maxLines = 2
                                            )
                                            if (tc.output.isNotBlank()) {
                                                Text(
                                                    text = "Expected: ${tc.output}",
                                                    fontSize = 11.sp,
                                                    fontFamily = FontFamily.Monospace,
                                                    color = Color(0xFF146C2E),
                                                    maxLines = 1
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
    }
}
