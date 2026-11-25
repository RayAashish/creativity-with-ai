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
fun VectorForgeTopBar(
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
                // High-precision glowing VectorForge emblem
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(9.dp))
                        .background(
                            Brush.linearGradient(
                                listOf(
                                    Color(0xFF0F172A),
                                    Color(0xFF1E293B)
                                )
                            )
                        )
                        .border(
                            1.2.dp,
                            Brush.linearGradient(listOf(AccentCyan, AccentGold)),
                            RoundedCornerShape(9.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    // Stylized glowing Forge Diamond Vector Anchor
                    Text(
                        text = "❖",
                        color = AccentCyan,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.width(9.dp))

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "VectorForge",
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White,
                            fontSize = 17.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(AccentCyan.copy(alpha = 0.15f))
                                .border(0.5.dp, AccentCyan.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
                                .padding(horizontal = 4.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "PRO",
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Black,
                                color = AccentCyan
                            )
                        }
                    }
                    Text(
                        text = "HIGH-FIDELITY VECTOR CORE",
                        fontSize = 8.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AccentGold,
                        letterSpacing = 1.1.sp,
                        maxLines = 1
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = DarkBackdrop
        ),
        actions = {
            // 1. View Mode Toggle (Split / Vector / Original)
            IconButton(
                onClick = {
                    val nextMode = when (viewMode) {
                        ViewMode.SPLIT_SLIDER -> ViewMode.VECTOR_ONLY
                        ViewMode.VECTOR_ONLY -> ViewMode.ORIGINAL_ONLY
                        ViewMode.ORIGINAL_ONLY -> ViewMode.SPLIT_SLIDER
                    }
                    onViewModeChange(nextMode)
                },
                modifier = Modifier.size(36.dp)
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

            // 2. Pick Image from Gallery
            IconButton(
                onClick = onPickImage,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Collections,
                    contentDescription = "Pick Image",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            // 3. Quick Download to Scoped Storage
            IconButton(
                onClick = onSaveToDownloads,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Download,
                    contentDescription = "Export SVG",
                    tint = AccentGold,
                    modifier = Modifier.size(20.dp)
                )
            }

            // 4. Sliders Drawer Toggle
            IconButton(
                onClick = onToggleControls,
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Tune,
                    contentDescription = "Tuning Sliders",
                    tint = if (isControlsOpen) AccentCyan else Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            // 5. Overflow Menu (Studio, Share, Presets, Manual)
            Box {
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
                    onDismissRequest = { showMenu = false },
                    modifier = Modifier.background(DarkBackdrop)
                ) {
                    DropdownMenuItem(
                        text = { Text("SVG Studio & Code", color = Color.White) },
                        leadingIcon = { Icon(Icons.Default.Code, contentDescription = null, tint = AccentCyan) },
                        onClick = {
                            showMenu = false
                            onToggleStudio()
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Share SVG Export", color = Color.White) },
                        leadingIcon = { Icon(Icons.Default.Share, contentDescription = null, tint = AccentCyan) },
                        onClick = {
                            showMenu = false
                            onShareSvg()
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("👤 Preset: Portrait (High-Fidelity)", color = Color.White) },
                        onClick = {
                            showMenu = false
                            onSelectSample(SamplePreset.PORTRAIT)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("🌅 Preset: Sunset Landscape", color = Color.White) },
                        onClick = {
                            showMenu = false
                            onSelectSample(SamplePreset.PHOTO)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("📐 Preset: Geometric Logo", color = Color.White) },
                        onClick = {
                            showMenu = false
                            onSelectSample(SamplePreset.LOGO)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("👾 Preset: Pixel Art Sprite", color = Color.White) },
                        onClick = {
                            showMenu = false
                            onSelectSample(SamplePreset.PIXEL_ART)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("📖 Mastery Manual (Guide)", color = Color.White) },
                        leadingIcon = { Icon(Icons.Default.HelpOutline, contentDescription = null, tint = AccentGold) },
                        onClick = {
                            showMenu = false
                            onToggleManual()
                        }
                    )
                }
            }
        }
    )
}
