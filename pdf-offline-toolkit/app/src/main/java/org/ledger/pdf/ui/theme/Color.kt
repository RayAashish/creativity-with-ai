package org.ledger.pdf.ui.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

@Immutable
data class LedgerColors(
    val background: Color,
    val surface: Color,
    val surfaceElevated: Color,
    val border: Color,
    val borderFocus: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    val accent: Color,
    val accentPressed: Color,
    val accentSubtle: Color,
    val destructive: Color,
    val destructiveSubtle: Color,
    val success: Color,
    val successSubtle: Color,
    val warning: Color,
    val isDark: Boolean
)

// Paper Light Palette
val PaperBackground = Color(0xFFF5F2EB)
val PaperSurface = Color(0xFFEBE6DC)
val PaperSurfaceElevated = Color(0xFFE3DDD1)
val PaperBorder = Color(0xFFD5CEBF)
val PaperBorderFocus = Color(0xFF171717)
val PaperTextPrimary = Color(0xFF171717)
val PaperTextSecondary = Color(0xFF4A4742)
val PaperTextMuted = Color(0xFF7A756D)

// Oxblood / Rust Accent
val OxbloodAccent = Color(0xFF9B3A2E)
val OxbloodPressed = Color(0xFF7F2F25)
val OxbloodSubtle = Color(0x1A9B3A2E)

// Status colors
val StatusSuccess = Color(0xFF2D6A4F)
val StatusSuccessSubtle = Color(0x1E2D6A4F)
val StatusWarning = Color(0xFFB57614)

// Charcoal Dark Palette
val CharcoalBackground = Color(0xFF141414)
val CharcoalSurface = Color(0xFF1F1E1D)
val CharcoalSurfaceElevated = Color(0xFF2B2927)
val CharcoalBorder = Color(0xFF3B3835)
val CharcoalBorderFocus = Color(0xFFEBE8E1)
val CharcoalTextPrimary = Color(0xFFEBE8E1)
val CharcoalTextSecondary = Color(0xFFA8A39D)
val CharcoalTextMuted = Color(0xFF706B65)

val LightLedgerColors = LedgerColors(
    background = PaperBackground,
    surface = PaperSurface,
    surfaceElevated = PaperSurfaceElevated,
    border = PaperBorder,
    borderFocus = PaperBorderFocus,
    textPrimary = PaperTextPrimary,
    textSecondary = PaperTextSecondary,
    textMuted = PaperTextMuted,
    accent = OxbloodAccent,
    accentPressed = OxbloodPressed,
    accentSubtle = OxbloodSubtle,
    destructive = OxbloodAccent,
    destructiveSubtle = OxbloodSubtle,
    success = StatusSuccess,
    successSubtle = StatusSuccessSubtle,
    warning = StatusWarning,
    isDark = false
)

val DarkLedgerColors = LedgerColors(
    background = CharcoalBackground,
    surface = CharcoalSurface,
    surfaceElevated = CharcoalSurfaceElevated,
    border = CharcoalBorder,
    borderFocus = CharcoalBorderFocus,
    textPrimary = CharcoalTextPrimary,
    textSecondary = CharcoalTextSecondary,
    textMuted = CharcoalTextMuted,
    accent = OxbloodAccent,
    accentPressed = OxbloodPressed,
    accentSubtle = OxbloodSubtle,
    destructive = OxbloodAccent,
    destructiveSubtle = OxbloodSubtle,
    success = StatusSuccess,
    successSubtle = StatusSuccessSubtle,
    warning = StatusWarning,
    isDark = true
)

val LocalLedgerColors = staticCompositionLocalOf { LightLedgerColors }
