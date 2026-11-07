package com.mindforge.app.feature.home;

import com.mindforge.app.data.local.db.dao.DailyActivityDao;
import com.mindforge.app.data.local.db.dao.GameStatDao;
import com.mindforge.app.data.local.db.dao.StreakDao;
import com.mindforge.app.data.local.preferences.UserPreferencesRepository;
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
public final class HomeViewModel_Factory implements Factory<HomeViewModel> {
  private final Provider<UserPreferencesRepository> preferencesRepositoryProvider;

  private final Provider<StreakDao> streakDaoProvider;

  private final Provider<DailyActivityDao> dailyActivityDaoProvider;

  private final Provider<GameStatDao> gameStatDaoProvider;

  public HomeViewModel_Factory(Provider<UserPreferencesRepository> preferencesRepositoryProvider,
      Provider<StreakDao> streakDaoProvider, Provider<DailyActivityDao> dailyActivityDaoProvider,
      Provider<GameStatDao> gameStatDaoProvider) {
    this.preferencesRepositoryProvider = preferencesRepositoryProvider;
    this.streakDaoProvider = streakDaoProvider;
    this.dailyActivityDaoProvider = dailyActivityDaoProvider;
    this.gameStatDaoProvider = gameStatDaoProvider;
  }

  @Override
  public HomeViewModel get() {
    return newInstance(preferencesRepositoryProvider.get(), streakDaoProvider.get(), dailyActivityDaoProvider.get(), gameStatDaoProvider.get());
  }

  public static HomeViewModel_Factory create(
      Provider<UserPreferencesRepository> preferencesRepositoryProvider,
      Provider<StreakDao> streakDaoProvider, Provider<DailyActivityDao> dailyActivityDaoProvider,
      Provider<GameStatDao> gameStatDaoProvider) {
    return new HomeViewModel_Factory(preferencesRepositoryProvider, streakDaoProvider, dailyActivityDaoProvider, gameStatDaoProvider);
  }

  public static HomeViewModel newInstance(UserPreferencesRepository preferencesRepository,
      StreakDao streakDao, DailyActivityDao dailyActivityDao, GameStatDao gameStatDao) {
    return new HomeViewModel(preferencesRepository, streakDao, dailyActivityDao, gameStatDao);
  }
}
