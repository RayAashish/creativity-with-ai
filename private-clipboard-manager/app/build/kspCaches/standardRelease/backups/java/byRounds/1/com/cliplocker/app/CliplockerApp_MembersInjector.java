package com.cliplocker.app;

import androidx.hilt.work.HiltWorkerFactory;
import com.cliplocker.app.data.preferences.PreferencesManager;
import dagger.MembersInjector;
import dagger.internal.DaggerGenerated;
import dagger.internal.InjectedFieldSignature;
import dagger.internal.QualifierMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

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
public final class CliplockerApp_MembersInjector implements MembersInjector<CliplockerApp> {
  private final Provider<HiltWorkerFactory> workerFactoryProvider;

  private final Provider<PreferencesManager> preferencesManagerProvider;

  public CliplockerApp_MembersInjector(Provider<HiltWorkerFactory> workerFactoryProvider,
      Provider<PreferencesManager> preferencesManagerProvider) {
    this.workerFactoryProvider = workerFactoryProvider;
    this.preferencesManagerProvider = preferencesManagerProvider;
  }

  public static MembersInjector<CliplockerApp> create(
      Provider<HiltWorkerFactory> workerFactoryProvider,
      Provider<PreferencesManager> preferencesManagerProvider) {
    return new CliplockerApp_MembersInjector(workerFactoryProvider, preferencesManagerProvider);
  }

  @Override
  public void injectMembers(CliplockerApp instance) {
    injectWorkerFactory(instance, workerFactoryProvider.get());
    injectPreferencesManager(instance, preferencesManagerProvider.get());
  }

  @InjectedFieldSignature("com.cliplocker.app.CliplockerApp.workerFactory")
  public static void injectWorkerFactory(CliplockerApp instance, HiltWorkerFactory workerFactory) {
    instance.workerFactory = workerFactory;
  }

  @InjectedFieldSignature("com.cliplocker.app.CliplockerApp.preferencesManager")
  public static void injectPreferencesManager(CliplockerApp instance,
      PreferencesManager preferencesManager) {
    instance.preferencesManager = preferencesManager;
  }
}
