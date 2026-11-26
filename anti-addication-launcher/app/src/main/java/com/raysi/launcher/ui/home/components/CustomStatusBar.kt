// app/src/main/java/com/raysi/launcher/ui/home/components/CustomStatusBar.kt
package com.raysi.launcher.ui.home.components

import android.content.Intent
import android.media.AudioManager
import android.provider.Settings
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.displayCutout
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.domain.model.SimSlotStatus
import com.raysi.launcher.domain.model.StatusBarMode
import com.raysi.launcher.domain.model.SystemStatusState
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.HudAmber
import com.raysi.launcher.ui.theme.HudRed
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite

private val MutedTrack = Color(0xFF444444)
private val ChargingGreen = Color(0xFF4ADE80)
private val PanelSurface = Color(0xFF0A0A0A)
private val PanelBorder = Color(0xFF262626)

/**
 * FocusLauncher's bespoke monochrome OLED top status bar.
 * Replaces the stock Android status bar with crisp Canvas-drawn icons for:
 * - Time & Ringer/Alert status (left of camera cutout)
 * - Dual-SIM Cellular Signal Bars & 5G/LTE badges
 * - Wi-Fi Signal Strength Arcs
 * - Proportional Battery Gauge & Charging indicator
 */
@Composable
fun CustomStatusBar(
    status: SystemStatusState,
    quietAlertsCount: Int,
    onBarClick: () -> Unit,
    onAlertsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val cutoutTop = WindowInsets.displayCutout.asPaddingValues().calculateTopPadding()
    val barHeight = if (cutoutTop > 34.dp) cutoutTop else 38.dp

    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(barHeight)
            .background(OledBlack)
            .clickable(onClick = onBarClick)
            .padding(horizontal = 20.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        // LEFT ZONE: Time + Ringer/Silent/Vibrate + Quiet Alerts
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = if (status.amPmText.isNotEmpty()) "${status.timeText} ${status.amPmText}" else status.timeText,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Medium,
                fontSize = 12.sp,
                color = PureWhite,
                maxLines = 1
            )

            if (status.ringerMode == AudioManager.RINGER_MODE_SILENT) {
                MuteIcon(muted = true, modifier = Modifier.size(12.dp))
            } else if (status.ringerMode == AudioManager.RINGER_MODE_VIBRATE) {
                MuteIcon(muted = false, modifier = Modifier.size(12.dp))
            }

            if (quietAlertsCount > 0) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(3.dp),
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color(0xFF1A1A1A))
                        .clickable(onClick = onAlertsClick)
                        .padding(horizontal = 5.dp, vertical = 2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(5.dp)
                            .clip(CircleShape)
                            .background(HudAmber)
                    )
                    Text(
                        text = "$quietAlertsCount",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 10.sp,
                        color = PureWhite
                    )
                }
            }
        }

        // CENTER SAFE ZONE (Punch-hole camera clearance)
        Spacer(modifier = Modifier.width(34.dp))

        // RIGHT ZONE: Network (Airplane / Dual SIM Signal Bars) + Wi-Fi + Battery
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.End
        ) {
            if (status.isAirplaneMode) {
                AirplaneIcon(modifier = Modifier.size(13.dp))
                Spacer(modifier = Modifier.width(8.dp))
            } else if (status.simSlots.isEmpty()) {
                CellularSignalBarsIcon(
                    signalLevel = -1,
                    isNoSim = true,
                    modifier = Modifier.size(width = 14.dp, height = 11.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
            } else {
                status.simSlots.forEachIndexed { idx, sim ->
                    if (idx > 0) Spacer(modifier = Modifier.width(6.dp))
                    SimStatusCluster(sim = sim, showSlotBadge = status.simSlots.size > 1)
                }
                Spacer(modifier = Modifier.width(8.dp))
            }

            // Wi-Fi Signal Indicator
            if (status.isWifiConnected || status.isWifiEnabled) {
                WifiSignalIcon(
                    level = status.wifiLevel,
                    isConnected = status.isWifiConnected,
                    modifier = Modifier.size(width = 14.dp, height = 11.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
            }

            // Battery Icon + Percentage
            BatteryIndicator(
                percent = status.batteryPercent,
                isCharging = status.isCharging,
                isPowerSave = status.isPowerSave
            )
        }
    }
}

@Composable
private fun SimStatusCluster(
    sim: SimSlotStatus,
    showSlotBadge: Boolean
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(3.dp)
    ) {
        if (sim.networkBadge.isNotEmpty()) {
            Text(
                text = sim.networkBadge,
                fontFamily = FontFamily.Monospace,
                fontWeight = if (sim.isDataActive) FontWeight.Bold else FontWeight.Normal,
                fontSize = 9.sp,
                color = if (sim.isDataActive) PureWhite else DimGray,
                lineHeight = 10.sp,
                maxLines = 1
            )
        } else if (showSlotBadge) {
            Text(
                text = "S${sim.slotIndex + 1}",
                fontFamily = FontFamily.Monospace,
                fontSize = 9.sp,
                color = DimGray,
                lineHeight = 10.sp
            )
        }

        CellularSignalBarsIcon(
            signalLevel = sim.signalLevel,
            isNoSim = sim.isAbsent,
            modifier = Modifier.size(width = 13.dp, height = 11.dp)
        )
    }
}

@Composable
fun CellularSignalBarsIcon(
    signalLevel: Int,
    isNoSim: Boolean = false,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val barCount = 4
        val gap = size.width * 0.1f
        val barWidth = (size.width - gap * (barCount - 1)) / barCount

        for (i in 0 until barCount) {
            val fraction = (i + 1) / barCount.toFloat()
            val barHeight = size.height * (0.28f + 0.72f * fraction)
            val left = i * (barWidth + gap)
            val top = size.height - barHeight
            val isActive = !isNoSim && signalLevel > i
            drawRoundRect(
                color = if (isActive) PureWhite else MutedTrack,
                topLeft = Offset(left, top),
                size = Size(barWidth, barHeight),
                cornerRadius = CornerRadius(1f, 1f)
            )
        }

        if (isNoSim || signalLevel < 0) {
            drawLine(
                color = HudRed,
                start = Offset(0f, size.height * 0.15f),
                end = Offset(size.width, size.height * 0.95f),
                strokeWidth = 1.6.dp.toPx(),
                cap = StrokeCap.Round
            )
        }
    }
}

