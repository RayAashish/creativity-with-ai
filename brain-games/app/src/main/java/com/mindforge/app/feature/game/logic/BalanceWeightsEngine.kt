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
class BalanceWeightsEngine @Inject constructor() : GameEngine {

    override val id: String = "balance_weights"
    override val title: String = "Balance Weights"
    override val category: GameCategory = GameCategory.LOGIC
    override val isAdvanced: Boolean = true
    override val description: String = "Deduce relative mass, equilibrium ratios, and transitive weight hierarchies across multiple pan balance scales."
    override val instructions: List<String> = listOf(
        "Inspect the scale equilibria statements.",
        "Use substitution and transitive logic to answer the question.",
        "Select the correct answer from the 4 options."
    )
    override val tips: List<String> = listOf(
        "Substitute the smaller unit into the larger equation.",
        "If 1 Sphere = 2 Cubes, and 1 Cube = 3 Pyramids, then 1 Sphere = 2 × 3 = 6 Pyramids.",
        "Assign a mental test value (e.g. Pyramid = 1, Cube = 3, Sphere = 6)."
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

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val r1 = rng.nextInt(2, 4 + (clampedLevel / 15))
            val r2 = rng.nextInt(2, 3 + (clampedLevel / 15))
            val totalRatio = r1 * r2
            val qType = if (clampedLevel <= 10) 0 else rng.nextInt(2)

            val prompt: String
            val targetAnswer: String
            val options: List<String>

            if (qType == 0) {
                prompt = "Scale 1:  1 ▲ Diamond = $r1 ● Spheres\nScale 2:  1 ● Sphere = $r2 ■ Cubes\n\nWhich object is the HEAVIEST?"
                targetAnswer = "▲ Diamond"
                options = listOf("▲ Diamond", "● Sphere", "■ Cube", "All Equal")
            } else {
                prompt = "Scale 1:  1 ▲ Diamond = $r1 ● Spheres\nScale 2:  1 ● Sphere = $r2 ■ Cubes\n\nHow many ■ Cubes balance 1 ▲ Diamond?"
                targetAnswer = "$totalRatio Cubes"
                val dist = mutableSetOf(targetAnswer)
                val deltas = listOf(-2, 2, -1, 1, -3, 3).shuffled(rng)
                for (d in deltas) {
                    val c = totalRatio + d
                    if (c > 1) dist.add("$c Cubes")
                    if (dist.size == 4) break
                }
                while (dist.size < 4) {
                    dist.add("${totalRatio + rng.nextInt(4, 10)} Cubes")
                }
                options = dist.toList().shuffled(rng)
            }

            if (!history.contains(prompt)) {
                return GameQuestion(
                    id = "bw_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = options
                )
            }
        }

        val prompt = "Scale 1:  1 ▲ Diamond = 2 ● Spheres\nScale 2:  1 ● Sphere = 3 ■ Cubes\n\nWhich object is the HEAVIEST?"
        return GameQuestion(
            id = "bw_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = "▲ Diamond",
            options = listOf("▲ Diamond", "● Sphere", "■ Cube", "All Equal")
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 130 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion(
                "p1",
                "Scale 1:  1 ▲ Diamond = 2 ● Spheres\nScale 2:  1 ● Sphere = 3 ■ Cubes\n\nWhich object is the HEAVIEST?",
                "▲ Diamond",
                listOf("▲ Diamond", "● Sphere", "■ Cube", "All Equal")
            )
        )
    }
}
