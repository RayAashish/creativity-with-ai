package com.mindforge.app.feature.profile;

import android.content.Context;
import com.mindforge.app.data.local.preferences.UserPreferencesRepository;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata
@QualifierMetadata("dagger.hilt.android.qualifiers.ApplicationContext")
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
public final class ProfileEditViewModel_Factory implements Factory<ProfileEditViewModel> {
  private final Provider<Context> contextProvider;

  private final Provider<UserPreferencesRepository> preferencesRepositoryProvider;

  public ProfileEditViewModel_Factory(Provider<Context> contextProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    this.contextProvider = contextProvider;
    this.preferencesRepositoryProvider = preferencesRepositoryProvider;
  }

  @Override
  public ProfileEditViewModel get() {
    return newInstance(contextProvider.get(), preferencesRepositoryProvider.get());
  }

  public static ProfileEditViewModel_Factory create(Provider<Context> contextProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    return new ProfileEditViewModel_Factory(contextProvider, preferencesRepositoryProvider);
  }

  public static ProfileEditViewModel newInstance(Context context,
      UserPreferencesRepository preferencesRepository) {
    return new ProfileEditViewModel(context, preferencesRepository);
  }
}
