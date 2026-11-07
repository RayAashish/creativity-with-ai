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
class WordChainEngine @Inject constructor() : GameEngine {

    override val id: String = "word_chain"
    override val title: String = "Word Chain"
    override val category: GameCategory = GameCategory.LANGUAGE
    override val isAdvanced: Boolean = true
    override val description: String = "Construct lexical links where the tail letter of each word sparks the head letter of the next."
    override val instructions: List<String> = listOf(
        "Observe the word chain progression.",
        "Each word must start with the final letter of the preceding word.",
        "Select which word legitimately completes the chain."
    )
    override val tips: List<String> = listOf(
        "Focus on the very last letter of the active word.",
        "Scan options for words starting with that exact letter.",
        "If multiple words share the starting letter, check the chain's forward link."
    )

    private val wordMap = mapOf(
        'A' to listOf("APEX", "ALERT", "ACTION", "ATLAS"),
        'B' to listOf("BRAIN", "BOOST", "BEACON", "BRISK"),
        'C' to listOf("CRISP", "CRAFT", "CLEVER", "CUBE"),
        'D' to listOf("DRIVE", "DELTA", "DYNAMIC", "DAWN"),
        'E' to listOf("EAGLE", "ENERGY", "EXPERT", "ECHO"),
        'F' to listOf("FORGE", "FOCUS", "FLASH", "FROST"),
        'G' to listOf("GENIUS", "GLYPH", "GRIT", "GROWTH"),
        'H' to listOf("HERO", "HORIZON", "HONOR", "HYPER"),
        'K' to listOf("KINETIC", "KEEN", "KUDOS", "KNIGHT"),
        'L' to listOf("LOGIC", "LEAP", "LIGHT", "LUCID"),
        'M' to listOf("MATRIX", "MIND", "MASTER", "MEMORY"),
        'N' to listOf("NEXUS", "NEURON", "NOBLE", "NIMBLE"),
        'P' to listOf("PULSE", "POWER", "PRISM", "PEAK"),
        'R' to listOf("REFLEX", "RADIANT", "RAPID", "ROBUST"),
        'S' to listOf("SYNAPSE", "SPARK", "STRIKE", "SHARP"),
        'T' to listOf("TACTIC", "TARGET", "TRAIN", "TITAN")
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (8 + (clampedLevel / 6)).coerceAtMost(14),
            timeLimitSeconds = (30 + (clampedLevel / 2)).coerceAtMost(60),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 60 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val keys = wordMap.keys.toList()

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val firstChar = keys.random(rng)
            val word1 = wordMap[firstChar]!!.random(rng)
            val linkChar = word1.last().uppercaseChar()
            val validNextWords = wordMap[linkChar] ?: wordMap.values.flatten().filter { it.startsWith(linkChar) }

            val targetAnswer = if (validNextWords.isNotEmpty()) validNextWords.random(rng) else "SPARK"
            val prompt = "Word Chain Link:\n\n$word1  →  [ ? ]\n\n(Word must start with '${linkChar}')"

            if (!history.contains(prompt)) {
                val invalidWords = wordMap.filter { it.key != linkChar }.values.flatten().shuffled(rng).take(3)
                val options = (invalidWords + targetAnswer).shuffled(rng)

                return GameQuestion(
                    id = "wc_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = options
                )
            }
        }

        val prompt = "Word Chain Link:\n\nFORGE  →  [ ? ]\n\n(Word must start with 'E')"
        return GameQuestion(
            id = "wc_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = "ENERGY",
            options = listOf("ENERGY", "SPARK", "MIND", "LOGIC")
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim().equals(question.targetAnswer.trim(), ignoreCase = true)
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 120 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "Word Chain Link:\n\nFORGE  →  [ ? ]\n\n(Word must start with 'E')", "ENERGY", listOf("ENERGY", "MIND", "BRAIN", "PULSE")),
            GameQuestion("p2", "Word Chain Link:\n\nLOGIC  →  [ ? ]\n\n(Word must start with 'C')", "CRAFT", listOf("CRAFT", "TRAIN", "FOCUS", "SHARP"))
        )
    }
}
