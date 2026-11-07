package com.mindforge.app.feature.stats;

import com.mindforge.app.data.local.db.dao.GameStatDao;
import com.mindforge.app.data.local.db.dao.SessionDao;
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
public final class StatsViewModel_Factory implements Factory<StatsViewModel> {
  private final Provider<SessionDao> sessionDaoProvider;

  private final Provider<GameStatDao> gameStatDaoProvider;

  public StatsViewModel_Factory(Provider<SessionDao> sessionDaoProvider,
      Provider<GameStatDao> gameStatDaoProvider) {
    this.sessionDaoProvider = sessionDaoProvider;
    this.gameStatDaoProvider = gameStatDaoProvider;
  }

  @Override
  public StatsViewModel get() {
    return newInstance(sessionDaoProvider.get(), gameStatDaoProvider.get());
  }

  public static StatsViewModel_Factory create(Provider<SessionDao> sessionDaoProvider,
      Provider<GameStatDao> gameStatDaoProvider) {
    return new StatsViewModel_Factory(sessionDaoProvider, gameStatDaoProvider);
  }

  public static StatsViewModel newInstance(SessionDao sessionDao, GameStatDao gameStatDao) {
    return new StatsViewModel(sessionDao, gameStatDao);
  }
}
