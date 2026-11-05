package com.antigravity.note.ui.library

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.antigravity.note.library.db.PageEntity
import com.antigravity.note.ui.dsa.DsaProblemDetails
import com.antigravity.note.ui.dsa.DsaProblemFetcher
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Composable
fun EditProblemDialog(
    page: PageEntity,
    onSave: (PageEntity) -> Unit,
    onDismissRequest: () -> Unit
) {
    var title by remember { mutableStateOf(page.title) }
    var sourceUrl by remember { mutableStateOf(page.sourceUrl ?: "") }
    var difficulty by remember { mutableStateOf(page.difficulty ?: "Medium") }
    var status by remember { mutableStateOf(page.problemStatus) }
    var timeComplexity by remember { mutableStateOf(page.timeComplexity) }
    var spaceComplexity by remember { mutableStateOf(page.spaceComplexity) }
    var tags by remember { mutableStateOf(page.tags) }
    var codeSnippet by remember { mutableStateOf(page.codeSnippet) }
    var codeLanguage by remember { mutableStateOf(page.codeLanguage) }
    var isLangDropdownOpen by remember { mutableStateOf(false) }
    var isProblemPage by remember { mutableStateOf(page.isProblemPage) }

    val coroutineScope = rememberCoroutineScope()
    var isFetchingDetails by remember { mutableStateOf(false) }
    var fetchMessage by remember { mutableStateOf<String?>(null) }
    var fetchedDetails by remember { mutableStateOf<DsaProblemDetails?>(null) }

    Dialog(onDismissRequest = onDismissRequest) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp,
            modifier = Modifier
                .width(620.dp)
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "Edit Problem / Topic Details",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = onDismissRequest) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Toggle Banner Visibility
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Display Metadata Banner",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (isProblemPage) "Banner visible at top of page" else "Hidden (clean general note canvas)",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    androidx.compose.material3.Switch(
                        checked = isProblemPage,
                        onCheckedChange = { isProblemPage = it }
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Title Field
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Problem / Topic Title") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Source Link URL with Auto-Fetch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = sourceUrl,
                        onValueChange = {
                            sourceUrl = it
                            fetchMessage = null
                        },
                        label = { Text("Problem Link (Code360, LeetCode, GFG, Codeforces, Wikipedia)") },
                        singleLine = true,
                        placeholder = { Text("https://www.naukri.com/code360/problems/...") },
                        modifier = Modifier.weight(1f)
                    )
                    Button(
                        onClick = {
                            val trimmedUrl = sourceUrl.trim()
                            if (trimmedUrl.isNotBlank()) {
                                isFetchingDetails = true
                                fetchMessage = null
                                coroutineScope.launch {
                                    val result = DsaProblemFetcher.fetchProblem(trimmedUrl)
                                    result.onSuccess { details ->
                                        fetchedDetails = details
                                        if (title.isBlank() || title == page.title) {
                                            title = details.title
                                        }
                                        if (!details.difficulty.isNullOrBlank()) {
                                            difficulty = details.difficulty
                                        }
                                        if (details.tags.isNotEmpty() && tags.isBlank()) {
                                            tags = details.tags.joinToString(", ")
                                        }
                                        fetchMessage = "✓ Fetched from ${details.platform}"
                                    }.onFailure { err ->
                                        fetchMessage = "⚠️ ${err.message ?: "Fetch failed"}"
                                    }
                                    isFetchingDetails = false
                                }
                            }
                        },
                        enabled = sourceUrl.isNotBlank() && !isFetchingDetails,
                        modifier = Modifier.height(56.dp)
                    ) {
                        if (isFetchingDetails) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = MaterialTheme.colorScheme.onPrimary
                            )
                        } else {
                            Icon(Icons.Default.Refresh, contentDescription = "Fetch details", modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("Fetch")
                        }
                    }
                }
                fetchMessage?.let { msg ->
                    Text(
                        text = msg,
                        fontSize = 12.sp,
                        color = if (msg.startsWith("✓")) Color(0xFF146C2E) else MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(start = 4.dp, top = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Difficulty Selector
                Text(
                    text = "Difficulty",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Easy", "Medium", "Hard").forEach { diff ->
                        FilterChip(
                            selected = difficulty.equals(diff, ignoreCase = true),
                            onClick = { difficulty = diff },
                            label = { Text(diff, fontWeight = FontWeight.Bold) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Status Selector
                Text(
                    text = "Status",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("Unsolved", "Solved", "Revisit", "Mastered").forEach { s ->
                        FilterChip(
                            selected = status == s,
                            onClick = { status = s },
                            label = { Text(s) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Complexities Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = timeComplexity,
                        onValueChange = { timeComplexity = it },
                        label = { Text("Time Complexity") },
                        placeholder = { Text("e.g. O(N log N)") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = spaceComplexity,
                        onValueChange = { spaceComplexity = it },
                        label = { Text("Space Complexity") },
                        placeholder = { Text("e.g. O(1)") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Tags
                OutlinedTextField(
                    value = tags,
                    onValueChange = { tags = it },
                    label = { Text("Tags (comma-separated)") },
                    placeholder = { Text("Array, Two Pointers, Hash Table") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Language & Code Snippet
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Code / Reference Notes",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Lang: ",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        OutlinedButton(
                            onClick = { isLangDropdownOpen = true },
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(codeLanguage, fontSize = 12.sp)
                        }
                        DropdownMenu(
                            expanded = isLangDropdownOpen,
                            onDismissRequest = { isLangDropdownOpen = false }
                        ) {
                            listOf("Kotlin", "Java", "Python", "C++", "Go", "TypeScript", "Markdown").forEach { lang ->
                                DropdownMenuItem(
                                    text = { Text(lang) },
                                    onClick = {
                                        codeLanguage = lang
                                        isLangDropdownOpen = false
                                    }
                                )
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))

                OutlinedTextField(
                    value = codeSnippet,
                    onValueChange = { codeSnippet = it },
                    label = { Text("Solution snippet or notes") },
                    minLines = 4,
                    maxLines = 8,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    OutlinedButton(onClick = onDismissRequest) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Button(
                        onClick = {
                            val nextReview = when (status) {
                                "Revisit" -> System.currentTimeMillis() - 1000L
                                "Solved" -> System.currentTimeMillis() + (7L * 86400000L)
                                "Mastered" -> System.currentTimeMillis() + (21L * 86400000L)
                                else -> 0L
                            }
                            val newUrl = sourceUrl.trim().ifEmpty { null }
                            val urlChanged = newUrl != page.sourceUrl
                            val updated = page.copy(
                                title = title.trim().ifEmpty { page.title },
                                sourceUrl = newUrl,
                                difficulty = difficulty,
                                problemStatus = status,
                                isProblemPage = isProblemPage,
                                timeComplexity = timeComplexity.trim(),
                                spaceComplexity = spaceComplexity.trim(),
                                tags = tags.trim(),
                                codeSnippet = codeSnippet,
                                codeLanguage = codeLanguage,
                                nextReviewTimestamp = if (nextReview > 0L) nextReview else page.nextReviewTimestamp,
                                problemDescriptionHtml = fetchedDetails?.descriptionHtml ?: if (urlChanged) null else page.problemDescriptionHtml,
                                testCasesJson = fetchedDetails?.let { Json.encodeToString(it.testCases) } ?: if (urlChanged) null else page.testCasesJson,
                                isDescriptionWindowVisible = if (urlChanged || fetchedDetails != null) true else page.isDescriptionWindowVisible,
                                modifiedAt = System.currentTimeMillis()
                            )
                            onSave(updated)
                        }
                    ) {
                        Text("Save Changes")
                    }
                }
            }
        }
    }
}
