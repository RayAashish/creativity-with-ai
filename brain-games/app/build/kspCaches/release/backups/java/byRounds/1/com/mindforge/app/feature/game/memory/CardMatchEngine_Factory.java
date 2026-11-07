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
public final class CardMatchEngine_Factory implements Factory<CardMatchEngine> {
  @Override
  public CardMatchEngine get() {
    return newInstance();
  }

  public static CardMatchEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static CardMatchEngine newInstance() {
    return new CardMatchEngine();
  }

  private static final class InstanceHolder {
    private static final CardMatchEngine_Factory INSTANCE = new CardMatchEngine_Factory();
  }
}
