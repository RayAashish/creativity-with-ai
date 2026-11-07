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
class CardMatchEngine @Inject constructor() : GameEngine {

    override val id: String = "card_match"
    override val title: String = "Card Match"
    override val category: GameCategory = GameCategory.MEMORY
    override val isAdvanced: Boolean = false
    override val description: String = "Test spatial recall and association by locating paired glyph symbols across grid matrices."
    override val instructions: List<String> = listOf(
        "Observe the assigned cards and symbols.",
        "Identify which two lettered card positions contain the matching pair.",
        "Select the correct coordinate pair (e.g. 'A & C')."
    )
    override val tips: List<String> = listOf(
        "Anchor positions in your mind by quadrant (top-left, bottom-right).",
        "Scan horizontally first, noting distinctive geometric glyphs.",
        "Eliminate unmatched singleton cards quickly."
    )

    override fun getLevelConfig(level: Int): GameLevelConfig {
        val clampedLevel = level.coerceIn(1, 50)
        return GameLevelConfig(
            level = clampedLevel,
            totalQuestions = (6 + (clampedLevel / 6)).coerceAtMost(14),
            timeLimitSeconds = (35 + (clampedLevel / 2)).coerceAtMost(70),
            maxMistakes = if (clampedLevel <= 15) 3 else 2,
            basePointsPerQuestion = 55 + (clampedLevel * 10)
        )
    }

    override fun generateQuestion(level: Int, rng: Random, history: Set<String>): GameQuestion {
        val clampedLevel = level.coerceIn(1, 50)
        val tier = (((clampedLevel - 1) * 9) / 49) + 1
        val glyphs = listOf("▲ Delta", "■ Cube", "● Sphere", "◆ Diamond", "★ Star", "✦ Spark", "◈ Matrix")
        val positions = listOf("A", "B", "C", "D", "E", "F")
        val count = when (tier) {
            in 1..3 -> 4
            in 4..6 -> 5
            else -> 6
        }
        val activePositions = positions.take(count)

        var attempts = 0
        while (attempts < 50) {
            attempts++
            val targetGlyph = glyphs.random(rng)
            val pairPos = activePositions.shuffled(rng).take(2).sorted()
            val otherGlyphs = glyphs.filter { it != targetGlyph }.shuffled(rng)

            val mapping = mutableMapOf<String, String>()
            mapping[pairPos[0]] = targetGlyph
            mapping[pairPos[1]] = targetGlyph

            var otherIdx = 0
            activePositions.forEach { pos ->
                if (!mapping.containsKey(pos)) {
                    mapping[pos] = otherGlyphs[otherIdx % otherGlyphs.size]
                    otherIdx++
                }
            }

            val promptSb = StringBuilder("Find the Matching Pair:\n")
            activePositions.forEach { pos ->
                promptSb.append("Card $pos:  ${mapping[pos]}\n")
            }
            val prompt = promptSb.toString().trimEnd()

            if (!history.contains(prompt)) {
                val targetAnswer = "${pairPos[0]} & ${pairPos[1]}"
                val options = mutableSetOf(targetAnswer)
                while (options.size < 4) {
                    val fakePair = activePositions.shuffled(rng).take(2).sorted()
                    options.add("${fakePair[0]} & ${fakePair[1]}")
                }

                return GameQuestion(
                    id = "cm_${clampedLevel}_${rng.nextInt(100000)}_${System.nanoTime() % 10000}",
                    prompt = prompt,
                    targetAnswer = targetAnswer,
                    options = options.toList().shuffled(rng)
                )
            }
        }

        val targetGlyph = glyphs.random(rng)
        val pairPos = activePositions.shuffled(rng).take(2).sorted()
        val otherGlyphs = glyphs.filter { it != targetGlyph }.shuffled(rng)
        val mapping = mutableMapOf<String, String>()
        mapping[pairPos[0]] = targetGlyph
        mapping[pairPos[1]] = targetGlyph
        var otherIdx = 0
        activePositions.forEach { pos ->
            if (!mapping.containsKey(pos)) {
                mapping[pos] = otherGlyphs[otherIdx % otherGlyphs.size]
                otherIdx++
            }
        }
        val promptSb = StringBuilder("Find the Matching Pair:\n")
        activePositions.forEach { pos ->
            promptSb.append("Card $pos:  ${mapping[pos]}\n")
        }
        val targetAnswer = "${pairPos[0]} & ${pairPos[1]}"
        val options = mutableSetOf(targetAnswer)
        while (options.size < 4) {
            val fakePair = activePositions.shuffled(rng).take(2).sorted()
            options.add("${fakePair[0]} & ${fakePair[1]}")
        }
        return GameQuestion(
            id = "cm_${clampedLevel}_fallback_${System.nanoTime() % 10000}",
            prompt = promptSb.toString().trimEnd(),
            targetAnswer = targetAnswer,
            options = options.toList().shuffled(rng)
        )
    }

    override fun evaluateAnswer(question: GameQuestion, input: String): EvaluationResult {
        val isCorrect = input.trim() == question.targetAnswer.trim()
        return EvaluationResult(isCorrect, question.targetAnswer, if (isCorrect) 110 else 0)
    }

    override fun generatePracticeQuestions(rng: Random): List<GameQuestion> {
        return listOf(
            GameQuestion(
                "p1",
                "Find the Matching Pair:\nCard A:  ▲ Delta\nCard B:  ■ Cube\nCard C:  ▲ Delta\nCard D:  ● Sphere",
                "A & C",
                listOf("A & C", "A & B", "B & D", "C & D")
            )
        )
    }
}
