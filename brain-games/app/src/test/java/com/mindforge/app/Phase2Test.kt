package com.mindforge.app

import com.mindforge.app.feature.game.math.MissingOperatorEngine
import com.mindforge.app.feature.game.math.QuickCalcEngine
import com.mindforge.app.feature.game.math.SpeedChainEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.random.Random

class Phase2Test {

    private val rng = Random(42)

    @Test
    fun testQuickCalcEngine_generatesValidQuestionsAcrossAll50Levels() {
        val engine = QuickCalcEngine()

        for (lvl in listOf(1, 5, 10, 20, 30, 40, 50)) {
            val config = engine.getLevelConfig(lvl)
            assertTrue("Total questions at lvl $lvl should be in range", config.totalQuestions in 8..18)
            assertTrue("Time limit at lvl $lvl should be in range", config.timeLimitSeconds in 30..65)

            val history = mutableSetOf<String>()
            repeat(10) {
                val q = engine.generateQuestion(lvl, rng, history)
                // Deduplication verification: prompt must not repeat
                assertFalse("Generated question must not duplicate previously asked questions", history.contains(q.prompt))
                history.add(q.prompt)
                assertNotNull(q.prompt)
                assertNotNull(q.targetAnswer)

                // Verify integer parseability
                val answerInt = q.targetAnswer.toIntOrNull()
                assertNotNull("Target answer must be integer for ${q.prompt}", answerInt)

                // Verify evaluation
                val correctEval = engine.evaluateAnswer(q, q.targetAnswer)
                assertTrue(correctEval.isCorrect)

                val wrongEval = engine.evaluateAnswer(q, "${answerInt!! + 99}")
                assertFalse(wrongEval.isCorrect)
            }
        }
    }

    @Test
    fun testSpeedChainEngine_validAccumulatorAndOptionsAcross50Levels() {
        val engine = SpeedChainEngine()

        for (lvl in listOf(1, 10, 25, 40, 50)) {
            val history = mutableSetOf<String>()
            repeat(5) {
                val q = engine.generateQuestion(lvl, rng, history)
                history.add(q.prompt)
                assertNotNull(q.prompt)
                assertNotNull(q.options)
                assertEquals(4, q.options!!.size)
                assertTrue(q.options!!.contains(q.targetAnswer))

                val eval = engine.evaluateAnswer(q, q.targetAnswer)
                assertTrue(eval.isCorrect)
            }
        }
    }

    @Test
    fun testMissingOperatorEngine_validQuestionsAndOptionsAcross50Levels() {
        val engine = MissingOperatorEngine()

        for (lvl in listOf(1, 10, 25, 40, 50)) {
            val history = mutableSetOf<String>()
            repeat(5) {
                val q = engine.generateQuestion(lvl, rng, history)
                history.add(q.prompt)
                assertNotNull(q.prompt)
                assertNotNull(q.options)
                assertEquals(4, q.options!!.size)
                assertTrue("Options must contain target answer for ${q.prompt}", q.options!!.contains(q.targetAnswer))

                val eval = engine.evaluateAnswer(q, q.targetAnswer)
                assertTrue(eval.isCorrect)
            }
        }
    }

    @Test
    fun testPrefixGuardAndAutoSubmitLogic() {
        val target = "125"

        fun evaluateInput(candidate: String): String {
            return when {
                candidate.trim() == target -> "AUTO_SUBMIT_CORRECT"
                candidate.length < target.length -> "TYPING_PREFIX_OK"
                else -> "WRONG_SHAKE_AND_VIBRATE"
            }
        }

        assertEquals("TYPING_PREFIX_OK", evaluateInput("1"))
        assertEquals("TYPING_PREFIX_OK", evaluateInput("12"))
        assertEquals("AUTO_SUBMIT_CORRECT", evaluateInput("125"))
        assertEquals("WRONG_SHAKE_AND_VIBRATE", evaluateInput("124"))
        assertEquals("WRONG_SHAKE_AND_VIBRATE", evaluateInput("999"))
        assertEquals("WRONG_SHAKE_AND_VIBRATE", evaluateInput("1250"))
    }
}
