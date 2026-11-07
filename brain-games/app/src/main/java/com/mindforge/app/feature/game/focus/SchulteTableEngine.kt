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
class SchulteTableEngine @Inject constructor() : GameEngine {

    override val id: String = "schulte_table"
    override val title: String = "Schulte Grid"
    override val category: GameCategory = GameCategory.FOCUS
    override val isAdvanced: Boolean = false
    override val description: String = "Expand peripheral visual field and speed of mental scanning across randomized numeric matrices."
    override val instructions: List<String> = listOf(
        "Scan the randomized numeric grid.",
        "Deduce which number is missing from the 1-to-N sequence, or locate target numbers in rapid succession.",
        "Select the correct answer from the 4 options."
    )
    override val tips: List<String> = listOf(
        "Fixate your eyes near the center of the grid and use peripheral vision.",
        "Do not scan cell-by-cell; take in rows or quadrants in quick gulps.",
        "Sum check: The sum of 1..9 is 45; the sum of 1..16 is 136."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (8 + (clampedLevel / 6)).coerceAtMost(16),
            timeLimitSeconds = (30 + (clampedLevel / 2)).coerceAtMost(65),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 55 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val size = if (clampedLevel <= 20) 3 else 4
        val maxNum = size * size

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val numbers = (1..maxNum).toMutableList()
            val missingNum = numbers.random(rng)
            val shuffledGrid = numbers.map { if (it == missingNum) "[ ? ]" else String.format("%2d", it) }.shuffled(rng)

            val sb = StringBuilder("Schulte Grid (${size}x$size) — Find [ ? ]:\n\n")
            for (r in 0 until size) {
                val row = shuffledGrid.subList(r * size, (r + 1) * size)
                sb.append(row.joinToString("   ")).append("\n")
            }
            val prompt = sb.toString().trimEnd()

            if (!history.contains(prompt)) {
                val targetAnswer = missingNum.toString()
                val options = mutableSetOf(targetAnswer)
                val deltas = listOf(-2, 2, -1, 1, -3, 3, 4, -4).shuffled(rng)
                for (d in deltas) {
                    val c = missingNum + d
                    if (c in 1..maxNum) options.add(c.toString())
                    if (options.size == 4) break
                }
                while (options.size < 4) {
                    options.add(rng.nextInt(1, maxNum + 1).toString())
                }

                return GameQuestion(
                    id = "sch_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = options.toList().shuffled(rng)
                )
            }
        }

        val numbers = (1..maxNum).toMutableList()
        val missingNum = numbers.random(rng)
        val shuffledGrid = numbers.map { if (it == missingNum) "[ ? ]" else String.format("%2d", it) }.shuffled(rng)
        val sb = StringBuilder("Schulte Grid (${size}x$size) — Find [ ? ]:\n\n")
        for (r in 0 until size) {
            val row = shuffledGrid.subList(r * size, (r + 1) * size)
            sb.append(row.joinToString("   ")).append("\n")
        }
        val targetAnswer = missingNum.toString()
        val options = mutableSetOf(targetAnswer)
        val deltas = listOf(-2, 2, -1, 1).shuffled(rng)
        for (d in deltas) {
            val c = missingNum + d
            if (c in 1..maxNum) options.add(c.toString())
            if (options.size == 4) break
        }
        return GameQuestion(
            id = "sch_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = sb.toString().trimEnd(),
            targetAnswer = targetAnswer,
            options = options.toList().shuffled(rng)
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 110 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion(
                "p1",
                "Schulte Grid (3x3) — Find [ ? ]:\n\n 4    8    2\n[ ? ]  7    1\n 9    3    5",
                "6",
                listOf("5", "6", "7", "8")
            )
        )
    }
}
