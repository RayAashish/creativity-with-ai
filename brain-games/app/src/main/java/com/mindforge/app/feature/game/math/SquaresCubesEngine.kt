package com.mindforge.app.feature.game.math

import com.mindforge.app.feature.game.framework.EvaluationResult
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameLevelConfig
import com.mindforge.app.feature.game.framework.GameQuestion
import com.mindforge.app.feature.home.GameCategory
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.random.Random

@Singleton
class SquaresCubesEngine @Inject constructor() : GameEngine {

    override val id: String = "squares_cubes"
    override val title: String = "Powers & Roots"
    override val category: GameCategory = GameCategory.MATH
    override val isAdvanced: Boolean = true
    override val description: String = "Develop instant recall of squares, cubes, square roots, and cube roots without manual scratchpad calculation."
    override val instructions: List<String> = listOf(
        "Evaluate the power or root expression displayed on screen.",
        "Select the correct answer from the 4 options.",
        "Ranges expand from single digits up to squares of 35 and cubes of 15."
    )
    override val tips: List<String> = listOf(
        "Squares ending in 5 always end in 25 (e.g. 25² = 2 × 3 hundred + 25 = 625).",
        "Use unit digits to eliminate options (e.g. 7² ends in 9, 8³ ends in 2).",
        "Square roots are the inverse: √196 = 14 because 14² = 196."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (8 + clampedLevel / 5).coerceIn(8, 16),
            timeLimitSeconds = (35 + clampedLevel).coerceIn(35, 60),
            maxMistakes = if (clampedLevel <= 25) 3 else 2,
            basePointsPerQuestion = 100 + clampedLevel * 10
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        var attempts = 0
        while (attempts < 50) {
            attempts++
            val q = buildQuestion(level, rng)
            if (!history.contains(q.prompt)) return q
        }
        return buildQuestion(level, rng)
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 120 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "7²", "49", listOf("42", "47", "49", "54")),
            GameQuestion("p2", "√81", "9", listOf("7", "8", "9", "11")),
            GameQuestion("p3", "4³", "64", listOf("48", "64", "72", "84"))
        )
    }

    private fun buildQuestion(level: Int, rng: Random): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val tier = (((clampedLevel - 1) * 9) / 49) + 1 // 1..10
        val type = when (tier) {
            1 -> 0 // Squares 2..12
            2 -> if (rng.nextBoolean()) 0 else 1 // Squares 2..15 or Roots <= 144
            3 -> if (rng.nextBoolean()) 0 else 2 // Squares or Cubes 2..6
            4 -> rng.nextInt(3) // Squares, Roots, Cubes
            5, 6 -> rng.nextInt(4) // Squares, Roots, Cubes, Cube Roots
            else -> rng.nextInt(4)
        }

        val (prompt, answer, _) = when (type) {
            0 -> {
                val baseMax = when {
                    clampedLevel <= 10 -> 15
                    clampedLevel <= 25 -> 25
                    clampedLevel <= 40 -> 35
                    else -> 50
                }
                val n = rng.nextInt(3, baseMax + 1)
                Triple("$n²", n * n, n * n + 50)
            }
            1 -> {
                val baseMax = when {
                    clampedLevel <= 10 -> 15
                    clampedLevel <= 25 -> 25
                    clampedLevel <= 40 -> 35
                    else -> 45
                }
                val n = rng.nextInt(4, baseMax + 1)
                val sq = n * n
                Triple("√$sq", n, baseMax + 5)
            }
            2 -> {
                val baseMax = when {
                    clampedLevel <= 10 -> 7
                    clampedLevel <= 25 -> 10
                    clampedLevel <= 40 -> 15
                    else -> 20
                }
                val n = rng.nextInt(2, baseMax + 1)
                val cb = n * n * n
                Triple("$n³", cb, cb + 100)
            }
            else -> {
                val baseMax = when {
                    clampedLevel <= 15 -> 8
                    clampedLevel <= 30 -> 12
                    else -> 16
                }
                val n = rng.nextInt(2, baseMax + 1)
                val cb = n * n * n
                Triple("∛$cb", n, baseMax + 5)
            }
        }

        val options = mutableSetOf(answer)
        val deltas = listOf(-2, -1, 1, 2, -10, 10, -5, 5).shuffled(rng)
        for (d in deltas) {
            val candidate = answer + d
            if (candidate > 0) options.add(candidate)
            if (options.size == 4) break
        }
        while (options.size < 4) {
            options.add(answer + rng.nextInt(3, 20))
        }

        return GameQuestion(
            id = "sq_${level}_${rng.nextInt(100000)}",
            prompt = prompt,
            targetAnswer = answer.toString(),
            options = options.toList().shuffled(rng).map { it.toString() }
        )
    }
}
