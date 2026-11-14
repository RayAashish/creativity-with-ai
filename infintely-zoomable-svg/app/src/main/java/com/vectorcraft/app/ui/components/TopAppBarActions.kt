package com.vectorcraft.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Collections
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.ViewCarousel
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentGold
import com.vectorcraft.app.ui.theme.DarkBackdrop
import com.vectorcraft.app.ui.theme.GlassBorderSubtle
import com.vectorcraft.app.ui.theme.GlassFrostedLow
import com.vectorcraft.app.util.SamplePreset

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CurvifyTopBar(
    viewMode: ViewMode,
    onViewModeChange: (ViewMode) -> Unit,
    onPickImage: () -> Unit,
    onSelectSample: (SamplePreset) -> Unit,
    onSaveToDownloads: () -> Unit,
    onShareSvg: () -> Unit,
    onToggleControls: () -> Unit,
    isControlsOpen: Boolean,
    onToggleStudio: () -> Unit,
    isStudioOpen: Boolean,
    onToggleManual: () -> Unit
) {
    var showMenu by remember { mutableStateOf(false) }

    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(end = 4.dp)
            ) {
                // Sleek glowing geometric brand badge
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            Brush.linearGradient(listOf(AccentCyan, AccentGold))
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "C",
                        color = Color.Black,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                Column {
                    Text(
                        text = "Curvify",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 17.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "PRECISION STUDIO",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AccentCyan,
                        letterSpacing = 1.2.sp,
                        maxLines = 1
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = DarkBackdrop
        ),
        actions = {
            // View Mode Toggle
            IconButton(
                onClick = {
                    val nextMode = when (viewMode) {
                        ViewMode.SPLIT_SLIDER -> ViewMode.VECTOR_ONLY
                        ViewMode.VECTOR_ONLY -> ViewMode.ORIGINAL_ONLY
                        ViewMode.ORIGINAL_ONLY -> ViewMode.SPLIT_SLIDER
                    }
                    onViewModeChange(nextMode)
                },
                modifier = Modifier.size(38.dp)
            ) {
                Icon(
                    imageVector = when (viewMode) {
                        ViewMode.SPLIT_SLIDER -> Icons.Default.ViewCarousel
                        ViewMode.VECTOR_ONLY -> Icons.Default.Visibility
                        ViewMode.ORIGINAL_ONLY -> Icons.Default.Image
                    },
                    contentDescription = "Switch View Mode",
                    tint = AccentCyan,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Pick Image
            IconButton(
                onClick = onPickImage,
                modifier = Modifier.size(38.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Collections,
                    contentDescription = "Pick Image",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            // SVG Studio Viewer & Code Inspector
            IconButton(
                onClick = onToggleStudio,
                modifier = Modifier.size(38.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Code,
                    contentDescription = "SVG Studio & Code",
                    tint = if (isStudioOpen) AccentGold else Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Quick Download to Scoped Storage
            IconButton(
                onClick = onSaveToDownloads,
                modifier = Modifier.size(38.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Download,
                    contentDescription = "Export SVG",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Share Sheet
            IconButton(
                onClick = onShareSvg,
                modifier = Modifier.size(38.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = "Share SVG",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Tuning Sliders Drawer
            IconButton(
                onClick = onToggleControls,
                modifier = Modifier.size(38.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Tune,
                    contentDescription = "Tuning Parameters",
                    tint = if (isControlsOpen) AccentCyan else Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Overflow Menu
            IconButton(
                onClick = { showMenu = true },
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.MoreVert,
                    contentDescription = "More Options",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            DropdownMenu(
                expanded = showMenu,
                onDismissRequest = { showMenu = false }
            ) {
                DropdownMenuItem(
                    text = { Text("📖 Mastery Manual (Guide)") },
                    onClick = {
                        showMenu = false
                        onToggleManual()
                    }
                )
                DropdownMenuItem(
                    text = { Text("👾 Preset: Pixel Art Hero") },
                    onClick = {
                        showMenu = false
                        onSelectSample(SamplePreset.PIXEL_ART)
                    }
                )
                DropdownMenuItem(
                    text = { Text("📐 Preset: Geometric Emblem") },
                    onClick = {
                        showMenu = false
                        onSelectSample(SamplePreset.LOGO)
                    }
                )
                DropdownMenuItem(
                    text = { Text("🌅 Preset: Sunset Landscape") },
                    onClick = {
                        showMenu = false
                        onSelectSample(SamplePreset.PHOTO)
                    }
                )
            }
        }
    )
}
