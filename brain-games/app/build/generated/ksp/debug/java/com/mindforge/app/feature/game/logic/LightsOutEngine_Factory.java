package com.mindforge.app.feature.game.logic;

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
public final class LightsOutEngine_Factory implements Factory<LightsOutEngine> {
  @Override
  public LightsOutEngine get() {
    return newInstance();
  }

  public static LightsOutEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static LightsOutEngine newInstance() {
    return new LightsOutEngine();
  }

  private static final class InstanceHolder {
    private static final LightsOutEngine_Factory INSTANCE = new LightsOutEngine_Factory();
  }
}
