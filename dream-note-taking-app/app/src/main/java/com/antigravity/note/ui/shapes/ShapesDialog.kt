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
import androidx.compose.material.icons.filled.Circle
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CropLandscape
import androidx.compose.material.icons.filled.CropSquare
import androidx.compose.material.icons.filled.ChangeHistory
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Hexagon
import androidx.compose.material.icons.filled.HorizontalRule
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.Pentagon
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.SyncAlt
import androidx.compose.material.icons.filled.ViewWeek
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ShapesDialog(
    isHoldToSnapEnabled: Boolean,
    onToggleHoldToSnap: (Boolean) -> Unit,
    isShapeToolActive: Boolean = false,
    onToggleShapeTool: ((Boolean) -> Unit)? = null,
    onInsertShape: (RecognizedShape) -> Unit,
    viewportCenter: Pair<Float, Float> = Pair(1000f, 1200f),
    onDismissRequest: () -> Unit
) {
    val cx = viewportCenter.first
    val cy = viewportCenter.second

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
                        Column {
                            Text(
                                text = "Shapes & Diagrams Library",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Tap to stamp or switch to Shape Drawing tool",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismissRequest) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Control Toggles Banner
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        // Shape Drawing Tool Mode Toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Shape Drawing Tool Mode",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = "Every stroke you draw immediately forms a clean geometric shape",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Switch(
                                checked = isShapeToolActive,
                                onCheckedChange = { onToggleShapeTool?.invoke(it) }
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)))
                        Spacer(modifier = Modifier.height(8.dp))

                        // Hold-to-Snap Inking Toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Hold-to-Snap Inking (Pen Mode)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = "Pause stylus ~300ms at stroke end to snap clean geometry",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Switch(
                                checked = isHoldToSnapEnabled,
                                onCheckedChange = onToggleHoldToSnap
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // ================= 1. BASIC GEOMETRIC SHAPES =================
                Text(
                    text = "BASIC GEOMETRIC SHAPES",
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
                        icon = Icons.Default.Circle,
                        title = "Circle",
                        desc = "Perfect 360° Round ◯",
                        onClick = {
                            onInsertShape(RecognizedShape.Circle(centerX = cx, centerY = cy, radius = 150f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.CropSquare,
                        title = "Square",
                        desc = "Equal sides 1:1 ▢",
                        onClick = {
                            onInsertShape(RecognizedShape.Square(centerX = cx, centerY = cy, size = 280f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.CropLandscape,
                        title = "Rectangle",
                        desc = "Clean Box / Border ▭",
                        onClick = {
                            onInsertShape(RecognizedShape.Rectangle(left = cx - 180f, top = cy - 110f, right = cx + 180f, bottom = cy + 110f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.ChangeHistory,
                        title = "Triangle",
                        desc = "3 Vertices △",
                        onClick = {
                            val side = 280f
                            val h = (side * 0.866f)
                            onInsertShape(
                                RecognizedShape.Triangle(
                                    x1 = cx, y1 = cy - h / 2f,
                                    x2 = cx + side / 2f, y2 = cy + h / 2f,
                                    x3 = cx - side / 2f, y3 = cy + h / 2f
                                )
                            )
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Diamond,
                        title = "Diamond",
                        desc = "Rhombus / Decision ◇",
                        onClick = {
                            onInsertShape(RecognizedShape.Diamond(centerX = cx, centerY = cy, width = 260f, height = 260f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Pentagon,
                        title = "Pentagon",
                        desc = "5-sided polygon ⬠",
                        onClick = {
                            val r = 150f
                            val pts = (0..4).map { i ->
                                val a = (i * 2 * PI / 5 - PI / 2).toFloat()
                                Pair(cx + r * cos(a), cy + r * sin(a))
                            }
                            onInsertShape(
                                RecognizedShape.Pentagon(
                                    pts[0].first, pts[0].second,
                                    pts[1].first, pts[1].second,
                                    pts[2].first, pts[2].second,
                                    pts[3].first, pts[3].second,
                                    pts[4].first, pts[4].second
                                )
                            )
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Hexagon,
                        title = "Hexagon",
                        desc = "6-sided polygon ⬡",
                        onClick = {
                            onInsertShape(RecognizedShape.Hexagon(centerX = cx, centerY = cy, radius = 150f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Star,
                        title = "Star",
                        desc = "5-Point Star ★",
                        onClick = {
                            onInsertShape(RecognizedShape.Star(centerX = cx, centerY = cy, outerRadius = 150f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.HorizontalRule,
                        title = "Straight Line",
                        desc = "Connector line ―",
                        onClick = {
                            onInsertShape(RecognizedShape.Line(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.AutoMirrored.Filled.ArrowForward,
                        title = "Arrow",
                        desc = "Directional flow ➔",
                        onClick = {
                            onInsertShape(RecognizedShape.Arrow(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.SyncAlt,
                        title = "Two-Way Arrow",
                        desc = "Bidirectional ↔",
                        onClick = {
                            onInsertShape(RecognizedShape.BidirectionalArrow(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy))
                            onDismissRequest()
                        }
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // ================= 2. SYSTEM DESIGN & ARCHITECTURE =================
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
                            onInsertShape(RecognizedShape.DatabaseCylinder(centerX = cx, centerY = cy, width = 280f, height = 360f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Cloud,
                        title = "Cloud / VPC",
                        desc = "Network Gateway / AWS",
                        onClick = {
                            onInsertShape(RecognizedShape.Cloud(centerX = cx, centerY = cy, width = 400f, height = 240f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Memory,
                        title = "Cache / Redis",
                        desc = "In-Memory Stadium Pill",
                        onClick = {
                            onInsertShape(RecognizedShape.CachePill(centerX = cx, centerY = cy, width = 340f, height = 160f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Category,
                        title = "Microservice",
                        desc = "Server / Service Node",
                        onClick = {
                            onInsertShape(RecognizedShape.Rectangle(left = cx - 160f, top = cy - 110f, right = cx + 160f, bottom = cy + 110f))
                            onDismissRequest()
                        }
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // ================= 3. DATA STRUCTURES & FLOWCHARTS =================
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
                            onInsertShape(RecognizedShape.LinkedListNode(centerX = cx, centerY = cy, width = 300f, height = 130f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.ViewWeek,
                        title = "Array / Queue",
                        desc = "Partitioned [0|1|2|3]",
                        onClick = {
                            onInsertShape(RecognizedShape.ArrayCellSequence(centerX = cx, centerY = cy, cellWidth = 90f, cellHeight = 90f, count = 4))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Diamond,
                        title = "Decision",
                        desc = "Flowchart Diamond ❖",
                        onClick = {
                            onInsertShape(RecognizedShape.Diamond(centerX = cx, centerY = cy, width = 240f, height = 240f))
                            onDismissRequest()
                        }
                    )
                    ShapeInsertItem(
                        icon = Icons.Default.Circle,
                        title = "Graph Node",
                        desc = "Circle / Vertex ◯",
                        onClick = {
                            onInsertShape(RecognizedShape.Circle(centerX = cx, centerY = cy, radius = 90f))
                            onDismissRequest()
                        }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
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
            .fillMaxWidth(0.485f)
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
                    .size(38.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(22.dp)
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
