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
class SpeedChainEngine @Inject constructor() : GameEngine {

    override val id: String = "speed_chain"
    override val title: String = "Speed Chain"
    override val category: GameCategory = GameCategory.MATH
    override val isAdvanced: Boolean = false
    override val description: String = "Maintain an uninterrupted running total in your working memory as operations chain together."
    override val instructions: List<String> = listOf(
        "Start with the initial base number.",
        "Apply each consecutive operation left-to-right (no BODMAS precedence; this is an accumulator chain!).",
        "Select or enter the final calculated running total.",
        "Chain length expands with each level."
    )
    override val tips: List<String> = listOf(
        "Do not wait until the end — compute each modifier immediately as you read it.",
        "For additions bridging a ten (e.g. 27 + 6), think: 27 + 3 + 3 = 33.",
        "When dividing, expect clean whole numbers."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        val totalQ = (6 + (clampedLevel / 6)).coerceAtMost(14)
        val timeSec = (35 + (clampedLevel / 2)).coerceAtMost(70)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = totalQ,
            timeLimitSeconds = timeSec,
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 60 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val tier = (((clampedLevel - 1) * 9) / 49) + 1
        val stepsCount = when (tier) {
            in 1..2 -> 3
            in 3..4 -> 4
            in 5..6 -> 5
            in 7..8 -> 6
            else -> 7
        }

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val (chainText, finalTotal) = buildChain(stepsCount, tier, rng)
            if (!history.contains(chainText)) {
                val options = generateDistractors(finalTotal, rng)
                return GameQuestion(
                    id = "sc_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = chainText,
                    targetAnswer = finalTotal.toString(),
                    options = options
                )
            }
        }

        val (chainText, finalTotal) = buildChain(stepsCount, tier, rng)
        return GameQuestion(
            id = "sc_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = chainText,
            targetAnswer = finalTotal.toString(),
            options = generateDistractors(finalTotal, rng)
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(
            isCorrect = isCorrect,
            correctValue = question.targetAnswer,
            pointsEarned = if (isCorrect) 120 else 0
        )
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "10 → + 5 → × 2", "30", listOf("25", "30", "35", "40")),
            GameQuestion("p2", "8 → × 3 → - 4", "20", listOf("18", "20", "22", "24")),
            GameQuestion("p3", "16 → ÷ 2 → + 9", "17", listOf("15", "16", "17", "19"))
        )
    }

    private fun buildChain(steps: Int, level: Int, rng: Random): Pair<String, Int> {
        var current = rng.nextInt(4, if (level <= 3) 12 else 20)
        val sb = StringBuilder(current.toString())

        for (i in 0 until steps) {
            val op = chooseOperation(current, level, rng)
            when (op) {
                '+' -> {
                    val addVal = rng.nextInt(3, if (level <= 4) 15 else 30)
                    current += addVal
                    sb.append(" → + $addVal")
                }
                '-' -> {
                    val maxSub = (current - 2).coerceAtLeast(1)
                    val subVal = rng.nextInt(2, maxSub.coerceAtMost(if (level <= 4) 15 else 25) + 1)
                    current -= subVal
                    sb.append(" → − $subVal")
                }
                '×' -> {
                    val mulVal = rng.nextInt(2, if (level <= 3) 4 else 5)
                    current *= mulVal
                    sb.append(" → × $mulVal")
                }
                '÷' -> {
                    val divisors = (2..6).filter { current % it == 0 }
                    val divVal = if (divisors.isNotEmpty()) divisors.random(rng) else 2
                    if (current % divVal == 0) {
                        current /= divVal
                        sb.append(" → ÷ $divVal")
                    } else {
                        val addVal = divVal - (current % divVal)
                        current += addVal
                        sb.append(" → + $addVal")
                    }
                }
            }
        }

        return Pair(sb.toString(), current)
    }

    private fun chooseOperation(current: Int, level: Int, rng: Random): Char {
        return when {
            current > 80 -> if (current % 2 == 0 && rng.nextBoolean()) '÷' else '-'
            current < 10 -> if (rng.nextBoolean()) '+' else '×'
            level <= 2 -> if (rng.nextBoolean()) '+' else '-'
            level <= 5 -> listOf('+', '-', '×').random(rng)
            else -> listOf('+', '-', '×', '÷').random(rng)
        }
    }

    private fun generateDistractors(correct: Int, rng: Random): List<String> {
        val set = mutableSetOf(correct)
        val deltas = listOf(-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, -10, 10).shuffled(rng)
        for (d in deltas) {
            val candidate = correct + d
            if (candidate > 0) set.add(candidate)
            if (set.size == 4) break
        }
        while (set.size < 4) {
            set.add(correct + rng.nextInt(6, 20))
        }
        return set.toList().shuffled(rng).map { it.toString() }
    }
}
