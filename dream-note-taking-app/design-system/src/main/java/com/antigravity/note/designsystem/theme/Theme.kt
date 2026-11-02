package com.antigravity.note.designsystem.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val InkBlack = Color(0xFF111318)
val InkBlue = Color(0xFF005AC1)
val InkPrimaryDark = Color(0xFFA8C7FA)
val PaperWhite = Color(0xFFFBF8F2)
val CanvasDark = Color(0xFF191C20)
val SurfaceContainerLight = Color(0xFFEBE8E2)
val SurfaceContainerDark = Color(0xFF22262B)
val AccentGreen = Color(0xFF146C2E)
val AccentAmber = Color(0xFFB35300)
val AccentRed = Color(0xFFBA1A1A)

private val LightColorScheme = lightColorScheme(
    primary = InkBlue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD8E2FF),
    onPrimaryContainer = Color(0xFF001A41),
    secondary = Color(0xFF535F70),
    background = PaperWhite,
    surface = Color(0xFFF5F2EC),
    surfaceVariant = SurfaceContainerLight,
    onBackground = InkBlack,
    onSurface = InkBlack
)

private val DarkColorScheme = darkColorScheme(
    primary = InkPrimaryDark,
    onPrimary = Color(0xFF003062),
    primaryContainer = Color(0xFF00468C),
    onPrimaryContainer = Color(0xFFD8E2FF),
    secondary = Color(0xFFBBC7DB),
    background = CanvasDark,
    surface = SurfaceContainerDark,
    surfaceVariant = Color(0xFF2D3137),
    onBackground = Color(0xFFE2E2E9),
    onSurface = Color(0xFFE2E2E9)
)

@Composable
fun DreamNoteTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
