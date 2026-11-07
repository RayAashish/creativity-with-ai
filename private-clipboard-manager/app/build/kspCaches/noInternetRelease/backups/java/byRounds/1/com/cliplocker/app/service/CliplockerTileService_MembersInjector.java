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
public final class CliplockerTileService_MembersInjector implements MembersInjector<CliplockerTileService> {
  private final Provider<ClipRepository> clipRepositoryProvider;

  public CliplockerTileService_MembersInjector(Provider<ClipRepository> clipRepositoryProvider) {
    this.clipRepositoryProvider = clipRepositoryProvider;
  }

  public static MembersInjector<CliplockerTileService> create(
      Provider<ClipRepository> clipRepositoryProvider) {
    return new CliplockerTileService_MembersInjector(clipRepositoryProvider);
  }

  @Override
  public void injectMembers(CliplockerTileService instance) {
    injectClipRepository(instance, clipRepositoryProvider.get());
  }

  @InjectedFieldSignature("com.cliplocker.app.service.CliplockerTileService.clipRepository")
  public static void injectClipRepository(CliplockerTileService instance,
      ClipRepository clipRepository) {
    instance.clipRepository = clipRepository;
  }
}
