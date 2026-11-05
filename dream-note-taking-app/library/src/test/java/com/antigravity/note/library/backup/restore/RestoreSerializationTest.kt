package com.antigravity.note.library.backup.restore

import com.antigravity.note.library.backup.model.ContentBounds
import com.antigravity.note.library.backup.model.FolderSummary
import com.antigravity.note.library.backup.model.LibraryIndex
import com.antigravity.note.library.backup.model.NotebookSummary
import com.antigravity.note.library.backup.model.PageSummary
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class RestoreSerializationTest {

    private val json = Json { ignoreUnknownKeys = true; prettyPrint = true }

    @Test
    fun testLibraryIndexRoundTrip() {
        val original = LibraryIndex(
            version = 1,
            exportedAt = 1730800000000L,
            folders = listOf(
                FolderSummary(
                    folderId = "f_dsa",
                    parentFolderId = null,
                    name = "DSA",
                    colorHex = "#C96442",
                    isPinned = true,
                    createdAt = 1000L,
                    modifiedAt = 2000L,
                    iconKey = "code"
                )
            ),
            notebooks = listOf(
                NotebookSummary(
                    notebookId = "nb_dp",
                    folderId = "f_dsa",
                    title = "Dynamic Programming",
                    pageCount = 1,
                    isStarred = true,
                    createdAt = 1500L,
                    modifiedAt = 2500L,
                    iconKey = "algo",
                    pages = listOf(
                        PageSummary(
                            pageId = "p_stairs",
                            title = "Climbing Stairs",
                            pageIndex = 0,
                            filePath = "notebooks/nb_dp/pages/p_stairs.inkflow",
                            strokeCount = 15,
                            contentBounds = ContentBounds(10f, 20f, 500f, 800f),
                            sizeBytes = 2048L,
                            sha256 = "abc123def456",
                            updatedAt = 3000L,
                            template = "GRID",
                            difficulty = "Easy",
                            status = "Solved",
                            tags = listOf("DP", "Fibonacci"),
                            sourceLink = "https://leetcode.com/problems/climbing-stairs"
                        )
                    )
                )
            )
        )

        val jsonStr = json.encodeToString(original)
        assertNotNull(jsonStr)
        assertTrue(jsonStr.contains("Climbing Stairs"))
        assertTrue(jsonStr.contains("notebooks/nb_dp/pages/p_stairs.inkflow"))

        val restored = json.decodeFromString<LibraryIndex>(jsonStr)
        assertEquals(1, restored.folders.size)
        assertEquals("f_dsa", restored.folders[0].folderId)
        assertEquals(1, restored.notebooks.size)
        assertEquals("nb_dp", restored.notebooks[0].notebookId)
        assertEquals(1, restored.notebooks[0].pages.size)
        assertEquals("p_stairs", restored.notebooks[0].pages[0].pageId)
        assertEquals(15, restored.notebooks[0].pages[0].strokeCount)
        assertEquals("Easy", restored.notebooks[0].pages[0].difficulty)
        assertEquals(2, restored.notebooks[0].pages[0].tags.size)
    }
}
