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
class QuickCalcEngine @Inject constructor() : GameEngine {

    override val id: String = "quick_calc"
    override val title: String = "Quick Calc"
    override val category: GameCategory = GameCategory.MATH
    override val isAdvanced: Boolean = false
    override val description: String = "Fast-paced arithmetic calculations scaling from single-digit operations to chained BODMAS expressions."
    override val instructions: List<String> = listOf(
        "Solve the mathematical expression as quickly and accurately as possible.",
        "Enter your answer using the numeric keypad.",
        "Higher consecutive correct streaks grant multiplied XP and bonus scores.",
        "Remember standard BODMAS order of operations for chained expressions."
    )
    override val tips: List<String> = listOf(
        "Look for friendly numbers (e.g. 8 + 7 = 8 + 2 + 5 = 15).",
        "For multiplication like 14 × 6, break it into (10 × 6) + (4 × 6) = 60 + 24 = 84.",
        "Multiplication and division take precedence over addition and subtraction."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        val totalQ = (8 + (clampedLevel / 5)).coerceAtMost(16)
        val timeSec = (35 + (clampedLevel / 2)).coerceAtMost(70)
        val maxMistakes = if (clampedLevel <= 15) 3 else 2
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = totalQ,
            timeLimitSeconds = timeSec,
            maxMistakes = maxMistakes,
            basePointsPerQuestion = 50 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        var attempts = 0
        while (attempts < 50) {
            attempts++
            val (prompt, answer) = buildExpression(clampedLevel, rng)
            if (!history.contains(prompt)) {
                return GameQuestion(
                    id = "qc_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = answer.toString()
                )
            }
        }
        val (prompt, answer) = buildExpression(clampedLevel, rng)
        return GameQuestion(
            id = "qc_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = answer.toString()
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(
            isCorrect = isCorrect,
            correctValue = question.targetAnswer,
            pointsEarned = if (isCorrect) 100 else 0
        )
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "6 + 7", "13"),
            GameQuestion("p2", "15 - 8", "7"),
            GameQuestion("p3", "4 × 5", "20")
        )
    }

    private fun buildExpression(level: Int, rng: Random): Pair<String, Int> {
        val tier = (((level.coerceIn(1, 50) - 1) * 9) / 49) + 1
        return when (tier) {
            1 -> {
                // 1-digit add / sub
                val a = rng.nextInt(3, 10)
                val b = rng.nextInt(2, 10)
                if (rng.nextBoolean()) {
                    Pair("$a + $b", a + b)
                } else {
                    val maxVal = maxOf(a, b)
                    val minVal = minOf(a, b)
                    Pair("$maxVal - $minVal", maxVal - minVal)
                }
            }
            2 -> {
                // 1-digit add / sub / mult
                when (rng.nextInt(3)) {
                    0 -> {
                        val a = rng.nextInt(5, 15)
                        val b = rng.nextInt(3, 12)
                        Pair("$a + $b", a + b)
                    }
                    1 -> {
                        val a = rng.nextInt(10, 20)
                        val b = rng.nextInt(3, 10)
                        Pair("$a - $b", a - b)
                    }
                    else -> {
                        val a = rng.nextInt(3, 10)
                        val b = rng.nextInt(2, 9)
                        Pair("$a × $b", a * b)
                    }
                }
            }
            3 -> {
                // 2-digit + 1-digit add/sub and single-digit division
                when (rng.nextInt(3)) {
                    0 -> {
                        val a = rng.nextInt(15, 60)
                        val b = rng.nextInt(5, 15)
                        Pair("$a + $b", a + b)
                    }
                    1 -> {
                        val a = rng.nextInt(20, 60)
                        val b = rng.nextInt(5, 18)
                        Pair("$a - $b", a - b)
                    }
                    else -> {
                        val divisor = rng.nextInt(2, 10)
                        val quotient = rng.nextInt(3, 12)
                        val dividend = divisor * quotient
                        Pair("$dividend ÷ $divisor", quotient)
                    }
                }
            }
            4 -> {
                // 2-digit + 2-digit add / sub
                val a = rng.nextInt(25, 85)
                val b = rng.nextInt(15, 65)
                if (rng.nextBoolean()) {
                    Pair("$a + $b", a + b)
                } else {
                    val high = maxOf(a, b)
                    val low = minOf(a, b)
                    Pair("$high - $low", high - low)
                }
            }
            5 -> {
                // 2-digit × 1-digit or division with 2-digit quotient
                if (rng.nextBoolean()) {
                    val a = rng.nextInt(12, 25)
                    val b = rng.nextInt(3, 9)
                    Pair("$a × $b", a * b)
                } else {
                    val divisor = rng.nextInt(3, 9)
                    val quotient = rng.nextInt(11, 25)
                    val dividend = divisor * quotient
                    Pair("$dividend ÷ $divisor", quotient)
                }
            }
            6 -> {
                // 2-digit × 2-digit (easier) or chained simple: a + b × c
                if (rng.nextBoolean()) {
                    val b = rng.nextInt(3, 9)
                    val c = rng.nextInt(4, 9)
                    val a = rng.nextInt(10, 40)
                    Pair("$a + $b × $c", a + (b * c))
                } else {
                    val a = rng.nextInt(11, 20)
                    val b = rng.nextInt(11, 16)
                    Pair("$a × $b", a * b)
                }
            }
            7 -> {
                // Chained 3-operand BODMAS: a × b - c or a + b ÷ c
                if (rng.nextBoolean()) {
                    val a = rng.nextInt(6, 15)
                    val b = rng.nextInt(4, 12)
                    val c = rng.nextInt(10, 35)
                    Pair("$a × $b - $c", (a * b) - c)
                } else {
                    val c = rng.nextInt(3, 8)
                    val quotient = rng.nextInt(4, 12)
                    val b = c * quotient
                    val a = rng.nextInt(20, 60)
                    Pair("$a + $b ÷ $c", a + quotient)
                }
            }
            8 -> {
                // 3-digit operations and 2-digit multiplication
                if (rng.nextBoolean()) {
                    val a = rng.nextInt(120, 450)
                    val b = rng.nextInt(110, 350)
                    Pair("$a + $b", a + b)
                } else {
                    val a = rng.nextInt(15, 35)
                    val b = rng.nextInt(12, 22)
                    Pair("$a × $b", a * b)
                }
            }
            9 -> {
                // Parentheses expressions: (a - b) × c + d
                val b = rng.nextInt(5, 20)
                val diff = rng.nextInt(5, 15)
                val a = b + diff
                val c = rng.nextInt(3, 8)
                val d = rng.nextInt(10, 40)
                Pair("($a - $b) × $c + $d", (diff * c) + d)
            }
            else -> {
                // Level 10: Chained 4 operations: a ÷ b + c × d - e
                val b = rng.nextInt(3, 9)
                val q = rng.nextInt(10, 25)
                val a = b * q
                val c = rng.nextInt(6, 14)
                val d = rng.nextInt(4, 12)
                val e = rng.nextInt(15, 45)
                val result = q + (c * d) - e
                Pair("$a ÷ $b + $c × $d - $e", result)
            }
        }
    }
}
