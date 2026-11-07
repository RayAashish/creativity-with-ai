package com.mindforge.app.feature.game.results;

import androidx.lifecycle.SavedStateHandle;
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
public final class GameResultsViewModel_Factory implements Factory<GameResultsViewModel> {
  private final Provider<SavedStateHandle> savedStateHandleProvider;

  private final Provider<SessionDao> sessionDaoProvider;

  private final Provider<GameStatDao> gameStatDaoProvider;

  public GameResultsViewModel_Factory(Provider<SavedStateHandle> savedStateHandleProvider,
      Provider<SessionDao> sessionDaoProvider, Provider<GameStatDao> gameStatDaoProvider) {
    this.savedStateHandleProvider = savedStateHandleProvider;
    this.sessionDaoProvider = sessionDaoProvider;
    this.gameStatDaoProvider = gameStatDaoProvider;
  }

  @Override
  public GameResultsViewModel get() {
    return newInstance(savedStateHandleProvider.get(), sessionDaoProvider.get(), gameStatDaoProvider.get());
  }

  public static GameResultsViewModel_Factory create(
      Provider<SavedStateHandle> savedStateHandleProvider, Provider<SessionDao> sessionDaoProvider,
      Provider<GameStatDao> gameStatDaoProvider) {
    return new GameResultsViewModel_Factory(savedStateHandleProvider, sessionDaoProvider, gameStatDaoProvider);
  }

  public static GameResultsViewModel newInstance(SavedStateHandle savedStateHandle,
      SessionDao sessionDao, GameStatDao gameStatDao) {
    return new GameResultsViewModel(savedStateHandle, sessionDao, gameStatDao);
  }
}
