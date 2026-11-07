// app/src/main/java/com/raysi/launcher/domain/model/TelemetryData.kt
package com.raysi.launcher.domain.model

import androidx.compose.runtime.Immutable

/**
 * Top drain culprit application data model.
 */
@Immutable
data class CulpritApp(
    val packageName: String,
    val label: String,
    val durationFormatted: String
)

/**
 * Unified immutable telemetry state rendered by the Ambient Accountability HUD.
 */
@Immutable
data class TelemetryUiState(
    val formattedTime: String = "",
    val screenTimeFormatted: String = "0m",
    val unlockCount: Int = 0,
    val awayDurationFormatted: String = "away 0m",
    val topDrain: CulpritApp? = null,
    val quietAlertsCount: Int = 0,
    val hasUsagePermission: Boolean = false,
    val hasNotificationPermission: Boolean = false
)

/**
 * Finite 24-hour day progress bar representation (Memento Mori).
 */
@Immutable
data class DailyProgress(
    val formattedBar: String = "day [--------------------] 0%",
    val percentage: Int = 0
)

/**
 * Reactive pinned application entry with dynamic satiety dimming and usage tracking.
 */
@Immutable
data class PinnedAppItem(
    val id: String,
    val packageName: String,
    val className: String,
    val componentNameStr: String,
    val label: String,
    val userSerialNumber: Long = 0L,
    val isWorkProfile: Boolean = false,
    val isInstalled: Boolean = true,
    val usageDurationMinutes: Long = 0L,
    val usageFormatted: String? = null,
    val isSatiated: Boolean = false,
    val timeLimitMinutes: Int = 45
)
