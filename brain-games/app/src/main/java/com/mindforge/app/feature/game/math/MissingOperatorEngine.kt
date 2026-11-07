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
class MissingOperatorEngine @Inject constructor() : GameEngine {

    override val id: String = "missing_operator"
    override val title: String = "Missing Element"
    override val category: GameCategory = GameCategory.MATH
    override val isAdvanced: Boolean = false
    override val description: String = "Identify the missing operator (+, −, ×, ÷) or unknown operand that balances the equation."
    override val instructions: List<String> = listOf(
        "Look at the equation with the blank [ ? ] symbol.",
        "Deduce which operator or operand makes the statement mathematically true.",
        "Select the correct answer from the 4 options before time expires."
    )
    override val tips: List<String> = listOf(
        "If the result is larger than both inputs, consider addition or multiplication.",
        "If the result is significantly smaller, check division or subtraction.",
        "Use unit-digit analysis (e.g. ? × 8 ending in 6 must be 2 or 7)."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        val totalQ = (8 + (clampedLevel / 5)).coerceAtMost(16)
        val timeSec = (35 + (clampedLevel / 2)).coerceAtMost(70)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = totalQ,
            timeLimitSeconds = timeSec,
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
            if (!history.contains(q.prompt)) {
                return q
            }
        }
        return buildQuestion(tier, rng)
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(
            isCorrect = isCorrect,
            correctValue = question.targetAnswer,
            pointsEarned = if (isCorrect) 110 else 0
        )
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "8 [ ? ] 4 = 32", "×", listOf("+", "−", "×", "÷")),
            GameQuestion("p2", "[ ? ] + 12 = 25", "13", listOf("11", "12", "13", "15")),
            GameQuestion("p3", "45 [ ? ] 9 = 5", "÷", listOf("+", "−", "×", "÷"))
        )
    }

    private fun buildQuestion(level: Int, rng: Random): GameQuestion {
        val isOperatorMode = rng.nextBoolean() || level <= 3

        return if (isOperatorMode) {
            generateMissingOperatorQuestion(level, rng)
        } else {
            generateMissingOperandQuestion(level, rng)
        }
    }

    private fun generateMissingOperatorQuestion(level: Int, rng: Random): GameQuestion {
        val op = when (level) {
            1 -> if (rng.nextBoolean()) '+' else '-'
            2, 3 -> listOf('+', '-', '×').random(rng)
            else -> listOf('+', '-', '×', '÷').random(rng)
        }

        val (a, b, result) = when (op) {
            '+' -> {
                val x = rng.nextInt(5, if (level <= 4) 25 else 75)
                val y = rng.nextInt(4, if (level <= 4) 20 else 60)
                Triple(x, y, x + y)
            }
            '-' -> {
                val y = rng.nextInt(4, if (level <= 4) 20 else 50)
                val diff = rng.nextInt(3, if (level <= 4) 25 else 60)
                val x = y + diff
                Triple(x, y, diff)
            }
            '×' -> {
                val x = rng.nextInt(3, if (level <= 4) 10 else 18)
                val y = rng.nextInt(3, if (level <= 4) 9 else 15)
                Triple(x, y, x * y)
            }
            else -> {
                val y = rng.nextInt(2, if (level <= 5) 9 else 14)
                val q = rng.nextInt(3, if (level <= 5) 12 else 20)
                val x = y * q
                Triple(x, y, q)
            }
        }

        val opSymbol = when (op) {
            '+' -> "+"
            '-' -> "−"
            '×' -> "×"
            else -> "÷"
        }

        return GameQuestion(
            id = "mo_${level}_${rng.nextInt(100000)}",
            prompt = "$a  [ ? ]  $b  =  $result",
            targetAnswer = opSymbol,
            options = listOf("+", "−", "×", "÷")
        )
    }

    private fun generateMissingOperandQuestion(level: Int, rng: Random): GameQuestion {
        val op = listOf('+', '-', '×', '÷').random(rng)
        val isFirstMissing = rng.nextBoolean()

        val (missingVal, knownVal, result, symbol) = when (op) {
            '+' -> {
                val a = rng.nextInt(10, 50)
                val b = rng.nextInt(8, 40)
                val sum = a + b
                if (isFirstMissing) Quad(a, b, sum, "+") else Quad(b, a, sum, "+")
            }
            '-' -> {
                val b = rng.nextInt(8, 35)
                val diff = rng.nextInt(10, 45)
                val a = b + diff
                if (isFirstMissing) Quad(a, b, diff, "−") else Quad(b, a, diff, "−")
            }
            '×' -> {
                val a = rng.nextInt(4, 15)
                val b = rng.nextInt(3, 12)
                val prod = a * b
                if (isFirstMissing) Quad(a, b, prod, "×") else Quad(b, a, prod, "×")
            }
            else -> {
                val divisor = rng.nextInt(3, 10)
                val quotient = rng.nextInt(4, 15)
                val dividend = divisor * quotient
                if (isFirstMissing) Quad(dividend, divisor, quotient, "÷") else Quad(divisor, dividend, quotient, "÷")
            }
        }

        val prompt = if (isFirstMissing) {
            "[ ? ]  $symbol  $knownVal  =  $result"
        } else {
            "$knownVal  $symbol  [ ? ]  =  $result"
        }

        val distractors = mutableSetOf(missingVal)
        val deltas = listOf(-2, -1, 1, 2, -3, 3, -5, 5).shuffled(rng)
        for (d in deltas) {
            val cand = missingVal + d
            if (cand > 0) distractors.add(cand)
            if (distractors.size == 4) break
        }
        while (distractors.size < 4) {
            distractors.add(missingVal + rng.nextInt(6, 15))
        }

        return GameQuestion(
            id = "mop_${level}_${rng.nextInt(100000)}",
            prompt = prompt,
            targetAnswer = missingVal.toString(),
            options = distractors.toList().shuffled(rng).map { it.toString() }
        )
    }

    private data class Quad(val a: Int, val b: Int, val c: Int, val s: String)
}
