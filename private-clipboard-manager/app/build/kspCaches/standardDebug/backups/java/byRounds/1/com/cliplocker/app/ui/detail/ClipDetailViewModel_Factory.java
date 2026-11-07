package com.cliplocker.app.ui.detail;

import androidx.lifecycle.SavedStateHandle;
import com.cliplocker.app.data.repository.ClipRepository;
import com.cliplocker.app.data.storage.ImageStorageManager;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
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
public final class ClipDetailViewModel_Factory implements Factory<ClipDetailViewModel> {
  private final Provider<ClipRepository> repositoryProvider;

  private final Provider<ImageStorageManager> imageStorageManagerProvider;

  private final Provider<SavedStateHandle> savedStateHandleProvider;

  public ClipDetailViewModel_Factory(Provider<ClipRepository> repositoryProvider,
      Provider<ImageStorageManager> imageStorageManagerProvider,
      Provider<SavedStateHandle> savedStateHandleProvider) {
    this.repositoryProvider = repositoryProvider;
    this.imageStorageManagerProvider = imageStorageManagerProvider;
    this.savedStateHandleProvider = savedStateHandleProvider;
  }

  @Override
  public ClipDetailViewModel get() {
    return newInstance(repositoryProvider.get(), imageStorageManagerProvider.get(), savedStateHandleProvider.get());
  }

  public static ClipDetailViewModel_Factory create(Provider<ClipRepository> repositoryProvider,
      Provider<ImageStorageManager> imageStorageManagerProvider,
      Provider<SavedStateHandle> savedStateHandleProvider) {
    return new ClipDetailViewModel_Factory(repositoryProvider, imageStorageManagerProvider, savedStateHandleProvider);
  }

  public static ClipDetailViewModel newInstance(ClipRepository repository,
      ImageStorageManager imageStorageManager, SavedStateHandle savedStateHandle) {
    return new ClipDetailViewModel(repository, imageStorageManager, savedStateHandle);
  }
}
