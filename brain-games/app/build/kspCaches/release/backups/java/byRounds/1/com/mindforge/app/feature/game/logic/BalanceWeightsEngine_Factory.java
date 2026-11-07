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
public final class BalanceWeightsEngine_Factory implements Factory<BalanceWeightsEngine> {
  @Override
  public BalanceWeightsEngine get() {
    return newInstance();
  }

  public static BalanceWeightsEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static BalanceWeightsEngine newInstance() {
    return new BalanceWeightsEngine();
  }

  private static final class InstanceHolder {
    private static final BalanceWeightsEngine_Factory INSTANCE = new BalanceWeightsEngine_Factory();
  }
}
