package com.antigravity.note.ui.settings

import android.content.Context
import android.content.SharedPreferences
import com.antigravity.note.inkengine.canvas.CanvasTool
import com.antigravity.note.inkengine.palm.InputMode

class AppSettings(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("inkflow_app_settings", Context.MODE_PRIVATE)

    var inputMode: InputMode
        get() {
            val name = prefs.getString("input_mode", InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM.name)
            return try {
                InputMode.valueOf(name ?: InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM.name)
            } catch (e: Exception) {
                InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM
            }
        }
        set(value) = prefs.edit().putString("input_mode", value.name).apply()

    var isFingerEraserEnabled: Boolean
        get() = prefs.getBoolean("finger_eraser_enabled", false)
        set(value) = prefs.edit().putBoolean("finger_eraser_enabled", value).apply()

    var isHoldToEraseEnabled: Boolean
        get() = prefs.getBoolean("hold_to_erase_enabled", true)
        set(value) = prefs.edit().putBoolean("hold_to_erase_enabled", value).apply()

    var holdToEraseDelayMs: Long
        get() = prefs.getLong("hold_to_erase_delay_ms", 800L)
        set(value) = prefs.edit().putLong("hold_to_erase_delay_ms", value).apply()

    var isDebugOverlayEnabled: Boolean
        get() = prefs.getBoolean("debug_overlay_enabled", false)
        set(value) = prefs.edit().putBoolean("debug_overlay_enabled", value).apply()

    var selectedTool: CanvasTool
        get() {
            val name = prefs.getString("selected_tool", CanvasTool.PRESSURE_PEN.name)
            return try {
                CanvasTool.valueOf(name ?: CanvasTool.PRESSURE_PEN.name)
            } catch (e: Exception) {
                CanvasTool.PRESSURE_PEN
            }
        }
        set(value) = prefs.edit().putString("selected_tool", value.name).apply()

    var penColorArgb: Int
        get() = prefs.getInt("pen_color_argb", 0xFF111318.toInt())
        set(value) = prefs.edit().putInt("pen_color_argb", value).apply()

    var penWidth: Float
        get() = prefs.getFloat("pen_width", 4f)
        set(value) = prefs.edit().putFloat("pen_width", value).apply()

    var markerColorArgb: Int
        get() = prefs.getInt("marker_color_argb", 0xFF005AC1.toInt())
        set(value) = prefs.edit().putInt("marker_color_argb", value).apply()

    var markerWidth: Float
        get() = prefs.getFloat("marker_width", 14f)
        set(value) = prefs.edit().putFloat("marker_width", value).apply()

    var highlighterColorArgb: Int
        get() = prefs.getInt("highlighter_color_argb", 0xFFFFD600.toInt())
        set(value) = prefs.edit().putInt("highlighter_color_argb", value).apply()

    var highlighterWidth: Float
        get() = prefs.getFloat("highlighter_width", 34f)
        set(value) = prefs.edit().putFloat("highlighter_width", value).apply()

    var isInfiniteCanvas: Boolean
        get() = prefs.getBoolean("is_infinite_canvas", false)
        set(value) = prefs.edit().putBoolean("is_infinite_canvas", value).apply()
}
