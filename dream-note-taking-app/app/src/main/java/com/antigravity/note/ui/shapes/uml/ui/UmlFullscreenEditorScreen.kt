package com.antigravity.note.ui.shapes.uml.ui

import android.graphics.PointF
import android.graphics.RectF
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Circle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CropLandscape
import androidx.compose.material.icons.filled.CropSquare
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.HorizontalRule
import androidx.compose.material.icons.filled.Note
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schema
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material.icons.filled.ViewAgenda
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.PointerType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.antigravity.note.ui.shapes.uml.engine.OrthogonalRouter
import com.antigravity.note.ui.shapes.uml.engine.ResizeHandlePosition
import com.antigravity.note.ui.shapes.uml.engine.UmlCanvasRenderer
import com.antigravity.note.ui.shapes.uml.engine.UmlSpatialIndex
import com.antigravity.note.ui.shapes.uml.engine.UmlUndoRedoStack
import com.antigravity.note.ui.shapes.uml.model.UmlDiagram
import com.antigravity.note.ui.shapes.uml.model.UmlEdge
import com.antigravity.note.ui.shapes.uml.model.UmlNode
import com.antigravity.note.ui.shapes.uml.model.UmlNodeType
import com.antigravity.note.ui.shapes.uml.model.UmlPort
import com.antigravity.note.ui.shapes.uml.model.UmlPortPosition
import com.antigravity.note.ui.shapes.uml.model.UmlRelationshipType
import com.antigravity.note.ui.shapes.uml.model.UmlRoutingMode
import java.util.UUID

