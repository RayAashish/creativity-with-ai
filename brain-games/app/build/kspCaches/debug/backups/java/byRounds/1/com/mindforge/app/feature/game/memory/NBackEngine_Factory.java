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
public final class NBackEngine_Factory implements Factory<NBackEngine> {
  @Override
  public NBackEngine get() {
    return newInstance();
  }

  public static NBackEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static NBackEngine newInstance() {
    return new NBackEngine();
  }

  private static final class InstanceHolder {
    private static final NBackEngine_Factory INSTANCE = new NBackEngine_Factory();
  }
}
