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
public final class QuickCalcEngine_Factory implements Factory<QuickCalcEngine> {
  @Override
  public QuickCalcEngine get() {
    return newInstance();
  }

  public static QuickCalcEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static QuickCalcEngine newInstance() {
    return new QuickCalcEngine();
  }

  private static final class InstanceHolder {
    private static final QuickCalcEngine_Factory INSTANCE = new QuickCalcEngine_Factory();
  }
}