/**
 * Dedicated Fullscreen UML Canvas Editor for Android.
 * Butter-smooth 60-120fps hardware-accelerated rendering, 2-finger zoom/pan,
 * 1-finger node drag with grid snap and alignment guides, magnetic port snapping,
 * and structured Material 3 bottom sheets.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UmlFullscreenEditorScreen(
    initialDiagram: UmlDiagram,
    onSaveAndClose: (UmlDiagram) -> Unit,
    onDismissRequest: () -> Unit
) {
    val context = LocalContext.current
    val haptics = LocalHapticFeedback.current

    // Undo/Redo & Diagram State
    val undoRedoStack = remember { UmlUndoRedoStack(initialDiagram) }
    var currentDiagram by remember { mutableStateOf(initialDiagram) }

    // Camera Viewport State
    var zoomScale by remember { mutableFloatStateOf(initialDiagram.viewportZoom.coerceIn(0.25f, 3.0f)) }
    var panX by remember { mutableFloatStateOf(initialDiagram.viewportPanX) }
    var panY by remember { mutableFloatStateOf(initialDiagram.viewportPanY) }

    // Active Selection State
    var selectedNode by remember { mutableStateOf<UmlNode?>(null) }
    var selectedEdge by remember { mutableStateOf<UmlEdge?>(null) }
    var hoveredPort by remember { mutableStateOf<UmlPort?>(null) }
    var connectingStartPort by remember { mutableStateOf<UmlPort?>(null) }
    var connectingLivePoint by remember { mutableStateOf<PointF?>(null) }

    // Magnetic Alignment Guide Lines
    var snapLineX by remember { mutableStateOf<Float?>(null) }
    var snapLineY by remember { mutableStateOf<Float?>(null) }

    // Tool State
    var activeTool by remember { mutableStateOf(UmlEditorTool.SELECT_PAN) }
    var isAddShapeMenuOpen by remember { mutableStateOf(false) }

    // Bottom Sheet Modals
    var editingNode by remember { mutableStateOf<UmlNode?>(null) }
    var editingEdge by remember { mutableStateOf<UmlEdge?>(null) }

    val renderer = remember { UmlCanvasRenderer() }

    val commitDiagramChange: (UmlDiagram) -> Unit = { newDiagram ->
        undoRedoStack.pushState(newDiagram)
        currentDiagram = newDiagram
        selectedNode = selectedNode?.let { newDiagram.findNode(it.id) }
        selectedEdge = selectedEdge?.let { newDiagram.findEdge(it.id) }
    }

    Dialog(
        onDismissRequest = onDismissRequest,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            dismissOnBackPress = true,
            dismissOnClickOutside = false
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(if (currentDiagram.isDarkMode) Color(0xFF121418) else Color(0xFFF8FAFC))
        ) {
            // Interactive 120fps Hardware-Accelerated Canvas
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .pointerInput(Unit) {
                        // 2-Finger Pan & Pinch-Zoom Gestures
                        detectTransformGestures { centroid, pan, zoom, _ ->
                            val oldZoom = zoomScale
                            val newZoom = (oldZoom * zoom).coerceIn(0.25f, 3.0f)
                            // Zoom relative to touch centroid
                            val factor = newZoom / oldZoom
                            panX = centroid.x - (centroid.x - panX) * factor + pan.x
                            panY = centroid.y - (centroid.y - panY) * factor + pan.y
                            zoomScale = newZoom
                        }
                    }
                    .pointerInput(currentDiagram, activeTool, selectedNode) {
                        // Touch / Drag Interaction
                        detectDragGestures(
                            onDragStart = { offset ->
                                val worldX = (offset.x - panX) / zoomScale
                                val worldY = (offset.y - panY) / zoomScale

                                // Check port hit first for connector creation
                                val hitPort = UmlSpatialIndex.hitTestPort(worldX, worldY, currentDiagram.nodes, touchSlopPx = 48f / zoomScale)
                                if (hitPort != null || activeTool == UmlEditorTool.CONNECT) {
                                    if (hitPort != null) {
                                        connectingStartPort = hitPort
                                        connectingLivePoint = PointF(worldX, worldY)
                                        haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                        return@detectDragGestures
                                    }
                                }

                                // Check node hit
                                val hitNode = UmlSpatialIndex.hitTestNode(worldX, worldY, currentDiagram.nodes)
                                if (hitNode != null) {
                                    selectedNode = hitNode
                                    selectedEdge = null
                                } else {
                                    // Check edge hit
                                    val hitEdge = UmlSpatialIndex.hitTestEdge(worldX, worldY, currentDiagram, tolerancePx = 32f / zoomScale)
                                    if (hitEdge != null) {
                                        selectedEdge = hitEdge
                                        selectedNode = null
                                    } else {
                                        selectedNode = null
                                        selectedEdge = null
                                    }
                                }
                            },
                            onDrag = { change, dragAmount ->
                                change.consume()
                                val curX = (change.position.x - panX) / zoomScale
                                val curY = (change.position.y - panY) / zoomScale

                                if (connectingStartPort != null) {
                                    connectingLivePoint = PointF(curX, curY)
                                    // Live snap to nearby ports
                                    val nearbyPort = UmlSpatialIndex.hitTestPort(curX, curY, currentDiagram.nodes, touchSlopPx = 36f / zoomScale)
                                    if (nearbyPort != null && nearbyPort.nodeId != connectingStartPort?.nodeId) {
                                        if (hoveredPort != nearbyPort) {
                                            hoveredPort = nearbyPort
                                            haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                        }
                                    } else {
                                        hoveredPort = null
                                    }
                                } else if (selectedNode != null) {
                                    val dx = dragAmount.x / zoomScale
                                    val dy = dragAmount.y / zoomScale
                                    var newX = selectedNode!!.x + dx
                                    var newY = selectedNode!!.y + dy

                                    // Snap-to-grid (16dp increments)
                                    val gridSnap = 16f
                                    val snappedX = kotlin.math.round(newX / gridSnap) * gridSnap
                                    val snappedY = kotlin.math.round(newY / gridSnap) * gridSnap
                                    if (kotlin.math.abs(newX - snappedX) < 4f) {
                                        newX = snappedX
                                        snapLineX = snappedX
                                    } else {
                                        snapLineX = null
                                    }
                                    if (kotlin.math.abs(newY - snappedY) < 4f) {
                                        newY = snappedY
                                        snapLineY = snappedY
                                    } else {
                                        snapLineY = null
                                    }

                                    val updated = selectedNode!!.copy(x = newX, y = newY)
                                    selectedNode = updated
                                    currentDiagram = currentDiagram.copyWithUpdatedNode(updated)
                                } else {
                                    // Dragging on empty space pans canvas
                                    panX += dragAmount.x
                                    panY += dragAmount.y
                                }
                            },
                            onDragEnd = {
                                snapLineX = null
                                snapLineY = null

                                if (connectingStartPort != null) {
                                    val startPort = connectingStartPort!!
                                    val targetPort = hoveredPort
                                    if (targetPort != null && targetPort.nodeId != startPort.nodeId) {
                                        val newEdge = UmlEdge(
                                            id = UUID.randomUUID().toString(),
                                            sourceNodeId = startPort.nodeId,
                                            sourcePortPosition = startPort.position,
                                            targetNodeId = targetPort.nodeId,
                                            targetPortPosition = targetPort.position,
                                            relationshipType = UmlRelationshipType.DIRECTED,
                                            routingMode = UmlRoutingMode.ORTHOGONAL
                                        )
                                        commitDiagramChange(currentDiagram.copy(edges = currentDiagram.edges + newEdge))
                                        haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                    }
                                    connectingStartPort = null
                                    connectingLivePoint = null
                                    hoveredPort = null
                                } else if (selectedNode != null) {
                                    commitDiagramChange(currentDiagram)
                                }
                            },
                            onDragCancel = {
                                snapLineX = null
                                snapLineY = null
                                connectingStartPort = null
                                connectingLivePoint = null
                                hoveredPort = null
                            }
                        )
                    }
                    .pointerInput(currentDiagram) {
                        detectTapGestures(
                            onDoubleTap = { offset ->
                                val worldX = (offset.x - panX) / zoomScale
                                val worldY = (offset.y - panY) / zoomScale
                                val hitNode = UmlSpatialIndex.hitTestNode(worldX, worldY, currentDiagram.nodes)
                                if (hitNode != null) {
                                    editingNode = hitNode
                                } else {
                                    val hitEdge = UmlSpatialIndex.hitTestEdge(worldX, worldY, currentDiagram, tolerancePx = 32f / zoomScale)
                                    if (hitEdge != null) {
                                        editingEdge = hitEdge
                                    }
                                }
                            },
                            onTap = { offset ->
                                val worldX = (offset.x - panX) / zoomScale
                                val worldY = (offset.y - panY) / zoomScale
                                val hitNode = UmlSpatialIndex.hitTestNode(worldX, worldY, currentDiagram.nodes)
                                if (hitNode != null) {
                                    selectedNode = hitNode
                                    selectedEdge = null
                                } else {
                                    val hitEdge = UmlSpatialIndex.hitTestEdge(worldX, worldY, currentDiagram, tolerancePx = 32f / zoomScale)
                                    if (hitEdge != null) {
                                        selectedEdge = hitEdge
                                        selectedNode = null
                                    } else {
                                        selectedNode = null
                                        selectedEdge = null
                                    }
                                }
                            }
                        )
                    }
            ) {
                drawIntoCanvas { composeCanvas ->
                    val nativeCanvas = composeCanvas.nativeCanvas
                    nativeCanvas.save()
                    nativeCanvas.translate(panX, panY)
                    nativeCanvas.scale(zoomScale, zoomScale)

                    val viewW = size.width / zoomScale
                    val viewH = size.height / zoomScale
                    val viewLeft = -panX / zoomScale
                    val viewTop = -panY / zoomScale
                    val viewportRect = RectF(viewLeft, viewTop, viewLeft + viewW, viewTop + viewH)

                    val connLine = if (connectingStartPort != null && connectingLivePoint != null) {
                        val endPt = hoveredPort?.toPointF() ?: connectingLivePoint!!
                        Pair(connectingStartPort!!.toPointF(), endPt)
                    } else null

                    renderer.renderDiagram(
                        canvas = nativeCanvas,
                        diagram = currentDiagram,
                        selectedNode = selectedNode,
                        selectedEdge = selectedEdge,
                        hoveredPort = hoveredPort,
                        connectingLine = connLine,
                        snapLineX = snapLineX,
                        snapLineY = snapLineY,
                        viewportRect = viewportRect,
                        drawBackgroundGrid = true
                    )

                    nativeCanvas.restore()
                }
            }

            // Top Bar
            Surface(
                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.92f),
                tonalElevation = 6.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.TopCenter)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        IconButton(onClick = onDismissRequest) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                        Column {
                            Text(
                                text = currentDiagram.title,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${currentDiagram.nodes.size} nodes • ${currentDiagram.edges.size} connections • ${(zoomScale * 100).toInt()}% zoom",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        if (selectedNode != null) {
                            Button(
                                onClick = { editingNode = selectedNode },
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("Edit Node", fontSize = 12.sp)
                            }
                        }

                        Button(
                            onClick = {
                                val finalDiagram = currentDiagram.copy(
                                    viewportZoom = zoomScale,
                                    viewportPanX = panX,
                                    viewportPanY = panY
                                )
                                onSaveAndClose(finalDiagram)
                            },
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Done", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Floating Tool Dock (Bottom Center)
            UmlFloatingToolDock(
                activeTool = activeTool,
                onSelectTool = { activeTool = it },
                onOpenAddShapeMenu = { isAddShapeMenuOpen = true },
                canUndo = undoRedoStack.canUndo,
                onUndo = {
                    val undone = undoRedoStack.undo()
                    if (undone != null) {
                        currentDiagram = undone
                        selectedNode = selectedNode?.let { undone.findNode(it.id) }
                        selectedEdge = selectedEdge?.let { undone.findEdge(it.id) }
                        haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    }
                },
                canRedo = undoRedoStack.canRedo,
                onRedo = {
                    val redone = undoRedoStack.redo()
                    if (redone != null) {
                        currentDiagram = redone
                        selectedNode = selectedNode?.let { redone.findNode(it.id) }
                        selectedEdge = selectedEdge?.let { redone.findEdge(it.id) }
                        haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    }
                },
                onCenterFit = {
                    val bounds = currentDiagram.computeBoundingBox()
                    zoomScale = 1.0f
                    panX = 300f - bounds.centerX()
                    panY = 300f - bounds.centerY()
                },
                onExport = {
                    UmlExporter.shareDiagramPng(context, currentDiagram)
                },
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 24.dp)
            )

            // Add Shape Bottom Sheet
            if (isAddShapeMenuOpen) {
                AddShapePaletteBottomSheet(
                    onInsertNodeType = { nodeType ->
                        isAddShapeMenuOpen = false
                        val centerX = (-panX + 500f) / zoomScale
                        val centerY = (-panY + 400f) / zoomScale
                        val newNode = createDefaultNode(nodeType, centerX, centerY)
                        commitDiagramChange(currentDiagram.copy(nodes = currentDiagram.nodes + newNode))
                        selectedNode = newNode
                        haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                    },
                    onDismissRequest = { isAddShapeMenuOpen = false }
                )
            }

            // Node Structured Editor
            if (editingNode != null) {
                UmlNodeEditBottomSheet(
                    node = editingNode!!,
                    onSaveNode = { updated ->
                        commitDiagramChange(currentDiagram.copyWithUpdatedNode(updated))
                        editingNode = null
                    },
                    onDeleteNode = { nodeId ->
                        commitDiagramChange(currentDiagram.copyWithoutNode(nodeId))
                        selectedNode = null
                        editingNode = null
                    },
                    onDismissRequest = { editingNode = null }
                )
            }

            // Edge Structured Editor
            if (editingEdge != null) {
                UmlEdgeEditBottomSheet(
                    edge = editingEdge!!,
                    onSaveEdge = { updated ->
                        commitDiagramChange(currentDiagram.copyWithUpdatedEdge(updated))
                        editingEdge = null
                    },
                    onDeleteEdge = { edgeId ->
                        commitDiagramChange(currentDiagram.copyWithoutEdge(edgeId))
                        selectedEdge = null
                        editingEdge = null
                    },
                    onDismissRequest = { editingEdge = null }
                )
            }
        }
    }
}

private fun createDefaultNode(type: UmlNodeType, cx: Float, cy: Float): UmlNode {
    return when (type) {
        UmlNodeType.CLASS -> UmlNode(
            type = UmlNodeType.CLASS,
            x = cx - 110f, y = cy - 75f,
            width = 220f, height = 150f,
            title = "Class",
            attributes = listOf("+ id: Long", "+ name: String"),
            methods = listOf("+ save(): Boolean")
        )
        UmlNodeType.INTERFACE -> UmlNode(
            type = UmlNodeType.INTERFACE,
            x = cx - 100f, y = cy - 60f,
            width = 200f, height = 120f,
            title = "Repository",
            stereotype = "<<interface>>",
            methods = listOf("+ findById(id: Long): Item")
        )
        UmlNodeType.ACTOR -> UmlNode(
            type = UmlNodeType.ACTOR,
            x = cx - 40f, y = cy - 70f,
            width = 80f, height = 140f,
            title = "Actor"
        )
        UmlNodeType.USE_CASE -> UmlNode(
            type = UmlNodeType.USE_CASE,
            x = cx - 80f, y = cy - 40f,
            width = 160f, height = 80f,
            title = "Use Case"
        )
        UmlNodeType.BOUNDARY -> UmlNode(
            type = UmlNodeType.BOUNDARY,
            x = cx - 160f, y = cy - 120f,
            width = 320f, height = 240f,
            title = "System Boundary"
        )
        UmlNodeType.LIFELINE -> UmlNode(
            type = UmlNodeType.LIFELINE,
            x = cx - 60f, y = cy - 120f,
            width = 120f, height = 280f,
            title = "Service"
        )
        UmlNodeType.ACTIVATION_BAR -> UmlNode(
            type = UmlNodeType.ACTIVATION_BAR,
            x = cx - 14f, y = cy - 70f,
            width = 28f, height = 140f,
            title = ""
        )
        UmlNodeType.INITIAL_NODE -> UmlNode(
            type = UmlNodeType.INITIAL_NODE,
            x = cx - 20f, y = cy - 20f,
            width = 40f, height = 40f,
            title = ""
        )
        UmlNodeType.FINAL_NODE -> UmlNode(
            type = UmlNodeType.FINAL_NODE,
            x = cx - 22f, y = cy - 22f,
            width = 44f, height = 44f,
            title = ""
        )
        UmlNodeType.ACTION_STATE -> UmlNode(
            type = UmlNodeType.ACTION_STATE,
            x = cx - 80f, y = cy - 35f,
            width = 160f, height = 70f,
            title = "Process Request"
        )
        UmlNodeType.DECISION -> UmlNode(
            type = UmlNodeType.DECISION,
            x = cx - 50f, y = cy - 40f,
            width = 100f, height = 80f,
            title = "Valid?"
        )
        UmlNodeType.FORK_JOIN -> UmlNode(
            type = UmlNodeType.FORK_JOIN,
            x = cx - 100f, y = cy - 6f,
            width = 200f, height = 12f,
            title = ""
        )
        UmlNodeType.NOTE -> UmlNode(
            type = UmlNodeType.NOTE,
            x = cx - 80f, y = cy - 50f,
            width = 160f, height = 100f,
            title = "Important note..."
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun AddShapePaletteBottomSheet(
    onInsertNodeType: (UmlNodeType) -> Unit,
    onDismissRequest: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        sheetState = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 36.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                text = "Add UML Shape",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(16.dp))

            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                PaletteCard(icon = Icons.Default.ViewAgenda, label = "Class", onClick = { onInsertNodeType(UmlNodeType.CLASS) })
                PaletteCard(icon = Icons.Default.Schema, label = "Interface", onClick = { onInsertNodeType(UmlNodeType.INTERFACE) })
                PaletteCard(icon = Icons.Default.Person, label = "Actor", onClick = { onInsertNodeType(UmlNodeType.ACTOR) })
                PaletteCard(icon = Icons.Default.Circle, label = "Use Case", onClick = { onInsertNodeType(UmlNodeType.USE_CASE) })
                PaletteCard(icon = Icons.Default.CropSquare, label = "Boundary", onClick = { onInsertNodeType(UmlNodeType.BOUNDARY) })
                PaletteCard(icon = Icons.Default.Timeline, label = "Lifeline", onClick = { onInsertNodeType(UmlNodeType.LIFELINE) })
                PaletteCard(icon = Icons.Default.CropLandscape, label = "Activation", onClick = { onInsertNodeType(UmlNodeType.ACTIVATION_BAR) })
                PaletteCard(icon = Icons.Default.Circle, label = "Initial Node", onClick = { onInsertNodeType(UmlNodeType.INITIAL_NODE) })
                PaletteCard(icon = Icons.Default.Circle, label = "Final Node", onClick = { onInsertNodeType(UmlNodeType.FINAL_NODE) })
                PaletteCard(icon = Icons.Default.CropSquare, label = "Action State", onClick = { onInsertNodeType(UmlNodeType.ACTION_STATE) })
                PaletteCard(icon = Icons.Default.Diamond, label = "Decision", onClick = { onInsertNodeType(UmlNodeType.DECISION) })
                PaletteCard(icon = Icons.Default.HorizontalRule, label = "Fork / Join", onClick = { onInsertNodeType(UmlNodeType.FORK_JOIN) })
                PaletteCard(icon = Icons.Default.Note, label = "Note", onClick = { onInsertNodeType(UmlNodeType.NOTE) })
            }
        }
    }
}

@Composable
private fun PaletteCard(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
        modifier = Modifier
            .width(100.dp)
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(28.dp))
            Spacer(modifier = Modifier.height(6.dp))
            Text(label, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
        }
    }
}
