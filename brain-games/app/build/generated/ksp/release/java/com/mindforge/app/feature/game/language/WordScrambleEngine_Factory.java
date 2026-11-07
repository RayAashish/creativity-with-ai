package com.mindforge.app.feature.game.language;

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
public final class WordScrambleEngine_Factory implements Factory<WordScrambleEngine> {
  @Override
  public WordScrambleEngine get() {
    return newInstance();
  }

  public static WordScrambleEngine_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static WordScrambleEngine newInstance() {
    return new WordScrambleEngine();
  }

  private static final class InstanceHolder {
    private static final WordScrambleEngine_Factory INSTANCE = new WordScrambleEngine_Factory();
  }
}
