package com.mindforge.app.data.local.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.mindforge.app.core.theme.AppThemeMode
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "mindforge_preferences")

data class UserPreferences(
    val themeMode: AppThemeMode = AppThemeMode.SYSTEM,
    val dynamicColor: Boolean = false,
    val displayName: String = "Mind Athlete",
    val avatarUri: String? = null,
    val builtInAvatarIndex: Int = 0,
    val primaryGoal: String = "ALL_ROUNDER",
    val soundEnabled: Boolean = true,
    val hapticsEnabled: Boolean = true,
    val reduceMotion: Boolean = false,
    val reminderEnabled: Boolean = false,
    val reminderHour: Int = 20,
    val reminderMinute: Int = 0,
    val streakRule: String = "ANY_SESSION", // "ANY_SESSION" or "DAILY_CHALLENGE"
    val isOnboardingCompleted: Boolean = false,
    val playerLevel: Int = 1,
    val currentXp: Int = 0
)

@Singleton
class UserPreferencesRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val dataStore = context.dataStore

    private object PreferencesKeys {
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val DYNAMIC_COLOR = booleanPreferencesKey("dynamic_color")
        val DISPLAY_NAME = stringPreferencesKey("display_name")
        val AVATAR_URI = stringPreferencesKey("avatar_uri")
        val BUILT_IN_AVATAR_INDEX = intPreferencesKey("built_in_avatar_index")
        val PRIMARY_GOAL = stringPreferencesKey("primary_goal")
        val SOUND_ENABLED = booleanPreferencesKey("sound_enabled")
        val HAPTICS_ENABLED = booleanPreferencesKey("haptics_enabled")
        val REDUCE_MOTION = booleanPreferencesKey("reduce_motion")
        val REMINDER_ENABLED = booleanPreferencesKey("reminder_enabled")
        val REMINDER_HOUR = intPreferencesKey("reminder_hour")
        val REMINDER_MINUTE = intPreferencesKey("reminder_minute")
        val STREAK_RULE = stringPreferencesKey("streak_rule")
        val ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
        val PLAYER_LEVEL = intPreferencesKey("player_level")
        val CURRENT_XP = intPreferencesKey("current_xp")
    }

    val userPreferencesFlow: Flow<UserPreferences> = dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            val themeModeStr = preferences[PreferencesKeys.THEME_MODE] ?: AppThemeMode.SYSTEM.name
            val themeMode = runCatching { AppThemeMode.valueOf(themeModeStr) }.getOrDefault(AppThemeMode.SYSTEM)
            val dynamicColor = preferences[PreferencesKeys.DYNAMIC_COLOR] ?: false
            val displayName = preferences[PreferencesKeys.DISPLAY_NAME] ?: "Mind Athlete"
            val avatarUri = preferences[PreferencesKeys.AVATAR_URI]
            val builtInAvatarIndex = preferences[PreferencesKeys.BUILT_IN_AVATAR_INDEX] ?: 0
            val primaryGoal = preferences[PreferencesKeys.PRIMARY_GOAL] ?: "ALL_ROUNDER"
            val soundEnabled = preferences[PreferencesKeys.SOUND_ENABLED] ?: true
            val hapticsEnabled = preferences[PreferencesKeys.HAPTICS_ENABLED] ?: true
            val reduceMotion = preferences[PreferencesKeys.REDUCE_MOTION] ?: false
            val reminderEnabled = preferences[PreferencesKeys.REMINDER_ENABLED] ?: false
            val reminderHour = preferences[PreferencesKeys.REMINDER_HOUR] ?: 20
            val reminderMinute = preferences[PreferencesKeys.REMINDER_MINUTE] ?: 0
            val streakRule = preferences[PreferencesKeys.STREAK_RULE] ?: "ANY_SESSION"
            val isOnboardingCompleted = preferences[PreferencesKeys.ONBOARDING_COMPLETED] ?: false
            val playerLevel = preferences[PreferencesKeys.PLAYER_LEVEL] ?: 1
            val currentXp = preferences[PreferencesKeys.CURRENT_XP] ?: 0

            UserPreferences(
                themeMode = themeMode,
                dynamicColor = dynamicColor,
                displayName = displayName,
                avatarUri = avatarUri,
                builtInAvatarIndex = builtInAvatarIndex,
                primaryGoal = primaryGoal,
                soundEnabled = soundEnabled,
                hapticsEnabled = hapticsEnabled,
                reduceMotion = reduceMotion,
                reminderEnabled = reminderEnabled,
                reminderHour = reminderHour,
                reminderMinute = reminderMinute,
                streakRule = streakRule,
                isOnboardingCompleted = isOnboardingCompleted,
                playerLevel = playerLevel,
                currentXp = currentXp
            )
        }

    suspend fun setThemeMode(mode: AppThemeMode) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.THEME_MODE] = mode.name
        }
    }

    suspend fun setDynamicColor(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.DYNAMIC_COLOR] = enabled
        }
    }

    suspend fun updateProfile(name: String, avatarUri: String?, builtInAvatarIndex: Int) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.DISPLAY_NAME] = name.trim().ifEmpty { "Mind Athlete" }
            if (avatarUri != null) {
                preferences[PreferencesKeys.AVATAR_URI] = avatarUri
            } else {
                preferences.remove(PreferencesKeys.AVATAR_URI)
            }
            preferences[PreferencesKeys.BUILT_IN_AVATAR_INDEX] = builtInAvatarIndex
        }
    }

    suspend fun setPrimaryGoal(goal: String) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.PRIMARY_GOAL] = goal
        }
    }

    suspend fun setSoundEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.SOUND_ENABLED] = enabled
        }
    }

    suspend fun setHapticsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.HAPTICS_ENABLED] = enabled
        }
    }

    suspend fun setReduceMotion(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.REDUCE_MOTION] = enabled
        }
    }

    suspend fun setReminder(enabled: Boolean, hour: Int, minute: Int) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.REMINDER_ENABLED] = enabled
            preferences[PreferencesKeys.REMINDER_HOUR] = hour
            preferences[PreferencesKeys.REMINDER_MINUTE] = minute
        }
    }

    suspend fun setStreakRule(rule: String) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.STREAK_RULE] = rule
        }
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.ONBOARDING_COMPLETED] = completed
        }
    }

    suspend fun updateProgression(level: Int, xp: Int) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.PLAYER_LEVEL] = level
            preferences[PreferencesKeys.CURRENT_XP] = xp
        }
    }

    suspend fun clearPreferences() {
        dataStore.edit { it.clear() }
    }
}
