package org.ledger.pdf

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.ledger.pdf.engine.RangeParser

class RangeParserTest {

    @Test
    fun parseSimpleRange_returnsCorrectIndices() {
        val result = RangeParser.parseRange("1-3", 10)
        assertEquals(listOf(0, 1, 2), result)
    }

    @Test
    fun parseCommaSeparatedRangesAndSingles_returnsOrderedDeduplicated() {
        val result = RangeParser.parseRange("1-3, 5, 8-10", 10)
        assertEquals(listOf(0, 1, 2, 4, 7, 8, 9), result)
    }

    @Test
    fun parseOutOfRange_clampsToTotalPages() {
        val result = RangeParser.parseRange("1-5, 12-15", 4)
        assertEquals(listOf(0, 1, 2, 3), result)
    }

    @Test
    fun parseReversedRange_handlesGracefully() {
        val result = RangeParser.parseRange("3-1", 5)
        assertEquals(listOf(0, 1, 2), result)
    }

    @Test
    fun parseEmptyOrInvalidString_returnsEmptyList() {
        assertTrue(RangeParser.parseRange("", 10).isEmpty())
        assertTrue(RangeParser.parseRange("   ", 10).isEmpty())
        assertTrue(RangeParser.parseRange("abc, xyz", 10).isEmpty())
    }

    @Test
    fun formatRange_formatsConsecutiveBlocksCorrectly() {
        val indices = listOf(0, 1, 2, 4, 7, 8, 9)
        val formatted = RangeParser.formatRange(indices)
        assertEquals("1-3, 5, 8-10", formatted)
    }

    @Test
    fun formatRange_singlePages() {
        val indices = listOf(0, 3, 6)
        val formatted = RangeParser.formatRange(indices)
        assertEquals("1, 4, 7", formatted)
    }
}
