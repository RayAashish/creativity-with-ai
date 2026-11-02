package com.antigravity.note.library

import com.antigravity.note.library.db.FolderEntity
import com.antigravity.note.library.db.NotebookEntity
import com.antigravity.note.library.db.PageEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class LibraryModelTest {

    @Test
    fun testPageEntityDsaProblemAttributes() {
        val page = PageEntity(
            pageId = "p_two_sum",
            notebookId = "nb_two_pointers",
            pageIndex = 0,
            title = "Q1 – Two Sum",
            isProblemPage = true,
            sourceUrl = "https://leetcode.com/problems/two-sum/",
            difficulty = "Easy",
            problemStatus = "Solved",
            timeComplexity = "O(n)",
            spaceComplexity = "O(n)",
            tags = "Array,Hash Table,Two Pointers",
            codeSnippet = "fun twoSum(nums: IntArray, target: Int): IntArray",
            codeLanguage = "Kotlin",
            approachSummary = "One-pass hash map tracking complement indices.",
            template = "CORNELL"
        )

        assertEquals("p_two_sum", page.pageId)
        assertEquals("Q1 – Two Sum", page.title)
        assertTrue(page.isProblemPage)
        assertEquals("Solved", page.problemStatus)
        assertEquals("O(n)", page.timeComplexity)
        assertEquals("O(n)", page.spaceComplexity)
        assertTrue(page.tags.contains("Two Pointers"))
        assertEquals("CORNELL", page.template)
    }

    @Test
    fun testFolderHierarchyNesting() {
        val rootDsa = FolderEntity(folderId = "f_dsa", name = "DSA", parentFolderId = null)
        val arraysFolder = FolderEntity(folderId = "f_arrays", name = "Arrays", parentFolderId = "f_dsa")
        val twoPointersNotebook = NotebookEntity(
            notebookId = "nb_two_pointers",
            folderId = "f_arrays",
            title = "Two Pointers"
        )

        assertNull(rootDsa.parentFolderId)
        assertEquals("f_dsa", arraysFolder.parentFolderId)
        assertEquals("f_arrays", twoPointersNotebook.folderId)
        assertEquals("Two Pointers", twoPointersNotebook.title)
    }

    @Test
    fun testSpacedRepetitionReviewStatus() {
        val now = System.currentTimeMillis()
        val duePage = PageEntity(
            pageId = "p_3sum",
            notebookId = "nb_two_pointers",
            pageIndex = 1,
            title = "Q2 – 3Sum",
            problemStatus = "Revisit",
            nextReviewTimestamp = now - 1000L // 1 sec in past -> due
        )

        val futurePage = PageEntity(
            pageId = "p_two_sum",
            notebookId = "nb_two_pointers",
            pageIndex = 0,
            title = "Q1 – Two Sum",
            problemStatus = "Solved",
            nextReviewTimestamp = now + 86400000L // 1 day in future
        )

        assertTrue(duePage.nextReviewTimestamp > 0 && duePage.nextReviewTimestamp <= now)
        assertFalse(futurePage.nextReviewTimestamp <= now)
    }
}
