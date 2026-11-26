// app/src/main/java/com/raysi/launcher/ui/home/components/PinnedAppsList.kt
package com.raysi.launcher.ui.home.components

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.domain.model.AppIconMode
import com.raysi.launcher.domain.model.PinnedAppItem
import com.raysi.launcher.ui.components.AppIconImage
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.HudRed
import com.raysi.launcher.ui.theme.PureWhite

@Composable
fun PinnedAppsList(
    pinnedApps: List<PinnedAppItem>,
    iconMode: AppIconMode = AppIconMode.REAL,
    onLaunchApp: (PinnedAppItem) -> Unit,
    onLongClickApp: (PinnedAppItem) -> Unit,
    onOpenAddApps: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        if (pinnedApps.isEmpty()) {
            Text(
                text = "+ pin essentials from app drawer",
                fontFamily = FontFamily.Monospace,
                fontSize = 15.sp,
                color = DimGray,
                modifier = Modifier
                    .clickable(onClick = onOpenAddApps)
                    .padding(vertical = 8.dp)
            )
        } else {
            pinnedApps.forEach { item ->
                PinnedAppRow(
                    item = item,
                    iconMode = iconMode,
                    onClick = { onLaunchApp(item) },
                    onLongClick = { onLongClickApp(item) }
                )
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun PinnedAppRow(
    item: PinnedAppItem,
    iconMode: AppIconMode,
    onClick: () -> Unit,
    onLongClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Visual satiety dimming to 45% opacity if usage exceeded limit
    val primaryAlpha = if (item.isSatiated) 0.45f else 1.0f
    val primaryColor = PureWhite.copy(alpha = primaryAlpha)

    Row(
        modifier = modifier
            .fillMaxWidth()
            .combinedClickable(
                onClick = onClick,
                onLongClick = onLongClick
            )
            .padding(vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (iconMode != AppIconMode.TEXT_ONLY) {
            AppIconImage(
                packageName = item.packageName,
                className = item.className,
                label = item.label,
                iconMode = iconMode,
                size = 34.dp,
                alpha = primaryAlpha,
                isSatiated = item.isSatiated
            )
            Spacer(modifier = Modifier.width(14.dp))
        }

        // App Name Label
        Text(
            text = item.label,
            fontFamily = FontFamily.Monospace,
            fontSize = 17.sp,
            color = primaryColor,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f, fill = false)
        )

        // Per-App Usage Tag (if usage >= 15m)
        if (item.usageFormatted != null) {
            Text(
                text = " · ${item.usageFormatted}",
                fontFamily = FontFamily.Monospace,
                fontSize = 13.sp,
                color = DimGray.copy(alpha = if (item.isSatiated) 0.5f else 0.85f)
            )
        }

        // Warning marker [!] if satiety limit reached
        if (item.isSatiated) {
            Text(
                text = " [!]",
                fontFamily = FontFamily.Monospace,
                fontSize = 13.sp,
                color = HudRed
            )
        }

        if (item.isWorkProfile) {
            Text(
                text = " [W]",
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                color = DimGray
            )
        }
    }
}
