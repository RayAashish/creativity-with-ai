// app/src/main/java/com/raysi/launcher/ui/home/components/TelemetryHud.kt
package com.raysi.launcher.ui.home.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.domain.model.TelemetryUiState
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.HudAmber
import com.raysi.launcher.ui.theme.PureWhite

@Composable
fun TelemetryHud(
    state: TelemetryUiState,
    onOpenQuarantine: () -> Unit,
    onOpenUsageSettings: () -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onOpenSettings)
    ) {
        // Line 1: Date & Clock
        if (state.formattedTime.isNotBlank()) {
            Text(
                text = state.formattedTime,
                fontFamily = FontFamily.Monospace,
                fontSize = 14.sp,
                color = PureWhite
            )
            Spacer(modifier = Modifier.height(4.dp))
        }

        // Line 2: Screen-Time · Unlocks · Offline Streak
        if (state.hasUsagePermission) {
            val line2 = "${state.screenTimeFormatted} screen · ${state.unlockCount} unlocks · ${state.awayDurationFormatted}"
            Text(
                text = line2,
                fontFamily = FontFamily.Monospace,
                fontSize = 13.sp,
                color = DimGray
            )
            Spacer(modifier = Modifier.height(4.dp))
        } else {
            Text(
                text = "Usage access off • tap to enable",
                fontFamily = FontFamily.Monospace,
                fontSize = 13.sp,
                color = HudAmber,
                modifier = Modifier
                    .clickable(onClick = onOpenUsageSettings)
                    .padding(vertical = 2.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
        }

        // Line 3: Top Drain · Quarantined Alerts
        val culpritText = if (state.topDrain != null) {
            "top drain: ${state.topDrain.label} (${state.topDrain.durationFormatted})"
        } else {
            "top drain: none"
        }

        val quietAlertsText = "${state.quietAlertsCount} quiet alerts"
        val line3 = "$culpritText · $quietAlertsText"

        Text(
            text = line3,
            fontFamily = FontFamily.Monospace,
            fontSize = 13.sp,
            color = DimGray,
            modifier = Modifier.clickable {
                if (state.quietAlertsCount > 0) {
                    onOpenQuarantine()
                } else {
                    onOpenSettings()
                }
            }
        )
    }
}
