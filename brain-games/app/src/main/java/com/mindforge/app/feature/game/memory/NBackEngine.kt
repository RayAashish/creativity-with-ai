package com.mindforge.app.feature.game.memory

import com.mindforge.app.feature.game.framework.EvaluationResult
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameLevelConfig
import com.mindforge.app.feature.game.framework.GameQuestion
import com.mindforge.app.feature.home.GameCategory
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.random.Random

@Singleton
class NBackEngine @Inject constructor() : GameEngine {

    override val id: String = "n_back"
    override val title: String = "N-Back"
    override val category: GameCategory = GameCategory.MEMORY
    override val isAdvanced: Boolean = true
    override val description: String = "Gold-standard working memory challenge: constantly update memory to match current item with N steps back."
    override val instructions: List<String> = listOf(
        "Observe the current letter stream.",
        "Check whether the final letter matches the one shown exactly N steps back.",
        "Tap MATCH if identical, or NO MATCH if different."
    )
    override val tips: List<String> = listOf(
        "Keep a rolling buffer of N letters in your mind (e.g. for 2-back: 'B, K' -> new letter 'B' arrives -> 'B matches B!').",
        "Displace the oldest letter as each new one arrives.",
        "Do not dwell on past errors; immediately reset your rolling buffer."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (8 + (clampedLevel / 6)).coerceAtMost(16),
            timeLimitSeconds = (25 + (clampedLevel / 2)).coerceAtMost(60),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 60 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val n = when {
            clampedLevel in 1..15 -> 1
            clampedLevel in 16..35 -> 2
            else -> 3
        }

        val letters = listOf("A", "B", "C", "D", "E", "H", "K", "M", "T", "X", "Z", "R")
        val streamLength = n + 2

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val stream = (0 until streamLength).map { letters.random(rng) }.toMutableList()
            val isMatch = rng.nextBoolean()
            if (isMatch) {
                stream[stream.size - 1] = stream[stream.size - 1 - n]
            } else {
                while (stream[stream.size - 1] == stream[stream.size - 1 - n]) {
                    stream[stream.size - 1] = letters.random(rng)
                }
            }

            val targetAnswer = if (isMatch) "MATCH" else "NO MATCH"
            val prompt = "$n-BACK TEST\nStream: ${stream.joinToString("  →  ")}\n\nDoes the last letter match $n step(s) back?"

            if (!history.contains(prompt)) {
                return GameQuestion(
                    id = "nb_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = listOf("MATCH", "NO MATCH")
                )
            }
        }

        val stream = (0 until streamLength).map { letters.random(rng) }.toMutableList()
        val isMatch = rng.nextBoolean()
        if (isMatch) stream[stream.size - 1] = stream[stream.size - 1 - n]
        else {
            while (stream[stream.size - 1] == stream[stream.size - 1 - n]) {
                stream[stream.size - 1] = letters.random(rng)
            }
        }
        val targetAnswer = if (isMatch) "MATCH" else "NO MATCH"
        val prompt = "$n-BACK TEST\nStream: ${stream.joinToString("  →  ")}\n\nDoes the last letter match $n step(s) back?"
        return GameQuestion(
            id = "nb_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = targetAnswer,
            options = listOf("MATCH", "NO MATCH")
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim().equals(question.targetAnswer.trim(), ignoreCase = true)
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 140 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "1-BACK TEST\nStream: B  →  K  →  K\n\nDoes the last letter match 1 step back?", "MATCH", listOf("MATCH", "NO MATCH")),
            GameQuestion("p2", "2-BACK TEST\nStream: A  →  M  →  D  →  M\n\nDoes the last letter match 2 steps back?", "MATCH", listOf("MATCH", "NO MATCH")),
            GameQuestion("p3", "2-BACK TEST\nStream: C  →  H  →  E  →  T\n\nDoes the last letter match 2 steps back?", "NO MATCH", listOf("MATCH", "NO MATCH"))
        )
    }
}
