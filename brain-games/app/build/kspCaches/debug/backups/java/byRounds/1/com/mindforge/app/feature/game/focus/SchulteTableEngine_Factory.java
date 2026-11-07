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
public final class SchulteTableEngine_Factory implements Factory<SchulteTableEngine> {
  @Override
  public SchulteTableEngine get() {
    return newInstance();
  }

  public static SchulteTableEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static SchulteTableEngine newInstance() {
    return new SchulteTableEngine();
  }

  private static final class InstanceHolder {
    private static final SchulteTableEngine_Factory INSTANCE = new SchulteTableEngine_Factory();
  }
}
