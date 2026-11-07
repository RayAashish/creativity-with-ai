package com.cliplocker.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.unit.dp
import com.cliplocker.app.ui.theme.CliplockerTheme

@Composable
fun CopiedBadge(
    visible: Boolean,
    modifier: Modifier = Modifier
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val shapes = CliplockerTheme.shapes

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn() + scaleIn(initialScale = 0.85f),
        exit = fadeOut() + scaleOut(targetScale = 0.85f),
        modifier = modifier
    ) {
        Box(
            modifier = Modifier
                .rotate(-3f)
                .clip(shapes.badge)
                .background(colors.accentSubtle)
                .border(1.5.dp, colors.accent, shapes.badge)
                .padding(horizontal = 14.dp, vertical = 6.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "✓ COPIED TO CLIPBOARD",
                style = typography.badge,
                color = colors.accent
            )
        }
    }
}
