package com.mindforge.app.feature.game.focus

import com.mindforge.app.feature.game.framework.EvaluationResult
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameLevelConfig
import com.mindforge.app.feature.game.framework.GameQuestion
import com.mindforge.app.feature.home.GameCategory
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.random.Random

@Singleton
class OddOneOutEngine @Inject constructor() : GameEngine {

    override val id: String = "odd_one_out"
    override val title: String = "Odd One Out"
    override val category: GameCategory = GameCategory.FOCUS
    override val isAdvanced: Boolean = false
    override val description: String = "Detect subtle visual and mathematical anomalies hiding among uniform distractor patterns."
    override val instructions: List<String> = listOf(
        "Inspect the 4 options carefully.",
        "3 options share a strict rule (symmetry, parity, multiple, geometry).",
        "Identify and select the single item that violates the rule."
    )
    override val tips: List<String> = listOf(
        "Check parity (even vs odd) or divisibility (multiples of 3, 5, 7).",
        "Check geometric orientation (direction of arrows or bracket pairs).",
        "Count stroke or symbol frequencies."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (8 + (clampedLevel / 6)).coerceAtMost(16),
            timeLimitSeconds = (30 + (clampedLevel / 2)).coerceAtMost(60),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 55 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val tier = (((clampedLevel - 1) * 9) / 49) + 1
        var attempts = 0
        while (attempts < 50) {
            attempts++
            val q = buildQuestion(tier, rng)
            if (!history.contains(q.prompt)) return q
        }
        return buildQuestion(tier, rng)
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 110 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "Spot the anomaly (Divisibility):", "26", listOf("14", "21", "26", "35")),
            GameQuestion("p2", "Spot the anomaly (Orientation):", "◀ Left", listOf("▲ Up", "▲ Up", "◀ Left", "▲ Up"))
        )
    }

    private fun buildQuestion(level: Int, rng: Random): GameQuestion {
        val categoryType = when (level) {
            in 1..3 -> 0 // Multiples / Parity
            in 4..6 -> 1 // Prime vs Composite or Powers
            else -> 2 // Complex symbolic or modular
        }

        return when (categoryType) {
            0 -> {
                // Divisibility: 3 multiples of factor, 1 non-multiple
                val factor = listOf(3, 4, 6, 7, 8, 9).random(rng)
                val baseK = rng.nextInt(3, 10)
                val uniform = (0..2).map { (baseK + it) * factor }
                val odd = (baseK + 3) * factor + listOf(1, 2, -1, -2).random(rng)
                val options = (uniform + odd).shuffled(rng).map { it.toString() }
                GameQuestion(
                    id = "ooo_${level}_${rng.nextInt(100000)}",
                    prompt = "Spot the anomaly (Divisibility by $factor):",
                    targetAnswer = odd.toString(),
                    options = options
                )
            }
            1 -> {
                // Perfect squares vs non-square
                val roots = (3..12).shuffled(rng).take(3)
                val squares = roots.map { it * it }
                val nonSquare = listOf(18, 22, 28, 32, 45, 54, 72, 88).random(rng)
                val options = (squares + nonSquare).shuffled(rng).map { it.toString() }
                GameQuestion(
                    id = "ooo_${level}_${rng.nextInt(100000)}",
                    prompt = "Spot the anomaly (Square Numbers):",
                    targetAnswer = nonSquare.toString(),
                    options = options
                )
            }
            else -> {
                // Character pattern repetition
                val patterns = listOf(
                    listOf(">>> >", ">>> >", ">>> >", "<<< <"),
                    listOf("[ * * ]", "[ * * ]", "[ * * ]", "[ * · ]"),
                    listOf("✦ ✦ ✦", "✦ ✦ ✦", "✦ ✦ ✦", "✦ ✦ ✧")
                )
                val set = patterns.random(rng)
                val odd = set.last()
                GameQuestion(
                    id = "ooo_${level}_${rng.nextInt(100000)}",
                    prompt = "Spot the visual anomaly:",
                    targetAnswer = odd,
                    options = set.shuffled(rng)
                )
            }
        }
    }
}
