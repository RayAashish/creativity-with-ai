package com.mindforge.app.core.theme

import androidx.compose.ui.graphics.Color

// Primary Forge Brand Palette
val ForgeAmberPrimary = Color(0xFFF59E0B)
val ForgeAmberDark = Color(0xFFD97706)
val ForgeAmberLight = Color(0xFFFDE68A)

// Secondary Cyan Pulse Palette
val CyanPulseSecondary = Color(0xFF06B6D4)
val CyanPulseDark = Color(0xFF0891B2)
val CyanPulseLight = Color(0xFFCFFAFE)

// Dark / Obsidian Surfaces
val DarkBackground = Color(0xFF090D16)
val DarkSurface = Color(0xFF121829)
val DarkSurfaceVariant = Color(0xFF1B243B)
val DarkSurfaceHighlight = Color(0xFF263352)
val DarkBorder = Color(0xFF2E3D60)
val DarkTextPrimary = Color(0xFFF8FAFC)
val DarkTextSecondary = Color(0xFF94A3B8)
val DarkTextTertiary = Color(0xFF64748B)

// Light Clean Surfaces
val LightBackground = Color(0xFFF8FAFC)
val LightSurface = Color(0xFFFFFFFF)
val LightSurfaceVariant = Color(0xFFF1F5F9)
val LightSurfaceHighlight = Color(0xFFE2E8F0)
val LightBorder = Color(0xFFCBD5E1)
val LightTextPrimary = Color(0xFF0F172A)
val LightTextSecondary = Color(0xFF475569)
val LightTextTertiary = Color(0xFF94A3B8)

// Semantic Accents
val SuccessGreen = Color(0xFF10B981)
val ErrorRed = Color(0xFFEF4444)
val WarningOrange = Color(0xFFF97316)
val StreakFire = Color(0xFFFF6D00)
val StarGold = Color(0xFFFFC107)

// Category Specific Colors
data class CategoryColorTokens(
    val primary: Color,
    val containerDark: Color,
    val onContainerDark: Color,
    val containerLight: Color,
    val onContainerLight: Color
)

object CategoryThemes {
    val Math = CategoryColorTokens(
        primary = Color(0xFFF59E0B),
        containerDark = Color(0xFF451A03),
        onContainerDark = Color(0xFFFEF3C7),
        containerLight = Color(0xFFFEF3C7),
        onContainerLight = Color(0xFF78350F)
    )
    val Memory = CategoryColorTokens(
        primary = Color(0xFF6366F1),
        containerDark = Color(0xFF1E1B4B),
        onContainerDark = Color(0xFFE0E7FF),
        containerLight = Color(0xFFEEF2FF),
        onContainerLight = Color(0xFF312E81)
    )
    val Focus = CategoryColorTokens(
        primary = Color(0xFF10B981),
        containerDark = Color(0xFF022C22),
        onContainerDark = Color(0xFFD1FAE5),
        containerLight = Color(0xFFECFDF5),
        onContainerLight = Color(0xFF064E3B)
    )
    val Logic = CategoryColorTokens(
        primary = Color(0xFF8B5CF6),
        containerDark = Color(0xFF2E1065),
        onContainerDark = Color(0xFFEDE9FE),
        containerLight = Color(0xFFF5F3FF),
        onContainerLight = Color(0xFF4C1D95)
    )
    val Language = CategoryColorTokens(
        primary = Color(0xFFF43F5E),
        containerDark = Color(0xFF4C0519),
        onContainerDark = Color(0xFFFFE4E6),
        containerLight = Color(0xFFFFF1F2),
        onContainerLight = Color(0xFF881337)
    )
}