@Composable
fun WifiSignalIcon(
    level: Int,
    isConnected: Boolean,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val center = Offset(size.width / 2f, size.height * 0.88f)
        val dotRadius = size.height * 0.11f

        drawCircle(
            color = if (isConnected && level >= 1) PureWhite else MutedTrack,
            radius = dotRadius,
            center = center
        )

        val radii = listOf(size.height * 0.36f, size.height * 0.60f, size.height * 0.84f)
        val strokePx = 1.4.dp.toPx()

        radii.forEachIndexed { idx, radius ->
            val threshold = idx + 2
            val active = isConnected && level >= threshold
            drawArc(
                color = if (active) PureWhite else MutedTrack,
                startAngle = -135f,
                sweepAngle = 90f,
                useCenter = false,
                topLeft = Offset(center.x - radius, center.y - radius),
                size = Size(radius * 2f, radius * 2f),
                style = Stroke(width = strokePx, cap = StrokeCap.Round)
            )
        }
    }
}

@Composable
fun BatteryIndicator(
    percent: Int,
    isCharging: Boolean,
    isPowerSave: Boolean
) {
    val safePct = if (percent in 0..100) percent else 0
    val fillColor = when {
        isCharging -> ChargingGreen
        safePct in 1..15 -> HudRed
        isPowerSave -> HudAmber
        else -> PureWhite
    }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Canvas(modifier = Modifier.size(width = 20.dp, height = 10.dp)) {
            val stroke = 1.1.dp.toPx()
            val nibW = 1.8.dp.toPx()
            val bodyW = size.width - nibW - 1.dp.toPx()
            val bodyH = size.height

            // Battery outer shell
            drawRoundRect(
                color = if (isCharging) ChargingGreen else PureWhite,
                topLeft = Offset(0f, 0f),
                size = Size(bodyW, bodyH),
                cornerRadius = CornerRadius(2.dp.toPx(), 2.dp.toPx()),
                style = Stroke(width = stroke)
            )

            // Terminal nib
            drawRoundRect(
                color = if (isCharging) ChargingGreen else PureWhite,
                topLeft = Offset(bodyW + 1.dp.toPx(), bodyH * 0.28f),
                size = Size(nibW, bodyH * 0.44f),
                cornerRadius = CornerRadius(1.dp.toPx(), 1.dp.toPx())
            )

            // Proportional internal charge fill
            val inset = 1.8.dp.toPx()
            val maxInnerW = (bodyW - inset * 2).coerceAtLeast(0f)
            val fillW = maxInnerW * (safePct / 100f)
            if (fillW > 0.5f) {
                drawRoundRect(
                    color = fillColor,
                    topLeft = Offset(inset, inset),
                    size = Size(fillW, (bodyH - inset * 2).coerceAtLeast(1f)),
                    cornerRadius = CornerRadius(1.dp.toPx(), 1.dp.toPx())
                )
            }
        }

        val pctLabel = if (percent >= 0) "$percent%" else "--"
        val bolt = if (isCharging) "⚡" else ""
        Text(
            text = "$pctLabel$bolt",
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Medium,
            fontSize = 11.sp,
            color = if (safePct in 1..15 && !isCharging) HudRed else PureWhite,
            maxLines = 1
        )
    }
}

