package com.mindforge.app.feature.challenge

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindforge.app.data.local.db.dao.DailyActivityDao
import com.mindforge.app.data.local.db.dao.SessionDao
import com.mindforge.app.data.local.db.dao.StreakDao
import com.mindforge.app.data.local.db.entity.DailyActivityEntity
import com.mindforge.app.data.local.db.entity.StreakRecordEntity
import com.mindforge.app.data.local.preferences.UserPreferencesRepository
import com.mindforge.app.domain.streak.StreakEngine
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameRegistry
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import kotlin.random.Random

data class ChallengeItem(
    val gameId: String,
    val title: String,
    val description: String,
    val isCompleted: Boolean = false
)

data class DailyChallengeUiState(
    val dateString: String = "",
    val formattedDate: String = "",
    val items: List<ChallengeItem> = emptyList(),
    val completedCount: Int = 0,
    val isAllCompleted: Boolean = false,
    val bonusXp: Int = 150,
    val streak: StreakRecordEntity = StreakRecordEntity(),
    val recentActivities: List<DailyActivityEntity> = emptyList()
)

@HiltViewModel
class DailyChallengeViewModel @Inject constructor(
    private val gameRegistry: GameRegistry,
    private val sessionDao: SessionDao,
    private val dailyActivityDao: DailyActivityDao,
    private val streakDao: StreakDao,
    private val preferencesRepository: UserPreferencesRepository
) : ViewModel() {

    private val streakEngine = StreakEngine()
    private val today = LocalDate.now()
    private val todayStr = today.format(DateTimeFormatter.ISO_LOCAL_DATE)
    private val formattedDate = today.format(DateTimeFormatter.ofPattern("EEEE, MMMM d"))

    val uiState: StateFlow<DailyChallengeUiState> = combine(
        sessionDao.getRecentSessions(50),
        dailyActivityDao.observeTodayActivity(todayStr),
        streakDao.observeStreak(),
        dailyActivityDao.getRecentDailyActivities(84)
    ) { recentSessions, todayActivity, streakRecord, recentActs ->
        val challengeEngines = getDeterministicChallengeEngines()
        val completedGameIds = recentSessions
            .filter { it.localDate == todayStr && it.stars >= 1 }
            .map { it.gameId }
            .toSet()

        val items = challengeEngines.map { eng ->
            ChallengeItem(
                gameId = eng.id,
                title = eng.title,
                description = eng.description,
                isCompleted = completedGameIds.contains(eng.id)
            )
        }

        val completedCount = items.count { it.isCompleted }
        val isAllCompleted = completedCount == 3

        if (isAllCompleted && todayActivity?.dailyChallengeCompleted != true) {
            claimDailyChallengeBonus()
        }

        DailyChallengeUiState(
            dateString = todayStr,
            formattedDate = formattedDate,
            items = items,
            completedCount = completedCount,
            isAllCompleted = isAllCompleted,
            bonusXp = 150,
            streak = streakRecord ?: StreakRecordEntity(),
            recentActivities = recentActs
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = DailyChallengeUiState(formattedDate = formattedDate)
    )

    private fun getDeterministicChallengeEngines(): List<GameEngine> {
        val all = gameRegistry.getAllEngines().filter { !it.isAdvanced }
        val seed = today.year * 10000L + today.monthValue * 100L + today.dayOfMonth
        val rng = Random(seed)
        return all.shuffled(rng).take(3)
    }

    private fun claimDailyChallengeBonus() {
        viewModelScope.launch {
            val act = dailyActivityDao.getActivity(todayStr) ?: DailyActivityEntity(dateString = todayStr)
            dailyActivityDao.upsertDailyActivity(
                act.copy(
                    dailyChallengeCompleted = true,
                    totalXp = act.totalXp + 150
                )
            )

            // Update user preferences progression
            val prefs = preferencesRepository.userPreferencesFlow.first()
            val newXp = prefs.currentXp + 150
            val newLvl = 1 + (newXp / 500)
            preferencesRepository.updateProgression(level = newLvl, xp = newXp)

            // Ensure streak is updated
            val currentStreak = streakDao.getStreak() ?: StreakRecordEntity()
            val eval = streakEngine.processSessionCompletion(
                current = currentStreak,
                today = today,
                currentWallMillis = System.currentTimeMillis(),
                currentMonotonicMillis = android.os.SystemClock.elapsedRealtime()
            )
            streakDao.upsertStreak(eval.updatedRecord)
        }
    }
}
