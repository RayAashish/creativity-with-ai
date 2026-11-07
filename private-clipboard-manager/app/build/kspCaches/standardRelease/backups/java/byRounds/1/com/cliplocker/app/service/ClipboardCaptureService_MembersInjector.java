package com.cliplocker.app.service;

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
public final class ClipboardCaptureService_MembersInjector implements MembersInjector<ClipboardCaptureService> {
  private final Provider<ClipRepository> clipRepositoryProvider;

  private final Provider<PreferencesManager> preferencesManagerProvider;

  public ClipboardCaptureService_MembersInjector(Provider<ClipRepository> clipRepositoryProvider,
      Provider<PreferencesManager> preferencesManagerProvider) {
    this.clipRepositoryProvider = clipRepositoryProvider;
    this.preferencesManagerProvider = preferencesManagerProvider;
  }

  public static MembersInjector<ClipboardCaptureService> create(
      Provider<ClipRepository> clipRepositoryProvider,
      Provider<PreferencesManager> preferencesManagerProvider) {
    return new ClipboardCaptureService_MembersInjector(clipRepositoryProvider, preferencesManagerProvider);
  }

  @Override
  public void injectMembers(ClipboardCaptureService instance) {
    injectClipRepository(instance, clipRepositoryProvider.get());
    injectPreferencesManager(instance, preferencesManagerProvider.get());
  }

  @InjectedFieldSignature("com.cliplocker.app.service.ClipboardCaptureService.clipRepository")
  public static void injectClipRepository(ClipboardCaptureService instance,
      ClipRepository clipRepository) {
    instance.clipRepository = clipRepository;
  }

  @InjectedFieldSignature("com.cliplocker.app.service.ClipboardCaptureService.preferencesManager")
  public static void injectPreferencesManager(ClipboardCaptureService instance,
      PreferencesManager preferencesManager) {
    instance.preferencesManager = preferencesManager;
  }
}
