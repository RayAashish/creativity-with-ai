package com.cliplocker.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.cliplocker.app.ui.theme.CliplockerColors

/**
 * Applies a Liquid Glass styling with frosted glass fill, specular top-lit edge highlight,
 * and soft ambient depth.
 */
fun Modifier.liquidGlass(
    colors: CliplockerColors,
    shape: Shape,
    isSelected: Boolean = false,
    elevation: Dp = 0.dp,
    customSurfaceColor: Color? = null
): Modifier {
    val borderColor = if (isSelected) {
        Brush.verticalGradient(
            colors = listOf(
                colors.accent,
                colors.accent.copy(alpha = 0.7f)
            )
        )
    } else {
        Brush.verticalGradient(
            colors = listOf(
                colors.glassHighlight,
                colors.border.copy(alpha = 0.4f),
                colors.border.copy(alpha = 0.1f)
            )
        )
    }

    val surfaceColor = customSurfaceColor ?: if (colors.isDark) {
        Color(0xB3111524) // Rich dark spatial frosted obsidian
    } else {
        Color(0xD9FFFFFF) // Crisp translucent frosted acrylic
    }

    return this
        .then(if (elevation > 0.dp) Modifier.shadow(elevation, shape, spotColor = colors.accent.copy(alpha = 0.12f)) else Modifier)
        .clip(shape)
        .background(surfaceColor)
        .border(1.dp, borderColor, shape)
}

/**
 * Creates a luminous spatial background with subtle ambient depth glow.
 */
fun spatialBackgroundBrush(colors: CliplockerColors): Brush {
    return if (colors.isDark) {
        Brush.radialGradient(
            colors = listOf(
                Color(0xFF161926), // Subtle cosmic indigo nebula
                Color(0xFF0F111A),
                Color(0xFF0B0D14)  // Deep spatial void
            ),
            radius = 1400f
        )
    } else {
        Brush.verticalGradient(
            colors = listOf(
                Color(0xFFF8FAFC),
                Color(0xFFEFF3F8),
                Color(0xFFE2E8F0)
            )
        )
    }
}
