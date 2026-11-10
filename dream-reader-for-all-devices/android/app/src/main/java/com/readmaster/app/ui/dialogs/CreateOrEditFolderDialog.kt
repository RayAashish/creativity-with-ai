package com.readmaster.app.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import com.readmaster.app.data.model.FolderEntity
import com.readmaster.app.data.model.FolderIconsCatalog
import java.util.UUID

@Composable
fun CreateOrEditFolderDialog(
    initialFolder: FolderEntity? = null,
    parentFolder: FolderEntity? = null,
    onSaveFolder: (FolderEntity) -> Unit,
    onDeleteFolder: ((FolderEntity) -> Unit)? = null,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf(initialFolder?.name ?: "") }
    var selectedIconKey by remember {
        mutableStateOf(
            initialFolder?.iconKey
                ?: (if (parentFolder?.name?.contains("Java", ignoreCase = true) == true) "jdbc"
                else if (parentFolder?.name?.contains("Spring", ignoreCase = true) == true) "spring_core"
                else "personal_dev")
        )
    }
    var selectedColorHex by remember {
        mutableStateOf(initialFolder?.colorHex ?: parentFolder?.colorHex ?: "#4F46E5")
    }
    var selectedCategory by remember { mutableStateOf("All") }
    var showDeleteConfirmDialog by remember { mutableStateOf(false) }

    // Smart context-aware presets based on parent folder
    val presetNames = remember(parentFolder) {
        val parentName = parentFolder?.name?.lowercase() ?: ""
        when {
            parentName.contains("java") -> listOf(
                "JDBC" to "jdbc",
                "Multithreading" to "multithreading",
                "Exception Handling" to "exception_handling",
                "Networking" to "networking_sockets",
                "Collections & Streams" to "collections",
                "JVM Internals" to "jvm_internals"
            )
            parentName.contains("spring") -> listOf(
                "Spring Core" to "spring_core",
                "Data JPA" to "spring_jpa",
                "Security" to "spring_security",
                "AOP" to "spring_aop",
                "Microservices" to "microservices",
                "REST APIs" to "api_rest"
            )
            parentName.contains("system") || parentName.contains("design") -> listOf(
                "HLD" to "hld",
                "LLD" to "lld",
                "Microservices" to "microservices",
                "Distributed Systems" to "distributed_systems",
                "Databases & Cache" to "database_sql",
                "Kafka & Queues" to "kafka"
            )
            else -> listOf(
                "Personal Development" to "personal_dev",
                "Spring Boot" to "spring_boot",
                "Java" to "java",
                "System Design" to "system_design",
                "DSA & Algorithms" to "dsa",
                "Machine Learning" to "machine_learning"
            )
        }
    }

    val colorOptions = listOf(
        "#4F46E5", // Indigo
        "#10B981", // Emerald
        "#EA580C", // Orange
        "#22C55E", // Green
        "#3B82F6", // Blue
        "#8B5CF6", // Violet
        "#EC4899", // Pink
        "#06B6D4", // Cyan
        "#EF4444", // Red
        "#F59E0B"  // Amber
    )

    val filteredIcons = remember(selectedCategory) {
        if (selectedCategory == "All") {
            FolderIconsCatalog.allIcons
        } else {
            FolderIconsCatalog.allIcons.filter { it.category == selectedCategory }
        }
    }

    val currentIcon = FolderIconsCatalog.findIcon(selectedIconKey)

    if (showDeleteConfirmDialog && initialFolder != null) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirmDialog = false },
            title = { Text("Delete Folder?", fontWeight = FontWeight.Bold) },
            text = {
                Text("Are you sure you want to delete \"${initialFolder.name}\"? Any books inside will be kept in the parent folder or unassigned.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteConfirmDialog = false
                        onDeleteFolder?.invoke(initialFolder)
                        onDismiss()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626))
                ) {
                    Text("Delete", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirmDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = Color(0xFF1E222B),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF2E3544)),
            tonalElevation = 8.dp,
            shadowElevation = 16.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 6.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // Live Logo Preview
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(android.graphics.Color.parseColor(selectedColorHex))),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = currentIcon.symbol,
                                fontSize = 22.sp
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = when {
                                    initialFolder != null -> "Edit Folder"
                                    parentFolder != null -> "New Subfolder"
                                    else -> "New Study Folder"
                                },
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = if (parentFolder != null) "Inside: ${parentFolder.name}" else "${FolderIconsCatalog.allIcons.size}+ Curated Tech Logos",
                                fontSize = 11.sp,
                                color = if (parentFolder != null) Color(0xFF818CF8) else Color(0xFF94A3B8)
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF94A3B8))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Folder Name Input
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text(if (parentFolder != null) "Subfolder Name" else "Folder Name", color = Color(0xFF94A3B8)) },
                    placeholder = {
                        Text(
                            text = if (parentFolder != null) "e.g. Multithreading, JDBC, Data JPA" else "e.g. System Design, Spring Boot, Java",
                            color = Color(0xFF64748B)
                        )
                    },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFF6366F1),
                        unfocusedBorderColor = Color(0xFF475569)
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Quick Preset Pills
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    presetNames.forEach { (presetName, iconKey) ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0xFF0F1218))
                                .border(1.dp, Color(0xFF242A38), RoundedCornerShape(16.dp))
                                .clickable {
                                    name = presetName
                                    selectedIconKey = iconKey
                                    val icon = FolderIconsCatalog.findIcon(iconKey)
                                    selectedColorHex = icon.defaultColor
                                }
                                .padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = "+ $presetName",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF818CF8)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Color Picker Row
                Text(
                    text = "Folder Color",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF94A3B8)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    colorOptions.forEach { hex ->
                        val parsed = android.graphics.Color.parseColor(hex)
                        val isSelected = selectedColorHex.equals(hex, ignoreCase = true)
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(Color(parsed))
                                .border(
                                    width = if (isSelected) 3.dp else 0.dp,
                                    color = if (isSelected) Color.White else Color.Transparent,
                                    shape = CircleShape
                                )
                                .clickable { selectedColorHex = hex }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Icon Category Filter Chips
                Text(
                    text = "Select Logo / Badge (${filteredIcons.size} available)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF94A3B8)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    FolderIconsCatalog.categories.forEach { cat ->
                        val isSelected = selectedCategory == cat
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(
                                    if (isSelected) Color(0xFF4F46E5) else Color(0xFF0F1218)
                                )
                                .border(
                                    1.dp,
                                    if (isSelected) Color(0xFF6366F1) else Color(0xFF242A38),
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable { selectedCategory = cat }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = cat,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else Color(0xFF94A3B8)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // 100+ Icons Grid
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 64.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 200.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(filteredIcons, key = { it.key }) { iconItem ->
                        val isSelected = selectedIconKey == iconItem.key
                        Column(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    if (isSelected) Color(0xFF312E81) else Color(0xFF131720)
                                )
                                .border(
                                    width = if (isSelected) 1.5.dp else 1.dp,
                                    color = if (isSelected) Color(0xFF818CF8) else Color(0xFF242A38),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                .clickable {
                                    selectedIconKey = iconItem.key
                                    selectedColorHex = iconItem.defaultColor
                                }
                                .padding(vertical = 8.dp, horizontal = 4.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = iconItem.symbol, fontSize = 22.sp)
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = iconItem.label,
                                fontSize = 9.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                maxLines = 1,
                                color = if (isSelected) Color(0xFFEEF2FF) else Color(0xFF94A3B8)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Actions: Delete Button on left if editing, Cancel & Save on right
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    if (initialFolder != null && onDeleteFolder != null) {
                        OutlinedButton(
                            onClick = { showDeleteConfirmDialog = true },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFEF4444)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Delete, contentDescription = "Delete", modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Delete Folder", fontSize = 12.sp)
                        }
                    } else {
                        Spacer(modifier = Modifier.width(1.dp))
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        TextButton(onClick = onDismiss) {
                            Text("Cancel", color = Color(0xFF94A3B8))
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                if (name.isNotBlank()) {
                                    val folder = initialFolder?.copy(
                                        name = name.trim(),
                                        iconKey = selectedIconKey,
                                        colorHex = selectedColorHex
                                    ) ?: FolderEntity(
                                        id = UUID.randomUUID().toString(),
                                        name = name.trim(),
                                        iconKey = selectedIconKey,
                                        colorHex = selectedColorHex,
                                        parentFolderId = parentFolder?.id
                                    )
                                    onSaveFolder(folder)
                                    onDismiss()
                                }
                            },
                            enabled = name.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(
                                text = if (initialFolder == null) "Create Folder" else "Save Changes",
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
