// app/src/main/java/com/raysi/launcher/data/usage/format/UsageDurationFormatter.kt
package com.raysi.launcher.data.usage.format

import androidx.compose.ui.graphics.Color
import com.raysi.launcher.ui.theme.HudAmber
import com.raysi.launcher.ui.theme.HudNormal
import com.raysi.launcher.ui.theme.HudRed

/**
 * High-performance, zero-String.format duration formatter.
 * Strictly adheres to the hard constraint prohibiting String.format in ticker loops.
 */
object UsageDurationFormatter {

    /**
     * Formats screen time duration with zero units omitted:
     * - 2h 14m 12s
     * - 14m 12s
     * - 42s
     * - 0s
     */
    fun formatScreenTime(totalSeconds: Long): String {
        val totalSec = if (totalSeconds < 0L) 0L else totalSeconds
        val hours = totalSec / 3600L
        val remainingSec = totalSec % 3600L
        val minutes = remainingSec / 60L
        val seconds = remainingSec % 60L

        val sb = StringBuilder(16)
        if (hours > 0L) {
            sb.append(hours).append("h ")
            sb.append(minutes).append("m ")
            sb.append(seconds).append('s')
        } else if (minutes > 0L) {
            sb.append(minutes).append("m ")
            sb.append(seconds).append('s')
        } else {
            sb.append(seconds).append('s')
        }
        return sb.toString()
    }

    /**
     * Formats HUD headline: "Today: 2h 14m 12s • 34 Unlocks"
     */
    fun formatHud(totalSeconds: Long, unlockCount: Int): String {
        val durationPart = formatScreenTime(totalSeconds)
        val sb = StringBuilder(32)
        sb.append("Today: ")
        sb.append(durationPart)
        sb.append(" • ")
        sb.append(unlockCount)
        if (unlockCount == 1) {
            sb.append(" Unlock")
        } else {
            sb.append(" Unlocks")
        }
        return sb.toString()
    }

    /**
     * Formats per-app duration for pinned essentials (e.g. "12m", "1h 5m", "<1m").
     * Returns null if duration is 0.
     */
    fun formatAppDuration(durationMs: Long): String? {
        if (durationMs <= 0L) return null
        val totalSec = durationMs / 1000L
        val hours = totalSec / 3600L
        val minutes = (totalSec % 3600L) / 60L

        if (hours == 0L && minutes == 0L) {
            return "<1m"
        }

        val sb = StringBuilder(10)
        if (hours > 0L) {
            sb.append(hours).append("h ")
        }
        sb.append(minutes).append('m')
        return sb.toString()
    }

    /**
     * Maps total screen time seconds to HUD color bands:
     * < 2h:  #888888 (HudNormal)
     * 2h to < 4h: #D97706 (HudAmber)
     * >= 4h: #DC2626 (HudRed)
     */
    fun getHudColor(totalSeconds: Long): Color {
        val hours = totalSeconds / 3600.0
        return when {
            hours < 2.0 -> HudNormal
            hours < 4.0 -> HudAmber
            else -> HudRed
        }
    }
}
