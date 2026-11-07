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
class Target24Engine @Inject constructor() : GameEngine {

    override val id: String = "target_24"
    override val title: String = "Target 24"
    override val category: GameCategory = GameCategory.MATH
    override val isAdvanced: Boolean = true
    override val description: String = "Combine given numbers with basic operations to reach the target value of 24 (or dynamic targets)."
    override val instructions: List<String> = listOf(
        "Look at the target number and the available numbers.",
        "Select the valid expression that equals the exact target value.",
        "Higher levels feature larger targets and combined operations."
    )
    override val tips: List<String> = listOf(
        "Think backwards from 24: 3 × 8, 4 × 6, 2 × 12, 20 + 4, 25 - 1.",
        "Can you make an 8 and a 3? Or a 6 and a 4?",
        "Look for ways to form 1 using division or subtraction (e.g. 5 - 4 = 1) to adjust other numbers."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (6 + clampedLevel / 8).coerceIn(6, 12),
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
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 130 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "Target: 24\nNumbers: 3, 4, 2, 1", "(4 + 2) × (3 + 1)", listOf("(4 + 2) × (3 + 1)", "(4 × 3) + (2 + 1)", "(4 + 3) × 2 - 1", "4 × 2 × 3 × 1")),
            GameQuestion("p2", "Target: 24\nNumbers: 6, 8, 2, 2", "(8 - 2) × (6 - 2)", listOf("(8 - 2) × (6 - 2)", "8 + 6 + 2 + 2", "(8 × 2) + 6 + 2", "8 × 6 ÷ 2 ÷ 2"))
        )
    }

    private fun buildQuestion(level: Int, rng: Random): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val target = if (clampedLevel <= 10) 24 else listOf(20, 24, 30, 36, 48, 50, 60, 72).random(rng)

        val templates = listOf(
            // (a + b) × c
            Triple(Pair(rng.nextInt(2, 6), rng.nextInt(2, 6)), rng.nextInt(2, 6), "mult"),
            // a × b - c
            Triple(Pair(rng.nextInt(4, 9), rng.nextInt(3, 8)), rng.nextInt(2, 10), "sub"),
            // a × b + c
            Triple(Pair(rng.nextInt(3, 8), rng.nextInt(3, 7)), rng.nextInt(2, 10), "add")
        )

        // Generate a working equation equaling target
        val a: Int
        val b: Int
        val c: Int
        val correctExpr: String
        val numbersUsed: List<Int>

        if (target == 24) {
            val validSets = listOf(
                Pair("3 × (10 - 2)", listOf(3, 10, 2)),
                Pair("(4 + 2) × 4", listOf(4, 2, 4)),
                Pair("6 × (2 + 2)", listOf(6, 2, 2)),
                Pair("8 × (5 - 2)", listOf(8, 5, 2)),
                Pair("(9 - 3) × 4", listOf(9, 3, 4)),
                Pair("(7 - 1) × 4", listOf(7, 1, 4)),
                Pair("(5 × 5) - 1", listOf(5, 5, 1)),
                Pair("(6 × 3) + 6", listOf(6, 3, 6)),
                Pair("(8 × 4) - 8", listOf(8, 4, 8))
            )
            val chosen = validSets.random(rng)
            correctExpr = chosen.first
            numbersUsed = chosen.second
        } else {
            val factor = rng.nextInt(2, 6)
            val remainder = target / factor
            val part1 = rng.nextInt(1, remainder)
            val part2 = remainder - part1
            correctExpr = "$factor × ($part1 + $part2)"
            numbersUsed = listOf(factor, part1, part2)
        }

        val distractors = mutableListOf(correctExpr)
        while (distractors.size < 4) {
            val fakeOp = listOf("+", "-", "×").random(rng)
            val shuffled = numbersUsed.shuffled(rng)
            val fake = "${shuffled[0]} $fakeOp (${shuffled[1]} + ${shuffled[2]})"
            if (!distractors.contains(fake)) {
                distractors.add(fake)
            }
        }

        val prompt = "Target: $target\nNumbers: ${numbersUsed.shuffled(rng).joinToString(", ")}"
        return GameQuestion(
            id = "t24_${level}_${rng.nextInt(100000)}",
            prompt = prompt,
            targetAnswer = correctExpr,
            options = distractors.shuffled(rng)
        )
    }
}
