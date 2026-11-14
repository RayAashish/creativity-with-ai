package com.vectorcraft.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val CurvifyDarkColorScheme = darkColorScheme(
    primary = AccentCyan,
    secondary = AccentGold,
    tertiary = AccentPurple,
    background = DarkBackdrop,
    surface = DarkSurfaceElevated,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

@Composable
fun CurvifyTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = CurvifyDarkColorScheme,
        content = content
    )
}
