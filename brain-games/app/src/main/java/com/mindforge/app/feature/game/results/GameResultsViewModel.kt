package com.mindforge.app.feature.game.results

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.mindforge.app.core.navigation.Screen
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.dao.SessionDao
import com.mindforge.app.feature.game.framework.GameSessionResult
import com.mindforge.app.feature.home.GameCategory
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GameResultsViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val sessionDao: SessionDao,
    private val gameStatDao: GameStatDao
) : ViewModel() {

    private val route = runCatching { savedStateHandle.toRoute<Screen.GameResults>() }.getOrNull()
    private val sessionId: String = route?.sessionId ?: savedStateHandle.get<String>("sessionId") ?: ""

    private val _result = MutableStateFlow<GameSessionResult?>(null)
    val result = _result.asStateFlow()

    init {
        viewModelScope.launch {
            val session = if (sessionId.isNotBlank()) sessionDao.getSessionById(sessionId) else null
            if (session != null) {
                val stat = gameStatDao.getGameStat(session.gameId)
                val isNewBest = stat != null && stat.bestScore == session.score
                val nextLevelUnlocked = session.stars >= 1 && (stat?.highestLevelUnlocked ?: 1) > session.level

                val cat = runCatching { GameCategory.valueOf(session.category) }.getOrDefault(GameCategory.MATH)
                val totalQ = (session.score / 100).coerceAtLeast(8)
                val correctCount = (session.accuracy / 100f * totalQ).toInt()

                _result.value = GameSessionResult(
                    sessionId = session.id,
                    gameId = session.gameId,
                    category = cat,
                    level = session.level,
                    score = session.score,
                    totalQuestions = totalQ,
                    correctAnswers = correctCount,
                    mistakes = session.mistakes,
                    accuracy = session.accuracy,
                    durationSeconds = session.speedSeconds,
                    speedPerQuestion = if (totalQ > 0) session.speedSeconds / totalQ else 0f,
                    stars = session.stars,
                    xpEarned = session.xpEarned,
                    isNewBest = isNewBest,
                    nextLevelUnlocked = nextLevelUnlocked
                )
            } else {
                // Graceful fallback for practice sessions or fast reroutes
                _result.value = GameSessionResult(
                    sessionId = sessionId.ifBlank { "practice" },
                    gameId = "quick_calc",
                    category = GameCategory.MATH,
                    level = 1,
                    score = 0,
                    totalQuestions = 5,
                    correctAnswers = 5,
                    mistakes = 0,
                    accuracy = 100f,
                    durationSeconds = 15f,
                    speedPerQuestion = 3f,
                    stars = 1,
                    xpEarned = 20,
                    isNewBest = false,
                    nextLevelUnlocked = false
                )
            }
        }
    }
}
