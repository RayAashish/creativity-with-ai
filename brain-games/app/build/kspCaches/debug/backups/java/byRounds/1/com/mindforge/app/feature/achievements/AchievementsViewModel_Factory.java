package com.mindforge.app.feature.achievements;

import com.mindforge.app.data.local.db.dao.AchievementDao;
import com.mindforge.app.domain.achievement.AchievementEngine;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
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
public final class AchievementsViewModel_Factory implements Factory<AchievementsViewModel> {
  private final Provider<AchievementDao> achievementDaoProvider;

  private final Provider<AchievementEngine> achievementEngineProvider;

  public AchievementsViewModel_Factory(Provider<AchievementDao> achievementDaoProvider,
      Provider<AchievementEngine> achievementEngineProvider) {
    this.achievementDaoProvider = achievementDaoProvider;
    this.achievementEngineProvider = achievementEngineProvider;
  }

  @Override
  public AchievementsViewModel get() {
    return newInstance(achievementDaoProvider.get(), achievementEngineProvider.get());
  }

  public static AchievementsViewModel_Factory create(
      Provider<AchievementDao> achievementDaoProvider,
      Provider<AchievementEngine> achievementEngineProvider) {
    return new AchievementsViewModel_Factory(achievementDaoProvider, achievementEngineProvider);
  }

  public static AchievementsViewModel newInstance(AchievementDao achievementDao,
      AchievementEngine achievementEngine) {
    return new AchievementsViewModel(achievementDao, achievementEngine);
  }
}
