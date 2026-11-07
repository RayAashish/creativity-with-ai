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
public final class ReactionTapEngine_Factory implements Factory<ReactionTapEngine> {
  @Override
  public ReactionTapEngine get() {
    return newInstance();
  }

  public static ReactionTapEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static ReactionTapEngine newInstance() {
    return new ReactionTapEngine();
  }

  private static final class InstanceHolder {
    private static final ReactionTapEngine_Factory INSTANCE = new ReactionTapEngine_Factory();
  }
}
