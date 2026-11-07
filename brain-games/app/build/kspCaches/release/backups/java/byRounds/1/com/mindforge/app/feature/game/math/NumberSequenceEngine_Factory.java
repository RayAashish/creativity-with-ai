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
public final class NumberSequenceEngine_Factory implements Factory<NumberSequenceEngine> {
  @Override
  public NumberSequenceEngine get() {
    return newInstance();
  }

  public static NumberSequenceEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static NumberSequenceEngine newInstance() {
    return new NumberSequenceEngine();
  }

  private static final class InstanceHolder {
    private static final NumberSequenceEngine_Factory INSTANCE = new NumberSequenceEngine_Factory();
  }
}
