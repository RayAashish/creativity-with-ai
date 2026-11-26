// app/src/main/java/com/raysi/launcher/data/repository/PreferencesRepository.kt
package com.raysi.launcher.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.domain.model.AppIconMode
import com.raysi.launcher.domain.model.StatusBarMode
import com.raysi.launcher.domain.model.SwipeDownAction
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.io.IOException
import java.util.Calendar
import java.util.TimeZone

private val Context.focusPreferencesDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "focus_launcher_preferences"
)

interface PreferencesRepository {
    val dailyFocusGoalFlow: Flow<String>
    val scratchpadContentFlow: Flow<String>
    val customAppLimitsFlow: Flow<Map<String, Int>>
    val lastAwayDurationFlow: Flow<Long>
    val dailyUnlockCountFlow: Flow<Int>
    val isStealthModeFlow: Flow<Boolean>
    val statusBarModeFlow: Flow<StatusBarMode>
    val appIconModeFlow: Flow<AppIconMode>
    val swipeDownActionFlow: Flow<SwipeDownAction>
    val dockAppsFlow: Flow<List<String>>
    val hasSeededDefaultsFlow: Flow<Boolean>
    val autoOpenDrawerKeyboardFlow: Flow<Boolean>
    val isSystemGrayscaleEnabledFlow: Flow<Boolean>

    suspend fun setDailyFocusGoal(goal: String)
    suspend fun clearDailyFocusGoal()
    suspend fun saveScratchpadContent(content: String)
    suspend fun setCustomAppLimit(packageName: String, limitMinutes: Int)
    suspend fun setStealthMode(enabled: Boolean)
    suspend fun setStatusBarMode(mode: StatusBarMode)
    suspend fun setAppIconMode(mode: AppIconMode)
    suspend fun setSwipeDownAction(action: SwipeDownAction)
    suspend fun setDockApps(keys: List<String>)
    suspend fun markDefaultsSeeded()
    suspend fun setAutoOpenDrawerKeyboard(enabled: Boolean)
    suspend fun setSystemGrayscaleEnabled(enabled: Boolean)
    suspend fun recordScreenOff(timestampMs: Long = System.currentTimeMillis())
    suspend fun recordUserPresent(timestampMs: Long = System.currentTimeMillis()): Int
    suspend fun getScratchpadContent(): String
}

