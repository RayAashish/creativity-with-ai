package com.readmaster.app.ui.dialogs

import android.graphics.Color as AndroidColor
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ColorPickerDialog(
    initialColor: Int,
    onColorSelected: (Int) -> Unit,
    onDismiss: () -> Unit
) {
    var selectedColor by remember { mutableIntStateOf(initialColor) }
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Palette Grid, 1: Spectrum / RGB Sliders

    // Extract RGB from selectedColor
    var r by remember(selectedColor) { mutableFloatStateOf(AndroidColor.red(selectedColor).toFloat()) }
    var g by remember(selectedColor) { mutableFloatStateOf(AndroidColor.green(selectedColor).toFloat()) }
    var b by remember(selectedColor) { mutableFloatStateOf(AndroidColor.blue(selectedColor).toFloat()) }

    // Curated rich color grid (Shades across spectrum + Grayscale)
    val colorGrid = listOf(
        // Row 1: Bright Primaries
        listOf("#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#111827"),
        // Row 2: Deep / Rich Shades
        listOf("#DC2626", "#EA580C", "#D97706", "#059669", "#0891B2", "#2563EB", "#4F46E5", "#7C3AED", "#DB2777", "#374151"),
        // Row 3: Dark / Executive Tones
        listOf("#991B1B", "#9A3412", "#B45309", "#065F46", "#155E75", "#1E40AF", "#3730A3", "#5B21B6", "#9D174D", "#4B5563"),
        // Row 4: Pastel / Soft Tones
        listOf("#FCA5A5", "#FDBA74", "#FDE047", "#86EFAC", "#67E8F9", "#93C5FD", "#A5B4FC", "#C4B5FD", "#F9A8D4", "#9CA3AF"),
        // Row 5: Earth & Study Essentials
        listOf("#78350F", "#92400E", "#854D0E", "#3F6212", "#134E4A", "#1E3A8A", "#2E1065", "#701A75", "#831843", "#D1D5DB"),
        // Row 6: Grayscale Ramp (White to Pitch Black)
        listOf("#FFFFFF", "#F9FAFB", "#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563", "#1F2937", "#000000")
    )

    // Hue gradient colors for the spectrum slider
    val hueColors = listOf(
        Color.Red,
        Color.Yellow,
        Color.Green,
        Color.Cyan,
        Color.Blue,
        Color.Magenta,
        Color.Red
    )

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = Color(0xFF1E222B),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF2E3544)),
            tonalElevation = 10.dp,
            shadowElevation = 16.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(Color(selectedColor))
                                .border(2.dp, Color.White, CircleShape)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Color Studio",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            val hexString = String.format("#%06X", (0xFFFFFF and selectedColor))
                            Text(
                                text = hexString,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFF94A3B8)
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF94A3B8))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Tabs: Palette Grid vs Spectrum / RGB
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color(0xFF0F1218),
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFF242A38), RoundedCornerShape(12.dp))
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = {
                            Text(
                                text = "Palette Grid",
                                fontSize = 13.sp,
                                fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Medium,
                                color = if (selectedTab == 0) Color(0xFF818CF8) else Color(0xFF94A3B8)
                            )
                        }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = {
                            Text(
                                text = "RGB Spectrum",
                                fontSize = 13.sp,
                                fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Medium,
                                color = if (selectedTab == 1) Color(0xFF818CF8) else Color(0xFF94A3B8)
                            )
                        }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (selectedTab == 0) {
                    // TAB 0: Extended Palette Grid
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        colorGrid.forEach { row ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                row.forEach { hex ->
                                    val parsed = AndroidColor.parseColor(hex)
                                    val isSelected = selectedColor == parsed
                                    Box(
                                        modifier = Modifier
                                            .size(28.dp)
                                            .clip(CircleShape)
                                            .background(Color(parsed))
                                            .border(
                                                width = if (isSelected) 3.dp else 0.5.dp,
                                                color = if (isSelected) Color.White else Color(0x33FFFFFF),
                                                shape = CircleShape
                                            )
                                            .clickable {
                                                selectedColor = parsed
                                                r = AndroidColor.red(parsed).toFloat()
                                                g = AndroidColor.green(parsed).toFloat()
                                                b = AndroidColor.blue(parsed).toFloat()
                                            },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (isSelected) {
                                            Icon(
                                                imageVector = Icons.Default.Check,
                                                contentDescription = null,
                                                tint = if (parsed == AndroidColor.WHITE || hex == "#FFFFFF" || hex.startsWith("#F")) Color.Black else Color.White,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // TAB 1: Live RGB / Spectrum Sliders
                    Column(modifier = Modifier.fillMaxWidth()) {
                        // Continuous Spectrum Bar Preview
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(22.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Brush.horizontalGradient(hueColors))
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Red Slider
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("R", fontWeight = FontWeight.Bold, color = Color(0xFFEF4444), modifier = Modifier.width(20.dp))
                            Slider(
                                value = r,
                                onValueChange = {
                                    r = it
                                    selectedColor = AndroidColor.rgb(r.toInt(), g.toInt(), b.toInt())
                                },
                                valueRange = 0f..255f,
                                modifier = Modifier.weight(1f),
                                colors = SliderDefaults.colors(thumbColor = Color(0xFFEF4444), activeTrackColor = Color(0xFFEF4444))
                            )
                            Text("${r.toInt()}", fontSize = 12.sp, color = Color.White, modifier = Modifier.width(32.dp), fontFamily = FontFamily.Monospace)
                        }

                        // Green Slider
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("G", fontWeight = FontWeight.Bold, color = Color(0xFF10B981), modifier = Modifier.width(20.dp))
                            Slider(
                                value = g,
                                onValueChange = {
                                    g = it
                                    selectedColor = AndroidColor.rgb(r.toInt(), g.toInt(), b.toInt())
                                },
                                valueRange = 0f..255f,
                                modifier = Modifier.weight(1f),
                                colors = SliderDefaults.colors(thumbColor = Color(0xFF10B981), activeTrackColor = Color(0xFF10B981))
                            )
                            Text("${g.toInt()}", fontSize = 12.sp, color = Color.White, modifier = Modifier.width(32.dp), fontFamily = FontFamily.Monospace)
                        }

                        // Blue Slider
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("B", fontWeight = FontWeight.Bold, color = Color(0xFF3B82F6), modifier = Modifier.width(20.dp))
                            Slider(
                                value = b,
                                onValueChange = {
                                    b = it
                                    selectedColor = AndroidColor.rgb(r.toInt(), g.toInt(), b.toInt())
                                },
                                valueRange = 0f..255f,
                                modifier = Modifier.weight(1f),
                                colors = SliderDefaults.colors(thumbColor = Color(0xFF3B82F6), activeTrackColor = Color(0xFF3B82F6))
                            )
                            Text("${b.toInt()}", fontSize = 12.sp, color = Color.White, modifier = Modifier.width(32.dp), fontFamily = FontFamily.Monospace)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = Color(0xFF94A3B8))
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            onColorSelected(selectedColor)
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Apply Color", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
