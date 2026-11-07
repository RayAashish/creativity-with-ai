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
public final class SequenceMemoryEngine_Factory implements Factory<SequenceMemoryEngine> {
  @Override
  public SequenceMemoryEngine get() {
    return newInstance();
  }

  public static SequenceMemoryEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static SequenceMemoryEngine newInstance() {
    return new SequenceMemoryEngine();
  }

  private static final class InstanceHolder {
    private static final SequenceMemoryEngine_Factory INSTANCE = new SequenceMemoryEngine_Factory();
  }
}
