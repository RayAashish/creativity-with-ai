package com.mindforge.app.feature.game.framework

import com.mindforge.app.feature.home.GameCategory
import kotlin.random.Random

data class GameLevelConfig(
    val level: Int,
    val totalQuestions: Int = 10,
    val timeLimitSeconds: Int = 45,
    val maxMistakes: Int = 3,
    val basePointsPerQuestion: Int = 100
)

data class GameQuestion(
    val id: String,
    val prompt: String,
    val targetAnswer: String,
    val options: List<String>? = null, // null if numeric keypad or custom input
    val subPrompt: String? = null,
    val visualPayload: Any? = null
)

data class EvaluationResult(
    val isCorrect: Boolean,
    val correctValue: String,
    val pointsEarned: Int = 0
)

data class GameSessionResult(
    val sessionId: String,
    val gameId: String,
    val category: GameCategory,
    val level: Int,
    val score: Int,
    val totalQuestions: Int,
    val correctAnswers: Int,
    val mistakes: Int,
    val accuracy: Float,
    val durationSeconds: Float,
    val speedPerQuestion: Float,
    val stars: Int, // 1 to 3
    val xpEarned: Int,
    val isNewBest: Boolean,
    val nextLevelUnlocked: Boolean
)

interface GameEngine {
    val id: String
    val title: String
    val category: GameCategory
    val isAdvanced: Boolean
    val description: String
    val instructions: List<String>
    val tips: List<String>

    fun getLevelConfig(level: Int): GameLevelConfig
    fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion
    fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult
    fun generatePracticeQuestions(rng: Random): List<GameQuestion>
}
