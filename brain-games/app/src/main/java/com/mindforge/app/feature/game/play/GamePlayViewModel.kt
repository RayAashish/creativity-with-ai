package com.mindforge.app.feature.game.play

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.mindforge.app.core.audio.AudioFeedback
import com.mindforge.app.core.audio.HapticFeedbackHelper
import com.mindforge.app.core.navigation.Screen
import com.mindforge.app.data.local.db.dao.DailyActivityDao
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.dao.SessionDao
import com.mindforge.app.data.local.db.dao.StreakDao
import com.mindforge.app.data.local.db.entity.DailyActivityEntity
import com.mindforge.app.data.local.db.entity.GameStatEntity
import com.mindforge.app.data.local.db.entity.SessionEntity
import com.mindforge.app.data.local.db.entity.StreakRecordEntity
import com.mindforge.app.data.local.preferences.UserPreferencesRepository
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameQuestion
import com.mindforge.app.feature.game.framework.GameRegistry
import com.mindforge.app.feature.game.framework.GameSessionResult
import com.mindforge.app.feature.home.GameCategory
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID
import javax.inject.Inject
import kotlin.random.Random

enum class FeedbackType {
    NONE,
    CORRECT,
    WRONG
}

data class GamePlayUiState(
    val gameId: String = "",
    val gameTitle: String = "",
    val category: GameCategory = GameCategory.MATH,
    val level: Int = 1,
    val currentQuestionIndex: Int = 0,
    val totalQuestions: Int = 10,
    val currentQuestion: GameQuestion? = null,
    val currentInput: String = "",
    val remainingTimeSeconds: Int = 45,
    val totalTimeSeconds: Int = 45,
    val mistakes: Int = 0,
    val maxMistakes: Int = 3,
    val streakCombo: Int = 0,
    val score: Int = 0,
    val isPractice: Boolean = false,
    val isPaused: Boolean = false,
    val isGameOver: Boolean = false,
    val sessionResult: GameSessionResult? = null,
    val feedbackState: FeedbackType = FeedbackType.NONE,
    val shakeTrigger: Int = 0
)

