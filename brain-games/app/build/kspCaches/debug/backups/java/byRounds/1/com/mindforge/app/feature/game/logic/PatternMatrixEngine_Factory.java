package com.mindforge.app.feature.game.logic;

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
public final class PatternMatrixEngine_Factory implements Factory<PatternMatrixEngine> {
  @Override
  public PatternMatrixEngine get() {
    return newInstance();
  }

  public static PatternMatrixEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static PatternMatrixEngine newInstance() {
    return new PatternMatrixEngine();
  }

  private static final class InstanceHolder {
    private static final PatternMatrixEngine_Factory INSTANCE = new PatternMatrixEngine_Factory();
  }
}
