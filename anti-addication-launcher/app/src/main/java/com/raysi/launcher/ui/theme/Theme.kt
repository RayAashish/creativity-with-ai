// app/src/main/java/com/raysi/launcher/ui/theme/Theme.kt
package com.raysi.launcher.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val FocusColorScheme = darkColorScheme(
    primary = PureWhite,
    onPrimary = OledBlack,
    secondary = DimGray,
    onSecondary = PureWhite,
    background = OledBlack,
    onBackground = PureWhite,
    surface = OledBlack,
    onSurface = PureWhite,
    surfaceVariant = OledBlack,
    onSurfaceVariant = DimGray
)

@Composable
fun FocusLauncherTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = FocusColorScheme,
        typography = FocusTypography,
        content = content
    )
}
