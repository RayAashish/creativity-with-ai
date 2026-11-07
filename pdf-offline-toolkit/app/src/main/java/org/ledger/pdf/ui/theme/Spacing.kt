package org.ledger.pdf.ui.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class LedgerSpacing(
    val xxs: Dp = 2.dp,
    val xs: Dp = 4.dp,
    val s: Dp = 8.dp,
    val m: Dp = 12.dp,
    val l: Dp = 16.dp,
    val xl: Dp = 24.dp,
    val xxl: Dp = 32.dp,

    // Component dimensions
    val compactRowHeight: Dp = 58.dp,
    val minTouchTarget: Dp = 48.dp,
    val iconSizeSmall: Dp = 16.dp,
    val iconSizeMedium: Dp = 20.dp,
    val iconSizeLarge: Dp = 24.dp,

    // Borders & Shapes (dense, architectural, sharp)
    val cornerSmall: Dp = 3.dp,
    val cornerMedium: Dp = 6.dp,
    val borderWidthThin: Dp = 1.dp,
    val borderWidthThick: Dp = 2.dp
)

val LocalLedgerSpacing = staticCompositionLocalOf { LedgerSpacing() }
