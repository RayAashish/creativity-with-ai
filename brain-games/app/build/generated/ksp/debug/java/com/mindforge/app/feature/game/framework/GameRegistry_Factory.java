package com.mindforge.app.feature.game.framework;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import java.util.Set;
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
public final class GameRegistry_Factory implements Factory<GameRegistry> {
  private final Provider<Set<GameEngine>> gameEnginesProvider;

  public GameRegistry_Factory(Provider<Set<GameEngine>> gameEnginesProvider) {
    this.gameEnginesProvider = gameEnginesProvider;
  }

  @Override
  public GameRegistry get() {
    return newInstance(gameEnginesProvider.get());
  }

  public static GameRegistry_Factory create(Provider<Set<GameEngine>> gameEnginesProvider) {
    return new GameRegistry_Factory(gameEnginesProvider);
  }

  public static GameRegistry newInstance(Set<GameEngine> gameEngines) {
    return new GameRegistry(gameEngines);
  }
}
