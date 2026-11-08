package com.antigravity.note.ui.canvas

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * 133-color professional RGB palette matching the user's specification:
 * - 16 quick-access circular swatches across the top
 * - 13 columns × 9 rows matrix (12 continuous spectrum hues + 1 grayscale column)
 * - Tints (light/pastel) -> Saturated pure hues -> Deep shades -> Near-black
 * - Circular selection indicator over the currently selected color
 */
object GridColorPalette {

    val TOP_CIRCULAR_SWATCHES = listOf(
        Color(0xFF000000), // Black
        Color(0xFFFFFFFF), // White
        Color(0xFFFE0000), // Red
        Color(0xFF00FF00), // Lime
        Color(0xFF0000FE), // Blue
        Color(0xFFFFFF01), // Yellow
        Color(0xFF02FDFF), // Cyan
        Color(0xFFFF00FE), // Magenta
        Color(0xFFC0C0C0), // Silver / Light Gray
        Color(0xFF808080), // Gray
        Color(0xFF800000), // Maroon
        Color(0xFF7F8001), // Olive
        Color(0xFF008101), // Dark Green
        Color(0xFF860081), // Purple
        Color(0xFF00867F), // Teal
        Color(0xFF03037F)  // Navy
    )

    val COLOR_GRID = listOf(
        // Row 0 - Ultra-light pastel tint
        listOf(Color(0xFFFECCCB), Color(0xFFFFE5CC), Color(0xFFFFFFCB), Color(0xFFE4FFCC), Color(0xFFCDFFCC), Color(0xFFCDFFE6), Color(0xFFCDFFFF), Color(0xFFCBE5FE), Color(0xFFCCCCFE), Color(0xFFE4CCFE), Color(0xFFFECCFF), Color(0xFFFECCE5), Color(0xFFFFFFFF)),
        // Row 1 - Light pastel tint
        listOf(Color(0xFFFF999A), Color(0xFFFFCB99), Color(0xFFFEFF99), Color(0xFFCCFF9A), Color(0xFF99FF99), Color(0xFF99FFCD), Color(0xFF99FFFF), Color(0xFF99CDFF), Color(0xFF9A99FF), Color(0xFFCC99FE), Color(0xFFFF99FF), Color(0xFFFF99CB), Color(0xFFE0E0E0)),
        // Row 2 - Soft tint
        listOf(Color(0xFFFF6867), Color(0xFFFFB167), Color(0xFFFFFF67), Color(0xFFB3FF66), Color(0xFF66FF66), Color(0xFF66FEB1), Color(0xFF65FFFF), Color(0xFF66B2FE), Color(0xFF6665FE), Color(0xFFB265FF), Color(0xFFFF66FF), Color(0xFFFE66B1), Color(0xFFC0C0C0)),
        // Row 3 - Bright tint
        listOf(Color(0xFFFF3236), Color(0xFFFF9934), Color(0xFFFFFD39), Color(0xFF99FF32), Color(0xFF34FF31), Color(0xFF35FF95), Color(0xFF32FFFC), Color(0xFF318EEE), Color(0xFF3533F9), Color(0xFF9933FF), Color(0xFFFE33FF), Color(0xFFFF329A), Color(0xFFA0A0A0)),
        // Row 4 - Pure vibrant saturated hue
        listOf(Color(0xFFFE0000), Color(0xFFFF7F00), Color(0xFFFFFF01), Color(0xFF80FF00), Color(0xFF01FF00), Color(0xFF02FF82), Color(0xFF01FFFF), Color(0xFF0080FF), Color(0xFF0000FE), Color(0xFF7F00FF), Color(0xFFFF00FE), Color(0xFFFF017E), Color(0xFF808080)),
        // Row 5 - Shaded
        listOf(Color(0xFFD00000), Color(0xFFCD6702), Color(0xFFCACE00), Color(0xFF62CD03), Color(0xFF02CB00), Color(0xFF00CD67), Color(0xFF00CDCF), Color(0xFF0066CB), Color(0xFF0100CF), Color(0xFF6800CB), Color(0xFFCB02CC), Color(0xFFCE0064), Color(0xFF606060)),
        // Row 6 - Dark shade
        listOf(Color(0xFF990002), Color(0xFF994B00), Color(0xFF999A00), Color(0xFF4D9A00), Color(0xFF009A00), Color(0xFF00984D), Color(0xFF009899), Color(0xFF004C97), Color(0xFF000098), Color(0xFF4C0099), Color(0xFF990099), Color(0xFF98004B), Color(0xFF404040)),
        // Row 7 - Deep shade
        listOf(Color(0xFF660002), Color(0xFF683301), Color(0xFF656801), Color(0xFF346702), Color(0xFF016703), Color(0xFF036735), Color(0xFF036765), Color(0xFF013567), Color(0xFF020066), Color(0xFF2D0064), Color(0xFF670167), Color(0xFF63002D), Color(0xFF212121)),
        // Row 8 - Near-black
        listOf(Color(0xFF310100), Color(0xFF321A00), Color(0xFF333301), Color(0xFF1A3300), Color(0xFF013302), Color(0xFF013318), Color(0xFF043232), Color(0xFF021A32), Color(0xFF000233), Color(0xFF1A0030), Color(0xFF330132), Color(0xFF320116), Color(0xFF000000))
    )

