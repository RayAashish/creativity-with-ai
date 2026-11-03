package com.antigravity.note.ui.library

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CreateNewFolder
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.NoteAdd
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
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
import androidx.compose.ui.window.Dialog
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.library.db.FolderEntity
import com.antigravity.note.library.db.NotebookEntity
import com.antigravity.note.library.db.PageEntity

@Composable
fun LibrarySidebarDrawer(
    folders: List<FolderEntity>,
    notebooks: List<NotebookEntity>,
    pages: List<PageEntity>,
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
    modifier: Modifier = Modifier
) {
    // Track expanded folders & notebooks
    val expandedFolders = remember { mutableStateMapOf<String, Boolean>() }
    val expandedNotebooks = remember { mutableStateMapOf<String, Boolean>() }
    var activeFilter by remember { mutableStateOf<String?>(null) } // null = All, "review" = Review Today, "hard" = Hard

    // Dialog state
    var showCreateSubjectDialog by remember { mutableStateOf(false) }
    var parentFolderForNewSubtopic by remember { mutableStateOf<String?>(null) }
    var folderForNewNotebook by remember { mutableStateOf<String?>(null) }
    var targetNotebookForNewPage by remember { mutableStateOf<NotebookEntity?>(null) }

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
                .padding(vertical = 12.dp)
        ) {
            // Header: Library Title + "+ Subject" + Quick Switcher + Close button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 6.dp),
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
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    // + Subject Button
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.primaryContainer,
                        modifier = Modifier.clickable { showCreateSubjectDialog = true }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(3.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "Add Subject",
                                tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Subject",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }

                    IconButton(onClick = onOpenQuickSwitcher) {
                        Icon(Icons.Default.Search, contentDescription = "Quick Switcher (Ctrl+K)")
                    }
                    IconButton(onClick = onCloseSidebar) {
                        Icon(Icons.Default.Close, contentDescription = "Close Sidebar")
                    }
                }
            }

            // Quick Filter Chips (Spaced Repetition & DSA filters)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                FilterChip(
                    selected = activeFilter == "review",
                    onClick = {
                        onOpenReviewToday()
                    },
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
                    onClick = {
                        activeFilter = if (activeFilter == "hard") null else "hard"
                    },
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
                                onClick = { onPageSelected(page.notebookId, page.pageId) },
                                indentLevel = 0
                            )
                        }
                    }
                } else {
                    // Render Full Tree: Root Folders -> Subfolders -> Notebooks -> Pages
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
                            onPageSelected = onPageSelected,
                            onAddSubtopic = { parentFolderForNewSubtopic = it },
                            onAddNotebook = { folderForNewNotebook = it },
                            onAddPage = { targetNotebookForNewPage = it },
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
                            onPageSelected = onPageSelected,
                            onAddPage = { targetNotebookForNewPage = it },
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

    // Dialog: Create Page under Notebook (General Note vs Problem Page)
    targetNotebookForNewPage?.let { nb ->
        var pageTitle by remember { mutableStateOf("") }
        var isProblemType by remember { mutableStateOf(false) }
        var selectedTemplate by remember { mutableStateOf(PaperTemplate.RULED) }
        var difficulty by remember { mutableStateOf("Medium") }
        var sourceUrl by remember { mutableStateOf("") }
        var tags by remember { mutableStateOf("") }

        Dialog(onDismissRequest = { targetNotebookForNewPage = null }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 6.dp,
                modifier = Modifier
                    .width(480.dp)
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .padding(20.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = "Add Note to \"${nb.title}\"",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(14.dp))

                    // Type Toggle: General Note vs Problem Page
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FilterChip(
                            selected = !isProblemType,
                            onClick = { isProblemType = false },
                            label = { Text("General Note") }
                        )
                        FilterChip(
                            selected = isProblemType,
                            onClick = { isProblemType = true },
                            label = { Text("DSA / Problem Page") }
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = pageTitle,
                        onValueChange = { pageTitle = it },
                        label = { Text(if (isProblemType) "Problem Title (e.g. Q3 – LRU Cache)" else "Note Title") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    if (!isProblemType) {
                        // Paper Template Picker
                        Text("Paper Template:", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf(
                                PaperTemplate.RULED to "Ruled",
                                PaperTemplate.GRID to "Grid",
                                PaperTemplate.BLANK to "Blank",
                                PaperTemplate.DOT to "Dot",
                                PaperTemplate.CORNELL to "Cornell"
                            ).forEach { (tpl, name) ->
                                FilterChip(
                                    selected = selectedTemplate == tpl,
                                    onClick = { selectedTemplate = tpl },
                                    label = { Text(name, fontSize = 11.sp) }
                                )
                            }
                        }
                    } else {
                        // Problem Fields: Difficulty & Link
                        Text("Difficulty:", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("Easy", "Medium", "Hard").forEach { diff ->
                                FilterChip(
                                    selected = difficulty == diff,
                                    onClick = { difficulty = diff },
                                    label = { Text(diff) }
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = sourceUrl,
                            onValueChange = { sourceUrl = it },
                            label = { Text("Problem Link (LeetCode URL)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = tags,
                            onValueChange = { tags = it },
                            label = { Text("Tags (e.g. Design, Cache)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        OutlinedButton(onClick = { targetNotebookForNewPage = null }) {
                            Text("Cancel")
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Button(
                            onClick = {
                                val title = pageTitle.trim().ifEmpty { if (isProblemType) "New Problem" else "New Note" }
                                if (isProblemType) {
                                    onCreateProblemPage(nb.notebookId, title, sourceUrl.trim(), difficulty, tags.trim())
                                } else {
                                    onCreateGeneralPage(nb.notebookId, title, selectedTemplate)
                                }
                                targetNotebookForNewPage = null
                            }
                        ) {
                            Text("Create & Open")
                        }
                    }
                }
            }
        }
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
    onPageSelected: (notebookId: String, pageId: String) -> Unit,
    onAddSubtopic: (parentFolderId: String) -> Unit,
    onAddNotebook: (folderId: String) -> Unit,
    onAddPage: (NotebookEntity) -> Unit,
    indentLevel: Int
) {
    val isExpanded = expandedFolders[folder.folderId] == true
    val subFolders = allFolders.filter { it.parentFolderId == folder.folderId }
    val childNotebooks = allNotebooks.filter { it.folderId == folder.folderId }
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
            Icon(
                imageVector = if (isExpanded) Icons.Default.ExpandMore else Icons.Default.ChevronRight,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = Color.Gray
            )
            Icon(
                imageVector = if (isExpanded) Icons.Default.FolderOpen else Icons.Default.Folder,
                contentDescription = null,
                modifier = Modifier.size(20.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Text(
                text = folder.name,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.weight(1f)
            )

            // Add button for Folder (Subtopic or Notebook)
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
                        text = { Text("+ Add Subtopic (Folder)") },
                        onClick = {
                            isMenuOpen = false
                            onAddSubtopic(folder.folderId)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("+ Add Topic Notebook") },
                        onClick = {
                            isMenuOpen = false
                            onAddNotebook(folder.folderId)
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
                        onPageSelected = onPageSelected,
                        onAddSubtopic = onAddSubtopic,
                        onAddNotebook = onAddNotebook,
                        onAddPage = onAddPage,
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
                        onPageSelected = onPageSelected,
                        onAddPage = onAddPage,
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
    onPageSelected: (notebookId: String, pageId: String) -> Unit,
    onAddPage: (NotebookEntity) -> Unit,
    indentLevel: Int
) {
    val isExpanded = expandedNotebooks[notebook.notebookId] == true
    val childPages = allPages.filter { it.notebookId == notebook.notebookId }.sortedBy { it.pageIndex }

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
            Icon(
                imageVector = if (isExpanded) Icons.Default.ExpandMore else Icons.Default.ChevronRight,
                contentDescription = null,
                modifier = Modifier.size(16.dp),
                tint = Color.Gray
            )
            Icon(
                imageVector = Icons.Default.MenuBook,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = MaterialTheme.colorScheme.secondary
            )
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

            // + Add Note to Notebook Button
            IconButton(
                onClick = { onAddPage(notebook) },
                modifier = Modifier.size(24.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Add page to notebook",
                    tint = MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        AnimatedVisibility(visible = isExpanded) {
            Column {
                childPages.forEach { page ->
                    PageRowItem(
                        page = page,
                        isSelected = page.pageId == activePageId,
                        onClick = { onPageSelected(notebook.notebookId, page.pageId) },
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
    onClick: () -> Unit,
    indentLevel: Int
) {
    val statusDotColor = when (page.problemStatus) {
        "Solved" -> Color(0xFF146C2E)
        "Revisit" -> Color(0xFFBA1A1A)
        "Mastered" -> Color(0xFF6750A4)
        else -> Color.Gray
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = (indentLevel * 14 + 10).dp, top = 2.dp, bottom = 2.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Status indicator dot
        Box(
            modifier = Modifier
                .size(7.dp)
                .clip(CircleShape)
                .background(statusDotColor)
        )

        Icon(
            imageVector = Icons.Default.Description,
            contentDescription = null,
            modifier = Modifier.size(16.dp),
            tint = if (isSelected) MaterialTheme.colorScheme.primary else Color.Gray
        )

        Text(
            text = page.title,
            fontSize = 12.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface,
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
    }
}
