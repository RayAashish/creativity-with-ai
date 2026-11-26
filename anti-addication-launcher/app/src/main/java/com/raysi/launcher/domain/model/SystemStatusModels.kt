// app/src/main/java/com/raysi/launcher/domain/model/SystemStatusModels.kt
package com.raysi.launcher.domain.model

import android.media.AudioManager
import androidx.compose.runtime.Immutable

/**
 * Controls how the top system bar is presented on FocusLauncher.
 */
enum class StatusBarMode(val storageValue: Int) {
    CUSTOM(0),   // FocusLauncher hides OS bar & renders its own graphical status bar
    SYSTEM(1),   // Standard Android / OEM system status bar visible
    STEALTH(2);  // Pure hidden distraction-free canvas

    companion object {
        fun fromStorage(value: Int): StatusBarMode {
            return entries.firstOrNull { it.storageValue == value } ?: CUSTOM
        }
    }
}

/**
 * Controls how application icons are rendered across Home, Dock, and App Drawer.
 */
enum class AppIconMode(val storageValue: Int) {
    REAL(0),        // Real Android app icons cleanly framed
    MONOCHROME(1),  // Desaturated grayscale icons for low-dopamine visual harmony
    TEXT_ONLY(2);   // Minimalist pure-text labels without icons

    companion object {
        fun fromStorage(value: Int): AppIconMode {
            return entries.firstOrNull { it.storageValue == value } ?: REAL
        }
    }
}

/**
 * Configures down-swipe behavior on the Home screen canvas.
 */
enum class SwipeDownAction(val storageValue: Int) {
    NOTIFICATION_SHADE(0), // Like standard launchers: opens Notification Shade / Quick Status
    SCRATCHPAD(1);         // Direct quick-capture brain dump overlay

    companion object {
        fun fromStorage(value: Int): SwipeDownAction {
            return entries.firstOrNull { it.storageValue == value } ?: NOTIFICATION_SHADE
        }
    }
}

/**
 * Immutable telemetry for an individual SIM slot.
 */
@Immutable
data class SimSlotStatus(
    val slotIndex: Int,
    val carrierName: String,
    val networkBadge: String,
    val signalLevel: Int,        // 0..4 bars (-1 if no service)
    val isAbsent: Boolean = false,
    val isDataActive: Boolean = false,
    val isRoaming: Boolean = false
)

/**
 * Unified immutable snapshot rendered by FocusLauncher's bespoke CustomStatusBar
 * and Interactive Quick Status Panel.
 */
@Immutable
data class SystemStatusState(
    val timeText: String = "",
    val amPmText: String = "",
    val batteryPercent: Int = -1,
    val isCharging: Boolean = false,
    val isPowerSave: Boolean = false,
    val isWifiEnabled: Boolean = false,
    val isWifiConnected: Boolean = false,
    val wifiLevel: Int = 0,          // 0..4 signal arcs
    val wifiStandardLabel: String = "",
    val isAirplaneMode: Boolean = false,
    val isCellularConnected: Boolean = false,
    val cellularFallbackLabel: String = "",
    val simSlots: List<SimSlotStatus> = emptyList(),
    val ringerMode: Int = AudioManager.RINGER_MODE_NORMAL,
    val hasPhoneStatePermission: Boolean = false
)
