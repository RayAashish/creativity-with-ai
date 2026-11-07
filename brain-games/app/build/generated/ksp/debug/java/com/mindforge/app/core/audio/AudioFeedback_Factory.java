package com.mindforge.app.core.audio;

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
public final class AudioFeedback_Factory implements Factory<AudioFeedback> {
  @Override
  public AudioFeedback get() {
    return newInstance();
  }

  public static AudioFeedback_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static AudioFeedback newInstance() {
    return new AudioFeedback();
  }

  private static final class InstanceHolder {
    private static final AudioFeedback_Factory INSTANCE = new AudioFeedback_Factory();
  }
}
