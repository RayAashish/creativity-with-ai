package com.mindforge.app.feature.game.memory;

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
public final class SpatialGridEngine_Factory implements Factory<SpatialGridEngine> {
  @Override
  public SpatialGridEngine get() {
    return newInstance();
  }

  public static SpatialGridEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static SpatialGridEngine newInstance() {
    return new SpatialGridEngine();
  }

  private static final class InstanceHolder {
    private static final SpatialGridEngine_Factory INSTANCE = new SpatialGridEngine_Factory();
  }
}
