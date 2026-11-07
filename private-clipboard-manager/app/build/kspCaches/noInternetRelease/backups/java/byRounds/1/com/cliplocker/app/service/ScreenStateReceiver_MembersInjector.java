package com.cliplocker.app.service;

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
public final class ScreenStateReceiver_MembersInjector implements MembersInjector<ScreenStateReceiver> {
  private final Provider<PreferencesManager> preferencesManagerProvider;

  public ScreenStateReceiver_MembersInjector(
      Provider<PreferencesManager> preferencesManagerProvider) {
    this.preferencesManagerProvider = preferencesManagerProvider;
  }

  public static MembersInjector<ScreenStateReceiver> create(
      Provider<PreferencesManager> preferencesManagerProvider) {
    return new ScreenStateReceiver_MembersInjector(preferencesManagerProvider);
  }

  @Override
  public void injectMembers(ScreenStateReceiver instance) {
    injectPreferencesManager(instance, preferencesManagerProvider.get());
  }

  @InjectedFieldSignature("com.cliplocker.app.service.ScreenStateReceiver.preferencesManager")
  public static void injectPreferencesManager(ScreenStateReceiver instance,
      PreferencesManager preferencesManager) {
    instance.preferencesManager = preferencesManager;
  }
}
