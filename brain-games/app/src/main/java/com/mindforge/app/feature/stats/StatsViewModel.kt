package com.mindforge.app.feature.stats

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.dao.SessionDao
import com.mindforge.app.data.local.db.entity.GameStatEntity
import com.mindforge.app.data.local.db.entity.SessionEntity
import com.mindforge.app.feature.home.GameCategory
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

data class CategoryStat(
    val category: GameCategory,
    val totalPlays: Int,
    val totalStars: Int,
    val bestAccuracy: Float
)

data class StatsUiState(
    val totalSessions: Int = 0,
    val overallAccuracy: Float = 0f,
    val averageSpeedSeconds: Float = 0f,
    val totalStars: Int = 0,
    val categoryStats: List<CategoryStat> = emptyList(),
    val topPersonalRuns: List<SessionEntity> = emptyList()
)

@HiltViewModel
class StatsViewModel @Inject constructor(
    private val sessionDao: SessionDao,
    private val gameStatDao: GameStatDao
) : ViewModel() {

    val uiState: StateFlow<StatsUiState> = combine(
        sessionDao.getRecentSessions(200),
        gameStatDao.getAllGameStats()
    ) { sessions, stats ->
        val totalSessions = sessions.size
        val avgAccuracy = if (totalSessions > 0) sessions.map { it.accuracy }.average().toFloat() else 0f
        val avgSpeed = if (totalSessions > 0) sessions.map { it.speedSeconds }.average().toFloat() else 0f
        val totalStars = stats.sumOf { it.totalStars }

        val catStats = GameCategory.entries.map { cat ->
            val catSessions = sessions.filter { it.category == cat.name }
            val plays = catSessions.size
            val catStars = stats.filter { getCategoryForGameId(it.gameId) == cat }.sumOf { it.totalStars }
            val bestAcc = if (plays > 0) catSessions.maxOf { it.accuracy } else 0f
            CategoryStat(cat, plays, catStars, bestAcc)
        }

        val topRuns = sessions.sortedByDescending { it.score }.take(10)

        StatsUiState(
            totalSessions = totalSessions,
            overallAccuracy = avgAccuracy,
            averageSpeedSeconds = avgSpeed,
            totalStars = totalStars,
            categoryStats = catStats,
            topPersonalRuns = topRuns
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = StatsUiState()
    )

    private fun getCategoryForGameId(gameId: String): GameCategory {
        return when (gameId) {
            "quick_calc", "speed_chain", "missing_operator", "squares_cubes",
            "percent_sprint", "true_false_calc", "target_24", "number_sequence", "offline_duel" -> GameCategory.MATH
            "sequence_memory", "card_match", "digit_span", "spatial_grid", "n_back" -> GameCategory.MEMORY
            "stroop_test", "schulte_table", "odd_one_out", "reaction_tap", "go_no_go" -> GameCategory.FOCUS
            "pattern_matrix", "lights_out", "mini_sudoku", "balance_weights" -> GameCategory.LOGIC
            else -> GameCategory.LANGUAGE
        }
    }
}
