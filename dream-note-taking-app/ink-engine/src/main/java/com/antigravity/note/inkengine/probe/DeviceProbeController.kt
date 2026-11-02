package com.antigravity.note.inkengine.probe

import android.content.Context
import android.hardware.display.DisplayManager
import android.os.SystemClock
import android.view.Display
import android.view.InputDevice
import android.view.MotionEvent
import android.view.Surface
import android.view.Window
import android.view.WindowManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.roundToInt

class DeviceProbeController(
    private val context: Context
) {
    private val _state = MutableStateFlow(DeviceProbeState())
    val state: StateFlow<DeviceProbeState> = _state.asStateFlow()

    private var lastEventTimeNanos: Long = 0L
    private var lastEventHistoricalDeltaSum: Long = 0L
    private var historicalDeltaCount: Int = 0

    init {
        probeDisplayModes()
        probeStylusHardware()
    }

    fun probeDisplayModes(display: Display? = null) {
        val activeDisplay = display ?: run {
            val dm = context.getSystemService(Context.DISPLAY_SERVICE) as? DisplayManager
            dm?.getDisplay(Display.DEFAULT_DISPLAY)
        } ?: return

        val modes = activeDisplay.supportedModes.map { mode ->
            DisplayModeInfo(
                modeId = mode.modeId,
                width = mode.physicalWidth,
                height = mode.physicalHeight,
                refreshRate = mode.refreshRate,
                is144Hz = mode.refreshRate >= 143.5f,
                isActive = mode.modeId == activeDisplay.mode.modeId
            )
        }.sortedByDescending { it.refreshRate }

        val active = activeDisplay.mode
        val is144 = active.refreshRate >= 143.5f

        _state.update { current ->
            current.copy(
                activeRefreshRate = active.refreshRate,
                is144HzActive = is144,
                displayWidth = active.physicalWidth,
                displayHeight = active.physicalHeight,
                supportedModes = modes
            )
        }
    }

    /**
     * Request 144 Hz display mode explicitly on the canvas window.
     */
    fun request144Hz(window: Window) {
        val params = window.attributes

        // Target 144 Hz display mode
        val bestMode = _state.value.supportedModes.firstOrNull { it.is144Hz }
            ?: _state.value.supportedModes.maxByOrNull { it.refreshRate }

        if (bestMode != null) {
            params.preferredDisplayModeId = bestMode.modeId
        }

        // Request 144 Hz refresh rate
        params.preferredRefreshRate = 144.0f
        window.attributes = params

        probeDisplayModes(window.decorView.display)
    }

    /**
     * Release high refresh rate request when canvas is idle to save battery.
     */
    fun releaseHighRefreshRate(window: Window) {
        val params = window.attributes
        params.preferredDisplayModeId = 0
        params.preferredRefreshRate = 0.0f
        window.attributes = params

        probeDisplayModes(window.decorView.display)
    }

    /**
     * Inspect all connected input devices to check for stylus hardware capabilities.
     */
    fun probeStylusHardware() {
        val deviceIds = InputDevice.getDeviceIds()
        var foundStylus: StylusHardwareCapabilities? = null

        for (id in deviceIds) {
            val device = InputDevice.getDevice(id) ?: continue
            val sources = device.sources

            val hasStylusSource = (sources and InputDevice.SOURCE_STYLUS) == InputDevice.SOURCE_STYLUS ||
                    (sources and InputDevice.SOURCE_BLUETOOTH_STYLUS) != 0

            val pressureRange = device.getMotionRange(MotionEvent.AXIS_PRESSURE)
            val tiltRange = device.getMotionRange(MotionEvent.AXIS_TILT)
            val orientationRange = device.getMotionRange(MotionEvent.AXIS_ORIENTATION)
            val distanceRange = device.getMotionRange(MotionEvent.AXIS_DISTANCE)
            val touchMajorRange = device.getMotionRange(MotionEvent.AXIS_TOUCH_MAJOR)

            val reportedAxes = mutableListOf<String>()
            if (pressureRange != null) reportedAxes.add("Pressure (res: ${pressureRange.resolution})")
            if (tiltRange != null) reportedAxes.add("Tilt (min: ${tiltRange.min}, max: ${tiltRange.max})")
            if (orientationRange != null) reportedAxes.add("Orientation")
            if (distanceRange != null) reportedAxes.add("Distance (hover)")
            if (touchMajorRange != null) reportedAxes.add("TouchMajor (palm detection)")

            if (hasStylusSource || tiltRange != null || distanceRange != null) {
                foundStylus = StylusHardwareCapabilities(
                    deviceName = device.name,
                    deviceId = device.id,
                    isExternal = device.isExternal,
                    supportsPressure = pressureRange != null,
                    pressureMin = pressureRange?.min ?: 0f,
                    pressureMax = pressureRange?.max ?: 1f,
                    supportsTilt = tiltRange != null,
                    supportsOrientation = orientationRange != null,
                    supportsHoverDistance = distanceRange != null,
                    supportsTouchMajor = touchMajorRange != null,
                    likelyActiveStylus = distanceRange != null || (sources and InputDevice.SOURCE_BLUETOOTH_STYLUS) != 0,
                    reportedAxes = reportedAxes
                )
                break
            }
        }

        if (foundStylus != null) {
            _state.update { it.copy(stylusHardware = foundStylus) }
        }
    }

    /**
     * Feed MotionEvent into probe telemetry.
     */
    fun onMotionEvent(event: MotionEvent): LivePointerTelemetry {
        val actionMasked = event.actionMasked
        val actionStr = when (actionMasked) {
            MotionEvent.ACTION_DOWN -> "ACTION_DOWN"
            MotionEvent.ACTION_MOVE -> "ACTION_MOVE"
            MotionEvent.ACTION_UP -> "ACTION_UP"
            MotionEvent.ACTION_CANCEL -> "ACTION_CANCEL"
            MotionEvent.ACTION_HOVER_ENTER -> "HOVER_ENTER"
            MotionEvent.ACTION_HOVER_MOVE -> "HOVER_MOVE"
            MotionEvent.ACTION_HOVER_EXIT -> "HOVER_EXIT"
            MotionEvent.ACTION_POINTER_DOWN -> "POINTER_DOWN"
            MotionEvent.ACTION_POINTER_UP -> "POINTER_UP"
            else -> "ACTION_$actionMasked"
        }

        val pointerIndex = event.actionIndex.coerceIn(0, (event.pointerCount - 1).coerceAtLeast(0))
        val toolTypeInt = event.getToolType(pointerIndex)
        val toolTypeStr = when (toolTypeInt) {
            MotionEvent.TOOL_TYPE_STYLUS -> "TOOL_TYPE_STYLUS"
            MotionEvent.TOOL_TYPE_ERASER -> "TOOL_TYPE_ERASER"
            MotionEvent.TOOL_TYPE_FINGER -> "TOOL_TYPE_FINGER"
            MotionEvent.TOOL_TYPE_MOUSE -> "TOOL_TYPE_MOUSE"
            else -> "TOOL_TYPE_UNKNOWN($toolTypeInt)"
        }

        val isStylus = toolTypeInt == MotionEvent.TOOL_TYPE_STYLUS
        val isEraser = toolTypeInt == MotionEvent.TOOL_TYPE_ERASER
        val isFinger = toolTypeInt == MotionEvent.TOOL_TYPE_FINGER

        val x = event.getX(pointerIndex)
        val y = event.getY(pointerIndex)
        val pressure = event.getPressure(pointerIndex)

        // Tilt & orientation
        val tiltRad = event.getAxisValue(MotionEvent.AXIS_TILT, pointerIndex)
        val tiltDeg = (tiltRad * (180.0 / PI)).toFloat()
        val orientationRad = event.getAxisValue(MotionEvent.AXIS_ORIENTATION, pointerIndex)
        val orientationDeg = (orientationRad * (180.0 / PI)).toFloat()

        // Distance for hover
        val distance = event.getAxisValue(MotionEvent.AXIS_DISTANCE, pointerIndex)
        val isHovering = actionMasked == MotionEvent.ACTION_HOVER_MOVE ||
                actionMasked == MotionEvent.ACTION_HOVER_ENTER

        // Buttons
        val buttonState = event.buttonState
        val isPrimaryBtn = (buttonState and MotionEvent.BUTTON_STYLUS_PRIMARY) != 0 ||
                (buttonState and MotionEvent.BUTTON_PRIMARY) != 0
        val isSecondaryBtn = (buttonState and MotionEvent.BUTTON_STYLUS_SECONDARY) != 0 ||
                (buttonState and MotionEvent.BUTTON_SECONDARY) != 0
        val isEraserBtn = (buttonState and MotionEvent.BUTTON_TERTIARY) != 0 || isEraser

        val historySize = event.historySize
        val touchMajor = event.getTouchMajor(pointerIndex)
        val touchMinor = event.getTouchMinor(pointerIndex)

        // Measure historical delta and sample rate
        var estimatedSamplingRate = 0
        if (historySize > 0) {
            val firstHistTime = event.getHistoricalEventTime(0)
            val lastHistTime = event.getHistoricalEventTime(historySize - 1)
            val durationMs = (lastHistTime - firstHistTime).coerceAtLeast(1)
            if (durationMs > 0) {
                estimatedSamplingRate = ((historySize * 1000L) / durationMs).toInt().coerceIn(60, 1000)
            }
        }

        val nowMs = SystemClock.uptimeMillis()
        val dispatchLatencyMs = (nowMs - event.eventTime).coerceAtLeast(0).toFloat()

        val isPalm = isFinger && (touchMajor > 30f || (touchMajor > 20f && isStylus))

        val telemetry = LivePointerTelemetry(
            pointerId = event.getPointerId(pointerIndex),
            toolType = toolTypeStr,
            isStylus = isStylus,
            isEraser = isEraser,
            isFinger = isFinger,
            action = actionStr,
            x = x,
            y = y,
            pressure = pressure,
            tiltDegrees = tiltDeg,
            orientationDegrees = orientationDeg,
            distance = distance,
            isHovering = isHovering,
            isPrimaryButtonPressed = isPrimaryBtn,
            isSecondaryButtonPressed = isSecondaryBtn,
            isEraserButtonPressed = isEraserBtn,
            historySize = historySize,
            touchMajor = touchMajor,
            touchMinor = touchMinor,
            estimatedSamplingRateHz = estimatedSamplingRate,
            dispatchLatencyMs = dispatchLatencyMs,
            timestampNanos = SystemClock.elapsedRealtimeNanos()
        )

        _state.update { current ->
            val newMaxBatch = maxOf(current.maxHistoryBatchSizeObserved, historySize)
            val newMinPressure = if (pressure > 0.001f) minOf(current.minPressureObserved, pressure) else current.minPressureObserved
            val newMaxPressure = maxOf(current.maxPressureObserved, pressure)
            val newPalmCount = if (isPalm) current.palmTouchDetectedCount + 1 else current.palmTouchDetectedCount

            current.copy(
                liveTelemetry = telemetry,
                maxHistoryBatchSizeObserved = newMaxBatch,
                minPressureObserved = newMinPressure,
                maxPressureObserved = newMaxPressure,
                eventCount = current.eventCount + 1,
                palmTouchDetectedCount = newPalmCount
            )
        }

        return telemetry
    }
}
