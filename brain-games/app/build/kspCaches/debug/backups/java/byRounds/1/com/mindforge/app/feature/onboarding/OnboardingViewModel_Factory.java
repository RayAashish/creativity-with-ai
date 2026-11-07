package com.mindforge.app.feature.onboarding;

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
public final class OnboardingViewModel_Factory implements Factory<OnboardingViewModel> {
  private final Provider<Context> contextProvider;

  private final Provider<UserPreferencesRepository> preferencesRepositoryProvider;

  public OnboardingViewModel_Factory(Provider<Context> contextProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    this.contextProvider = contextProvider;
    this.preferencesRepositoryProvider = preferencesRepositoryProvider;
  }

  @Override
  public OnboardingViewModel get() {
    return newInstance(contextProvider.get(), preferencesRepositoryProvider.get());
  }

  public static OnboardingViewModel_Factory create(Provider<Context> contextProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider) {
    return new OnboardingViewModel_Factory(contextProvider, preferencesRepositoryProvider);
  }

  public static OnboardingViewModel newInstance(Context context,
      UserPreferencesRepository preferencesRepository) {
    return new OnboardingViewModel(context, preferencesRepository);
  }
}
