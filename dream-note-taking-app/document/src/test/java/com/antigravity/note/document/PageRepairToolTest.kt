package com.antigravity.note.document

import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PageMetadata
import com.antigravity.note.document.repair.PageRepairTool
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class PageRepairToolTest {
    @Test
    fun testEmptyPageScan() {
        val page = DocumentPage(metadata = PageMetadata("p1", "nb1", 0, "Test Page"))
        val result = PageRepairTool.scan(page)
        assertFalse(result.isDamaged)
        assertEquals(0, result.originalStrokeCount)
        assertEquals(0, result.cleanedStrokeCount)
    }
}
