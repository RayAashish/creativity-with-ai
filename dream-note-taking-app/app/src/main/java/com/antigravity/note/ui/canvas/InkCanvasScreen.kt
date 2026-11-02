package com.antigravity.note.ui.canvas

import android.graphics.Color as AndroidColor
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Slider
import androidx.compose.runtime.DisposableEffect
import com.antigravity.note.inkengine.audio.AudioStrokeRecorder
import com.antigravity.note.inkengine.export.InkflowManifest
import com.antigravity.note.inkengine.export.InkflowPageEntry
import com.antigravity.note.inkengine.export.PageExporter
import com.antigravity.note.ui.export.ExportDialog
import com.antigravity.note.ui.keyboard.KeyboardShortcutManager
import com.antigravity.note.ui.keyboard.NoteAppShortcut
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.NavigateBefore
import androidx.compose.material.icons.automirrored.filled.NavigateNext
import androidx.compose.material.icons.automirrored.filled.Redo
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoFixHigh
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FitScreen
import androidx.compose.material.icons.filled.FormatPaint
import androidx.compose.material.icons.filled.GridOn
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.PanTool
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SelectAll
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.TextFields
import android.widget.Toast
import com.antigravity.note.ui.library.ReviewTodayDialog
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Card
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.text.font.FontFamily
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
import android.content.Context
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

    // Phase 4 State
    var hasLassoSelection by remember { mutableStateOf(false) }
    var isShapeSnapOn by remember { mutableStateOf(true) }
    var isPdfLoaded by remember { mutableStateOf(false) }
    var currentPdfPage by remember { androidx.compose.runtime.mutableIntStateOf(0) }

    // Phase 5 State
    var isReviewTodayOpen by remember { mutableStateOf(false) }
    var recognizedTextResult by remember { mutableStateOf<String?>(null) }

    // Phase 6 State: Export & Synced Audio
    var isExportDialogOpen by remember { mutableStateOf(false) }
    var isExporting by remember { mutableStateOf(false) }
    var exportSuccessMessage by remember { mutableStateOf<String?>(null) }

    val audioRecorder = remember { AudioStrokeRecorder(context, scope) }
    var isRecordingAudio by remember { mutableStateOf(false) }
    var isPlayingAudio by remember { mutableStateOf(false) }
    var audioCurrentMs by remember { androidx.compose.runtime.mutableIntStateOf(0) }
    var audioTotalMs by remember { androidx.compose.runtime.mutableIntStateOf(0) }
    var hasRecordedAudio by remember { mutableStateOf(false) }
    var audioDurationSec by remember { androidx.compose.runtime.mutableIntStateOf(0) }

    // Match current page with Library DB for DSA metadata
    val currentProblemPage = remember(currentPage, allPages) {
        val pId = currentPage?.metadata?.pageId
        allPages.firstOrNull { it.pageId == pId }
    }

    LaunchedEffect(isRecordingAudio) {
        if (isRecordingAudio) {
            audioDurationSec = 0
            while (isRecordingAudio) {
                kotlinx.coroutines.delay(1000)
                audioDurationSec++
            }
        }
    }

    LaunchedEffect(currentPage?.metadata?.pageId) {
        val pageId = currentPage?.metadata?.pageId
        if (pageId != null) {
            val audioFile = File(context.filesDir, "audio/$pageId.m4a")
            hasRecordedAudio = audioFile.exists() && audioFile.length() > 0
        }
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
        if (!canvasView.digitalInkManager.isModelDownloaded()) {
            canvasView.digitalInkManager.downloadModelIfNeeded()
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
            if (isRecordingAudio) {
                audioRecorder.recordStrokeTiming(docManager.currentPage.value?.strokes?.size ?: 0)
            }
        }
        canvasView.onUndoCommitted = { stroke ->
            docManager.onUndoCommitted(stroke)
        }
        canvasView.onClearCommitted = {
            docManager.onClearCommitted()
        }
        canvasView.onLassoSelectionChanged = { selected ->
            hasLassoSelection = selected
        }
    }

    DisposableEffect(canvasView) {
        KeyboardShortcutManager.activeListener = { shortcut ->
            when (shortcut) {
                NoteAppShortcut.UNDO -> { canvasView.undo(); true }
                NoteAppShortcut.REDO -> { canvasView.redo(); true }
                NoteAppShortcut.QUICK_SWITCHER -> { isQuickSwitcherOpen = true; true }
                NoteAppShortcut.EXPORT -> {
                    exportSuccessMessage = null
                    isExportDialogOpen = true
                    true
                }
                NoteAppShortcut.NEW_PAGE -> {
                    docManager.addNewPage { p -> canvasView.loadPage(p) }
                    true
                }
                NoteAppShortcut.PREV_PAGE -> {
                    docManager.previousPage { p -> canvasView.loadPage(p) }
                    true
                }
                NoteAppShortcut.NEXT_PAGE -> {
                    docManager.nextPage { p -> canvasView.loadPage(p) }
                    true
                }
                NoteAppShortcut.TOOL_PEN -> {
                    selectedTool = CanvasTool.PRESSURE_PEN
                    canvasView.setTool(CanvasTool.PRESSURE_PEN)
                    true
                }
                NoteAppShortcut.TOOL_ERASER -> {
                    selectedTool = CanvasTool.STROKE_ERASER
                    canvasView.setTool(CanvasTool.STROKE_ERASER)
                    true
                }
                NoteAppShortcut.TOOL_HIGHLIGHTER -> {
                    selectedTool = CanvasTool.HIGHLIGHTER
                    canvasView.setTool(CanvasTool.HIGHLIGHTER)
                    true
                }
                NoteAppShortcut.TOOL_LASSO -> {
                    selectedTool = CanvasTool.LASSO
                    canvasView.setTool(CanvasTool.LASSO)
                    true
                }
                NoteAppShortcut.TOOL_SHAPES -> {
                    isShapeSnapOn = !isShapeSnapOn
                    canvasView.holdToSnapEnabled = isShapeSnapOn
                    true
                }
                NoteAppShortcut.TOGGLE_AUDIO -> {
                    if (isRecordingAudio) {
                        audioRecorder.stopRecording()
                        isRecordingAudio = false
                        hasRecordedAudio = true
                    } else {
                        val pId = currentPage?.metadata?.pageId ?: "page_default"
                        val audioFile = File(context.filesDir, "audio/$pId.m4a")
                        val ok = audioRecorder.startRecording(audioFile)
                        if (ok) isRecordingAudio = true
                    }
                    true
                }
            }
        }
        onDispose {
            KeyboardShortcutManager.activeListener = null
            audioRecorder.release()
        }
    }

    fun shareExportFile(file: File, mimeType: String, title: String) {
        try {
            val uri = androidx.core.content.FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
            val sendIntent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(android.content.Intent.EXTRA_STREAM, uri)
                addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            val chooser = android.content.Intent.createChooser(sendIntent, title).apply {
                addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(chooser)
        } catch (e: Exception) {
            android.util.Log.e("InkCanvasScreen", "Failed to share export file", e)
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
                modifier = Modifier
                    .padding(top = 16.dp, start = 20.dp, end = 20.dp)
                    .fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.96f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                shape = RoundedCornerShape(20.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Pinned Left: Navigation & DSA Utilities (Always visible!)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
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

                        // Spaced Repetition Review Queue Button
                        IconButton(onClick = { isReviewTodayOpen = true }) {
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = "Review Today",
                                tint = if (duePages.isNotEmpty()) Color(0xFFE65100) else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .height(28.dp)
                            .width(1.dp)
                            .background(MaterialTheme.colorScheme.outlineVariant)
                    )
                    Spacer(modifier = Modifier.width(6.dp))

                    // Scrollable Center: Tools, Palette, Widths
                    Row(
                        modifier = Modifier
                            .weight(1f)
                            .horizontalScroll(rememberScrollState()),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        // Tool selection: Pen, Marker, Highlighter, Eraser, Lasso, Shapes, PDF
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
                        ToolIconButton(
                            icon = Icons.Default.SelectAll,
                            label = "Lasso",
                            isSelected = selectedTool == CanvasTool.LASSO,
                            onClick = {
                                selectedTool = CanvasTool.LASSO
                                canvasView.setTool(CanvasTool.LASSO)
                            }
                        )
                        ToolIconButton(
                            icon = Icons.Default.Category,
                            label = "Shapes",
                            isSelected = isShapeSnapOn,
                            onClick = {
                                isShapeSnapOn = !isShapeSnapOn
                                canvasView.holdToSnapEnabled = isShapeSnapOn
                            }
                        )
                        ToolIconButton(
                            icon = Icons.Default.PictureAsPdf,
                            label = if (isPdfLoaded) "PDF On" else "PDF",
                            isSelected = isPdfLoaded,
                            onClick = {
                                if (isPdfLoaded) {
                                    canvasView.closePdf()
                                    isPdfLoaded = false
                                } else {
                                    val pdfFile = getOrCreateSamplePdf(context)
                                    canvasView.loadPdf(pdfFile)
                                    isPdfLoaded = true
                                }
                            }
                        )

                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .height(28.dp)
                                .width(1.dp)
                                .background(MaterialTheme.colorScheme.outlineVariant)
                        )
                        Spacer(modifier = Modifier.width(6.dp))

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

                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .height(28.dp)
                                .width(1.dp)
                                .background(MaterialTheme.colorScheme.outlineVariant)
                        )
                        Spacer(modifier = Modifier.width(6.dp))

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
                    }

                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .height(28.dp)
                            .width(1.dp)
                            .background(MaterialTheme.colorScheme.outlineVariant)
                    )
                    Spacer(modifier = Modifier.width(6.dp))

                    // Pinned Right: Undo, Redo, Templates, Fullscreen, Clear, Probe (Always visible!)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
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

                        // Clear Canvas
                        IconButton(onClick = { canvasView.clearCanvas() }) {
                            Icon(Icons.Default.Delete, contentDescription = "Clear Canvas", tint = Color(0xFFBA1A1A))
                        }

                        // Audio Sync Record/Stop Button
                        IconButton(
                            onClick = {
                                if (isRecordingAudio) {
                                    audioRecorder.stopRecording()
                                    isRecordingAudio = false
                                    hasRecordedAudio = true
                                    Toast.makeText(context, "Audio recording saved", Toast.LENGTH_SHORT).show()
                                } else {
                                    val pId = currentPage?.metadata?.pageId ?: "page_default"
                                    val audioDir = File(context.filesDir, "audio").apply { mkdirs() }
                                    val audioFile = File(audioDir, "$pId.m4a")
                                    val ok = audioRecorder.startRecording(audioFile)
                                    if (ok) {
                                        isRecordingAudio = true
                                        Toast.makeText(context, "Recording audio synced to strokes...", Toast.LENGTH_SHORT).show()
                                    } else {
                                        Toast.makeText(context, "Could not start audio recorder", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = if (isRecordingAudio) Icons.Default.Stop else Icons.Default.Mic,
                                contentDescription = "Audio Sync",
                                tint = if (isRecordingAudio) Color(0xFFD32F2F) else if (hasRecordedAudio) Color(0xFF2E7D32) else MaterialTheme.colorScheme.onSurface
                            )
                        }

                        // Export & Share Button
                        IconButton(
                            onClick = {
                                exportSuccessMessage = null
                                isExportDialogOpen = true
                            }
                        ) {
                            Icon(Icons.Default.Share, contentDescription = "Export & Share", tint = MaterialTheme.colorScheme.primary)
                        }

                        // Probe mode button
                        IconButton(onClick = onNavigateToProbe) {
                            Icon(Icons.Default.Speed, contentDescription = "Hardware Probe", tint = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }

            // Audio Active Recording Pill / Playback Bar
            if (isRecordingAudio) {
                Card(
                    modifier = Modifier.padding(top = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFB71C1C)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                        )
                        Text(
                            text = "REC ${String.format("%02d:%02d", audioDurationSec / 60, audioDurationSec % 60)}",
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            fontSize = 12.sp
                        )
                        IconButton(
                            onClick = {
                                audioRecorder.stopRecording()
                                isRecordingAudio = false
                                hasRecordedAudio = true
                                Toast.makeText(context, "Audio saved to page", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(Icons.Default.Stop, contentDescription = "Stop Recording", tint = Color.White, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            } else if (hasRecordedAudio) {
                Card(
                    modifier = Modifier.padding(top = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        IconButton(
                            onClick = {
                                if (isPlayingAudio) {
                                    audioRecorder.pausePlayback()
                                    isPlayingAudio = false
                                } else if (audioRecorder.state == AudioStrokeRecorder.State.PAUSED) {
                                    audioRecorder.resumePlayback()
                                    isPlayingAudio = true
                                } else {
                                    val pId = currentPage?.metadata?.pageId ?: "page_default"
                                    val audioFile = File(context.filesDir, "audio/$pId.m4a")
                                    val started = audioRecorder.startPlayback(
                                        audioFile = audioFile,
                                        onProgress = { cur, total ->
                                            audioCurrentMs = cur
                                            audioTotalMs = total
                                        },
                                        onComplete = {
                                            isPlayingAudio = false
                                            audioCurrentMs = 0
                                        }
                                    )
                                    isPlayingAudio = started
                                }
                            },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = if (isPlayingAudio) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = if (isPlayingAudio) "Pause" else "Play",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }

                        Text(
                            text = "${String.format("%02d:%02d", audioCurrentMs / 60000, (audioCurrentMs / 1000) % 60)} / ${String.format("%02d:%02d", audioTotalMs / 60000, (audioTotalMs / 1000) % 60)}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            fontFamily = FontFamily.Monospace
                        )

                        Slider(
                            value = if (audioTotalMs > 0) audioCurrentMs.toFloat() / audioTotalMs else 0f,
                            onValueChange = { frac ->
                                val seek = (frac * audioTotalMs).toInt()
                                audioCurrentMs = seek
                                audioRecorder.seekTo(seek)
                            },
                            modifier = Modifier.width(140.dp)
                        )

                        IconButton(
                            onClick = {
                                audioRecorder.stopPlayback()
                                isPlayingAudio = false
                                audioCurrentMs = 0
                            },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Close Audio", modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }

            // DSA Problem Page Template Banner (Displays when on a Problem Page)
            if (currentProblemPage != null && currentProblemPage.isProblemPage) {
                DsaProblemHeader(
                    problemPage = currentProblemPage,
                    onStatusChanged = { newStatus ->
                        scope.launch {
                            val nextReview = when (newStatus) {
                                "Revisit" -> System.currentTimeMillis() - 1000L
                                "Solved" -> System.currentTimeMillis() + (7L * 86400000L)
                                "Mastered" -> System.currentTimeMillis() + (21L * 86400000L)
                                else -> 0L
                            }
                            libraryRepo.updatePage(currentProblemPage.copy(problemStatus = newStatus, nextReviewTimestamp = nextReview))
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
                onOpenReviewToday = {
                    isReviewTodayOpen = true
                    isSidebarOpen = false
                },
                onCloseSidebar = {
                    isSidebarOpen = false
                }
            )
        }

        // Floating Lasso Action Bar (When strokes are selected)
        if (hasLassoSelection) {
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 80.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                shape = RoundedCornerShape(18.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Lasso (${canvasView.lassoTool.selectedStrokes.size})",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    // Duplicate
                    IconButton(onClick = { canvasView.duplicateLassoSelection() }) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Duplicate", modifier = Modifier.size(20.dp))
                    }

                    // Convert to Typed Text via On-Device ML Kit
                    IconButton(
                        onClick = {
                            scope.launch {
                                val text = canvasView.convertLassoSelectionToText()
                                if (!text.isNullOrBlank()) {
                                    recognizedTextResult = text
                                    Toast.makeText(context, "Transcribed: \"$text\"", Toast.LENGTH_LONG).show()
                                } else {
                                    Toast.makeText(context, "No text recognized in selection", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    ) {
                        Icon(Icons.Default.TextFields, contentDescription = "Convert to Text", modifier = Modifier.size(20.dp))
                    }

                    // Recolor quick dots
                    listOf(
                        Color(0xFF111318),
                        Color(0xFF005AC1),
                        Color(0xFFBA1A1A),
                        Color(0xFF146C2E)
                    ).forEach { color ->
                        Box(
                            modifier = Modifier
                                .size(22.dp)
                                .clip(CircleShape)
                                .background(color)
                                .border(1.dp, Color.White, CircleShape)
                                .clickable {
                                    val intColor = AndroidColor.argb(
                                        (color.alpha * 255).toInt(),
                                        (color.red * 255).toInt(),
                                        (color.green * 255).toInt(),
                                        (color.blue * 255).toInt()
                                    )
                                    canvasView.changeLassoSelectionColor(intColor)
                                }
                        )
                    }

                    // Delete selection
                    IconButton(onClick = { canvasView.deleteLassoSelection() }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(20.dp))
                    }

                    // Done / Clear selection
                    IconButton(onClick = { canvasView.clearLassoSelection() }) {
                        Icon(Icons.Default.Check, contentDescription = "Done", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                    }
                }
            }
        }

        // PDF Page Selector Pill (When PDF background is active)
        if (isPdfLoaded && canvasView.pdfTiler.pageCount > 1) {
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = if (hasLassoSelection) 140.dp else 80.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "PDF: Page ${currentPdfPage + 1}/${canvasView.pdfTiler.pageCount}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    IconButton(
                        onClick = {
                            if (currentPdfPage > 0) {
                                currentPdfPage--
                                canvasView.setPdfPage(currentPdfPage)
                            }
                        },
                        enabled = currentPdfPage > 0,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.NavigateBefore, contentDescription = "Prev PDF Page")
                    }
                    IconButton(
                        onClick = {
                            if (currentPdfPage < canvasView.pdfTiler.pageCount - 1) {
                                currentPdfPage++
                                canvasView.setPdfPage(currentPdfPage)
                            }
                        },
                        enabled = currentPdfPage < canvasView.pdfTiler.pageCount - 1,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.NavigateNext, contentDescription = "Next PDF Page")
                    }
                }
            }
        }

        // Spaced Repetition Review Queue Dialog (DSA Dream Core)
        if (isReviewTodayOpen) {
            ReviewTodayDialog(
                duePages = duePages,
                onOpenPage = { nbId, pId ->
                    docManager.switchToPage(pId) { page ->
                        canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                    }
                },
                onScheduleReview = { pageId, days ->
                    scope.launch {
                        libraryRepo.schedulePageReview(pageId, days)
                    }
                },
                onDismissRequest = { isReviewTodayOpen = false }
            )
        }

        // Recognized Handwriting Transcription Dialog (On-Device ML Kit)
        recognizedTextResult?.let { text ->
            androidx.compose.material3.AlertDialog(
                onDismissRequest = { recognizedTextResult = null },
                title = { Text("Transcribed Text (ML Kit)") },
                text = {
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = text,
                            fontSize = 16.sp,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier.padding(14.dp)
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                            val clip = android.content.ClipData.newPlainText("Handwriting", text)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Copied to clipboard!", Toast.LENGTH_SHORT).show()
                            recognizedTextResult = null
                        }
                    ) {
                        Text("Copy to Clipboard")
                    }
                },
                dismissButton = {
                    OutlinedButton(onClick = { recognizedTextResult = null }) {
                        Text("Dismiss")
                    }
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

        // Export & Share Dialog (Phase 6 Milestone)
        if (isExportDialogOpen) {
            val page = currentPage ?: docManager.currentPage.value
            val nBook = notebooks.firstOrNull { it.notebookId == page?.metadata?.notebookId }
            ExportDialog(
                notebookTitle = nBook?.title ?: "DSA Notebook",
                pageTitle = page?.metadata?.title ?: "Problem Page",
                strokeCount = page?.strokes?.size ?: canvasView.dryInkView.strokes.size,
                isExporting = isExporting,
                exportSuccessMessage = exportSuccessMessage,
                onDismiss = { isExportDialogOpen = false },
                onExportPdf = {
                    scope.launch(Dispatchers.IO) {
                        isExporting = true
                        val exportDir = File(context.cacheDir, "exports").apply { mkdirs() }
                        val safeTitle = (page?.metadata?.title ?: "Note").replace(Regex("[^a-zA-Z0-9_-]"), "_")
                        val pdfFile = File(exportDir, "${safeTitle}_${System.currentTimeMillis()}.pdf")
                        pdfFile.outputStream().use { out ->
                            if (page != null) {
                                PageExporter.exportToPdf(page, out)
                            }
                        }
                        withContext(Dispatchers.Main) {
                            isExporting = false
                            exportSuccessMessage = "Vector PDF Exported (${pdfFile.length() / 1024} KB)"
                            shareExportFile(pdfFile, "application/pdf", "Share PDF Document")
                        }
                    }
                },
                onExportPng = {
                    scope.launch(Dispatchers.IO) {
                        isExporting = true
                        val exportDir = File(context.cacheDir, "exports").apply { mkdirs() }
                        val safeTitle = (page?.metadata?.title ?: "Note").replace(Regex("[^a-zA-Z0-9_-]"), "_")
                        val pngFile = File(exportDir, "${safeTitle}_${System.currentTimeMillis()}.png")
                        pngFile.outputStream().use { out ->
                            if (page != null) {
                                PageExporter.exportToPng(page, out)
                            }
                        }
                        withContext(Dispatchers.Main) {
                            isExporting = false
                            exportSuccessMessage = "High-Res PNG Exported (${pngFile.length() / 1024} KB)"
                            shareExportFile(pngFile, "image/png", "Share Canvas Image")
                        }
                    }
                },
                onExportInkflow = {
                    scope.launch(Dispatchers.IO) {
                        isExporting = true
                        val exportDir = File(context.cacheDir, "exports").apply { mkdirs() }
                        val safeTitle = (nBook?.title ?: "Notebook").replace(Regex("[^a-zA-Z0-9_-]"), "_")
                        val inkflowFile = File(exportDir, "${safeTitle}_${System.currentTimeMillis()}.inkflow")
                        val pageList = if (page != null) listOf(page) else emptyList()
                        val mediaMap = mutableMapOf<String, File>()
                        val pId = page?.metadata?.pageId
                        if (pId != null) {
                            val audio = File(context.filesDir, "audio/$pId.m4a")
                            if (audio.exists()) {
                                mediaMap["$pId.m4a"] = audio
                            }
                        }
                        val manifest = InkflowManifest(
                            notebookId = nBook?.notebookId ?: "nb_default",
                            notebookTitle = nBook?.title ?: "DSA Notebook",
                            createdAt = nBook?.createdAt ?: System.currentTimeMillis(),
                            exportedAt = System.currentTimeMillis(),
                            pageCount = pageList.size,
                            pages = pageList.map {
                                InkflowPageEntry(
                                    pageId = it.metadata.pageId,
                                    title = it.metadata.title,
                                    pageIndex = it.metadata.pageIndex,
                                    template = it.metadata.template.name,
                                    strokeCount = it.strokes.size,
                                    audioFile = if (mediaMap.containsKey("${it.metadata.pageId}.m4a")) "${it.metadata.pageId}.m4a" else null
                                )
                            }
                        )
                        inkflowFile.outputStream().use { out ->
                            PageExporter.exportToInkflow(manifest, pageList, mediaMap, out)
                        }
                        withContext(Dispatchers.Main) {
                            isExporting = false
                            exportSuccessMessage = "Lossless .inkflow Exported (${inkflowFile.length() / 1024} KB)"
                            shareExportFile(inkflowFile, "application/zip", "Share Lossless .inkflow Bundle")
                        }
                    }
                }
            )
        }
    }
}

private fun getOrCreateSamplePdf(context: Context): File {
    val file = File(context.filesDir, "sample_dsa_cheatsheet.pdf")
    if (file.exists() && file.length() > 0) return file

    val pdfDoc = android.graphics.pdf.PdfDocument()
    val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG)

    // Page 1: DSA Overview
    val pageInfo1 = android.graphics.pdf.PdfDocument.PageInfo.Builder(1000, 1400, 1).create()
    val page1 = pdfDoc.startPage(pageInfo1)
    val canvas1 = page1.canvas
    canvas1.drawColor(android.graphics.Color.WHITE)

    paint.color = android.graphics.Color.parseColor("#1565C0")
    paint.textSize = 42f
    paint.isFakeBoldText = true
    canvas1.drawText("DSA Reference & Complexity Sheet", 80f, 100f, paint)

    paint.color = android.graphics.Color.parseColor("#424242")
    paint.textSize = 24f
    paint.isFakeBoldText = false
    canvas1.drawText("Target: Two Pointers, Sliding Window, DP & Graphs", 80f, 150f, paint)

    // Draw some sample diagrams
    paint.color = android.graphics.Color.parseColor("#E0E0E0")
    paint.style = android.graphics.Paint.Style.STROKE
    paint.strokeWidth = 3f
    canvas1.drawRect(80f, 200f, 920f, 600f, paint)

    paint.style = android.graphics.Paint.Style.FILL
    paint.color = android.graphics.Color.parseColor("#2E7D32")
    paint.textSize = 28f
    canvas1.drawText("1. Two Pointers Technique (O(N) Time, O(1) Space)", 110f, 260f, paint)

    paint.color = android.graphics.Color.DKGRAY
    paint.textSize = 22f
    canvas1.drawText("• Left index starts at 0, Right index starts at N-1", 120f, 320f, paint)
    canvas1.drawText("• Increment left if sum < target; Decrement right if sum > target", 120f, 370f, paint)
    canvas1.drawText("• Applicable to: Two Sum II, 3Sum, Container With Most Water", 120f, 420f, paint)

    pdfDoc.finishPage(page1)

    // Page 2: Binary Search & Trees
    val pageInfo2 = android.graphics.pdf.PdfDocument.PageInfo.Builder(1000, 1400, 2).create()
    val page2 = pdfDoc.startPage(pageInfo2)
    val canvas2 = page2.canvas
    canvas2.drawColor(android.graphics.Color.WHITE)

    paint.color = android.graphics.Color.parseColor("#6A1B9A")
    paint.textSize = 42f
    paint.isFakeBoldText = true
    canvas2.drawText("Binary Search & Divide and Conquer", 80f, 100f, paint)

    paint.color = android.graphics.Color.DKGRAY
    paint.textSize = 24f
    paint.isFakeBoldText = false
    canvas2.drawText("Recurrence: T(N) = T(N/2) + O(1) -> O(log N) Time", 80f, 160f, paint)

    pdfDoc.finishPage(page2)

    val fos = java.io.FileOutputStream(file)
    pdfDoc.writeTo(fos)
    fos.close()
    pdfDoc.close()
    return file
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
            .clip(RoundedCornerShape(8.dp))
            .clickable(onClick = onClick),
        color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(3.dp)
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
