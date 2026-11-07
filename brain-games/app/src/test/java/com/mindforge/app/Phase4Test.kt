package com.mindforge.app

import com.mindforge.app.feature.game.focus.GoNoGoEngine
import com.mindforge.app.feature.game.focus.OddOneOutEngine
import com.mindforge.app.feature.game.focus.ReactionTapEngine
import com.mindforge.app.feature.game.focus.SchulteTableEngine
import com.mindforge.app.feature.game.focus.StroopTestEngine
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.language.WordChainEngine
import com.mindforge.app.feature.game.language.WordScrambleEngine
import com.mindforge.app.feature.game.logic.BalanceWeightsEngine
import com.mindforge.app.feature.game.logic.LightsOutEngine
import com.mindforge.app.feature.game.logic.MiniSudokuEngine
import com.mindforge.app.feature.game.logic.PatternMatrixEngine
import com.mindforge.app.feature.game.math.MissingOperatorEngine
import com.mindforge.app.feature.game.math.NumberSequenceEngine
import com.mindforge.app.feature.game.math.OfflineDuelEngine
import com.mindforge.app.feature.game.math.PercentSprintEngine
import com.mindforge.app.feature.game.math.QuickCalcEngine
import com.mindforge.app.feature.game.math.SpeedChainEngine
import com.mindforge.app.feature.game.math.SquaresCubesEngine
import com.mindforge.app.feature.game.math.Target24Engine
import com.mindforge.app.feature.game.math.TrueFalseCalcEngine
import com.mindforge.app.feature.game.memory.CardMatchEngine
import com.mindforge.app.feature.game.memory.DigitSpanEngine
import com.mindforge.app.feature.game.memory.NBackEngine
import com.mindforge.app.feature.game.memory.SequenceMemoryEngine
import com.mindforge.app.feature.game.memory.SpatialGridEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.random.Random

class Phase4Test {

    private val rng = Random(12345)

    private val all25Engines: List<GameEngine> = listOf(
        // Math (9)
        QuickCalcEngine(), SpeedChainEngine(), MissingOperatorEngine(),
        SquaresCubesEngine(), PercentSprintEngine(), TrueFalseCalcEngine(),
        Target24Engine(), NumberSequenceEngine(), OfflineDuelEngine(),
        // Memory (5)
        SequenceMemoryEngine(), CardMatchEngine(), DigitSpanEngine(),
        SpatialGridEngine(), NBackEngine(),
        // Focus (5)
        StroopTestEngine(), SchulteTableEngine(), OddOneOutEngine(),
        ReactionTapEngine(), GoNoGoEngine(),
        // Logic (4)
        PatternMatrixEngine(), LightsOutEngine(), MiniSudokuEngine(), BalanceWeightsEngine(),
        // Language (2)
        WordScrambleEngine(), WordChainEngine()
    )

    @Test
    fun testAll25Engines_instantiationAndUniqueIds() {
        assertEquals(25, all25Engines.size)
        val ids = all25Engines.map { it.id }.toSet()
        assertEquals(25, ids.size)
    }

    @Test
    fun testAll25Engines_generateQuestionsAndEvaluateCorrectlyAcross50Levels() {
        val testLevels = listOf(1, 10, 25, 40, 50)
        for (engine in all25Engines) {
            for (lvl in testLevels) {
                val config = engine.getLevelConfig(lvl)
                assertTrue("Level $lvl config totalQuestions should be >= 5 for ${engine.id}", config.totalQuestions >= 5)
                assertTrue("Level $lvl config timeLimitSeconds should be in range for ${engine.id}", config.timeLimitSeconds in 15..90)

                val history = mutableSetOf<String>()
                val q = engine.generateQuestion(lvl, rng, history)
                assertNotNull("Prompt should not be null for ${engine.id} at level $lvl", q.prompt)
                assertNotNull("Target answer should not be null for ${engine.id} at level $lvl", q.targetAnswer)

                val eval = engine.evaluateAnswer(q, q.targetAnswer)
                assertTrue("Evaluation should succeed on correct target answer for ${engine.id} at level $lvl", eval.isCorrect)
            }
        }
    }
}
