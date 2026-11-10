package com.readmaster.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val PrimaryBlue = Color(0xFF1E88E5)
val PrimaryDarkBlue = Color(0xFF1565C0)
val AccentOrange = Color(0xFFFF9800)
val BackgroundLight = Color(0xFFF9F9FB)
val SurfaceLight = Color(0xFFFFFFFF)
val TextPrimary = Color(0xFF191C1E)
val TextSecondary = Color(0xFF43474E)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD6E3FF),
    onPrimaryContainer = Color(0xFF001B3E),
    secondary = AccentOrange,
    background = BackgroundLight,
    surface = SurfaceLight,
    onSurface = TextPrimary
)

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryBlue,
    onPrimary = Color.White,
    primaryContainer = PrimaryDarkBlue,
    background = Color(0xFF111318),
    surface = Color(0xFF1B1D22),
    onSurface = Color(0xFFE2E2E6)
)

@Composable
fun ReadMasterTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