@Composable
private fun AirplaneIcon(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val stroke = 1.4.dp.toPx()
        // Fuselage
        drawLine(
            color = PureWhite,
            start = Offset(size.width * 0.12f, size.height * 0.5f),
            end = Offset(size.width * 0.9f, size.height * 0.5f),
            strokeWidth = stroke,
            cap = StrokeCap.Round
        )
        // Wing
        val path = Path().apply {
            moveTo(size.width * 0.42f, size.height * 0.1f)
            lineTo(size.width * 0.62f, size.height * 0.5f)
            lineTo(size.width * 0.42f, size.height * 0.9f)
        }
        drawPath(path = path, color = PureWhite, style = Stroke(width = stroke, cap = StrokeCap.Round))
    }
}

@Composable
private fun MuteIcon(muted: Boolean, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val stroke = 1.3.dp.toPx()
        val bellColor = if (muted) DimGray else PureWhite
        drawCircle(
            color = bellColor,
            radius = size.minDimension * 0.34f,
            center = Offset(size.width / 2f, size.height / 2f),
            style = Stroke(width = stroke)
        )
        if (muted) {
            drawLine(
                color = HudAmber,
                start = Offset(size.width * 0.15f, size.height * 0.85f),
                end = Offset(size.width * 0.85f, size.height * 0.15f),
                strokeWidth = stroke,
                cap = StrokeCap.Round
            )
        }
    }
}

/**
 * Interactive System Status & Control Dialog shown when tapping the custom status bar.
 * Lets the user inspect Dual-SIM carriers, Wi-Fi, Battery, expand Android Notifications,
 * grant Phone State permission for multi-SIM carrier labels, and switch Status Bar modes.
 */
