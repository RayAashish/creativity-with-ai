// app/src/main/java/com/raysi/launcher/ui/gate/GateViewModel.kt
package com.raysi.launcher.ui.gate

import android.os.SystemClock
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.core.dispatchers.StandardFocusDispatchers
import com.raysi.launcher.data.model.ActiveSessionEntry
import com.raysi.launcher.data.model.AppInfo
import com.raysi.launcher.data.model.LauncherSettingsSnapshot
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.SettingsRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface GateState {
    data object Idle : GateState
    data class Countdown(
        val app: AppInfo,
        val totalSeconds: Int,
        val remainingSeconds: Int
    ) : GateState
    data class DurationSelection(
        val app: AppInfo,
        val defaultDurationMinutes: Int
    ) : GateState
}

/**
 * GateViewModel manages the intentional launch delay gate and active session approval.
 * Survives activity recreation, screen rotation, and process death via SavedStateHandle.
 */
class GateViewModel(
    private val savedStateHandle: SavedStateHandle,
    private val settingsRepository: SettingsRepository,
    private val appInventoryRepository: AppInventoryRepository,
    private val dispatchers: FocusDispatchers = StandardFocusDispatchers(),
    private val timeProvider: () -> Long = {
        try {
            SystemClock.elapsedRealtime()
        } catch (_: Throwable) {
            System.currentTimeMillis()
        }
    }
) : ViewModel() {

    companion object {
        private const val KEY_PHASE = "gate_phase"
        private const val KEY_PKG = "gate_pkg"
        private const val KEY_LABEL = "gate_label"
        private const val KEY_CLASS = "gate_class"
        private const val KEY_USER_SERIAL = "gate_user_serial"
        private const val KEY_TOTAL_SECONDS = "gate_total_sec"
        private const val KEY_REMAINING_SECONDS = "gate_rem_sec"
        private const val KEY_DEFAULT_DURATION = "gate_def_duration"

        private const val PHASE_IDLE = "IDLE"
        private const val PHASE_COUNTDOWN = "COUNTDOWN"
        private const val PHASE_DURATION = "DURATION"
    }

    private val _gateState = MutableStateFlow<GateState>(GateState.Idle)
    val gateState: StateFlow<GateState> = _gateState.asStateFlow()

    private var countdownJob: Job? = null

    init {
        restoreStateFromHandle()
    }

    private fun restoreStateFromHandle() {
        val phase = savedStateHandle.get<String>(KEY_PHASE) ?: PHASE_IDLE
        val pkg = savedStateHandle.get<String>(KEY_PKG) ?: return
        val label = savedStateHandle.get<String>(KEY_LABEL) ?: pkg
        val className = savedStateHandle.get<String>(KEY_CLASS) ?: ""
        val userSerial = savedStateHandle.get<Long>(KEY_USER_SERIAL) ?: 0L

        val app = AppInfo(
            label = label,
            packageName = pkg,
            className = className,
            userSerialNumber = userSerial
        )

        when (phase) {
            PHASE_COUNTDOWN -> {
                val total = savedStateHandle.get<Int>(KEY_TOTAL_SECONDS) ?: 10
                val remaining = savedStateHandle.get<Int>(KEY_REMAINING_SECONDS) ?: total
                if (remaining <= 0) {
                    val defDur = savedStateHandle.get<Int>(KEY_DEFAULT_DURATION) ?: 10
                    _gateState.value = GateState.DurationSelection(app, defDur)
                } else {
                    _gateState.value = GateState.Countdown(app, total, remaining)
                    startCountdownLoop(app, total, remaining)
                }
            }
            PHASE_DURATION -> {
                val defDur = savedStateHandle.get<Int>(KEY_DEFAULT_DURATION) ?: 10
                _gateState.value = GateState.DurationSelection(app, defDur)
            }
            else -> {
                _gateState.value = GateState.Idle
            }
        }
    }

    /**
     * Checks if launching targetApp requires the intentional delay gate.
     * If required, starts gate and returns false. If approved or not distracting, launches immediately and returns true.
     */
    fun checkAndLaunch(app: AppInfo): Boolean {
        val snapshot = settingsRepository.snapshot
        val isDistracting = snapshot.distractingPackages.contains(app.packageName)
        val hasSession = hasValidSession(app.packageName, snapshot)

        if (isDistracting && !hasSession) {
            startGate(app, snapshot.gateDelaySeconds, snapshot.sessionDurationMinutes)
            return false
        }

        appInventoryRepository.launchApp(app)
        return true
    }

    fun hasValidSession(packageName: String, snapshot: LauncherSettingsSnapshot): Boolean {
        val session = snapshot.activeSessions[packageName] ?: return false
        val nowElapsed = timeProvider()
        return nowElapsed <= session.endElapsedRealtime
    }

    fun startGate(app: AppInfo, gateDelaySeconds: Int, defaultDurationMinutes: Int) {
        countdownJob?.cancel()

        val total = gateDelaySeconds.coerceIn(5, 60)
        savedStateHandle[KEY_PHASE] = PHASE_COUNTDOWN
        savedStateHandle[KEY_PKG] = app.packageName
        savedStateHandle[KEY_LABEL] = app.label
        savedStateHandle[KEY_CLASS] = app.className
        savedStateHandle[KEY_USER_SERIAL] = app.userSerialNumber
        savedStateHandle[KEY_TOTAL_SECONDS] = total
        savedStateHandle[KEY_REMAINING_SECONDS] = total
        savedStateHandle[KEY_DEFAULT_DURATION] = defaultDurationMinutes

        _gateState.value = GateState.Countdown(app, total, total)
        startCountdownLoop(app, total, total)
    }

    private fun startCountdownLoop(app: AppInfo, total: Int, initialRemaining: Int) {
        countdownJob = viewModelScope.launch(dispatchers.default) {
            var currentRemaining = initialRemaining
            while (currentRemaining > 0) {
                delay(1000L)
                currentRemaining--
                savedStateHandle[KEY_REMAINING_SECONDS] = currentRemaining
                if (currentRemaining > 0) {
                    _gateState.value = GateState.Countdown(app, total, currentRemaining)
                }
            }

            val defDur = savedStateHandle.get<Int>(KEY_DEFAULT_DURATION) ?: 10
            savedStateHandle[KEY_PHASE] = PHASE_DURATION
            _gateState.value = GateState.DurationSelection(app, defDur)
        }
    }

    fun approveSession(durationMinutes: Int) {
        countdownJob?.cancel()

        val current = _gateState.value
        val app = when (current) {
            is GateState.DurationSelection -> current.app
            is GateState.Countdown -> current.app
            GateState.Idle -> return
        }

        val nowElapsed = timeProvider()
        val nowWallClock = System.currentTimeMillis()
        val durationMs = durationMinutes.coerceIn(1, 120) * 60_000L

        val session = ActiveSessionEntry(
            packageName = app.packageName,
            startElapsedRealtime = nowElapsed,
            endWallClockMs = nowWallClock + durationMs,
            endElapsedRealtime = nowElapsed + durationMs,
            extensionCount = 0
        )

        viewModelScope.launch(dispatchers.mainImmediate) {
            settingsRepository.addOrUpdateSession(session)
            appInventoryRepository.launchApp(app)
            cancelGate()
        }
    }

    fun cancelGate() {
        countdownJob?.cancel()
        savedStateHandle.remove<String>(KEY_PHASE)
        savedStateHandle.remove<String>(KEY_PKG)
        savedStateHandle.remove<String>(KEY_LABEL)
        savedStateHandle.remove<String>(KEY_CLASS)
        savedStateHandle.remove<Long>(KEY_USER_SERIAL)
        savedStateHandle.remove<Int>(KEY_TOTAL_SECONDS)
        savedStateHandle.remove<Int>(KEY_REMAINING_SECONDS)
        savedStateHandle.remove<Int>(KEY_DEFAULT_DURATION)
        _gateState.value = GateState.Idle
    }
}
