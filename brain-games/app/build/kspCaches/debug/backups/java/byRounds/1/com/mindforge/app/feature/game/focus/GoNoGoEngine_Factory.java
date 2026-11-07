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
public final class GoNoGoEngine_Factory implements Factory<GoNoGoEngine> {
  @Override
  public GoNoGoEngine get() {
    return newInstance();
  }

  public static GoNoGoEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static GoNoGoEngine newInstance() {
    return new GoNoGoEngine();
  }

  private static final class InstanceHolder {
    private static final GoNoGoEngine_Factory INSTANCE = new GoNoGoEngine_Factory();
  }
}
