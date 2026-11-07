package com.mindforge.app.feature.game.memory

import com.mindforge.app.feature.game.framework.EvaluationResult
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameLevelConfig
import com.mindforge.app.feature.game.framework.GameQuestion
import com.mindforge.app.feature.home.GameCategory
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.random.Random

@Singleton
class DigitSpanEngine @Inject constructor() : GameEngine {

    override val id: String = "digit_span"
    override val title: String = "Digit Span"
    override val category: GameCategory = GameCategory.MEMORY
    override val isAdvanced: Boolean = false
    override val description: String = "Expand working memory span by recalling numeric sequences forward (levels 1-5) and in reverse order (levels 6-10)."
    override val instructions: List<String> = listOf(
        "Carefully observe the flashed digits.",
        "For Levels 1-5: Recall digits in FORWARD order.",
        "For Levels 6-10: Recall digits in REVERSE order.",
        "Select the correct recalled sequence."
    )
    override val tips: List<String> = listOf(
        "Group digits into rhythm chunks (e.g., 3-8-2, then 9-1-5).",
        "For reverse recall, visualize the digits on a mental whiteboard and read right-to-left.",
        "Repeat the sequence aloud or silently as a phonological loop."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (6 + (clampedLevel / 6)).coerceAtMost(14),
            timeLimitSeconds = (30 + (clampedLevel / 2)).coerceAtMost(70),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 60 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val isReverse = clampedLevel > 25
        val spanLength = when {
            clampedLevel in 1..5 -> 4
            clampedLevel in 6..12 -> 5
            clampedLevel in 13..20 -> 6
            clampedLevel in 21..25 -> 7
            clampedLevel in 26..32 -> 4 // Reverse mode starts here
            clampedLevel in 33..40 -> 5
            clampedLevel in 41..46 -> 6
            else -> 7
        }

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val digits = (0 until spanLength).map { rng.nextInt(1, 10) }
            val promptDigits = digits.joinToString("   ")
            val prompt = if (isReverse) "RECALL IN REVERSE:\n$promptDigits" else "RECALL FORWARD:\n$promptDigits"

            if (!history.contains(prompt)) {
                val targetSequence = if (isReverse) digits.reversed() else digits
                val targetAnswer = targetSequence.joinToString("")

                val options = mutableSetOf(targetAnswer)
                while (options.size < 4) {
                    val mutated = targetSequence.toMutableList()
                    val idx = rng.nextInt(mutated.size)
                    mutated[idx] = (mutated[idx] % 9) + 1
                    options.add(mutated.joinToString(""))
                }

                return GameQuestion(
                    id = "ds_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = options.toList().shuffled(rng)
                )
            }
        }

        val digits = (0 until spanLength).map { rng.nextInt(1, 10) }
        val promptDigits = digits.joinToString("   ")
        val prompt = if (isReverse) "RECALL IN REVERSE:\n$promptDigits" else "RECALL FORWARD:\n$promptDigits"
        val targetSequence = if (isReverse) digits.reversed() else digits
        val targetAnswer = targetSequence.joinToString("")
        val options = mutableSetOf(targetAnswer)
        while (options.size < 4) {
            val mutated = targetSequence.toMutableList()
            val idx = rng.nextInt(mutated.size)
            mutated[idx] = (mutated[idx] % 9) + 1
            options.add(mutated.joinToString(""))
        }
        return GameQuestion(
            id = "ds_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = targetAnswer,
            options = options.toList().shuffled(rng)
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 120 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "RECALL FORWARD:\n3   8   2   5", "3825", listOf("3825", "3852", "8325", "5283")),
            GameQuestion("p2", "RECALL IN REVERSE:\n4   9   1   7", "7194", listOf("7194", "4917", "7914", "1794"))
        )
    }
}
