package com.cliplocker.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.core.model.FilterOptions
import com.cliplocker.app.ui.theme.CliplockerTheme

@Composable
fun FilterChipBar(
    filterOptions: FilterOptions,
    onSelectType: (ClipType?) -> Unit,
    onTogglePinnedOnly: () -> Unit,
    onToggleSecretsOnly: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Row(
        modifier = modifier
            .fillMaxWidth()
            .horizontalScroll(scrollState)
            .padding(horizontal = 14.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // ALL CHIP
        val isAllSelected = filterOptions.selectedType == null && !filterOptions.onlyPinned && !filterOptions.onlySecrets
        LiquidFilterChipItem(
            label = "ALL",
            isSelected = isAllSelected,
            onClick = { onSelectType(null) }
        )

        // TEXT CHIP
        LiquidFilterChipItem(
            label = "TXT",
            isSelected = filterOptions.selectedType == ClipType.TEXT,
            onClick = {
                onSelectType(if (filterOptions.selectedType == ClipType.TEXT) null else ClipType.TEXT)
            }
        )

        // LINK CHIP
        LiquidFilterChipItem(
            label = "URL",
            isSelected = filterOptions.selectedType == ClipType.LINK,
            onClick = {
                onSelectType(if (filterOptions.selectedType == ClipType.LINK) null else ClipType.LINK)
            }
        )

        // IMAGE CHIP
        LiquidFilterChipItem(
            label = "IMG",
            isSelected = filterOptions.selectedType == ClipType.IMAGE,
            onClick = {
                onSelectType(if (filterOptions.selectedType == ClipType.IMAGE) null else ClipType.IMAGE)
            }
        )

        // SECRET CHIP
        LiquidFilterChipItem(
            label = "SEC 🔒",
            isSelected = filterOptions.onlySecrets || filterOptions.selectedType == ClipType.SECRET,
            onClick = onToggleSecretsOnly
        )

        // PINNED CHIP
        LiquidFilterChipItem(
            label = "PINNED 📌",
            isSelected = filterOptions.onlyPinned,
            onClick = onTogglePinnedOnly
        )
    }
}

@Composable
private fun LiquidFilterChipItem(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val pillShape = RoundedCornerShape(17.dp)

    val textColor by animateColorAsState(
        targetValue = if (isSelected) Color.White else colors.inkSecondary,
        animationSpec = tween(150),
        label = "chipTextColor"
    )

    val chipModifier = if (isSelected) {
        Modifier
            .shadow(6.dp, pillShape, spotColor = colors.accent.copy(alpha = 0.5f))
            .clip(pillShape)
            .background(
                Brush.horizontalGradient(
                    listOf(colors.accentGradientStart, colors.accentGradientEnd)
                )
            )
            .border(1.dp, Color(0x66FFFFFF), pillShape)
    } else {
        Modifier
            .clip(pillShape)
            .background(colors.surface)
            .border(
                1.dp,
                Brush.verticalGradient(
                    listOf(colors.glassHighlight.copy(alpha = 0.5f), colors.border.copy(alpha = 0.3f))
                ),
                pillShape
            )
    }

    Box(
        modifier = chipModifier
            .height(32.dp)
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            style = typography.badge.copy(
                fontSize = 10.sp,
                fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium
            ),
            color = textColor
        )
    }
}
