package com.antigravity.note.ui.library

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Hub
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Spa
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DividerDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.library.db.FolderEntity
import com.antigravity.note.library.db.NotebookEntity
import com.antigravity.note.library.db.PageEntity

data class BrandTag(
    val icon: ImageVector,
    val badgeLabel: String,
    val badgeBg: Color,
    val badgeText: Color,
    val iconTint: Color
)

fun resolveBrandTag(name: String, isFolder: Boolean, isSubject: Boolean): BrandTag {
    val lower = name.lowercase().trim()
    return when {
        lower.contains("spring") -> BrandTag(
            icon = Icons.Default.Spa,
            badgeLabel = "SPRING",
            badgeBg = Color(0xFFE8F5E9),
            badgeText = Color(0xFF2E7D32),
            iconTint = Color(0xFF43A047)
        )
        lower.contains("dsa") || lower.contains("algo") || lower.contains("leetcode") ||
        lower.contains("array") || lower.contains("pointer") || lower.contains("tree") ||
        lower.contains("graph") || lower.contains("dp") || lower.contains("recursion") ||
        lower.contains("sort") || lower.contains("search") || lower.contains("hashing") -> BrandTag(
            icon = Icons.Default.Terminal,
            badgeLabel = "DSA",
            badgeBg = Color(0xFFE1F5FE),
            badgeText = Color(0xFF0277BD),
            iconTint = Color(0xFF0288D1)
        )
        lower.contains("system design") || lower.contains("architect") || lower.contains("distributed") ||
        lower.contains("scal") || lower.contains("load balanc") || lower.contains("cluster") ||
        lower.contains("microservice") || lower.contains("shard") || lower.contains("replica") -> BrandTag(
            icon = Icons.Default.Hub,
            badgeLabel = "SYS DESIGN",
            badgeBg = Color(0xFFEDE7F6),
            badgeText = Color(0xFF512DA8),
            iconTint = Color(0xFF7C4DFF)
        )
        lower.contains("db") || lower.contains("database") || lower.contains("sql") ||
        lower.contains("redis") || lower.contains("cache") || lower.contains("caching") ||
        lower.contains("mongo") || lower.contains("postgres") || lower.contains("storage") -> BrandTag(
            icon = Icons.Default.Storage,
            badgeLabel = "DATABASE",
            badgeBg = Color(0xFFFFF3E0),
            badgeText = Color(0xFFE65100),
            iconTint = Color(0xFFF57C00)
        )
        lower.contains("cn") || lower.contains("network") || lower.contains("tcp") ||
        lower.contains("http") || lower.contains("socket") || lower.contains("ip") ||
        lower.contains("dns") || lower.contains("protocol") -> BrandTag(
            icon = Icons.Default.Public,
            badgeLabel = "NETWORK",
            badgeBg = Color(0xFFE0F2F1),
            badgeText = Color(0xFF00695C),
            iconTint = Color(0xFF00897B)
        )
        lower.contains("os") || lower.contains("operating system") || lower.contains("linux") ||
        lower.contains("kernel") || lower.contains("thread") || lower.contains("concurren") ||
        lower.contains("memory") || lower.contains("process") -> BrandTag(
            icon = Icons.Default.Memory,
            badgeLabel = "OS",
            badgeBg = Color(0xFFFFEBEE),
            badgeText = Color(0xFFC62828),
            iconTint = Color(0xFFE53935)
        )
        lower.contains("web") || lower.contains("frontend") || lower.contains("react") ||
        lower.contains("javascript") || lower.contains("html") || lower.contains("css") ||
        lower.contains("ui") -> BrandTag(
            icon = Icons.Default.Language,
            badgeLabel = "WEB",
            badgeBg = Color(0xFFE0F7FA),
            badgeText = Color(0xFF00838F),
            iconTint = Color(0xFF00ACC1)
        )
        else -> if (isSubject) {
            BrandTag(
                icon = Icons.Default.Folder,
                badgeLabel = "Subject",
                badgeBg = Color(0xFFD8E2FF),
                badgeText = Color(0xFF001A41),
                iconTint = Color(0xFF005AC1)
            )
        } else if (isFolder) {
            BrandTag(
                icon = Icons.Default.Folder,
                badgeLabel = "Topic",
                badgeBg = Color(0xFFFFE0B2),
                badgeText = Color(0xFFE65100),
                iconTint = Color(0xFFFB8C00)
            )
        } else {
            BrandTag(
                icon = Icons.Default.MenuBook,
                badgeLabel = "Subtopic",
                badgeBg = Color(0xFFE1BEE7),
                badgeText = Color(0xFF6A1B9A),
                iconTint = Color(0xFF8E24AA)
            )
        }
    }
}