    fun isColorClose(c1: Color, c2: Color): Boolean {
        val a1 = c1.toArgb()
        val a2 = c2.toArgb()
        if (a1 == a2) return true
        val dr = kotlin.math.abs(c1.red - c2.red)
        val dg = kotlin.math.abs(c1.green - c2.green)
        val db = kotlin.math.abs(c1.blue - c2.blue)
        return (dr + dg + db) < 0.05f
    }
}

@Composable
fun GridColorPicker(
    selectedColor: Color,
    onColorSelected: (Color) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 10.dp),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header: Preview and Hex label
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "COLOR PALETTE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    val r = (selectedColor.red * 255).toInt().coerceIn(0, 255)
                    val g = (selectedColor.green * 255).toInt().coerceIn(0, 255)
                    val b = (selectedColor.blue * 255).toInt().coerceIn(0, 255)
                    Text(
                        text = String.format("#%02X%02X%02X", r, g, b),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(selectedColor)
                            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                    )
                }
            }

            // Top Row: 16 Circular Swatches
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                GridColorPalette.TOP_CIRCULAR_SWATCHES.forEach { color ->
                    val isSelected = GridColorPalette.isColorClose(selectedColor, color)
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(20.dp)
                            .clip(CircleShape)
                            .background(color)
                            .border(
                                width = if (isSelected) 2.dp else 0.8.dp,
                                color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Black.copy(alpha = 0.25f),
                                shape = CircleShape
                            )
                            .clickable { onColorSelected(color) },
                        contentAlignment = Alignment.Center
                    ) {
                        if (isSelected) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(if (color == Color.White) Color.Black else Color.White)
                            )
                        }
                    }
                }
            }

            // Main Grid: 13 Columns × 9 Rows
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color.Black.copy(alpha = 0.2f), RoundedCornerShape(2.dp))
                    .padding(1.dp),
                verticalArrangement = Arrangement.spacedBy(1.dp)
            ) {
                GridColorPalette.COLOR_GRID.forEach { rowColors ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(1.dp)
                    ) {
                        rowColors.forEach { cellColor ->
                            val isSelected = GridColorPalette.isColorClose(selectedColor, cellColor)
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(20.dp)
                                    .background(cellColor)
                                    .border(
                                        width = if (isSelected) 1.5.dp else 0.4.dp,
                                        color = if (isSelected) Color.White else Color.Black.copy(alpha = 0.15f)
                                    )
                                    .clickable { onColorSelected(cellColor) },
                                contentAlignment = Alignment.Center
                            ) {
                                if (isSelected) {
                                    // Target selection ring matching the user's reference image
                                    Box(
                                        modifier = Modifier
                                            .size(11.dp)
                                            .border(2.dp, Color.White, CircleShape)
                                            .border(1.dp, Color.Black.copy(alpha = 0.7f), CircleShape)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
