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
public final class MissingOperatorEngine_Factory implements Factory<MissingOperatorEngine> {
  @Override
  public MissingOperatorEngine get() {
    return newInstance();
  }

  public static MissingOperatorEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static MissingOperatorEngine newInstance() {
    return new MissingOperatorEngine();
  }

  private static final class InstanceHolder {
    private static final MissingOperatorEngine_Factory INSTANCE = new MissingOperatorEngine_Factory();
  }
}
