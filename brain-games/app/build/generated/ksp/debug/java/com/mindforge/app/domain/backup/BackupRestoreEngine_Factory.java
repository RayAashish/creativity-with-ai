package com.mindforge.app.domain.backup;

import android.content.Context;
import com.mindforge.app.data.local.db.dao.AchievementDao;
import com.mindforge.app.data.local.db.dao.DailyActivityDao;
import com.mindforge.app.data.local.db.dao.GameStatDao;
import com.mindforge.app.data.local.db.dao.SessionDao;
import com.mindforge.app.data.local.db.dao.StreakDao;
import com.mindforge.app.data.local.preferences.UserPreferencesRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
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
public final class BackupRestoreEngine_Factory implements Factory<BackupRestoreEngine> {
  private final Provider<Context> contextProvider;

  private final Provider<SessionDao> sessionDaoProvider;

  private final Provider<GameStatDao> gameStatDaoProvider;

  private final Provider<DailyActivityDao> dailyActivityDaoProvider;

  private final Provider<StreakDao> streakDaoProvider;

  private final Provider<AchievementDao> achievementDaoProvider;

  private final Provider<UserPreferencesRepository> preferencesRepositoryProvider;

  public BackupRestoreEngine_Factory(Provider<Context> contextProvider,
      Provider<SessionDao> sessionDaoProvider, Provider<GameStatDao> gameStatDaoProvider,
      Provider<DailyActivityDao> dailyActivityDaoProvider, Provider<StreakDao> streakDaoProvider,
      Provider<AchievementDao> achievementDaoProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    this.contextProvider = contextProvider;
    this.sessionDaoProvider = sessionDaoProvider;
    this.gameStatDaoProvider = gameStatDaoProvider;
    this.dailyActivityDaoProvider = dailyActivityDaoProvider;
    this.streakDaoProvider = streakDaoProvider;
    this.achievementDaoProvider = achievementDaoProvider;
    this.preferencesRepositoryProvider = preferencesRepositoryProvider;
  }

  @Override
  public BackupRestoreEngine get() {
    return newInstance(contextProvider.get(), sessionDaoProvider.get(), gameStatDaoProvider.get(), dailyActivityDaoProvider.get(), streakDaoProvider.get(), achievementDaoProvider.get(), preferencesRepositoryProvider.get());
  }

  public static BackupRestoreEngine_Factory create(Provider<Context> contextProvider,
      Provider<SessionDao> sessionDaoProvider, Provider<GameStatDao> gameStatDaoProvider,
      Provider<DailyActivityDao> dailyActivityDaoProvider, Provider<StreakDao> streakDaoProvider,
      Provider<AchievementDao> achievementDaoProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    return new BackupRestoreEngine_Factory(contextProvider, sessionDaoProvider, gameStatDaoProvider, dailyActivityDaoProvider, streakDaoProvider, achievementDaoProvider, preferencesRepositoryProvider);
  }

  public static BackupRestoreEngine newInstance(Context context, SessionDao sessionDao,
      GameStatDao gameStatDao, DailyActivityDao dailyActivityDao, StreakDao streakDao,
      AchievementDao achievementDao, UserPreferencesRepository preferencesRepository) {
    return new BackupRestoreEngine(context, sessionDao, gameStatDao, dailyActivityDao, streakDao, achievementDao, preferencesRepository);
  }
}
