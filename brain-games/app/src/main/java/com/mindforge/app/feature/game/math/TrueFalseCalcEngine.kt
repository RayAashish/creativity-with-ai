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
class TrueFalseCalcEngine @Inject constructor() : GameEngine {

    override val id: String = "true_false_calc"
    override val title: String = "True or False"
    override val category: GameCategory = GameCategory.MATH
    override val isAdvanced: Boolean = false
    override val description: String = "Test rapid numerical estimation and sanity-checking under intense time limits."
    override val instructions: List<String> = listOf(
        "Determine whether the displayed equation is mathematically TRUE or FALSE.",
        "Tap TRUE or FALSE as fast as you can.",
        "Incorrect questions often have wrong unit digits or order-of-magnitude errors."
    )
    override val tips: List<String> = listOf(
        "Check the unit digit first: 47 × 6 must end in 2 (7 × 6 = 42). If it shows 284, it's immediately False!",
        "Estimate boundaries: 47 × 6 is roughly 50 × 6 = 300, so 282 is plausible.",
        "Do not compute every digit if a quick glance proves it impossible."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (10 + clampedLevel / 5).coerceIn(10, 18),
            timeLimitSeconds = (25 + clampedLevel / 2).coerceIn(25, 50),
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
        val isCorrect = input.trim().equals(question.targetAnswer.trim(), ignoreCase = true)
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 100 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "12 + 15 = 27", "TRUE", listOf("TRUE", "FALSE")),
            GameQuestion("p2", "8 × 7 = 54", "FALSE", listOf("TRUE", "FALSE")),
            GameQuestion("p3", "45 - 19 = 26", "TRUE", listOf("TRUE", "FALSE"))
        )
    }

    private fun buildQuestion(level: Int, rng: Random): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val isTrue = rng.nextBoolean()
        val op = when {
            clampedLevel <= 5 -> if (rng.nextBoolean()) '+' else '-'
            clampedLevel <= 15 -> listOf('+', '-', '×').random(rng)
            else -> listOf('+', '-', '×', '÷').random(rng)
        }

        val (expr, actualAnswer) = when (op) {
            '+' -> {
                val a = rng.nextInt(15, if (clampedLevel <= 20) 60 else 300)
                val b = rng.nextInt(10, if (clampedLevel <= 20) 50 else 250)
                Pair("$a + $b", a + b)
            }
            '-' -> {
                val b = rng.nextInt(10, if (clampedLevel <= 20) 50 else 250)
                val diff = rng.nextInt(12, if (clampedLevel <= 20) 60 else 300)
                val a = b + diff
                Pair("$a - $b", diff)
            }
            '×' -> {
                val a = rng.nextInt(6, if (clampedLevel <= 20) 18 else 45)
                val b = rng.nextInt(3, if (clampedLevel <= 20) 12 else 20)
                Pair("$a × $b", a * b)
            }
            else -> {
                val divisor = rng.nextInt(3, if (clampedLevel <= 25) 12 else 20)
                val quotient = rng.nextInt(6, if (clampedLevel <= 25) 25 else 45)
                val dividend = divisor * quotient
                Pair("$dividend ÷ $divisor", quotient)
            }
        }

        val displayedResult = if (isTrue) {
            actualAnswer
        } else {
            // Tamper result slightly (unit digit error or ±10 error)
            val delta = listOf(-2, 2, -1, 1, -10, 10, -5, 5).random(rng)
            actualAnswer + delta
        }

        return GameQuestion(
            id = "tf_${level}_${rng.nextInt(100000)}",
            prompt = "$expr = $displayedResult",
            targetAnswer = if (isTrue) "TRUE" else "FALSE",
            options = listOf("TRUE", "FALSE")
        )
    }
}
