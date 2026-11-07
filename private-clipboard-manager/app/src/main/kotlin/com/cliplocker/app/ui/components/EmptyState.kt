package com.cliplocker.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliplocker.app.ui.theme.CliplockerTheme

@Composable
fun EmptyState(
    isSearching: Boolean = false,
    modifier: Modifier = Modifier
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Glowing Spatial Glass Orb & Clipboard Glyph
        Box(
            modifier = Modifier
                .size(90.dp)
                .shadow(16.dp, CircleShape, spotColor = colors.accent.copy(alpha = 0.25f))
                .clip(CircleShape)
                .background(colors.surface)
                .border(
                    1.dp,
                    Brush.verticalGradient(
                        listOf(colors.glassHighlight, colors.border.copy(alpha = 0.3f))
                    ),
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.size(48.dp)) {
                val strokeWidth = 2.dp.toPx()

                // Outline clipboard card
                drawRoundRect(
                    color = colors.inkSecondary.copy(alpha = 0.7f),
                    topLeft = Offset(8.dp.toPx(), 12.dp.toPx()),
                    size = Size(size.width - 16.dp.toPx(), size.height - 18.dp.toPx()),
                    cornerRadius = CornerRadius(6.dp.toPx(), 6.dp.toPx()),
                    style = Stroke(width = strokeWidth)
                )

                // Luminous Clip Bracket
                drawRoundRect(
                    color = colors.accent,
                    topLeft = Offset(size.width / 2 - 12.dp.toPx(), 4.dp.toPx()),
                    size = Size(24.dp.toPx(), 12.dp.toPx()),
                    cornerRadius = CornerRadius(3.dp.toPx(), 3.dp.toPx()),
                    style = Stroke(width = strokeWidth)
                )

                // Interior Lines
                drawLine(
                    color = colors.inkMuted.copy(alpha = 0.5f),
                    start = Offset(14.dp.toPx(), 22.dp.toPx()),
                    end = Offset(size.width - 14.dp.toPx(), 22.dp.toPx()),
                    strokeWidth = 1.5.dp.toPx()
                )
                drawLine(
                    color = colors.inkMuted.copy(alpha = 0.5f),
                    start = Offset(14.dp.toPx(), 29.dp.toPx()),
                    end = Offset(size.width - 20.dp.toPx(), 29.dp.toPx()),
                    strokeWidth = 1.5.dp.toPx()
                )
            }
        }

        Spacer(modifier = Modifier.height(22.dp))

        Text(
            text = if (isSearching) "No matches found" else "Spatial Vault is Ready",
            style = typography.title.copy(
                fontSize = 19.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.3).sp
            ),
            color = colors.inkPrimary
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = if (isSearching)
                "Try adjusting your query or filter tags."
            else
                "Copied text and images appear here automatically.\nEncrypted with SQLCipher. Zero network.",
            style = typography.codePreview.copy(
                fontSize = 12.5.sp,
                lineHeight = 18.sp
            ),
            color = colors.inkSecondary,
            textAlign = TextAlign.Center
        )
    }
}
