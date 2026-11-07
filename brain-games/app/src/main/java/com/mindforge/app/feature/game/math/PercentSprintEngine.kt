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
class PercentSprintEngine @Inject constructor() : GameEngine {

    override val id: String = "percent_sprint"
    override val title: String = "Percent Sprint"
    override val category: GameCategory = GameCategory.MATH
    override val isAdvanced: Boolean = false
    override val description: String = "Sharpen rapid percentage calculation, discount estimation, and fraction-to-decimal mental agility."
    override val instructions: List<String> = listOf(
        "Evaluate the percentage or fraction comparison problem.",
        "Pick the correct solution from the 4 options.",
        "Questions progress from common benchmarks (10%, 25%, 50%) to mixed percentages (15%, 35%, 75%)."
    )
    override val tips: List<String> = listOf(
        "10% of N is simply shifting the decimal point one place left (10% of 140 = 14).",
        "15% = 10% + half of 10% (e.g. 15% of 80 = 8 + 4 = 12).",
        "25% is one-quarter (÷ 4); 75% is three-quarters (× 3 ÷ 4)."
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
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 110 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "50% of 84", "42", listOf("38", "42", "44", "48")),
            GameQuestion("p2", "10% of 260", "26", listOf("24", "26", "28", "32")),
            GameQuestion("p3", "25% of 60", "15", listOf("12", "15", "18", "20"))
        )
    }

    private fun buildQuestion(level: Int, rng: Random): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val pct = when {
            clampedLevel <= 5 -> listOf(10, 50, 100).random(rng)
            clampedLevel <= 15 -> listOf(10, 20, 25, 50).random(rng)
            clampedLevel <= 25 -> listOf(5, 10, 15, 25, 50).random(rng)
            clampedLevel <= 40 -> listOf(12, 15, 20, 25, 30, 40, 75).random(rng)
            else -> listOf(15, 35, 45, 60, 65, 75, 80, 85, 95).random(rng)
        }

        // Pick base number that yields clean integer or half-integers
        val multiplier = when (pct) {
            25, 75 -> 4
            20, 40, 60, 80 -> 5
            10, 30, 50, 70, 90 -> 10
            else -> 20
        }
        val factor = rng.nextInt(2, if (clampedLevel <= 20) 10 else 25)
        val baseNumber = multiplier * factor
        val answer = (pct * baseNumber) / 100

        val prompt = "$pct% of $baseNumber"
        val options = mutableSetOf(answer)
        val deltas = listOf(-5, 5, -2, 2, -10, 10, -4, 4).shuffled(rng)
        for (d in deltas) {
            val candidate = answer + d
            if (candidate > 0) options.add(candidate)
            if (options.size == 4) break
        }
        while (options.size < 4) {
            options.add(answer + rng.nextInt(3, 15))
        }

        return GameQuestion(
            id = "pct_${level}_${rng.nextInt(100000)}",
            prompt = prompt,
            targetAnswer = answer.toString(),
            options = options.toList().shuffled(rng).map { it.toString() }
        )
    }
}
