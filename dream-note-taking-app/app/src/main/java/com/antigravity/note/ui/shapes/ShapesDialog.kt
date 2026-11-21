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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AccountTree
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.ChangeHistory
import androidx.compose.material.icons.filled.Circle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.CropLandscape
import androidx.compose.material.icons.filled.CropSquare
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.Hexagon
import androidx.compose.material.icons.filled.HorizontalRule
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.Pentagon
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Schema
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.SyncAlt
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.ViewAgenda
import androidx.compose.material.icons.filled.ViewWeek
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.antigravity.note.inkengine.canvas.ShapePlacementType
import com.antigravity.note.inkengine.shape.RecognizedShape
import com.antigravity.note.inkengine.shape.UmlConnectorType
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
    onSelectShapePlacement: ((ShapePlacementType) -> Unit)? = null,
    viewportCenter: Pair<Float, Float> = Pair(1000f, 1200f),
    onDismissRequest: () -> Unit
) {
    val cx = viewportCenter.first
    val cy = viewportCenter.second

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    var useDragToStretchMode by remember { mutableStateOf(true) }

    // Parameterized Dynamic Array state
    var arraySize by remember { mutableIntStateOf(5) }
    var arrayShowIndices by remember { mutableStateOf(true) }
    var arrayIsHorizontal by remember { mutableStateOf(true) }

    // Parameterized Dynamic Linked List state
    var listNodeCount by remember { mutableIntStateOf(3) }
    var listIsDoubly by remember { mutableStateOf(false) }
    var listIsCircular by remember { mutableStateOf(false) }
    var listShowPointers by remember { mutableStateOf(true) }

    // Parameterized Stack state
    var stackSlots by remember { mutableIntStateOf(4) }
    var stackShowTopPointer by remember { mutableStateOf(true) }

    // Parameterized Queue state
    var queueSlots by remember { mutableIntStateOf(4) }
    var queueShowPointers by remember { mutableStateOf(true) }

    // Parameterized Binary Tree state
    var treeShowChildren by remember { mutableStateOf(true) }

    val handleShapeAction: (ShapePlacementType, () -> RecognizedShape) -> Unit = { type, stampFallback ->
        if (useDragToStretchMode && onSelectShapePlacement != null) {
            onSelectShapePlacement(type)
            onDismissRequest()
        } else {
            onInsertShape(stampFallback())
            onDismissRequest()
        }
    }

    Dialog(
        onDismissRequest = onDismissRequest,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            dismissOnBackPress = true,
            dismissOnClickOutside = false
        )
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp,
            modifier = Modifier
                .fillMaxWidth(0.92f)
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
                                .background(Color(0x20F59E0B)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Category,
                                contentDescription = null,
                                tint = Color(0xFFF59E0B),
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Shapes, UML & DSA Generators",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "OneNote-style drag-to-stretch placement & parameterized stencils",
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

                // Mode Banner: Drag-to-Stretch Placement vs Instant Stamp
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "OneNote Drag-to-Stretch Placement Mode",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = if (useDragToStretchMode) "Tap a shape, then drag pen on canvas to stretch dynamically" else "Direct stamp at screen center",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Switch(
                                checked = useDragToStretchMode,
                                onCheckedChange = { useDragToStretchMode = it }
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)))
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Hold-to-Shape Inking (Pen Mode)",
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = "Pause stylus ~400ms at stroke end to snap vector geometry",
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

                Spacer(modifier = Modifier.height(14.dp))

                // Tab Row
                TabRow(
                    selectedTabIndex = selectedTabIndex,
                    containerColor = Color.Transparent,
                    contentColor = Color(0xFFF59E0B)
                ) {
                    Tab(
                        selected = selectedTabIndex == 0,
                        onClick = { selectedTabIndex = 0 },
                        text = { Text("Basic Shapes", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = selectedTabIndex == 1,
                        onClick = { selectedTabIndex = 1 },
                        text = { Text("UML Diagrams", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                    )
                    Tab(
                        selected = selectedTabIndex == 2,
                        onClick = { selectedTabIndex = 2 },
                        text = { Text("DSA Generators", fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                when (selectedTabIndex) {
                    0 -> {
                        // ================= 1. BASIC GEOMETRIC SHAPES =================
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
                                    handleShapeAction(ShapePlacementType.CIRCLE) {
                                        RecognizedShape.Circle(centerX = cx, centerY = cy, radius = 150f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.CropSquare,
                                title = "Square",
                                desc = "Equal sides 1:1 ▢",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.SQUARE) {
                                        RecognizedShape.Square(centerX = cx, centerY = cy, size = 280f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.CropLandscape,
                                title = "Rectangle",
                                desc = "Clean Box / Border ▭",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.RECTANGLE) {
                                        RecognizedShape.Rectangle(left = cx - 180f, top = cy - 110f, right = cx + 180f, bottom = cy + 110f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.ChangeHistory,
                                title = "Triangle",
                                desc = "3 Vertices △",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.TRIANGLE) {
                                        val side = 280f
                                        val h = (side * 0.866f)
                                        RecognizedShape.Triangle(
                                            x1 = cx, y1 = cy - h / 2f,
                                            x2 = cx + side / 2f, y2 = cy + h / 2f,
                                            x3 = cx - side / 2f, y3 = cy + h / 2f
                                        )
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Diamond,
                                title = "Diamond",
                                desc = "Rhombus / Decision ◇",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.DIAMOND) {
                                        RecognizedShape.Diamond(centerX = cx, centerY = cy, width = 260f, height = 260f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Star,
                                title = "Star",
                                desc = "Multi-Point Star ★",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.STAR) {
                                        RecognizedShape.Star(centerX = cx, centerY = cy, outerRadius = 150f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.HorizontalRule,
                                title = "Straight Line",
                                desc = "Vector Segment ―",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.LINE) {
                                        RecognizedShape.Line(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.AutoMirrored.Filled.ArrowForward,
                                title = "Arrow",
                                desc = "Directional Flow ➔",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.ARROW) {
                                        RecognizedShape.Arrow(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.SyncAlt,
                                title = "Two-Way Arrow",
                                desc = "Bidirectional ↔",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.BIDIRECTIONAL_ARROW) {
                                        RecognizedShape.BidirectionalArrow(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Storage,
                                title = "Database Cylinder",
                                desc = "SQL / Storage ⛁",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.DATABASE_CYLINDER) {
                                        RecognizedShape.DatabaseCylinder(centerX = cx, centerY = cy, width = 280f, height = 360f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Cloud,
                                title = "Cloud / VPC",
                                desc = "Network Boundary ☁",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.CLOUD) {
                                        RecognizedShape.Cloud(centerX = cx, centerY = cy, width = 400f, height = 240f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Memory,
                                title = "Cache Pill",
                                desc = "In-Memory / Redis 💊",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.CACHE_PILL) {
                                        RecognizedShape.CachePill(centerX = cx, centerY = cy, width = 340f, height = 160f)
                                    }
                                }
                            )
                        }
                    }

                    1 -> {
                        // ================= 2. FULL UML DIAGRAMS =================
                        Text(
                            text = "UML STENCILS (CLASS & SEQUENCE)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFF59E0B),
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            ShapeInsertItem(
                                icon = Icons.Default.ViewAgenda,
                                title = "UML Class",
                                desc = "3 Compartments: Name, Attributes, Methods",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_CLASS) {
                                        RecognizedShape.UmlClass(centerX = cx, centerY = cy, width = 360f, height = 260f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Schema,
                                title = "UML Interface",
                                desc = "<<interface>> Header Box",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_INTERFACE) {
                                        RecognizedShape.UmlInterface(centerX = cx, centerY = cy, width = 360f, height = 220f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Person,
                                title = "Sequence Actor",
                                desc = "Actor Stick Figure & Label",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_ACTOR) {
                                        RecognizedShape.UmlActor(centerX = cx, centerY = cy, width = 100f, height = 180f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Timeline,
                                title = "Lifeline",
                                desc = "Header + Dashed Lifeline",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_LIFELINE) {
                                        RecognizedShape.UmlLifeline(centerX = cx, centerY = cy, width = 140f, height = 360f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.CropLandscape,
                                title = "Activation Bar",
                                desc = "Execution Focus Box",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_ACTIVATION) {
                                        RecognizedShape.UmlActivationBar(centerX = cx, centerY = cy, width = 32f, height = 240f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Fullscreen,
                                title = "Combined Fragment",
                                desc = "loop / alt / opt Box",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_FRAGMENT) {
                                        RecognizedShape.UmlCombinedFragment(centerX = cx, centerY = cy, width = 440f, height = 260f, operator = "loop")
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Circle,
                                title = "Use Case",
                                desc = "Horizontal Oval Ellipse",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_USE_CASE) {
                                        RecognizedShape.UmlUseCase(centerX = cx, centerY = cy, width = 360f, height = 180f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Circle,
                                title = "Initial Node",
                                desc = "Activity Solid Start ●",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_INITIAL_NODE) {
                                        RecognizedShape.UmlInitialNode(centerX = cx, centerY = cy, radius = 32f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Circle,
                                title = "Final Node",
                                desc = "Bullseye Activity End ◉",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_FINAL_NODE) {
                                        RecognizedShape.UmlFinalNode(centerX = cx, centerY = cy, radius = 32f)
                                    }
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.HorizontalRule,
                                title = "Fork / Join Bar",
                                desc = "Solid Sync Bar ━",
                                onClick = {
                                    handleShapeAction(ShapePlacementType.UML_FORK_JOIN) {
                                        RecognizedShape.UmlForkJoin(centerX = cx, centerY = cy, width = 260f, height = 18f)
                                    }
                                }
                            )
                        }

                        Spacer(modifier = Modifier.height(18.dp))
                        Text(
                            text = "SMART UML CONNECTORS",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFF59E0B),
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            ShapeInsertItem(
                                icon = Icons.Default.HorizontalRule,
                                title = "Association",
                                desc = "Solid Connector Line ―",
                                onClick = {
                                    onInsertShape(RecognizedShape.UmlConnector(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy, type = UmlConnectorType.ASSOCIATION))
                                    onDismissRequest()
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.AutoMirrored.Filled.ArrowForward,
                                title = "Directed / Dependency",
                                desc = "Dashed Line with Open Arrow",
                                onClick = {
                                    onInsertShape(RecognizedShape.UmlConnector(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy, type = UmlConnectorType.DIRECTED_ASSOCIATION))
                                    onDismissRequest()
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.AutoMirrored.Filled.ArrowForward,
                                title = "Generalization",
                                desc = "Inheritance: Hollow Triangle ▷",
                                onClick = {
                                    onInsertShape(RecognizedShape.UmlConnector(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy, type = UmlConnectorType.GENERALIZATION))
                                    onDismissRequest()
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.AutoMirrored.Filled.ArrowForward,
                                title = "Realization",
                                desc = "Interface Impl: Dashed + Hollow Triangle",
                                onClick = {
                                    onInsertShape(RecognizedShape.UmlConnector(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy, type = UmlConnectorType.REALIZATION))
                                    onDismissRequest()
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Diamond,
                                title = "Aggregation",
                                desc = "Shared: Hollow Diamond ◇",
                                onClick = {
                                    onInsertShape(RecognizedShape.UmlConnector(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy, type = UmlConnectorType.AGGREGATION))
                                    onDismissRequest()
                                }
                            )
                            ShapeInsertItem(
                                icon = Icons.Default.Diamond,
                                title = "Composition",
                                desc = "Owned: Solid Diamond ◆",
                                onClick = {
                                    onInsertShape(RecognizedShape.UmlConnector(startX = cx - 180f, startY = cy, endX = cx + 180f, endY = cy, type = UmlConnectorType.COMPOSITION))
                                    onDismissRequest()
                                }
                            )
                        }
                    }

                    2 -> {
                        // ================= 3. PARAMETERIZED DSA GENERATORS =================
                        // Dynamic Array Generator Card
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Icon(Icons.Default.ViewWeek, contentDescription = null, tint = Color(0xFFF59E0B))
                                        Text("Dynamic Array Generator", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    }
                                    Text("Size: $arraySize", fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B), fontSize = 13.sp)
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                // Size chips
                                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    listOf(3, 4, 5, 6, 8, 10, 16).forEach { sz ->
                                        FilterChip(
                                            selected = arraySize == sz,
                                            onClick = { arraySize = sz },
                                            label = { Text("$sz") },
                                            colors = FilterChipDefaults.filterChipColors(
                                                selectedContainerColor = Color(0x33F59E0B),
                                                selectedLabelColor = Color(0xFFF59E0B)
                                            )
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                // Manual Numerical Entry Stepper
                                NumberStepper(
                                    value = arraySize,
                                    onValueChange = { arraySize = it },
                                    range = 1..32,
                                    label = "Manual Cell Count:"
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Display Index Labels (0..${arraySize - 1})", fontSize = 12.sp)
                                    Switch(checked = arrayShowIndices, onCheckedChange = { arrayShowIndices = it })
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(if (arrayIsHorizontal) "Orientation: Horizontal [0|1|2...]" else "Orientation: Vertical Column", fontSize = 12.sp)
                                    Switch(checked = arrayIsHorizontal, onCheckedChange = { arrayIsHorizontal = it })
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Button(
                                    onClick = {
                                        handleShapeAction(ShapePlacementType.DYNAMIC_ARRAY) {
                                            RecognizedShape.DynamicArray(
                                                centerX = cx,
                                                centerY = cy,
                                                size = arraySize,
                                                cellWidth = 80f,
                                                cellHeight = 80f,
                                                showIndices = arrayShowIndices,
                                                isHorizontal = arrayIsHorizontal
                                            )
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B), contentColor = Color(0xFF0E0F13)),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(if (useDragToStretchMode) "Drag to Place Array ($arraySize Cells)" else "Stamp Dynamic Array ($arraySize Cells)", fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Dynamic Linked List Generator Card
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = Color(0xFFF59E0B))
                                        Text("Dynamic Linked List Generator", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    }
                                    Text("Nodes: $listNodeCount", fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B), fontSize = 13.sp)
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    listOf(1, 2, 3, 4, 5, 8).forEach { cnt ->
                                        FilterChip(
                                            selected = listNodeCount == cnt,
                                            onClick = { listNodeCount = cnt },
                                            label = { Text("$cnt") },
                                            colors = FilterChipDefaults.filterChipColors(
                                                selectedContainerColor = Color(0x33F59E0B),
                                                selectedLabelColor = Color(0xFFF59E0B)
                                            )
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                // Manual Numerical Entry Stepper
                                NumberStepper(
                                    value = listNodeCount,
                                    onValueChange = { listNodeCount = it },
                                    range = 1..20,
                                    label = "Manual Node Count:"
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(if (listIsDoubly) "Doubly Linked (prev ⇄ next)" else "Singly Linked (next ➔)", fontSize = 12.sp)
                                    Switch(checked = listIsDoubly, onCheckedChange = { listIsDoubly = it })
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Circular List (Tail wraps to Head)", fontSize = 12.sp)
                                    Switch(checked = listIsCircular, onCheckedChange = { listIsCircular = it })
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Include HEAD & NULL Pointers", fontSize = 12.sp)
                                    Switch(checked = listShowPointers, onCheckedChange = { listShowPointers = it })
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Button(
                                    onClick = {
                                        handleShapeAction(ShapePlacementType.DYNAMIC_LINKED_LIST) {
                                            RecognizedShape.DynamicLinkedList(
                                                centerX = cx,
                                                centerY = cy,
                                                nodeCount = listNodeCount,
                                                isDoubly = listIsDoubly,
                                                isCircular = listIsCircular,
                                                includeHeadNull = listShowPointers
                                            )
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B), contentColor = Color(0xFF0E0F13)),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(if (useDragToStretchMode) "Drag to Place Linked List ($listNodeCount Nodes)" else "Stamp Linked List ($listNodeCount Nodes)", fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Stack Generator Card
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Icon(Icons.Default.Storage, contentDescription = null, tint = Color(0xFFF59E0B))
                                        Text("Stack Data Structure", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    }
                                    Text("Slots: $stackSlots", fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B), fontSize = 13.sp)
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    listOf(2, 3, 4, 5, 6, 8).forEach { cnt ->
                                        FilterChip(
                                            selected = stackSlots == cnt,
                                            onClick = { stackSlots = cnt },
                                            label = { Text("$cnt") },
                                            colors = FilterChipDefaults.filterChipColors(
                                                selectedContainerColor = Color(0x33F59E0B),
                                                selectedLabelColor = Color(0xFFF59E0B)
                                            )
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                NumberStepper(
                                    value = stackSlots,
                                    onValueChange = { stackSlots = it },
                                    range = 1..12,
                                    label = "Capacity / Slots:"
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Include TOP -> Pointer", fontSize = 12.sp)
                                    Switch(checked = stackShowTopPointer, onCheckedChange = { stackShowTopPointer = it })
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Button(
                                    onClick = {
                                        handleShapeAction(ShapePlacementType.STACK) {
                                            RecognizedShape.Stack(
                                                centerX = cx,
                                                centerY = cy,
                                                width = 180f,
                                                height = 260f,
                                                slots = stackSlots,
                                                showTopPointer = stackShowTopPointer
                                            )
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B), contentColor = Color(0xFF0E0F13)),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(if (useDragToStretchMode) "Drag to Place Stack ($stackSlots Slots)" else "Stamp Stack ($stackSlots Slots)", fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Queue Generator Card
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Icon(Icons.Default.SyncAlt, contentDescription = null, tint = Color(0xFFF59E0B))
                                        Text("Queue (FIFO Pipeline)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    }
                                    Text("Slots: $queueSlots", fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B), fontSize = 13.sp)
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    listOf(2, 3, 4, 5, 6, 8).forEach { cnt ->
                                        FilterChip(
                                            selected = queueSlots == cnt,
                                            onClick = { queueSlots = cnt },
                                            label = { Text("$cnt") },
                                            colors = FilterChipDefaults.filterChipColors(
                                                selectedContainerColor = Color(0x33F59E0B),
                                                selectedLabelColor = Color(0xFFF59E0B)
                                            )
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                NumberStepper(
                                    value = queueSlots,
                                    onValueChange = { queueSlots = it },
                                    range = 1..12,
                                    label = "Capacity / Slots:"
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Include FRONT -> & <- REAR Pointers", fontSize = 12.sp)
                                    Switch(checked = queueShowPointers, onCheckedChange = { queueShowPointers = it })
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Button(
                                    onClick = {
                                        handleShapeAction(ShapePlacementType.QUEUE) {
                                            RecognizedShape.Queue(
                                                centerX = cx,
                                                centerY = cy,
                                                width = 320f,
                                                height = 120f,
                                                slots = queueSlots,
                                                showPointers = queueShowPointers
                                            )
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B), contentColor = Color(0xFF0E0F13)),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(if (useDragToStretchMode) "Drag to Place Queue ($queueSlots Slots)" else "Stamp Queue ($queueSlots Slots)", fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Binary Tree Node Generator Card
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Icon(Icons.Default.AccountTree, contentDescription = null, tint = Color(0xFFF59E0B))
                                        Text("Binary Tree Node", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    }
                                    Text("Root + Left/Right", fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B), fontSize = 13.sp)
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Include Left & Right Child Branches", fontSize = 12.sp)
                                    Switch(checked = treeShowChildren, onCheckedChange = { treeShowChildren = it })
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Button(
                                    onClick = {
                                        handleShapeAction(ShapePlacementType.BINARY_TREE) {
                                            RecognizedShape.BinaryTreeNode(
                                                centerX = cx,
                                                centerY = cy,
                                                radius = 32f,
                                                branchLength = 95f,
                                                showChildren = treeShowChildren
                                            )
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B), contentColor = Color(0xFF0E0F13)),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(if (useDragToStretchMode) "Drag to Place Binary Tree" else "Stamp Binary Tree", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
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
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
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
                    .background(Color(0x22F59E0B)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = Color(0xFFF59E0B),
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

@Composable
private fun NumberStepper(
    value: Int,
    onValueChange: (Int) -> Unit,
    range: IntRange,
    label: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Surface(
                shape = CircleShape,
                color = if (value > range.first) MaterialTheme.colorScheme.surfaceVariant else Color.Transparent,
                modifier = Modifier
                    .size(30.dp)
                    .clip(CircleShape)
                    .clickable(enabled = value > range.first) { onValueChange(value - 1) }
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Remove,
                        contentDescription = "Decrease",
                        tint = if (value > range.first) Color(0xFFF59E0B) else Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0x22F59E0B),
                modifier = Modifier.padding(horizontal = 4.dp)
            ) {
                Text(
                    text = "  $value  ",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = Color(0xFFF59E0B),
                    modifier = Modifier.padding(vertical = 4.dp)
                )
            }
            Surface(
                shape = CircleShape,
                color = if (value < range.last) MaterialTheme.colorScheme.surfaceVariant else Color.Transparent,
                modifier = Modifier
                    .size(30.dp)
                    .clip(CircleShape)
                    .clickable(enabled = value < range.last) { onValueChange(value + 1) }
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Increase",
                        tint = if (value < range.last) Color(0xFFF59E0B) else Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}
