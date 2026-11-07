package com.mindforge.app.feature.settings;

import android.content.Context;
import com.mindforge.app.core.reminder.ReminderScheduler;
import com.mindforge.app.data.local.db.dao.AchievementDao;
import com.mindforge.app.data.local.db.dao.DailyActivityDao;
import com.mindforge.app.data.local.db.dao.GameStatDao;
import com.mindforge.app.data.local.db.dao.SessionDao;
import com.mindforge.app.data.local.db.dao.StreakDao;
import com.mindforge.app.data.local.preferences.UserPreferencesRepository;
import com.mindforge.app.domain.backup.BackupRestoreEngine;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
@QualifierMetadata("dagger.hilt.android.qualifiers.ApplicationContext")
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava",
    "cast"
})
public final class SettingsViewModel_Factory implements Factory<SettingsViewModel> {
  private final Provider<Context> contextProvider;

  private final Provider<UserPreferencesRepository> preferencesRepositoryProvider;

  private final Provider<ReminderScheduler> reminderSchedulerProvider;

  private final Provider<SessionDao> sessionDaoProvider;

  private final Provider<GameStatDao> gameStatDaoProvider;

  private final Provider<DailyActivityDao> dailyActivityDaoProvider;

  private final Provider<StreakDao> streakDaoProvider;

  private final Provider<AchievementDao> achievementDaoProvider;

  private final Provider<BackupRestoreEngine> backupRestoreEngineProvider;

  public SettingsViewModel_Factory(Provider<Context> contextProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider,
      Provider<ReminderScheduler> reminderSchedulerProvider,
      Provider<SessionDao> sessionDaoProvider, Provider<GameStatDao> gameStatDaoProvider,
      Provider<DailyActivityDao> dailyActivityDaoProvider, Provider<StreakDao> streakDaoProvider,
      Provider<AchievementDao> achievementDaoProvider,
      Provider<BackupRestoreEngine> backupRestoreEngineProvider) {
    this.contextProvider = contextProvider;
    this.preferencesRepositoryProvider = preferencesRepositoryProvider;
    this.reminderSchedulerProvider = reminderSchedulerProvider;
    this.sessionDaoProvider = sessionDaoProvider;
    this.gameStatDaoProvider = gameStatDaoProvider;
    this.dailyActivityDaoProvider = dailyActivityDaoProvider;
    this.streakDaoProvider = streakDaoProvider;
    this.achievementDaoProvider = achievementDaoProvider;
    this.backupRestoreEngineProvider = backupRestoreEngineProvider;
  }

  @Override
  public SettingsViewModel get() {
    return newInstance(contextProvider.get(), preferencesRepositoryProvider.get(), reminderSchedulerProvider.get(), sessionDaoProvider.get(), gameStatDaoProvider.get(), dailyActivityDaoProvider.get(), streakDaoProvider.get(), achievementDaoProvider.get(), backupRestoreEngineProvider.get());
  }

  public static SettingsViewModel_Factory create(Provider<Context> contextProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider,
      Provider<ReminderScheduler> reminderSchedulerProvider,
      Provider<SessionDao> sessionDaoProvider, Provider<GameStatDao> gameStatDaoProvider,
      Provider<DailyActivityDao> dailyActivityDaoProvider, Provider<StreakDao> streakDaoProvider,
      Provider<AchievementDao> achievementDaoProvider,
      Provider<BackupRestoreEngine> backupRestoreEngineProvider) {
    return new SettingsViewModel_Factory(contextProvider, preferencesRepositoryProvider, reminderSchedulerProvider, sessionDaoProvider, gameStatDaoProvider, dailyActivityDaoProvider, streakDaoProvider, achievementDaoProvider, backupRestoreEngineProvider);
  }

  public static SettingsViewModel newInstance(Context context,
      UserPreferencesRepository preferencesRepository, ReminderScheduler reminderScheduler,
      SessionDao sessionDao, GameStatDao gameStatDao, DailyActivityDao dailyActivityDao,
      StreakDao streakDao, AchievementDao achievementDao, BackupRestoreEngine backupRestoreEngine) {
    return new SettingsViewModel(context, preferencesRepository, reminderScheduler, sessionDao, gameStatDao, dailyActivityDao, streakDao, achievementDao, backupRestoreEngine);
  }
}
