package com.cliplocker.app.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.unit.dp

@Immutable
data class CliplockerShapes(
    val badge: RoundedCornerShape = RoundedCornerShape(8.dp),
    val chip: RoundedCornerShape = RoundedCornerShape(20.dp),
    val card: RoundedCornerShape = RoundedCornerShape(16.dp),
    val dialog: RoundedCornerShape = RoundedCornerShape(24.dp),
    val searchBar: RoundedCornerShape = RoundedCornerShape(28.dp),
    val pill: RoundedCornerShape = RoundedCornerShape(percent = 50)
)

val LocalCliplockerShapes = staticCompositionLocalOf { CliplockerShapes() }
