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
class ReactionTapEngine @Inject constructor() : GameEngine {

    override val id: String = "reaction_tap"
    override val title: String = "Reaction Tap"
    override val category: GameCategory = GameCategory.FOCUS
    override val isAdvanced: Boolean = false
    override val description: String = "Measure visual processing and rapid motor response under millisecond trigger conditions."
    override val instructions: List<String> = listOf(
        "Observe the trigger signal prompt.",
        "When 'STRIKE NOW!' appears, tap STRIKE immediately.",
        "If 'STAND BY' appears, select WAIT."
    )
    override val tips: List<String> = listOf(
        "Keep your thumb hovering 1cm above the strike button.",
        "Anticipate the cue without triggering early false starts.",
        "Breathe steadily to keep motor pathways relaxed."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (8 + (clampedLevel / 6)).coerceAtMost(16),
            timeLimitSeconds = (20 + (clampedLevel / 2)).coerceAtMost(48),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 50 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val shouldStrike = rng.nextFloat() > 0.35f
        val cueVariance = rng.nextInt(100, 999)
        val prompt = if (shouldStrike) {
            "⚡ FORGE TRIGGER #$cueVariance ⚡\n\n>>> STRIKE NOW! <<<"
        } else {
            "⏸ FORGE CHAMBER #$cueVariance ⏸\n\n--- STAND BY ---"
        }
        val targetAnswer = if (shouldStrike) "STRIKE" else "WAIT"

        return GameQuestion(
            id = "rt_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = targetAnswer,
            options = listOf("STRIKE", "WAIT")
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim().equals(question.targetAnswer.trim(), ignoreCase = true)
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 100 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "⚡ FORGE TRIGGER ⚡\n\n>>> STRIKE NOW! <<<", "STRIKE", listOf("STRIKE", "WAIT")),
            GameQuestion("p2", "⏸ FORGE CHAMBER ⏸\n\n--- STAND BY ---", "WAIT", listOf("STRIKE", "WAIT"))
        )
    }
}
