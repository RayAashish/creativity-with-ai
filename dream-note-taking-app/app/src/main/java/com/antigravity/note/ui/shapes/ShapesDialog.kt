package com.antigravity.note.ui.shapes

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.SyncAlt
import androidx.compose.material.icons.filled.ViewWeek
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.antigravity.note.inkengine.shape.RecognizedShape

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ShapesDialog(
    isHoldToSnapEnabled: Boolean,
    onToggleHoldToSnap: (Boolean) -> Unit,
    onInsertShape: (RecognizedShape) -> Unit,
    onDismissRequest: () -> Unit
) {
    Dialog(onDismissRequest = onDismissRequest) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp,
            modifier = Modifier
                .width(520.dp)
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
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Category,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Text(
                            text = "Shapes & Diagrams",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    IconButton(onClick = onDismissRequest) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Hold to snap toggle banner
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Hold-to-Snap Inking",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "Pause stylus at end of stroke to snap clean geometry",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = isHoldToSnapEnabled,
                            onCheckedChange = onToggleHoldToSnap
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // System Design Section
                Text(
                    text = "SYSTEM DESIGN & ARCHITECTURE",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(10.dp))

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    ShapeInsertItem(
                        icon = Icons.Default.Storage,
                        title = "Database",
                        desc = "3D Cylinder (SQL/NoSQL)",
                        onClick = {
                            onInsertShape(RecognizedShape.DatabaseCylinder(centerX = 600f, centerY = 800f, width = 150f, height = 180f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Cloud,
                        title = "Cloud / VPC",
                        desc = "Network / Gateway / AWS",
                        onClick = {
                            onInsertShape(RecognizedShape.Cloud(centerX = 600f, centerY = 800f, width = 200f, height = 120f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.SyncAlt,
                        title = "Network Bus",
                        desc = "Two-way communication <->",
                        onClick = {
                            onInsertShape(RecognizedShape.BidirectionalArrow(startX = 450f, startY = 800f, endX = 750f, endY = 800f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Category,
                        title = "Service Box",
                        desc = "Microservice / Server",
                        onClick = {
                            onInsertShape(RecognizedShape.Rectangle(left = 480f, top = 720f, right = 720f, bottom = 880f))
                            onDismissRequest()
                        }
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // DSA & Flowchart Section
                Text(
                    text = "DATA STRUCTURES & FLOWCHARTS",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(10.dp))

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    ShapeInsertItem(
                        icon = Icons.AutoMirrored.Filled.ArrowForward,
                        title = "Linked List",
                        desc = "Node [ val | • ] ➔",
                        onClick = {
                            onInsertShape(RecognizedShape.LinkedListNode(centerX = 600f, centerY = 800f, width = 160f, height = 80f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.ViewWeek,
                        title = "Array / Queue",
                        desc = "Partitioned [0|1|2|3]",
                        onClick = {
                            onInsertShape(RecognizedShape.ArrayCellSequence(centerX = 600f, centerY = 800f, cellWidth = 65f, cellHeight = 65f, count = 4))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Category,
                        title = "Decision",
                        desc = "Flowchart Diamond ❖",
                        onClick = {
                            onInsertShape(RecognizedShape.Diamond(centerX = 600f, centerY = 800f, width = 150f, height = 110f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Category,
                        title = "Graph Node",
                        desc = "Circle / Vertex ◯",
                        onClick = {
                            onInsertShape(RecognizedShape.Circle(centerX = 600f, centerY = 800f, radius = 55f))
                            onDismissRequest()
                        }
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
}

@Composable
private fun ShapeInsertItem(
    icon: ImageVector,
    title: String,
    desc: String,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)),
        modifier = Modifier
            .width(225.dp)
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp)
                )
            }
            Column {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
                Text(
                    text = desc,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
