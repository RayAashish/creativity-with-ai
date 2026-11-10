package com.readmaster.app.ui.library

import android.content.Context
import android.content.Intent
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.provider.OpenableColumns
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.CreateNewFolder
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DriveFileMove
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FirstPage
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material.icons.filled.Style
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.readmaster.app.data.db.DocumentDao
import com.readmaster.app.data.db.FolderDao
import com.readmaster.app.data.db.VocabularyDao
import com.readmaster.app.data.model.DocumentEntity
import com.readmaster.app.data.model.FolderEntity
import com.readmaster.app.data.model.FolderIconsCatalog
import com.readmaster.app.speech.TtsManager
import com.readmaster.app.ui.dialogs.CreateOrEditFolderDialog
import com.readmaster.app.ui.dialogs.FlashcardReviewDialog
import com.readmaster.app.ui.dialogs.MoveDocumentFolderDialog
import com.readmaster.app.ui.dialogs.VocabNotebookDialog
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibraryScreen(
    documentDao: DocumentDao,
    folderDao: FolderDao,
    vocabularyDao: VocabularyDao,
    ttsManager: TtsManager,
    onOpenDocument: (DocumentEntity) -> Unit
) {
    val context = LocalContext.current
    val configuration = LocalConfiguration.current
    val screenWidthDp = configuration.screenWidthDp
    val isCompact = screenWidthDp < 600
    val isMedium = screenWidthDp in 600..839
    val isExpanded = screenWidthDp >= 840
    val scope = rememberCoroutineScope()
    val documents by documentDao.getAllDocuments().collectAsState(initial = emptyList())
    val folders by folderDao.getAllFolders().collectAsState(initial = emptyList())
    val vocabList by vocabularyDao.getAllVocabulary().collectAsState(initial = emptyList())

    val prefs = remember { context.getSharedPreferences("lipi_reading_prefs", Context.MODE_PRIVATE) }
    var isResumeEnabled by remember {
        mutableStateOf(prefs.getBoolean("pref_resume_reading_enabled", true))
    }

    // Hierarchical Folder Navigation Stack (Persisted so reopening app returns directly to last viewed folder)
    val initialFolderStack = remember {
        val raw = prefs.getString("folder_navigation_stack", "") ?: ""
        if (raw.isBlank()) emptyList<String>() else raw.split(",").filter { it.isNotBlank() }
    }
    var folderNavigationStack by remember { mutableStateOf(initialFolderStack) }

    LaunchedEffect(folderNavigationStack) {
        prefs.edit().putString("folder_navigation_stack", folderNavigationStack.joinToString(",")).apply()
    }

    LaunchedEffect(folders) {
        if (folders.isNotEmpty() && folderNavigationStack.isNotEmpty()) {
            val valid = folderNavigationStack.filter { id -> folders.any { it.id == id } }
            if (valid != folderNavigationStack) {
                folderNavigationStack = valid
            }
        }
    }

    val currentFolderId = folderNavigationStack.lastOrNull()
    val currentActiveFolder = remember(folders, currentFolderId) {
        folders.firstOrNull { it.id == currentFolderId }
    }

    // Intercept back button when inside nested folders
    BackHandler(enabled = folderNavigationStack.isNotEmpty()) {
        folderNavigationStack = folderNavigationStack.dropLast(1)
    }

    // Dialog states
    var showNotebookDialog by remember { mutableStateOf(false) }
    var showFlashcardDialog by remember { mutableStateOf(false) }
    var showCreateFolderDialog by remember { mutableStateOf(false) }
    var creatingSubfolderIn by remember { mutableStateOf<FolderEntity?>(null) }
    var editingFolder by remember { mutableStateOf<FolderEntity?>(null) }
    var movingDocument by remember { mutableStateOf<DocumentEntity?>(null) }

    // Seed default root folders & standard subfolders
    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            val existingFolders = folderDao.getAllFolders().first()
            if (existingFolders.isEmpty()) {
                val defaultFolders = listOf(
                    FolderEntity(id = "folder_personal_dev", name = "Personal Development", iconKey = "personal_dev", colorHex = "#10B981"),
                    FolderEntity(id = "folder_spring_boot", name = "Spring Boot", iconKey = "spring_boot", colorHex = "#22C55E"),
                    FolderEntity(id = "folder_java", name = "Java", iconKey = "java", colorHex = "#EA580C"),
                    FolderEntity(id = "folder_system_design", name = "System Design", iconKey = "system_design", colorHex = "#6366F1"),
                    FolderEntity(id = "folder_dsa", name = "DSA & Algorithms", iconKey = "dsa", colorHex = "#3B82F6")
                )
                defaultFolders.forEach { folderDao.insert(it) }
            }

            // Seed Java subtopics if Java exists and has no subfolders
            val javaSubfolders = folderDao.getSubfolders("folder_java").first()
            if (javaSubfolders.isEmpty()) {
                val defaultJavaSubfolders = listOf(
                    FolderEntity(id = "folder_java_jdbc", name = "JDBC", iconKey = "jdbc", colorHex = "#EA580C", parentFolderId = "folder_java"),
                    FolderEntity(id = "folder_java_threads", name = "Multithreading", iconKey = "multithreading", colorHex = "#EA580C", parentFolderId = "folder_java"),
                    FolderEntity(id = "folder_java_exceptions", name = "Exception Handling", iconKey = "exception_handling", colorHex = "#EA580C", parentFolderId = "folder_java"),
                    FolderEntity(id = "folder_java_networking", name = "Networking", iconKey = "networking_sockets", colorHex = "#EA580C", parentFolderId = "folder_java")
                )
                defaultJavaSubfolders.forEach { folderDao.insert(it) }
            }

            // Seed Spring Boot subtopics if Spring Boot exists and has no subfolders
            val springSubfolders = folderDao.getSubfolders("folder_spring_boot").first()
            if (springSubfolders.isEmpty()) {
                val defaultSpringSubfolders = listOf(
                    FolderEntity(id = "folder_spring_core", name = "Spring Core", iconKey = "spring_core", colorHex = "#22C55E", parentFolderId = "folder_spring_boot"),
                    FolderEntity(id = "folder_spring_jpa", name = "Data JPA", iconKey = "spring_jpa", colorHex = "#22C55E", parentFolderId = "folder_spring_boot"),
                    FolderEntity(id = "folder_spring_security", name = "Security", iconKey = "spring_security", colorHex = "#22C55E", parentFolderId = "folder_spring_boot"),
                    FolderEntity(id = "folder_spring_aop", name = "AOP", iconKey = "spring_aop", colorHex = "#22C55E", parentFolderId = "folder_spring_boot")
                )
                defaultSpringSubfolders.forEach { folderDao.insert(it) }
            }

            // Seed sample document if library is completely empty
            val sampleFile = File(context.filesDir, "sample-paper.pdf")
            if (!sampleFile.exists()) {
                try {
                    context.assets.open("sample-paper.pdf").use { input ->
                        FileOutputStream(sampleFile).use { output ->
                            input.copyTo(output)
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            if (sampleFile.exists()) {
                val existingDocs = documentDao.getAllDocuments().first()
                val existingSample = documentDao.getDocumentById("sample-doc-1")
                if (existingDocs.isEmpty() && existingSample == null) {
                    val pfd = ParcelFileDescriptor.open(sampleFile, ParcelFileDescriptor.MODE_READ_ONLY)
                    val renderer = PdfRenderer(pfd)
                    val pageCount = renderer.pageCount
                    renderer.close()
                    pfd.close()

                    val sampleDoc = DocumentEntity(
                        id = "sample-doc-1",
                        title = "Sample Study Paper",
                        uriString = sampleFile.absolutePath,
                        pageCount = pageCount,
                        lastPage = 0,
                        fileSize = sampleFile.length(),
                        folderId = "folder_system_design"
                    )
                    documentDao.insert(sampleDoc)
                }
            }
        }
    }

    // System File Picker for importing PDFs
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        if (uri != null) {
            val targetFolder = currentFolderId // Placed into currently active folder/subfolder!
            scope.launch(Dispatchers.IO) {
                try {
                    try {
                        context.contentResolver.takePersistableUriPermission(
                            uri,
                            Intent.FLAG_GRANT_READ_URI_PERMISSION
                        )
                    } catch (_: Exception) {}

                    var displayName = "Document.pdf"
                    var fileSize = 0L

                    context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                        val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                        val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                        if (cursor.moveToFirst()) {
                            if (nameIndex != -1) displayName = cursor.getString(nameIndex)
                            if (sizeIndex != -1) fileSize = cursor.getLong(sizeIndex)
                        }
                    }

                    var pageCount = 1
                    context.contentResolver.openFileDescriptor(uri, "r")?.use { pfd ->
                        val renderer = PdfRenderer(pfd)
                        pageCount = renderer.pageCount
                        renderer.close()
                    }

                    val newDoc = DocumentEntity(
                        id = UUID.randomUUID().toString(),
                        title = displayName,
                        uriString = uri.toString(),
                        pageCount = pageCount,
                        lastPage = 0,
                        fileSize = fileSize,
                        folderId = targetFolder // Correctly assigned to active folder!
                    )
                    documentDao.insert(newDoc)

                    withContext(Dispatchers.Main) {
                        onOpenDocument(newDoc)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    // Helper to calculate total books including all descendants
    fun getTotalBooksInFolder(folderId: String): Int {
        val allIds = getDescendantFolderIds(folderId, folders) + folderId
        return documents.count { it.folderId in allIds }
    }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding(),
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                TopAppBar(
                    title = {
                        if (currentActiveFolder != null) {
                            // Inside Folder Header
                            val icon = FolderIconsCatalog.findIcon(currentActiveFolder.iconKey)
                            val folderColor = try {
                                Color(android.graphics.Color.parseColor(currentActiveFolder.colorHex))
                            } catch (_: Exception) {
                                Color(0xFF4F46E5)
                            }
                            val folderDocCount = documents.count { it.folderId == currentActiveFolder.id }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(if (isCompact) 32.dp else 36.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(folderColor.copy(alpha = 0.15f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(icon.symbol, fontSize = if (isCompact) 18.sp else 20.sp)
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = currentActiveFolder.name,
                                        fontSize = if (isCompact) 16.5.sp else 19.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "$folderDocCount direct books • Lipi Study Folder",
                                        fontSize = if (isCompact) 10.5.sp else 11.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        } else {
                            // Main Library Header
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(if (isCompact) 32.dp else 36.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFF4F46E5)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "लि",
                                        color = Color.White,
                                        fontSize = if (isCompact) 18.sp else 20.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = "Lipi",
                                            fontSize = if (isCompact) 18.sp else 20.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                        Spacer(modifier = Modifier.width(5.dp))
                                        Text(
                                            text = "लिपि",
                                            fontSize = if (isCompact) 13.5.sp else 15.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = Color(0xFF4F46E5)
                                        )
                                    }
                                    Text(
                                        text = "Bilingual Study & Pen Annotation",
                                        fontSize = if (isCompact) 10.sp else 11.sp,
                                        color = Color.Gray,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                    },
                    navigationIcon = {
                        if (folderNavigationStack.isNotEmpty()) {
                            IconButton(onClick = { folderNavigationStack = folderNavigationStack.dropLast(1) }) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                    contentDescription = "Back",
                                    tint = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    },
                    actions = {
                        if (!isCompact) {
                            LibraryActionButtonsRow(
                                vocabCount = vocabList.size,
                                isResumeEnabled = isResumeEnabled,
                                isInsideFolder = currentActiveFolder != null,
                                compact = false,
                                onNotebookClick = { showNotebookDialog = true },
                                onCardsClick = { showFlashcardDialog = true },
                                onToggleResume = {
                                    val newSetting = !isResumeEnabled
                                    isResumeEnabled = newSetting
                                    prefs.edit().putBoolean("pref_resume_reading_enabled", newSetting).apply()
                                    android.widget.Toast.makeText(
                                        context,
                                        if (newSetting) "Resume mode ON: PDFs will open from your last read page"
                                        else "Start Over mode: PDFs will start from Page 1",
                                        android.widget.Toast.LENGTH_SHORT
                                    ).show()
                                },
                                onImportClick = { filePickerLauncher.launch(arrayOf("application/pdf")) }
                            )
                        } else {
                            // Quick import button directly in TopAppBar for Phones
                            Button(
                                onClick = { filePickerLauncher.launch(arrayOf("application/pdf")) },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                modifier = Modifier.height(32.dp),
                                contentPadding = PaddingValues(horizontal = 9.dp, vertical = 2.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = "Import PDF",
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(3.dp))
                                Text(
                                    text = if (currentActiveFolder != null) "Import" else "PDF",
                                    fontSize = 11.5.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )

                if (isCompact) {
                    // Responsive Action Pill Strip for Phones (Xiaomi 14, Pixel, Galaxy)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        LibraryActionButtonsRow(
                            vocabCount = vocabList.size,
                            isResumeEnabled = isResumeEnabled,
                            isInsideFolder = currentActiveFolder != null,
                            compact = true,
                            onNotebookClick = { showNotebookDialog = true },
                            onCardsClick = { showFlashcardDialog = true },
                            onToggleResume = {
                                val newSetting = !isResumeEnabled
                                isResumeEnabled = newSetting
                                prefs.edit().putBoolean("pref_resume_reading_enabled", newSetting).apply()
                                android.widget.Toast.makeText(
                                    context,
                                    if (newSetting) "Resume mode ON: PDFs will open from your last read page"
                                    else "Start Over mode: PDFs will start from Page 1",
                                    android.widget.Toast.LENGTH_SHORT
                                ).show()
                            },
                            onImportClick = { filePickerLauncher.launch(arrayOf("application/pdf")) }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFF8FAFC))
        ) {
            if (currentActiveFolder != null) {
                // ==========================================
                // 📂 VIEW 1: INSIDE FOLDER (Hierarchical Drill-Down)
                // ==========================================
                val directFolderDocs = documents.filter { it.folderId == currentActiveFolder.id }
                val descendantIds = remember(folders, currentActiveFolder.id) {
                    getDescendantFolderIds(currentActiveFolder.id, folders)
                }
                val allNestedDocs = remember(documents, descendantIds, currentActiveFolder.id) {
                    documents.filter { it.folderId == currentActiveFolder.id || it.folderId in descendantIds }
                }

                // Subfolders inside this active folder
                val directSubfolders = folders.filter { it.parentFolderId == currentActiveFolder.id }

                val icon = FolderIconsCatalog.findIcon(currentActiveFolder.iconKey)
                val folderColor = try {
                    Color(android.graphics.Color.parseColor(currentActiveFolder.colorHex))
                } catch (_: Exception) {
                    Color(0xFF4F46E5)
                }

                LazyVerticalGrid(
                    columns = if (isCompact) GridCells.Fixed(2) else GridCells.Adaptive(minSize = if (isExpanded) 180.dp else 150.dp),
                    contentPadding = if (isCompact) PaddingValues(horizontal = 14.dp, vertical = 12.dp) else PaddingValues(20.dp),
                    horizontalArrangement = Arrangement.spacedBy(if (isCompact) 10.dp else 16.dp),
                    verticalArrangement = Arrangement.spacedBy(if (isCompact) 10.dp else 16.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    // 1. Breadcrumb Bar
                    item(span = { GridItemSpan(maxLineSpan) }) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Home pill
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { folderNavigationStack = emptyList() }
                                    .background(Color.White)
                                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Home,
                                    contentDescription = "Home",
                                    tint = Color(0xFF64748B),
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Library", fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Color(0xFF475569))
                            }

                            // Trailing crumbs
                            folderNavigationStack.forEachIndexed { index, id ->
                                val crumbFolder = folders.firstOrNull { it.id == id }
                                if (crumbFolder != null) {
                                    Icon(
                                        imageVector = Icons.Default.ChevronRight,
                                        contentDescription = null,
                                        tint = Color(0xFF94A3B8),
                                        modifier = Modifier.size(16.dp).padding(horizontal = 2.dp)
                                    )
                                    val isLast = index == folderNavigationStack.lastIndex
                                    val crumbIcon = FolderIconsCatalog.findIcon(crumbFolder.iconKey)
                                    Row(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .clickable { folderNavigationStack = folderNavigationStack.take(index + 1) }
                                            .background(if (isLast) folderColor.copy(alpha = 0.12f) else Color.White)
                                            .border(
                                                1.dp,
                                                if (isLast) folderColor.copy(alpha = 0.4f) else Color(0xFFE2E8F0),
                                                RoundedCornerShape(8.dp)
                                            )
                                            .padding(horizontal = 8.dp, vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(crumbIcon.symbol, fontSize = 12.sp)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = crumbFolder.name,
                                            fontSize = 12.sp,
                                            fontWeight = if (isLast) FontWeight.Bold else FontWeight.Medium,
                                            color = if (isLast) folderColor else Color(0xFF475569)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // 2. Folder Banner Card
                    item(span = { GridItemSpan(maxLineSpan) }) {
                        Card(
                            shape = RoundedCornerShape(if (isCompact) 16.dp else 20.dp),
                            colors = CardDefaults.cardColors(containerColor = folderColor.copy(alpha = 0.08f)),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, folderColor.copy(alpha = 0.3f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            if (isCompact) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier
                                                .size(46.dp)
                                                .clip(RoundedCornerShape(12.dp))
                                                .background(folderColor.copy(alpha = 0.2f)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(icon.symbol, fontSize = 24.sp)
                                        }
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = currentActiveFolder.name,
                                                fontSize = 18.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF1E293B),
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Text(
                                                text = "${directFolderDocs.size} books • ${directSubfolders.size} topics",
                                                fontSize = 11.5.sp,
                                                color = Color(0xFF64748B),
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        OutlinedButton(
                                            onClick = { editingFolder = currentActiveFolder },
                                            shape = RoundedCornerShape(10.dp),
                                            modifier = Modifier.weight(1f).height(34.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Edit,
                                                contentDescription = "Edit",
                                                modifier = Modifier.size(14.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Edit Folder", fontSize = 11.5.sp)
                                        }
                                        Button(
                                            onClick = { filePickerLauncher.launch(arrayOf("application/pdf")) },
                                            colors = ButtonDefaults.buttonColors(containerColor = folderColor),
                                            shape = RoundedCornerShape(10.dp),
                                            modifier = Modifier.weight(1.3f).height(34.dp),
                                            contentPadding = PaddingValues(horizontal = 8.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.UploadFile,
                                                contentDescription = "Import PDF",
                                                modifier = Modifier.size(14.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Import PDF", fontSize = 11.5.sp)
                                        }
                                    }
                                }
                            } else {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(20.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(56.dp)
                                                .clip(RoundedCornerShape(14.dp))
                                                .background(folderColor.copy(alpha = 0.2f)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(icon.symbol, fontSize = 28.sp)
                                        }
                                        Spacer(modifier = Modifier.width(16.dp))
                                        Column {
                                            Text(
                                                text = currentActiveFolder.name,
                                                fontSize = 20.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF1E293B)
                                            )
                                            Text(
                                                text = "${directFolderDocs.size} direct books • ${directSubfolders.size} subtopics • ${allNestedDocs.size} total in topic tree",
                                                fontSize = 13.sp,
                                                color = Color(0xFF64748B)
                                            )
                                        }
                                    }

                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        OutlinedButton(
                                            onClick = { editingFolder = currentActiveFolder },
                                            shape = RoundedCornerShape(10.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Edit,
                                                contentDescription = "Edit",
                                                modifier = Modifier.size(16.dp)
                                            )
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Edit Folder")
                                        }
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Button(
                                            onClick = { filePickerLauncher.launch(arrayOf("application/pdf")) },
                                            colors = ButtonDefaults.buttonColors(containerColor = folderColor),
                                            shape = RoundedCornerShape(10.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.UploadFile,
                                                contentDescription = "Import PDF",
                                                modifier = Modifier.size(16.dp)
                                            )
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Import PDF Here")
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // 3. Subfolders Section Header
                    item(span = { GridItemSpan(maxLineSpan) }) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                Text(
                                    text = "Subtopics & Subfolders (${directSubfolders.size})",
                                    fontSize = if (isCompact) 16.sp else 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )
                                Text(
                                    text = "Organize chapters, frameworks, and specific modules",
                                    fontSize = if (isCompact) 11.sp else 12.sp,
                                    color = Color(0xFF64748B),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }

                            Button(
                                onClick = {
                                    creatingSubfolderIn = currentActiveFolder
                                    showCreateFolderDialog = true
                                },
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = folderColor),
                                modifier = Modifier.height(34.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CreateNewFolder,
                                    contentDescription = "New Subfolder",
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("New Subfolder", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    // 4. "+ Add Subfolder" square card
                    item {
                        Card(
                            shape = RoundedCornerShape(if (isCompact) 16.dp else 20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
                            border = androidx.compose.foundation.BorderStroke(if (isCompact) 1.5.dp else 2.dp, Color(0xFFCBD5E1)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(if (isCompact) 1.18f else 1f)
                                .clickable {
                                    creatingSubfolderIn = currentActiveFolder
                                    showCreateFolderDialog = true
                                }
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(if (isCompact) 10.dp else 14.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Box(
                                        modifier = Modifier
                                            .size(if (isCompact) 42.dp else 50.dp)
                                            .clip(CircleShape)
                                            .background(folderColor),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Add,
                                            contentDescription = "New Subfolder",
                                            tint = Color.White,
                                            modifier = Modifier.size(if (isCompact) 22.dp else 26.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(if (isCompact) 8.dp else 10.dp))
                                    Text(
                                        text = "+ Subfolder",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = if (isCompact) 12.5.sp else 13.sp,
                                        color = folderColor,
                                        textAlign = TextAlign.Center
                                    )
                                    Text(
                                        text = "Custom Logos",
                                        fontSize = if (isCompact) 9.5.sp else 10.sp,
                                        color = Color(0xFF64748B),
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                    }

                    // 5. Direct Subfolders Cards
                    items(directSubfolders, key = { it.id }) { subfolder ->
                        val subIcon = FolderIconsCatalog.findIcon(subfolder.iconKey)
                        val subColor = try {
                            Color(android.graphics.Color.parseColor(subfolder.colorHex))
                        } catch (_: Exception) {
                            Color(0xFF4F46E5)
                        }
                        val subTotalBooks = getTotalBooksInFolder(subfolder.id)

                        Card(
                            shape = RoundedCornerShape(if (isCompact) 16.dp else 20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, subColor.copy(alpha = 0.35f)),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(if (isCompact) 1.18f else 1f)
                                .clickable {
                                    folderNavigationStack = folderNavigationStack + subfolder.id
                                }
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(if (isCompact) 10.dp else 12.dp)
                            ) {
                                // Top right: Edit folder button
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .size(if (isCompact) 24.dp else 26.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFFF1F5F9))
                                        .clickable { editingFolder = subfolder },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Edit,
                                        contentDescription = "Edit",
                                        tint = Color(0xFF64748B),
                                        modifier = Modifier.size(if (isCompact) 12.dp else 13.dp)
                                    )
                                }

                                // Center Content: Logo, Name, Document Count
                                Column(
                                    modifier = Modifier.align(Alignment.Center),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(if (isCompact) 42.dp else 50.dp)
                                            .clip(RoundedCornerShape(if (isCompact) 12.dp else 14.dp))
                                            .background(subColor.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(subIcon.symbol, fontSize = if (isCompact) 22.sp else 26.sp)
                                    }
                                    Spacer(modifier = Modifier.height(if (isCompact) 6.dp else 8.dp))
                                    Text(
                                        text = subfolder.name,
                                        fontSize = if (isCompact) 12.5.sp else 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF1E293B),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis,
                                        textAlign = TextAlign.Center
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(subColor.copy(alpha = 0.1f))
                                            .padding(horizontal = 5.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = "$subTotalBooks Books",
                                            fontSize = if (isCompact) 9.5.sp else 10.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = subColor
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // 6. Section Header: Books in this folder
                    item(span = { GridItemSpan(maxLineSpan) }) {
                        Spacer(modifier = Modifier.height(if (isCompact) 6.dp else 10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                Text(
                                    text = "Books in ${currentActiveFolder.name} (${directFolderDocs.size})",
                                    fontSize = if (isCompact) 16.sp else 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )
                                Text(
                                    text = "Documents assigned directly to this folder",
                                    fontSize = if (isCompact) 11.sp else 12.sp,
                                    color = Color(0xFF64748B),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }

                    // 7. "+ Import PDF" card in grid
                    item(span = { GridItemSpan(if (isCompact || maxLineSpan <= 2) maxLineSpan else (maxLineSpan / 2).coerceAtLeast(2)) }) {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(2.dp, folderColor.copy(alpha = 0.35f)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(if (isCompact) 130.dp else 160.dp)
                                .clickable { filePickerLauncher.launch(arrayOf("application/pdf")) }
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(if (isCompact) 12.dp else 16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Box(
                                        modifier = Modifier
                                            .size(if (isCompact) 38.dp else 46.dp)
                                            .clip(CircleShape)
                                            .background(folderColor.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Add,
                                            contentDescription = "Add PDF",
                                            tint = folderColor,
                                            modifier = Modifier.size(if (isCompact) 20.dp else 24.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(if (isCompact) 6.dp else 10.dp))
                                    Text(
                                        text = "+ Import PDF File",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = if (isCompact) 13.sp else 14.sp,
                                        color = folderColor
                                    )
                                    Text(
                                        text = "Add directly into ${currentActiveFolder.name}",
                                        fontSize = if (isCompact) 10.sp else 11.sp,
                                        color = Color.Gray
                                    )
                                }
                            }
                        }
                    }

                    // 8. Documents inside this folder
                    items(directFolderDocs, key = { it.id }, span = { GridItemSpan(if (isCompact || maxLineSpan <= 2) maxLineSpan else (maxLineSpan / 2).coerceAtLeast(2)) }) { doc ->
                        DocumentCard(
                            doc = doc,
                            folder = currentActiveFolder,
                            parentFolder = folders.firstOrNull { it.id == currentActiveFolder.parentFolderId },
                            isResumeEnabled = isResumeEnabled,
                            isCompact = isCompact,
                            onOpen = { onOpenDocument(doc) },
                            onRestart = {
                                prefs.edit().putInt("last_page_${doc.id}", 0).apply()
                                scope.launch(Dispatchers.IO) {
                                    documentDao.updatePageProgress(doc.id, 0, System.currentTimeMillis())
                                }
                                onOpenDocument(doc.copy(lastPage = 0))
                            },
                            onMove = { movingDocument = doc },
                            onDelete = {
                                scope.launch(Dispatchers.IO) {
                                    documentDao.delete(doc)
                                }
                            }
                        )
                    }
                }
            } else {
                // ==========================================
                // 📚 VIEW 2: MAIN LIBRARY (Root Folders Grid + All Books)
                // ==========================================
                val rootFolders = folders.filter { it.parentFolderId == null }

                LazyVerticalGrid(
                    columns = if (isCompact) GridCells.Fixed(2) else GridCells.Adaptive(minSize = if (isExpanded) 180.dp else 150.dp),
                    contentPadding = if (isCompact) PaddingValues(horizontal = 14.dp, vertical = 12.dp) else PaddingValues(20.dp),
                    horizontalArrangement = Arrangement.spacedBy(if (isCompact) 10.dp else 16.dp),
                    verticalArrangement = Arrangement.spacedBy(if (isCompact) 10.dp else 16.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    // Section Header: FOLDERS
                    item(span = { GridItemSpan(maxLineSpan) }) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                Text(
                                    text = "Study Folders",
                                    fontSize = if (isCompact) 17.sp else 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )
                                Text(
                                    text = "Tap a folder to open topics, subfolders and add files directly",
                                    fontSize = if (isCompact) 11.sp else 12.sp,
                                    color = Color(0xFF64748B),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }

                            // Stylish "+ Add Folder" button
                            Button(
                                onClick = {
                                    creatingSubfolderIn = null
                                    showCreateFolderDialog = true
                                },
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                                modifier = Modifier.height(34.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CreateNewFolder,
                                    contentDescription = "New Folder",
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (isCompact) "New Folder" else "+ New Folder",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // 1. STYLISH "+ NEW FOLDER" SQUARE CARD
                    item {
                        Card(
                            shape = RoundedCornerShape(if (isCompact) 16.dp else 20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
                            border = androidx.compose.foundation.BorderStroke(if (isCompact) 1.5.dp else 2.dp, Color(0xFFCBD5E1)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(if (isCompact) 1.18f else 1f)
                                .clickable {
                                    creatingSubfolderIn = null
                                    showCreateFolderDialog = true
                                }
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(if (isCompact) 10.dp else 14.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Box(
                                        modifier = Modifier
                                            .size(if (isCompact) 42.dp else 54.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF4F46E5)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Add,
                                            contentDescription = "New Folder",
                                            tint = Color.White,
                                            modifier = Modifier.size(if (isCompact) 22.dp else 28.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(if (isCompact) 8.dp else 12.dp))
                                    Text(
                                        text = "+ New Folder",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = if (isCompact) 13.sp else 14.sp,
                                        color = Color(0xFF4338CA),
                                        textAlign = TextAlign.Center
                                    )
                                    Text(
                                        text = "100+ Logos & Colors",
                                        fontSize = if (isCompact) 9.5.sp else 11.sp,
                                        color = Color(0xFF64748B),
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                    }

                    // 2. ROOT FOLDERS SQUARE CARDS IN GRID
                    items(rootFolders, key = { it.id }) { folder ->
                        val icon = FolderIconsCatalog.findIcon(folder.iconKey)
                        val folderColor = try {
                            Color(android.graphics.Color.parseColor(folder.colorHex))
                        } catch (_: Exception) {
                            Color(0xFF4F46E5)
                        }
                        val totalDocCount = getTotalBooksInFolder(folder.id)
                        val subfolderCount = folders.count { it.parentFolderId == folder.id }

                        Card(
                            shape = RoundedCornerShape(if (isCompact) 16.dp else 20.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, folderColor.copy(alpha = 0.35f)),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(if (isCompact) 1.18f else 1f)
                                .clickable {
                                    folderNavigationStack = listOf(folder.id)
                                }
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(if (isCompact) 10.dp else 12.dp)
                            ) {
                                // Top right: Edit folder button
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .size(if (isCompact) 24.dp else 26.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFFF1F5F9))
                                        .clickable { editingFolder = folder },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Edit,
                                        contentDescription = "Edit",
                                        tint = Color(0xFF64748B),
                                        modifier = Modifier.size(if (isCompact) 12.dp else 13.dp)
                                    )
                                }

                                // Center Content: Logo, Name, Document & Subfolder Count
                                Column(
                                    modifier = Modifier.align(Alignment.Center),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(if (isCompact) 42.dp else 54.dp)
                                            .clip(RoundedCornerShape(if (isCompact) 12.dp else 14.dp))
                                            .background(folderColor.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(icon.symbol, fontSize = if (isCompact) 22.sp else 28.sp)
                                    }
                                    Spacer(modifier = Modifier.height(if (isCompact) 6.dp else 10.dp))
                                    Text(
                                        text = folder.name,
                                        fontSize = if (isCompact) 12.5.sp else 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF1E293B),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis,
                                        textAlign = TextAlign.Center
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(folderColor.copy(alpha = 0.1f))
                                                .padding(horizontal = 5.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = "$totalDocCount Books",
                                                fontSize = if (isCompact) 9.5.sp else 10.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = folderColor
                                            )
                                        }

                                        if (subfolderCount > 0) {
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(Color(0xFFF1F5F9))
                                                    .padding(horizontal = 4.dp, vertical = 2.dp)
                                            ) {
                                                Text(
                                                    text = "$subfolderCount topics",
                                                    fontSize = if (isCompact) 8.5.sp else 9.sp,
                                                    fontWeight = FontWeight.Medium,
                                                    color = Color(0xFF64748B)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Section Header: ALL BOOKS & PAPERS
                    item(span = { GridItemSpan(maxLineSpan) }) {
                        Spacer(modifier = Modifier.height(if (isCompact) 8.dp else 14.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                Text(
                                    text = "All Reading Materials (${documents.size})",
                                    fontSize = if (isCompact) 17.sp else 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )
                                Text(
                                    text = "Annotate, review, and organize into your subjects",
                                    fontSize = if (isCompact) 11.sp else 12.sp,
                                    color = Color(0xFF64748B),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }

                    // Document Cards
                    if (documents.isEmpty()) {
                        item(span = { GridItemSpan(maxLineSpan) }) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = if (isCompact) 24.dp else 40.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(
                                        imageVector = Icons.Default.PictureAsPdf,
                                        contentDescription = null,
                                        tint = Color(0xFF94A3B8),
                                        modifier = Modifier.size(if (isCompact) 44.dp else 56.dp)
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Your Reading Library is Empty",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = if (isCompact) 15.sp else 16.sp,
                                        color = Color(0xFF334155)
                                    )
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Button(
                                        onClick = { filePickerLauncher.launch(arrayOf("application/pdf")) },
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Text("Import PDF into Library", fontSize = if (isCompact) 12.sp else 14.sp)
                                    }
                                }
                            }
                        }
                    } else {
                        items(documents, key = { it.id }, span = { GridItemSpan(if (isCompact || maxLineSpan <= 2) maxLineSpan else (maxLineSpan / 2).coerceAtLeast(2)) }) { doc ->
                            val assignedFolder = folders.firstOrNull { it.id == doc.folderId }
                            val parentOfAssigned = assignedFolder?.parentFolderId?.let { pId ->
                                folders.firstOrNull { it.id == pId }
                            }

                            DocumentCard(
                                doc = doc,
                                folder = assignedFolder,
                                parentFolder = parentOfAssigned,
                                isResumeEnabled = isResumeEnabled,
                                isCompact = isCompact,
                                onOpen = { onOpenDocument(doc) },
                                onRestart = {
                                    prefs.edit().putInt("last_page_${doc.id}", 0).apply()
                                    scope.launch(Dispatchers.IO) {
                                        documentDao.updatePageProgress(doc.id, 0, System.currentTimeMillis())
                                    }
                                    onOpenDocument(doc.copy(lastPage = 0))
                                },
                                onMove = { movingDocument = doc },
                                onDelete = {
                                    scope.launch(Dispatchers.IO) {
                                        documentDao.delete(doc)
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    // Create New Folder / Subfolder Dialog
    if (showCreateFolderDialog) {
        CreateOrEditFolderDialog(
            initialFolder = null,
            parentFolder = creatingSubfolderIn,
            onSaveFolder = { newFolder ->
                scope.launch(Dispatchers.IO) {
                    folderDao.insert(newFolder)
                    withContext(Dispatchers.Main) {
                        // Enter newly created folder/subfolder!
                        folderNavigationStack = if (newFolder.parentFolderId != null) {
                            folderNavigationStack + newFolder.id
                        } else {
                            listOf(newFolder.id)
                        }
                    }
                }
            },
            onDismiss = {
                showCreateFolderDialog = false
                creatingSubfolderIn = null
            }
        )
    }

    // Edit Folder Dialog (Includes Delete Folder Option!)
    editingFolder?.let { folderToEdit ->
        CreateOrEditFolderDialog(
            initialFolder = folderToEdit,
            parentFolder = folders.firstOrNull { it.id == folderToEdit.parentFolderId },
            onSaveFolder = { updatedFolder ->
                scope.launch(Dispatchers.IO) {
                    folderDao.update(updatedFolder)
                }
            },
            onDeleteFolder = { deletedFolder ->
                scope.launch(Dispatchers.IO) {
                    // Cleanly reassign documents and subfolders to parent
                    folderDao.reassignDocuments(deletedFolder.id, deletedFolder.parentFolderId)
                    folderDao.reassignSubfolders(deletedFolder.id, deletedFolder.parentFolderId)
                    folderDao.delete(deletedFolder)
                    withContext(Dispatchers.Main) {
                        if (folderNavigationStack.contains(deletedFolder.id)) {
                            val idx = folderNavigationStack.indexOf(deletedFolder.id)
                            folderNavigationStack = folderNavigationStack.take(idx)
                        }
                    }
                }
            },
            onDismiss = { editingFolder = null }
        )
    }

    // Move Document to Folder Dialog
    movingDocument?.let { docToMove ->
        MoveDocumentFolderDialog(
            document = docToMove,
            folders = folders,
            documents = documents,
            onSelectFolder = { targetFolderId ->
                scope.launch(Dispatchers.IO) {
                    documentDao.setDocumentFolder(docToMove.id, targetFolderId)
                }
            },
            onDismiss = { movingDocument = null }
        )
    }

    // Vocabulary Notebook Dialog
    if (showNotebookDialog) {
        VocabNotebookDialog(
            vocabList = vocabList,
            onSpeak = { text -> ttsManager.speak(text) },
            onDeleteWord = { word ->
                scope.launch(Dispatchers.IO) {
                    vocabularyDao.delete(word)
                }
            },
            onDismiss = { showNotebookDialog = false }
        )
    }

    // Flashcard Review Dialog
    if (showFlashcardDialog) {
        FlashcardReviewDialog(
            cards = vocabList,
            onSpeak = { text -> ttsManager.speak(text) },
            onGradeCard = { card, grade ->
                scope.launch(Dispatchers.IO) {
                    val multiplier = when (grade) {
                        1 -> 1
                        2 -> (card.interval * 1.2).toInt().coerceAtLeast(1)
                        3 -> (card.interval * 2.5).toInt().coerceAtLeast(2)
                        else -> (card.interval * 3.5).toInt().coerceAtLeast(4)
                    }
                    val updated = card.copy(
                        interval = multiplier,
                        repetition = card.repetition + 1,
                        nextReviewDate = System.currentTimeMillis() + multiplier * 24L * 3600L * 1000L
                    )
                    vocabularyDao.update(updated)
                }
            },
            onDismiss = { showFlashcardDialog = false }
        )
    }
}

// Helper to gather all descendant folder IDs
private fun getDescendantFolderIds(folderId: String, allFolders: List<FolderEntity>): Set<String> {
    val descendants = mutableSetOf<String>()
    fun dfs(currentId: String) {
        allFolders.filter { it.parentFolderId == currentId }.forEach { child ->
            descendants.add(child.id)
            dfs(child.id)
        }
    }
    dfs(folderId)
    return descendants
}

@Composable
fun DocumentCard(
    doc: DocumentEntity,
    folder: FolderEntity?,
    parentFolder: FolderEntity? = null,
    isResumeEnabled: Boolean = true,
    isCompact: Boolean = false,
    onOpen: () -> Unit,
    onRestart: (() -> Unit)? = null,
    onMove: () -> Unit,
    onDelete: () -> Unit
) {
    val folderIcon = folder?.let { FolderIconsCatalog.findIcon(it.iconKey) }
    val folderColor = folder?.let {
        try { Color(android.graphics.Color.parseColor(it.colorHex)) } catch (_: Exception) { Color(0xFF4F46E5) }
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onOpen() }
    ) {
        Column(modifier = Modifier.padding(if (isCompact) 12.dp else 16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Box(
                    modifier = Modifier
                        .size(if (isCompact) 36.dp else 42.dp)
                        .clip(RoundedCornerShape(if (isCompact) 8.dp else 10.dp))
                        .background(Color(0xFFFEE2E2)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PictureAsPdf,
                        contentDescription = null,
                        tint = Color(0xFFDC2626),
                        modifier = Modifier.size(if (isCompact) 20.dp else 24.dp)
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Quick Restart from Page 1 (if book has read progress)
                    if (doc.lastPage > 0 && onRestart != null) {
                        IconButton(
                            onClick = onRestart,
                            modifier = Modifier.size(if (isCompact) 28.dp else 32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.RestartAlt,
                                contentDescription = "Restart from Page 1",
                                tint = Color(0xFFF59E0B),
                                modifier = Modifier.size(if (isCompact) 16.dp else 18.dp)
                            )
                        }
                    }

                    // Move Folder Button
                    IconButton(
                        onClick = onMove,
                        modifier = Modifier.size(if (isCompact) 28.dp else 32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DriveFileMove,
                            contentDescription = "Move Folder",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(if (isCompact) 16.dp else 18.dp)
                        )
                    }

                    // Delete Book Button
                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(if (isCompact) 28.dp else 32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = Color.LightGray,
                            modifier = Modifier.size(if (isCompact) 16.dp else 18.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(if (isCompact) 8.dp else 10.dp))

            // Hierarchical Folder Badge (e.g. Java › Multithreading)
            if (folder != null && folderIcon != null && folderColor != null) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(folderColor.copy(alpha = 0.12f))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(folderIcon.symbol, fontSize = if (isCompact) 11.sp else 12.sp)
                        Spacer(modifier = Modifier.width(4.dp))
                        if (parentFolder != null) {
                            Text(
                                text = "${parentFolder.name} › ",
                                fontSize = if (isCompact) 10.5.sp else 11.sp,
                                fontWeight = FontWeight.Normal,
                                color = folderColor.copy(alpha = 0.8f)
                            )
                        }
                        Text(
                            text = folder.name,
                            fontSize = if (isCompact) 10.5.sp else 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = folderColor
                        )
                    }
                }
                Spacer(modifier = Modifier.height(if (isCompact) 4.dp else 6.dp))
            }

            Text(
                text = doc.title,
                fontSize = if (isCompact) 14.sp else 15.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1E293B),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(if (isCompact) 8.dp else 10.dp))

            val progressFraction = if (doc.pageCount > 0) {
                (doc.lastPage + 1).toFloat() / doc.pageCount.toFloat()
            } else 0f

            LinearProgressIndicator(
                progress = { progressFraction.coerceIn(0f, 1f) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(if (isCompact) 5.dp else 6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = folderColor ?: MaterialTheme.colorScheme.primary,
                trackColor = Color(0xFFE2E8F0)
            )

            Spacer(modifier = Modifier.height(if (isCompact) 6.dp else 8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isResumeEnabled && doc.lastPage > 0) "Resume: Page ${doc.lastPage + 1} of ${doc.pageCount}"
                    else if (!isResumeEnabled && doc.lastPage > 0) "Start: Page 1 (Read: ${doc.lastPage + 1})"
                    else "Page 1 of ${doc.pageCount}",
                    fontSize = if (isCompact) 11.sp else 12.sp,
                    color = Color(0xFF64748B)
                )
                Text(
                    text = "${(progressFraction * 100).toInt()}%",
                    fontSize = if (isCompact) 11.sp else 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = folderColor ?: MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
private fun LibraryActionButtonsRow(
    vocabCount: Int,
    isResumeEnabled: Boolean,
    isInsideFolder: Boolean,
    compact: Boolean = false,
    onNotebookClick: () -> Unit,
    onCardsClick: () -> Unit,
    onToggleResume: () -> Unit,
    onImportClick: () -> Unit
) {
    // Vocabulary Notebook Button
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(Color(0xFFFEF3C7))
            .clickable { onNotebookClick() }
            .padding(horizontal = if (compact) 9.dp else 10.dp, vertical = if (compact) 5.dp else 6.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.MenuBook,
                contentDescription = "Notebook",
                tint = Color(0xFFD97706),
                modifier = Modifier.size(if (compact) 15.dp else 16.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "Notebook ($vocabCount)",
                fontSize = if (compact) 11.5.sp else 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFFB45309)
            )
        }
    }

    Spacer(modifier = Modifier.width(if (compact) 6.dp else 8.dp))

    // Flashcard Review Button
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(Color(0xFFEDE9FE))
            .clickable { onCardsClick() }
            .padding(horizontal = if (compact) 9.dp else 10.dp, vertical = if (compact) 5.dp else 6.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Default.Style,
                contentDescription = "Cards",
                tint = Color(0xFF7C3AED),
                modifier = Modifier.size(if (compact) 15.dp else 16.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "Cards",
                fontSize = if (compact) 11.5.sp else 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF6D28D9)
            )
        }
    }

    Spacer(modifier = Modifier.width(if (compact) 6.dp else 8.dp))

    // Resume Reading Mode Toggle Pill
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(10.dp))
            .background(if (isResumeEnabled) Color(0xFFDCFCE7) else Color(0xFFF1F5F9))
            .border(
                1.dp,
                if (isResumeEnabled) Color(0xFF86EFAC) else Color(0xFFCBD5E1),
                RoundedCornerShape(10.dp)
            )
            .clickable { onToggleResume() }
            .padding(horizontal = if (compact) 9.dp else 10.dp, vertical = if (compact) 5.dp else 6.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = if (isResumeEnabled) Icons.Default.AutoStories else Icons.Default.FirstPage,
                contentDescription = "Resume Mode",
                tint = if (isResumeEnabled) Color(0xFF16A34A) else Color(0xFF64748B),
                modifier = Modifier.size(if (compact) 15.dp else 16.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = if (isResumeEnabled) "Resume: Last Page" else "Start: Page 1",
                fontSize = if (compact) 11.5.sp else 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isResumeEnabled) Color(0xFF15803D) else Color(0xFF475569)
            )
        }
    }

    Spacer(modifier = Modifier.width(if (compact) 6.dp else 8.dp))

    // Open / Import PDF Button
    Button(
        onClick = onImportClick,
        shape = RoundedCornerShape(10.dp),
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
        modifier = Modifier.height(if (compact) 32.dp else 36.dp),
        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
    ) {
        Icon(
            imageVector = Icons.Default.Add,
            contentDescription = "Import PDF",
            modifier = Modifier.size(if (compact) 15.dp else 16.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = if (isInsideFolder) "Import Here" else "Open PDF",
            fontSize = if (compact) 11.5.sp else 12.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}
