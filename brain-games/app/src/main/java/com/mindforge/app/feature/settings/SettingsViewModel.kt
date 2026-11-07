package com.mindforge.app.feature.settings

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import android.net.Uri
import com.mindforge.app.core.reminder.ReminderScheduler
import com.mindforge.app.core.theme.AppThemeMode
import com.mindforge.app.data.local.db.dao.AchievementDao
import com.mindforge.app.data.local.db.dao.DailyActivityDao
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.dao.SessionDao
import com.mindforge.app.data.local.db.dao.StreakDao
import com.mindforge.app.data.local.preferences.UserPreferences
import com.mindforge.app.data.local.preferences.UserPreferencesRepository
import com.mindforge.app.domain.backup.BackupRestoreEngine
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesRepository: UserPreferencesRepository,
    private val reminderScheduler: ReminderScheduler,
    private val sessionDao: SessionDao,
    private val gameStatDao: GameStatDao,
    private val dailyActivityDao: DailyActivityDao,
    private val streakDao: StreakDao,
    private val achievementDao: AchievementDao,
    private val backupRestoreEngine: BackupRestoreEngine
) : ViewModel() {

    val preferences: StateFlow<UserPreferences> = preferencesRepository.userPreferencesFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = UserPreferences()
        )

    fun setThemeMode(mode: AppThemeMode) {
        viewModelScope.launch {
            preferencesRepository.setThemeMode(mode)
        }
    }

    fun setDynamicColor(enabled: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setDynamicColor(enabled)
        }
    }

    fun setSoundEnabled(enabled: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setSoundEnabled(enabled)
        }
    }

    fun setHapticsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setHapticsEnabled(enabled)
        }
    }

    fun setReduceMotion(enabled: Boolean) {
        viewModelScope.launch {
            preferencesRepository.setReduceMotion(enabled)
        }
    }

    fun setReminderEnabled(enabled: Boolean) {
        viewModelScope.launch {
            val current = preferences.value
            preferencesRepository.setReminder(enabled, current.reminderHour, current.reminderMinute)
            if (enabled) {
                reminderScheduler.scheduleDailyReminder(current.reminderHour, current.reminderMinute)
            } else {
                reminderScheduler.cancelReminder()
            }
        }
    }

    fun updateReminderTime(hour: Int, minute: Int) {
        viewModelScope.launch {
            val isEnabled = preferences.value.reminderEnabled
            preferencesRepository.setReminder(isEnabled, hour, minute)
            if (isEnabled) {
                reminderScheduler.scheduleDailyReminder(hour, minute)
            }
        }
    }

    fun setStreakRule(rule: String) {
        viewModelScope.launch {
            preferencesRepository.setStreakRule(rule)
        }
    }

    fun exportData(targetUri: Uri, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val res = backupRestoreEngine.exportBackup(targetUri)
            if (res.isSuccess) onResult(true, null)
            else onResult(false, res.exceptionOrNull()?.message)
        }
    }

    fun importData(sourceUri: Uri, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val res = backupRestoreEngine.importBackup(sourceUri)
            if (res.isSuccess) onResult(true, null)
            else onResult(false, res.exceptionOrNull()?.message)
        }
    }

    fun resetAllProgress(onComplete: () -> Unit) {
        viewModelScope.launch {
            sessionDao.clearAll()
            gameStatDao.clearAll()
            dailyActivityDao.clearAll()
            streakDao.clearAll()
            achievementDao.clearAll()
            preferencesRepository.updateProgression(level = 1, xp = 0)
            onComplete()
        }
    }
}
