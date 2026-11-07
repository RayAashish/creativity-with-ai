package com.cliplocker.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.SelectAll
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliplocker.app.ui.theme.CliplockerTheme

@Composable
fun CliplockerTopBar(
    isCaptureEnabled: Boolean,
    onToggleCapture: (Boolean) -> Unit,
    onOpenSettings: () -> Unit,
    selectedCount: Int,
    onClearSelection: () -> Unit,
    onSelectAll: () -> Unit,
    onDeleteSelected: () -> Unit,
    onPinSelected: () -> Unit,
    onSecretSelected: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val shapes = CliplockerTheme.shapes

    Box(
        modifier = modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 14.dp, vertical = 6.dp)
            .liquidGlass(colors = colors, shape = shapes.card, elevation = 2.dp)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        if (selectedCount > 0) {
            // Selection Mode Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onClearSelection,
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Cancel selection",
                        tint = colors.inkPrimary
                    )
                }

                Text(
                    text = "$selectedCount selected",
                    style = typography.title,
                    color = colors.inkPrimary,
                    modifier = Modifier.padding(start = 4.dp)
                )

                Spacer(modifier = Modifier.weight(1f))

                IconButton(
                    onClick = onSelectAll,
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.SelectAll,
                        contentDescription = "Select all",
                        tint = colors.inkPrimary
                    )
                }

                IconButton(
                    onClick = onPinSelected,
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.PushPin,
                        contentDescription = "Pin selected",
                        tint = colors.accent
                    )
                }

                IconButton(
                    onClick = onSecretSelected,
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = "Mark selected secret",
                        tint = colors.inkPrimary
                    )
                }

                IconButton(
                    onClick = onDeleteSelected,
                    modifier = Modifier.size(38.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete selected",
                        tint = colors.inkSecondary
                    )
                }
            }
        } else {
            // Liquid Glass Top Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Glowing Spatial App Title
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .shadow(8.dp, CircleShape, spotColor = if (isCaptureEnabled) colors.liveActive else colors.livePaused)
                            .clip(CircleShape)
                            .background(
                                if (isCaptureEnabled) {
                                    Brush.radialGradient(listOf(colors.liveActive, Color(0xFF059669)))
                                } else {
                                    Brush.radialGradient(listOf(colors.livePaused, Color(0xFFB45309)))
                                }
                            )
                    )

                    Spacer(modifier = Modifier.width(9.dp))

                    Text(
                        text = "CLIPLOCKER",
                        style = typography.title.copy(
                            letterSpacing = 1.2.sp,
                            fontWeight = FontWeight.ExtraBold
                        ),
                        color = colors.inkPrimary
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                // Liquid Capsule Capture Switch
                val pillTrackBg by animateColorAsState(
                    targetValue = if (isCaptureEnabled) colors.liveActive.copy(alpha = 0.18f) else colors.surfaceVariant,
                    animationSpec = tween(200),
                    label = "pillTrackBg"
                )
                val pillBorderColor by animateColorAsState(
                    targetValue = if (isCaptureEnabled) colors.liveActive.copy(alpha = 0.5f) else colors.border,
                    animationSpec = tween(200),
                    label = "pillBorderColor"
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .height(34.dp)
                        .clip(RoundedCornerShape(17.dp))
                        .background(pillTrackBg)
                        .border(1.dp, pillBorderColor, RoundedCornerShape(17.dp))
                        .clickable { onToggleCapture(!isCaptureEnabled) }
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                        .semantics {
                            contentDescription = if (isCaptureEnabled) "Capture active, tap to pause" else "Capture paused, tap to activate"
                        }
                ) {
                    Text(
                        text = if (isCaptureEnabled) "REC" else "PAUSED",
                        style = typography.badge,
                        color = if (isCaptureEnabled) colors.liveActive else colors.inkMuted,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    // Custom Smooth Liquid Glass Toggle Indicator
                    Box(
                        modifier = Modifier
                            .width(28.dp)
                            .height(16.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isCaptureEnabled) colors.liveActive.copy(alpha = 0.4f) else colors.border.copy(alpha = 0.5f))
                            .padding(2.dp),
                        contentAlignment = if (isCaptureEnabled) Alignment.CenterEnd else Alignment.CenterStart
                    ) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .shadow(4.dp, CircleShape, spotColor = if (isCaptureEnabled) colors.liveActive else colors.inkMuted)
                                .clip(CircleShape)
                                .background(if (isCaptureEnabled) colors.liveActive else colors.inkMuted)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(6.dp))

                // Frosted Settings Icon Button
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(colors.surfaceVariant.copy(alpha = 0.6f))
                        .border(1.dp, colors.border.copy(alpha = 0.3f), CircleShape)
                        .clickable(onClick = onOpenSettings),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Open Settings",
                        tint = colors.inkSecondary,
                        modifier = Modifier.size(19.dp)
                    )
                }
            }
        }
    }
}
