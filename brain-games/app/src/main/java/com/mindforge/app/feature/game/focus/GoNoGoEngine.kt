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
class GoNoGoEngine @Inject constructor() : GameEngine {

    override val id: String = "go_no_go"
    override val title: String = "Go / No-Go"
    override val category: GameCategory = GameCategory.FOCUS
    override val isAdvanced: Boolean = true
    override val description: String = "Train prefrontal behavioral inhibition: strike swiftly on target cues, suppress the impulse on distractors."
    override val instructions: List<String> = listOf(
        "RULE: Tap 'GO' on target stimulus.",
        "Tap 'PASS' on distractor/inhibitory cues.",
        "Levels increase distraction frequency and speed."
    )
    override val tips: List<String> = listOf(
        "Build a default posture of pausing for a split-second before committing.",
        "Inhibition is harder when consecutive 'GO' stimuli create a habitual motor rhythm.",
        "Stay vigilant after three consecutive GO signals — a distractor is likely coming."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (10 + (clampedLevel / 5)).coerceAtMost(18),
            timeLimitSeconds = (22 + (clampedLevel / 2)).coerceAtMost(50),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 60 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val tier = (((clampedLevel - 1) * 9) / 49) + 1
        val ruleType = when (tier) {
            in 1..3 -> 0 // Symbol: Spark vs Hazard
            in 4..6 -> 1 // Letter: Vowels (GO) vs Consonants (PASS)
            else -> 2 // Number parity: Even (GO) vs Odd (PASS)
        }

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val isGo = rng.nextFloat() < 0.70f
            val prompt: String
            val targetAnswer: String

            when (ruleType) {
                0 -> {
                    val count = rng.nextInt(2, 5)
                    val symbols = if (isGo) "✦ ".repeat(count).trim() else "✖ ".repeat(count).trim()
                    prompt = "TARGET RULE: Spark [ ✦ ] = GO, Hazard [ ✖ ] = PASS\n\n[ $symbols ]"
                    targetAnswer = if (isGo) "GO" else "PASS"
                }
                1 -> {
                    val vowels = listOf("A", "E", "I", "O", "U")
                    val consonants = listOf("B", "C", "D", "F", "G", "H", "K", "L", "M", "P", "R", "S", "T")
                    val char = if (isGo) vowels.random(rng) else consonants.random(rng)
                    prompt = "TARGET RULE: Vowel = GO, Consonant = PASS\n\nLetter: [ $char ]"
                    targetAnswer = if (isGo) "GO" else "PASS"
                }
                else -> {
                    val num = if (isGo) (rng.nextInt(2, 50 + clampedLevel) * 2) else (rng.nextInt(1, 49 + clampedLevel) * 2 + 1)
                    prompt = "TARGET RULE: Even = GO, Odd = PASS\n\nNumber: [ $num ]"
                    targetAnswer = if (isGo) "GO" else "PASS"
                }
            }

            if (!history.contains(prompt)) {
                return GameQuestion(
                    id = "gng_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = listOf("GO", "PASS")
                )
            }
        }

        val prompt = "TARGET RULE: Spark [ ✦ ] = GO, Hazard [ ✖ ] = PASS\n\n[ ✦ ✦ ✦ ]"
        return GameQuestion(
            id = "gng_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = "GO",
            options = listOf("GO", "PASS")
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim().equals(question.targetAnswer.trim(), ignoreCase = true)
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 120 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "TARGET RULE: Spark [ ✦ ] = GO, Hazard [ ✖ ] = PASS\n\n[ ✦ ✦ ✦ ]", "GO", listOf("GO", "PASS")),
            GameQuestion("p2", "TARGET RULE: Spark [ ✦ ] = GO, Hazard [ ✖ ] = PASS\n\n[ ✖ ✖ ✖ ]", "PASS", listOf("GO", "PASS"))
        )
    }
}