@HiltViewModel
class GamePlayViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val gameRegistry: GameRegistry,
    private val sessionDao: SessionDao,
    private val gameStatDao: GameStatDao,
    private val dailyActivityDao: DailyActivityDao,
    private val streakDao: StreakDao,
    private val preferencesRepository: UserPreferencesRepository,
    private val audioFeedback: AudioFeedback,
    private val hapticFeedback: HapticFeedbackHelper
) : ViewModel() {

    private val route = runCatching { savedStateHandle.toRoute<Screen.GamePlay>() }.getOrNull()
    private var currentGameId: String = route?.gameId ?: savedStateHandle.get<String>("gameId") ?: "quick_calc"
    private var currentLevel: Int = route?.level ?: savedStateHandle.get<Int>("level") ?: 1
    private var currentIsPractice: Boolean = route?.isPractice ?: savedStateHandle.get<Boolean>("isPractice") ?: false

    private var engine: GameEngine = resolveEngine(currentGameId)
    private val rng = Random(System.currentTimeMillis())
    private val askedQuestionsHistory = mutableSetOf<String>()

    private val _uiState = MutableStateFlow(
        GamePlayUiState(
            gameId = engine.id,
            gameTitle = engine.title,
            category = engine.category,
            level = currentLevel,
            isPractice = currentIsPractice
        )
    )
    val uiState = _uiState.asStateFlow()

    private var timerJob: Job? = null
    private var questionsList: MutableList<GameQuestion> = mutableListOf()
    private var correctAnswersCount = 0
    private var sessionStartTime = System.currentTimeMillis()
    private var isInitialized = false

    init {
        startGame(currentIsPractice)
        isInitialized = true
    }

    private fun resolveEngine(id: String): GameEngine {
        return runCatching { gameRegistry.getEngine(id) }.getOrElse {
            gameRegistry.getAllEngines().firstOrNull() ?: throw IllegalStateException("No game engines registered")
        }
    }

    fun initialize(gameId: String, level: Int, isPractice: Boolean) {
        if (isInitialized && currentGameId == gameId && currentLevel == level && currentIsPractice == isPractice) {
            return
        }
        currentGameId = gameId
        currentLevel = level
        currentIsPractice = isPractice
        engine = resolveEngine(gameId)
        isInitialized = true
        startGame(isPractice)
    }

    fun startGame(isPracticeMode: Boolean) {
        timerJob?.cancel()
        askedQuestionsHistory.clear()
        correctAnswersCount = 0
        sessionStartTime = System.currentTimeMillis()

        if (isPracticeMode) {
            val practiceQuestions = engine.generatePracticeQuestions(rng)
            questionsList = practiceQuestions.toMutableList()
            _uiState.update {
                it.copy(
                    gameId = engine.id,
                    gameTitle = engine.title,
                    category = engine.category,
                    isPractice = true,
                    level = currentLevel,
                    totalQuestions = practiceQuestions.size,
                    currentQuestionIndex = 0,
                    currentQuestion = practiceQuestions.firstOrNull(),
                    remainingTimeSeconds = 30,
                    totalTimeSeconds = 30,
                    mistakes = 0,
                    maxMistakes = 5,
                    streakCombo = 0,
                    score = 0,
                    currentInput = "",
                    isGameOver = false,
                    sessionResult = null,
                    feedbackState = FeedbackType.NONE
                )
            }
        } else {
            val config = engine.getLevelConfig(currentLevel)
            questionsList = mutableListOf()
            repeat(config.totalQuestions) {
                var q: GameQuestion
                var attempts = 0
                do {
                    q = engine.generateQuestion(currentLevel, rng, askedQuestionsHistory)
                    attempts++
                } while (askedQuestionsHistory.contains(q.prompt) && attempts < 50)
                askedQuestionsHistory.add(q.prompt)
                questionsList.add(q)
            }

            _uiState.update {
                it.copy(
                    gameId = engine.id,
                    gameTitle = engine.title,
                    category = engine.category,
                    isPractice = false,
                    level = currentLevel,
                    totalQuestions = config.totalQuestions,
                    currentQuestionIndex = 0,
                    currentQuestion = questionsList.firstOrNull(),
                    remainingTimeSeconds = config.timeLimitSeconds,
                    totalTimeSeconds = config.timeLimitSeconds,
                    mistakes = 0,
                    maxMistakes = config.maxMistakes,
                    streakCombo = 0,
                    score = 0,
                    currentInput = "",
                    isGameOver = false,
                    sessionResult = null,
                    feedbackState = FeedbackType.NONE
                )
            }
            startTimer()
        }
    }

    private fun startTimer() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (isActive && _uiState.value.remainingTimeSeconds > 0 && !_uiState.value.isGameOver) {
                delay(1000)
                if (!_uiState.value.isPaused) {
                    _uiState.update {
                        val newTime = it.remainingTimeSeconds - 1
                        if (newTime <= 0) {
                            it.copy(remainingTimeSeconds = 0)
                        } else {
                            it.copy(remainingTimeSeconds = newTime)
                        }
                    }
                    if (_uiState.value.remainingTimeSeconds == 0) {
                        finishRound(timeExpired = true)
                    }
                }
            }
        }
    }

    fun onDigitInput(char: Char) {
        val prefs = preferencesRepository.userPreferencesFlow
        viewModelScope.launch {
            val p = prefs.first()
            audioFeedback.playTick(p.soundEnabled)
            hapticFeedback.tick(p.hapticsEnabled)
        }

        val currentQ = _uiState.value.currentQuestion ?: return
        val currentStr = _uiState.value.currentInput
        if (currentStr.length >= 8) return

        val candidate = currentStr + char
        val target = currentQ.targetAnswer.trim()

        // 1. Exact match -> Instant auto-submit!
        if (candidate.trim() == target) {
            _uiState.update { it.copy(currentInput = candidate) }
            processCorrectAnswer(candidate)
            return
        }

        // 2. Numerical input guard:
        // Do not hallucinate wrong answer while the user is typing fewer digits than target.
        val targetLength = target.length
        val candidateLength = candidate.length

        if (candidateLength < targetLength) {
            // User is still typing lower/incomplete number -> update without error
            _uiState.update { it.copy(currentInput = candidate) }
        } else {
            // Length reached or exceeded target without match -> wrong answer
            _uiState.update { it.copy(currentInput = candidate) }
            processWrongAnswer()
        }
    }

    fun onMinusInput() {
        val currentQ = _uiState.value.currentQuestion ?: return
        if (_uiState.value.currentInput.isNotEmpty()) return

        val candidate = "-"
        val target = currentQ.targetAnswer.trim()

        if (candidate == target) {
            _uiState.update { it.copy(currentInput = candidate) }
            processCorrectAnswer(candidate)
        } else {
            _uiState.update { it.copy(currentInput = candidate) }
        }
    }

    fun onBackspace() {
        _uiState.update {
            it.copy(currentInput = it.currentInput.dropLast(1))
        }
    }

    fun onClear() {
        _uiState.update { it.copy(currentInput = "") }
    }

    fun submitCurrentInput() {
        val answer = _uiState.value.currentInput.trim()
        val currentQ = _uiState.value.currentQuestion ?: return
        if (answer.isEmpty() || answer == "-") return

        val eval = engine.evaluateAnswer(currentQ, answer)
        if (eval.isCorrect) {
            processCorrectAnswer(answer)
        } else {
            processWrongAnswer()
        }
    }

    fun onOptionSelected(option: String) {
        val currentQ = _uiState.value.currentQuestion ?: return
        val eval = engine.evaluateAnswer(currentQ, option)
        if (eval.isCorrect) {
            processCorrectAnswer(option)
        } else {
            processWrongAnswer()
        }
    }

    private fun processCorrectAnswer(answer: String) {
        val currentQ = _uiState.value.currentQuestion ?: return
        val eval = engine.evaluateAnswer(currentQ, answer)

        viewModelScope.launch {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            audioFeedback.playCorrect(prefs.soundEnabled)
            hapticFeedback.success(prefs.hapticsEnabled)
        }

        correctAnswersCount++
        val streakBonusMultiplier = when {
            _uiState.value.streakCombo >= 4 -> 2.0
            _uiState.value.streakCombo >= 2 -> 1.5
            else -> 1.0
        }
        val points = (eval.pointsEarned * streakBonusMultiplier).toInt()

        _uiState.update {
            it.copy(
                score = it.score + points,
                streakCombo = it.streakCombo + 1,
                feedbackState = FeedbackType.CORRECT,
                currentInput = answer
            )
        }

        viewModelScope.launch {
            delay(220)
            advanceQuestion()
        }
    }

    private fun processWrongAnswer() {
        viewModelScope.launch {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            audioFeedback.playWrong(prefs.soundEnabled)
            hapticFeedback.error(prefs.hapticsEnabled)
        }

        val newMistakes = _uiState.value.mistakes + 1
        val newShake = _uiState.value.shakeTrigger + 1

        _uiState.update {
            it.copy(
                mistakes = newMistakes,
                streakCombo = 0,
                feedbackState = FeedbackType.WRONG,
                shakeTrigger = newShake
            )
        }

        if (newMistakes >= _uiState.value.maxMistakes && !_uiState.value.isPractice) {
            finishRound(timeExpired = false)
            return
        }

        // Matiks-style: after shake & buzz, auto-clear input so user can instantly type the correct answer
        viewModelScope.launch {
            delay(350)
            _uiState.update {
                it.copy(
                    currentInput = "",
                    feedbackState = FeedbackType.NONE
                )
            }
        }
    }

    private fun advanceQuestion() {
        val nextIdx = _uiState.value.currentQuestionIndex + 1
        if (nextIdx < questionsList.size) {
            _uiState.update {
                it.copy(
                    currentQuestionIndex = nextIdx,
                    currentQuestion = questionsList[nextIdx],
                    feedbackState = FeedbackType.NONE,
                    currentInput = ""
                )
            }
        } else {
            finishRound(timeExpired = false)
        }
    }

    private fun finishRound(timeExpired: Boolean) {
        timerJob?.cancel()
        val durationMillis = System.currentTimeMillis() - sessionStartTime
        val durationSeconds = (durationMillis / 1000f).coerceAtLeast(1.0f)
        val totalQ = questionsList.size
        val accuracy = if (totalQ > 0) (correctAnswersCount.toFloat() / totalQ.toFloat()) * 100f else 0f
        val speedPerQ = if (totalQ > 0) durationSeconds / totalQ else 0f

        val stars = when {
            accuracy >= 90f && !timeExpired -> 3
            accuracy >= 75f -> 2
            accuracy >= 50f || correctAnswersCount >= 4 -> 1
            else -> 0
        }

        val xpEarned = (_uiState.value.score / 10) + (stars * 20) + if (stars == 3) 25 else 0

        viewModelScope.launch {
            val prefs = preferencesRepository.userPreferencesFlow.first()
            if (stars > 0) {
                audioFeedback.playVictory(prefs.soundEnabled)
            }

            val assignedSessionId = UUID.randomUUID().toString()
            var isNewBest = false
            var nextLevelUnlocked = false

            val todayStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

            if (!_uiState.value.isPractice) {
                val existingStat = gameStatDao.getGameStat(currentGameId)
                if (existingStat == null || _uiState.value.score > existingStat.bestScore) {
                    isNewBest = true
                }

                val currentUnlocked = existingStat?.highestLevelUnlocked ?: 1
                val newUnlocked = if (stars >= 1 && currentLevel == currentUnlocked && currentLevel < 50) {
                    nextLevelUnlocked = true
                    currentUnlocked + 1
                } else currentUnlocked

                val updatedStat = GameStatEntity(
                    gameId = currentGameId,
                    highestLevelUnlocked = newUnlocked,
                    totalPlays = (existingStat?.totalPlays ?: 0) + 1,
                    bestScore = maxOf(_uiState.value.score, existingStat?.bestScore ?: 0),
                    bestAccuracy = maxOf(accuracy, existingStat?.bestAccuracy ?: 0f),
                    fastestSpeed = if (existingStat?.fastestSpeed == null || existingStat.fastestSpeed == 0f) speedPerQ
                    else minOf(speedPerQ, existingStat.fastestSpeed),
                    totalStars = (existingStat?.totalStars ?: 0) + stars
                )
                gameStatDao.upsertGameStat(updatedStat)

                // Update Daily Activity
                val todayActivity = dailyActivityDao.getActivity(todayStr)
                val updatedActivity = DailyActivityEntity(
                    dateString = todayStr,
                    sessionsCount = (todayActivity?.sessionsCount ?: 0) + 1,
                    totalXp = (todayActivity?.totalXp ?: 0) + xpEarned,
                    dailyChallengeCompleted = todayActivity?.dailyChallengeCompleted ?: false
                )
                dailyActivityDao.upsertDailyActivity(updatedActivity)

                // Update Streak
                val currentStreak = streakDao.getStreak() ?: StreakRecordEntity()
                if (currentStreak.lastActiveDate != todayStr) {
                    val yesterday = LocalDate.now().minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)
                    val newCount = if (currentStreak.lastActiveDate == yesterday) currentStreak.currentStreak + 1 else 1
                    val newLongest = maxOf(newCount, currentStreak.longestStreak)
                    val earnedFreeze = if (newCount % 7 == 0 && currentStreak.freezesAvailable < 2) currentStreak.freezesAvailable + 1
                    else currentStreak.freezesAvailable

                    streakDao.upsertStreak(
                        currentStreak.copy(
                            currentStreak = newCount,
                            longestStreak = newLongest,
                            lastActiveDate = todayStr,
                            freezesAvailable = earnedFreeze,
                            lastRealtimeMillis = System.currentTimeMillis()
                        )
                    )
                }

                // Update XP & Player Level in preferences
                val newXp = prefs.currentXp + xpEarned
                val newLevel = 1 + (newXp / 500)
                preferencesRepository.updateProgression(level = newLevel, xp = newXp)
            }

            // Always record session so results screen can load full metrics
            val session = SessionEntity(
                id = assignedSessionId,
                gameId = currentGameId,
                category = engine.category.name,
                level = currentLevel,
                score = _uiState.value.score,
                accuracy = accuracy,
                speedSeconds = durationSeconds,
                stars = stars,
                xpEarned = if (_uiState.value.isPractice) 0 else xpEarned,
                mistakes = _uiState.value.mistakes,
                timestamp = System.currentTimeMillis(),
                localDate = todayStr
            )
            sessionDao.insertSession(session)

            val result = GameSessionResult(
                sessionId = assignedSessionId,
                gameId = currentGameId,
                category = engine.category,
                level = currentLevel,
                score = _uiState.value.score,
                totalQuestions = totalQ,
                correctAnswers = correctAnswersCount,
                mistakes = _uiState.value.mistakes,
                accuracy = accuracy,
                durationSeconds = durationSeconds,
                speedPerQuestion = speedPerQ,
                stars = stars,
                xpEarned = if (_uiState.value.isPractice) 0 else xpEarned,
                isNewBest = isNewBest,
                nextLevelUnlocked = nextLevelUnlocked
            )

            _uiState.update {
                it.copy(
                    isGameOver = true,
                    sessionResult = result,
                    feedbackState = FeedbackType.NONE
                )
            }
        }
    }

    fun pauseGame() {
        _uiState.update { it.copy(isPaused = true) }
    }

    fun resumeGame() {
        _uiState.update { it.copy(isPaused = false) }
    }
}
