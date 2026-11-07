package com.cliplocker.app.di;

import com.cliplocker.app.data.local.AppDatabase;
import com.cliplocker.app.data.local.IgnoreAppDao;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.Preconditions;
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
public final class DatabaseModule_ProvideIgnoreAppDaoFactory implements Factory<IgnoreAppDao> {
  private final Provider<AppDatabase> databaseProvider;

  public DatabaseModule_ProvideIgnoreAppDaoFactory(Provider<AppDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public IgnoreAppDao get() {
    return provideIgnoreAppDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideIgnoreAppDaoFactory create(
      Provider<AppDatabase> databaseProvider) {
    return new DatabaseModule_ProvideIgnoreAppDaoFactory(databaseProvider);
  }

  public static IgnoreAppDao provideIgnoreAppDao(AppDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideIgnoreAppDao(database));
  }
}
