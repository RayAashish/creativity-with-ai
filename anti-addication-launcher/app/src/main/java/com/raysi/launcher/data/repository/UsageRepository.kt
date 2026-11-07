// app/src/main/java/com/raysi/launcher/data/repository/UsageRepository.kt
package com.raysi.launcher.data.repository

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Process
import android.os.SystemClock
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.usage.engine.UsageAggregationEngine
import com.raysi.launcher.data.usage.engine.UsageAggregationResult
import com.raysi.launcher.data.usage.format.UsageDurationFormatter
import com.raysi.launcher.data.usage.model.UsageEventRecord
import com.raysi.launcher.ui.theme.HudNormal
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.Closeable
import java.time.LocalDate
import java.time.ZoneId

data class HudState(
    val hasPermission: Boolean = false,
    val totalSeconds: Long = 0L,
    val unlockCount: Int = 0,
    val formattedText: String = "",
    val statusColor: Color = HudNormal,
    val perAppDurations: Map<String, Long> = emptyMap()
)

interface UsageRepository {
    val hudStateFlow: StateFlow<HudState>
    fun hasUsagePermission(): Boolean
    fun onScreenResumed()
    fun onScreenPaused()
    suspend fun reconcileUsage()
}

class UsageRepositoryImpl(
    private val context: Context,
    private val dispatchers: FocusDispatchers
) : UsageRepository, Closeable {

    private val scope = CoroutineScope(SupervisorJob() + dispatchers.usageAggregation)
    private val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
    private val appOpsManager = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager

    private val _hudStateFlow = MutableStateFlow(HudState())
    override val hudStateFlow: StateFlow<HudState> = _hudStateFlow.asStateFlow()

    private var isScreenOn: Boolean = true
    private var isLauncherResumed: Boolean = true
    private var tickerJob: Job? = null

    // Base reconciled values
    private var lastReconciledScreenTimeMs: Long = 0L
    private var lastReconciledElapsedRealtime: Long = 0L
    private var lastReconciledUnlockCount: Int = 0
    private var lastPerAppDurations: Map<String, Long> = emptyMap()
    private var lastStartOfDayMs: Long = 0L

    private val systemReceiver = object : BroadcastReceiver() {
        override fun onReceive(recvContext: Context?, intent: Intent?) {
            val action = intent?.action ?: return
            when (action) {
                Intent.ACTION_SCREEN_ON -> {
                    isScreenOn = true
                    startTicker()
                    triggerReconcileAsync()
                }
                Intent.ACTION_SCREEN_OFF -> {
                    isScreenOn = false
                    stopTicker()
                }
                Intent.ACTION_USER_PRESENT -> {
                    triggerReconcileAsync()
                }
                Intent.ACTION_TIME_CHANGED,
                Intent.ACTION_TIMEZONE_CHANGED,
                Intent.ACTION_DATE_CHANGED -> {
                    triggerReconcileAsync()
                }
            }
        }
    }

    init {
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_USER_PRESENT)
            addAction(Intent.ACTION_TIME_CHANGED)
            addAction(Intent.ACTION_TIMEZONE_CHANGED)
            addAction(Intent.ACTION_DATE_CHANGED)
        }
        try {
            ContextCompat.registerReceiver(
                context,
                systemReceiver,
                filter,
                ContextCompat.RECEIVER_EXPORTED
            )
        } catch (ignored: Exception) {
        }

        // Initial check and reconciliation
        triggerReconcileAsync()
    }

    override fun hasUsagePermission(): Boolean {
        if (appOpsManager == null) return false
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOpsManager.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOpsManager.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    override fun onScreenResumed() {
        isLauncherResumed = true
        startTicker()
        triggerReconcileAsync()
    }

    override fun onScreenPaused() {
        isLauncherResumed = false
        stopTicker()
    }

    private fun triggerReconcileAsync() {
        scope.launch {
            reconcileUsage()
        }
    }

    override suspend fun reconcileUsage() = withContext(dispatchers.usageAggregation) {
        val hasPermission = hasUsagePermission()
        if (!hasPermission || usageStatsManager == null) {
            _hudStateFlow.value = HudState(
                hasPermission = false,
                formattedText = "Usage access off • tap to enable",
                statusColor = HudNormal,
                perAppDurations = emptyMap()
            )
            stopTicker()
            return@withContext
        }

        val nowMs = System.currentTimeMillis()
        val startOfDayMs = calculateStartOfDayMs()
        lastStartOfDayMs = startOfDayMs

        val rawEvents = ArrayList<UsageEventRecord>(512)
        try {
            val usageEvents = usageStatsManager.queryEvents(startOfDayMs, nowMs)
            val event = UsageEvents.Event()
            while (usageEvents.hasNextEvent()) {
                usageEvents.getNextEvent(event)
                rawEvents.add(
                    UsageEventRecord(
                        eventType = event.eventType,
                        timestampMs = event.timeStamp,
                        packageName = event.packageName ?: "",
                        className = event.className ?: ""
                    )
                )
            }
        } catch (e: Exception) {
            // Degrade gracefully on query exception
        }

        val result: UsageAggregationResult = UsageAggregationEngine.aggregate(
            events = rawEvents,
            startOfDayMs = startOfDayMs,
            nowMs = nowMs,
            ownPackageName = context.packageName
        )

        lastReconciledScreenTimeMs = result.totalScreenTimeMs
        lastReconciledElapsedRealtime = SystemClock.elapsedRealtime()
        lastReconciledUnlockCount = result.unlockCount
        lastPerAppDurations = result.perAppDurationsMs

        val totalSec = lastReconciledScreenTimeMs / 1000L
        _hudStateFlow.value = HudState(
            hasPermission = true,
            totalSeconds = totalSec,
            unlockCount = lastReconciledUnlockCount,
            formattedText = UsageDurationFormatter.formatHud(totalSec, lastReconciledUnlockCount),
            statusColor = UsageDurationFormatter.getHudColor(totalSec),
            perAppDurations = lastPerAppDurations
        )

        if (isScreenOn && isLauncherResumed) {
            startTicker()
        }
    }

    private fun startTicker() {
        if (tickerJob?.isActive == true) return
        tickerJob = scope.launch {
            while (isActive && isScreenOn && isLauncherResumed) {
                delay(1000L)
                updateTickerSecond()
            }
        }
    }

    private fun stopTicker() {
        tickerJob?.cancel()
        tickerJob = null
    }

    private fun updateTickerSecond() {
        if (!hasUsagePermission()) return

        val currentStartOfDay = calculateStartOfDayMs()
        if (currentStartOfDay != lastStartOfDayMs) {
            // Day rollover occurred while running; trigger immediate reconciliation
            triggerReconcileAsync()
            return
        }

        val elapsedDeltaMs = SystemClock.elapsedRealtime() - lastReconciledElapsedRealtime
        val currentScreenTimeMs = lastReconciledScreenTimeMs + elapsedDeltaMs
        val totalSec = currentScreenTimeMs / 1000L

        val text = UsageDurationFormatter.formatHud(totalSec, lastReconciledUnlockCount)
        val color = UsageDurationFormatter.getHudColor(totalSec)

        _hudStateFlow.value = _hudStateFlow.value.copy(
            totalSeconds = totalSec,
            formattedText = text,
            statusColor = color
        )
    }

    private fun calculateStartOfDayMs(): Long {
        return try {
            val zoneId = ZoneId.systemDefault()
            LocalDate.now(zoneId).atStartOfDay(zoneId).toInstant().toEpochMilli()
        } catch (e: Exception) {
            val now = System.currentTimeMillis()
            now - (now % 86_400_000L)
        }
    }

    override fun close() {
        stopTicker()
        try {
            context.unregisterReceiver(systemReceiver)
        } catch (ignored: Exception) {
        }
    }
}