class PreferencesRepositoryImpl(
    private val context: Context,
    private val dispatchers: FocusDispatchers
) : PreferencesRepository {

    companion object {
        val KEY_DAILY_FOCUS_GOAL = stringPreferencesKey("daily_focus_goal")
        val KEY_FOCUS_GOAL_TIMESTAMP = longPreferencesKey("focus_goal_timestamp")
        val KEY_SCRATCHPAD_CONTENT = stringPreferencesKey("scratchpad_content")
        val KEY_CUSTOM_APP_LIMITS = stringPreferencesKey("custom_app_limits")
        val KEY_LAST_SCREEN_OFF_TIME = longPreferencesKey("last_screen_off_time")
        val KEY_LAST_AWAY_DURATION = longPreferencesKey("last_away_duration")
        val KEY_DAILY_UNLOCK_COUNT = intPreferencesKey("daily_unlock_count")
        val KEY_LAST_UNLOCK_DAY_OF_YEAR = intPreferencesKey("last_unlock_day_of_year")
        val KEY_LAST_UNLOCK_YEAR = intPreferencesKey("last_unlock_year")
        val KEY_STEALTH_MODE = booleanPreferencesKey("stealth_mode")
        val KEY_STATUS_BAR_MODE = intPreferencesKey("status_bar_mode")
        val KEY_APP_ICON_MODE = intPreferencesKey("app_icon_mode")
        val KEY_SWIPE_DOWN_ACTION = intPreferencesKey("swipe_down_action")
        val KEY_DOCK_APPS = stringPreferencesKey("dock_apps")
        val KEY_HAS_SEEDED_DEFAULTS = booleanPreferencesKey("has_seeded_defaults")
        val KEY_AUTO_OPEN_DRAWER_KEYBOARD = booleanPreferencesKey("auto_open_drawer_keyboard")
        val KEY_SYSTEM_GRAYSCALE = booleanPreferencesKey("system_grayscale")

        /**
         * Determines if a focus goal saved at [savedTimestampMs] has expired
         * past the 04:00 AM daily rollover boundary.
         */
        fun isFocusGoalExpired(
            savedTimestampMs: Long,
            nowMs: Long,
            timeZone: TimeZone = TimeZone.getDefault()
        ): Boolean {
            if (savedTimestampMs <= 0L) return true

            val cal = Calendar.getInstance(timeZone).apply { timeInMillis = nowMs }
            val currentHour = cal.get(Calendar.HOUR_OF_DAY)

            val todayFourAm = (cal.clone() as Calendar).apply {
                set(Calendar.HOUR_OF_DAY, 4)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            val cutoffMs = if (currentHour >= 4) {
                todayFourAm.timeInMillis
            } else {
                todayFourAm.timeInMillis - (24 * 60 * 60 * 1000L)
            }

            return savedTimestampMs < cutoffMs
        }

        fun parseLimits(raw: String?): Map<String, Int> {
            if (raw.isNullOrBlank()) return emptyMap()
            val result = mutableMapOf<String, Int>()
            val entries = raw.split(";")
            for (entry in entries) {
                val parts = entry.split("=")
                if (parts.size == 2) {
                    val pkg = parts[0].trim()
                    val limit = parts[1].trim().toIntOrNull()
                    if (pkg.isNotEmpty() && limit != null && limit > 0) {
                        result[pkg] = limit
                    }
                }
            }
            return result
        }

        fun serializeLimits(map: Map<String, Int>): String {
            return map.entries.joinToString(";") { "${it.key}=${it.value}" }
        }
    }

    private val dataStore = context.focusPreferencesDataStore

    override val dailyFocusGoalFlow: Flow<String> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs ->
            val goal = prefs[KEY_DAILY_FOCUS_GOAL].orEmpty()
            val timestamp = prefs[KEY_FOCUS_GOAL_TIMESTAMP] ?: 0L
            if (goal.isNotBlank() && isFocusGoalExpired(timestamp, System.currentTimeMillis())) {
                ""
            } else {
                goal
            }
        }

    override val scratchpadContentFlow: Flow<String> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs -> prefs[KEY_SCRATCHPAD_CONTENT].orEmpty() }

    override val customAppLimitsFlow: Flow<Map<String, Int>> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs -> parseLimits(prefs[KEY_CUSTOM_APP_LIMITS]) }

    override val lastAwayDurationFlow: Flow<Long> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs -> prefs[KEY_LAST_AWAY_DURATION] ?: 0L }

    override val dailyUnlockCountFlow: Flow<Int> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs ->
            val nowCal = Calendar.getInstance()
            val currentDayOfYear = nowCal.get(Calendar.DAY_OF_YEAR)
            val currentYear = nowCal.get(Calendar.YEAR)
            val storedDayOfYear = prefs[KEY_LAST_UNLOCK_DAY_OF_YEAR] ?: -1
            val storedYear = prefs[KEY_LAST_UNLOCK_YEAR] ?: -1

            if (currentDayOfYear == storedDayOfYear && currentYear == storedYear) {
                prefs[KEY_DAILY_UNLOCK_COUNT] ?: 0
            } else {
                0
            }
        }

    override val statusBarModeFlow: Flow<StatusBarMode> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs ->
            val explicit = prefs[KEY_STATUS_BAR_MODE]
            if (explicit != null) {
                StatusBarMode.fromStorage(explicit)
            } else {
                // Default to FocusLauncher's own Custom Status Bar
                StatusBarMode.CUSTOM
            }
        }

    override val isStealthModeFlow: Flow<Boolean> = statusBarModeFlow
        .map { it == StatusBarMode.STEALTH }

    override val appIconModeFlow: Flow<AppIconMode> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs -> AppIconMode.fromStorage(prefs[KEY_APP_ICON_MODE] ?: 0) }

    override val swipeDownActionFlow: Flow<SwipeDownAction> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs -> SwipeDownAction.fromStorage(prefs[KEY_SWIPE_DOWN_ACTION] ?: 0) }

    override val dockAppsFlow: Flow<List<String>> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs ->
            val raw = prefs[KEY_DOCK_APPS].orEmpty()
            if (raw.isBlank()) emptyList() else raw.split(";;").filter { it.isNotBlank() }
        }

    override val hasSeededDefaultsFlow: Flow<Boolean> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs -> prefs[KEY_HAS_SEEDED_DEFAULTS] ?: false }

    override val autoOpenDrawerKeyboardFlow: Flow<Boolean> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs -> prefs[KEY_AUTO_OPEN_DRAWER_KEYBOARD] ?: false }

    override val isSystemGrayscaleEnabledFlow: Flow<Boolean> = dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { prefs -> prefs[KEY_SYSTEM_GRAYSCALE] ?: false }

    override suspend fun setStealthMode(enabled: Boolean): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_STEALTH_MODE] = enabled
            prefs[KEY_STATUS_BAR_MODE] = if (enabled) StatusBarMode.STEALTH.storageValue else StatusBarMode.CUSTOM.storageValue
        }
    }

    override suspend fun setStatusBarMode(mode: StatusBarMode): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_STATUS_BAR_MODE] = mode.storageValue
            prefs[KEY_STEALTH_MODE] = (mode == StatusBarMode.STEALTH)
        }
    }

    override suspend fun setAppIconMode(mode: AppIconMode): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_APP_ICON_MODE] = mode.storageValue
        }
    }

    override suspend fun setSwipeDownAction(action: SwipeDownAction): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_SWIPE_DOWN_ACTION] = action.storageValue
        }
    }

    override suspend fun setDockApps(keys: List<String>): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_DOCK_APPS] = keys.take(5).joinToString(";;")
        }
    }

    override suspend fun markDefaultsSeeded(): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_HAS_SEEDED_DEFAULTS] = true
        }
    }

    override suspend fun setAutoOpenDrawerKeyboard(enabled: Boolean): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_AUTO_OPEN_DRAWER_KEYBOARD] = enabled
        }
    }

    override suspend fun setSystemGrayscaleEnabled(enabled: Boolean): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_SYSTEM_GRAYSCALE] = enabled
        }
    }

    override suspend fun setDailyFocusGoal(goal: String): Unit = withContext(dispatchers.io) {
        val trimmed = goal.trim()
        val now = System.currentTimeMillis()
        dataStore.edit { prefs ->
            prefs[KEY_DAILY_FOCUS_GOAL] = trimmed
            prefs[KEY_FOCUS_GOAL_TIMESTAMP] = now
        }
    }

    override suspend fun clearDailyFocusGoal(): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_DAILY_FOCUS_GOAL] = ""
            prefs[KEY_FOCUS_GOAL_TIMESTAMP] = 0L
        }
    }

    override suspend fun saveScratchpadContent(content: String): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_SCRATCHPAD_CONTENT] = content
        }
    }

    override suspend fun setCustomAppLimit(packageName: String, limitMinutes: Int): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            val currentLimits = parseLimits(prefs[KEY_CUSTOM_APP_LIMITS]).toMutableMap()
            if (limitMinutes <= 0) {
                currentLimits.remove(packageName)
            } else {
                currentLimits[packageName] = limitMinutes
            }
            prefs[KEY_CUSTOM_APP_LIMITS] = serializeLimits(currentLimits)
        }
    }

    override suspend fun recordScreenOff(timestampMs: Long): Unit = withContext(dispatchers.io) {
        dataStore.edit { prefs ->
            prefs[KEY_LAST_SCREEN_OFF_TIME] = timestampMs
        }
    }

    override suspend fun recordUserPresent(timestampMs: Long): Int = withContext(dispatchers.io) {
        var count = 0
        dataStore.edit { prefs ->
            val screenOffTime = prefs[KEY_LAST_SCREEN_OFF_TIME] ?: 0L
            if (screenOffTime > 0L && timestampMs > screenOffTime) {
                val awayMs = timestampMs - screenOffTime
                prefs[KEY_LAST_AWAY_DURATION] = awayMs
            }

            val nowCal = Calendar.getInstance().apply { timeInMillis = timestampMs }
            val currentDayOfYear = nowCal.get(Calendar.DAY_OF_YEAR)
            val currentYear = nowCal.get(Calendar.YEAR)
            val storedDayOfYear = prefs[KEY_LAST_UNLOCK_DAY_OF_YEAR] ?: -1
            val storedYear = prefs[KEY_LAST_UNLOCK_YEAR] ?: -1

            val currentCount = if (currentDayOfYear == storedDayOfYear && currentYear == storedYear) {
                prefs[KEY_DAILY_UNLOCK_COUNT] ?: 0
            } else {
                0
            }

            count = currentCount + 1
            prefs[KEY_DAILY_UNLOCK_COUNT] = count
            prefs[KEY_LAST_UNLOCK_DAY_OF_YEAR] = currentDayOfYear
            prefs[KEY_LAST_UNLOCK_YEAR] = currentYear
        }
        count
    }

    override suspend fun getScratchpadContent(): String = withContext(dispatchers.io) {
        var content = ""
        dataStore.edit { prefs ->
            content = prefs[KEY_SCRATCHPAD_CONTENT].orEmpty()
        }
        content
    }
}