@Composable
fun LibrarySidebarDrawer(
    folders: List<FolderEntity>,
    notebooks: List<NotebookEntity>,
    pages: List<PageEntity>,
    trashPages: List<PageEntity> = emptyList(),
    activePageId: String?,
    dueReviewCount: Int,
    onPageSelected: (notebookId: String, pageId: String) -> Unit,
    onOpenQuickSwitcher: () -> Unit,
    onCloseSidebar: () -> Unit,
    onOpenReviewToday: () -> Unit = {},
    onCreateFolder: (name: String, parentFolderId: String?) -> Unit = { _, _ -> },
    onCreateNotebook: (title: String, folderId: String?) -> Unit = { _, _ -> },
    onCreateGeneralPage: (notebookId: String, title: String, template: PaperTemplate) -> Unit = { _, _, _ -> },
    onCreateProblemPage: (notebookId: String, title: String, url: String, diff: String, tags: String) -> Unit = { _, _, _, _, _ -> },
    onOpenBackupSettings: () -> Unit = {},
    onOpenLocalBackupSettings: () -> Unit = {},
    onRenamePage: (pageId: String, newTitle: String) -> Unit = { _, _ -> },
    onRenameNotebook: (notebookId: String, newTitle: String) -> Unit = { _, _ -> },
    onRenameFolder: (folderId: String, newName: String) -> Unit = { _, _ -> },
    onDeleteFolder: (folderId: String) -> Unit = {},
    onDeleteNotebook: (notebookId: String) -> Unit = {},
    onMovePagesToTrash: (pageIds: List<String>) -> Unit = {},
    onMoveItemsToTrash: (folderIds: List<String>, notebookIds: List<String>, pageIds: List<String>) -> Unit = { fIds, nbIds, pIds ->
        fIds.forEach { onDeleteFolder(it) }
        nbIds.forEach { onDeleteNotebook(it) }
        if (pIds.isNotEmpty()) onMovePagesToTrash(pIds)
    },
    onRestorePageFromTrash: (pageId: String) -> Unit = {},
    onDeletePagePermanently: (pageId: String) -> Unit = {},
    onEmptyTrash: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    // Track expanded folders & notebooks
    val expandedFolders = remember { mutableStateMapOf<String, Boolean>() }
    val expandedNotebooks = remember { mutableStateMapOf<String, Boolean>() }
    var activeFilter by remember { mutableStateOf<String?>(null) }

    // Multi-select state
    var isMultiSelectMode by remember { mutableStateOf(false) }
    val selectedPageIds = remember { mutableStateListOf<String>() }
    val selectedNotebookIds = remember { mutableStateListOf<String>() }
    val selectedFolderIds = remember { mutableStateListOf<String>() }
    var showConfirmMultiDelete by remember { mutableStateOf(false) }

    // Direct single delete state
    var folderToDelete by remember { mutableStateOf<FolderEntity?>(null) }
    var notebookToDelete by remember { mutableStateOf<NotebookEntity?>(null) }

    // Dialog state
    var showCreateSubjectDialog by remember { mutableStateOf(false) }
    var parentFolderForNewSubtopic by remember { mutableStateOf<String?>(null) }
    var folderForNewNotebook by remember { mutableStateOf<String?>(null) }
    var targetNotebookForNewPage by remember { mutableStateOf<NotebookEntity?>(null) }

    // Rename state
    var pageToRename by remember { mutableStateOf<PageEntity?>(null) }
    var notebookToRename by remember { mutableStateOf<NotebookEntity?>(null) }
    var folderToRename by remember { mutableStateOf<FolderEntity?>(null) }

    // Trash dialog state
    var showTrashDialog by remember { mutableStateOf(false) }

    // Default expand all
    remember(folders, notebooks) {
        folders.forEach { f ->
            if (!expandedFolders.containsKey(f.folderId)) {
                expandedFolders[f.folderId] = true
            }
        }
        notebooks.forEach { nb ->
            if (!expandedNotebooks.containsKey(nb.notebookId)) {
                expandedNotebooks[nb.notebookId] = true
            }
        }
    }

    Surface(
        modifier = modifier
            .width(380.dp)
            .fillMaxHeight(),
        color = MaterialTheme.colorScheme.surfaceContainerLow,
        tonalElevation = 6.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .statusBarsPadding()
                .padding(bottom = 12.dp)
        ) {
            // Row 1: Top Navigation Bar (Fixed: No overlapping text or buttons)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.MenuBook,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Text(
                        text = "Notes & Library",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    IconButton(onClick = onOpenQuickSwitcher, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.Search, contentDescription = "Quick Switcher", modifier = Modifier.size(20.dp))
                    }
                    IconButton(onClick = onOpenLocalBackupSettings, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.Storage, contentDescription = "Local Persistent Backup", modifier = Modifier.size(20.dp))
                    }
                    IconButton(onClick = onOpenBackupSettings, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.CloudSync, contentDescription = "GitHub Backup & Sync", modifier = Modifier.size(20.dp))
                    }
                    IconButton(onClick = onCloseSidebar, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close Sidebar", modifier = Modifier.size(20.dp))
                    }
                }
            }

            // Row 2: Action Toolbar (+ Subject, Multi-select, Trash with badge)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // + Subject Button
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primaryContainer,
                    modifier = Modifier.clickable { showCreateSubjectDialog = true }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add Subject",
                            tint = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Subject",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }

                // Multi-Select Toggle Button
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isMultiSelectMode) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.clickable {
                        isMultiSelectMode = !isMultiSelectMode
                        if (!isMultiSelectMode) {
                            selectedPageIds.clear()
                            selectedNotebookIds.clear()
                            selectedFolderIds.clear()
                        }
                    }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = if (isMultiSelectMode) Icons.Default.Check else Icons.Default.List,
                            contentDescription = "Multi-Select",
                            modifier = Modifier.size(16.dp),
                            tint = if (isMultiSelectMode) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = if (isMultiSelectMode) "Done" else "Select",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (isMultiSelectMode) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.weight(1f))

                // Trash / Recycle Bin (30-day put-back retention)
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (trashPages.isNotEmpty()) MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f) else MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.clickable { showTrashDialog = true }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Trash",
                            modifier = Modifier.size(15.dp),
                            tint = if (trashPages.isNotEmpty()) MaterialTheme.colorScheme.error else Color.Gray
                        )
                        Text(
                            text = "Trash (${trashPages.size})",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (trashPages.isNotEmpty()) MaterialTheme.colorScheme.error else Color.Gray
                        )
                    }
                }
            }

            // Multi-Select Action Banner
            if (isMultiSelectMode) {
                val totalSelected = selectedFolderIds.size + selectedNotebookIds.size + selectedPageIds.size
                Surface(
                    color = MaterialTheme.colorScheme.secondaryContainer,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 4.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "$totalSelected selected",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )

                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            if (totalSelected > 0) {
                                Button(
                                    onClick = { showConfirmMultiDelete = true },
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(Modifier.width(4.dp))
                                    Text("Move to Trash", fontSize = 11.sp)
                                }
                            }
                            OutlinedButton(
                                onClick = {
                                    isMultiSelectMode = false
                                    selectedPageIds.clear()
                                    selectedNotebookIds.clear()
                                    selectedFolderIds.clear()
                                },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text("Cancel", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }

            // Row 3: Quick Filter Chips (Spaced Repetition & DSA filters)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                FilterChip(
                    selected = activeFilter == "review",
                    onClick = { onOpenReviewToday() },
                    label = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Default.Schedule, contentDescription = null, modifier = Modifier.size(14.dp))
                            Text("Review Today", fontSize = 11.sp)
                            if (dueReviewCount > 0) {
                                Surface(
                                    shape = CircleShape,
                                    color = Color(0xFFBA1A1A)
                                ) {
                                    Text(
                                        text = "$dueReviewCount",
                                        color = Color.White,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                                    )
                                }
                            }
                        }
                    }
                )

                FilterChip(
                    selected = activeFilter == "hard",
                    onClick = { activeFilter = if (activeFilter == "hard") null else "hard" },
                    label = { Text("Hard Only", fontSize = 11.sp) }
                )
            }

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 6.dp),
                color = DividerDefaults.color.copy(alpha = 0.5f)
            )

            // Tree View (Scrollable)
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 10.dp)
            ) {
                // If filter is active, show flat filtered problem list
                if (activeFilter != null) {
                    val filteredPages = pages.filter { page ->
                        when (activeFilter) {
                            "review" -> page.problemStatus == "Revisit"
                            "hard" -> page.difficulty.equals("hard", ignoreCase = true)
                            else -> true
                        }
                    }
                    if (filteredPages.isEmpty()) {
                        Text(
                            text = "No problems match this filter.",
                            fontSize = 12.sp,
                            color = Color.Gray,
                            modifier = Modifier.padding(16.dp)
                        )
                    } else {
                        filteredPages.forEach { page ->
                            PageRowItem(
                                page = page,
                                isSelected = page.pageId == activePageId,
                                isMultiSelectMode = isMultiSelectMode,
                                isChecked = selectedPageIds.contains(page.pageId),
                                onCheckedChange = { checked ->
                                    if (checked) selectedPageIds.add(page.pageId) else selectedPageIds.remove(page.pageId)
                                },
                                onClick = {
                                    if (isMultiSelectMode) {
                                        if (selectedPageIds.contains(page.pageId)) selectedPageIds.remove(page.pageId) else selectedPageIds.add(page.pageId)
                                    } else {
                                        onPageSelected(page.notebookId, page.pageId)
                                    }
                                },
                                onRenamePage = { pageToRename = it },
                                onMoveToTrash = { onMovePagesToTrash(listOf(it.pageId)) },
                                indentLevel = 0
                            )
                        }
                    }
                } else {
                    // Full Tree View: Subject Folders -> Topic Folders -> Notebooks -> Pages
                    val rootFolders = folders.filter { it.parentFolderId == null }
                    rootFolders.forEach { folder ->
                        FolderTreeItem(
                            folder = folder,
                            allFolders = folders,
                            allNotebooks = notebooks,
                            allPages = pages,
                            activePageId = activePageId,
                            expandedFolders = expandedFolders,
                            expandedNotebooks = expandedNotebooks,
                            isMultiSelectMode = isMultiSelectMode,
                            isPageSelected = { selectedPageIds.contains(it) },
                            onTogglePageSelection = {
                                if (selectedPageIds.contains(it)) selectedPageIds.remove(it) else selectedPageIds.add(it)
                            },
                            isFolderSelected = { selectedFolderIds.contains(it) },
                            onToggleFolderSelection = {
                                if (selectedFolderIds.contains(it)) selectedFolderIds.remove(it) else selectedFolderIds.add(it)
                            },
                            onDeleteFolderClick = { folderToDelete = it },
                            isNotebookSelected = { selectedNotebookIds.contains(it) },
                            onToggleNotebookSelection = {
                                if (selectedNotebookIds.contains(it)) selectedNotebookIds.remove(it) else selectedNotebookIds.add(it)
                            },
                            onDeleteNotebookClick = { notebookToDelete = it },
                            onPageSelected = onPageSelected,
                            onAddSubtopic = { parentFolderForNewSubtopic = it },
                            onAddNotebook = { folderForNewNotebook = it },
                            onAddPage = { targetNotebookForNewPage = it },
                            onRenameFolder = { folderToRename = it },
                            onRenameNotebook = { notebookToRename = it },
                            onRenamePage = { pageToRename = it },
                            onMoveToTrash = { onMovePagesToTrash(listOf(it.pageId)) },
                            indentLevel = 0
                        )
                    }

                    // Root notebooks without folder
                    val rootNotebooks = notebooks.filter { it.folderId == null }
                    rootNotebooks.forEach { nb ->
                        NotebookTreeItem(
                            notebook = nb,
                            allPages = pages,
                            activePageId = activePageId,
                            expandedNotebooks = expandedNotebooks,
                            isMultiSelectMode = isMultiSelectMode,
                            isPageSelected = { selectedPageIds.contains(it) },
                            onTogglePageSelection = {
                                if (selectedPageIds.contains(it)) selectedPageIds.remove(it) else selectedPageIds.add(it)
                            },
                            isNotebookSelected = { selectedNotebookIds.contains(it) },
                            onToggleNotebookSelection = {
                                if (selectedNotebookIds.contains(it)) selectedNotebookIds.remove(it) else selectedNotebookIds.add(it)
                            },
                            onDeleteNotebookClick = { notebookToDelete = it },
                            onPageSelected = onPageSelected,
                            onAddPage = { targetNotebookForNewPage = it },
                            onRenameNotebook = { notebookToRename = it },
                            onRenamePage = { pageToRename = it },
                            onMoveToTrash = { onMovePagesToTrash(listOf(it.pageId)) },
                            indentLevel = 0
                        )
                    }
                }
            }
        }
    }

    // Dialog: Create Root Subject (Folder)
    if (showCreateSubjectDialog) {
        var subjectName by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showCreateSubjectDialog = false },
            title = { Text("New Subject / Root Folder") },
            text = {
                OutlinedTextField(
                    value = subjectName,
                    onValueChange = { subjectName = it },
                    label = { Text("Subject Name (e.g. System Design, DSA, OS)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val name = subjectName.trim()
                        if (name.isNotEmpty()) {
                            onCreateFolder(name, null)
                            showCreateSubjectDialog = false
                        }
                    }
                ) {
                    Text("Create")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showCreateSubjectDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Create Subtopic (Folder under Subject)
    parentFolderForNewSubtopic?.let { parentId ->
        var subtopicName by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { parentFolderForNewSubtopic = null },
            title = { Text("New Subtopic / Folder") },
            text = {
                OutlinedTextField(
                    value = subtopicName,
                    onValueChange = { subtopicName = it },
                    label = { Text("Subtopic Name (e.g. Load Balancers, Arrays)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val name = subtopicName.trim()
                        if (name.isNotEmpty()) {
                            onCreateFolder(name, parentId)
                            parentFolderForNewSubtopic = null
                        }
                    }
                ) {
                    Text("Create")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { parentFolderForNewSubtopic = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Create Notebook under Folder
    folderForNewNotebook?.let { fId ->
        var notebookTitle by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { folderForNewNotebook = null },
            title = { Text("New Topic Notebook") },
            text = {
                OutlinedTextField(
                    value = notebookTitle,
                    onValueChange = { notebookTitle = it },
                    label = { Text("Notebook Title (e.g. Consistent Hashing, Two Pointers)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val title = notebookTitle.trim()
                        if (title.isNotEmpty()) {
                            onCreateNotebook(title, fId)
                            folderForNewNotebook = null
                        }
                    }
                ) {
                    Text("Create")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { folderForNewNotebook = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Create Page under Notebook
    targetNotebookForNewPage?.let { nb ->
        var pageTitle by remember { mutableStateOf("") }
        var isProblemType by remember { mutableStateOf(false) }
        var selectedTemplate by remember { mutableStateOf(PaperTemplate.RULED) }
        var difficulty by remember { mutableStateOf("Medium") }
        var sourceUrl by remember { mutableStateOf("") }
        var tags by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { targetNotebookForNewPage = null },
            title = { Text("Add Note to ${nb.title}") },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (!isProblemType) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier
                                .weight(1f)
                                .clickable { isProblemType = false }
                        ) {
                            Text(
                                text = "General Note",
                                modifier = Modifier.padding(vertical = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                fontWeight = if (!isProblemType) FontWeight.Bold else FontWeight.Normal,
                                fontSize = 12.sp,
                                color = if (!isProblemType) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isProblemType) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier
                                .weight(1f)
                                .clickable { isProblemType = true }
                        ) {
                            Text(
                                text = "Problem / DSA",
                                modifier = Modifier.padding(vertical = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                fontWeight = if (isProblemType) FontWeight.Bold else FontWeight.Normal,
                                fontSize = 12.sp,
                                color = if (isProblemType) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    OutlinedTextField(
                        value = pageTitle,
                        onValueChange = { pageTitle = it },
                        label = { Text(if (isProblemType) "Problem Name (e.g. Q1 - Two Sum)" else "Note Title") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (!isProblemType) {
                        Text("Paper Template:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf(
                                PaperTemplate.RULED to "Ruled",
                                PaperTemplate.GRID to "Grid",
                                PaperTemplate.DOT to "Dot",
                                PaperTemplate.BLANK to "Blank"
                            ).forEach { (tmpl, label) ->
                                FilterChip(
                                    selected = selectedTemplate == tmpl,
                                    onClick = { selectedTemplate = tmpl },
                                    label = { Text(label, fontSize = 11.sp) }
                                )
                            }
                        }
                    } else {
                        OutlinedTextField(
                            value = sourceUrl,
                            onValueChange = { sourceUrl = it },
                            label = { Text("LeetCode / Source URL (optional)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = tags,
                            onValueChange = { tags = it },
                            label = { Text("Tags (comma-separated, e.g. Array, Two Pointers)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("Difficulty:", fontSize = 12.sp)
                            listOf("Easy", "Medium", "Hard").forEach { d ->
                                FilterChip(
                                    selected = difficulty == d,
                                    onClick = { difficulty = d },
                                    label = { Text(d, fontSize = 11.sp) }
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val title = pageTitle.trim().ifEmpty { if (isProblemType) "Untitled Problem" else "Untitled Note" }
                        if (isProblemType) {
                            onCreateProblemPage(nb.notebookId, title, sourceUrl.trim(), difficulty, tags.trim())
                        } else {
                            onCreateGeneralPage(nb.notebookId, title, selectedTemplate)
                        }
                        targetNotebookForNewPage = null
                    }
                ) {
                    Text("Add Note")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { targetNotebookForNewPage = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Rename Page
    pageToRename?.let { page ->
        var newTitle by remember { mutableStateOf(page.title) }
        AlertDialog(
            onDismissRequest = { pageToRename = null },
            icon = { Icon(Icons.Default.Edit, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
            title = { Text("Rename Note Page") },
            text = {
                OutlinedTextField(
                    value = newTitle,
                    onValueChange = { newTitle = it },
                    label = { Text("Page Title") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val title = newTitle.trim()
                        if (title.isNotEmpty()) {
                            onRenamePage(page.pageId, title)
                            pageToRename = null
                        }
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { pageToRename = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Rename Notebook
    notebookToRename?.let { nb ->
        var newTitle by remember { mutableStateOf(nb.title) }
        AlertDialog(
            onDismissRequest = { notebookToRename = null },
            icon = { Icon(Icons.Default.Edit, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
            title = { Text("Rename Notebook") },
            text = {
                OutlinedTextField(
                    value = newTitle,
                    onValueChange = { newTitle = it },
                    label = { Text("Notebook Title") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val title = newTitle.trim()
                        if (title.isNotEmpty()) {
                            onRenameNotebook(nb.notebookId, title)
                            notebookToRename = null
                        }
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { notebookToRename = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Rename Folder
    folderToRename?.let { folder ->
        var newName by remember { mutableStateOf(folder.name) }
        AlertDialog(
            onDismissRequest = { folderToRename = null },
            icon = { Icon(Icons.Default.Edit, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
            title = { Text("Rename Folder") },
            text = {
                OutlinedTextField(
                    value = newName,
                    onValueChange = { newName = it },
                    label = { Text("Folder Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val name = newName.trim()
                        if (name.isNotEmpty()) {
                            onRenameFolder(folder.folderId, name)
                            folderToRename = null
                        }
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { folderToRename = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Confirm Multi-Delete
    if (showConfirmMultiDelete) {
        val totalSelected = selectedFolderIds.size + selectedNotebookIds.size + selectedPageIds.size
        AlertDialog(
            onDismissRequest = { showConfirmMultiDelete = false },
            icon = { Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Move to Trash?") },
            text = {
                Text("Move $totalSelected selected item(s) to Trash? All contained notes will be safely preserved in the 30-day Trash where you can restore them.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        onMoveItemsToTrash(selectedFolderIds.toList(), selectedNotebookIds.toList(), selectedPageIds.toList())
                        selectedFolderIds.clear()
                        selectedNotebookIds.clear()
                        selectedPageIds.clear()
                        isMultiSelectMode = false
                        showConfirmMultiDelete = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Move to Trash", color = MaterialTheme.colorScheme.onError)
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showConfirmMultiDelete = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Delete Single Folder / Subject
    folderToDelete?.let { folder ->
        AlertDialog(
            onDismissRequest = { folderToDelete = null },
            icon = { Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Delete '${folder.name}'?") },
            text = {
                Text("Delete this folder and all its topics? All contained notes will be moved to the 30-day Trash where they can be restored.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        onDeleteFolder(folder.folderId)
                        folderToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Delete to Trash", color = MaterialTheme.colorScheme.onError)
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { folderToDelete = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Delete Single Notebook
    notebookToDelete?.let { nb ->
        AlertDialog(
            onDismissRequest = { notebookToDelete = null },
            icon = { Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Delete '${nb.title}'?") },
            text = {
                Text("Delete this notebook? All contained notes will be moved to the 30-day Trash where they can be restored.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        onDeleteNotebook(nb.notebookId)
                        notebookToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Delete to Trash", color = MaterialTheme.colorScheme.onError)
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { notebookToDelete = null }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Dialog: Trash / Recycle Bin (30-day put-back retention)
    if (showTrashDialog) {
        AlertDialog(
            onDismissRequest = { showTrashDialog = false },
            icon = { Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Trash / Recycle Bin") },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 420.dp)
                ) {
                    Text(
                        text = "Notes are safely preserved here for 30 days before permanent deletion. Tap 'Put Back' to restore a note.",
                        fontSize = 12.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )

                    if (trashPages.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Trash is empty.", color = Color.Gray, fontSize = 14.sp)
                        }
                    } else {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .verticalScroll(rememberScrollState()),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            trashPages.forEach { page ->
                                val deletedAt = page.deletedAt ?: page.modifiedAt
                                val daysAgo = ((System.currentTimeMillis() - deletedAt) / (1000L * 60 * 60 * 24)).toInt().coerceAtLeast(0)
                                val daysRemaining = (30 - daysAgo).coerceAtLeast(1)

                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = page.title,
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                            Text(
                                                text = "Deleted $daysAgo days ago • $daysRemaining days left to put back",
                                                fontSize = 11.sp,
                                                color = Color(0xFFBA1A1A)
                                            )
                                        }

                                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                            Button(
                                                onClick = {
                                                    onRestorePageFromTrash(page.pageId)
                                                },
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                                            ) {
                                                Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(14.dp))
                                                Spacer(Modifier.width(4.dp))
                                                Text("Put Back", fontSize = 11.sp)
                                            }

                                            IconButton(
                                                onClick = {
                                                    onDeletePagePermanently(page.pageId)
                                                },
                                                modifier = Modifier.size(32.dp)
                                            ) {
                                                Icon(
                                                    Icons.Default.Delete,
                                                    contentDescription = "Delete Forever",
                                                    tint = MaterialTheme.colorScheme.error,
                                                    modifier = Modifier.size(16.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                if (trashPages.isNotEmpty()) {
                    OutlinedButton(
                        onClick = {
                            onEmptyTrash()
                            showTrashDialog = false
                        },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("Empty Trash")
                    }
                }
            },
            dismissButton = {
                Button(onClick = { showTrashDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
private fun FolderTreeItem(
    folder: FolderEntity,
    allFolders: List<FolderEntity>,
    allNotebooks: List<NotebookEntity>,
    allPages: List<PageEntity>,
    activePageId: String?,
    expandedFolders: MutableMap<String, Boolean>,
    expandedNotebooks: MutableMap<String, Boolean>,
    isMultiSelectMode: Boolean,
    isPageSelected: (String) -> Boolean,
    onTogglePageSelection: (String) -> Unit,
    isFolderSelected: (String) -> Boolean = { false },
    onToggleFolderSelection: (String) -> Unit = {},
    onDeleteFolderClick: (FolderEntity) -> Unit = {},
    isNotebookSelected: (String) -> Boolean = { false },
    onToggleNotebookSelection: (String) -> Unit = {},
    onDeleteNotebookClick: (NotebookEntity) -> Unit = {},
    onPageSelected: (notebookId: String, pageId: String) -> Unit,
    onAddSubtopic: (parentFolderId: String) -> Unit,
    onAddNotebook: (folderId: String) -> Unit,
    onAddPage: (NotebookEntity) -> Unit,
    onRenameFolder: (FolderEntity) -> Unit,
    onRenameNotebook: (NotebookEntity) -> Unit,
    onRenamePage: (PageEntity) -> Unit,
    onMoveToTrash: (PageEntity) -> Unit,
    indentLevel: Int
) {
    val isExpanded = expandedFolders[folder.folderId] == true
    val subFolders = allFolders.filter { it.parentFolderId == folder.folderId }
    val childNotebooks = allNotebooks.filter { it.folderId == folder.folderId }
    val brandTag = resolveBrandTag(folder.name, isFolder = true, isSubject = indentLevel == 0)
    var isMenuOpen by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = (indentLevel * 14).dp)
                .clip(RoundedCornerShape(8.dp))
                .clickable { expandedFolders[folder.folderId] = !isExpanded }
                .padding(horizontal = 6.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            if (isMultiSelectMode) {
                Checkbox(
                    checked = isFolderSelected(folder.folderId),
                    onCheckedChange = { onToggleFolderSelection(folder.folderId) },
                    modifier = Modifier.size(24.dp)
                )
            }

            Icon(
                imageVector = if (isExpanded) Icons.Default.ExpandMore else Icons.Default.ChevronRight,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = Color.Gray
            )
            Icon(
                imageVector = brandTag.icon,
                contentDescription = null,
                modifier = Modifier.size(20.dp),
                tint = brandTag.iconTint
            )
            Surface(
                shape = RoundedCornerShape(4.dp),
                color = brandTag.badgeBg
            ) {
                Text(
                    text = brandTag.badgeLabel,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = brandTag.badgeText,
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                )
            }
            Text(
                text = folder.name,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.weight(1f)
            )

            // Menu button for Folder (Add Subtopic, Add Notebook, Rename, Delete)
            Box {
                IconButton(
                    onClick = { isMenuOpen = true },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add inside folder",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(16.dp)
                    )
                }

                DropdownMenu(
                    expanded = isMenuOpen,
                    onDismissRequest = { isMenuOpen = false }
                ) {
                    DropdownMenuItem(
                        text = { Text(if (indentLevel == 0) "+ Add Topic (Folder)" else "+ Add Subtopic (Folder)") },
                        onClick = {
                            isMenuOpen = false
                            onAddSubtopic(folder.folderId)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("+ Add Subtopic Notebook") },
                        onClick = {
                            isMenuOpen = false
                            onAddNotebook(folder.folderId)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("✏️ Rename Folder") },
                        onClick = {
                            isMenuOpen = false
                            onRenameFolder(folder)
                        }
                    )
                    HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                    DropdownMenuItem(
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(16.dp))
                                Text(if (indentLevel == 0) "Delete Subject..." else "Delete Topic...", color = MaterialTheme.colorScheme.error)
                            }
                        },
                        onClick = {
                            isMenuOpen = false
                            onDeleteFolderClick(folder)
                        }
                    )
                }
            }
        }

        AnimatedVisibility(visible = isExpanded) {
            Column {
                // Subfolders
                subFolders.forEach { sub ->
                    FolderTreeItem(
                        folder = sub,
                        allFolders = allFolders,
                        allNotebooks = allNotebooks,
                        allPages = allPages,
                        activePageId = activePageId,
                        expandedFolders = expandedFolders,
                        expandedNotebooks = expandedNotebooks,
                        isMultiSelectMode = isMultiSelectMode,
                        isPageSelected = isPageSelected,
                        onTogglePageSelection = onTogglePageSelection,
                        isFolderSelected = isFolderSelected,
                        onToggleFolderSelection = onToggleFolderSelection,
                        onDeleteFolderClick = onDeleteFolderClick,
                        isNotebookSelected = isNotebookSelected,
                        onToggleNotebookSelection = onToggleNotebookSelection,
                        onDeleteNotebookClick = onDeleteNotebookClick,
                        onPageSelected = onPageSelected,
                        onAddSubtopic = onAddSubtopic,
                        onAddNotebook = onAddNotebook,
                        onAddPage = onAddPage,
                        onRenameFolder = onRenameFolder,
                        onRenameNotebook = onRenameNotebook,
                        onRenamePage = onRenamePage,
                        onMoveToTrash = onMoveToTrash,
                        indentLevel = indentLevel + 1
                    )
                }
                // Child Notebooks
                childNotebooks.forEach { nb ->
                    NotebookTreeItem(
                        notebook = nb,
                        allPages = allPages,
                        activePageId = activePageId,
                        expandedNotebooks = expandedNotebooks,
                        isMultiSelectMode = isMultiSelectMode,
                        isPageSelected = isPageSelected,
                        onTogglePageSelection = onTogglePageSelection,
                        isNotebookSelected = isNotebookSelected,
                        onToggleNotebookSelection = onToggleNotebookSelection,
                        onDeleteNotebookClick = onDeleteNotebookClick,
                        onPageSelected = onPageSelected,
                        onAddPage = onAddPage,
                        onRenameNotebook = onRenameNotebook,
                        onRenamePage = onRenamePage,
                        onMoveToTrash = onMoveToTrash,
                        indentLevel = indentLevel + 1
                    )
                }
            }
        }
    }
}

@Composable
private fun NotebookTreeItem(
    notebook: NotebookEntity,
    allPages: List<PageEntity>,
    activePageId: String?,
    expandedNotebooks: MutableMap<String, Boolean>,
    isMultiSelectMode: Boolean,
    isPageSelected: (String) -> Boolean,
    onTogglePageSelection: (String) -> Unit,
    isNotebookSelected: (String) -> Boolean = { false },
    onToggleNotebookSelection: (String) -> Unit = {},
    onDeleteNotebookClick: (NotebookEntity) -> Unit = {},
    onPageSelected: (notebookId: String, pageId: String) -> Unit,
    onAddPage: (NotebookEntity) -> Unit,
    onRenameNotebook: (NotebookEntity) -> Unit,
    onRenamePage: (PageEntity) -> Unit,
    onMoveToTrash: (PageEntity) -> Unit,
    indentLevel: Int
) {
    val isExpanded = expandedNotebooks[notebook.notebookId] == true
    val childPages = allPages.filter { it.notebookId == notebook.notebookId }.sortedBy { it.pageIndex }
    val brandTag = resolveBrandTag(notebook.title, isFolder = false, isSubject = false)
    var isMenuOpen by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = (indentLevel * 14).dp)
                .clip(RoundedCornerShape(8.dp))
                .clickable { expandedNotebooks[notebook.notebookId] = !isExpanded }
                .padding(horizontal = 6.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            if (isMultiSelectMode) {
                Checkbox(
                    checked = isNotebookSelected(notebook.notebookId),
                    onCheckedChange = { onToggleNotebookSelection(notebook.notebookId) },
                    modifier = Modifier.size(24.dp)
                )
            }

            Icon(
                imageVector = if (isExpanded) Icons.Default.ExpandMore else Icons.Default.ChevronRight,
                contentDescription = null,
                modifier = Modifier.size(16.dp),
                tint = Color.Gray
            )
            Icon(
                imageVector = brandTag.icon,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = brandTag.iconTint
            )
            Surface(
                shape = RoundedCornerShape(4.dp),
                color = brandTag.badgeBg
            ) {
                Text(
                    text = brandTag.badgeLabel,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = brandTag.badgeText,
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                )
            }
            Text(
                text = notebook.title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.weight(1f)
            )
            if (notebook.isStarred) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = "Starred",
                    tint = Color(0xFFFFB300),
                    modifier = Modifier.size(14.dp)
                )
            }

            // Notebook Options (Add Note, Rename, Delete)
            Box {
                IconButton(
                    onClick = { isMenuOpen = true },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Notebook options",
                        tint = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier.size(16.dp)
                    )
                }

                DropdownMenu(
                    expanded = isMenuOpen,
                    onDismissRequest = { isMenuOpen = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("+ Add Note") },
                        onClick = {
                            isMenuOpen = false
                            onAddPage(notebook)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("✏️ Rename Notebook") },
                        onClick = {
                            isMenuOpen = false
                            onRenameNotebook(notebook)
                        }
                    )
                    HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                    DropdownMenuItem(
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Icon(Icons.Default.Delete, contentDescription = null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(16.dp))
                                Text("Delete Notebook...", color = MaterialTheme.colorScheme.error)
                            }
                        },
                        onClick = {
                            isMenuOpen = false
                            onDeleteNotebookClick(notebook)
                        }
                    )
                }
            }
        }

        AnimatedVisibility(visible = isExpanded) {
            Column {
                childPages.forEach { page ->
                    PageRowItem(
                        page = page,
                        isSelected = page.pageId == activePageId,
                        isMultiSelectMode = isMultiSelectMode,
                        isChecked = isPageSelected(page.pageId),
                        onCheckedChange = { onTogglePageSelection(page.pageId) },
                        onClick = {
                            if (isMultiSelectMode) {
                                onTogglePageSelection(page.pageId)
                            } else {
                                onPageSelected(notebook.notebookId, page.pageId)
                            }
                        },
                        onRenamePage = onRenamePage,
                        onMoveToTrash = onMoveToTrash,
                        indentLevel = indentLevel + 1
                    )
                }
            }
        }
    }
}

@Composable
private fun PageRowItem(
    page: PageEntity,
    isSelected: Boolean,
    isMultiSelectMode: Boolean,
    isChecked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    onClick: () -> Unit,
    onRenamePage: (PageEntity) -> Unit,
    onMoveToTrash: (PageEntity) -> Unit,
    indentLevel: Int
) {
    val statusDotColor = when (page.problemStatus) {
        "Solved" -> Color(0xFF146C2E)
        "Revisit" -> Color(0xFFBA1A1A)
        "Mastered" -> Color(0xFF6750A4)
        else -> Color.Gray
    }
    var isMenuOpen by remember { mutableStateOf(false) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = (indentLevel * 14 + 10).dp, top = 2.dp, bottom = 2.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(if (isSelected && !isMultiSelectMode) MaterialTheme.colorScheme.primaryContainer else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        if (isMultiSelectMode) {
            Checkbox(
                checked = isChecked,
                onCheckedChange = onCheckedChange,
                modifier = Modifier.size(24.dp)
            )
        } else {
            // Status indicator dot
            Box(
                modifier = Modifier
                    .size(7.dp)
                    .clip(CircleShape)
                    .background(statusDotColor)
            )
        }

        // Page Number Badge: P1, P2... Pn
        Surface(
            shape = RoundedCornerShape(4.dp),
            color = if (isSelected && !isMultiSelectMode) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
        ) {
            Text(
                text = "P${page.pageIndex + 1}",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = if (isSelected && !isMultiSelectMode) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
            )
        }

        Icon(
            imageVector = Icons.Default.Description,
            contentDescription = null,
            modifier = Modifier.size(16.dp),
            tint = if (isSelected && !isMultiSelectMode) MaterialTheme.colorScheme.primary else Color.Gray
        )

        Text(
            text = page.title,
            fontSize = 12.sp,
            fontWeight = if (isSelected && !isMultiSelectMode) FontWeight.Bold else FontWeight.Normal,
            color = if (isSelected && !isMultiSelectMode) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f)
        )

        // Difficulty tag if problem page
        page.difficulty?.let { diff ->
            val diffColor = when (diff.lowercase()) {
                "easy" -> Color(0xFF146C2E)
                "medium" -> Color(0xFFB26A00)
                "hard" -> Color(0xFFBA1A1A)
                else -> Color.Gray
            }
            Text(
                text = diff,
                fontSize = 10.sp,
                color = diffColor,
                fontWeight = FontWeight.Bold
            )
        }

        // Trailing 3-dots menu for Rename & Move to Trash
        if (!isMultiSelectMode) {
            Box {
                IconButton(
                    onClick = { isMenuOpen = true },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = "Options",
                        tint = Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                }

                DropdownMenu(
                    expanded = isMenuOpen,
                    onDismissRequest = { isMenuOpen = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("✏️ Rename Note") },
                        onClick = {
                            isMenuOpen = false
                            onRenamePage(page)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("🗑️ Move to Trash") },
                        onClick = {
                            isMenuOpen = false
                            onMoveToTrash(page)
                        }
                    )
                }
            }
        }
    }
}
