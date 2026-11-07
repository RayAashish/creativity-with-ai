package com.cliplocker.app.worker;

import android.content.Context;
import androidx.work.WorkerParameters;
import com.cliplocker.app.data.preferences.PreferencesManager;
import com.cliplocker.app.data.repository.ClipRepository;
import dagger.internal.DaggerGenerated;
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
public final class ExpiryWorker_Factory {
  private final Provider<ClipRepository> repositoryProvider;

  private final Provider<PreferencesManager> preferencesManagerProvider;

  public ExpiryWorker_Factory(Provider<ClipRepository> repositoryProvider,
      Provider<PreferencesManager> preferencesManagerProvider) {
    this.repositoryProvider = repositoryProvider;
    this.preferencesManagerProvider = preferencesManagerProvider;
  }

  public ExpiryWorker get(Context context, WorkerParameters params) {
    return newInstance(context, params, repositoryProvider.get(), preferencesManagerProvider.get());
  }

  public static ExpiryWorker_Factory create(Provider<ClipRepository> repositoryProvider,
      Provider<PreferencesManager> preferencesManagerProvider) {
    return new ExpiryWorker_Factory(repositoryProvider, preferencesManagerProvider);
  }

  public static ExpiryWorker newInstance(Context context, WorkerParameters params,
      ClipRepository repository, PreferencesManager preferencesManager) {
    return new ExpiryWorker(context, params, repository, preferencesManager);
  }
}
