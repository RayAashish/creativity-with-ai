package com.antigravity.note.library.backup

import com.antigravity.note.library.backup.export.MarkdownExporter
import com.antigravity.note.library.db.PageEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MarkdownExporterTest {

    @Test
    fun testSanitizeName() {
        assertEquals("Two-Sum", MarkdownExporter.sanitizeName("Two Sum"))
        assertEquals("Q1-Two-Sum", MarkdownExporter.sanitizeName("Q1: Two Sum??"))
        assertEquals("Array-Problem-test", MarkdownExporter.sanitizeName("Array / Problem \\ test"))
        assertEquals("Untitled", MarkdownExporter.sanitizeName("   ///   "))
    }

    @Test
    fun testGoldenProblemPageMarkdownExport() {
        val page = PageEntity(
            pageId = "test-page-123",
            notebookId = "test-nb-456",
            pageIndex = 0,
            title = "Q1 - Two Sum",
            template = "RULED",
            isProblemPage = true,
            sourceUrl = "https://leetcode.com/problems/two-sum/",
            difficulty = "Easy",
            problemStatus = "Solved",
            timeTakenMinutes = 15,
            tags = "Array, Hash Table, Two Pointers",
            timeComplexity = "O(N)",
            spaceComplexity = "O(N)",
            approachSummary = "Use a hash map to look up the complement in O(1) time while iterating through the array.",
            codeSnippet = "class Solution {\n    fun twoSum(nums: IntArray, target: Int): IntArray {\n        val map = HashMap<Int, Int>()\n        for (i in nums.indices) {\n            val diff = target - nums[i]\n            if (map.containsKey(diff)) return intArrayOf(map[diff]!!, i)\n            map[nums[i]] = i\n        }\n        return intArrayOf()\n    }\n}",
            codeLanguage = "Kotlin"
        )

        val markdown = MarkdownExporter.exportToMarkdown(
            page = page,
            folderPath = "DSA/Arrays",
            notebookTitle = "Two Pointers",
            ocrText = "Notice: duplicates handled naturally by single pass."
        )

        // Golden verification
        assertTrue(markdown.contains("# Q1 - Two Sum"))
        assertTrue(markdown.contains("> **Location:** `DSA/Arrays / Two Pointers`"))
        assertTrue(markdown.contains("| **Difficulty** | 🟢 **Easy** |"))
        assertTrue(markdown.contains("| **Status** | `Solved` |"))
        assertTrue(markdown.contains("| **Time Complexity** | `O(N)` |"))
        assertTrue(markdown.contains("`#Array` `#Hash Table` `#Two Pointers`"))
        assertTrue(markdown.contains("## Approach & Intuition"))
        assertTrue(markdown.contains("Use a hash map to look up the complement"))
        assertTrue(markdown.contains("```kotlin\nclass Solution"))
        assertTrue(markdown.contains("## Handwritten Notes (OCR)"))
        assertTrue(markdown.contains("Notice: duplicates handled naturally"))
        assertTrue(markdown.contains("![Page Thumbnail](../../notebooks/test-nb-456/pages/test-page-123.thumb.webp)"))
    }
}
