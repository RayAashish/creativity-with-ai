package com.cliplocker.app.di;

import com.cliplocker.app.data.local.AppDatabase;
import com.cliplocker.app.data.local.ClipDao;
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
public final class DatabaseModule_ProvideClipDaoFactory implements Factory<ClipDao> {
  private final Provider<AppDatabase> databaseProvider;

  public DatabaseModule_ProvideClipDaoFactory(Provider<AppDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public ClipDao get() {
    return provideClipDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideClipDaoFactory create(
      Provider<AppDatabase> databaseProvider) {
    return new DatabaseModule_ProvideClipDaoFactory(databaseProvider);
  }

  public static ClipDao provideClipDao(AppDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideClipDao(database));
  }
}
