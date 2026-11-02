package com.antigravity.note.ui.library

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
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
import androidx.compose.ui.window.DialogProperties
import com.antigravity.note.library.db.PageEntity

@Composable
fun ReviewTodayDialog(
    duePages: List<PageEntity>,
    onOpenPage: (notebookId: String, pageId: String) -> Unit,
    onScheduleReview: (pageId: String, days: Int) -> Unit,
    onDismissRequest: () -> Unit
) {
    var isFlashcardMode by remember { mutableStateOf(false) }
    var currentCardIndex by remember { mutableIntStateOf(0) }
    var isSolutionRevealed by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismissRequest,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.75f)
                .fillMaxHeight(0.85f),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                        Column {
                            Text(
                                text = "Spaced Repetition Review",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${duePages.size} problem${if (duePages.size == 1) "" else "s"} scheduled for review today",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismissRequest) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (duePages.isEmpty()) {
                    // Empty state
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF2E7D32),
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "All Caught Up!",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "No problems are due for review right now. Keep solving new problems!",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else if (!isFlashcardMode) {
                    // Queue List View
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.LocalFireDepartment, contentDescription = null, tint = Color(0xFFE65100))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Current Streak: 7 Days 🔥", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                        }

                        Button(
                            onClick = {
                                isFlashcardMode = true
                                currentCardIndex = 0
                                isSolutionRevealed = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Start Flashcard Review")
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    LazyColumn(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(duePages) { page ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        onOpenPage(page.notebookId, page.pageId)
                                        onDismissRequest()
                                    },
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
                                shape = RoundedCornerShape(14.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Text(
                                                text = page.title,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 16.sp
                                            )
                                            DifficultyBadge(page.difficulty ?: "Medium")
                                            StatusBadge(page.problemStatus)
                                        }

                                        Spacer(modifier = Modifier.height(6.dp))

                                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            if (page.timeComplexity.isNotBlank()) {
                                                Text("Time: ${page.timeComplexity}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            }
                                            if (page.spaceComplexity.isNotBlank()) {
                                                Text("Space: ${page.spaceComplexity}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                            }
                                            if (page.tags.isNotBlank()) {
                                                Text("Tags: ${page.tags}", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                                            }
                                        }
                                    }

                                    OutlinedButton(
                                        onClick = {
                                            onOpenPage(page.notebookId, page.pageId)
                                            onDismissRequest()
                                        }
                                    ) {
                                        Text("Open Ink")
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // Flashcard Study Mode
                    val currentProblem = duePages.getOrNull(currentCardIndex)
                    if (currentProblem == null) {
                        // Finished all cards!
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = Color(0xFF2E7D32),
                                    modifier = Modifier.size(64.dp)
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    text = "Session Complete!",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "All scheduled reviews have been completed and rescheduled.",
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.height(20.dp))
                                Button(onClick = onDismissRequest) {
                                    Text("Done")
                                }
                            }
                        }
                    } else {
                        // Card Active
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f)
                        ) {
                            // Progress indicator
                            Text(
                                text = "Card ${currentCardIndex + 1} of ${duePages.size}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Flashcard Front
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                                shape = RoundedCornerShape(18.dp)
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(20.dp)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Text(
                                            text = currentProblem.title,
                                            fontSize = 20.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        DifficultyBadge(currentProblem.difficulty ?: "Medium")
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Target Complexity: ${currentProblem.timeComplexity} Time, ${currentProblem.spaceComplexity} Space",
                                        fontSize = 13.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )

                                    if (currentProblem.tags.isNotBlank()) {
                                        Text(
                                            text = "Topic Tags: ${currentProblem.tags}",
                                            fontSize = 13.sp,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(16.dp))

                                    // Reveal button or Solution content
                                    if (!isSolutionRevealed) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .weight(1f),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            OutlinedButton(
                                                onClick = { isSolutionRevealed = true }
                                            ) {
                                                Icon(Icons.Default.School, contentDescription = null)
                                                Spacer(modifier = Modifier.width(8.dp))
                                                Text("Show Solution / Approach Code")
                                            }
                                        }
                                    } else {
                                        Column(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .weight(1f)
                                        ) {
                                            Text(
                                                text = "Solution & Derivation:",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp
                                            )
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Surface(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .weight(1f),
                                                color = Color(0xFF1E1E1E),
                                                shape = RoundedCornerShape(10.dp)
                                            ) {
                                                Text(
                                                    text = currentProblem.codeSnippet.ifBlank { "Approach: ${currentProblem.approachSummary}" },
                                                    color = Color(0xFF81C784),
                                                    fontFamily = FontFamily.Monospace,
                                                    fontSize = 12.sp,
                                                    modifier = Modifier.padding(12.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Spaced Repetition Buttons: Again (1d), Hard (3d), Good (7d), Easy (21d)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Button(
                                    onClick = {
                                        onScheduleReview(currentProblem.pageId, 1)
                                        currentCardIndex++
                                        isSolutionRevealed = false
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD32F2F)),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Again (1d)")
                                }

                                Button(
                                    onClick = {
                                        onScheduleReview(currentProblem.pageId, 3)
                                        currentCardIndex++
                                        isSolutionRevealed = false
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE65100)),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Hard (3d)")
                                }

                                Button(
                                    onClick = {
                                        onScheduleReview(currentProblem.pageId, 7)
                                        currentCardIndex++
                                        isSolutionRevealed = false
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1565C0)),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Good (7d)")
                                }

                                Button(
                                    onClick = {
                                        onScheduleReview(currentProblem.pageId, 21)
                                        currentCardIndex++
                                        isSolutionRevealed = false
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32)),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Easy (21d)")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DifficultyBadge(difficulty: String) {
    val (bgColor, fgColor) = when (difficulty.lowercase()) {
        "easy" -> Color(0xFFE8F5E9) to Color(0xFF2E7D32)
        "medium" -> Color(0xFFFFF3E0) to Color(0xFFE65100)
        "hard" -> Color(0xFFFFEBEE) to Color(0xFFC62828)
        else -> Color(0xFFE0E0E0) to Color(0xFF424242)
    }
    Surface(color = bgColor, shape = RoundedCornerShape(6.dp)) {
        Text(
            text = difficulty,
            color = fgColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}

@Composable
private fun StatusBadge(status: String) {
    val color = when (status) {
        "Mastered" -> Color(0xFF2E7D32)
        "Solved" -> Color(0xFF1565C0)
        "Revisit" -> Color(0xFFE65100)
        else -> Color.Gray
    }
    Surface(
        color = color.copy(alpha = 0.12f),
        shape = RoundedCornerShape(6.dp)
    ) {
        Text(
            text = status,
            color = color,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}
