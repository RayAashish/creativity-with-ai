package com.antigravity.note.ui.icon

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
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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

@Composable
fun IconPickerDialog(
    initialIconKey: String?,
    targetName: String,
    onIconSelected: (String) -> Unit,
    onDismissRequest: () -> Unit
) {
    var selectedKey by remember {
        mutableStateOf(initialIconKey ?: IconCatalog.suggestIcon(targetName).key)
    }
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }

    var customEmoji by remember {
        mutableStateOf(if (selectedKey.startsWith("emoji:")) selectedKey.removePrefix("emoji:") else "☕")
    }
    var customBadgeText by remember {
        mutableStateOf(if (selectedKey.startsWith("badge:")) selectedKey.substringAfter(":").substringBefore(":") else "JAVA")
    }
    var customBadgeColorHex by remember {
        mutableStateOf(if (selectedKey.startsWith("badge:")) selectedKey.substringAfterLast(":") else "#E65100")
    }

    val categories = listOf("All", "Languages", "Core CS", "Frameworks", "General", "Emoji", "Custom Badge")

    val popularEmojis = listOf(
        "☕", "🍃", "💻", "🌲", "🕸️", "▦", "🔁", "🔀", "🗄️", "🌐",
        "🧠", "📐", "🚀", "📚", "💡", "🔥", "🏆", "🔢", "⚡", "🦀"
    )

    val badgeColors = listOf(
        "#005AC1" to "Blue",
        "#E65100" to "Orange",
        "#2E7D32" to "Green",
        "#512DA8" to "Purple",
        "#C62828" to "Red",
        "#00695C" to "Teal",
        "#455A64" to "Slate"
    )

    val filteredIcons = remember(searchQuery, selectedCategory) {
        IconCatalog.ALL_ICONS.filter { icon ->
            val matchesCategory = selectedCategory == "All" || icon.category.equals(selectedCategory, ignoreCase = true)
            val matchesSearch = searchQuery.isBlank() ||
                    icon.displayName.contains(searchQuery, ignoreCase = true) ||
                    icon.badgeLabel.contains(searchQuery, ignoreCase = true) ||
                    icon.key.contains(searchQuery, ignoreCase = true)
            matchesCategory && matchesSearch
        }
    }

    Dialog(onDismissRequest = onDismissRequest) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp,
            modifier = Modifier
                .width(580.dp)
                .height(640.dp)
                .padding(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Choose Subject / Topic Logo",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "For \"$targetName\"",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(onClick = onDismissRequest) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Search Bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search logo (e.g. Java, Tree, Spring, OS)") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Category Filter Ribbon
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    categories.forEach { cat ->
                        FilterChip(
                            selected = selectedCategory == cat,
                            onClick = { selectedCategory = cat },
                            label = { Text(cat, fontSize = 12.sp) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Main Content Area based on selected category
                Box(modifier = Modifier.weight(1f)) {
                    when (selectedCategory) {
                        "Emoji" -> {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(8.dp),
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Text(
                                    text = "Select or type an Emoji for this topic:",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold
                                )

                                OutlinedTextField(
                                    value = customEmoji,
                                    onValueChange = {
                                        customEmoji = it
                                        if (it.isNotBlank()) selectedKey = "emoji:$it"
                                    },
                                    label = { Text("Emoji") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Text(text = "Popular Quick Emojis:", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                LazyVerticalGrid(
                                    columns = GridCells.Fixed(5),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    items(popularEmojis) { emoji ->
                                        Surface(
                                            shape = RoundedCornerShape(12.dp),
                                            color = if (selectedKey == "emoji:$emoji") MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                            border = if (selectedKey == "emoji:$emoji") androidx.compose.foundation.BorderStroke(2.dp, MaterialTheme.colorScheme.primary) else null,
                                            modifier = Modifier
                                                .clickable {
                                                    customEmoji = emoji
                                                    selectedKey = "emoji:$emoji"
                                                }
                                                .height(54.dp)
                                        ) {
                                            Box(contentAlignment = Alignment.Center) {
                                                Text(text = emoji, fontSize = 24.sp)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        "Custom Badge" -> {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(8.dp),
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Text(
                                    text = "Create a custom 2-4 letter badge capsule:",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold
                                )

                                OutlinedTextField(
                                    value = customBadgeText,
                                    onValueChange = {
                                        val text = it.uppercase().take(6)
                                        customBadgeText = text
                                        selectedKey = "badge:$text:$customBadgeColorHex"
                                    },
                                    label = { Text("Badge Label (e.g. AI, ML, GO, REST)") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Text(text = "Choose Badge Color:", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    badgeColors.forEach { (hex, _) ->
                                        val color = Color(android.graphics.Color.parseColor(hex))
                                        val isSelected = customBadgeColorHex.equals(hex, ignoreCase = true)
                                        Box(
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(CircleShape)
                                                .background(color)
                                                .clickable {
                                                    customBadgeColorHex = hex
                                                    selectedKey = "badge:$customBadgeText:$hex"
                                                }
                                                .border(
                                                    width = if (isSelected) 3.dp else 1.dp,
                                                    color = if (isSelected) MaterialTheme.colorScheme.onSurface else Color.Transparent,
                                                    shape = CircleShape
                                                ),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            if (isSelected) {
                                                Icon(
                                                    imageVector = Icons.Default.Check,
                                                    contentDescription = null,
                                                    tint = Color.White,
                                                    modifier = Modifier.size(18.dp)
                                                )
                                            }
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))
                                Text(text = "Preview:", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = Color(android.graphics.Color.parseColor(customBadgeColorHex)).copy(alpha = 0.16f)
                                ) {
                                    Text(
                                        text = customBadgeText.ifBlank { "BADGE" },
                                        color = Color(android.graphics.Color.parseColor(customBadgeColorHex)),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                        else -> {
                            LazyVerticalGrid(
                                columns = GridCells.Fixed(3),
                                contentPadding = PaddingValues(4.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                items(filteredIcons) { item ->
                                    val isSelected = selectedKey == item.key
                                    val itemColor = Color(item.primaryColor)
                                    val itemBg = Color(item.containerColor)

                                    Card(
                                        shape = RoundedCornerShape(14.dp),
                                        colors = CardDefaults.cardColors(
                                            containerColor = if (isSelected) itemBg else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                        ),
                                        border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, itemColor) else null,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable { selectedKey = item.key }
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(10.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(40.dp)
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(itemBg),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    imageVector = item.iconVector,
                                                    contentDescription = item.displayName,
                                                    tint = itemColor,
                                                    modifier = Modifier.size(24.dp)
                                                )
                                            }

                                            Surface(
                                                shape = RoundedCornerShape(4.dp),
                                                color = itemColor.copy(alpha = 0.16f)
                                            ) {
                                                Text(
                                                    text = item.badgeLabel,
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = itemColor,
                                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                                                )
                                            }

                                            Text(
                                                text = item.displayName,
                                                fontSize = 11.sp,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                color = MaterialTheme.colorScheme.onSurface,
                                                maxLines = 1
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Bottom Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(onClick = onDismissRequest) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Button(
                        onClick = {
                            onIconSelected(selectedKey)
                            onDismissRequest()
                        }
                    ) {
                        Text("Select Logo")
                    }
                }
            }
        }
    }
}
