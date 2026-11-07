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
public final class Target24Engine_Factory implements Factory<Target24Engine> {
  @Override
  public Target24Engine get() {
    return newInstance();
  }

  public static Target24Engine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static Target24Engine newInstance() {
    return new Target24Engine();
  }

  private static final class InstanceHolder {
    private static final Target24Engine_Factory INSTANCE = new Target24Engine_Factory();
  }
}
