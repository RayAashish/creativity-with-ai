package com.cliplocker.app.ui.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

@Immutable
data class CliplockerColors(
    val background: Color,
    val surface: Color,
    val surfaceVariant: Color,
    val border: Color,
    val glassHighlight: Color,
    val inkPrimary: Color,
    val inkSecondary: Color,
    val inkMuted: Color,
    val accent: Color,
    val onAccent: Color,
    val accentSubtle: Color,
    val accentGradientStart: Color,
    val accentGradientEnd: Color,
    val secretMask: Color,
    val liveActive: Color,
    val livePaused: Color,
    val typeText: Color,
    val typeUrl: Color,
    val typeImage: Color,
    val typeSecret: Color,
    val isDark: Boolean
)

val PaperLightColors = CliplockerColors(
    background = Color(0xFFF0F3F8),
    surface = Color(0xC8FFFFFF),
    surfaceVariant = Color(0xD8FFFFFF),
    border = Color(0x3094A3B8),
    glassHighlight = Color(0x80FFFFFF),
    inkPrimary = Color(0xFF0F172A),
    inkSecondary = Color(0xFF334155),
    inkMuted = Color(0xFF64748B),
    accent = Color(0xFFE25514),
    onAccent = Color(0xFFFFFFFF),
    accentSubtle = Color(0x1FE25514),
    accentGradientStart = Color(0xFFE25514),
    accentGradientEnd = Color(0xFFFF7A3D),
    secretMask = Color(0x1FEB7A32),
    liveActive = Color(0xFF059669),
    livePaused = Color(0xFFD97706),
    typeText = Color(0xFF0284C7),
    typeUrl = Color(0xFF4F46E5),
    typeImage = Color(0xFF0D9488),
    typeSecret = Color(0xFFEA580C),
    isDark = false
)

val CharcoalDarkColors = CliplockerColors(
    background = Color(0xFF0B0D14),
    surface = Color(0x1AFFFFFF),
    surfaceVariant = Color(0x26FFFFFF),
    border = Color(0x33FFFFFF),
    glassHighlight = Color(0x59FFFFFF),
    inkPrimary = Color(0xFFF8FAFC),
    inkSecondary = Color(0xFFCBD5E1),
    inkMuted = Color(0xFF94A3B8),
    accent = Color(0xFFFF6525),
    onAccent = Color(0xFFFFFFFF),
    accentSubtle = Color(0x28FF6525),
    accentGradientStart = Color(0xFFFF5514),
    accentGradientEnd = Color(0xFFFFA05C),
    secretMask = Color(0x26FF9900),
    liveActive = Color(0xFF10B981),
    livePaused = Color(0xFFF59E0B),
    typeText = Color(0xFF38BDF8),
    typeUrl = Color(0xFF818CF8),
    typeImage = Color(0xFF34D399),
    typeSecret = Color(0xFFFB923C),
    isDark = true
)

val LocalCliplockerColors = staticCompositionLocalOf { CharcoalDarkColors }
