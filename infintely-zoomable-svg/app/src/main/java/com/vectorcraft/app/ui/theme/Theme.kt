package com.vectorcraft.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val VectorForgeColorScheme = darkColorScheme(
    primary = AccentCyan,
    onPrimary = ObsidianBg,
    secondary = AccentAmber,
    onSecondary = ObsidianBg,
    tertiary = AccentIndigo,
    background = ObsidianBg,
    onBackground = TextPrimary,
    surface = ObsidianSurface,
    onSurface = TextPrimary,
    surfaceVariant = ObsidianCard,
    onSurfaceVariant = TextSecondary,
    outline = GlassBorder
)

@Composable
fun VectorForgeTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = VectorForgeColorScheme,
        content = content
    )
}

@Composable
fun CurvifyTheme(
    content: @Composable () -> Unit
) {
    VectorForgeTheme(content = content)
}
