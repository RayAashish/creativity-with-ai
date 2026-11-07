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
class NumberSequenceEngine @Inject constructor() : GameEngine {

    override val id: String = "number_sequence"
    override val title: String = "Number Sequence"
    override val category: GameCategory = GameCategory.MATH
    override val isAdvanced: Boolean = true
    override val description: String = "Deduce the mathematical recurrence rule and predict the missing next term in the progression."
    override val instructions: List<String> = listOf(
        "Observe the numerical sequence and deduce the underlying pattern.",
        "Select the next logical number from the 4 options.",
        "Patterns span arithmetic, geometric, alternating, square offsets, and Fibonacci progressions."
    )
    override val tips: List<String> = listOf(
        "Calculate the differences between consecutive terms (first difference row).",
        "If differences are constant, it's arithmetic. If differences grow linearly (+3, +5, +7), it's quadratic.",
        "If terms grow explosively, check multiplication (e.g. ×2 or ×3)."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (8 + clampedLevel / 5).coerceIn(8, 16),
            timeLimitSeconds = (40 + clampedLevel / 2).coerceIn(40, 65),
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
            GameQuestion("p1", "4,  7,  10,  13,  16,  [ ? ]", "19", listOf("18", "19", "20", "22")),
            GameQuestion("p2", "3,  6,  12,  24,  48,  [ ? ]", "96", listOf("84", "92", "96", "108")),
            GameQuestion("p3", "2,  3,  5,  8,  13,  [ ? ]", "21", listOf("19", "20", "21", "24"))
        )
    }

    private fun buildQuestion(level: Int, rng: Random): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val patternType = when {
            clampedLevel <= 5 -> 0 // Simple arithmetic addition (+2..+7)
            clampedLevel <= 12 -> if (rng.nextBoolean()) 0 else 1 // Arithmetic sub or add
            clampedLevel <= 20 -> rng.nextInt(3) // Add, sub, geometric (×2)
            clampedLevel <= 30 -> rng.nextInt(4) // Add, sub, geom, alternating (+a, -b)
            clampedLevel <= 40 -> rng.nextInt(5) // Above + quadratic (+2, +4, +6 or +3, +5, +7)
            else -> rng.nextInt(6) // Above + Fibonacci-like
        }

        val sequence: List<Int>
        val nextTerm: Int

        when (patternType) {
            0 -> {
                // Arithmetic addition
                val diff = rng.nextInt(3, 9)
                val start = rng.nextInt(2, 20)
                sequence = (0..4).map { start + it * diff }
                nextTerm = start + 5 * diff
            }
            1 -> {
                // Arithmetic subtraction
                val diff = rng.nextInt(3, 8)
                val start = rng.nextInt(40, 80)
                sequence = (0..4).map { start - it * diff }
                nextTerm = start - 5 * diff
            }
            2 -> {
                // Geometric (×2 or ×3)
                val mult = if (level <= 4) 2 else listOf(2, 3).random(rng)
                val start = rng.nextInt(2, 6)
                sequence = (0..4).scan(start) { acc, _ -> acc * mult }.take(5)
                nextTerm = sequence.last() * mult
            }
            3 -> {
                // Alternating: +a, -b
                val add = rng.nextInt(4, 9)
                val sub = rng.nextInt(2, 5)
                var curr = rng.nextInt(10, 25)
                val list = mutableListOf(curr)
                repeat(5) { i ->
                    curr = if (i % 2 == 0) curr + add else curr - sub
                    list.add(curr)
                }
                sequence = list.take(5)
                nextTerm = list.last()
            }
            4 -> {
                // Quadratic differences: d, d+2, d+4...
                var d = rng.nextInt(2, 5)
                var curr = rng.nextInt(2, 10)
                val list = mutableListOf(curr)
                repeat(5) {
                    curr += d
                    d += 2
                    list.add(curr)
                }
                sequence = list.take(5)
                nextTerm = list.last()
            }
            else -> {
                // Fibonacci style: a, b, a+b, b+(a+b)...
                val a = rng.nextInt(1, 5)
                val b = rng.nextInt(2, 6)
                val list = mutableListOf(a, b)
                repeat(4) {
                    list.add(list[list.size - 1] + list[list.size - 2])
                }
                sequence = list.take(5)
                nextTerm = list.last()
            }
        }

        val prompt = sequence.joinToString(",   ") + ",   [ ? ]"
        val options = mutableSetOf(nextTerm)
        val deltas = listOf(-2, 2, -1, 1, -4, 4, -3, 3).shuffled(rng)
        for (d in deltas) {
            val cand = nextTerm + d
            if (cand > 0) options.add(cand)
            if (options.size == 4) break
        }
        while (options.size < 4) {
            options.add(nextTerm + rng.nextInt(5, 15))
        }

        return GameQuestion(
            id = "ns_${level}_${rng.nextInt(100000)}",
            prompt = prompt,
            targetAnswer = nextTerm.toString(),
            options = options.toList().shuffled(rng).map { it.toString() }
        )
    }
}
