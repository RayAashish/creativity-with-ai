package com.mindforge.app.data.di;

import com.mindforge.app.data.local.db.MindForgeDatabase;
import com.mindforge.app.data.local.db.dao.DailyActivityDao;
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
public final class DatabaseModule_ProvideDailyActivityDaoFactory implements Factory<DailyActivityDao> {
  private final Provider<MindForgeDatabase> databaseProvider;

  public DatabaseModule_ProvideDailyActivityDaoFactory(
      Provider<MindForgeDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public DailyActivityDao get() {
    return provideDailyActivityDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideDailyActivityDaoFactory create(
      Provider<MindForgeDatabase> databaseProvider) {
    return new DatabaseModule_ProvideDailyActivityDaoFactory(databaseProvider);
  }

  public static DailyActivityDao provideDailyActivityDao(MindForgeDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideDailyActivityDao(database));
  }
}
