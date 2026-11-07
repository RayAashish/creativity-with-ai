package com.cliplocker.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import com.cliplocker.app.core.model.ThemeMode

@Composable
fun CliplockerTheme(
    themeMode: ThemeMode = ThemeMode.SYSTEM,
    content: @Composable () -> Unit
) {
    val isDark = when (themeMode) {
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
    }

    val colors = if (isDark) CharcoalDarkColors else PaperLightColors
    val typography = CliplockerTypography()
    val shapes = CliplockerShapes()

    CompositionLocalProvider(
        LocalCliplockerColors provides colors,
        LocalCliplockerTypography provides typography,
        LocalCliplockerShapes provides shapes,
        content = content
    )
}

object CliplockerTheme {
    val colors: CliplockerColors
        @Composable
        @ReadOnlyComposable
        get() = LocalCliplockerColors.current

    val typography: CliplockerTypography
        @Composable
        @ReadOnlyComposable
        get() = LocalCliplockerTypography.current

    val shapes: CliplockerShapes
        @Composable
        @ReadOnlyComposable
        get() = LocalCliplockerShapes.current
}
