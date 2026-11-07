package com.cliplocker.app.service;

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
public final class ClipboardAccessibilityService_MembersInjector implements MembersInjector<ClipboardAccessibilityService> {
  private final Provider<ClipRepository> clipRepositoryProvider;

  public ClipboardAccessibilityService_MembersInjector(
      Provider<ClipRepository> clipRepositoryProvider) {
    this.clipRepositoryProvider = clipRepositoryProvider;
  }

  public static MembersInjector<ClipboardAccessibilityService> create(
      Provider<ClipRepository> clipRepositoryProvider) {
    return new ClipboardAccessibilityService_MembersInjector(clipRepositoryProvider);
  }

  @Override
  public void injectMembers(ClipboardAccessibilityService instance) {
    injectClipRepository(instance, clipRepositoryProvider.get());
  }

  @InjectedFieldSignature("com.cliplocker.app.service.ClipboardAccessibilityService.clipRepository")
  public static void injectClipRepository(ClipboardAccessibilityService instance,
      ClipRepository clipRepository) {
    instance.clipRepository = clipRepository;
  }
}
