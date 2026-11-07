package com.cliplocker.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.core.model.FilterOptions
import com.cliplocker.app.ui.theme.CliplockerTheme

@Composable
fun CliplockerSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    filterOptions: FilterOptions,
    onSelectType: (ClipType?) -> Unit,
    onTogglePinnedOnly: () -> Unit,
    onToggleSecretsOnly: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val shapes = CliplockerTheme.shapes
    val focusManager = LocalFocusManager.current

    Column(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 14.dp, vertical = 6.dp)
            .liquidGlass(
                colors = colors,
                shape = RoundedCornerShape(26.dp),
                elevation = 8.dp,
                customSurfaceColor = if (colors.isDark) Color(0xF00F121E) else Color(0xF5FFFFFF)
            )
            .padding(vertical = 8.dp)
    ) {
        // Filter Chips inside the floating glass dock
        FilterChipBar(
            filterOptions = filterOptions,
            onSelectType = onSelectType,
            onTogglePinnedOnly = onTogglePinnedOnly,
            onToggleSecretsOnly = onToggleSecretsOnly
        )

        // Floating Spatial Search Capsule
        val searchPillShape = RoundedCornerShape(22.dp)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 10.dp, vertical = 4.dp)
                .height(44.dp)
                .clip(searchPillShape)
                .background(colors.background.copy(alpha = if (colors.isDark) 0.7f else 0.5f))
                .border(
                    1.dp,
                    if (query.isNotBlank()) {
                        Brush.horizontalGradient(listOf(colors.accent, colors.accentGradientEnd))
                    } else {
                        Brush.verticalGradient(
                            listOf(colors.glassHighlight.copy(alpha = 0.4f), colors.border.copy(alpha = 0.2f))
                        )
                    },
                    searchPillShape
                )
                .padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Search icon",
                tint = if (query.isNotBlank()) colors.accent else colors.inkMuted,
                modifier = Modifier.size(20.dp)
            )

            Spacer(modifier = Modifier.width(10.dp))

            Box(
                modifier = Modifier
                    .weight(1f)
                    .padding(vertical = 4.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                if (query.isEmpty()) {
                    Text(
                        text = "Search encrypted vault (FTS4)...",
                        style = typography.codePreview.copy(fontSize = 13.sp),
                        color = colors.inkMuted
                    )
                }

                BasicTextField(
                    value = query,
                    onValueChange = onQueryChange,
                    singleLine = true,
                    textStyle = typography.codePreview.copy(
                        color = colors.inkPrimary,
                        fontSize = 13.5.sp,
                        fontWeight = FontWeight.Medium
                    ),
                    cursorBrush = SolidColor(colors.accent),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = { focusManager.clearFocus() }),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            AnimatedVisibility(
                visible = query.isNotEmpty(),
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .clip(CircleShape)
                        .background(colors.surfaceVariant)
                        .clickable { onQueryChange("") },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Clear search",
                        tint = colors.inkSecondary,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }
    }
}
