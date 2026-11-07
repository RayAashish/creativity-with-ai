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
class SpatialGridEngine @Inject constructor() : GameEngine {

    override val id: String = "spatial_grid"
    override val title: String = "Spatial Grid"
    override val category: GameCategory = GameCategory.MEMORY
    override val isAdvanced: Boolean = true
    override val description: String = "Remember coordinates of illuminated cells across 3x3 to 5x5 matrix grids."
    override val instructions: List<String> = listOf(
        "Observe the highlighted coordinate cells on the matrix.",
        "Memorize their locations (e.g., Row 1 Col 2).",
        "Select the correct combination of lit cell coordinates."
    )
    override val tips: List<String> = listOf(
        "Visualize the pattern as a single geometric shape (triangle, line, cross).",
        "Associate cells with corners or center anchors.",
        "Count the number of lit cells per row as a quick verification code."
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
        val tier = (((clampedLevel - 1) * 9) / 49) + 1
        val gridSize = if (tier <= 4) 3 else 4
        val litCount = when (tier) {
            1, 2 -> 3
            3, 4 -> 4
            5, 6 -> 5
            7, 8 -> 6
            else -> 7
        }

        val allCoords = mutableListOf<String>()
        for (r in 1..gridSize) {
            for (c in 1..gridSize) {
                allCoords.add("R${r}C${c}")
            }
        }

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val chosenLit = allCoords.shuffled(rng).take(litCount).sorted()
            val targetAnswer = chosenLit.joinToString(", ")

            val sb = StringBuilder("Illuminated Cells (${gridSize}x$gridSize):\n\n")
            for (r in 1..gridSize) {
                for (c in 1..gridSize) {
                    val coord = "R${r}C${c}"
                    sb.append(if (chosenLit.contains(coord)) " [ ◆ ] " else " [ · ] ")
                }
                sb.append("\n")
            }
            val prompt = sb.toString().trimEnd()

            if (!history.contains(prompt)) {
                val options = mutableSetOf(targetAnswer)
                while (options.size < 4) {
                    val fake = allCoords.shuffled(rng).take(litCount).sorted().joinToString(", ")
                    options.add(fake)
                }

                return GameQuestion(
                    id = "sg_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = options.toList().shuffled(rng)
                )
            }
        }

        val chosenLit = allCoords.shuffled(rng).take(litCount).sorted()
        val targetAnswer = chosenLit.joinToString(", ")
        val sb = StringBuilder("Illuminated Cells (${gridSize}x$gridSize):\n\n")
        for (r in 1..gridSize) {
            for (c in 1..gridSize) {
                val coord = "R${r}C${c}"
                sb.append(if (chosenLit.contains(coord)) " [ ◆ ] " else " [ · ] ")
            }
            sb.append("\n")
        }
        val options = mutableSetOf(targetAnswer)
        while (options.size < 4) {
            val fake = allCoords.shuffled(rng).take(litCount).sorted().joinToString(", ")
            options.add(fake)
        }
        return GameQuestion(
            id = "sg_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = sb.toString().trimEnd(),
            targetAnswer = targetAnswer,
            options = options.toList().shuffled(rng)
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
                "Illuminated Cells (3x3):\n\n [ ◆ ]  [ · ]  [ · ] \n [ · ]  [ ◆ ]  [ · ] \n [ · ]  [ · ]  [ ◆ ] ",
                "R1C1, R2C2, R3C3",
                listOf("R1C1, R2C2, R3C3", "R1C2, R2C2, R3C2", "R1C3, R2C2, R3C1", "R1C1, R2C3, R3C2")
            )
        )
    }
}
