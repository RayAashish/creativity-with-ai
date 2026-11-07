// app/src/main/java/com/raysi/launcher/data/repository/SettingsRepository.kt
package com.raysi.launcher.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.dataStore
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.model.ActiveSessionEntry
import com.raysi.launcher.data.model.LauncherSettingsSnapshot
import com.raysi.launcher.data.model.PinnedAppEntry
import com.raysi.launcher.data.proto.ActiveSessionProto
import com.raysi.launcher.data.proto.LauncherSettingsProto
import com.raysi.launcher.data.proto.LauncherSettingsSerializer
import com.raysi.launcher.data.proto.PinnedAppProto
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileInputStream

private val Context.launcherSettingsDataStore: DataStore<LauncherSettingsProto> by dataStore(
    fileName = "focus_launcher_settings.pb",
    serializer = LauncherSettingsSerializer
)

interface SettingsRepository {
    val snapshotFlow: StateFlow<LauncherSettingsSnapshot>
    val snapshot: LauncherSettingsSnapshot
    suspend fun updateGateDelay(seconds: Int)
    suspend fun updateSessionDuration(minutes: Int)
    suspend fun updateMaxExtensions(maxExtensions: Int)
    suspend fun setScreenTimeIncludesLauncher(include: Boolean)
    suspend fun updateDistractingPackages(packages: Set<String>)
    suspend fun updateNeverBlockPackages(packages: Set<String>)
    suspend fun updateAlwaysAllowPackages(packages: Set<String>)
    suspend fun updateDigestHours(hours: List<Int>)
    suspend fun updatePinnedApps(apps: List<PinnedAppEntry>)
    suspend fun addOrUpdateSession(session: ActiveSessionEntry)
    suspend fun removeSession(packageName: String)
    suspend fun clearExpiredSessions(currentWallClockMs: Long, currentElapsedRealtime: Long)
}

