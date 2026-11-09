package com.readmaster.app.ui.reader

import android.content.Context
import android.graphics.Color as AndroidColor
import android.net.Uri
import android.os.SystemClock
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Redo
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.CropFree
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.FullscreenExit
import androidx.compose.material.icons.filled.Highlight
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.TextFields
import androidx.compose.material.icons.filled.ZoomIn
import androidx.compose.material.icons.filled.ZoomOut
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import com.readmaster.app.engine.canvas.ReadingMode
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.readmaster.app.data.dictionary.BilingualDictionary
import com.readmaster.app.data.dictionary.VocabEntry
import com.readmaster.app.data.model.DocumentEntity
import com.readmaster.app.data.model.VocabularyEntity
import com.readmaster.app.engine.canvas.CanvasTool
import com.readmaster.app.engine.canvas.InkCanvasView
import com.readmaster.app.speech.TtsManager
import com.readmaster.app.ui.dialogs.ColorPickerDialog
import com.readmaster.app.ui.dialogs.WordLookupDialog
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreen(
    document: DocumentEntity,
    ttsManager: TtsManager,
    onSaveVocab: (VocabularyEntity) -> Unit,
    onUpdateDocProgress: (page: Int) -> Unit,
    onBackClick: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    // Canvas view reference
    var inkCanvasView: InkCanvasView? by remember { mutableStateOf(null) }

    // Persistent reading progress initialization (restore exact last page from Prefs or Room)
    val savedPage = remember(document.id) {
        val prefs = context.getSharedPreferences("lipi_reading_prefs", Context.MODE_PRIVATE)
        val prefPage = prefs.getInt("last_page_${document.id}", -1)
        if (prefPage in 0 until document.pageCount) prefPage else document.lastPage
    }

    var currentPage by remember(document.id) { mutableIntStateOf(savedPage) }
    var totalPages by remember { mutableIntStateOf(document.pageCount.coerceAtLeast(1)) }
    var currentTool by remember { mutableStateOf(CanvasTool.BOOK) }
    var currentColor by remember { mutableIntStateOf(AndroidColor.parseColor("#111318")) }
    var currentWidth by remember { mutableStateOf(4.0f) }
    var canUndo by remember { mutableStateOf(false) }
    var canRedo by remember { mutableStateOf(false) }
    var isZenMode by remember { mutableStateOf(false) }
    var isPalmFilterActive by remember { mutableStateOf(true) }
    var readingMode by remember { mutableStateOf(ReadingMode.BOOK_FLIP) }
    var isFixedScreen by remember { mutableStateOf(false) }
    var hasLassoSelection by remember { mutableStateOf(false) }
    var showLassoColorPicker by remember { mutableStateOf(false) }
    var lastBackPressTime by remember { mutableStateOf(0L) }

    // One-time Book Mode Reading Hint
    val readingPrefs = remember { context.getSharedPreferences("lipi_reading_prefs", Context.MODE_PRIVATE) }
    var hasShownBookHint by rememberSaveable {
        mutableStateOf(readingPrefs.getBoolean("has_shown_book_mode_hint", false))
    }

    LaunchedEffect(currentTool) {
        if (currentTool == CanvasTool.BOOK && !hasShownBookHint) {
            hasShownBookHint = true
            readingPrefs.edit().putBoolean("has_shown_book_mode_hint", true).apply()
            android.widget.Toast.makeText(
                context,
                "Reading mode: pen is off. Select Pen to draw.",
                android.widget.Toast.LENGTH_LONG
            ).show()
        }
    }

    // Lifecycle monitoring: immediately save page on app pause or stop
    DisposableEffect(lifecycleOwner, document.id) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_PAUSE || event == Lifecycle.Event.ON_STOP) {
                context.getSharedPreferences("lipi_reading_prefs", Context.MODE_PRIVATE)
                    .edit()
                    .putString("last_opened_doc_id", document.id)
                    .putInt("last_page_${document.id}", currentPage)
                    .apply()
                onUpdateDocProgress(currentPage)
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            context.getSharedPreferences("lipi_reading_prefs", Context.MODE_PRIVATE)
                .edit()
                .putString("last_opened_doc_id", document.id)
                .putInt("last_page_${document.id}", currentPage)
                .apply()
            onUpdateDocProgress(currentPage)
        }
    }

    // Dialogs
    var showColorStudio by remember { mutableStateOf(false) }
    var lookupEntry: VocabEntry? by remember { mutableStateOf(null) }
    var showJumpPageDialog by remember { mutableStateOf(false) }
    var showManualLookupDialog by remember { mutableStateOf(false) }
    var manualWordInput by remember { mutableStateOf("") }

    // Defensive Back Handler: Prevents accidental system back gestures while swiping from kicking user out
    BackHandler {
        if (isZenMode) {
            isZenMode = false
        } else {
            val now = SystemClock.uptimeMillis()
            if (now - lastBackPressTime < 2500L) {
                onUpdateDocProgress(currentPage)
                onBackClick()
            } else {
                lastBackPressTime = now
                android.widget.Toast.makeText(
                    context,
                    "Swipe or press back again to exit document",
                    android.widget.Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    // Palette
    val colors = listOf(
        "#111318" to "Black",
        "#1E88E5" to "Blue",
        "#E53935" to "Red",
        "#43A047" to "Green",
        "#FB8C00" to "Orange"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFEBECEF))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // TOP BAR (Hidden completely in Full Page / Zen Mode)
            AnimatedVisibility(
                visible = !isZenMode,
                enter = fadeIn() + slideInVertically(initialOffsetY = { -it }),
                exit = fadeOut() + slideOutVertically(targetOffsetY = { -it })
            ) {
                Surface(
                    color = MaterialTheme.colorScheme.surface,
                    shadowElevation = 3.dp,
                    modifier = Modifier.statusBarsPadding()
                ) {
                    Column {
                        TopAppBar(
                            title = {
                                Text(
                                    text = document.title,
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            },
                            navigationIcon = {
                                IconButton(onClick = {
                                    onUpdateDocProgress(currentPage)
                                    onBackClick()
                                }) {
                                    Icon(
                                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                        contentDescription = "Back",
                                        tint = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            },
                            actions = {
                                // Manual Word Lookup Button
                                IconButton(onClick = { showManualLookupDialog = true }) {
                                    Icon(
                                        imageVector = Icons.Default.Search,
                                        contentDescription = "Lookup Word",
                                        tint = Color(0xFF818CF8)
                                    )
                                }

                                // Full Page Mode Button
                                IconButton(onClick = { isZenMode = true }) {
                                    Icon(
                                        imageVector = Icons.Default.Fullscreen,
                                        contentDescription = "Full Page Mode",
                                        tint = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            },
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = MaterialTheme.colorScheme.surface
                            )
                        )

                        // Secondary Nav Toolbar (High-Contrast Page Navigation + Zoom & Fit)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 6.dp)
                                .horizontalScroll(rememberScrollState()),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            // Page Navigation Pill (High contrast with crisp white text & chevrons)
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFF1E293B))
                                    .border(1.dp, Color(0xFF475569), RoundedCornerShape(10.dp))
                                    .padding(horizontal = 4.dp, vertical = 2.dp)
                            ) {
                                IconButton(
                                    onClick = { inkCanvasView?.prevPage() },
                                    enabled = currentPage > 0,
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ChevronLeft,
                                        contentDescription = "Previous Page",
                                        tint = if (currentPage > 0) Color.White else Color(0xFF64748B),
                                        modifier = Modifier.size(20.dp)
                                    )
                                }

                                Text(
                                    text = "Page ${currentPage + 1} / $totalPages",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    modifier = Modifier
                                        .clickable { showJumpPageDialog = true }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                )

                                IconButton(
                                    onClick = { inkCanvasView?.nextPage() },
                                    enabled = currentPage < totalPages - 1,
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ChevronRight,
                                        contentDescription = "Next Page",
                                        tint = if (currentPage < totalPages - 1) Color.White else Color(0xFF64748B),
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(10.dp))

                            Spacer(modifier = Modifier.width(10.dp))

                            // Reading Mode Switch: Book Page Turn vs Continuous Vertical Scroll
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFF1E293B))
                                    .border(1.dp, Color(0xFF475569), RoundedCornerShape(10.dp))
                                    .padding(2.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(if (readingMode == ReadingMode.BOOK_FLIP) Color(0xFF4F46E5) else Color.Transparent)
                                        .clickable {
                                            readingMode = ReadingMode.BOOK_FLIP
                                            inkCanvasView?.readingMode = ReadingMode.BOOK_FLIP
                                        }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = "📖 Book",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (readingMode == ReadingMode.BOOK_FLIP) Color.White else Color(0xFFF1F5F9)
                                    )
                                }
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(if (readingMode == ReadingMode.CONTINUOUS_SCROLL) Color(0xFF4F46E5) else Color.Transparent)
                                        .clickable {
                                            readingMode = ReadingMode.CONTINUOUS_SCROLL
                                            inkCanvasView?.readingMode = ReadingMode.CONTINUOUS_SCROLL
                                        }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = "📜 Scroll",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (readingMode == ReadingMode.CONTINUOUS_SCROLL) Color.White else Color(0xFFF1F5F9)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(10.dp))

                            // Fixed Screen Lock Toggle (Locks viewport bounds so page cannot drift or exceed screen)
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isFixedScreen) Color(0xFF059669) else Color(0xFF1E293B))
                                    .border(1.dp, if (isFixedScreen) Color(0xFF10B981) else Color(0xFF475569), RoundedCornerShape(10.dp))
                                    .clickable {
                                        isFixedScreen = !isFixedScreen
                                        inkCanvasView?.isFixedScreen = isFixedScreen
                                    }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = if (isFixedScreen) Icons.Default.Lock else Icons.Default.LockOpen,
                                        contentDescription = "Fixed Screen",
                                        tint = Color.White,
                                        modifier = Modifier.size(15.dp)
                                    )
                                    Spacer(modifier = Modifier.width(5.dp))
                                    Text(
                                        text = if (isFixedScreen) "Fixed Screen ON" else "Fixed Screen",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(10.dp))

                            // Zoom & Fit Controls (High-contrast, bold buttons)
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFF1E293B))
                                    .border(1.dp, Color(0xFF475569), RoundedCornerShape(10.dp))
                                    .padding(horizontal = 6.dp, vertical = 3.dp)
                            ) {
                                IconButton(
                                    onClick = { inkCanvasView?.zoomOut() },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ZoomOut,
                                        contentDescription = "Zoom Out",
                                        tint = Color.White,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }

                                Text(
                                    text = "Reset",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    modifier = Modifier
                                        .clickable { inkCanvasView?.resetZoom() }
                                        .padding(horizontal = 8.dp)
                                )

                                IconButton(
                                    onClick = { inkCanvasView?.zoomIn() },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ZoomIn,
                                        contentDescription = "Zoom In",
                                        tint = Color.White,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color(0xFF2563EB))
                                        .clickable {
                                            val w = inkCanvasView?.width?.toFloat() ?: 1200f
                                            val h = inkCanvasView?.height?.toFloat() ?: 1600f
                                            inkCanvasView?.fitWidth(w, h)
                                        }
                                        .padding(horizontal = 10.dp, vertical = 5.dp)
                                ) {
                                    Text(
                                        text = "Fit Width",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }

                                Spacer(modifier = Modifier.width(6.dp))

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color(0xFF4F46E5))
                                        .clickable {
                                            val w = inkCanvasView?.width?.toFloat() ?: 1200f
                                            val h = inkCanvasView?.height?.toFloat() ?: 1600f
                                            inkCanvasView?.fitPage(w, h)
                                        }
                                        .padding(horizontal = 10.dp, vertical = 5.dp)
                                ) {
                                    Text(
                                        text = "Fit Page",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // CENTER CANVAS AREA (Occupies 100% full screen in Full Page Mode)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .background(Color(0xFFEBECEF))
            ) {
                AndroidView(
                    factory = { ctx ->
                        InkCanvasView(ctx).apply {
                            inkCanvasView = this

                            // Open PDF Document using unified PdfPageEngine
                            try {
                                if (document.uriString.startsWith("content://")) {
                                    val uri = Uri.parse(document.uriString)
                                    context.contentResolver.openFileDescriptor(uri, "r")?.let { pfd ->
                                        pageEngine.openPdf(pfd)
                                    }
                                } else {
                                    val file = File(document.uriString)
                                    if (file.exists()) {
                                        pageEngine.openPdf(file)
                                    }
                                }
                                if (pageEngine.pageCount > 0) {
                                    totalPages = pageEngine.pageCount
                                    setPdfPage(currentPage, fitToScreen = true)
                                }
                            } catch (e: Exception) {
                                e.printStackTrace()
                            }

                            currentTool = CanvasTool.BOOK
                            inkCanvasView?.activeTool = CanvasTool.BOOK
                            isFixedScreen = isFixedScreen

                            // Undo / Redo listener
                            onUndoRedoStateChanged = { u, r ->
                                canUndo = u
                                canRedo = r
                            }

                            // Lasso selection listener
                            onLassoSelectionChanged = { hasSel ->
                                hasLassoSelection = hasSel
                                if (!hasSel) showLassoColorPicker = false
                            }

                            // Page changed listener (swipes, buttons, taps)
                            onPageChanged = { page ->
                                currentPage = page
                                onUpdateDocProgress(page)
                            }

                            // Bilingual word selection listener
                            onWordSelected = { rawWord, _, _ ->
                                val clean = rawWord.trim().trim(
                                    '"', '\'', '.', ',', ';', ':', '?', '!',
                                    '(', ')', '[', ']', '{', '}', '“', '”', '‘', '’'
                                )
                                if (clean.isNotBlank()) {
                                    lookupEntry = BilingualDictionary.lookup(clean)
                                }
                            }
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )

                // FULL PAGE MODE: Top floating pill indicator with Exit button
                if (isZenMode) {
                    Surface(
                        shape = RoundedCornerShape(24.dp),
                        color = Color(0xDD1E1B4B),
                        shadowElevation = 8.dp,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .statusBarsPadding()
                            .padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoStories,
                                contentDescription = null,
                                tint = Color(0xFFFBBF24),
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Page ${currentPage + 1} / $totalPages",
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.clickable { showJumpPageDialog = true }
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.2f))
                                    .clickable { isZenMode = false },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.FullscreenExit,
                                    contentDescription = "Exit Full Page Mode",
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // FLOATING LASSO ACTIONS BAR (Visible when Lasso tool has an active selection)
        AnimatedVisibility(
            visible = !isZenMode && currentTool == CanvasTool.LASSO && hasLassoSelection,
            enter = fadeIn() + slideInVertically(initialOffsetY = { it }),
            exit = fadeOut() + slideOutVertically(targetOffsetY = { it }),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 88.dp)
                .padding(horizontal = 16.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFF1E222B),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF6366F1)),
                tonalElevation = 14.dp,
                shadowElevation = 18.dp
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Delete Button
                    Button(
                        onClick = {
                            inkCanvasView?.deleteLassoSelection()
                            hasLassoSelection = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", modifier = Modifier.size(16.dp), tint = Color.White)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Delete", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
                    }

                    // Duplicate Button
                    Button(
                        onClick = { inkCanvasView?.duplicateLassoSelection() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Duplicate", modifier = Modifier.size(16.dp), tint = Color.White)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Duplicate", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
                    }

                    // Color Button
                    Button(
                        onClick = { showLassoColorPicker = !showLassoColorPicker },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Default.Palette, contentDescription = "Change Color", modifier = Modifier.size(16.dp), tint = Color.White)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Color", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
                    }

                    if (showLassoColorPicker) {
                        listOf("#111318", "#2563EB", "#DC2626", "#059669", "#D97706", "#7C3AED").forEach { hex ->
                            val c = AndroidColor.parseColor(hex)
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(Color(c))
                                    .border(1.5.dp, Color.White, CircleShape)
                                    .clickable {
                                        inkCanvasView?.changeLassoSelectionColor(c)
                                    }
                            )
                        }
                    }

                    IconButton(
                        onClick = {
                            inkCanvasView?.clearLassoSelection()
                            hasLassoSelection = false
                        },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Deselect", tint = Color(0xFF94A3B8), modifier = Modifier.size(18.dp))
                    }
                }
            }
        }

        // FLOATING INK & READING TOOLBAR (Bottom Center, High Contrast & 26dp clearance)
        AnimatedVisibility(
            visible = !isZenMode,
            enter = fadeIn() + slideInVertically(initialOffsetY = { it }),
            exit = fadeOut() + slideOutVertically(targetOffsetY = { it }),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 26.dp)
                .padding(horizontal = 16.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(28.dp),
                color = Color(0xFF1E222B),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF333A48)),
                tonalElevation = 10.dp,
                shadowElevation = 14.dp
            ) {
                Row(
                    modifier = Modifier
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                        .horizontalScroll(rememberScrollState()),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(5.dp)
                ) {
                    // Tools: Book Read, Pen, Highlighter, Eraser, Lasso, Word Translate
                    listOf(
                        Triple(CanvasTool.BOOK, Icons.Default.AutoStories, "Book"),
                        Triple(CanvasTool.PEN, Icons.Default.Edit, "Pen"),
                        Triple(CanvasTool.HIGHLIGHT, Icons.Default.Highlight, "Highlight"),
                        Triple(CanvasTool.ERASER, Icons.Default.CleaningServices, "Eraser"),
                        Triple(CanvasTool.LASSO, Icons.Default.CropFree, "Lasso"),
                        Triple(CanvasTool.TRANSLATE, Icons.Default.TextFields, "Translate")
                    ).forEach { (tool, icon, label) ->
                        val isSelected = currentTool == tool
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    if (isSelected) Color(0xFF4F46E5) else Color.Transparent
                                )
                                .border(
                                    width = if (isSelected) 1.5.dp else 0.dp,
                                    color = if (isSelected) Color(0xFF818CF8) else Color.Transparent,
                                    shape = RoundedCornerShape(12.dp)
                                )
                                .clickable {
                                    currentTool = tool
                                    inkCanvasView?.activeTool = tool
                                }
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = label,
                                    tint = if (isSelected) Color.White else Color(0xFFE2E8F0),
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = label,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                                    color = if (isSelected) Color.White else Color(0xFFF8FAFC)
                                )
                            }
                        }
                    }

                    // Stroke Intensity / Thickness Presets (Visible when Pen or Highlighter is active)
                    if (currentTool == CanvasTool.PEN || currentTool == CanvasTool.HIGHLIGHT) {
                        Spacer(modifier = Modifier.width(3.dp))
                        Box(modifier = Modifier.width(1.dp).height(20.dp).background(Color(0xFF475569)))
                        Spacer(modifier = Modifier.width(3.dp))

                        listOf(
                            1.5f to "Fine",
                            3.5f to "Med",
                            6.0f to "Bold",
                            12.0f to "Thick"
                        ).forEach { (size, label) ->
                            val isSizeSelected = kotlin.math.abs(currentWidth - size) < 0.6f
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSizeSelected) Color(0xFF4F46E5) else Color(0xFF1E293B))
                                    .border(
                                        1.dp,
                                        if (isSizeSelected) Color(0xFF818CF8) else Color(0xFF475569),
                                        RoundedCornerShape(8.dp)
                                    )
                                    .clickable {
                                        currentWidth = size
                                        inkCanvasView?.strokeWidth = size
                                    }
                                    .padding(horizontal = 8.dp, vertical = 5.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = label,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSizeSelected) FontWeight.Bold else FontWeight.SemiBold,
                                    color = if (isSizeSelected) Color.White else Color(0xFFE2E8F0)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.width(4.dp))
                    Box(modifier = Modifier.width(1.dp).height(24.dp).background(Color(0xFF333A48)))
                    Spacer(modifier = Modifier.width(4.dp))

                    // Palm Rejection Badge (Moto Pad 70 Pro 144Hz Active) - Clickable Toggle
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isPalmFilterActive) Color(0xFF064E3B) else Color(0xFF334155))
                            .border(1.dp, if (isPalmFilterActive) Color(0xFF059669) else Color(0xFF64748B), RoundedCornerShape(8.dp))
                            .clickable {
                                isPalmFilterActive = !isPalmFilterActive
                                inkCanvasView?.isPalmFilterActive = isPalmFilterActive
                            }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isPalmFilterActive) Icons.Default.Security else Icons.Default.Edit,
                                contentDescription = null,
                                tint = if (isPalmFilterActive) Color(0xFF34D399) else Color(0xFFE2E8F0),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (isPalmFilterActive) "Palm Filter ON" else "Draw with Finger",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isPalmFilterActive) Color(0xFF34D399) else Color(0xFFE2E8F0)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(4.dp))
                    Box(modifier = Modifier.width(1.dp).height(24.dp).background(Color(0xFF333A48)))
                    Spacer(modifier = Modifier.width(4.dp))

                    // Colors Palette & Spectrum Color Studio
                    colors.forEach { (hex, _) ->
                        val parsedColor = AndroidColor.parseColor(hex)
                        val isColorSelected = currentColor == parsedColor
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(Color(parsedColor))
                                .border(
                                    width = if (isColorSelected) 2.5.dp else 0.dp,
                                    color = if (isColorSelected) Color.White else Color.Transparent,
                                    shape = CircleShape
                                )
                                .clickable {
                                    currentColor = parsedColor
                                    inkCanvasView?.strokeColor = parsedColor
                                }
                        )
                    }

                    // If custom color is picked, display it here
                    val isCustomColor = colors.none { AndroidColor.parseColor(it.first) == currentColor }
                    if (isCustomColor) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(Color(currentColor))
                                .border(
                                    width = 2.5.dp,
                                    color = Color.White,
                                    shape = CircleShape
                                )
                        )
                    }

                    // Spectrum & Extended Palette Button
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.sweepGradient(
                                    listOf(
                                        Color(0xFFEF4444),
                                        Color(0xFFF59E0B),
                                        Color(0xFF10B981),
                                        Color(0xFF06B6D4),
                                        Color(0xFF3B82F6),
                                        Color(0xFF8B5CF6),
                                        Color(0xFFEC4899),
                                        Color(0xFFEF4444)
                                    )
                                )
                            )
                            .border(1.5.dp, Color.White, CircleShape)
                            .clickable { showColorStudio = true },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Palette,
                            contentDescription = "Color Studio",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(4.dp))
                    Box(modifier = Modifier.width(1.dp).height(24.dp).background(Color(0xFF333A48)))
                    Spacer(modifier = Modifier.width(4.dp))

                    // Undo & Redo (High-contrast bright white when active)
                    IconButton(
                        onClick = { inkCanvasView?.undo() },
                        enabled = canUndo,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Undo,
                            contentDescription = "Undo",
                            tint = if (canUndo) Color.White else Color(0xFF52525B),
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    IconButton(
                        onClick = { inkCanvasView?.redo() },
                        enabled = canRedo,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Redo,
                            contentDescription = "Redo",
                            tint = if (canRedo) Color.White else Color(0xFF52525B),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }

    // Color Studio Dialog (Extended Palette & RGB Spectrum)
    if (showColorStudio) {
        ColorPickerDialog(
            initialColor = currentColor,
            onColorSelected = { pickedColor ->
                currentColor = pickedColor
                inkCanvasView?.strokeColor = pickedColor
            },
            onDismiss = { showColorStudio = false }
        )
    }

    // Word Lookup Translation Dialog
    lookupEntry?.let { entry ->
        WordLookupDialog(
            vocabEntry = entry,
            onSpeak = { text -> ttsManager.speak(text) },
            onSaveWord = { vEntry ->
                val entity = VocabularyEntity(
                    word = vEntry.word,
                    phonetic = vEntry.phonetic,
                    devanagariPhonetic = vEntry.devanagariPhonetic,
                    hindiMeaning = vEntry.senses.firstOrNull()?.hindi?.joinToString(", ") ?: "",
                    nepaliMeaning = vEntry.senses.firstOrNull()?.nepali?.joinToString(", ") ?: "",
                    englishDefinition = vEntry.senses.firstOrNull()?.englishDefinition ?: "",
                    exampleSentence = vEntry.senses.firstOrNull()?.exampleSentence ?: "",
                    documentTitle = document.title,
                    pageNumber = currentPage + 1
                )
                onSaveVocab(entity)
            },
            onDismiss = {
                lookupEntry = null
                inkCanvasView?.dryInkView?.selectedWordRect = null
            }
        )
    }

    // Manual Word Lookup Dialog (High-Contrast Theme)
    if (showManualLookupDialog) {
        Dialog(onDismissRequest = { showManualLookupDialog = false }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFF1E222B),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF333A48)),
                modifier = Modifier.fillMaxWidth().padding(16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Quick Word Lookup",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = manualWordInput,
                        onValueChange = { manualWordInput = it },
                        label = { Text("Enter English word", color = Color(0xFF94A3B8)) },
                        placeholder = { Text("e.g. habit, atomic, reward, system", color = Color(0xFF64748B)) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF6366F1),
                            unfocusedBorderColor = Color(0xFF475569)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { showManualLookupDialog = false }) {
                            Text("Cancel", color = Color(0xFF94A3B8))
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        FilledTonalButton(
                            onClick = {
                                if (manualWordInput.isNotBlank()) {
                                    val entry = BilingualDictionary.lookup(manualWordInput)
                                    lookupEntry = entry
                                    showManualLookupDialog = false
                                    manualWordInput = ""
                                }
                            }
                        ) {
                            Text("Look Up")
                        }
                    }
                }
            }
        }
    }

    // Jump to Page Dialog (High-Contrast Theme)
    if (showJumpPageDialog) {
        var pageInput by remember { mutableStateOf((currentPage + 1).toString()) }
        Dialog(onDismissRequest = { showJumpPageDialog = false }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFF1E222B),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF333A48)),
                modifier = Modifier.fillMaxWidth().padding(16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Jump to Page (1 - $totalPages)",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = pageInput,
                        onValueChange = { pageInput = it.filter { ch -> ch.isDigit() } },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF6366F1),
                            unfocusedBorderColor = Color(0xFF475569)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { showJumpPageDialog = false }) {
                            Text("Cancel", color = Color(0xFF94A3B8))
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        FilledTonalButton(
                            onClick = {
                                val target = (pageInput.toIntOrNull() ?: 1) - 1
                                if (target in 0 until totalPages) {
                                    currentPage = target
                                    inkCanvasView?.setPdfPage(target)
                                    onUpdateDocProgress(target)
                                    showJumpPageDialog = false
                                }
                            }
                        ) {
                            Text("Go")
                        }
                    }
                }
            }
        }
    }
}
