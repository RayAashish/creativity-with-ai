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
public final class DigitSpanEngine_Factory implements Factory<DigitSpanEngine> {
  @Override
  public DigitSpanEngine get() {
    return newInstance();
  }

  public static DigitSpanEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static DigitSpanEngine newInstance() {
    return new DigitSpanEngine();
  }

  private static final class InstanceHolder {
    private static final DigitSpanEngine_Factory INSTANCE = new DigitSpanEngine_Factory();
  }
}
