package com.mindforge.app.feature.game.focus;

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
public final class OddOneOutEngine_Factory implements Factory<OddOneOutEngine> {
  @Override
  public OddOneOutEngine get() {
    return newInstance();
  }

  public static OddOneOutEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static OddOneOutEngine newInstance() {
    return new OddOneOutEngine();
  }

  private static final class InstanceHolder {
    private static final OddOneOutEngine_Factory INSTANCE = new OddOneOutEngine_Factory();
  }
}
