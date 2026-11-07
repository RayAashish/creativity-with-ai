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
class StroopTestEngine @Inject constructor() : GameEngine {

    override val id: String = "stroop_test"
    override val title: String = "Stroop Test"
    override val category: GameCategory = GameCategory.FOCUS
    override val isAdvanced: Boolean = false
    override val description: String = "Overcome intense cognitive interference between semantic word meaning and font ink color."
    override val instructions: List<String> = listOf(
        "Read the instruction header carefully for each item:",
        "Either: 'NAME THE INK COLOR' or 'NAME THE WORD TEXT'.",
        "Select the correct answer from the 4 color options before time expires."
    )
    override val tips: List<String> = listOf(
        "Your brain naturally reads words faster than colors — actively suppress reading when asked for ink color.",
        "Focus on the outline or shape of the letters rather than reading whole syllables.",
        "Maintain a steady rhythm; do not second-guess fast intuitive choices."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (10 + (clampedLevel / 5)).coerceAtMost(18),
            timeLimitSeconds = (25 + (clampedLevel / 2)).coerceAtMost(55),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 50 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val colors = listOf("RED", "BLUE", "GREEN", "AMBER", "PURPLE", "ORANGE")
        val activeColors = if (clampedLevel <= 20) colors.take(4) else colors

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val word = activeColors.random(rng)
            var ink = activeColors.random(rng)
            if (clampedLevel >= 5 && ink == word && rng.nextFloat() > 0.15f) {
                while (ink == word) {
                    ink = activeColors.random(rng)
                }
            }

            val askForInk = if (clampedLevel <= 5) true else rng.nextBoolean()
            val targetAnswer = if (askForInk) ink else word

            val promptHeader = if (askForInk) "SELECT THE INK COLOR:" else "SELECT THE WORD TEXT:"
            val prompt = "$promptHeader\n\nWord: \"$word\"\nInk: [$ink]"

            if (!history.contains(prompt)) {
                return GameQuestion(
                    id = "str_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = activeColors.shuffled(rng).take(4).let { if (it.contains(targetAnswer)) it else (it.take(3) + targetAnswer).shuffled(rng) }
                )
            }
        }

        val word = activeColors.random(rng)
        val ink = activeColors.random(rng)
        val targetAnswer = ink
        val prompt = "SELECT THE INK COLOR:\n\nWord: \"$word\"\nInk: [$ink]"
        return GameQuestion(
            id = "str_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = targetAnswer,
            options = activeColors.take(4)
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim().equals(question.targetAnswer.trim(), ignoreCase = true)
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 100 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "SELECT THE INK COLOR:\n\nWord: \"RED\"\nInk: [BLUE]", "BLUE", listOf("RED", "BLUE", "GREEN", "AMBER")),
            GameQuestion("p2", "SELECT THE WORD TEXT:\n\nWord: \"GREEN\"\nInk: [RED]", "GREEN", listOf("RED", "BLUE", "GREEN", "AMBER"))
        )
    }
}
