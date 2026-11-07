package org.ledger.pdf.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable

object LedgerTheme {
    val colors: LedgerColors
        @Composable
        @ReadOnlyComposable
        get() = LocalLedgerColors.current

    val typography: LedgerTypography
        @Composable
        @ReadOnlyComposable
        get() = LocalLedgerTypography.current

    val spacing: LedgerSpacing
        @Composable
        @ReadOnlyComposable
        get() = LocalLedgerSpacing.current
}

enum class ThemeMode {
    SYSTEM,
    LIGHT,
    DARK
}

@Composable
fun LedgerTheme(
    themeMode: ThemeMode = ThemeMode.SYSTEM,
    content: @Composable () -> Unit
) {
    val darkTheme = when (themeMode) {
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
    }

    val colors = if (darkTheme) DarkLedgerColors else LightLedgerColors
    val typography = LedgerTypography()
    val spacing = LedgerSpacing()

    CompositionLocalProvider(
        LocalLedgerColors provides colors,
        LocalLedgerTypography provides typography,
        LocalLedgerSpacing provides spacing,
        content = content
    )
}
