package com.cliplocker.app.ui.settings;

import com.cliplocker.app.data.preferences.PreferencesManager;
import com.cliplocker.app.data.repository.ClipRepository;
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
public final class SettingsViewModel_Factory implements Factory<SettingsViewModel> {
  private final Provider<PreferencesManager> preferencesManagerProvider;

  private final Provider<ClipRepository> repositoryProvider;

  public SettingsViewModel_Factory(Provider<PreferencesManager> preferencesManagerProvider,
      Provider<ClipRepository> repositoryProvider) {
    this.preferencesManagerProvider = preferencesManagerProvider;
    this.repositoryProvider = repositoryProvider;
  }

  @Override
  public SettingsViewModel get() {
    return newInstance(preferencesManagerProvider.get(), repositoryProvider.get());
  }

  public static SettingsViewModel_Factory create(
      Provider<PreferencesManager> preferencesManagerProvider,
      Provider<ClipRepository> repositoryProvider) {
    return new SettingsViewModel_Factory(preferencesManagerProvider, repositoryProvider);
  }

  public static SettingsViewModel newInstance(PreferencesManager preferencesManager,
      ClipRepository repository) {
    return new SettingsViewModel(preferencesManager, repository);
  }
}
