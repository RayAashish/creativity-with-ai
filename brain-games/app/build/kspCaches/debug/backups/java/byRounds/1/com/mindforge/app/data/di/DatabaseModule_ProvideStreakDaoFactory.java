package com.mindforge.app.data.di;

import com.mindforge.app.data.local.db.MindForgeDatabase;
import com.mindforge.app.data.local.db.dao.StreakDao;
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
public final class DatabaseModule_ProvideStreakDaoFactory implements Factory<StreakDao> {
  private final Provider<MindForgeDatabase> databaseProvider;

  public DatabaseModule_ProvideStreakDaoFactory(Provider<MindForgeDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public StreakDao get() {
    return provideStreakDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideStreakDaoFactory create(
      Provider<MindForgeDatabase> databaseProvider) {
    return new DatabaseModule_ProvideStreakDaoFactory(databaseProvider);
  }

  public static StreakDao provideStreakDao(MindForgeDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideStreakDao(database));
  }
}
