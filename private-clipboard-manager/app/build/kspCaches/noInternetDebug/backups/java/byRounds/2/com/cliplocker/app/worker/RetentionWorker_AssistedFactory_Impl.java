package com.cliplocker.app.worker;

import android.content.Context;
import androidx.work.WorkerParameters;
import dagger.internal.DaggerGenerated;
import dagger.internal.InstanceFactory;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

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
public final class RetentionWorker_AssistedFactory_Impl implements RetentionWorker_AssistedFactory {
  private final RetentionWorker_Factory delegateFactory;

  RetentionWorker_AssistedFactory_Impl(RetentionWorker_Factory delegateFactory) {
    this.delegateFactory = delegateFactory;
  }

  @Override
  public RetentionWorker create(Context p0, WorkerParameters p1) {
    return delegateFactory.get(p0, p1);
  }

  public static Provider<RetentionWorker_AssistedFactory> create(
      RetentionWorker_Factory delegateFactory) {
    return InstanceFactory.create(new RetentionWorker_AssistedFactory_Impl(delegateFactory));
  }

  public static dagger.internal.Provider<RetentionWorker_AssistedFactory> createFactoryProvider(
      RetentionWorker_Factory delegateFactory) {
    return InstanceFactory.create(new RetentionWorker_AssistedFactory_Impl(delegateFactory));
  }
}
