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
class OfflineDuelEngine @Inject constructor() : GameEngine {

    override val id: String = "offline_duel"
    override val title: String = "Offline Duel"
    override val category: GameCategory = GameCategory.MATH
    override val isAdvanced: Boolean = true
    override val description: String = "Compete 1-on-1 in real time against a simulated local bot whose speed and accuracy match your chosen level."
    override val instructions: List<String> = listOf(
        "Race against the local AI opponent to solve arithmetic problems first.",
        "Your bot opponent's speed and precision scale dynamically with the level.",
        "Select the correct answer from the 4 options as fast as possible to outscore the bot."
    )
    override val tips: List<String> = listOf(
        "At higher levels the bot answers under 1.5 seconds — trust your intuition and tap immediately.",
        "A wrong answer costs valuable time and gives the bot the lead.",
        "Look for round numbers and mental decomposition."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = 10,
            timeLimitSeconds = (30 + clampedLevel / 2).coerceIn(30, 55),
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
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 150 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "VS Bot: 14 + 18", "32", listOf("30", "32", "34", "36")),
            GameQuestion("p2", "VS Bot: 7 × 8", "56", listOf("48", "54", "56", "62")),
            GameQuestion("p3", "VS Bot: 65 - 27", "38", listOf("36", "38", "42", "44"))
        )
    }

    private fun buildQuestion(level: Int, rng: Random): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val op = when {
            clampedLevel <= 10 -> if (rng.nextBoolean()) '+' else '-'
            clampedLevel <= 25 -> listOf('+', '-', '×').random(rng)
            else -> listOf('+', '-', '×', '÷').random(rng)
        }

        val botName = when {
            clampedLevel <= 10 -> "Novice Bot"
            clampedLevel <= 25 -> "Tactician AI"
            clampedLevel <= 40 -> "Forge Master"
            else -> "Grandmaster Bot"
        }

        val (expr, ans) = when (op) {
            '+' -> {
                val a = rng.nextInt(12, if (clampedLevel <= 20) 50 else 180)
                val b = rng.nextInt(8, if (clampedLevel <= 20) 40 else 120)
                Pair("$a + $b", a + b)
            }
            '-' -> {
                val b = rng.nextInt(8, if (clampedLevel <= 20) 40 else 120)
                val diff = rng.nextInt(10, if (clampedLevel <= 20) 50 else 150)
                val a = b + diff
                Pair("$a - $b", diff)
            }
            '×' -> {
                val a = rng.nextInt(4, if (clampedLevel <= 20) 12 else 25)
                val b = rng.nextInt(3, if (clampedLevel <= 20) 11 else 20)
                Pair("$a × $b", a * b)
            }
            else -> {
                val div = rng.nextInt(3, if (clampedLevel <= 25) 10 else 16)
                val q = rng.nextInt(4, if (clampedLevel <= 25) 18 else 30)
                val dividend = div * q
                Pair("$dividend ÷ $div", q)
            }
        }

        val prompt = "VS $botName\n$expr"
        val options = mutableSetOf(ans)
        val deltas = listOf(-2, 2, -1, 1, -4, 4, -10, 10).shuffled(rng)
        for (d in deltas) {
            val cand = ans + d
            if (cand > 0) options.add(cand)
            if (options.size == 4) break
        }
        while (options.size < 4) {
            options.add(ans + rng.nextInt(3, 15))
        }

        return GameQuestion(
            id = "duel_${level}_${rng.nextInt(100000)}",
            prompt = prompt,
            targetAnswer = ans.toString(),
            options = options.toList().shuffled(rng).map { it.toString() }
        )
    }
}
