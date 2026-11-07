package com.mindforge.app.feature.game.instructions;

import com.mindforge.app.data.local.db.dao.GameStatDao;
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
public final class GameInstructionsViewModel_Factory implements Factory<GameInstructionsViewModel> {
  private final Provider<GameRegistry> gameRegistryProvider;

  private final Provider<GameStatDao> gameStatDaoProvider;

  public GameInstructionsViewModel_Factory(Provider<GameRegistry> gameRegistryProvider,
      Provider<GameStatDao> gameStatDaoProvider) {
    this.gameRegistryProvider = gameRegistryProvider;
    this.gameStatDaoProvider = gameStatDaoProvider;
  }

  @Override
  public GameInstructionsViewModel get() {
    return newInstance(gameRegistryProvider.get(), gameStatDaoProvider.get());
  }

  public static GameInstructionsViewModel_Factory create(
      Provider<GameRegistry> gameRegistryProvider, Provider<GameStatDao> gameStatDaoProvider) {
    return new GameInstructionsViewModel_Factory(gameRegistryProvider, gameStatDaoProvider);
  }

  public static GameInstructionsViewModel newInstance(GameRegistry gameRegistry,
      GameStatDao gameStatDao) {
    return new GameInstructionsViewModel(gameRegistry, gameStatDao);
  }
}
