package com.mindforge.app.feature.game.play;

import androidx.lifecycle.SavedStateHandle;
import com.mindforge.app.core.audio.AudioFeedback;
import com.mindforge.app.core.audio.HapticFeedbackHelper;
import com.mindforge.app.data.local.db.dao.DailyActivityDao;
import com.mindforge.app.data.local.db.dao.GameStatDao;
import com.mindforge.app.data.local.db.dao.SessionDao;
import com.mindforge.app.data.local.db.dao.StreakDao;
import com.mindforge.app.data.local.preferences.UserPreferencesRepository;
import com.mindforge.app.feature.game.framework.GameRegistry;
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
public final class GamePlayViewModel_Factory implements Factory<GamePlayViewModel> {
  private final Provider<SavedStateHandle> savedStateHandleProvider;

  private final Provider<GameRegistry> gameRegistryProvider;

  private final Provider<SessionDao> sessionDaoProvider;

  private final Provider<GameStatDao> gameStatDaoProvider;

  private final Provider<DailyActivityDao> dailyActivityDaoProvider;

  private final Provider<StreakDao> streakDaoProvider;

  private final Provider<UserPreferencesRepository> preferencesRepositoryProvider;

  private final Provider<AudioFeedback> audioFeedbackProvider;

  private final Provider<HapticFeedbackHelper> hapticFeedbackProvider;

  public GamePlayViewModel_Factory(Provider<SavedStateHandle> savedStateHandleProvider,
      Provider<GameRegistry> gameRegistryProvider, Provider<SessionDao> sessionDaoProvider,
      Provider<GameStatDao> gameStatDaoProvider,
      Provider<DailyActivityDao> dailyActivityDaoProvider, Provider<StreakDao> streakDaoProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider,
      Provider<AudioFeedback> audioFeedbackProvider,
      Provider<HapticFeedbackHelper> hapticFeedbackProvider) {
    this.savedStateHandleProvider = savedStateHandleProvider;
    this.gameRegistryProvider = gameRegistryProvider;
    this.sessionDaoProvider = sessionDaoProvider;
    this.gameStatDaoProvider = gameStatDaoProvider;
    this.dailyActivityDaoProvider = dailyActivityDaoProvider;
    this.streakDaoProvider = streakDaoProvider;
    this.preferencesRepositoryProvider = preferencesRepositoryProvider;
    this.audioFeedbackProvider = audioFeedbackProvider;
    this.hapticFeedbackProvider = hapticFeedbackProvider;
  }

  @Override
  public GamePlayViewModel get() {
    return newInstance(savedStateHandleProvider.get(), gameRegistryProvider.get(), sessionDaoProvider.get(), gameStatDaoProvider.get(), dailyActivityDaoProvider.get(), streakDaoProvider.get(), preferencesRepositoryProvider.get(), audioFeedbackProvider.get(), hapticFeedbackProvider.get());
  }

  public static GamePlayViewModel_Factory create(
      Provider<SavedStateHandle> savedStateHandleProvider,
      Provider<GameRegistry> gameRegistryProvider, Provider<SessionDao> sessionDaoProvider,
      Provider<GameStatDao> gameStatDaoProvider,
      Provider<DailyActivityDao> dailyActivityDaoProvider, Provider<StreakDao> streakDaoProvider,
      Provider<UserPreferencesRepository> preferencesRepositoryProvider,
      Provider<AudioFeedback> audioFeedbackProvider,
      Provider<HapticFeedbackHelper> hapticFeedbackProvider) {
    return new GamePlayViewModel_Factory(savedStateHandleProvider, gameRegistryProvider, sessionDaoProvider, gameStatDaoProvider, dailyActivityDaoProvider, streakDaoProvider, preferencesRepositoryProvider, audioFeedbackProvider, hapticFeedbackProvider);
  }

  public static GamePlayViewModel newInstance(SavedStateHandle savedStateHandle,
      GameRegistry gameRegistry, SessionDao sessionDao, GameStatDao gameStatDao,
      DailyActivityDao dailyActivityDao, StreakDao streakDao,
      UserPreferencesRepository preferencesRepository, AudioFeedback audioFeedback,
      HapticFeedbackHelper hapticFeedback) {
    return new GamePlayViewModel(savedStateHandle, gameRegistry, sessionDao, gameStatDao, dailyActivityDao, streakDao, preferencesRepository, audioFeedback, hapticFeedback);
  }
}
