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
public final class OfflineDuelEngine_Factory implements Factory<OfflineDuelEngine> {
  @Override
  public OfflineDuelEngine get() {
    return newInstance();
  }

  public static OfflineDuelEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static OfflineDuelEngine newInstance() {
    return new OfflineDuelEngine();
  }

  private static final class InstanceHolder {
    private static final OfflineDuelEngine_Factory INSTANCE = new OfflineDuelEngine_Factory();
  }
}
