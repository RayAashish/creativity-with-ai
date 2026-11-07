// app/src/main/java/com/raysi/launcher/ui/home/components/PinnedAppsList.kt
package com.raysi.launcher.ui.home.components

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.domain.model.PinnedAppItem
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.HudRed
import com.raysi.launcher.ui.theme.PureWhite

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun PinnedAppsList(
    pinnedApps: List<PinnedAppItem>,
    onLaunchApp: (PinnedAppItem) -> Unit,
    onLongClickApp: (PinnedAppItem) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        if (pinnedApps.isEmpty()) {
            Text(
                text = "no pinned essentials",
                fontFamily = FontFamily.Monospace,
                fontSize = 16.sp,
                color = DimGray
            )
        } else {
            pinnedApps.forEach { item ->
                PinnedAppTextRow(
                    item = item,
                    onClick = { onLaunchApp(item) },
                    onLongClick = { onLongClickApp(item) }
                )
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun PinnedAppTextRow(
    item: PinnedAppItem,
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
            .padding(vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // App Name Label
        Text(
            text = item.label,
            fontFamily = FontFamily.Monospace,
            fontSize = 18.sp,
            color = primaryColor
        )

        // Per-App Usage Tag (if usage > 15m)
        if (item.usageFormatted != null) {
            Text(
                text = " · ${item.usageFormatted}",
                fontFamily = FontFamily.Monospace,
                fontSize = 14.sp,
                color = DimGray.copy(alpha = if (item.isSatiated) 0.5f else 0.85f)
            )
        }

        // Warning marker [!] if satiety limit reached
        if (item.isSatiated) {
            Text(
                text = " [!]",
                fontFamily = FontFamily.Monospace,
                fontSize = 14.sp,
                color = HudRed.copy(alpha = 0.8f)
            )
        }
    }
}
