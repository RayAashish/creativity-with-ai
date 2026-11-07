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
public final class ExpiryWorker_AssistedFactory_Impl implements ExpiryWorker_AssistedFactory {
  private final ExpiryWorker_Factory delegateFactory;

  ExpiryWorker_AssistedFactory_Impl(ExpiryWorker_Factory delegateFactory) {
    this.delegateFactory = delegateFactory;
  }

  @Override
  public ExpiryWorker create(Context p0, WorkerParameters p1) {
    return delegateFactory.get(p0, p1);
  }

  public static Provider<ExpiryWorker_AssistedFactory> create(
      ExpiryWorker_Factory delegateFactory) {
    return InstanceFactory.create(new ExpiryWorker_AssistedFactory_Impl(delegateFactory));
  }

  public static dagger.internal.Provider<ExpiryWorker_AssistedFactory> createFactoryProvider(
      ExpiryWorker_Factory delegateFactory) {
    return InstanceFactory.create(new ExpiryWorker_AssistedFactory_Impl(delegateFactory));
  }
}
