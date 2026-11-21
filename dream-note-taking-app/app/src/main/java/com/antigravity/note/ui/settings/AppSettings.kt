package com.antigravity.note.ui.settings

import android.content.Context
import android.content.SharedPreferences
import com.antigravity.note.inkengine.canvas.BarrelButtonAction
import com.antigravity.note.inkengine.canvas.CanvasTool
import com.antigravity.note.inkengine.canvas.StationaryLongPressAction
import com.antigravity.note.inkengine.eraser.EraserMode
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

    var eraserMode: EraserMode
        get() {
            val name = prefs.getString("eraser_mode", EraserMode.PRECISION.name)
            return try {
                EraserMode.valueOf(name ?: EraserMode.PRECISION.name)
            } catch (e: Exception) {
                EraserMode.PRECISION
            }
        }
        set(value) = prefs.edit().putString("eraser_mode", value.name).apply()

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
        get() = prefs.getInt("marker_color_argb", 0xFFF59E0B.toInt())
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

    var isDarkMode: Boolean
        get() = prefs.getBoolean("is_dark_mode", false)
        set(value) = prefs.edit().putBoolean("is_dark_mode", value).apply()

    var isFloatingWindowDarkMode: Boolean?
        get() {
            return if (prefs.contains("is_floating_window_dark_mode")) {
                prefs.getBoolean("is_floating_window_dark_mode", false)
            } else null
        }
        set(value) {
            if (value == null) {
                prefs.edit().remove("is_floating_window_dark_mode").apply()
            } else {
                prefs.edit().putBoolean("is_floating_window_dark_mode", value).apply()
            }
        }

    var lastActiveNotebookId: String?
        get() = prefs.getString("last_active_notebook_id", null)
        set(value) = prefs.edit().putString("last_active_notebook_id", value).apply()

    var lastActivePageId: String?
        get() = prefs.getString("last_active_page_id", null)
        set(value) = prefs.edit().putString("last_active_page_id", value).apply()

    var isBottomBarLocked: Boolean
        get() = prefs.getBoolean("is_bottom_bar_locked", false)
        set(value) = prefs.edit().putBoolean("is_bottom_bar_locked", value).apply()

    var isBottomBarMinimized: Boolean
        get() = prefs.getBoolean("is_bottom_bar_minimized", false)
        set(value) = prefs.edit().putBoolean("is_bottom_bar_minimized", value).apply()

    var isAccidentalTouchProtectionEnabled: Boolean
        get() = prefs.getBoolean("is_accidental_touch_protection", true)
        set(value) = prefs.edit().putBoolean("is_accidental_touch_protection", value).apply()

    var isTwoFingerUndoEnabled: Boolean
        get() = prefs.getBoolean("is_two_finger_undo_enabled", true)
        set(value) = prefs.edit().putBoolean("is_two_finger_undo_enabled", value).apply()

    var lastViewportOffsetX: Float
        get() = prefs.getFloat("last_viewport_offset_x", 0f)
        set(value) = prefs.edit().putFloat("last_viewport_offset_x", value).apply()

    var lastViewportOffsetY: Float
        get() = prefs.getFloat("last_viewport_offset_y", 0f)
        set(value) = prefs.edit().putFloat("last_viewport_offset_y", value).apply()

    var lastViewportZoomScale: Float
        get() = prefs.getFloat("last_viewport_zoom_scale", 1.0f)
        set(value) = prefs.edit().putFloat("last_viewport_zoom_scale", value).apply()

    // --- Stylus & Hardware Settings ---
    var stationaryLongPressAction: StationaryLongPressAction
        get() {
            val name = prefs.getString("stationary_long_press_action", StationaryLongPressAction.ERASER.name)
            return try {
                StationaryLongPressAction.valueOf(name ?: StationaryLongPressAction.ERASER.name)
            } catch (e: Exception) {
                StationaryLongPressAction.ERASER
            }
        }
        set(value) = prefs.edit().putString("stationary_long_press_action", value.name).apply()

    var barrelButtonAction: BarrelButtonAction
        get() {
            val name = prefs.getString("barrel_button_action", BarrelButtonAction.ERASER.name)
            return try {
                BarrelButtonAction.valueOf(name ?: BarrelButtonAction.ERASER.name)
            } catch (e: Exception) {
                BarrelButtonAction.ERASER
            }
        }
        set(value) = prefs.edit().putString("barrel_button_action", value.name).apply()

    var holdToSnapDelayMs: Long
        get() = prefs.getLong("hold_to_snap_delay_ms", 400L)
        set(value) = prefs.edit().putLong("hold_to_snap_delay_ms", value.coerceIn(250L, 700L)).apply()

    var isHoldToSnapEnabled: Boolean
        get() = prefs.getBoolean("is_hold_to_snap_enabled", true)
        set(value) = prefs.edit().putBoolean("is_hold_to_snap_enabled", value).apply()

    // --- User Profile & Study Goals ---
    var userName: String
        get() = prefs.getString("user_name", "Aashish K. Ray") ?: "Aashish K. Ray"
        set(value) = prefs.edit().putString("user_name", value).apply()

    var userBio: String
        get() = prefs.getString("user_bio", "DSA & System Design Prep") ?: "DSA & System Design Prep"
        set(value) = prefs.edit().putString("user_bio", value).apply()

    var userGoal: String
        get() = prefs.getString("user_goal", "3 LeetCode Problems / Day") ?: "3 LeetCode Problems / Day"
        set(value) = prefs.edit().putString("user_goal", value).apply()

    var userAvatarInitials: String
        get() = prefs.getString("user_avatar_initials", "AR") ?: "AR"
        set(value) = prefs.edit().putString("user_avatar_initials", value).apply()

    var defaultPaperTemplate: String
        get() = prefs.getString("default_paper_template", "GRID") ?: "GRID"
        set(value) = prefs.edit().putString("default_paper_template", value).apply()

    var defaultStrokeWidth: Float
        get() = prefs.getFloat("default_stroke_width", 4f)
        set(value) = prefs.edit().putFloat("default_stroke_width", value).apply()

    // --- Persistent Sidebar Collapse/Expand State ---
    var collapsedFolderIds: Set<String>
        get() = prefs.getStringSet("collapsed_folder_ids", emptySet()) ?: emptySet()
        set(value) = prefs.edit().putStringSet("collapsed_folder_ids", value).apply()

    var collapsedNotebookIds: Set<String>
        get() = prefs.getStringSet("collapsed_notebook_ids", emptySet()) ?: emptySet()
        set(value) = prefs.edit().putStringSet("collapsed_notebook_ids", value).apply()
}
