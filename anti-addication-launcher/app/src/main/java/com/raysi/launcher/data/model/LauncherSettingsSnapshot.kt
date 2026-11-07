// app/src/main/java/com/raysi/launcher/data/model/LauncherSettingsSnapshot.kt
package com.raysi.launcher.data.model

/**
 * Immutable in-memory snapshot of launcher configuration.
 * Read synchronously on startup so the first frame never blocks on disk I/O.
 */
data class LauncherSettingsSnapshot(
    val gateDelaySeconds: Int = 10,
    val sessionDurationMinutes: Int = 10,
    val maxExtensionsAllowed: Int = 2,
    val screenTimeIncludesLauncher: Boolean = true,
    val digestHours: List<Int> = listOf(12, 18, 21),
    val distractingPackages: Set<String> = emptySet(),
    val neverBlockPackages: Set<String> = emptySet(),
    val alwaysAllowPackages: Set<String> = emptySet(),
    val pinnedApps: List<PinnedAppEntry> = emptyList(),
    val activeSessions: Map<String, ActiveSessionEntry> = emptyMap()
) {
    companion object {
        val DEFAULT = LauncherSettingsSnapshot()
    }
}

/**
 * Represents a pinned application entry.
 * Max 5 pinned apps, keyed by componentName + userSerialNumber.
 */
data class PinnedAppEntry(
    val componentName: String,
    val userSerialNumber: Long,
    val customLabel: String,
    val displayOrder: Int
)

/**
 * Persisted active session for an intentional application launch.
 */
data class ActiveSessionEntry(
    val packageName: String,
    val startElapsedRealtime: Long,
    val endWallClockMs: Long,
    val endElapsedRealtime: Long,
    val extensionCount: Int
)
