package com.cliplocker.app.ui.main;

import com.cliplocker.app.data.preferences.PreferencesManager;
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
public final class MainViewModel_Factory implements Factory<MainViewModel> {
  private final Provider<ClipRepository> repositoryProvider;

  private final Provider<PreferencesManager> preferencesManagerProvider;

  private final Provider<ImageStorageManager> imageStorageManagerProvider;

  public MainViewModel_Factory(Provider<ClipRepository> repositoryProvider,
      Provider<PreferencesManager> preferencesManagerProvider,
      Provider<ImageStorageManager> imageStorageManagerProvider) {
    this.repositoryProvider = repositoryProvider;
    this.preferencesManagerProvider = preferencesManagerProvider;
    this.imageStorageManagerProvider = imageStorageManagerProvider;
  }

  @Override
  public MainViewModel get() {
    return newInstance(repositoryProvider.get(), preferencesManagerProvider.get(), imageStorageManagerProvider.get());
  }

  public static MainViewModel_Factory create(Provider<ClipRepository> repositoryProvider,
      Provider<PreferencesManager> preferencesManagerProvider,
      Provider<ImageStorageManager> imageStorageManagerProvider) {
    return new MainViewModel_Factory(repositoryProvider, preferencesManagerProvider, imageStorageManagerProvider);
  }

  public static MainViewModel newInstance(ClipRepository repository,
      PreferencesManager preferencesManager, ImageStorageManager imageStorageManager) {
    return new MainViewModel(repository, preferencesManager, imageStorageManager);
  }
}
