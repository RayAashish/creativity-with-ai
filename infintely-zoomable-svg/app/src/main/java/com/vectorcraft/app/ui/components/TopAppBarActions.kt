package com.vectorcraft.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.MenuBook
import androidx.compose.material.icons.rounded.AddPhotoAlternate
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.MoreVert
import androidx.compose.material.icons.rounded.Palette
import androidx.compose.material.icons.rounded.Polyline
import androidx.compose.material.icons.rounded.Share
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vectorcraft.app.ui.theme.AccentAmber
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentCyanMuted
import com.vectorcraft.app.ui.theme.GlassBorder
import com.vectorcraft.app.ui.theme.ObsidianBg
import com.vectorcraft.app.ui.theme.ObsidianCard
import com.vectorcraft.app.ui.theme.ObsidianElevated
import com.vectorcraft.app.ui.theme.ObsidianSurface
import com.vectorcraft.app.ui.theme.TextPrimary
import com.vectorcraft.app.ui.theme.TextSecondary
import com.vectorcraft.app.util.SamplePreset

@Composable
fun VectorForgeTopBar(
    hasSvg: Boolean,
    isWireframe: Boolean,
    backgroundStyle: BackgroundStyle,
    onImportImage: () -> Unit,
    onExportSvg: () -> Unit,
    onShareSvg: () -> Unit,
    onLoadSample: (SamplePreset) -> Unit,
    onToggleWireframe: () -> Unit,
    onBackgroundStyleChange: (BackgroundStyle) -> Unit,
    onOpenManual: () -> Unit,
    modifier: Modifier = Modifier
) {
    var menuExpanded by remember { mutableStateOf(false) }

    Surface(
        color = ObsidianSurface,
        modifier = modifier.fillMaxWidth()
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Brand Mark + Wordmark (never wraps!)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    VectorForgeBrandMark(modifier = Modifier.size(32.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "VectorForge",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "RUST GRADIENT MOSAIC",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.SemiBold,
                            letterSpacing = 0.8.sp,
                            color = AccentCyan,
                            maxLines = 1
                        )
                    }
                }

                // Primary Actions
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Open Photo Pill
                    Surface(
                        color = ObsidianElevated,
                        shape = RoundedCornerShape(50),
                        border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder),
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .clickable(onClick = onImportImage)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.AddPhotoAlternate,
                                contentDescription = "Open Photo",
                                tint = AccentCyan,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Open",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                        }
                    }

                    // Export SVG Pill
                    Surface(
                        color = if (hasSvg) AccentCyanMuted else ObsidianCard,
                        shape = RoundedCornerShape(50),
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (hasSvg) AccentCyan.copy(alpha = 0.7f) else GlassBorder
                        ),
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .clickable(enabled = hasSvg, onClick = onExportSvg)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Download,
                                contentDescription = "Save SVG",
                                tint = if (hasSvg) AccentCyan else TextSecondary,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Save",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (hasSvg) AccentCyan else TextSecondary
                            )
                        }
                    }

                    // Overflow Menu (Samples, Backdrop, Share, Guide)
                    Box {
                        IconButton(
                            onClick = { menuExpanded = true },
                            modifier = Modifier.size(34.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.MoreVert,
                                contentDescription = "Studio Options",
                                tint = TextSecondary,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        DropdownMenu(
                            expanded = menuExpanded,
                            onDismissRequest = { menuExpanded = false },
                            modifier = Modifier.background(ObsidianCard)
                        ) {
                            Text(
                                text = "SHOWCASE SCENES",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.8.sp,
                                color = AccentCyan,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                            )
                            SamplePreset.entries.forEach { preset ->
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text(preset.title, color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                            Text(preset.subtitle, color = TextSecondary, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                        }
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Rounded.AutoAwesome, null, tint = AccentAmber, modifier = Modifier.size(18.dp))
                                    },
                                    onClick = {
                                        menuExpanded = false
                                        onLoadSample(preset)
                                    }
                                )
                            }

                            HorizontalDivider(color = GlassBorder)

                            DropdownMenuItem(
                                text = { Text("Wireframe Outlines", color = TextPrimary, fontSize = 13.sp) },
                                leadingIcon = { Icon(Icons.Rounded.Polyline, null, tint = if (isWireframe) AccentCyan else TextSecondary) },
                                trailingIcon = { if (isWireframe) Icon(Icons.Rounded.Check, null, tint = AccentCyan, modifier = Modifier.size(16.dp)) },
                                onClick = {
                                    menuExpanded = false
                                    onToggleWireframe()
                                }
                            )

                            if (hasSvg) {
                                DropdownMenuItem(
                                    text = { Text("Share SVG File", color = TextPrimary, fontSize = 13.sp) },
                                    leadingIcon = { Icon(Icons.Rounded.Share, null, tint = AccentCyan) },
                                    onClick = {
                                        menuExpanded = false
                                        onShareSvg()
                                    }
                                )
                            }

                            HorizontalDivider(color = GlassBorder)

                            Text(
                                text = "CANVAS BACKDROP",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.8.sp,
                                color = AccentCyan,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                            )
                            BackgroundStyle.entries.forEach { bg ->
                                DropdownMenuItem(
                                    text = { Text(bg.displayName, color = TextPrimary, fontSize = 13.sp) },
                                    leadingIcon = {
                                        Icon(Icons.Rounded.Palette, null, tint = if (backgroundStyle == bg) AccentCyan else TextSecondary, modifier = Modifier.size(18.dp))
                                    },
                                    trailingIcon = {
                                        if (backgroundStyle == bg) Icon(Icons.Rounded.Check, null, tint = AccentCyan, modifier = Modifier.size(16.dp))
                                    },
                                    onClick = {
                                        menuExpanded = false
                                        onBackgroundStyleChange(bg)
                                    }
                                )
                            }

                            HorizontalDivider(color = GlassBorder)

                            DropdownMenuItem(
                                text = { Text("Engine & Gesture Guide", color = TextPrimary, fontSize = 13.sp) },
                                leadingIcon = { Icon(Icons.AutoMirrored.Rounded.MenuBook, null, tint = AccentAmber) },
                                onClick = {
                                    menuExpanded = false
                                    onOpenManual()
                                }
                            )
                        }
                    }
                }
            }
            HorizontalDivider(color = GlassBorder)
        }
    }
}

@Composable
fun VectorForgeBrandMark(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(9.dp))
            .background(ObsidianBg)
            .border(1.dp, AccentCyan.copy(alpha = 0.5f), RoundedCornerShape(9.dp)),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(22.dp)) {
            val w = size.width
            val h = size.height
            val curve = Path().apply {
                moveTo(w * 0.14f, h * 0.78f)
                cubicTo(w * 0.36f, h * 0.78f, w * 0.42f, h * 0.50f, w * 0.50f, h * 0.50f)
                cubicTo(w * 0.58f, h * 0.50f, w * 0.64f, h * 0.22f, w * 0.86f, h * 0.22f)
            }
            drawPath(
                path = curve,
                brush = Brush.linearGradient(listOf(AccentCyan, AccentAmber)),
                style = Stroke(width = 2.6.dp.toPx(), cap = StrokeCap.Round)
            )
            drawCircle(color = AccentCyan, radius = 2.4.dp.toPx(), center = Offset(w * 0.16f, h * 0.76f))
            drawCircle(color = AccentAmber, radius = 2.4.dp.toPx(), center = Offset(w * 0.84f, h * 0.24f))
        }
    }
}
