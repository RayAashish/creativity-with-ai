// app/src/main/java/com/raysi/launcher/data/repository/TelemetryRepository.kt
package com.raysi.launcher.data.repository

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Process
import android.os.SystemClock
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.receiver.DeviceStateEvent
import com.raysi.launcher.data.receiver.DeviceStateReceiver
import com.raysi.launcher.data.service.QuarantineNotificationService
import com.raysi.launcher.data.usage.engine.UsageAggregationEngine
import com.raysi.launcher.domain.model.CulpritApp
import com.raysi.launcher.domain.model.DailyProgress
import com.raysi.launcher.domain.model.TelemetryUiState
import com.raysi.launcher.service.notification.NotificationUtils
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.Closeable
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

interface TelemetryRepository : Closeable {
    val telemetryUiStateFlow: StateFlow<TelemetryUiState>
    val dailyProgressFlow: StateFlow<DailyProgress>
    val perAppDurationsFlow: StateFlow<Map<String, Long>>

    suspend fun reconcile()
    fun onScreenResumed()
    fun onScreenPaused()
}

class TelemetryRepositoryImpl(
    private val context: Context,
    private val preferencesRepository: PreferencesRepository,
    private val quarantineRepository: QuarantineRepository,
    private val appInventoryRepository: AppInventoryRepository,
    private val settingsRepository: SettingsRepository,
    private val deviceStateReceiver: DeviceStateReceiver,
    private val dispatchers: FocusDispatchers
) : TelemetryRepository {

    private val scope = CoroutineScope(SupervisorJob() + dispatchers.default)

    private val timeFormat = SimpleDateFormat("h:mm a · EEE dd MMM", Locale.US)

    private val _telemetryUiState = MutableStateFlow(TelemetryUiState())
    override val telemetryUiStateFlow: StateFlow<TelemetryUiState> = _telemetryUiState.asStateFlow()

    private val _dailyProgress = MutableStateFlow(calculateDailyProgress(System.currentTimeMillis()))
    override val dailyProgressFlow: StateFlow<DailyProgress> = _dailyProgress.asStateFlow()

    private val _perAppDurations = MutableStateFlow<Map<String, Long>>(emptyMap())
    override val perAppDurationsFlow: StateFlow<Map<String, Long>> = _perAppDurations.asStateFlow()

    private var baseScreenTimeMs: Long = 0L
    private var baseElapsedRealtime: Long = 0L
    private var isScreenResumed = false
    private var tickerJob: Job? = null

    init {
        deviceStateReceiver.register(context)

        // Observe device state events
        scope.launch {
            deviceStateReceiver.events.collectLatest { event ->
                when (event) {
                    is DeviceStateEvent.ScreenOn -> onScreenResumed()
                    is DeviceStateEvent.ScreenOff -> onScreenPaused()
                    is DeviceStateEvent.UserPresent -> reconcile()
                    is DeviceStateEvent.TimeTick -> {
                        updateClockAndTimeProgress()
                    }
                }
            }
        }

        // Observe unread notifications
        scope.launch {
            quarantineRepository.unreadCountFlow.collectLatest { count ->
                QuarantineNotificationService.updateCount(count)
                _telemetryUiState.value = _telemetryUiState.value.copy(
                    quietAlertsCount = count
                )
            }
        }

        // Observe unlock count
        scope.launch {
            preferencesRepository.dailyUnlockCountFlow.collectLatest { count ->
                _telemetryUiState.value = _telemetryUiState.value.copy(
                    unlockCount = count
                )
            }
        }

        // Observe away duration
        scope.launch {
            preferencesRepository.lastAwayDurationFlow.collectLatest { durationMs ->
                _telemetryUiState.value = _telemetryUiState.value.copy(
                    awayDurationFormatted = formatAwayDuration(durationMs)
                )
            }
        }

        // Initial reconciliation
        scope.launch {
            reconcile()
            updateClockAndTimeProgress()
        }
    }

    override fun onScreenResumed() {
        if (isScreenResumed) return
        isScreenResumed = true
        scope.launch { reconcile() }
        startTicker()
    }

    override fun onScreenPaused() {
        isScreenResumed = false
        stopTicker()
    }

    private fun startTicker() {
        stopTicker()
        tickerJob = scope.launch(dispatchers.mainImmediate) {
            while (isActive && isScreenResumed) {
                val currentElapsed = SystemClock.elapsedRealtime()
                val liveDurationMs = if (baseElapsedRealtime > 0L && currentElapsed >= baseElapsedRealtime) {
                    baseScreenTimeMs + (currentElapsed - baseElapsedRealtime)
                } else {
                    baseScreenTimeMs
                }

                val formatted = formatScreenTime(liveDurationMs)
                if (_telemetryUiState.value.screenTimeFormatted != formatted) {
                    _telemetryUiState.value = _telemetryUiState.value.copy(
                        screenTimeFormatted = formatted
                    )
                }
                delay(1000L)
            }
        }
    }

    private fun stopTicker() {
        tickerJob?.cancel()
        tickerJob = null
    }

    override suspend fun reconcile() = withContext(dispatchers.usageAggregation) {
        val hasUsage = checkUsageStatsPermission()
        val hasNotif = NotificationUtils.isNotificationListenerEnabled(context)

        updateClockAndTimeProgress()

        if (!hasUsage) {
            _telemetryUiState.value = _telemetryUiState.value.copy(
                hasUsagePermission = false,
                hasNotificationPermission = hasNotif,
                screenTimeFormatted = "Usage access off"
            )
            return@withContext
        }

        val usageManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
        if (usageManager == null) {
            _telemetryUiState.value = _telemetryUiState.value.copy(hasUsagePermission = false)
            return@withContext
        }

        val nowMs = System.currentTimeMillis()
        val cal = Calendar.getInstance().apply {
            timeInMillis = nowMs
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startOfDayMs = cal.timeInMillis

        val events = try {
            usageManager.queryEvents(startOfDayMs, nowMs)
        } catch (e: Exception) {
            null
        }

        val snapshot = settingsRepository.snapshot
        val aggregation = UsageAggregationEngine.aggregate(
            events = events,
            startOfDayMs = startOfDayMs,
            nowMs = nowMs,
            launcherPackage = context.packageName,
            screenTimeIncludesLauncher = snapshot.screenTimeIncludesLauncher
        )

        baseScreenTimeMs = aggregation.totalInteractiveMs
        baseElapsedRealtime = SystemClock.elapsedRealtime()

        _perAppDurations.value = aggregation.perAppDurations

        // Compute top drain culprit app (excluding launcher)
        var maxDurationMs = 0L
        var topPkg: String? = null
        for ((pkg, duration) in aggregation.perAppDurations) {
            if (pkg != context.packageName && duration > maxDurationMs) {
                maxDurationMs = duration
                topPkg = pkg
            }
        }

        val culprit = if (topPkg != null && maxDurationMs > 0L) {
            val appMap = appInventoryRepository.appsMapFlow.value
            val label = appMap.values.firstOrNull { it.packageName == topPkg }?.label ?: topPkg
            CulpritApp(
                packageName = topPkg,
                label = label,
                durationFormatted = formatCulpritDuration(maxDurationMs)
            )
        } else {
            null
        }

        _telemetryUiState.value = _telemetryUiState.value.copy(
            screenTimeFormatted = formatScreenTime(baseScreenTimeMs),
            topDrain = culprit,
            hasUsagePermission = true,
            hasNotificationPermission = hasNotif
        )
    }

    private fun updateClockAndTimeProgress() {
        val now = System.currentTimeMillis()
        val formattedDate = synchronized(timeFormat) {
            timeFormat.format(Date(now)).uppercase(Locale.US)
        }
        val progress = calculateDailyProgress(now)

        _dailyProgress.value = progress
        _telemetryUiState.value = _telemetryUiState.value.copy(
            formattedTime = formattedDate
        )
    }

    private fun checkUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager ?: return false
        val mode = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    override fun close() {
        deviceStateReceiver.unregister(context)
        stopTicker()
        scope.cancel()
    }

    companion object {
        fun formatScreenTime(durationMs: Long): String {
            val totalSeconds = (durationMs / 1000L).coerceAtLeast(0L)
            val hours = totalSeconds / 3600L
            val minutes = (totalSeconds % 3600L) / 60L
            val seconds = totalSeconds % 60L

            return when {
                hours > 0L -> "${hours}h ${minutes}m"
                minutes > 0L -> "${minutes}m ${seconds}s"
                else -> "${seconds}s"
            }
        }

        fun formatAwayDuration(durationMs: Long): String {
            if (durationMs <= 0L) return "away 0m"
            val totalSeconds = durationMs / 1000L
            val hours = totalSeconds / 3600L
            val minutes = (totalSeconds % 3600L) / 60L

            return when {
                hours > 0L -> "away ${hours}h ${minutes}m"
                minutes > 0L -> "away ${minutes}m"
                else -> "away ${totalSeconds}s"
            }
        }

        fun formatCulpritDuration(durationMs: Long): String {
            val totalSeconds = (durationMs / 1000L).coerceAtLeast(0L)
            val hours = totalSeconds / 3600L
            val minutes = (totalSeconds % 3600L) / 60L
            return if (hours > 0L) "${hours}h ${minutes}m" else "${minutes}m"
        }

        fun calculateDailyProgress(
            nowMs: Long,
            timeZone: TimeZone = TimeZone.getDefault()
        ): DailyProgress {
            val cal = Calendar.getInstance(timeZone).apply { timeInMillis = nowMs }
            val minutesElapsed = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)
            val pct = ((minutesElapsed.toDouble() / 1440.0) * 100).toInt().coerceIn(0, 100)

            // Exactly 20 characters inside the brackets
            val filledChars = ((pct * 20) / 100).coerceIn(0, 20)
            val emptyChars = (20 - filledChars).coerceIn(0, 20)

            val bar = buildString(28) {
                append("day [")
                repeat(filledChars) { append('=') }
                repeat(emptyChars) { append('-') }
                append("] ")
                append(pct)
                append('%')
            }

            return DailyProgress(formattedBar = bar, percentage = pct)
        }
    }
}
