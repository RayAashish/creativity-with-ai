package com.cliplocker.app.di;

import android.content.Context;
import com.cliplocker.app.core.crypto.DatabaseKeyManager;
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
public final class DatabaseModule_ProvideDatabaseKeyManagerFactory implements Factory<DatabaseKeyManager> {
  private final Provider<Context> contextProvider;

  public DatabaseModule_ProvideDatabaseKeyManagerFactory(Provider<Context> contextProvider) {
    this.contextProvider = contextProvider;
  }

  @Override
  public DatabaseKeyManager get() {
    return provideDatabaseKeyManager(contextProvider.get());
  }

  public static DatabaseModule_ProvideDatabaseKeyManagerFactory create(
      Provider<Context> contextProvider) {
    return new DatabaseModule_ProvideDatabaseKeyManagerFactory(contextProvider);
  }

  public static DatabaseKeyManager provideDatabaseKeyManager(Context context) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideDatabaseKeyManager(context));
  }
}
