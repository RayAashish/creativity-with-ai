package com.mindforge.app.feature.game.math;

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
public final class SpeedChainEngine_Factory implements Factory<SpeedChainEngine> {
  @Override
  public SpeedChainEngine get() {
    return newInstance();
  }

  public static SpeedChainEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static SpeedChainEngine newInstance() {
    return new SpeedChainEngine();
  }

  private static final class InstanceHolder {
    private static final SpeedChainEngine_Factory INSTANCE = new SpeedChainEngine_Factory();
  }
}
