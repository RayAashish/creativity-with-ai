package com.antigravity.note.ui.canvas

import android.graphics.Color as AndroidColor
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.NavigateBefore
import androidx.compose.material.icons.automirrored.filled.NavigateNext
import androidx.compose.material.icons.automirrored.filled.Redo
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoFixHigh
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FitScreen
import androidx.compose.material.icons.filled.FormatPaint
import androidx.compose.material.icons.filled.GridOn
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.PanTool
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.antigravity.note.document.manager.DocumentManager
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.inkengine.canvas.CanvasTool
import com.antigravity.note.inkengine.canvas.InkCanvasView
import com.antigravity.note.inkengine.palm.InputMode
import com.antigravity.note.library.db.NoteDatabase
import com.antigravity.note.library.repository.LibraryRepository
import com.antigravity.note.ui.library.DsaProblemHeader
import com.antigravity.note.ui.library.LibrarySidebarDrawer
import com.antigravity.note.ui.library.QuickSwitcherDialog
import kotlinx.coroutines.launch
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InkCanvasScreen(
    onNavigateToProbe: () -> Unit = {}
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val canvasView = remember { InkCanvasView(context) }

    // Repositories & Database
    val pageRepo = remember { PageRepository(File(context.filesDir, "notebooks")) }
    val database = remember { NoteDatabase.getInstance(context) }
    val libraryRepo = remember { LibraryRepository(database, pageRepo) }

    // Library State Flows
    val folders by libraryRepo.getAllFolders().collectAsStateWithLifecycle(emptyList())
    val notebooks by libraryRepo.getAllNotebooks().collectAsStateWithLifecycle(emptyList())
    val allPages by libraryRepo.searchPages("").collectAsStateWithLifecycle(emptyList())
    val duePages by libraryRepo.getDueReviewPages().collectAsStateWithLifecycle(emptyList())

    // Document Manager
    val docManager = remember { DocumentManager(pageRepo, "nb_two_pointers") }
    val currentPage by docManager.currentPage.collectAsStateWithLifecycle()
    val pagesList by docManager.pagesList.collectAsStateWithLifecycle()
    val openLatency by docManager.lastOpenLatencyMs.collectAsStateWithLifecycle()

    // UI State
    var isSidebarOpen by remember { mutableStateOf(false) }
    var isQuickSwitcherOpen by remember { mutableStateOf(false) }
    var selectedTool by remember { mutableStateOf(CanvasTool.PRESSURE_PEN) }
    var selectedColor by remember { mutableStateOf(Color(0xFF111318)) }
    var selectedWidth by remember { mutableFloatStateOf(6f) }
    var canUndo by remember { mutableStateOf(false) }
    var canRedo by remember { mutableStateOf(false) }
    var inputMode by remember { mutableStateOf(InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM) }
    var isDebugOverlayOn by remember { mutableStateOf(true) }
    var showTemplateMenu by remember { mutableStateOf(false) }

    // Match current page with Library DB for DSA metadata
    val currentProblemPage = remember(currentPage, allPages) {
        val pId = currentPage?.metadata?.pageId
        allPages.firstOrNull { it.pageId == pId }
    }

    // Seed DSA structure on launch if empty and load first problem
    LaunchedEffect(Unit) {
        val seededNotebookId = libraryRepo.seedDsaDreamTemplate()
        docManager.initialize(seededNotebookId) {
            val page = docManager.currentPage.value
            if (page != null) {
                canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
            }
        }
    }

    // Register canvas callbacks
    remember(canvasView, docManager) {
        canvasView.onUndoRedoStateChanged = { u, r ->
            canUndo = u
            canRedo = r
        }
        canvasView.onStrokeCommitted = { stroke ->
            docManager.onStrokeCommitted(stroke)
        }
        canvasView.onUndoCommitted = { stroke ->
            docManager.onUndoCommitted(stroke)
        }
        canvasView.onClearCommitted = {
            docManager.onClearCommitted()
        }
    }

    val palette = listOf(
        Color(0xFF111318), // Black
        Color(0xFF005AC1), // Ink Blue
        Color(0xFFBA1A1A), // Red
        Color(0xFF146C2E), // Green
        Color(0xFF6750A4), // Purple
        Color(0xFFFFD600)  // Highlighter Yellow
    )

    Box(modifier = Modifier.fillMaxSize()) {
        // Dedicated SurfaceView-backed Inking Canvas (Hot Path)
        AndroidView(
            factory = { canvasView },
            modifier = Modifier.fillMaxSize()
        )

        // Top Chrome: Floating Toolbars & Controls
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Card(
                modifier = Modifier.padding(top = 16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.96f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                shape = RoundedCornerShape(20.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Sidebar Toggle Button
                    IconButton(onClick = { isSidebarOpen = !isSidebarOpen }) {
                        Icon(
                            imageVector = Icons.Default.Menu,
                            contentDescription = "DSA Tree Explorer",
                            tint = if (isSidebarOpen) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                        )
                    }

                    // Quick Switcher Button
                    IconButton(onClick = { isQuickSwitcherOpen = true }) {
                        Icon(Icons.Default.Search, contentDescription = "Quick Switcher (Ctrl+K)")
                    }

                    Spacer(modifier = Modifier.width(4.dp))
                    Box(
                        modifier = Modifier
                            .height(28.dp)
                            .width(1.dp)
                            .background(MaterialTheme.colorScheme.outlineVariant)
                    )
                    Spacer(modifier = Modifier.width(4.dp))

                    // Tool selection: Pen, Marker, Highlighter, Eraser
                    ToolIconButton(
                        icon = Icons.Default.Edit,
                        label = "Pen",
                        isSelected = selectedTool == CanvasTool.PRESSURE_PEN,
                        onClick = {
                            selectedTool = CanvasTool.PRESSURE_PEN
                            canvasView.setTool(CanvasTool.PRESSURE_PEN)
                        }
                    )
                    ToolIconButton(
                        icon = Icons.Default.Brush,
                        label = "Marker",
                        isSelected = selectedTool == CanvasTool.MARKER,
                        onClick = {
                            selectedTool = CanvasTool.MARKER
                            canvasView.setTool(CanvasTool.MARKER)
                        }
                    )
                    ToolIconButton(
                        icon = Icons.Default.FormatPaint,
                        label = "Highlighter",
                        isSelected = selectedTool == CanvasTool.HIGHLIGHTER,
                        onClick = {
                            selectedTool = CanvasTool.HIGHLIGHTER
                            canvasView.setTool(CanvasTool.HIGHLIGHTER)
                        }
                    )
                    ToolIconButton(
                        icon = Icons.Default.AutoFixHigh,
                        label = "Eraser",
                        isSelected = selectedTool == CanvasTool.STROKE_ERASER,
                        onClick = {
                            selectedTool = CanvasTool.STROKE_ERASER
                            canvasView.setTool(CanvasTool.STROKE_ERASER)
                        }
                    )

                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .height(28.dp)
                            .width(1.dp)
                            .background(MaterialTheme.colorScheme.outlineVariant)
                    )
                    Spacer(modifier = Modifier.width(8.dp))

                    // Color Palette
                    palette.forEach { color ->
                        val isSelected = selectedColor == color
                        Box(
                            modifier = Modifier
                                .size(26.dp)
                                .clip(CircleShape)
                                .background(color)
                                .border(
                                    width = if (isSelected) 3.dp else 1.dp,
                                    color = if (isSelected) MaterialTheme.colorScheme.primary else Color.LightGray,
                                    shape = CircleShape
                                )
                                .clickable {
                                    selectedColor = color
                                    val intColor = AndroidColor.argb(
                                        (color.alpha * 255).toInt(),
                                        (color.red * 255).toInt(),
                                        (color.green * 255).toInt(),
                                        (color.blue * 255).toInt()
                                    )
                                    canvasView.setInkColor(intColor)
                                }
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .height(28.dp)
                            .width(1.dp)
                            .background(MaterialTheme.colorScheme.outlineVariant)
                    )
                    Spacer(modifier = Modifier.width(8.dp))

                    // Stroke Widths
                    listOf(3f to "Fine", 6f to "Med", 14f to "Bold").forEach { (width, label) ->
                        val isSelected = selectedWidth == width
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .clickable {
                                    selectedWidth = width
                                    canvasView.setInkWidth(width)
                                },
                            color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
                        ) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .height(28.dp)
                            .width(1.dp)
                            .background(MaterialTheme.colorScheme.outlineVariant)
                    )
                    Spacer(modifier = Modifier.width(8.dp))

                    // Undo / Redo
                    IconButton(
                        onClick = { canvasView.undo() },
                        enabled = canUndo
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Undo,
                            contentDescription = "Undo",
                            tint = if (canUndo) MaterialTheme.colorScheme.onSurface else Color.LightGray
                        )
                    }
                    IconButton(
                        onClick = { canvasView.redo() },
                        enabled = canRedo
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Redo,
                            contentDescription = "Redo",
                            tint = if (canRedo) MaterialTheme.colorScheme.onSurface else Color.LightGray
                        )
                    }

                    // Paper Template Picker Button
                    Box {
                        IconButton(onClick = { showTemplateMenu = true }) {
                            Icon(Icons.Default.GridOn, contentDescription = "Paper Template")
                        }
                        DropdownMenu(
                            expanded = showTemplateMenu,
                            onDismissRequest = { showTemplateMenu = false }
                        ) {
                            PaperTemplate.entries.forEach { template ->
                                DropdownMenuItem(
                                    text = { Text(template.displayName) },
                                    onClick = {
                                        showTemplateMenu = false
                                        docManager.setPaperTemplate(template)
                                        canvasView.setPaperTemplate(template)
                                    }
                                )
                            }
                        }
                    }

                    // Reset Zoom
                    IconButton(onClick = { canvasView.resetZoom() }) {
                        Icon(Icons.Default.FitScreen, contentDescription = "Reset Zoom")
                    }

                    // Clear
                    IconButton(onClick = { canvasView.clearCanvas() }) {
                        Icon(Icons.Default.Delete, contentDescription = "Clear Canvas", tint = Color(0xFFBA1A1A))
                    }

                    // Probe mode button
                    IconButton(onClick = onNavigateToProbe) {
                        Icon(Icons.Default.Speed, contentDescription = "Hardware Probe", tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }

            // DSA Problem Page Template Banner (Displays when on a Problem Page)
            if (currentProblemPage != null && currentProblemPage.isProblemPage) {
                DsaProblemHeader(
                    problemPage = currentProblemPage,
                    onStatusChanged = { newStatus ->
                        scope.launch {
                            libraryRepo.updatePage(currentProblemPage.copy(problemStatus = newStatus))
                        }
                    }
                )
            }
        }

        // Bottom Center: Page Navigation Bar
        Card(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.94f)),
            shape = RoundedCornerShape(14.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                val currentIndex = pagesList.indexOfFirst { it.pageId == currentPage?.metadata?.pageId }.coerceAtLeast(0)
                val totalPages = pagesList.size.coerceAtLeast(1)

                IconButton(
                    onClick = {
                        docManager.previousPage { page ->
                            canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                        }
                    },
                    enabled = currentIndex > 0
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.NavigateBefore,
                        contentDescription = "Previous Page",
                        tint = if (currentIndex > 0) MaterialTheme.colorScheme.onSurface else Color.LightGray
                    )
                }

                Text(
                    text = "Page ${currentIndex + 1} / $totalPages",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(horizontal = 6.dp)
                )

                IconButton(
                    onClick = {
                        docManager.nextPage { page ->
                            canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.NavigateNext,
                        contentDescription = "Next Page"
                    )
                }

                IconButton(
                    onClick = {
                        docManager.addNewPage(currentPage?.metadata?.template ?: PaperTemplate.RULED) { page ->
                            canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add Page",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        // Bottom Right: Palm Rejection & Input Mode Selector Pill
        Card(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.94f)),
            shape = RoundedCornerShape(14.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.PanTool,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Text("Input Mode:", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)

                FilterChip(
                    selected = inputMode == InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM,
                    onClick = {
                        inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM
                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM)
                    },
                    label = { Text("A: Pen + Gestures", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = inputMode == InputMode.PEN_ONLY,
                    onClick = {
                        inputMode = InputMode.PEN_ONLY
                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(inputMode = InputMode.PEN_ONLY)
                    },
                    label = { Text("B: Pen Only", fontSize = 11.sp) }
                )
                FilterChip(
                    selected = inputMode == InputMode.PEN_AND_FINGER_DRAW,
                    onClick = {
                        inputMode = InputMode.PEN_AND_FINGER_DRAW
                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(inputMode = InputMode.PEN_AND_FINGER_DRAW)
                    },
                    label = { Text("C: All Draw", fontSize = 11.sp) }
                )

                // Debug HUD Toggle
                IconButton(
                    onClick = {
                        isDebugOverlayOn = !isDebugOverlayOn
                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(debugOverlayEnabled = isDebugOverlayOn)
                        canvasView.invalidate()
                    },
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.BugReport,
                        contentDescription = "Toggle Debug HUD",
                        tint = if (isDebugOverlayOn) MaterialTheme.colorScheme.primary else Color.Gray,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        // Persistent Left Sidebar Drawer (Animated Slide In/Out)
        AnimatedVisibility(
            visible = isSidebarOpen,
            enter = slideInHorizontally(initialOffsetX = { -it }),
            exit = slideOutHorizontally(targetOffsetX = { -it }),
            modifier = Modifier.align(Alignment.CenterStart)
        ) {
            LibrarySidebarDrawer(
                folders = folders,
                notebooks = notebooks,
                pages = allPages,
                activePageId = currentPage?.metadata?.pageId,
                dueReviewCount = duePages.size,
                onPageSelected = { notebookId, pageId ->
                    docManager.switchToPage(pageId) { page ->
                        canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                    }
                    isSidebarOpen = false
                },
                onOpenQuickSwitcher = {
                    isQuickSwitcherOpen = true
                },
                onCloseSidebar = {
                    isSidebarOpen = false
                }
            )
        }

        // Quick Switcher Dialog (Ctrl+K Command Palette)
        if (isQuickSwitcherOpen) {
            QuickSwitcherDialog(
                allPages = allPages,
                onPageSelected = { notebookId, pageId ->
                    docManager.switchToPage(pageId) { page ->
                        canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                    }
                },
                onDismissRequest = { isQuickSwitcherOpen = false }
            )
        }
    }
}

@Composable
private fun ToolIconButton(
    icon: ImageVector,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .clickable(onClick = onClick),
        color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.size(18.dp)
            )
            Text(
                text = label,
                fontSize = 12.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
