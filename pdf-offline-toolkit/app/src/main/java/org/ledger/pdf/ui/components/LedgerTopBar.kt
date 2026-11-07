package org.ledger.pdf.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun LedgerTopBar(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {}
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(colors.background)
            .border(
                width = spacing.borderWidthThin,
                color = colors.border
            )
            .padding(horizontal = spacing.l, vertical = spacing.m)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f, fill = false)
            ) {
                if (onBack != null) {
                    LedgerIconButton(
                        icon = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Navigate back",
                        onClick = onBack,
                        modifier = Modifier.padding(end = spacing.m)
                    )
                }

                Column {
                    if (subtitle != null) {
                        Text(
                            text = subtitle.uppercase(),
                            style = typography.sectionHeader,
                            color = colors.accent
                        )
                    }
                    Text(
                        text = title,
                        style = typography.titleLarge,
                        color = colors.textPrimary
                    )
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.s),
                content = actions
            )
        }
    }
}

enum class LedgerButtonStyle {
    PRIMARY,
    OUTLINE,
    GHOST,
    DESTRUCTIVE
}

@Composable
fun LedgerButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    style: LedgerButtonStyle = LedgerButtonStyle.PRIMARY,
    icon: ImageVector? = null,
    enabled: Boolean = true,
    fullWidth: Boolean = false
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    val (bg, contentColor, borderColor) = when (style) {
        LedgerButtonStyle.PRIMARY -> Triple(
            if (enabled) colors.accent else colors.surfaceElevated,
            if (enabled) Color.White else colors.textMuted,
            if (enabled) colors.accent else colors.border
        )
        LedgerButtonStyle.OUTLINE -> Triple(
            colors.surface,
            if (enabled) colors.textPrimary else colors.textMuted,
            if (enabled) colors.borderFocus else colors.border
        )
        LedgerButtonStyle.GHOST -> Triple(
            Color.Transparent,
            if (enabled) colors.textPrimary else colors.textMuted,
            Color.Transparent
        )
        LedgerButtonStyle.DESTRUCTIVE -> Triple(
            if (enabled) colors.destructive else colors.surfaceElevated,
            Color.White,
            if (enabled) colors.destructive else colors.border
        )
    }

    Box(
        modifier = modifier
            .then(if (fullWidth) Modifier.fillMaxWidth() else Modifier)
            .heightIn(min = spacing.minTouchTarget)
            .clip(RoundedCornerShape(spacing.cornerSmall))
            .background(bg)
            .then(
                if (borderColor != Color.Transparent) {
                    Modifier.border(spacing.borderWidthThin, borderColor, RoundedCornerShape(spacing.cornerSmall))
                } else Modifier
            )
            .clickable(
                enabled = enabled,
                role = Role.Button,
                onClick = {
                    haptics.tick()
                    onClick()
                }
            )
            .padding(horizontal = spacing.l, vertical = spacing.s),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(spacing.s)
        ) {
            if (icon != null) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = contentColor,
                    modifier = Modifier.size(spacing.iconSizeSmall)
                )
            }
            Text(
                text = text,
                style = typography.button,
                color = contentColor
            )
        }
    }
}

@Composable
fun LedgerIconButton(
    icon: ImageVector,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    tint: Color? = null,
    enabled: Boolean = true
) {
    val colors = LedgerTheme.colors
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    Box(
        modifier = modifier
            .size(spacing.minTouchTarget)
            .clip(RoundedCornerShape(spacing.cornerSmall))
            .clickable(
                enabled = enabled,
                role = Role.Button,
                onClick = {
                    haptics.tick()
                    onClick()
                }
            )
            .semantics { this.contentDescription = contentDescription },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = tint ?: if (enabled) colors.textPrimary else colors.textMuted,
            modifier = Modifier.size(spacing.iconSizeMedium)
        )
    }
}
