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
class MiniSudokuEngine @Inject constructor() : GameEngine {

    override val id: String = "mini_sudoku"
    override val title: String = "Mini Sudoku"
    override val category: GameCategory = GameCategory.LOGIC
    override val isAdvanced: Boolean = false
    override val description: String = "Apply deductive constraint satisfaction to solve 4x4 Sudoku logic puzzles with 2x2 box rules."
    override val instructions: List<String> = listOf(
        "Each Row, Column, and 2x2 Quadrant must contain the digits 1, 2, 3, 4 exactly once.",
        "Deduce which digit belongs in the marked cell [ ? ].",
        "Select the correct digit from 1, 2, 3, 4."
    )
    override val tips: List<String> = listOf(
        "Check the row of [ ? ]: What numbers are already in this row?",
        "Check the column of [ ? ]: What numbers are already in this column?",
        "Check the 2x2 block: By elimination, only one digit can fit."
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
        val tier = (((clampedLevel - 1) * 9) / 49) + 1

        val hiddenCount = when (tier) {
            in 1..3 -> 4
            in 4..6 -> 6
            else -> 8
        }

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val perm = listOf(1, 2, 3, 4).shuffled(rng)
            val mapping = mapOf(1 to perm[0], 2 to perm[1], 3 to perm[2], 4 to perm[3])

            val baseBoard = arrayOf(
                intArrayOf(1, 2, 3, 4),
                intArrayOf(3, 4, 1, 2),
                intArrayOf(2, 1, 4, 3),
                intArrayOf(4, 3, 2, 1)
            )

            val solved = Array(4) { r ->
                IntArray(4) { c ->
                    mapping[baseBoard[r][c]]!!
                }
            }

            val targetR = rng.nextInt(0, 4)
            val targetC = rng.nextInt(0, 4)
            val targetAnswer = solved[targetR][targetC].toString()

            val hiddenCoords = mutableSetOf(Pair(targetR, targetC))
            while (hiddenCoords.size < hiddenCount) {
                hiddenCoords.add(Pair(rng.nextInt(4), rng.nextInt(4)))
            }

            val sb = StringBuilder("4x4 Mini Sudoku — Find [ ? ]:\n\n")
            for (r in 0..3) {
                sb.append("  ")
                for (c in 0..3) {
                    if (r == targetR && c == targetC) {
                        sb.append(" [ ? ] ")
                    } else if (hiddenCoords.contains(Pair(r, c))) {
                        sb.append(" [ · ] ")
                    } else {
                        sb.append(" [ ${solved[r][c]} ] ")
                    }
                    if (c == 1) sb.append(" | ")
                }
                sb.append("\n")
                if (r == 1) sb.append("  -------+-------\n")
            }
            val prompt = sb.toString().trimEnd()

            if (!history.contains(prompt)) {
                return GameQuestion(
                    id = "ms_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = listOf("1", "2", "3", "4")
                )
            }
        }

        val perm = listOf(1, 2, 3, 4).shuffled(rng)
        val mapping = mapOf(1 to perm[0], 2 to perm[1], 3 to perm[2], 4 to perm[3])
        val solved = Array(4) { r -> IntArray(4) { c -> mapping[r + c % 4 + 1] ?: 1 } }
        val prompt = "4x4 Mini Sudoku — Find [ ? ]:\n\n   [ ? ]   [ 2 ]  |  [ 3 ]   [ 4 ]\n"
        return GameQuestion(
            id = "ms_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = "1",
            options = listOf("1", "2", "3", "4")
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
                "4x4 Mini Sudoku — Find [ ? ]:\n\n   [ 1 ]  [ 2 ]  |  [ 3 ]  [ 4 ] \n   [ 3 ]  [ 4 ]  |  [ 1 ]  [ 2 ] \n  -------+-------\n   [ 2 ]  [ 1 ]  |  [ 4 ]  [ 3 ] \n   [ 4 ]  [ ? ]  |  [ 2 ]  [ 1 ] ",
                "3",
                listOf("1", "2", "3", "4")
            )
        )
    }
}
