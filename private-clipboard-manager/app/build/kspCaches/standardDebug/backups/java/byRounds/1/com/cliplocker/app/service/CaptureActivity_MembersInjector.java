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
public final class CaptureActivity_MembersInjector implements MembersInjector<CaptureActivity> {
  private final Provider<ClipRepository> clipRepositoryProvider;

  public CaptureActivity_MembersInjector(Provider<ClipRepository> clipRepositoryProvider) {
    this.clipRepositoryProvider = clipRepositoryProvider;
  }

  public static MembersInjector<CaptureActivity> create(
      Provider<ClipRepository> clipRepositoryProvider) {
    return new CaptureActivity_MembersInjector(clipRepositoryProvider);
  }

  @Override
  public void injectMembers(CaptureActivity instance) {
    injectClipRepository(instance, clipRepositoryProvider.get());
  }

  @InjectedFieldSignature("com.cliplocker.app.service.CaptureActivity.clipRepository")
  public static void injectClipRepository(CaptureActivity instance, ClipRepository clipRepository) {
    instance.clipRepository = clipRepository;
  }
}
