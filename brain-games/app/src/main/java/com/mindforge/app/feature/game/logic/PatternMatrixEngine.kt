package com.mindforge.app.feature.game.logic

import com.mindforge.app.feature.game.framework.EvaluationResult
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameLevelConfig
import com.mindforge.app.feature.game.framework.GameQuestion
import com.mindforge.app.feature.home.GameCategory
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.random.Random

@Singleton
class PatternMatrixEngine @Inject constructor() : GameEngine {

    override val id: String = "pattern_matrix"
    override val title: String = "Pattern Matrix"
    override val category: GameCategory = GameCategory.LOGIC
    override val isAdvanced: Boolean = true
    override val description: String = "Complete 3x3 symbolic deduction matrices by identifying horizontal and vertical transformation rules."
    override val instructions: List<String> = listOf(
        "Observe the 3x3 matrix of symbols.",
        "Deduce how symbols evolve across rows (left to right) and down columns.",
        "Select the missing 9th cell [ ? ] that completes the matrix."
    )
    override val tips: List<String> = listOf(
        "Check row-wise first: Do symbols rotate 90 degrees? Do dots increase by 1?",
        "Check column-wise: Does the vertical rule confirm your horizontal deduction?",
        "Look for constant properties (e.g. every row must contain one circle, one square, one triangle)."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (6 + (clampedLevel / 6)).coerceAtMost(14),
            timeLimitSeconds = (35 + (clampedLevel / 2)).coerceAtMost(70),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 60 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val shapeSets = listOf(
            listOf("▲", "■", "●"),
            listOf("✦", "✖", "◈"),
            listOf("1", "2", "3"),
            listOf("•", "••", "•••"),
            listOf("◀", "▲", "▶"),
            listOf("★", "✦", "✪"),
            listOf("⬟", "⬡", "⬢")
        )

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val chosenSet = shapeSets.random(rng).shuffled(rng)
            val s1 = chosenSet[0]
            val s2 = chosenSet[1]
            val s3 = chosenSet[2]

            val rows = listOf(
                listOf(s1, s2, s3),
                listOf(s2, s3, s1),
                listOf(s3, s1, "[ ? ]")
            )
            val targetAnswer = s2

            val sb = StringBuilder("Pattern Matrix (3x3):\n\n")
            rows.forEach { r ->
                sb.append("  ").append(r.joinToString("      ")).append("\n\n")
            }
            val prompt = sb.toString().trimEnd()

            if (!history.contains(prompt)) {
                val options = listOf(s1, s2, s3, "◆").shuffled(rng)
                return GameQuestion(
                    id = "pm_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = options
                )
            }
        }

        val chosenSet = shapeSets.first()
        val prompt = "Pattern Matrix (3x3):\n\n  ▲      ■      ●\n\n  ■      ●      ▲\n\n  ●      ▲      [ ? ]"
        return GameQuestion(
            id = "pm_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = "■",
            options = listOf("▲", "■", "●", "◆")
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 140 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion(
                "p1",
                "Pattern Matrix (3x3):\n\n  ▲      ■      ●\n\n  ■      ●      ▲\n\n  ●      ▲      [ ? ]",
                "■",
                listOf("▲", "■", "●", "◆")
            )
        )
    }
}
