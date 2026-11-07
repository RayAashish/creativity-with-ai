package com.mindforge.app.feature.game.language

import com.mindforge.app.feature.game.framework.EvaluationResult
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameLevelConfig
import com.mindforge.app.feature.game.framework.GameQuestion
import com.mindforge.app.feature.home.GameCategory
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.random.Random

@Singleton
class WordScrambleEngine @Inject constructor() : GameEngine {

    override val id: String = "word_scramble"
    override val title: String = "Word Scramble"
    override val category: GameCategory = GameCategory.LANGUAGE
    override val isAdvanced: Boolean = false
    override val description: String = "Unscramble jumbled letter anagrams into correct English vocabulary words."
    override val instructions: List<String> = listOf(
        "Observe the scrambled letters.",
        "Deduce the original English word.",
        "Select the correct unscrambled word from the 4 options."
    )
    override val tips: List<String> = listOf(
        "Look for common prefixes (RE, UN, DIS) and suffixes (ING, TION, ED).",
        "Separate vowels and consonants in your mind.",
        "Try pronouncing the syllables aloud."
    )

    private val wordBank = listOf(
        // 4 letters
        "FORGE", "BRAIN", "LOGIC", "FOCUS", "SHARP", "SPEED", "SOLVE", "LEARN",
        "STORM", "POWER", "QUICK", "REACT", "TRAIN", "NEVER", "SPARK", "PULSE",
        // 5-6 letters
        "MENTAL", "MEMORY", "PUZZLE", "GENIUS", "REFLEX", "ENERGY", "TARGET",
        "NATURE", "MASTER", "SILENT", "BRIGHT", "CLEVER", "WISDOM", "MATRIX",
        // 7-8 letters
        "SYNAPSE", "NETWORK", "INSIGHT", "NEURONS", "DYNAMIC", "BALANCE", "TACTICS"
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (8 + (clampedLevel / 6)).coerceAtMost(14),
            timeLimitSeconds = (30 + (clampedLevel / 2)).coerceAtMost(60),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 55 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val eligibleWords = when {
            clampedLevel <= 15 -> wordBank.filter { it.length <= 5 }
            clampedLevel <= 30 -> wordBank.filter { it.length in 5..6 }
            else -> wordBank.filter { it.length >= 6 }
        }.ifEmpty { wordBank }

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val targetWord = eligibleWords.random(rng)
            var scrambled: String
            var scrambleAttempts = 0
            do {
                scrambleAttempts++
                scrambled = targetWord.toList().shuffled(rng).joinToString(" ")
            } while (scrambled.replace(" ", "") == targetWord && targetWord.length > 3 && scrambleAttempts < 10)

            val prompt = "UNSCRAMBLE THE WORD:\n\n$scrambled"
            if (!history.contains(prompt)) {
                val distractors = mutableSetOf(targetWord)
                while (distractors.size < 4) {
                    val other = wordBank.filter { it.length == targetWord.length && it != targetWord }.randomOrNull(rng)
                        ?: wordBank.random(rng)
                    distractors.add(other)
                }

                return GameQuestion(
                    id = "ws_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetWord,
                    options = distractors.toList().shuffled(rng)
                )
            }
        }

        val targetWord = eligibleWords.first()
        val scrambled = targetWord.toList().shuffled(rng).joinToString(" ")
        val prompt = "UNSCRAMBLE THE WORD:\n\n$scrambled"
        return GameQuestion(
            id = "ws_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = targetWord,
            options = listOf(targetWord, "BRAIN", "LOGIC", "FOCUS").shuffled(rng)
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim().equals(question.targetAnswer.trim(), ignoreCase = true)
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 110 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "UNSCRAMBLE THE WORD:\n\nF O C S U", "FOCUS", listOf("FOCUS", "FORGE", "FORCE", "FLASH")),
            GameQuestion("p2", "UNSCRAMBLE THE WORD:\n\nB R N A I", "BRAIN", listOf("BRAIN", "BARON", "BROWN", "BLEND"))
        )
    }
}
