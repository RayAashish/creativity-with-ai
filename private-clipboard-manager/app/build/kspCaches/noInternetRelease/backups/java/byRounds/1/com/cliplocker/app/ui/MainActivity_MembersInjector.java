package com.cliplocker.app.ui;

import com.cliplocker.app.data.preferences.PreferencesManager;
import com.cliplocker.app.data.repository.ClipRepository;
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
public final class MainActivity_MembersInjector implements MembersInjector<MainActivity> {
  private final Provider<PreferencesManager> preferencesManagerProvider;

  private final Provider<ClipRepository> clipRepositoryProvider;

  public MainActivity_MembersInjector(Provider<PreferencesManager> preferencesManagerProvider,
      Provider<ClipRepository> clipRepositoryProvider) {
    this.preferencesManagerProvider = preferencesManagerProvider;
    this.clipRepositoryProvider = clipRepositoryProvider;
  }

  public static MembersInjector<MainActivity> create(
      Provider<PreferencesManager> preferencesManagerProvider,
      Provider<ClipRepository> clipRepositoryProvider) {
    return new MainActivity_MembersInjector(preferencesManagerProvider, clipRepositoryProvider);
  }

  @Override
  public void injectMembers(MainActivity instance) {
    injectPreferencesManager(instance, preferencesManagerProvider.get());
    injectClipRepository(instance, clipRepositoryProvider.get());
  }

  @InjectedFieldSignature("com.cliplocker.app.ui.MainActivity.preferencesManager")
  public static void injectPreferencesManager(MainActivity instance,
      PreferencesManager preferencesManager) {
    instance.preferencesManager = preferencesManager;
  }

  @InjectedFieldSignature("com.cliplocker.app.ui.MainActivity.clipRepository")
  public static void injectClipRepository(MainActivity instance, ClipRepository clipRepository) {
    instance.clipRepository = clipRepository;
  }
}