class SettingsRepositoryImpl(
    private val context: Context,
    private val dispatchers: FocusDispatchers
) : SettingsRepository {

    private val scope = CoroutineScope(SupervisorJob() + dispatchers.io)
    private val dataStore: DataStore<LauncherSettingsProto> = context.launcherSettingsDataStore

    // Initial snapshot seeded from immediate synchronous proto disk parse (or DEFAULT fallback)
    // so that the first frame NEVER blocks on async disk queues.
    private val _snapshotFlow = MutableStateFlow(loadInitialSnapshotDirect())
    override val snapshotFlow: StateFlow<LauncherSettingsSnapshot> = _snapshotFlow.asStateFlow()

    override val snapshot: LauncherSettingsSnapshot
        get() = _snapshotFlow.value

    init {
        scope.launch {
            dataStore.data.collectLatest { proto ->
                _snapshotFlow.value = proto.toSnapshot()
            }
        }
    }

    /**
     * Direct synchronous read from file system during startup.
     * If the file does not exist or fails to read, immediately returns DEFAULT without crashing.
     */
    private fun loadInitialSnapshotDirect(): LauncherSettingsSnapshot {
        val file = File(context.filesDir, "datastore/focus_launcher_settings.pb")
        if (!file.exists() || file.length() == 0L) {
            return LauncherSettingsSnapshot.DEFAULT
        }
        return try {
            FileInputStream(file).use { stream ->
                val proto = LauncherSettingsProto.parseFrom(stream)
                proto.toSnapshot()
            }
        } catch (ignored: Exception) {
            LauncherSettingsSnapshot.DEFAULT
        }
    }

    override suspend fun updateGateDelay(seconds: Int) {
        val clamped = seconds.coerceIn(5, 60)
        dataStore.updateData { current ->
            current.toBuilder().setGateDelaySeconds(clamped).build()
        }
    }

    override suspend fun updateSessionDuration(minutes: Int) {
        val clamped = minutes.coerceIn(1, 120)
        dataStore.updateData { current ->
            current.toBuilder().setSessionDurationMinutes(clamped).build()
        }
    }

    override suspend fun updateMaxExtensions(maxExtensions: Int) {
        val clamped = maxExtensions.coerceIn(0, 5)
        dataStore.updateData { current ->
            current.toBuilder().setMaxExtensionsAllowed(clamped).build()
        }
    }

    override suspend fun setScreenTimeIncludesLauncher(include: Boolean) {
        dataStore.updateData { current ->
            current.toBuilder().setScreenTimeIncludesLauncher(include).build()
        }
    }

    override suspend fun updateDistractingPackages(packages: Set<String>) {
        dataStore.updateData { current ->
            current.toBuilder()
                .clearDistractingPackages()
                .addAllDistractingPackages(packages.sorted())
                .build()
        }
    }

    override suspend fun updateNeverBlockPackages(packages: Set<String>) {
        dataStore.updateData { current ->
            current.toBuilder()
                .clearNeverBlockPackages()
                .addAllNeverBlockPackages(packages.sorted())
                .build()
        }
    }

    override suspend fun updateAlwaysAllowPackages(packages: Set<String>) {
        dataStore.updateData { current ->
            current.toBuilder()
                .clearAlwaysAllowPackages()
                .addAllAlwaysAllowPackages(packages.sorted())
                .build()
        }
    }

    override suspend fun updateDigestHours(hours: List<Int>) {
        val sanitized = hours.map { it.coerceIn(0, 23) }.distinct().sorted()
        dataStore.updateData { current ->
            current.toBuilder()
                .clearDigestHours()
                .addAllDigestHours(sanitized)
                .build()
        }
    }

    override suspend fun updatePinnedApps(apps: List<PinnedAppEntry>) {
        val bounded = apps.take(5)
        dataStore.updateData { current ->
            val builder = current.toBuilder().clearPinnedApps()
            bounded.forEachIndexed { index, app ->
                builder.addPinnedApps(
                    PinnedAppProto.newBuilder()
                        .setComponentName(app.componentName)
                        .setUserSerialNumber(app.userSerialNumber)
                        .setCustomLabel(app.customLabel.take(24))
                        .setDisplayOrder(index)
                        .build()
                )
            }
            builder.build()
        }
    }

    override suspend fun addOrUpdateSession(session: ActiveSessionEntry) {
        dataStore.updateData { current ->
            val existing = current.activeSessionsList.filterNot { it.packageName == session.packageName }
            val newSessionProto = ActiveSessionProto.newBuilder()
                .setPackageName(session.packageName)
                .setStartElapsedRealtime(session.startElapsedRealtime)
                .setEndWallClockMs(session.endWallClockMs)
                .setEndElapsedRealtime(session.endElapsedRealtime)
                .setExtensionCount(session.extensionCount)
                .build()

            current.toBuilder()
                .clearActiveSessions()
                .addAllActiveSessions(existing + newSessionProto)
                .build()
        }
    }

    override suspend fun removeSession(packageName: String) {
        dataStore.updateData { current ->
            val filtered = current.activeSessionsList.filterNot { it.packageName == packageName }
            current.toBuilder()
                .clearActiveSessions()
                .addAllActiveSessions(filtered)
                .build()
        }
    }

    override suspend fun clearExpiredSessions(currentWallClockMs: Long, currentElapsedRealtime: Long) {
        dataStore.updateData { current ->
            val active = current.activeSessionsList.filter { proto ->
                proto.endWallClockMs > currentWallClockMs && proto.endElapsedRealtime > currentElapsedRealtime
            }
            if (active.size != current.activeSessionsCount) {
                current.toBuilder()
                    .clearActiveSessions()
                    .addAllActiveSessions(active)
                    .build()
            } else {
                current
            }
        }
    }
}

private fun LauncherSettingsProto.toSnapshot(): LauncherSettingsSnapshot {
    val gateDelay = if (gateDelaySeconds > 0) gateDelaySeconds else 10
    val sessionDuration = if (sessionDurationMinutes > 0) sessionDurationMinutes else 10
    val maxExtensions = if (maxExtensionsAllowed > 0) maxExtensionsAllowed else 2
    val digests = if (digestHoursCount > 0) digestHoursList else listOf(12, 18, 21)

    val pins = pinnedAppsList.map { proto ->
        PinnedAppEntry(
            componentName = proto.componentName,
            userSerialNumber = proto.userSerialNumber,
            customLabel = proto.customLabel,
            displayOrder = proto.displayOrder
        )
    }.sortedBy { it.displayOrder }

    val sessions = activeSessionsList.associate { proto ->
        proto.packageName to ActiveSessionEntry(
            packageName = proto.packageName,
            startElapsedRealtime = proto.startElapsedRealtime,
            endWallClockMs = proto.endWallClockMs,
            endElapsedRealtime = proto.endElapsedRealtime,
            extensionCount = proto.extensionCount
        )
    }

    return LauncherSettingsSnapshot(
        gateDelaySeconds = gateDelay,
        sessionDurationMinutes = sessionDuration,
        maxExtensionsAllowed = maxExtensions,
        screenTimeIncludesLauncher = screenTimeIncludesLauncher,
        digestHours = digests,
        distractingPackages = distractingPackagesList.toSet(),
        neverBlockPackages = neverBlockPackagesList.toSet(),
        alwaysAllowPackages = alwaysAllowPackagesList.toSet(),
        pinnedApps = pins,
        activeSessions = sessions
    )
}
