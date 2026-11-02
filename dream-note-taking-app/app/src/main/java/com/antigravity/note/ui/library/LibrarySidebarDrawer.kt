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
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.NotificationImportant
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Badge
import androidx.compose.material3.DividerDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
    modifier: Modifier = Modifier
) {
    // Track expanded folders & notebooks
    val expandedFolders = remember { mutableStateMapOf<String, Boolean>() }
    val expandedNotebooks = remember { mutableStateMapOf<String, Boolean>() }
    var activeFilter by remember { mutableStateOf<String?>(null) } // null = All, "review" = Review Today, "hard" = Hard

    // Default expand root DSA folder
    remember(folders) {
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
            .width(360.dp)
            .fillMaxHeight(),
        color = MaterialTheme.colorScheme.surfaceContainerLow,
        tonalElevation = 6.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .padding(vertical = 12.dp)
        ) {
            // Header: Library Title + Quick Switcher + Close button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
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
                        text = "DSA Library",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
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
                            indentLevel = 0
                        )
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
    indentLevel: Int
) {
    val isExpanded = expandedFolders[folder.folderId] == true
    val subFolders = allFolders.filter { it.parentFolderId == folder.folderId }
    val childNotebooks = allNotebooks.filter { it.folderId == folder.folderId }

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
                color = MaterialTheme.colorScheme.onSurface
            )
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
