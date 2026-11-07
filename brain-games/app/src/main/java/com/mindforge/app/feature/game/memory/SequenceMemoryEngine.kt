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
class SequenceMemoryEngine @Inject constructor() : GameEngine {

    override val id: String = "sequence_memory"
    override val title: String = "Sequence Memory"
    override val category: GameCategory = GameCategory.MEMORY
    override val isAdvanced: Boolean = false
    override val description: String = "Memorize growing audio-visual tile sequences and reproduce the exact order from memory."
    override val instructions: List<String> = listOf(
        "Watch the numbered tile pattern flash in sequence.",
        "Remember the order: each tile lights up with a unique visual cue.",
        "Select the correct full sequence string from the options."
    )
    override val tips: List<String> = listOf(
        "Chunk the sequence into pairs or triplets (e.g. 2-4, then 1-3).",
        "Subvocalize the numbers as they flash.",
        "Notice geometric paths (e.g. clockwise, zigzag)."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        val totalQ = (6 + (clampedLevel / 6)).coerceAtMost(14)
        val timeSec = (35 + (clampedLevel / 2)).coerceAtMost(70)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = totalQ,
            timeLimitSeconds = timeSec,
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 60 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val tier = (((clampedLevel - 1) * 9) / 49) + 1
        val seqLength = when (tier) {
            1 -> 3
            2, 3 -> 4
            4, 5 -> 5
            6, 7 -> 6
            8, 9 -> 7
            else -> 8
        }

        val tiles = (1..4).toList()

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val seq = (1..seqLength).map { tiles.random(rng) }
            val prompt = "Sequence (${seqLength} Steps):\n" + seq.joinToString("  →  ")
            if (!history.contains(prompt)) {
                val targetAnswer = seq.joinToString("-")
                val distractors = mutableSetOf(targetAnswer)
                while (distractors.size < 4) {
                    val mutated = seq.toMutableList()
                    val mutateIdx = rng.nextInt(mutated.size)
                    mutated[mutateIdx] = ((mutated[mutateIdx] % 4) + 1)
                    distractors.add(mutated.joinToString("-"))
                }
                return GameQuestion(
                    id = "seq_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = distractors.toList().shuffled(rng)
                )
            }
        }

        val seq = (1..seqLength).map { tiles.random(rng) }
        val targetAnswer = seq.joinToString("-")
        val distractors = mutableSetOf(targetAnswer)
        while (distractors.size < 4) {
            val mutated = seq.toMutableList()
            val mutateIdx = rng.nextInt(mutated.size)
            mutated[mutateIdx] = ((mutated[mutateIdx] % 4) + 1)
            distractors.add(mutated.joinToString("-"))
        }

        val prompt = "Sequence (${seqLength} Steps):\n" + seq.joinToString("  →  ")
        return GameQuestion(
            id = "seq_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = prompt,
            targetAnswer = targetAnswer,
            options = distractors.toList().shuffled(rng)
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 120 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion("p1", "Sequence (3 Steps):\n1  →  3  →  2", "1-3-2", listOf("1-3-2", "1-2-3", "3-1-2", "2-3-1")),
            GameQuestion("p2", "Sequence (3 Steps):\n4  →  2  →  4", "4-2-4", listOf("4-2-4", "4-2-2", "2-4-2", "4-4-2"))
        )
    }
}
