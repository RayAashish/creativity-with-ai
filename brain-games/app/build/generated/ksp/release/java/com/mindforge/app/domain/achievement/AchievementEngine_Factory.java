package com.mindforge.app.domain.achievement;

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
@QualifierMetadata
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
public final class AchievementEngine_Factory implements Factory<AchievementEngine> {
  private final Provider<AchievementDao> achievementDaoProvider;

  private final Provider<SessionDao> sessionDaoProvider;

  private final Provider<GameStatDao> gameStatDaoProvider;

  private final Provider<DailyActivityDao> dailyActivityDaoProvider;

  private final Provider<StreakDao> streakDaoProvider;

  private final Provider<UserPreferencesRepository> preferencesRepositoryProvider;

  public AchievementEngine_Factory(Provider<AchievementDao> achievementDaoProvider,
      Provider<SessionDao> sessionDaoProvider, Provider<GameStatDao> gameStatDaoProvider,
      Provider<DailyActivityDao> dailyActivityDaoProvider, Provider<StreakDao> streakDaoProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    this.achievementDaoProvider = achievementDaoProvider;
    this.sessionDaoProvider = sessionDaoProvider;
    this.gameStatDaoProvider = gameStatDaoProvider;
    this.dailyActivityDaoProvider = dailyActivityDaoProvider;
    this.streakDaoProvider = streakDaoProvider;
    this.preferencesRepositoryProvider = preferencesRepositoryProvider;
  }

  @Override
  public AchievementEngine get() {
    return newInstance(achievementDaoProvider.get(), sessionDaoProvider.get(), gameStatDaoProvider.get(), dailyActivityDaoProvider.get(), streakDaoProvider.get(), preferencesRepositoryProvider.get());
  }

  public static AchievementEngine_Factory create(Provider<AchievementDao> achievementDaoProvider,
      Provider<SessionDao> sessionDaoProvider, Provider<GameStatDao> gameStatDaoProvider,
      Provider<DailyActivityDao> dailyActivityDaoProvider, Provider<StreakDao> streakDaoProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    return new AchievementEngine_Factory(achievementDaoProvider, sessionDaoProvider, gameStatDaoProvider, dailyActivityDaoProvider, streakDaoProvider, preferencesRepositoryProvider);
  }

  public static AchievementEngine newInstance(AchievementDao achievementDao, SessionDao sessionDao,
      GameStatDao gameStatDao, DailyActivityDao dailyActivityDao, StreakDao streakDao,
      UserPreferencesRepository preferencesRepository) {
    return new AchievementEngine(achievementDao, sessionDao, gameStatDao, dailyActivityDao, streakDao, preferencesRepository);
  }
}
