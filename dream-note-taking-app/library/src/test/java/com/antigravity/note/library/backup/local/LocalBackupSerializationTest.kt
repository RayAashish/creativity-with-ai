package com.antigravity.note.library.backup.local

import com.antigravity.note.library.backup.model.FolderBackupItem
import com.antigravity.note.library.backup.model.LibraryHierarchyBackup
import com.antigravity.note.library.backup.model.NotebookBackupItem
import com.antigravity.note.library.backup.model.PageBackupItem
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class LocalBackupSerializationTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    private val json = Json { ignoreUnknownKeys = true; prettyPrint = true }

    @Test
    fun testLibraryHierarchyBackupRoundTrip() {
        val original = LibraryHierarchyBackup(
            version = 1,
            exportedAt = 1730700000000L,
            folders = listOf(
                FolderBackupItem("f_dsa", null, "DSA", "#005AC1", true, 1000L, 2000L),
                FolderBackupItem("f_dp", "f_dsa", "Dynamic Programming", "#6750A4", false, 1100L, 2100L)
            ),
            notebooks = listOf(
                NotebookBackupItem("nb_climbing", "f_dp", "Climbing Stairs", 2, true, 1200L, 2200L)
            ),
            pages = listOf(
                PageBackupItem(
                    pageId = "p_climb_1",
                    notebookId = "nb_climbing",
                    pageIndex = 0,
                    title = "Climbing Stairs",
                    template = "DSA_PROBLEM",
                    strokeCount = 42,
                    createdAt = 1300L,
                    modifiedAt = 2300L,
                    isProblemPage = true,
                    difficulty = "Easy",
                    problemStatus = "Solved",
                    timeComplexity = "O(N)",
                    spaceComplexity = "O(1)"
                )
            )
        )

        val serialized = json.encodeToString(original)
        assertNotNull(serialized)
        assertTrue(serialized.contains("Climbing Stairs"))
        assertTrue(serialized.contains("DSA_PROBLEM"))

        val deserialized = json.decodeFromString<LibraryHierarchyBackup>(serialized)
        assertEquals(original.version, deserialized.version)
        assertEquals(2, deserialized.folders.size)
        assertEquals(1, deserialized.notebooks.size)
        assertEquals(1, deserialized.pages.size)
        assertEquals("Climbing Stairs", deserialized.pages[0].title)
        assertEquals("O(N)", deserialized.pages[0].timeComplexity)
    }

    @Test
    fun testRollingSnapshotPruning() {
        val snapDir = tempFolder.newFolder("snapshots_page1")

        // Create 15 snapshot files with varying timestamps
        for (i in 1..15) {
            val f = File(snapDir, "page1.${1000L + i * 100}.inkflow")
            f.writeText("snapshot content $i")
            f.setLastModified(1000L + i * 100)
        }

        assertEquals(15, snapDir.listFiles()?.size)

        // Prune beyond MAX_SNAPSHOT_VERSIONS (10)
        val snaps = snapDir.listFiles()?.sortedByDescending { it.lastModified() } ?: emptyList()
        if (snaps.size > 10) {
            for (s in snaps.drop(10)) {
                s.delete()
            }
        }

        val remaining = snapDir.listFiles()?.sortedByDescending { it.lastModified() } ?: emptyList()
        assertEquals(10, remaining.size)
        // Verify newest snapshot is preserved
        assertTrue(remaining.first().name.contains("2500"))
    }
}
