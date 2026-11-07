package org.ledger.pdf.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

@Composable
fun LedgerCard(
    modifier: Modifier = Modifier,
    isSelected: Boolean = false,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val colors = LedgerTheme.colors
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    val borderColor = if (isSelected) colors.accent else colors.border
    val borderWidth = if (isSelected) spacing.borderWidthThick else spacing.borderWidthThin

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(spacing.cornerSmall))
            .background(colors.surface)
            .border(borderWidth, borderColor, RoundedCornerShape(spacing.cornerSmall))
            .then(
                if (onClick != null) {
                    Modifier.clickable(
                        role = Role.Button,
                        onClick = {
                            haptics.selection()
                            onClick()
                        }
                    )
                } else Modifier
            )
            .padding(spacing.m)
    ) {
        content()
    }
}

@Composable
fun LedgerBadge(
    text: String,
    modifier: Modifier = Modifier,
    isAccent: Boolean = false,
    isSuccess: Boolean = false
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    val (bg, fg) = when {
        isAccent -> Pair(colors.accentSubtle, colors.accent)
        isSuccess -> Pair(colors.successSubtle, colors.success)
        else -> Pair(colors.surfaceElevated, colors.textSecondary)
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(spacing.cornerSmall))
            .background(bg)
            .border(spacing.borderWidthThin, fg.copy(alpha = 0.3f), RoundedCornerShape(spacing.cornerSmall))
            .padding(horizontal = spacing.xs * 1.5f, vertical = spacing.xxs)
    ) {
        Text(
            text = text,
            style = typography.monoLabel,
            color = fg
        )
    }
}

@Composable
fun LedgerProgressBar(
    progress: Float,
    statusText: String,
    modifier: Modifier = Modifier,
    onCancel: (() -> Unit)? = null
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(spacing.cornerSmall))
            .background(colors.surface)
            .border(spacing.borderWidthThin, colors.border, RoundedCornerShape(spacing.cornerSmall))
            .padding(spacing.m)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = statusText,
                style = typography.monoLabel,
                color = colors.textPrimary
            )
            if (onCancel != null) {
                LedgerIconButton(
                    icon = Icons.Default.Close,
                    contentDescription = "Cancel operation",
                    onClick = onCancel,
                    modifier = Modifier.size(28.dp),
                    tint = colors.accent
                )
            }
        }

        Spacer(modifier = Modifier.height(spacing.s))

        LinearProgressIndicator(
            progress = { progress.coerceIn(0f, 1f) },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(spacing.cornerSmall)),
            color = colors.accent,
            trackColor = colors.surfaceElevated,
        )
    }
}

@Composable
fun LedgerEmptyState(
    headline: String = "Drop a PDF to start — nothing leaves this device.",
    modifier: Modifier = Modifier,
    action: (@Composable () -> Unit)? = null
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(spacing.xl),
        horizontalAlignment = Alignment.Start,
        verticalArrangement = Arrangement.spacedBy(spacing.m)
    ) {
        // Architectural framing line
        Box(
            modifier = Modifier
                .width(36.dp)
                .height(3.dp)
                .background(colors.accent)
        )

        Text(
            text = headline,
            style = typography.titleMedium,
            color = colors.textPrimary
        )

        Text(
            text = "Offline-only, air-gapped PDF operations. Every byte processed on-device. No telemetry, no cloud, no leaks.",
            style = typography.body,
            color = colors.textSecondary
        )

        if (action != null) {
            Spacer(modifier = Modifier.height(spacing.s))
            action()
        }
    }
}

@Composable
fun LedgerTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    label: String? = null,
    isMonospace: Boolean = false,
    singleLine: Boolean = true,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    val textStyle: TextStyle = if (isMonospace) typography.monoBody else typography.body

    Column(modifier = modifier) {
        if (label != null) {
            Text(
                text = label.uppercase(),
                style = typography.sectionHeader,
                color = colors.textSecondary,
                modifier = Modifier.padding(bottom = spacing.xs)
            )
        }

        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            textStyle = textStyle.copy(color = colors.textPrimary),
            singleLine = singleLine,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            cursorBrush = SolidColor(colors.accent),
            decorationBox = { innerTextField ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = spacing.minTouchTarget)
                        .clip(RoundedCornerShape(spacing.cornerSmall))
                        .background(colors.surface)
                        .border(spacing.borderWidthThin, colors.borderFocus, RoundedCornerShape(spacing.cornerSmall))
                        .padding(horizontal = spacing.m, vertical = spacing.s),
                    contentAlignment = Alignment.CenterStart
                ) {
                    if (value.isEmpty() && placeholder.isNotEmpty()) {
                        Text(
                            text = placeholder,
                            style = textStyle,
                            color = colors.textMuted
                        )
                    }
                    innerTextField()
                }
            }
        )
    }
}

@Composable
fun LedgerDialog(
    title: String,
    onDismissRequest: () -> Unit,
    confirmButton: @Composable () -> Unit,
    dismissButton: (@Composable () -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing

    Dialog(onDismissRequest = onDismissRequest) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(spacing.cornerMedium))
                .background(colors.background)
                .border(spacing.borderWidthThick, colors.borderFocus, RoundedCornerShape(spacing.cornerMedium))
                .padding(spacing.l)
        ) {
            Text(
                text = title,
                style = typography.titleMedium,
                color = colors.textPrimary,
                modifier = Modifier.padding(bottom = spacing.m)
            )

            content()

            Spacer(modifier = Modifier.height(spacing.l))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (dismissButton != null) {
                    dismissButton()
                    Spacer(modifier = Modifier.width(spacing.s))
                }
                confirmButton()
            }
        }
    }
}
