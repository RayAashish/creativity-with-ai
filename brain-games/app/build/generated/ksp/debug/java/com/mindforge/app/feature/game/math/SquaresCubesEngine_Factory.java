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
public final class SquaresCubesEngine_Factory implements Factory<SquaresCubesEngine> {
  @Override
  public SquaresCubesEngine get() {
    return newInstance();
  }

  public static SquaresCubesEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static SquaresCubesEngine newInstance() {
    return new SquaresCubesEngine();
  }

  private static final class InstanceHolder {
    private static final SquaresCubesEngine_Factory INSTANCE = new SquaresCubesEngine_Factory();
  }
}
