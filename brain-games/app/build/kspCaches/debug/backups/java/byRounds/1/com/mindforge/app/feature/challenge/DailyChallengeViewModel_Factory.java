package com.mindforge.app.feature.challenge;

import com.mindforge.app.data.local.db.dao.DailyActivityDao;
import com.mindforge.app.data.local.db.dao.SessionDao;
import com.mindforge.app.data.local.db.dao.StreakDao;
import com.mindforge.app.data.local.preferences.UserPreferencesRepository;
import com.mindforge.app.feature.game.framework.GameRegistry;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
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
public final class DailyChallengeViewModel_Factory implements Factory<DailyChallengeViewModel> {
  private final Provider<GameRegistry> gameRegistryProvider;

  private final Provider<SessionDao> sessionDaoProvider;

  private final Provider<DailyActivityDao> dailyActivityDaoProvider;

  private final Provider<StreakDao> streakDaoProvider;

  private final Provider<UserPreferencesRepository> preferencesRepositoryProvider;

  public DailyChallengeViewModel_Factory(Provider<GameRegistry> gameRegistryProvider,
      Provider<SessionDao> sessionDaoProvider, Provider<DailyActivityDao> dailyActivityDaoProvider,
      Provider<StreakDao> streakDaoProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    this.gameRegistryProvider = gameRegistryProvider;
    this.sessionDaoProvider = sessionDaoProvider;
    this.dailyActivityDaoProvider = dailyActivityDaoProvider;
    this.streakDaoProvider = streakDaoProvider;
    this.preferencesRepositoryProvider = preferencesRepositoryProvider;
  }

  @Override
  public DailyChallengeViewModel get() {
    return newInstance(gameRegistryProvider.get(), sessionDaoProvider.get(), dailyActivityDaoProvider.get(), streakDaoProvider.get(), preferencesRepositoryProvider.get());
  }

  public static DailyChallengeViewModel_Factory create(Provider<GameRegistry> gameRegistryProvider,
      Provider<SessionDao> sessionDaoProvider, Provider<DailyActivityDao> dailyActivityDaoProvider,
      Provider<StreakDao> streakDaoProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    return new DailyChallengeViewModel_Factory(gameRegistryProvider, sessionDaoProvider, dailyActivityDaoProvider, streakDaoProvider, preferencesRepositoryProvider);
  }

  public static DailyChallengeViewModel newInstance(GameRegistry gameRegistry,
      SessionDao sessionDao, DailyActivityDao dailyActivityDao, StreakDao streakDao,
      UserPreferencesRepository preferencesRepository) {
    return new DailyChallengeViewModel(gameRegistry, sessionDao, dailyActivityDao, streakDao, preferencesRepository);
  }
}
