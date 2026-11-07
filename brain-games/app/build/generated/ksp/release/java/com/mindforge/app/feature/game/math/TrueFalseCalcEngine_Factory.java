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
public final class TrueFalseCalcEngine_Factory implements Factory<TrueFalseCalcEngine> {
  @Override
  public TrueFalseCalcEngine get() {
    return newInstance();
  }

  public static TrueFalseCalcEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static TrueFalseCalcEngine newInstance() {
    return new TrueFalseCalcEngine();
  }

  private static final class InstanceHolder {
    private static final TrueFalseCalcEngine_Factory INSTANCE = new TrueFalseCalcEngine_Factory();
  }
}
