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
class LightsOutEngine @Inject constructor() : GameEngine {

    override val id: String = "lights_out"
    override val title: String = "Lights Out"
    override val category: GameCategory = GameCategory.LOGIC
    override val isAdvanced: Boolean = false
    override val description: String = "Find the critical matrix cell whose toggle extinguishes the remaining lights and achieves complete blackout."
    override val instructions: List<String> = listOf(
        "A toggle switches the target cell and its 4 adjacent neighbors (Up, Down, Left, Right).",
        "Observe the current pattern of [ ON ] and [ · ] cells.",
        "Select which single coordinate toggle will switch ALL lights to [ · ] (OFF)."
    )
    override val tips: List<String> = listOf(
        "Tapping a corner toggles 3 cells (corner + 2 adjacent edges).",
        "Tapping an edge toggles 4 cells.",
        "Tapping the center (R2C2) toggles 5 cells in a cross shape."
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
        val allCoords = listOf("R1C1", "R1C2", "R1C3", "R2C1", "R2C2", "R2C3", "R3C1", "R3C2", "R3C3")

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val targetR = rng.nextInt(1, 4)
            val targetC = rng.nextInt(1, 4)
            val targetAnswer = "R${targetR}C${targetC}"

            val grid = Array(3) { BooleanArray(3) { false } }
            val deltas = listOf(Pair(0, 0), Pair(-1, 0), Pair(1, 0), Pair(0, -1), Pair(0, 1))
            for ((dr, dc) in deltas) {
                val nr = (targetR - 1) + dr
                val nc = (targetC - 1) + dc
                if (nr in 0..2 && nc in 0..2) {
                    grid[nr][nc] = true
                }
            }

            val sb = StringBuilder("Lights Out Matrix (3x3) — Achieve Blackout:\n\n")
            for (r in 0..2) {
                sb.append("  ")
                for (c in 0..2) {
                    sb.append(if (grid[r][c]) "[ ON ] " else "[ · ]  ")
                }
                sb.append("\n\n")
            }
            val prompt = sb.toString().trimEnd()

            if (!history.contains(prompt)) {
                val options = mutableSetOf(targetAnswer)
                val shuffled = allCoords.shuffled(rng)
                for (coord in shuffled) {
                    options.add(coord)
                    if (options.size == 4) break
                }

                return GameQuestion(
                    id = "lo_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = options.toList().shuffled(rng)
                )
            }
        }

        val prompt = "Lights Out Matrix (3x3) — Achieve Blackout:\n\n  [ · ]  [ ON ] [ · ]  \n\n  [ ON ] [ ON ] [ ON ] \n\n  [ · ]  [ ON ] [ · ]"
        return GameQuestion(
            id = "lo_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = "R2C2",
            options = listOf("R2C2", "R1C2", "R2C1", "R3C2")
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 120 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion(
                "p1",
                "Lights Out Matrix (3x3) — Achieve Blackout:\n\n  [ · ]  [ ON ] [ · ]  \n\n  [ ON ] [ ON ] [ ON ] \n\n  [ · ]  [ ON ] [ · ]  ",
                "R2C2",
                listOf("R2C2", "R1C2", "R2C1", "R3C2")
            )
        )
    }
}