@Composable
fun StatusQuickPanelDialog(
    status: SystemStatusState,
    currentMode: StatusBarMode,
    hasAccessibilityEnabled: Boolean,
    onSelectMode: (StatusBarMode) -> Unit,
    onExpandNotifications: () -> Unit,
    onRequestPhonePermission: () -> Unit,
    onOpenSettings: () -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = PanelSurface,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "SYSTEM STATUS",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = PureWhite
                )
                Text(
                    text = if (status.amPmText.isNotEmpty()) "${status.timeText} ${status.amPmText}" else status.timeText,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    color = DimGray
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // Network & Wi-Fi Card
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, PanelBorder, RoundedCornerShape(8.dp))
                        .clickable {
                            onDismiss()
                            try {
                                context.startActivity(Intent(Settings.ACTION_WIFI_SETTINGS))
                            } catch (_: Exception) {}
                        }
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "WI-FI",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            color = DimGray
                        )
                        WifiSignalIcon(
                            level = status.wifiLevel,
                            isConnected = status.isWifiConnected,
                            modifier = Modifier.size(width = 16.dp, height = 12.dp)
                        )
                    }
                    Text(
                        text = when {
                            status.isWifiConnected -> {
                                val std = if (status.wifiStandardLabel.isNotEmpty()) "Wi-Fi ${status.wifiStandardLabel}" else "Connected"
                                "$std · Signal ${status.wifiLevel}/4"
                            }
                            status.isWifiEnabled -> "Enabled (Not connected)"
                            else -> "Off"
                        },
                        fontFamily = FontFamily.Monospace,
                        fontSize = 13.sp,
                        color = PureWhite
                    )
                }

                // SIM & Cellular Networks Card
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, PanelBorder, RoundedCornerShape(8.dp))
                        .clickable {
                            onDismiss()
                            try {
                                context.startActivity(Intent(Settings.ACTION_WIRELESS_SETTINGS))
                            } catch (_: Exception) {}
                        }
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "CELLULAR & SIM",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = DimGray
                    )

                    if (status.isAirplaneMode) {
                        Text(
                            text = "Airplane Mode Active",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 13.sp,
                            color = HudAmber
                        )
                    } else if (status.simSlots.isEmpty()) {
                        Text(
                            text = "No SIM detected",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 13.sp,
                            color = DimGray
                        )
                    } else {
                        status.simSlots.forEach { sim ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                val dataTag = if (sim.isDataActive) " · DATA" else ""
                                val netTag = if (sim.networkBadge.isNotEmpty()) " · ${sim.networkBadge}" else ""
                                Text(
                                    text = "SIM${sim.slotIndex + 1}: ${sim.carrierName}$netTag$dataTag",
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 12.sp,
                                    color = PureWhite
                                )
                                CellularSignalBarsIcon(
                                    signalLevel = sim.signalLevel,
                                    isNoSim = sim.isAbsent,
                                    modifier = Modifier.size(width = 16.dp, height = 12.dp)
                                )
                            }
                        }
                    }

                    if (!status.hasPhoneStatePermission) {
                        Text(
                            text = "[Grant Dual-SIM Permission →]",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            color = HudAmber,
                            modifier = Modifier
                                .clickable {
                                    onDismiss()
                                    onRequestPhonePermission()
                                }
                                .padding(top = 4.dp)
                        )
                    }
                }

                // Battery Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, PanelBorder, RoundedCornerShape(8.dp))
                        .clickable {
                            onDismiss()
                            try {
                                context.startActivity(Intent(Intent.ACTION_POWER_USAGE_SUMMARY))
                            } catch (_: Exception) {}
                        }
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "BATTERY",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            color = DimGray
                        )
                        val stateStr = when {
                            status.isCharging -> "Charging"
                            status.isPowerSave -> "Power Saver On"
                            else -> "Discharging"
                        }
                        Text(
                            text = "${if (status.batteryPercent >= 0) status.batteryPercent else "--"}% · $stateStr",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 13.sp,
                            color = PureWhite
                        )
                    }
                    BatteryIndicator(
                        percent = status.batteryPercent,
                        isCharging = status.isCharging,
                        isPowerSave = status.isPowerSave
                    )
                }

                // Status Bar Mode Switcher
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = "TOP BAR MODE",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        color = DimGray
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf(
                            StatusBarMode.CUSTOM to "Custom",
                            StatusBarMode.SYSTEM to "Android",
                            StatusBarMode.STEALTH to "Hidden"
                        ).forEach { (mode, label) ->
                            val selected = currentMode == mode
                            Text(
                                text = label,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 11.sp,
                                color = if (selected) OledBlack else PureWhite,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(if (selected) PureWhite else Color(0xFF1A1A1A))
                                    .clickable { onSelectMode(mode) }
                                    .padding(horizontal = 10.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                // Notification Shade Shortcut
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = if (hasAccessibilityEnabled) "[Notification Shade ↓]" else "[Launcher Settings →]",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = PureWhite,
                        modifier = Modifier
                            .clickable {
                                onDismiss()
                                if (hasAccessibilityEnabled) {
                                    onExpandNotifications()
                                } else {
                                    onOpenSettings()
                                }
                            }
                            .padding(vertical = 4.dp)
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = "Close",
                    fontFamily = FontFamily.Monospace,
                    color = PureWhite
                )
            }
        }
    )
}
