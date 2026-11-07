package com.cliplocker.app.di;

import android.content.Context;
import com.cliplocker.app.data.local.ClipDao;
import com.cliplocker.app.data.local.IgnoreAppDao;
import com.cliplocker.app.data.preferences.PreferencesManager;
import com.cliplocker.app.data.repository.ClipRepository;
import com.cliplocker.app.data.storage.ImageStorageManager;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
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
public final class RepositoryModule_ProvideClipRepositoryFactory implements Factory<ClipRepository> {
  private final Provider<Context> contextProvider;

  private final Provider<ClipDao> clipDaoProvider;

  private final Provider<IgnoreAppDao> ignoreAppDaoProvider;

  private final Provider<PreferencesManager> preferencesManagerProvider;

  private final Provider<ImageStorageManager> imageStorageManagerProvider;

  public RepositoryModule_ProvideClipRepositoryFactory(Provider<Context> contextProvider,
      Provider<ClipDao> clipDaoProvider, Provider<IgnoreAppDao> ignoreAppDaoProvider,
      Provider<PreferencesManager> preferencesManagerProvider,
      Provider<ImageStorageManager> imageStorageManagerProvider) {
    this.contextProvider = contextProvider;
    this.clipDaoProvider = clipDaoProvider;
    this.ignoreAppDaoProvider = ignoreAppDaoProvider;
    this.preferencesManagerProvider = preferencesManagerProvider;
    this.imageStorageManagerProvider = imageStorageManagerProvider;
  }

  @Override
  public ClipRepository get() {
    return provideClipRepository(contextProvider.get(), clipDaoProvider.get(), ignoreAppDaoProvider.get(), preferencesManagerProvider.get(), imageStorageManagerProvider.get());
  }

  public static RepositoryModule_ProvideClipRepositoryFactory create(
      Provider<Context> contextProvider, Provider<ClipDao> clipDaoProvider,
      Provider<IgnoreAppDao> ignoreAppDaoProvider,
      Provider<PreferencesManager> preferencesManagerProvider,
      Provider<ImageStorageManager> imageStorageManagerProvider) {
    return new RepositoryModule_ProvideClipRepositoryFactory(contextProvider, clipDaoProvider, ignoreAppDaoProvider, preferencesManagerProvider, imageStorageManagerProvider);
  }

  public static ClipRepository provideClipRepository(Context context, ClipDao clipDao,
      IgnoreAppDao ignoreAppDao, PreferencesManager preferencesManager,
      ImageStorageManager imageStorageManager) {
    return Preconditions.checkNotNullFromProvides(RepositoryModule.INSTANCE.provideClipRepository(context, clipDao, ignoreAppDao, preferencesManager, imageStorageManager));
  }
}
