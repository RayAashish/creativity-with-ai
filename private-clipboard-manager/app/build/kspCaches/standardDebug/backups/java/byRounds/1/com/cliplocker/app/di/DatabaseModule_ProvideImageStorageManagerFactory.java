package com.cliplocker.app.di;

import android.content.Context;
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
public final class DatabaseModule_ProvideImageStorageManagerFactory implements Factory<ImageStorageManager> {
  private final Provider<Context> contextProvider;

  public DatabaseModule_ProvideImageStorageManagerFactory(Provider<Context> contextProvider) {
    this.contextProvider = contextProvider;
  }

  @Override
  public ImageStorageManager get() {
    return provideImageStorageManager(contextProvider.get());
  }

  public static DatabaseModule_ProvideImageStorageManagerFactory create(
      Provider<Context> contextProvider) {
    return new DatabaseModule_ProvideImageStorageManagerFactory(contextProvider);
  }

  public static ImageStorageManager provideImageStorageManager(Context context) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideImageStorageManager(context));
  }
}
