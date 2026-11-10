package com.readmaster.app.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.SubdirectoryArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.readmaster.app.data.model.DocumentEntity
import com.readmaster.app.data.model.FolderEntity
import com.readmaster.app.data.model.FolderIconsCatalog

@Composable
fun MoveDocumentFolderDialog(
    document: DocumentEntity,
    folders: List<FolderEntity>,
    documents: List<DocumentEntity> = emptyList(),
    onSelectFolder: (folderId: String?) -> Unit,
    onDismiss: () -> Unit
) {
    // Structure folders hierarchically: Root folders first, with subfolders listed immediately after their parent
    val organizedFolders = remember(folders) {
        val rootFolders = folders.filter { it.parentFolderId == null }
        val result = mutableListOf<Pair<FolderEntity, FolderEntity?>>() // (folder, parentFolder)
        for (root in rootFolders) {
            result.add(root to null)
            val subfolders = folders.filter { it.parentFolderId == root.id }
            for (sub in subfolders) {
                result.add(sub to root)
            }
        }
        // Any orphaned subfolders whose parent doesn't exist
        val addedIds = result.map { it.first.id }.toSet()
        folders.filter { it.id !in addedIds }.forEach { orphan ->
            val parent = folders.firstOrNull { it.id == orphan.parentFolderId }
            result.add(orphan to parent)
        }
        result
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(22.dp),
            color = Color(0xFF1E222B),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF2E3544)),
            tonalElevation = 8.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Move Book to Folder",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = document.title,
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8),
                            maxLines = 1
                        )
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF94A3B8))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 400.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Option: Unassigned / All Books
                    item {
                        val isSelected = document.folderId == null
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isSelected) Color(0xFF312E81) else Color(0xFF131720))
                                .border(
                                    1.dp,
                                    if (isSelected) Color(0xFF6366F1) else Color(0xFF242A38),
                                    RoundedCornerShape(12.dp)
                                )
                                .clickable {
                                    onSelectFolder(null)
                                    onDismiss()
                                }
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFF334155)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("📁", fontSize = 18.sp)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = "Unassigned / All Books",
                                fontSize = 14.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color(0xFFEEF2FF) else Color(0xFFCBD5E1),
                                modifier = Modifier.weight(1f)
                            )
                            if (isSelected) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = "Selected",
                                    tint = Color(0xFF818CF8),
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }

                    // Existing Folders & Subfolders
                    items(organizedFolders, key = { it.first.id }) { (folder, parent) ->
                        val isSelected = document.folderId == folder.id
                        val isSubfolder = parent != null
                        val icon = FolderIconsCatalog.findIcon(folder.iconKey)
                        val folderColor = try {
                            Color(android.graphics.Color.parseColor(folder.colorHex))
                        } catch (_: Exception) {
                            Color(0xFF4F46E5)
                        }
                        val bookCount = documents.count { it.folderId == folder.id }

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(start = if (isSubfolder) 20.dp else 0.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isSelected) Color(0xFF312E81) else Color(0xFF131720))
                                .border(
                                    1.dp,
                                    if (isSelected) Color(0xFF6366F1) else Color(0xFF242A38),
                                    RoundedCornerShape(12.dp)
                                )
                                .clickable {
                                    onSelectFolder(folder.id)
                                    onDismiss()
                                }
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (isSubfolder) {
                                Icon(
                                    imageVector = Icons.Default.SubdirectoryArrowRight,
                                    contentDescription = null,
                                    tint = Color(0xFF64748B),
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                            }

                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(folderColor.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(icon.symbol, fontSize = 18.sp)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    if (isSubfolder) {
                                        Text(
                                            text = "${parent.name} › ",
                                            fontSize = 11.sp,
                                            color = Color(0xFF94A3B8)
                                        )
                                    }
                                    Text(
                                        text = folder.name,
                                        fontSize = 14.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) Color(0xFFEEF2FF) else Color(0xFFCBD5E1)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "($bookCount ${if (bookCount == 1) "book" else "books"})",
                                        fontSize = 11.sp,
                                        color = Color(0xFF64748B)
                                    )
                                }
                            }
                            if (isSelected) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = "Selected",
                                    tint = Color(0xFF818CF8),
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
