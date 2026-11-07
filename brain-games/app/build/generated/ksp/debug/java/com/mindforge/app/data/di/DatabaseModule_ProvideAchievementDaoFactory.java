package com.mindforge.app.data.di;

import com.mindforge.app.data.local.db.MindForgeDatabase;
import com.mindforge.app.data.local.db.dao.AchievementDao;
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
public final class DatabaseModule_ProvideAchievementDaoFactory implements Factory<AchievementDao> {
  private final Provider<MindForgeDatabase> databaseProvider;

  public DatabaseModule_ProvideAchievementDaoFactory(Provider<MindForgeDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public AchievementDao get() {
    return provideAchievementDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideAchievementDaoFactory create(
      Provider<MindForgeDatabase> databaseProvider) {
    return new DatabaseModule_ProvideAchievementDaoFactory(databaseProvider);
  }

  public static AchievementDao provideAchievementDao(MindForgeDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideAchievementDao(database));
  }
}
