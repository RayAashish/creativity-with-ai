package com.mindforge.app

import com.mindforge.app.feature.home.GameCategory
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class Phase1Test {

    @Test
    fun testCategoryGameCountTotals() {
        val totalExpectedGames = 25
        val actualCount = GameCategory.entries.sumOf { it.gameCount }
        assertEquals(totalExpectedGames, actualCount)
    }

    @Test
    fun testDeterministicDailyChallengeSeed() {
        // Daily challenge seed should be identical for the same date
        val date1 = LocalDate.of(2026, 11, 7)
        val seed1 = date1.year * 10000L + date1.monthValue * 100L + date1.dayOfMonth

        val date2 = LocalDate.of(2026, 11, 7)
        val seed2 = date2.year * 10000L + date2.monthValue * 100L + date2.dayOfMonth

        assertEquals(seed1, seed2)

        val rng1 = kotlin.random.Random(seed1)
        val rng2 = kotlin.random.Random(seed2)

        val sampleList = listOf("g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8")
        val pick1 = sampleList.shuffled(rng1).take(3)
        val pick2 = sampleList.shuffled(rng2).take(3)

        assertEquals(pick1, pick2)
        assertEquals(3, pick1.size)
    }

    @Test
    fun testCategoryEnumTitles() {
        assertEquals("Mental Math", GameCategory.MATH.title)
        assertEquals("Memory", GameCategory.MEMORY.title)
        assertEquals("Focus & Speed", GameCategory.FOCUS.title)
        assertEquals("Logic & Puzzles", GameCategory.LOGIC.title)
        assertEquals("Language", GameCategory.LANGUAGE.title)
    }
}
