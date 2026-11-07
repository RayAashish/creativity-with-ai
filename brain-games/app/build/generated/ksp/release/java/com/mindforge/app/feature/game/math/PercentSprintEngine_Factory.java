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
public final class PercentSprintEngine_Factory implements Factory<PercentSprintEngine> {
  @Override
  public PercentSprintEngine get() {
    return newInstance();
  }

  public static PercentSprintEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static PercentSprintEngine newInstance() {
    return new PercentSprintEngine();
  }

  private static final class InstanceHolder {
    private static final PercentSprintEngine_Factory INSTANCE = new PercentSprintEngine_Factory();
  }
}
