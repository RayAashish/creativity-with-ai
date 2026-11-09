package com.antigravity.note.ui.canvas

import android.graphics.Color as AndroidColor
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Folder
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.IntOffset
import kotlin.math.roundToInt
import androidx.compose.material.icons.filled.DragHandle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Slider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.foundation.combinedClickable
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.DeleteOutline
import com.antigravity.note.inkengine.audio.AudioStrokeRecorder
import com.antigravity.note.inkengine.eraser.EraserMode
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
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.AutoFixHigh
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.ContentPaste
import androidx.compose.material.icons.filled.CopyAll
import androidx.compose.material.icons.filled.Crop
import androidx.compose.material.icons.filled.AspectRatio
import androidx.compose.material.icons.filled.RotateRight
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FitScreen
import androidx.compose.material.icons.filled.FormatPaint
import androidx.compose.material.icons.filled.GridOn
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PanTool
import androidx.compose.material.icons.filled.Palette
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SelectAll
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material.icons.filled.TouchApp
import android.widget.Toast
import com.antigravity.note.ui.library.EditProblemDialog
import com.antigravity.note.ui.library.ReviewTodayDialog
import com.antigravity.note.ui.shapes.ShapesDialog
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import kotlinx.coroutines.flow.first
import androidx.compose.material3.Card
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.ui.text.style.TextAlign
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
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.antigravity.note.document.manager.DocumentManager
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.inkengine.canvas.CanvasTool
import com.antigravity.note.inkengine.canvas.InkCanvasView
import com.antigravity.note.inkengine.palm.InputMode
import com.antigravity.note.library.backup.worker.BackupWorker
import com.antigravity.note.ui.backup.GoogleDriveBackupDialog
import com.antigravity.note.library.backup.gdrive.GoogleDriveAuthStorage
import com.antigravity.note.library.backup.gdrive.GoogleDriveBackupEngine
import com.antigravity.note.library.backup.gdrive.GoogleDriveClient
import com.antigravity.note.library.backup.gdrive.GoogleDriveRestoreEngine
import androidx.compose.material.icons.filled.CloudDone
import com.antigravity.note.library.journal.StrokeJournalCompactor
import com.antigravity.note.document.storage.ImageProcessor
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Cloud
import android.graphics.PointF
import com.antigravity.note.ui.settings.AppSettings
import okhttp3.OkHttpClient
import com.antigravity.note.library.db.NoteDatabase
import com.antigravity.note.library.repository.LibraryRepository
import com.antigravity.note.ui.library.DsaProblemHeader
import com.antigravity.note.inkengine.shape.RecognizedShape
import com.antigravity.note.ui.dsa.FloatingDsaProblemWindow
import com.antigravity.note.ui.library.LibrarySidebarDrawer
import com.antigravity.note.ui.library.QuickSwitcherDialog
import kotlinx.coroutines.launch
import android.content.Context
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InkCanvasScreen(
    isDarkMode: Boolean = false,
    onToggleDarkMode: ((Boolean) -> Unit)? = null,
    onNavigateToProbe: () -> Unit = {},
    incomingFileUri: Uri? = null
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val canvasView = remember { InkCanvasView(context) }
    val appSettings = remember { AppSettings(context) }
    var currentDarkMode by remember(isDarkMode) { mutableStateOf(isDarkMode) }

    LaunchedEffect(currentDarkMode) {
        canvasView.setDarkMode(currentDarkMode)
    }

    // Repositories & Database
    val pageRepo = remember { PageRepository(File(context.filesDir, "notebooks")) }
    val database = remember { NoteDatabase.getInstance(context) }
    val localBackupManager = remember { com.antigravity.note.library.backup.local.LocalBackupManager(context, database, pageRepo) }
    val libraryRepo = remember { LibraryRepository(database, pageRepo, localBackupManager = localBackupManager) }

    // Real-Time SQLite WAL Stroke Journal Compactor
    val strokeJournalCompactor = remember { StrokeJournalCompactor(database, pageRepo) }

    // Google Drive Lossless Backup & Restore Service
    val googleDriveAuthStorage = remember { GoogleDriveAuthStorage(context) }
    val googleDriveClient = remember { GoogleDriveClient(googleDriveAuthStorage) }
    val googleDriveBackupEngine = remember {
        GoogleDriveBackupEngine(database, pageRepo, googleDriveAuthStorage, googleDriveClient)
    }
    val googleDriveRestoreEngine = remember {
        GoogleDriveRestoreEngine(database, pageRepo, googleDriveAuthStorage, googleDriveClient)
    }
    var isGoogleDriveDialogOpen by remember { mutableStateOf(false) }

    var isLocalBackupDialogOpen by remember { mutableStateOf(false) }
    var detectedNotesPrompt by remember { mutableStateOf<com.antigravity.note.library.backup.local.ExistingNotesDetection.Found?>(null) }

    LaunchedEffect(Unit) {
        val detection = localBackupManager.detectExistingNotes()
        if (detection is com.antigravity.note.library.backup.local.ExistingNotesDetection.Found) {
            detectedNotesPrompt = detection
        }
    }

    // Library State Flows
    val folders by libraryRepo.getAllFolders().collectAsStateWithLifecycle(emptyList())
    val notebooks by libraryRepo.getAllNotebooks().collectAsStateWithLifecycle(emptyList())
    val allPages by libraryRepo.searchPages("").collectAsStateWithLifecycle(emptyList())
    val duePages by libraryRepo.getDueReviewPages().collectAsStateWithLifecycle(emptyList())
    val trashPages by libraryRepo.trashPages.collectAsStateWithLifecycle(emptyList())

    // Document Manager
    val docManager = remember { DocumentManager(pageRepo, "nb_two_pointers") }
    remember(docManager, strokeJournalCompactor, appSettings) {
        strokeJournalCompactor.activePageProvider = { docManager.currentPage.value }
        docManager.onActivePageChanged = { nbId, pgId ->
            appSettings.lastActiveNotebookId = nbId
            appSettings.lastActivePageId = pgId
        }
    }
    val currentPage by docManager.currentPage.collectAsStateWithLifecycle()
    val pagesList by docManager.pagesList.collectAsStateWithLifecycle()
    val openLatency by docManager.lastOpenLatencyMs.collectAsStateWithLifecycle()

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            scope.launch {
                val curPage = docManager.currentPage.value ?: return@launch
                val assetsDir = pageRepo.getAssetsDir(curPage.metadata.notebookId)
                val stream = context.contentResolver.openInputStream(uri) ?: return@launch
                val centerPt = PointF()
                val targetX = if (canvasView.width > 0) canvasView.width / 2f else 500f
                val targetY = if (canvasView.height > 0) canvasView.height / 2f else 600f
                canvasView.dryInkView.transform.screenToWorld(targetX, targetY, centerPt)
                val canvasImg = ImageProcessor.processAndStoreImage(
                    inputStream = stream,
                    assetsDir = assetsDir,
                    targetCenterX = centerPt.x,
                    targetCenterY = centerPt.y
                )
                if (canvasImg != null) {
                    curPage.addImage(canvasImg)
                    canvasView.dryInkView.addImage(canvasImg)
                    canvasView.selectImage(canvasImg)
                    pageRepo.savePageAtomic(curPage)
                    database.notebookDao().setNotebookDirty(curPage.metadata.notebookId, true)
                    Toast.makeText(context, "Image inserted", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    // UI State
    var isSidebarOpen by remember { mutableStateOf(false) }
    var isQuickSwitcherOpen by remember { mutableStateOf(false) }
    var selectedTool by remember { mutableStateOf(appSettings.selectedTool) }
    var penColor by remember { mutableStateOf(Color(appSettings.penColorArgb.toLong() and 0xFFFFFFFFL)) }
    var penWidth by remember { mutableFloatStateOf(appSettings.penWidth) }
    var markerColor by remember { mutableStateOf(Color(appSettings.markerColorArgb.toLong() and 0xFFFFFFFFL)) }
    var markerWidth by remember { mutableFloatStateOf(appSettings.markerWidth) }
    var highlighterColor by remember { mutableStateOf(Color(appSettings.highlighterColorArgb.toLong() and 0xFFFFFFFFL)) }
    var highlighterWidth by remember { mutableFloatStateOf(appSettings.highlighterWidth) }

    val selectedColor = when (selectedTool) {
        CanvasTool.PRESSURE_PEN -> penColor
        CanvasTool.MARKER -> markerColor
        CanvasTool.HIGHLIGHTER -> highlighterColor
        else -> penColor
    }
    var customRed by remember { mutableFloatStateOf(penColor.red * 255f) }
    var customGreen by remember { mutableFloatStateOf(penColor.green * 255f) }
    var customBlue by remember { mutableFloatStateOf(penColor.blue * 255f) }

    LaunchedEffect(selectedColor) {
        customRed = selectedColor.red * 255f
        customGreen = selectedColor.green * 255f
        customBlue = selectedColor.blue * 255f
    }

    val applyColor: (Color) -> Unit = { color ->
        val alpha = if (selectedTool == CanvasTool.HIGHLIGHTER) 0x55 else (color.alpha * 255).toInt()
        val intColor = AndroidColor.argb(
            alpha,
            (color.red * 255).toInt(),
            (color.green * 255).toInt(),
            (color.blue * 255).toInt()
        )
        when (selectedTool) {
            CanvasTool.PRESSURE_PEN -> {
                penColor = color
                appSettings.penColorArgb = intColor
            }
            CanvasTool.MARKER -> {
                markerColor = color
                appSettings.markerColorArgb = intColor
            }
            CanvasTool.HIGHLIGHTER -> {
                highlighterColor = color
                appSettings.highlighterColorArgb = intColor
            }
            else -> {
                penColor = color
                appSettings.penColorArgb = intColor
            }
        }
        canvasView.setInkColor(intColor)
    }
    val selectedWidth = when (selectedTool) {
        CanvasTool.PRESSURE_PEN -> penWidth
        CanvasTool.MARKER -> markerWidth
        CanvasTool.HIGHLIGHTER -> highlighterWidth
        else -> penWidth
    }

    val switchToTool: (CanvasTool) -> Unit = { tool ->
        selectedTool = tool
        appSettings.selectedTool = tool
        canvasView.setTool(tool)
        when (tool) {
            CanvasTool.PRESSURE_PEN -> {
                canvasView.setInkWidth(penWidth)
                val c = AndroidColor.argb(
                    (penColor.alpha * 255).toInt(),
                    (penColor.red * 255).toInt(),
                    (penColor.green * 255).toInt(),
                    (penColor.blue * 255).toInt()
                )
                canvasView.setInkColor(c)
            }
            CanvasTool.MARKER -> {
                canvasView.setInkWidth(markerWidth)
                val c = AndroidColor.argb(
                    (markerColor.alpha * 255).toInt(),
                    (markerColor.red * 255).toInt(),
                    (markerColor.green * 255).toInt(),
                    (markerColor.blue * 255).toInt()
                )
                canvasView.setInkColor(c)
            }
            CanvasTool.HIGHLIGHTER -> {
                canvasView.setInkWidth(highlighterWidth)
                val c = AndroidColor.argb(
                    (highlighterColor.alpha * 255).toInt(),
                    (highlighterColor.red * 255).toInt(),
                    (highlighterColor.green * 255).toInt(),
                    (highlighterColor.blue * 255).toInt()
                )
                canvasView.setInkColor(c)
            }
            CanvasTool.SHAPE -> {
                canvasView.setInkWidth(penWidth.coerceAtLeast(3.5f))
                val c = AndroidColor.argb(
                    (penColor.alpha * 255).toInt(),
                    (penColor.red * 255).toInt(),
                    (penColor.green * 255).toInt(),
                    (penColor.blue * 255).toInt()
                )
                canvasView.setInkColor(c)
            }
            else -> {}
        }
    }

    var canUndo by remember { mutableStateOf(false) }
    var canRedo by remember { mutableStateOf(false) }
    var inputMode by remember { mutableStateOf(appSettings.inputMode) }
    var isDebugOverlayOn by remember { mutableStateOf(appSettings.isDebugOverlayEnabled) }
    var showTemplateMenu by remember { mutableStateOf(false) }

    // Phase 4 State
    var hasLassoSelection by remember { mutableStateOf(false) }
    var lassoHasClipboard by remember { mutableStateOf(false) }
    var isShapeSnapOn by remember { mutableStateOf(true) }
    var isShapesDialogOpen by remember { mutableStateOf(false) }
    var isPdfLoaded by remember { mutableStateOf(false) }
    var currentPdfPage by remember { androidx.compose.runtime.mutableIntStateOf(0) }

    // Page Management & Edit State
    var isEditProblemOpen by remember { mutableStateOf(false) }
    var currentEraserMode by remember { mutableStateOf(appSettings.eraserMode) }
    var showEraserMenu by remember { mutableStateOf(false) }
    var showDeletePageDialog by remember { mutableStateOf(false) }
    var showClearCanvasDialog by remember { mutableStateOf(false) }
    var showAddPageMenu by remember { mutableStateOf(false) }
    var isInfiniteCanvas by remember { mutableStateOf(appSettings.isInfiniteCanvas) }

    // Read-Only Lock & Draggable Lasso State
    var isNoteLocked by remember { mutableStateOf(false) }
    var lassoToolbarOffset by remember { mutableStateOf<Offset?>(null) }
    var lassoCardWidthPx by remember { mutableFloatStateOf(0f) }
    var lassoCardHeightPx by remember { mutableFloatStateOf(0f) }

    // Image Selection & Transformation State
    var selectedCanvasImage by remember { mutableStateOf<com.antigravity.note.document.model.CanvasImage?>(null) }
    var imageBeingCropped by remember { mutableStateOf<com.antigravity.note.document.model.CanvasImage?>(null) }
    var imageToolbarOffset by remember { mutableStateOf<Offset?>(null) }
    var imageCardWidthPx by remember { mutableFloatStateOf(0f) }
    var imageCardHeightPx by remember { mutableFloatStateOf(0f) }

    LaunchedEffect(incomingFileUri) {
        val uri = incomingFileUri ?: return@LaunchedEffect
        try {
            context.contentResolver.openInputStream(uri)?.use { stream ->
                val (manifest, importedPages) = PageExporter.importFromInkflow(stream)
                if (importedPages.isNotEmpty()) {
                    val activeNbId = docManager.getActiveNotebookId()
                    for (p in importedPages) {
                        pageRepo.savePageAtomic(p)
                    }
                    val first = importedPages.first()
                    docManager.switchToNotebookAndPage(activeNbId, first.metadata.pageId) { p ->
                        canvasView.loadPage(p, docManager.lastOpenLatencyMs.value)
                    }
                    Toast.makeText(context, "Opened ${importedPages.size} page(s) from .inkflow", Toast.LENGTH_LONG).show()
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("InkCanvasScreen", "Failed to open .inkflow file", e)
            Toast.makeText(context, "Failed to open note: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    LaunchedEffect(hasLassoSelection) {
        if (hasLassoSelection) {
            val screenBounds = canvasView.getLassoScreenBounds()
            val screenW = context.resources.displayMetrics.widthPixels.toFloat()
            val screenH = context.resources.displayMetrics.heightPixels.toFloat()
            val density = context.resources.displayMetrics.density
            val toolbarW = if (lassoCardWidthPx > 50f) lassoCardWidthPx else 420f * density
            val toolbarH = if (lassoCardHeightPx > 20f) lassoCardHeightPx else 56f * density
            val margin = 16f * density
            val minX = margin
            val maxX = (screenW - toolbarW - margin).coerceAtLeast(minX)
            val minY = 90f * density
            val maxY = (screenH - toolbarH - 80f * density).coerceAtLeast(minY)

            if (screenBounds != null) {
                // Center horizontally on the selection so it never goes off either side
                val targetX = (screenBounds.centerX() - toolbarW / 2f).coerceIn(minX, maxX)
                // Prefer placing above selection
                var targetY = screenBounds.top - toolbarH - 12f * density
                // If above hits top chrome, place below selection
                if (targetY < minY) {
                    targetY = screenBounds.bottom + 12f * density
                }
                // If below exceeds bottom chrome, clamp inside safe viewport
                if (targetY > maxY) {
                    targetY = (screenBounds.top - toolbarH - 8f * density).coerceIn(minY, maxY)
                }

                lassoToolbarOffset = Offset(
                    targetX.coerceIn(minX, maxX),
                    targetY.coerceIn(minY, maxY)
                )
            } else {
                lassoToolbarOffset = Offset(
                    ((screenW - toolbarW) / 2f).coerceIn(minX, maxX),
                    (screenH * 0.45f).coerceIn(minY, maxY)
                )
            }
        } else {
            lassoToolbarOffset = null
        }
    }

    LaunchedEffect(selectedCanvasImage) {
        if (selectedCanvasImage != null) {
            val screenBounds = canvasView.getImageScreenBounds()
            val screenW = context.resources.displayMetrics.widthPixels.toFloat()
            val screenH = context.resources.displayMetrics.heightPixels.toFloat()
            val density = context.resources.displayMetrics.density
            val toolbarW = if (imageCardWidthPx > 50f) imageCardWidthPx else 380f * density
            val toolbarH = if (imageCardHeightPx > 20f) imageCardHeightPx else 56f * density
            val margin = 16f * density
            val minX = margin
            val maxX = (screenW - toolbarW - margin).coerceAtLeast(minX)
            val minY = 90f * density
            val maxY = (screenH - toolbarH - 80f * density).coerceAtLeast(minY)

            if (screenBounds != null) {
                val targetX = (screenBounds.centerX() - toolbarW / 2f).coerceIn(minX, maxX)
                var targetY = screenBounds.top - toolbarH - 12f * density
                if (targetY < minY) {
                    targetY = screenBounds.bottom + 12f * density
                }
                if (targetY > maxY) {
                    targetY = (screenBounds.top - toolbarH - 8f * density).coerceIn(minY, maxY)
                }

                imageToolbarOffset = Offset(
                    targetX.coerceIn(minX, maxX),
                    targetY.coerceIn(minY, maxY)
                )
            } else {
                imageToolbarOffset = Offset(
                    ((screenW - toolbarW) / 2f).coerceIn(minX, maxX),
                    (screenH * 0.45f).coerceIn(minY, maxY)
                )
            }
        } else {
            imageToolbarOffset = null
        }
    }

    LaunchedEffect(Unit) {
        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(
            inputMode = appSettings.inputMode,
            isFingerEraserEnabled = appSettings.isFingerEraserEnabled,
            debugOverlayEnabled = appSettings.isDebugOverlayEnabled
        )
        canvasView.holdToEraseEnabled = appSettings.isHoldToEraseEnabled
        canvasView.holdToEraseDelayMs = 800L
        canvasView.eraserMode = appSettings.eraserMode
        canvasView.setInfiniteCanvasMode(appSettings.isInfiniteCanvas)
        switchToTool(appSettings.selectedTool)
        kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            try {
                canvasView.digitalInkManager.ensureModelReady()
            } catch (e: Exception) {
                android.util.Log.w("InkCanvasScreen", "Background DigitalInk model warmup: ${e.message}")
            }
        }
    }

    // Phase 5 State
    var isReviewTodayOpen by remember { mutableStateOf(false) }
    var recognizedTextResult by remember { mutableStateOf<String?>(null) }

    // Phase 6 State: Export & Synced Audio
    var isExportDialogOpen by remember { mutableStateOf(false) }
    var isExporting by remember { mutableStateOf(false) }
    var exportSuccessMessage by remember { mutableStateOf<String?>(null) }

    // Page Repair State
    var isRepairDialogOpen by remember { mutableStateOf(false) }
    var repairScanResult by remember { mutableStateOf<com.antigravity.note.document.repair.PageRepairTool.RepairScanResult?>(null) }
    var isTopToolbarMinimized by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            try {
                BackupWorker.schedulePeriodic(context)
            } catch (_: Exception) {}
        }
    }

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

    // Seed DSA structure on launch if empty and resume last active notebook/page
    LaunchedEffect(Unit) {
        val seededNotebookId = libraryRepo.seedDsaDreamTemplate()
        val lastNotebookId = appSettings.lastActiveNotebookId
        val lastPageId = appSettings.lastActivePageId

        val targetNotebookId = if (!lastNotebookId.isNullOrEmpty() && libraryRepo.getNotebookById(lastNotebookId) != null) {
            lastNotebookId
        } else {
            seededNotebookId
        }

        docManager.initialize(targetNotebookId, initialPageId = lastPageId) {
            val page = docManager.currentPage.value
            if (page != null) {
                scope.launch {
                    val recovered = strokeJournalCompactor.recoverUncompactedStrokes(page.metadata.notebookId, page)
                    if (recovered > 0) {
                        Toast.makeText(context, "Recovered $recovered unsaved stroke(s) from journal", Toast.LENGTH_SHORT).show()
                    }
                    canvasView.loadPage(page, docManager.lastOpenLatencyMs.value, pageRepo.getAssetsDir(page.metadata.notebookId))
                }
            }
        }
        if (!canvasView.digitalInkManager.isModelDownloaded()) {
            canvasView.digitalInkManager.downloadModelIfNeeded()
        }
    }

    var gdriveBackupIdleJob by remember { mutableStateOf<kotlinx.coroutines.Job?>(null) }
    val scheduleSettledIdleGoogleDriveBackup: () -> Unit = {
        if (googleDriveAuthStorage.getAccessToken() != null) {
            gdriveBackupIdleJob?.cancel()
            gdriveBackupIdleJob = scope.launch {
                kotlinx.coroutines.delay(60_000L) // 1 minute settled idle auto-sync
                BackupWorker.enqueueImmediate(context)
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
            val curPage = docManager.currentPage.value
            val strokeId = java.util.UUID.randomUUID().toString()
            if (curPage != null) {
                strokeJournalCompactor.recordStroke(
                    curPage.metadata.notebookId,
                    curPage.metadata.pageId,
                    stroke,
                    strokeId
                )
            }
            docManager.onStrokeCommitted(stroke, strokeId)
            scheduleSettledIdleGoogleDriveBackup()
            if (isRecordingAudio) {
                audioRecorder.recordStrokeTiming(docManager.currentPage.value?.strokes?.size ?: 0)
            }
        }
        canvasView.onImageDropped = { uri, worldX, worldY ->
            scope.launch {
                val curPage = docManager.currentPage.value ?: return@launch
                val assetsDir = pageRepo.getAssetsDir(curPage.metadata.notebookId)
                val stream = try { context.contentResolver.openInputStream(uri) } catch (_: Exception) { null } ?: return@launch
                val canvasImg = ImageProcessor.processAndStoreImage(
                    inputStream = stream,
                    assetsDir = assetsDir,
                    targetCenterX = worldX,
                    targetCenterY = worldY
                )
                if (canvasImg != null) {
                    curPage.addImage(canvasImg)
                    canvasView.dryInkView.addImage(canvasImg)
                    canvasView.selectImage(canvasImg)
                    pageRepo.savePageAtomic(curPage)
                    database.notebookDao().setNotebookDirty(curPage.metadata.notebookId, true)
                    scheduleSettledIdleGoogleDriveBackup()
                    Toast.makeText(context, "Image added", Toast.LENGTH_SHORT).show()
                }
            }
        }
        canvasView.onUndoCommitted = { stroke ->
            docManager.onUndoCommitted(stroke)
            scheduleSettledIdleGoogleDriveBackup()
        }
        canvasView.onClearCommitted = {
            val curPage = docManager.currentPage.value
            if (curPage != null) {
                strokeJournalCompactor.recordPageCleared(
                    curPage.metadata.notebookId,
                    curPage.metadata.pageId,
                    curPage
                )
            }
            docManager.onClearCommitted()
            scheduleSettledIdleGoogleDriveBackup()
        }
        canvasView.onStrokesReplaced = { oldStrokes, newStrokes ->
            val curPage = docManager.currentPage.value
            val (removedIds, addedIds) = docManager.onStrokesReplaced(oldStrokes, newStrokes)
            if (curPage != null) {
                val addedPairs = addedIds.zip(newStrokes)
                strokeJournalCompactor.recordStrokesReplaced(
                    curPage.metadata.notebookId,
                    curPage.metadata.pageId,
                    removedIds,
                    addedPairs,
                    curPage
                )
            }
            scheduleSettledIdleGoogleDriveBackup()
        }
        canvasView.onLassoSelectionChanged = { selected ->
            hasLassoSelection = selected
        }
        canvasView.onImageSelectionChanged = { img ->
            selectedCanvasImage = img
        }
        canvasView.onImageChanged = { img ->
            val curPage = docManager.currentPage.value
            if (curPage != null) {
                val idx = curPage.images.indexOfFirst { it.id == img.id }
                if (idx >= 0) {
                    curPage.images[idx] = img
                } else {
                    curPage.addImage(img)
                }
                scope.launch {
                    pageRepo.savePageAtomic(curPage)
                    database.notebookDao().setNotebookDirty(curPage.metadata.notebookId, true)
                }
            }
        }
        canvasView.onImageRemoved = { img ->
            val curPage = docManager.currentPage.value
            if (curPage != null) {
                curPage.images.removeAll { it.id == img.id }
                scope.launch {
                    pageRepo.savePageAtomic(curPage)
                    database.notebookDao().setNotebookDirty(curPage.metadata.notebookId, true)
                }
            }
        }
    }

    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner, docManager) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_PAUSE || event == Lifecycle.Event.ON_STOP) {
                val curPage = docManager.currentPage.value
                if (curPage != null) {
                    appSettings.lastActiveNotebookId = curPage.metadata.notebookId
                    appSettings.lastActivePageId = curPage.metadata.pageId
                    docManager.autoSaveCurrentPage()
                    scope.launch {
                        strokeJournalCompactor.flushImmediately(
                            curPage.metadata.notebookId,
                            curPage.metadata.pageId,
                            curPage
                        )
                    }
                }
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            gdriveBackupIdleJob?.cancel()
            lifecycleOwner.lifecycle.removeObserver(observer)
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
                    switchToTool(CanvasTool.PRESSURE_PEN)
                    true
                }
                NoteAppShortcut.TOOL_MARKER -> {
                    switchToTool(CanvasTool.MARKER)
                    true
                }
                NoteAppShortcut.TOOL_ERASER -> {
                    switchToTool(CanvasTool.STROKE_ERASER)
                    true
                }
                NoteAppShortcut.TOOL_HIGHLIGHTER -> {
                    switchToTool(CanvasTool.HIGHLIGHTER)
                    true
                }
                NoteAppShortcut.TOOL_LASSO -> {
                    switchToTool(CanvasTool.LASSO)
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
                NoteAppShortcut.PASTE -> {
                    val pastedStrokes = canvasView.pasteLassoClipboard()
                    if (pastedStrokes.isNotEmpty()) {
                        true
                    } else {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? android.content.ClipboardManager
                        val clip = clipboard?.primaryClip
                        if (clip != null && clip.itemCount > 0) {
                            val uri = clip.getItemAt(0).uri
                            if (uri != null) {
                                scope.launch {
                                    val curPage = docManager.currentPage.value ?: return@launch
                                    val assetsDir = pageRepo.getAssetsDir(curPage.metadata.notebookId)
                                    val stream = try { context.contentResolver.openInputStream(uri) } catch (_: Exception) { null }
                                    if (stream != null) {
                                        val centerPt = PointF()
                                        val targetX = if (canvasView.width > 0) canvasView.width / 2f else 500f
                                        val targetY = if (canvasView.height > 0) canvasView.height / 2f else 600f
                                        canvasView.dryInkView.transform.screenToWorld(targetX, targetY, centerPt)
                                        val canvasImg = ImageProcessor.processAndStoreImage(
                                            inputStream = stream,
                                            assetsDir = assetsDir,
                                            targetCenterX = centerPt.x,
                                            targetCenterY = centerPt.y
                                        )
                                        if (canvasImg != null) {
                                            curPage.addImage(canvasImg)
                                            canvasView.dryInkView.addImage(canvasImg)
                                            canvasView.selectImage(canvasImg)
                                            pageRepo.savePageAtomic(curPage)
                                            database.notebookDao().setNotebookDirty(curPage.metadata.notebookId, true)
                                            Toast.makeText(context, "Image pasted from clipboard", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                }
                                true
                            } else false
                        } else false
                    }
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

    val activePalette = if (selectedTool == CanvasTool.HIGHLIGHTER) {
        listOf(
            Color(0xFFFFD600), // Fluorescent Yellow
            Color(0xFF69F0AE), // Mint Green
            Color(0xFF40C4FF), // Neon Blue
            Color(0xFFFF80AB), // Soft Pink
            Color(0xFFFFAB40), // Warm Amber
            Color(0xFFE040FB)  // Bright Violet
        )
    } else if (currentDarkMode) {
        listOf(
            Color(0xFFF5F5F5), // Crisp White / Light Silver
            Color(0xFF40C4FF), // Vivid Sky Blue
            Color(0xFFFF5252), // Bright Coral Red
            Color(0xFF69F0AE), // Mint Green
            Color(0xFFFFD740), // Bright Gold / Amber
            Color(0xFFE040FB)  // Bright Violet
        )
    } else {
        listOf(
            Color(0xFF111318), // Deep Black
            Color(0xFF005AC1), // Ink Blue
            Color(0xFFBA1A1A), // Red
            Color(0xFF146C2E), // Green
            Color(0xFF6750A4), // Purple
            Color(0xFFE65100)  // Orange
        )
    }

    val activeWidths = when (selectedTool) {
        CanvasTool.HIGHLIGHTER -> listOf(20f to "Fine", 34f to "Med", 52f to "Broad")
        CanvasTool.MARKER -> listOf(8f to "Fine", 14f to "Med", 22f to "Bold")
        else -> listOf(2.5f to "Fine", 4.5f to "Med", 8f to "Bold")
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Dedicated SurfaceView-backed Inking Canvas (Hot Path)
        AndroidView(
            factory = { canvasView },
            modifier = Modifier.fillMaxSize()
        )

        // Top Chrome: Floating Toolbars & Controls (Status Bar Optimized & Sleek Single-Line)
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(top = 4.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Sleek floating pill when toolbar is minimized
            AnimatedVisibility(
                visible = isTopToolbarMinimized,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.94f),
                    shadowElevation = 5.dp,
                    tonalElevation = 2.dp,
                    modifier = Modifier
                        .padding(top = 2.dp)
                        .clickable { isTopToolbarMinimized = false }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ExpandMore,
                            contentDescription = "Expand Toolbar",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "Show Toolbar",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            AnimatedVisibility(
                visible = !isTopToolbarMinimized,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Card(
                        modifier = Modifier
                            .padding(horizontal = 12.dp)
                            .fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.96f)),
                        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                        shape = RoundedCornerShape(22.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(start = 6.dp, end = 4.dp, top = 3.dp, bottom = 3.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                modifier = Modifier
                                    .weight(1f)
                                    .horizontalScroll(rememberScrollState()),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                    // --- 1. Left: Navigation & Document Utilities ---
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        IconButton(
                            onClick = { isSidebarOpen = !isSidebarOpen },
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Menu,
                                contentDescription = "DSA Tree Explorer",
                                tint = if (isSidebarOpen) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        IconButton(
                            onClick = { isQuickSwitcherOpen = true },
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Quick Switcher (Ctrl+K)",
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        IconButton(
                            onClick = { isReviewTodayOpen = true },
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Schedule,
                                contentDescription = "Review Today",
                                tint = if (duePages.isNotEmpty()) Color(0xFFE65100) else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        // Google Drive Cloud Backup Status Pill
                        val hasGDriveToken = googleDriveAuthStorage.getAccessToken() != null
                        val gdriveLastBackup = googleDriveAuthStorage.getLastBackupTime()
                        val gdriveLabel = when {
                            !hasGDriveToken -> "Connect Drive"
                            gdriveLastBackup > 0L -> "Drive Synced"
                            else -> "Drive Ready"
                        }
                        val gdriveContainerColor = when {
                            !hasGDriveToken -> MaterialTheme.colorScheme.surfaceVariant
                            gdriveLastBackup > 0L -> Color(0xFFE8F5E9)
                            else -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                        }
                        val gdriveContentColor = when {
                            !hasGDriveToken -> MaterialTheme.colorScheme.onSurfaceVariant
                            gdriveLastBackup > 0L -> Color(0xFF2E7D32)
                            else -> MaterialTheme.colorScheme.primary
                        }

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = gdriveContainerColor,
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { isGoogleDriveDialogOpen = true }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 9.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                Icon(
                                    imageVector = if (gdriveLastBackup > 0L) Icons.Default.CloudDone else Icons.Default.Cloud,
                                    contentDescription = "Google Drive Cloud Backup",
                                    tint = gdriveContentColor,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = gdriveLabel,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = gdriveContentColor
                                )
                            }
                        }
                        if (isNoteLocked) {
                            Surface(
                                color = MaterialTheme.colorScheme.errorContainer,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .padding(start = 4.dp)
                                    .clickable {
                                        isNoteLocked = false
                                        canvasView.isReadOnly = false
                                        Toast.makeText(context, "🔓 Note Unlocked (Editing Enabled)", Toast.LENGTH_SHORT).show()
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Lock,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.onErrorContainer,
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Text(
                                        "READ ONLY",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onErrorContainer
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(4.dp))
                    Box(
                        modifier = Modifier
                            .height(28.dp)
                            .width(1.dp)
                            .background(MaterialTheme.colorScheme.outlineVariant)
                    )
                    Spacer(modifier = Modifier.width(4.dp))

                    // --- 2. Center: Inking Tools, Color Dropdown & Width Dropdown ---
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        ToolIconButton(
                            icon = Icons.Default.Edit,
                            label = "Pen",
                            isSelected = selectedTool == CanvasTool.PRESSURE_PEN,
                            onClick = { switchToTool(CanvasTool.PRESSURE_PEN) }
                        )
                        ToolIconButton(
                            icon = Icons.Default.Brush,
                            label = "Marker",
                            isSelected = selectedTool == CanvasTool.MARKER,
                            onClick = { switchToTool(CanvasTool.MARKER) }
                        )
                        ToolIconButton(
                            icon = Icons.Default.FormatPaint,
                            label = "Highlighter",
                            isSelected = selectedTool == CanvasTool.HIGHLIGHTER,
                            onClick = { switchToTool(CanvasTool.HIGHLIGHTER) }
                        )
                        Box {
                            val eraserIcon = when (currentEraserMode) {
                                EraserMode.PRECISION -> Icons.Default.ContentCut
                                EraserMode.STROKE -> Icons.Default.AutoFixHigh
                                EraserMode.HIGHLIGHTER -> Icons.Default.FormatPaint
                            }
                            val eraserLabel = when (currentEraserMode) {
                                EraserMode.PRECISION -> "Precision"
                                EraserMode.STROKE -> "Stroke"
                                EraserMode.HIGHLIGHTER -> "Highlighter"
                            }
                            ToolIconButton(
                                icon = eraserIcon,
                                label = if (selectedTool == CanvasTool.STROKE_ERASER) "$eraserLabel ▾" else "Eraser",
                                isSelected = selectedTool == CanvasTool.STROKE_ERASER,
                                onClick = {
                                    if (selectedTool == CanvasTool.STROKE_ERASER) {
                                        showEraserMenu = true
                                    } else {
                                        switchToTool(CanvasTool.STROKE_ERASER)
                                    }
                                },
                                onLongClick = {
                                    showEraserMenu = true
                                }
                            )

                            DropdownMenu(
                                expanded = showEraserMenu,
                                onDismissRequest = { showEraserMenu = false }
                            ) {
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text("Precision Eraser", fontWeight = FontWeight.Bold)
                                            Text(
                                                "Cuts strokes: erases only touched segments",
                                                fontSize = 11.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.ContentCut, contentDescription = null)
                                    },
                                    trailingIcon = {
                                        if (currentEraserMode == EraserMode.PRECISION) {
                                            Icon(
                                                Icons.Default.Check,
                                                contentDescription = null,
                                                tint = MaterialTheme.colorScheme.primary
                                            )
                                        }
                                    },
                                    onClick = {
                                        currentEraserMode = EraserMode.PRECISION
                                        appSettings.eraserMode = EraserMode.PRECISION
                                        canvasView.eraserMode = EraserMode.PRECISION
                                        switchToTool(CanvasTool.STROKE_ERASER)
                                        showEraserMenu = false
                                    }
                                )
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text("Stroke Eraser", fontWeight = FontWeight.Bold)
                                            Text(
                                                "Deletes entire touched stroke",
                                                fontSize = 11.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.DeleteOutline, contentDescription = null)
                                    },
                                    trailingIcon = {
                                        if (currentEraserMode == EraserMode.STROKE) {
                                            Icon(
                                                Icons.Default.Check,
                                                contentDescription = null,
                                                tint = MaterialTheme.colorScheme.primary
                                            )
                                        }
                                    },
                                    onClick = {
                                        currentEraserMode = EraserMode.STROKE
                                        appSettings.eraserMode = EraserMode.STROKE
                                        canvasView.eraserMode = EraserMode.STROKE
                                        switchToTool(CanvasTool.STROKE_ERASER)
                                        showEraserMenu = false
                                    }
                                )
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text("Highlighter Only", fontWeight = FontWeight.Bold)
                                            Text(
                                                "Only erases highlighter marks",
                                                fontSize = 11.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.FormatPaint, contentDescription = null)
                                    },
                                    trailingIcon = {
                                        if (currentEraserMode == EraserMode.HIGHLIGHTER) {
                                            Icon(
                                                Icons.Default.Check,
                                                contentDescription = null,
                                                tint = MaterialTheme.colorScheme.primary
                                            )
                                        }
                                    },
                                    onClick = {
                                        currentEraserMode = EraserMode.HIGHLIGHTER
                                        appSettings.eraserMode = EraserMode.HIGHLIGHTER
                                        canvasView.eraserMode = EraserMode.HIGHLIGHTER
                                        switchToTool(CanvasTool.STROKE_ERASER)
                                        showEraserMenu = false
                                    }
                                )
                            }
                        }
                        ToolIconButton(
                            icon = Icons.Default.SelectAll,
                            label = "Lasso",
                            isSelected = selectedTool == CanvasTool.LASSO,
                            onClick = { switchToTool(CanvasTool.LASSO) }
                        )
                        ToolIconButton(
                            icon = Icons.Default.Category,
                            label = if (selectedTool == CanvasTool.SHAPE) "Shapes ▾" else "Shapes",
                            isSelected = selectedTool == CanvasTool.SHAPE || isShapesDialogOpen,
                            onClick = { isShapesDialogOpen = true }
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
                        ToolIconButton(
                            icon = Icons.Default.Image,
                            label = "Image",
                            isSelected = false,
                            onClick = { imagePickerLauncher.launch("image/*") }
                        )

                        Spacer(modifier = Modifier.width(3.dp))
                        Box(
                            modifier = Modifier
                                .height(28.dp)
                                .width(1.dp)
                                .background(MaterialTheme.colorScheme.outlineVariant)
                        )
                        Spacer(modifier = Modifier.width(3.dp))

                        // Compact Color Picker Dropdown with Preset Swatches & Custom RGB Mixer
                        var showColorPickerMenu by remember { mutableStateOf(false) }
                        Box {
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.65f),
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .clickable { showColorPickerMenu = true }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(25.dp)
                                            .clip(CircleShape)
                                            .background(selectedColor)
                                            .border(1.5.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = 0.35f), CircleShape)
                                    )
                                    Icon(
                                        imageVector = Icons.Default.ArrowDropDown,
                                        contentDescription = "Color Menu",
                                        modifier = Modifier.size(19.dp),
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = showColorPickerMenu,
                                onDismissRequest = { showColorPickerMenu = false }
                            ) {
                                GridColorPicker(
                                    selectedColor = selectedColor,
                                    onColorSelected = { color ->
                                        applyColor(color)
                                        showColorPickerMenu = false
                                    },
                                    modifier = Modifier.width(360.dp)
                                )
                            }
                        }

                        // Compact Width Picker Dropdown
                        var showWidthPickerMenu by remember { mutableStateOf(false) }
                        val currentWidthLabel = activeWidths.firstOrNull { kotlin.math.abs(selectedWidth - it.first) < 0.5f }?.second ?: "Med"
                        Box {
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.65f),
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .clickable { showWidthPickerMenu = true }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                                ) {
                                    Text(
                                        text = currentWidthLabel,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Icon(
                                        imageVector = Icons.Default.ArrowDropDown,
                                        contentDescription = "Width Menu",
                                        modifier = Modifier.size(19.dp),
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = showWidthPickerMenu,
                                onDismissRequest = { showWidthPickerMenu = false }
                            ) {
                                Text(
                                    text = "Stroke Width",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                activeWidths.forEach { (width, label) ->
                                    val isSelected = kotlin.math.abs(selectedWidth - width) < 0.5f
                                    DropdownMenuItem(
                                        text = {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                                            ) {
                                                Box(
                                                    modifier = Modifier
                                                        .size(width.dp.coerceIn(4.dp, 16.dp))
                                                        .clip(CircleShape)
                                                        .background(selectedColor)
                                                )
                                                Text(label, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal)
                                            }
                                        },
                                        onClick = {
                                            when (selectedTool) {
                                                CanvasTool.PRESSURE_PEN -> {
                                                    penWidth = width
                                                    appSettings.penWidth = width
                                                }
                                                CanvasTool.MARKER -> {
                                                    markerWidth = width
                                                    appSettings.markerWidth = width
                                                }
                                                CanvasTool.HIGHLIGHTER -> {
                                                    highlighterWidth = width
                                                    appSettings.highlighterWidth = width
                                                }
                                                else -> {
                                                    penWidth = width
                                                    appSettings.penWidth = width
                                                }
                                            }
                                            canvasView.setInkWidth(width)
                                            showWidthPickerMenu = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    // --- 3. Right: Canvas Navigation & Collapse More Overflow Menu ---
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        IconButton(
                            onClick = { canvasView.undo() },
                            enabled = canUndo,
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Undo,
                                contentDescription = "Undo",
                                tint = if (canUndo) MaterialTheme.colorScheme.onSurface else Color.LightGray,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        IconButton(
                            onClick = { canvasView.redo() },
                            enabled = canRedo,
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Redo,
                                contentDescription = "Redo",
                                tint = if (canRedo) MaterialTheme.colorScheme.onSurface else Color.LightGray,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        // Paper Template Picker Button
                        Box {
                            IconButton(
                                onClick = { showTemplateMenu = true },
                                modifier = Modifier.size(38.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.GridOn,
                                    contentDescription = "Paper Template",
                                    modifier = Modifier.size(22.dp)
                                )
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
                        IconButton(
                            onClick = { canvasView.resetZoom() },
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.FitScreen,
                                contentDescription = "Reset Zoom",
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        // Problem / Topic Metadata Info Button
                        IconButton(
                            onClick = {
                                if (currentProblemPage != null) {
                                    isEditProblemOpen = true
                                } else {
                                    val page = currentPage ?: docManager.currentPage.value
                                    if (page != null) {
                                        scope.launch {
                                            val activeNbId = docManager.getActiveNotebookId()
                                            libraryRepo.createProblemPage(
                                                notebookId = activeNbId,
                                                title = page.metadata.title,
                                                sourceUrl = null,
                                                difficulty = "Medium",
                                                tags = ""
                                            )
                                            isEditProblemOpen = true
                                        }
                                    }
                                }
                            },
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.PushPin,
                                contentDescription = "Topic & Problem Details",
                                tint = if (currentProblemPage?.isProblemPage == true) MaterialTheme.colorScheme.primary else Color.Gray,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        // Helper for Dark / Light Mode Toggle with Smart Dynamic Contrast
                        val toggleDarkModeSmart: () -> Unit = {
                            val next = !currentDarkMode
                            currentDarkMode = next
                            appSettings.isDarkMode = next
                            canvasView.setDarkMode(next)
                            if (next) {
                                // Switching to Dark Mode: adapt near-black monochrome pen to off-white
                                val r = penColor.red
                                val g = penColor.green
                                val b = penColor.blue
                                val sat = maxOf(r, maxOf(g, b)) - minOf(r, minOf(g, b))
                                val lum = 0.299f * r + 0.587f * g + 0.114f * b
                                if (sat <= 0.15f && lum < 0.35f) {
                                    val lightColor = Color(0xFFF5F5F5)
                                    penColor = lightColor
                                    appSettings.penColorArgb = 0xFFF5F5F5.toInt()
                                    if (selectedTool == CanvasTool.PRESSURE_PEN) {
                                        canvasView.setInkColor(0xFFF5F5F5.toInt())
                                    }
                                }
                            } else {
                                // Switching to Light Mode: adapt light monochrome pen to near-black
                                val r = penColor.red
                                val g = penColor.green
                                val b = penColor.blue
                                val sat = maxOf(r, maxOf(g, b)) - minOf(r, minOf(g, b))
                                val lum = 0.299f * r + 0.587f * g + 0.114f * b
                                if (sat <= 0.15f && lum > 0.65f) {
                                    val darkColor = Color(0xFF111318)
                                    penColor = darkColor
                                    appSettings.penColorArgb = 0xFF111318.toInt()
                                    if (selectedTool == CanvasTool.PRESSURE_PEN) {
                                        canvasView.setInkColor(0xFF111318.toInt())
                                    }
                                }
                            }
                            onToggleDarkMode?.invoke(next)
                        }

                        // Dark / Light Mode Toggle
                        IconButton(
                            onClick = toggleDarkModeSmart,
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = if (currentDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                                contentDescription = if (currentDarkMode) "Switch to Light Mode" else "Switch to Dark Mode",
                                tint = if (currentDarkMode) Color(0xFFFFD54F) else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        // Read-Only / Lock Note Toggle
                        IconButton(
                            onClick = {
                                val nextLock = !isNoteLocked
                                isNoteLocked = nextLock
                                canvasView.isReadOnly = nextLock
                                Toast.makeText(
                                    context,
                                    if (nextLock) "🔒 Note Locked (Read-Only Mode)" else "🔓 Note Unlocked (Editing Enabled)",
                                    Toast.LENGTH_SHORT
                                ).show()
                            },
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = if (isNoteLocked) Icons.Default.Lock else Icons.Default.LockOpen,
                                contentDescription = if (isNoteLocked) "Unlock Note" else "Lock Note (Read-Only)",
                                tint = if (isNoteLocked) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        // Collapse More Actions Menu (User requested: "keep in collapse/navigation drawer is like share, mic")
                        var showMoreActionsMenu by remember { mutableStateOf(false) }
                        Box {
                            IconButton(
                                onClick = { showMoreActionsMenu = true },
                                modifier = Modifier.size(38.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.MoreVert,
                                    contentDescription = "More Actions",
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            DropdownMenu(
                                expanded = showMoreActionsMenu,
                                onDismissRequest = { showMoreActionsMenu = false }
                            ) {
                                // Dark Mode Toggle
                                DropdownMenuItem(
                                    text = { Text(if (currentDarkMode) "Light Mode" else "Dark Mode") },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = if (currentDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                                            contentDescription = null,
                                            tint = if (currentDarkMode) Color(0xFFFFD54F) else MaterialTheme.colorScheme.primary
                                        )
                                    },
                                    onClick = {
                                        showMoreActionsMenu = false
                                        toggleDarkModeSmart()
                                    }
                                )
                                // Lock / Read-Only Toggle
                                DropdownMenuItem(
                                    text = { Text(if (isNoteLocked) "Unlock Note (Enable Editing)" else "Lock Note (Read-Only)") },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = if (isNoteLocked) Icons.Default.LockOpen else Icons.Default.Lock,
                                            contentDescription = null,
                                            tint = if (isNoteLocked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                                        )
                                    },
                                    onClick = {
                                        showMoreActionsMenu = false
                                        val nextLock = !isNoteLocked
                                        isNoteLocked = nextLock
                                        canvasView.isReadOnly = nextLock
                                        Toast.makeText(
                                            context,
                                            if (nextLock) "🔒 Note Locked (Read-Only Mode)" else "🔓 Note Unlocked (Editing Enabled)",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                    }
                                )
                                // Audio Sync
                                DropdownMenuItem(
                                    text = { Text(if (isRecordingAudio) "Stop Recording Audio" else "Record Audio Sync") },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = if (isRecordingAudio) Icons.Default.Stop else Icons.Default.Mic,
                                            contentDescription = null,
                                            tint = if (isRecordingAudio) Color(0xFFD32F2F) else MaterialTheme.colorScheme.primary
                                        )
                                    },
                                    onClick = {
                                        showMoreActionsMenu = false
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
                                )

                                // Export & Share
                                DropdownMenuItem(
                                    text = { Text("Export & Share Note") },
                                    leadingIcon = {
                                        Icon(Icons.Default.Share, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                    },
                                    onClick = {
                                        showMoreActionsMenu = false
                                        exportSuccessMessage = null
                                        isExportDialogOpen = true
                                    }
                                )

                                // Hardware Probe
                                DropdownMenuItem(
                                    text = { Text("Hardware & Stylus Probe") },
                                    leadingIcon = {
                                        Icon(Icons.Default.Speed, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                    },
                                    onClick = {
                                        showMoreActionsMenu = false
                                        onNavigateToProbe()
                                    }
                                )

                                HorizontalDivider()

                                // Repair Damaged Ink
                                DropdownMenuItem(
                                    text = { Text("Repair Damaged Ink") },
                                    leadingIcon = {
                                        Icon(Icons.Default.AutoFixHigh, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                    },
                                    onClick = {
                                        showMoreActionsMenu = false
                                        val page = docManager.currentPage.value
                                        if (page != null) {
                                            repairScanResult = com.antigravity.note.document.repair.PageRepairTool.scan(page)
                                            isRepairDialogOpen = true
                                        }
                                    }
                                )

                                // Clear Canvas
                                DropdownMenuItem(
                                    text = { Text("Clear Canvas", color = Color(0xFFBA1A1A)) },
                                    leadingIcon = {
                                        Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFFBA1A1A))
                                    },
                                    onClick = {
                                        showMoreActionsMenu = false
                                        showClearCanvasDialog = true
                                    }
                                )
                            }
                        }
                    } // close scrollable tools Row

                    // Pinned Minimize Toolbar Button (Always visible on far right of card)
                    IconButton(
                        onClick = { isTopToolbarMinimized = true },
                        modifier = Modifier.size(38.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ExpandLess,
                            contentDescription = "Minimize Toolbar",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                } // close outer Row inside Card
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
                    isFloatingWindowVisible = currentProblemPage.isDescriptionWindowVisible,
                    onToggleFloatingWindow = {
                        scope.launch {
                            val nextState = !currentProblemPage.isDescriptionWindowVisible
                            libraryRepo.updatePage(currentProblemPage.copy(isDescriptionWindowVisible = nextState))
                        }
                    },
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
                    },
                    onEditClicked = {
                        isEditProblemOpen = true
                    }
                )
            }
                }
            }
        }

        // Floating Draggable Problem Description Window (DSA Problems)
        if (currentProblemPage != null && currentProblemPage.isProblemPage && currentProblemPage.isDescriptionWindowVisible) {
            FloatingDsaProblemWindow(
                page = currentProblemPage,
                onUpdatePage = { updated ->
                    scope.launch {
                        libraryRepo.updatePage(updated)
                    }
                },
                onCloseWindow = {
                    scope.launch {
                        libraryRepo.updatePage(currentProblemPage.copy(isDescriptionWindowVisible = false))
                    }
                },
                onInsertTraceTable = {
                    val (cx, cy) = canvasView.getViewportCenter()
                    canvasView.insertShape(
                        RecognizedShape.ArrayCellSequence(
                            centerX = cx,
                            centerY = cy,
                            cellWidth = 75f,
                            cellHeight = 60f,
                            count = 5
                        )
                    )
                },
                isAppDark = currentDarkMode
            )
        }

        // Bottom Bar: Non-Overlapping, Centered Controls (No Scrolling Needed on Tablet)
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(start = 14.dp, end = 14.dp, bottom = 8.dp),
            contentAlignment = Alignment.BottomCenter
        ) {
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Card 1: Page Navigation, Add & Delete Page, Infinite Canvas (Preserved as approved)
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        val currentIndex = pagesList.indexOfFirst { it.pageId == currentPage?.metadata?.pageId }.coerceAtLeast(0)
                        val totalPages = pagesList.size.coerceAtLeast(1)

                        IconButton(
                            onClick = {
                                docManager.previousPage { page ->
                                    canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                                }
                            },
                            enabled = currentIndex > 0,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.NavigateBefore,
                                contentDescription = "Previous Page",
                                tint = if (currentIndex > 0) MaterialTheme.colorScheme.onSurface else Color.LightGray
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f)
                        ) {
                            Text(
                                text = "Page ${currentIndex + 1} / $totalPages",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }

                        IconButton(
                            onClick = {
                                docManager.nextPage { page ->
                                    canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                                }
                            },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.NavigateNext,
                                contentDescription = "Next Page"
                            )
                        }

                        Spacer(modifier = Modifier.width(2.dp))
                        Box(
                            modifier = Modifier
                                .height(22.dp)
                                .width(1.dp)
                                .background(MaterialTheme.colorScheme.outlineVariant)
                        )
                        Spacer(modifier = Modifier.width(2.dp))

                        // + Add Page Button (One-tap adds page with current template, chevron opens template menu)
                        Box {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isNoteLocked) MaterialTheme.colorScheme.primary.copy(alpha = 0.4f) else MaterialTheme.colorScheme.primary,
                                modifier = Modifier.clickable {
                                    if (isNoteLocked) {
                                        Toast.makeText(context, "Note is locked (Read-Only Mode)", Toast.LENGTH_SHORT).show()
                                        return@clickable
                                    }
                                    val currentTpl = currentPage?.metadata?.template ?: PaperTemplate.GRID
                                    val activeNbId = docManager.getActiveNotebookId()
                                    scope.launch {
                                        val p = libraryRepo.createGeneralNotePage(activeNbId, "Page ${pagesList.size + 1}", currentTpl)
                                        docManager.switchToNotebookAndPage(activeNbId, p.pageId) { page ->
                                            canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                                        }
                                        Toast.makeText(context, "Added Page ${pagesList.size + 1}", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            ) {
                                Row(
                                    modifier = Modifier.padding(start = 10.dp, top = 6.dp, bottom = 6.dp, end = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Add,
                                        contentDescription = "Add Page",
                                        modifier = Modifier.size(16.dp),
                                        tint = MaterialTheme.colorScheme.onPrimary
                                    )
                                    Text(
                                        text = "Add Page",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onPrimary
                                    )
                                    IconButton(
                                        onClick = {
                                            if (isNoteLocked) {
                                                Toast.makeText(context, "Note is locked (Read-Only Mode)", Toast.LENGTH_SHORT).show()
                                                return@IconButton
                                            }
                                            showAddPageMenu = true
                                        },
                                        modifier = Modifier.size(20.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.ArrowDropDown,
                                            contentDescription = "Choose Paper Template",
                                            tint = MaterialTheme.colorScheme.onPrimary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }

                            DropdownMenu(
                                expanded = showAddPageMenu,
                                onDismissRequest = { showAddPageMenu = false }
                            ) {
                                val currentTpl = currentPage?.metadata?.template ?: PaperTemplate.GRID
                                DropdownMenuItem(
                                    text = { Text("+ Current (${currentTpl.displayName})", fontWeight = FontWeight.Bold) },
                                    onClick = {
                                        showAddPageMenu = false
                                        val activeNbId = docManager.getActiveNotebookId()
                                        scope.launch {
                                            val p = libraryRepo.createGeneralNotePage(activeNbId, "Page ${pagesList.size + 1}", currentTpl)
                                            docManager.switchToNotebookAndPage(activeNbId, p.pageId) { page ->
                                                canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                                            }
                                        }
                                    }
                                )
                                HorizontalDivider()
                                PaperTemplate.entries.forEach { template ->
                                    DropdownMenuItem(
                                        text = { Text("+ ${template.displayName} Page") },
                                        onClick = {
                                            showAddPageMenu = false
                                            val activeNbId = docManager.getActiveNotebookId()
                                            scope.launch {
                                                val p = libraryRepo.createGeneralNotePage(activeNbId, "Page ${pagesList.size + 1}", template)
                                                docManager.switchToNotebookAndPage(activeNbId, p.pageId) { page ->
                                                    canvasView.loadPage(page, docManager.lastOpenLatencyMs.value)
                                                }
                                            }
                                        }
                                    )
                                }
                            }
                        }

                        // Delete Page Button
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.errorContainer.copy(alpha = if (isNoteLocked) 0.3f else 0.8f),
                            modifier = Modifier.clickable {
                                if (isNoteLocked) {
                                    Toast.makeText(context, "Note is locked (Read-Only Mode)", Toast.LENGTH_SHORT).show()
                                    return@clickable
                                }
                                showDeletePageDialog = true
                            }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 9.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Delete,
                                    contentDescription = "Delete Page",
                                    modifier = Modifier.size(16.dp),
                                    tint = MaterialTheme.colorScheme.onErrorContainer
                                )
                                Text(
                                    text = "Delete",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(2.dp))
                        Box(
                            modifier = Modifier
                                .height(22.dp)
                                .width(1.dp)
                                .background(MaterialTheme.colorScheme.outlineVariant)
                        )
                        Spacer(modifier = Modifier.width(2.dp))

                        // Infinite Canvas Toggle (OneNote Style)
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isInfiniteCanvas) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier.clickable {
                                isInfiniteCanvas = !isInfiniteCanvas
                                appSettings.isInfiniteCanvas = isInfiniteCanvas
                                canvasView.setInfiniteCanvasMode(isInfiniteCanvas)
                                Toast.makeText(
                                    context,
                                    if (isInfiniteCanvas) "Infinite Canvas Enabled (OneNote style)" else "Fixed Page Boundaries Enabled",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 9.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = if (isInfiniteCanvas) "♾️ Infinite" else "📄 Fixed",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isInfiniteCanvas) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }

                // Card 2: Input Mode & Palm Settings (Single-Line Collapsible Pill)
                var isFingerEraserOn by remember { mutableStateOf(appSettings.isFingerEraserEnabled) }
                var isHoldToEraseOn by remember { mutableStateOf(appSettings.isHoldToEraseEnabled) }
                var showInputSettingsPopup by remember { mutableStateOf(false) }

                Box {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
                        tonalElevation = 6.dp,
                        shadowElevation = 6.dp,
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .clickable { showInputSettingsPopup = true }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.PanTool,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            val modeLabel = when (inputMode) {
                                InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM -> "Pen + Gestures"
                                InputMode.PEN_ONLY -> "Pen Only"
                                InputMode.PEN_AND_FINGER_DRAW -> "All Draw"
                                else -> "Pen + Gestures"
                            }
                            Text(
                                text = modeLabel,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (isFingerEraserOn && inputMode == InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = MaterialTheme.colorScheme.primaryContainer
                                ) {
                                    Text(
                                        text = "☝️ Eraser",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.5.dp)
                                    )
                                }
                            }
                            Icon(
                                imageVector = Icons.Default.ArrowDropDown,
                                contentDescription = "Input Options",
                                modifier = Modifier.size(18.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Collapsible Input & Palm Settings Popover Menu
                    DropdownMenu(
                        expanded = showInputSettingsPopup,
                        onDismissRequest = { showInputSettingsPopup = false }
                    ) {
                        Column(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = "Stylus & Touch Input Settings",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            // Mode Chips
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                FilterChip(
                                    selected = inputMode == InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM,
                                    onClick = {
                                        inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM
                                        appSettings.inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM
                                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(
                                            inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM,
                                            isFingerEraserEnabled = isFingerEraserOn
                                        )
                                    },
                                    label = { Text("A: Pen + Gestures", fontSize = 11.sp) }
                                )
                                FilterChip(
                                    selected = inputMode == InputMode.PEN_ONLY,
                                    onClick = {
                                        inputMode = InputMode.PEN_ONLY
                                        appSettings.inputMode = InputMode.PEN_ONLY
                                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(
                                            inputMode = InputMode.PEN_ONLY,
                                            isFingerEraserEnabled = isFingerEraserOn
                                        )
                                    },
                                    label = { Text("B: Pen Only", fontSize = 11.sp) }
                                )
                                FilterChip(
                                    selected = inputMode == InputMode.PEN_AND_FINGER_DRAW,
                                    onClick = {
                                        inputMode = InputMode.PEN_AND_FINGER_DRAW
                                        appSettings.inputMode = InputMode.PEN_AND_FINGER_DRAW
                                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(
                                            inputMode = InputMode.PEN_AND_FINGER_DRAW,
                                            isFingerEraserEnabled = isFingerEraserOn
                                        )
                                    },
                                    label = { Text("C: All Draw", fontSize = 11.sp) }
                                )
                            }

                            HorizontalDivider(thickness = 0.5.dp)

                            // Finger Eraser Toggle
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        isFingerEraserOn = !isFingerEraserOn
                                        appSettings.isFingerEraserEnabled = isFingerEraserOn
                                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(
                                            isFingerEraserEnabled = isFingerEraserOn
                                        )
                                    }
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.TouchApp,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp),
                                        tint = if (isFingerEraserOn) MaterialTheme.colorScheme.primary else Color.Gray
                                    )
                                    Column {
                                        Text("Finger as Eraser (Palm-Safe)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                        Text("Single finger erases; 2 fingers pan & zoom", fontSize = 10.sp, color = Color.Gray)
                                    }
                                }
                                Switch(
                                    checked = isFingerEraserOn,
                                    onCheckedChange = {
                                        isFingerEraserOn = it
                                        appSettings.isFingerEraserEnabled = it
                                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(
                                            isFingerEraserEnabled = it
                                        )
                                    }
                                )
                            }

                            // Hold Pen to Erase Toggle
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        isHoldToEraseOn = !isHoldToEraseOn
                                        appSettings.isHoldToEraseEnabled = isHoldToEraseOn
                                        canvasView.holdToEraseEnabled = isHoldToEraseOn
                                    }
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Schedule,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp),
                                        tint = if (isHoldToEraseOn) MaterialTheme.colorScheme.primary else Color.Gray
                                    )
                                    Column {
                                        Text("Hold Pen to Erase (800ms)", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                        Text("NoteWise style stationary pen hold (800ms)", fontSize = 10.sp, color = Color.Gray)
                                    }
                                }
                                Switch(
                                    checked = isHoldToEraseOn,
                                    onCheckedChange = {
                                        isHoldToEraseOn = it
                                        appSettings.isHoldToEraseEnabled = it
                                        canvasView.holdToEraseEnabled = it
                                    }
                                )
                            }

                            // Debug HUD Toggle
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        isDebugOverlayOn = !isDebugOverlayOn
                                        appSettings.isDebugOverlayEnabled = isDebugOverlayOn
                                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(debugOverlayEnabled = isDebugOverlayOn)
                                        canvasView.invalidate()
                                    }
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.BugReport,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp),
                                        tint = if (isDebugOverlayOn) MaterialTheme.colorScheme.primary else Color.Gray
                                    )
                                    Text("Debug Performance HUD", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                }
                                Switch(
                                    checked = isDebugOverlayOn,
                                    onCheckedChange = {
                                        isDebugOverlayOn = it
                                        appSettings.isDebugOverlayEnabled = it
                                        canvasView.palmFilter.config = canvasView.palmFilter.config.copy(debugOverlayEnabled = it)
                                        canvasView.invalidate()
                                    }
                                )
                            }
                        }
                    }
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
                trashPages = trashPages,
                activePageId = currentPage?.metadata?.pageId,
                dueReviewCount = duePages.size,
                onPageSelected = { notebookId, pageId ->
                    docManager.switchToNotebookAndPage(notebookId, pageId) { page ->
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
                },
                onOpenBackupSettings = {
                    isGoogleDriveDialogOpen = true
                },
                onOpenLocalBackupSettings = {
                    isLocalBackupDialogOpen = true
                },
                onCreateFolder = { name, parentId, iconKey ->
                    scope.launch {
                        libraryRepo.createFolder(name, parentId, iconKey)
                        Toast.makeText(context, "Created folder: $name", Toast.LENGTH_SHORT).show()
                    }
                },
                onCreateNotebook = { title, fId, iconKey ->
                    scope.launch {
                        val nb = libraryRepo.createNotebook(title, fId, iconKey)
                        docManager.initialize(nb.notebookId) {
                            val p = docManager.currentPage.value
                            if (p != null) canvasView.loadPage(p, docManager.lastOpenLatencyMs.value)
                        }
                        Toast.makeText(context, "Created notebook: $title", Toast.LENGTH_SHORT).show()
                    }
                },
                onCreateGeneralPage = { nbId, title, template ->
                    scope.launch {
                        val page = libraryRepo.createGeneralNotePage(nbId, title, template)
                        docManager.switchToNotebookAndPage(nbId, page.pageId) { p ->
                            canvasView.loadPage(p, docManager.lastOpenLatencyMs.value)
                        }
                        isSidebarOpen = false
                        Toast.makeText(context, "Created note: $title", Toast.LENGTH_SHORT).show()
                    }
                },
                onCreateProblemPage = { nbId, title, url, diff, tags ->
                    scope.launch {
                        val page = libraryRepo.createProblemPage(nbId, title, url.ifEmpty { null }, diff, tags)
                        docManager.switchToNotebookAndPage(nbId, page.pageId) { p ->
                            canvasView.loadPage(p, docManager.lastOpenLatencyMs.value)
                        }
                        isSidebarOpen = false
                        Toast.makeText(context, "Created problem: $title", Toast.LENGTH_SHORT).show()
                    }
                },
                onRenamePage = { pageId, newTitle ->
                    scope.launch {
                        libraryRepo.renamePage(pageId, newTitle)
                        if (currentPage?.metadata?.pageId == pageId) {
                            currentPage?.metadata = currentPage?.metadata?.copy(title = newTitle) ?: currentPage!!.metadata
                        }
                        Toast.makeText(context, "Renamed to: $newTitle", Toast.LENGTH_SHORT).show()
                    }
                },
                onRenameNotebook = { notebookId, newTitle ->
                    scope.launch {
                        libraryRepo.renameNotebook(notebookId, newTitle)
                        Toast.makeText(context, "Notebook renamed to: $newTitle", Toast.LENGTH_SHORT).show()
                    }
                },
                onRenameFolder = { folderId, newName ->
                    scope.launch {
                        libraryRepo.renameFolder(folderId, newName)
                        Toast.makeText(context, "Folder renamed to: $newName", Toast.LENGTH_SHORT).show()
                    }
                },
                onChangeFolderIcon = { folderId, iconKey ->
                    scope.launch {
                        libraryRepo.updateFolderIcon(folderId, iconKey)
                    }
                },
                onChangeNotebookIcon = { notebookId, iconKey ->
                    scope.launch {
                        libraryRepo.updateNotebookIcon(notebookId, iconKey)
                    }
                },
                onDeleteFolder = { folderId ->
                    scope.launch {
                        libraryRepo.deleteFolder(folderId)
                        Toast.makeText(context, "Subject/Topic deleted", Toast.LENGTH_SHORT).show()
                    }
                },
                onDeleteNotebook = { notebookId ->
                    scope.launch {
                        libraryRepo.deleteNotebook(notebookId)
                        Toast.makeText(context, "Notebook deleted", Toast.LENGTH_SHORT).show()
                    }
                },
                onMoveItemsToTrash = { folderIds, notebookIds, pageIds ->
                    scope.launch {
                        for (fId in folderIds) {
                            libraryRepo.deleteFolder(fId)
                        }
                        for (nbId in notebookIds) {
                            libraryRepo.deleteNotebook(nbId)
                        }
                        if (pageIds.isNotEmpty()) {
                            libraryRepo.movePagesToTrash(pageIds)
                            val currId = currentPage?.metadata?.pageId
                            if (currId != null && pageIds.contains(currId)) {
                                val remaining = libraryRepo.getAllActivePages().first().filter { !pageIds.contains(it.pageId) }
                                val next = remaining.firstOrNull()
                                if (next != null) {
                                    docManager.switchToNotebookAndPage(next.notebookId, next.pageId) { p ->
                                        canvasView.loadPage(p, docManager.lastOpenLatencyMs.value)
                                    }
                                }
                            }
                        }
                        Toast.makeText(context, "Selected items deleted / moved to Trash", Toast.LENGTH_SHORT).show()
                    }
                },
                onMovePagesToTrash = { pageIds ->
                    scope.launch {
                        libraryRepo.movePagesToTrash(pageIds)
                        val currId = currentPage?.metadata?.pageId
                        if (currId != null && pageIds.contains(currId)) {
                            val remaining = libraryRepo.getAllActivePages().first().filter { !pageIds.contains(it.pageId) }
                            val next = remaining.firstOrNull()
                            if (next != null) {
                                docManager.switchToNotebookAndPage(next.notebookId, next.pageId) { p ->
                                    canvasView.loadPage(p, docManager.lastOpenLatencyMs.value)
                                }
                            }
                        }
                        Toast.makeText(context, "${pageIds.size} note(s) moved to Trash", Toast.LENGTH_SHORT).show()
                    }
                },
                onRestorePageFromTrash = { pageId ->
                    scope.launch {
                        libraryRepo.restorePageFromTrash(pageId)
                        Toast.makeText(context, "Note restored!", Toast.LENGTH_SHORT).show()
                    }
                },
                onDeletePagePermanently = { pageId ->
                    scope.launch {
                        libraryRepo.deletePagePermanently(pageId)
                        Toast.makeText(context, "Permanently deleted", Toast.LENGTH_SHORT).show()
                    }
                },
                onEmptyTrash = {
                    scope.launch {
                        libraryRepo.emptyTrash()
                        Toast.makeText(context, "Trash emptied", Toast.LENGTH_SHORT).show()
                    }
                }
            )
        }

        // Floating Lasso Action Bar (When strokes are selected: Draggable & Auto-Positioned beside selection)
        if (hasLassoSelection) {
            val currentOffset = lassoToolbarOffset ?: Offset(60f, 180f)
            Card(
                modifier = Modifier
                    .offset { IntOffset(currentOffset.x.roundToInt(), currentOffset.y.roundToInt()) }
                    .onGloballyPositioned { coords ->
                        val measuredW = coords.size.width.toFloat()
                        val measuredH = coords.size.height.toFloat()
                        lassoCardWidthPx = measuredW
                        lassoCardHeightPx = measuredH
                        lassoToolbarOffset?.let { cur ->
                            val screenW = context.resources.displayMetrics.widthPixels.toFloat()
                            val screenH = context.resources.displayMetrics.heightPixels.toFloat()
                            val density = context.resources.displayMetrics.density
                            val margin = 16f * density
                            val minX = margin
                            val maxX = (screenW - measuredW - margin).coerceAtLeast(minX)
                            val minY = 100f * density
                            val maxY = (screenH - measuredH - 90f * density).coerceAtLeast(minY)
                            val clampedX = cur.x.coerceIn(minX, maxX)
                            val clampedY = cur.y.coerceIn(minY, maxY)
                            if (clampedX != cur.x || clampedY != cur.y) {
                                lassoToolbarOffset = Offset(clampedX, clampedY)
                            }
                        }
                    },
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                shape = RoundedCornerShape(18.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Draggable Grip Handle
                    Row(
                        modifier = Modifier
                            .pointerInput(Unit) {
                                detectDragGestures { change, dragAmount ->
                                    change.consume()
                                    val cur = lassoToolbarOffset ?: Offset(60f, 180f)
                                    val screenW = context.resources.displayMetrics.widthPixels.toFloat()
                                    val screenH = context.resources.displayMetrics.heightPixels.toFloat()
                                    val density = context.resources.displayMetrics.density
                                    val toolbarW = if (lassoCardWidthPx > 50f) lassoCardWidthPx else 420f * density
                                    val toolbarH = if (lassoCardHeightPx > 20f) lassoCardHeightPx else 56f * density
                                    val margin = 16f * density
                                    val minX = margin
                                    val maxX = (screenW - toolbarW - margin).coerceAtLeast(minX)
                                    val minY = 90f * density
                                    val maxY = (screenH - toolbarH - 80f * density).coerceAtLeast(minY)
                                    val newX = (cur.x + dragAmount.x).coerceIn(minX, maxX)
                                    val newY = (cur.y + dragAmount.y).coerceIn(minY, maxY)
                                    lassoToolbarOffset = Offset(newX, newY)
                                }
                            }
                            .padding(end = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DragHandle,
                            contentDescription = "Drag to Reposition Toolbar",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                            modifier = Modifier.size(20.dp)
                        )

                        Text(
                            text = "Lasso (${canvasView.lassoTool.selectedStrokes.size})",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Copy
                    IconButton(
                        onClick = {
                            val count = canvasView.copyLassoSelection()
                            lassoHasClipboard = count > 0
                            Toast.makeText(context, "Copied $count strokes", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(18.dp))
                    }

                    // Paste
                    IconButton(
                        onClick = {
                            val pasted = canvasView.pasteLassoClipboard()
                            Toast.makeText(context, "Pasted ${pasted.size} strokes", Toast.LENGTH_SHORT).show()
                        },
                        enabled = lassoHasClipboard,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            Icons.Default.ContentPaste,
                            contentDescription = "Paste",
                            tint = if (lassoHasClipboard) MaterialTheme.colorScheme.onSurfaceVariant else Color.LightGray,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // Duplicate
                    IconButton(
                        onClick = {
                            canvasView.duplicateLassoSelection()
                            Toast.makeText(context, "Duplicated selection", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.CopyAll, contentDescription = "Duplicate", modifier = Modifier.size(18.dp))
                    }

                    // Convert to Typed Text via On-Device ML Kit
                    IconButton(
                        onClick = {
                            scope.launch {
                                Toast.makeText(context, "Transcribing handwriting with ML Kit...", Toast.LENGTH_SHORT).show()
                                val text = canvasView.convertLassoSelectionToText()
                                if (!text.isNullOrBlank()) {
                                    recognizedTextResult = text
                                    val clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                                    val clip = android.content.ClipData.newPlainText("Handwriting", text)
                                    clipboard.setPrimaryClip(clip)
                                    Toast.makeText(context, "Transcribed & Copied: \"$text\"", Toast.LENGTH_LONG).show()
                                } else {
                                    Toast.makeText(context, "No text recognized. Ensure clear handwriting or connected to network for first-time model setup.", Toast.LENGTH_LONG).show()
                                }
                            }
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.TextFields, contentDescription = "Convert to Text", modifier = Modifier.size(18.dp))
                    }

                    // Recolor quick dots & Full RGB Grid Palette Picker
                    var showLassoColorPickerMenu by remember { mutableStateOf(false) }

                    listOf(
                        Color(0xFF111318), // Black
                        Color(0xFFFFFFFF), // White
                        Color(0xFFFE0000), // Red
                        Color(0xFF0001FE), // Blue
                        Color(0xFF008101)  // Green
                    ).forEach { color ->
                        Box(
                            modifier = Modifier
                                .size(20.dp)
                                .clip(CircleShape)
                                .background(color)
                                .border(1.dp, if (color == Color.White) Color.Gray else Color.White, CircleShape)
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

                    // Full Palette Button
                    Box {
                        IconButton(
                            onClick = { showLassoColorPickerMenu = !showLassoColorPickerMenu },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Palette,
                                contentDescription = "Full Color Palette",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        DropdownMenu(
                            expanded = showLassoColorPickerMenu,
                            onDismissRequest = { showLassoColorPickerMenu = false }
                        ) {
                            GridColorPicker(
                                selectedColor = selectedColor,
                                onColorSelected = { color ->
                                    val intColor = AndroidColor.argb(
                                        (color.alpha * 255).toInt(),
                                        (color.red * 255).toInt(),
                                        (color.green * 255).toInt(),
                                        (color.blue * 255).toInt()
                                    )
                                    canvasView.changeLassoSelectionColor(intColor)
                                    showLassoColorPickerMenu = false
                                },
                                modifier = Modifier.width(360.dp)
                            )
                        }
                    }

                    // Delete selection
                    IconButton(
                        onClick = { canvasView.deleteLassoSelection() },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                    }

                    // Done / Clear selection
                    IconButton(
                        onClick = {
                            canvasView.clearLassoSelection()
                            switchToTool(CanvasTool.PRESSURE_PEN)
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = "Done", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                    }
                }
            }
        } else if (selectedTool == CanvasTool.LASSO && lassoHasClipboard) {
            // Floating Paste Button when clipboard has strokes
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 80.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .clickable {
                            val pasted = canvasView.pasteLassoClipboard()
                            Toast.makeText(context, "Pasted ${pasted.size} strokes", Toast.LENGTH_SHORT).show()
                        }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ContentPaste,
                        contentDescription = "Paste",
                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = "Paste Copied Strokes",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
        }

        // Floating Image Action Bar (When an image is selected)
        if (selectedCanvasImage != null) {
            val currentOffset = imageToolbarOffset ?: Offset(60f, 180f)
            Card(
                modifier = Modifier
                    .offset { IntOffset(currentOffset.x.roundToInt(), currentOffset.y.roundToInt()) }
                    .onGloballyPositioned { coordinates ->
                        val w = coordinates.size.width.toFloat()
                        val h = coordinates.size.height.toFloat()
                        if (w > 50f) imageCardWidthPx = w
                        if (h > 20f) imageCardHeightPx = h

                        imageToolbarOffset?.let { cur ->
                            val screenW = context.resources.displayMetrics.widthPixels.toFloat()
                            val screenH = context.resources.displayMetrics.heightPixels.toFloat()
                            val density = context.resources.displayMetrics.density
                            val margin = 20f * density
                            val minX = margin
                            val maxX = (screenW - w - margin).coerceAtLeast(minX)
                            val minY = 100f * density
                            val maxY = (screenH - h - 90f * density).coerceAtLeast(minY)

                            val clampedX = cur.x.coerceIn(minX, maxX)
                            val clampedY = cur.y.coerceIn(minY, maxY)
                            if (clampedX != cur.x || clampedY != cur.y) {
                                imageToolbarOffset = Offset(clampedX, clampedY)
                            }
                        }
                    },
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Draggable Grip Handle
                    Row(
                        modifier = Modifier
                            .pointerInput(Unit) {
                                detectDragGestures { change, dragAmount ->
                                    change.consume()
                                    val cur = imageToolbarOffset ?: Offset(60f, 180f)
                                    val screenW = context.resources.displayMetrics.widthPixels.toFloat()
                                    val screenH = context.resources.displayMetrics.heightPixels.toFloat()
                                    val density = context.resources.displayMetrics.density
                                    val margin = 20f * density
                                    val w = if (imageCardWidthPx > 50f) imageCardWidthPx else 420f * density
                                    val h = if (imageCardHeightPx > 20f) imageCardHeightPx else 64f * density
                                    val minX = margin
                                    val maxX = (screenW - w - margin).coerceAtLeast(minX)
                                    val minY = 100f * density
                                    val maxY = (screenH - h - 90f * density).coerceAtLeast(minY)

                                    val newX = (cur.x + dragAmount.x).coerceIn(minX, maxX)
                                    val newY = (cur.y + dragAmount.y).coerceIn(minY, maxY)
                                    imageToolbarOffset = Offset(newX, newY)
                                }
                            }
                            .padding(end = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DragHandle,
                            contentDescription = "Drag Toolbar",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                            modifier = Modifier.size(20.dp)
                        )

                        Text(
                            text = "Image",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Crop Button
                    IconButton(
                        onClick = { imageBeingCropped = selectedCanvasImage },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.Crop, contentDescription = "Crop Image", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                    }

                    // Rotate 90 Button
                    IconButton(
                        onClick = { canvasView.rotateSelectedImage(90f) },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.RotateRight, contentDescription = "Rotate 90", modifier = Modifier.size(18.dp))
                    }

                    // Fit Width
                    IconButton(
                        onClick = {
                            canvasView.fitSelectedImageToWidth()
                            Toast.makeText(context, "Fitted to page width", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.AspectRatio, contentDescription = "Fit Page Width", modifier = Modifier.size(18.dp))
                    }

                    // Duplicate
                    IconButton(
                        onClick = {
                            val dup = canvasView.duplicateSelectedImage()
                            if (dup != null) {
                                val curPage = docManager.currentPage.value
                                if (curPage != null) {
                                    curPage.addImage(dup)
                                    scope.launch {
                                        pageRepo.savePageAtomic(curPage)
                                        database.notebookDao().setNotebookDirty(curPage.metadata.notebookId, true)
                                    }
                                }
                                Toast.makeText(context, "Duplicated image", Toast.LENGTH_SHORT).show()
                            }
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.CopyAll, contentDescription = "Duplicate Image", modifier = Modifier.size(18.dp))
                    }

                    // Delete
                    IconButton(
                        onClick = {
                            canvasView.deleteSelectedImage()
                            Toast.makeText(context, "Deleted image", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete Image", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                    }

                    // Done / Clear selection
                    IconButton(
                        onClick = {
                            canvasView.clearImageSelection()
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = "Done Editing Image", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
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
                onExportHtml = {
                    scope.launch(Dispatchers.IO) {
                        isExporting = true
                        val exportDir = File(context.cacheDir, "exports").apply { mkdirs() }
                        val safeTitle = (nBook?.title ?: page?.metadata?.title ?: "Note").replace(Regex("[^a-zA-Z0-9_-]"), "_")
                        val htmlFile = File(exportDir, "${safeTitle}_${System.currentTimeMillis()}.html")
                        val pageList = if (page != null) listOf(page) else emptyList()
                        htmlFile.outputStream().use { out ->
                            PageExporter.exportToInteractiveHtml(
                                notebookTitle = nBook?.title ?: "DSA Notebook",
                                pages = pageList,
                                outputStream = out,
                                initialDarkMode = isDarkMode
                            )
                        }
                        withContext(Dispatchers.Main) {
                            isExporting = false
                            exportSuccessMessage = "Universal Web Note Exported (${htmlFile.length() / 1024} KB)"
                            shareExportFile(htmlFile, "text/html", "Share Universal Web Note (.html)")
                        }
                    }
                },
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

        // Shapes & Diagrams Dialog (Basic Shapes, System Design & DSA shapes + hold-to-snap)
        if (isShapesDialogOpen) {
            ShapesDialog(
                isHoldToSnapEnabled = isShapeSnapOn,
                onToggleHoldToSnap = { enabled ->
                    isShapeSnapOn = enabled
                    canvasView.holdToSnapEnabled = enabled
                },
                isShapeToolActive = selectedTool == CanvasTool.SHAPE,
                onToggleShapeTool = { active ->
                    if (active) {
                        switchToTool(CanvasTool.SHAPE)
                    } else {
                        switchToTool(CanvasTool.PRESSURE_PEN)
                    }
                },
                viewportCenter = canvasView.getViewportCenter(),
                onInsertShape = { shape ->
                    canvasView.insertShape(shape)
                    isShapesDialogOpen = false
                    Toast.makeText(context, "Inserted ${shape::class.simpleName}", Toast.LENGTH_SHORT).show()
                },
                onDismissRequest = { isShapesDialogOpen = false }
            )
        }

        // Edit Problem Details Dialog
        if (isEditProblemOpen && currentProblemPage != null) {
            EditProblemDialog(
                page = currentProblemPage,
                onSave = { updated ->
                    scope.launch {
                        libraryRepo.updatePage(updated)
                        isEditProblemOpen = false
                        Toast.makeText(context, "Saved changes to ${updated.title}", Toast.LENGTH_SHORT).show()
                    }
                },
                onDismissRequest = { isEditProblemOpen = false }
            )
        }

        // Clear Canvas Confirmation Dialog (Top bar red trash icon)
        if (showClearCanvasDialog) {
            AlertDialog(
                onDismissRequest = { showClearCanvasDialog = false },
                icon = { Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                title = { Text("Clear Entire Canvas?") },
                text = { Text("Are you sure you want to clear all ink strokes on this page? This action cannot be undone.") },
                confirmButton = {
                    Button(
                        onClick = {
                            canvasView.clearCanvas()
                            showClearCanvasDialog = false
                            Toast.makeText(context, "Canvas cleared", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("Clear Canvas", color = MaterialTheme.colorScheme.onError)
                    }
                },
                dismissButton = {
                    OutlinedButton(onClick = { showClearCanvasDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }

        // Delete Page Confirmation Dialog (Moves to 30-day Trash)
        if (showDeletePageDialog) {
            AlertDialog(
                onDismissRequest = { showDeletePageDialog = false },
                icon = { Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                title = { Text("Move Page to Trash?") },
                text = { Text("Are you sure you want to move this page to Trash? You can restore it from Trash within 30 days.") },
                confirmButton = {
                    Button(
                        onClick = {
                            val pId = currentPage?.metadata?.pageId
                            showDeletePageDialog = false
                            docManager.deleteCurrentPage { p ->
                                canvasView.loadPage(p, docManager.lastOpenLatencyMs.value)
                            }
                            if (pId != null) {
                                scope.launch { libraryRepo.movePageToTrash(pId) }
                            }
                            Toast.makeText(context, "Page moved to Trash", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("Move to Trash", color = MaterialTheme.colorScheme.onError)
                    }
                },
                dismissButton = {
                    OutlinedButton(onClick = { showDeletePageDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }

        // Persistent Local Backup Dialog
        if (isLocalBackupDialogOpen) {
            com.antigravity.note.ui.backup.LocalBackupDialog(
                localBackupManager = localBackupManager,
                onDismiss = { isLocalBackupDialogOpen = false }
            )
        }

        // Auto-Restore Detected Notes Dialog (Fresh install / data wipe recovery)
        if (detectedNotesPrompt != null) {
            val prompt = detectedNotesPrompt!!
            AlertDialog(
                onDismissRequest = { detectedNotesPrompt = null },
                icon = { Icon(Icons.Default.FolderOpen, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
                title = { Text("Restore Your Notes") },
                text = {
                    Text("Found existing notes in ${prompt.folderDisplayPath} (${prompt.pageCount} pages, ${prompt.notebookCount} notebooks).\n\nWould you like to restore them now?")
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val p = detectedNotesPrompt ?: return@Button
                            detectedNotesPrompt = null
                            scope.launch {
                                val result = localBackupManager.restoreFromPersistentFolder(p)
                                if (result.success) {
                                    docManager.initialize(docManager.defaultNotebookId) {
                                        val cur = docManager.currentPage.value
                                        if (cur != null) canvasView.loadPage(cur)
                                    }
                                    Toast.makeText(context, "Restored ${result.restoredPages} pages successfully!", Toast.LENGTH_LONG).show()
                                } else {
                                    Toast.makeText(context, "Restore failed: ${result.error}", Toast.LENGTH_LONG).show()
                                }
                            }
                        }
                    ) {
                        Text("Restore Notes")
                    }
                },
                dismissButton = {
                    OutlinedButton(onClick = { detectedNotesPrompt = null }) {
                        Text("Start Fresh")
                    }
                }
            )
        }

        // Google Drive Lossless Backup & Restore Dialog
        if (isGoogleDriveDialogOpen) {
            GoogleDriveBackupDialog(
                authStorage = googleDriveAuthStorage,
                backupEngine = googleDriveBackupEngine,
                restoreEngine = googleDriveRestoreEngine,
                onRestoreCompleted = {
                    docManager.initialize(docManager.getActiveNotebookId()) {
                        val cur = docManager.currentPage.value
                        if (cur != null) {
                            canvasView.loadPage(
                                cur,
                                docManager.lastOpenLatencyMs.value,
                                pageRepo.getAssetsDir(cur.metadata.notebookId)
                            )
                        }
                    }
                },
                onDismiss = { isGoogleDriveDialogOpen = false }
            )
        }

        // Page Repair Dialog
        if (isRepairDialogOpen && repairScanResult != null) {
            val scan = repairScanResult!!
            AlertDialog(
                onDismissRequest = { isRepairDialogOpen = false },
                title = { Text(if (scan.isDamaged) "Repair Damaged Ink" else "Ink Integrity Check") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (scan.isDamaged) {
                            Text("Detected ${scan.redundantStrokeIndices.size} redundant intermediate drag frames on page '${scan.pageTitle}'.")
                            Text("• Original strokes: ${scan.originalStrokeCount}")
                            Text("• Cleaned strokes: ${scan.cleanedStrokeCount}")
                            Text(
                                "A safety snapshot backup will be taken before applying changes.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        } else {
                            Text("Page '${scan.pageTitle}' is completely healthy! All ${scan.originalStrokeCount} strokes are valid with zero redundant frames.")
                        }
                    }
                },
                confirmButton = {
                    if (scan.isDamaged) {
                        Button(
                            onClick = {
                                isRepairDialogOpen = false
                                val current = docManager.currentPage.value
                                if (current != null) {
                                    val repaired = com.antigravity.note.document.repair.PageRepairTool.applyRepair(current)
                                    scope.launch {
                                        docManager.repository.savePageAtomic(repaired)
                                        canvasView.loadPage(repaired)
                                    }
                                }
                            }
                        ) {
                            Text("Apply Repair")
                        }
                    } else {
                        Button(onClick = { isRepairDialogOpen = false }) {
                            Text("OK")
                        }
                    }
                },
                dismissButton = {
                    if (scan.isDamaged) {
                        OutlinedButton(onClick = { isRepairDialogOpen = false }) {
                            Text("Cancel")
                        }
                    }
                }
            )
        }
        if (imageBeingCropped != null) {
            val curPage = docManager.currentPage.value
            if (curPage != null) {
                val assetsDir = pageRepo.getAssetsDir(curPage.metadata.notebookId)
                ImageCropDialog(
                    canvasImage = imageBeingCropped!!,
                    assetsDir = assetsDir,
                    onDismiss = { imageBeingCropped = null },
                    onCropApplied = { cropped ->
                        curPage.images.removeAll { it.id == cropped.id }
                        curPage.addImage(cropped)
                        canvasView.dryInkView.images.removeAll { it.id == cropped.id }
                        canvasView.dryInkView.addImage(cropped)
                        canvasView.selectImage(cropped)
                        canvasView.dryInkView.invalidate()
                        scope.launch {
                            pageRepo.savePageAtomic(curPage)
                            database.notebookDao().setNotebookDirty(curPage.metadata.notebookId, true)
                        }
                        imageBeingCropped = null
                        Toast.makeText(context, "Crop applied", Toast.LENGTH_SHORT).show()
                    }
                )
            }
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

@OptIn(androidx.compose.foundation.ExperimentalFoundationApi::class)
@Composable
private fun ToolIconButton(
    icon: ImageVector,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    onLongClick: (() -> Unit)? = null
) {
    Surface(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .combinedClickable(
                onClick = onClick,
                onLongClick = onLongClick
            ),
        color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
    ) {
        Row(
            modifier = Modifier.padding(horizontal = if (isSelected) 7.dp else 5.dp, vertical = 5.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(3.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.size(20.dp)
            )
            if (isSelected) {
                Text(
                    text = label,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }
    }
}
