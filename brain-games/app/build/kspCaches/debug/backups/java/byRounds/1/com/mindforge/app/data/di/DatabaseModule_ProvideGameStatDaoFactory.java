package com.mindforge.app.data.di;

import com.mindforge.app.data.local.db.MindForgeDatabase;
import com.mindforge.app.data.local.db.dao.GameStatDao;
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
public final class DatabaseModule_ProvideGameStatDaoFactory implements Factory<GameStatDao> {
  private final Provider<MindForgeDatabase> databaseProvider;

  public DatabaseModule_ProvideGameStatDaoFactory(Provider<MindForgeDatabase> databaseProvider) {
    this.databaseProvider = databaseProvider;
  }

  @Override
  public GameStatDao get() {
    return provideGameStatDao(databaseProvider.get());
  }

  public static DatabaseModule_ProvideGameStatDaoFactory create(
      Provider<MindForgeDatabase> databaseProvider) {
    return new DatabaseModule_ProvideGameStatDaoFactory(databaseProvider);
  }

  public static GameStatDao provideGameStatDao(MindForgeDatabase database) {
    return Preconditions.checkNotNullFromProvides(DatabaseModule.INSTANCE.provideGameStatDao(database));
  }
}
