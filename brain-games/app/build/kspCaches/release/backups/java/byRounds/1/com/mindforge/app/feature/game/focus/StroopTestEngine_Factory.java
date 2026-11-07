package com.mindforge.app.feature.game.focus;

import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;

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
public final class StroopTestEngine_Factory implements Factory<StroopTestEngine> {
  @Override
  public StroopTestEngine get() {
    return newInstance();
  }

  public static StroopTestEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static StroopTestEngine newInstance() {
    return new StroopTestEngine();
  }

  private static final class InstanceHolder {
    private static final StroopTestEngine_Factory INSTANCE = new StroopTestEngine_Factory();
  }
}
