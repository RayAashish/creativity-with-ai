package com.antigravity.note.inkengine

import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PageMetadata
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.inkengine.audio.AudioStrokeTiming
import com.antigravity.note.inkengine.export.InkflowManifest
import com.antigravity.note.inkengine.export.InkflowPageEntry
import com.antigravity.note.inkengine.export.PageExporter
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

class ExportAndAudioTest {

    @Test
    fun testInkflowManifestJsonSerialization() {
        val manifest = InkflowManifest(
            version = 1,
            appName = "Dream Note Pro",
            notebookId = "nb_123",
            notebookTitle = "Two Pointers Mastery",
            createdAt = 100000L,
            exportedAt = 200000L,
            pageCount = 2,
            pages = listOf(
                InkflowPageEntry("p1", "Q1 Two Sum", 0, "GRID", 15, "p1.m4a"),
                InkflowPageEntry("p2", "Q2 3Sum", 1, "RULED", 28, null)
            )
        )

        val json = manifest.toJsonString()
        val parsed = InkflowManifest.fromJsonString(json)

        assertEquals(manifest.version, parsed.version)
        assertEquals(manifest.appName, parsed.appName)
        assertEquals(manifest.notebookId, parsed.notebookId)
        assertEquals(manifest.notebookTitle, parsed.notebookTitle)
        assertEquals(manifest.pageCount, parsed.pageCount)
        assertEquals(2, parsed.pages.size)
        assertEquals("p1", parsed.pages[0].pageId)
        assertEquals("p1.m4a", parsed.pages[0].audioFile)
        assertEquals("p2", parsed.pages[1].pageId)
        assertEquals(null, parsed.pages[1].audioFile)
    }

    @Test
    fun testInkflowZipExportAndImportLossless() {
        val page1 = DocumentPage(
            metadata = PageMetadata(
                pageId = "p_dsa_1",
                notebookId = "nb_dsa",
                pageIndex = 0,
                title = "Two Sum Solution",
                template = PaperTemplate.GRID,
                createdAt = 12345L,
                modifiedAt = 23456L
            )
        )

        val page2 = DocumentPage(
            metadata = PageMetadata(
                pageId = "p_dsa_2",
                notebookId = "nb_dsa",
                pageIndex = 1,
                title = "3Sum Notes",
                template = PaperTemplate.RULED,
                createdAt = 34567L,
                modifiedAt = 45678L
            )
        )

        val manifest = InkflowManifest(
            notebookId = "nb_dsa",
            notebookTitle = "Two Pointers",
            createdAt = 12345L,
            exportedAt = System.currentTimeMillis(),
            pageCount = 2,
            pages = listOf(
                InkflowPageEntry("p_dsa_1", "Two Sum Solution", 0, "GRID", 0),
                InkflowPageEntry("p_dsa_2", "3Sum Notes", 1, "RULED", 0)
            )
        )

        // 1. Export to ZIP
        val zipBaos = ByteArrayOutputStream()
        PageExporter.exportToInkflow(
            manifest = manifest,
            pages = listOf(page1, page2),
            outputStream = zipBaos
        )

        val zipBytes = zipBaos.toByteArray()
        assertTrue("ZIP should contain bytes", zipBytes.isNotEmpty())

        // 2. Import from ZIP
        val (importedManifest, importedPages) = PageExporter.importFromInkflow(
            ByteArrayInputStream(zipBytes)
        )

        assertEquals("nb_dsa", importedManifest.notebookId)
        assertEquals("Two Pointers", importedManifest.notebookTitle)
        assertEquals(2, importedPages.size)

        val impP1 = importedPages[0]
        assertEquals("p_dsa_1", impP1.metadata.pageId)
        assertEquals(PaperTemplate.GRID, impP1.metadata.template)
        assertEquals(0, impP1.strokes.size)

        val impP2 = importedPages[1]
        assertEquals("p_dsa_2", impP2.metadata.pageId)
        assertEquals(PaperTemplate.RULED, impP2.metadata.template)
        assertEquals(0, impP2.strokes.size)
    }

    @Test
    fun testAudioStrokeTimingFiltering() {
        val timings = listOf(
            AudioStrokeTiming(strokeIndex = 0, startOffsetMs = 500L),
            AudioStrokeTiming(strokeIndex = 1, startOffsetMs = 1500L),
            AudioStrokeTiming(strokeIndex = 2, startOffsetMs = 3000L),
            AudioStrokeTiming(strokeIndex = 3, startOffsetMs = 5500L)
        )

        // At audio time 1000ms, only stroke 0 was drawn
        val at1000 = timings.filter { it.startOffsetMs <= 1000L }.map { it.strokeIndex }.toSet()
        assertEquals(setOf(0), at1000)

        // At audio time 2000ms, strokes 0 and 1 are visible
        val at2000 = timings.filter { it.startOffsetMs <= 2000L }.map { it.strokeIndex }.toSet()
        assertEquals(setOf(0, 1), at2000)

        // At audio time 6000ms, all strokes are visible
        val at6000 = timings.filter { it.startOffsetMs <= 6000L }.map { it.strokeIndex }.toSet()
        assertEquals(setOf(0, 1, 2, 3), at6000)
    }

    @Test
    fun testInteractiveHtmlExportGeneratesValidWebDocument() {
        val page = DocumentPage(
            metadata = PageMetadata(
                pageId = "p_web_test",
                notebookId = "nb_web",
                pageIndex = 0,
                title = "Binary Tree Inorder Traversal",
                template = PaperTemplate.CORNELL,
                createdAt = 1000L,
                modifiedAt = 2000L
            )
        )

        val baos = ByteArrayOutputStream()
        PageExporter.exportToInteractiveHtml(
            notebookTitle = "Data Structures & Algorithms",
            pages = listOf(page),
            outputStream = baos,
            initialDarkMode = false
        )

        val html = baos.toString("UTF-8")
        assertTrue("HTML should have <!DOCTYPE html>", html.contains("<!DOCTYPE html>"))
        assertTrue("HTML should contain notebook title", html.contains("Data Structures &amp; Algorithms") || html.contains("Data Structures & Algorithms"))
        assertTrue("HTML should contain page title", html.contains("Binary Tree Inorder Traversal"))
        assertTrue("HTML should have canvas element", html.contains("<canvas id=\"noteCanvas\">"))
        assertTrue("HTML should contain CORNELL template", html.contains("CORNELL"))
        assertTrue("HTML should contain offline export button", html.contains("btn-export-png") && html.contains("PNG"))
    }

    @Test
    fun testInkflowZipEmbedsIndexHtmlForUniversalViewing() {
        val page = DocumentPage(
            metadata = PageMetadata(
                pageId = "p_zip_web",
                notebookId = "nb_zip",
                pageIndex = 0,
                title = "Graph BFS",
                template = PaperTemplate.GRID,
                createdAt = 1000L,
                modifiedAt = 2000L
            )
        )

        val manifest = InkflowManifest(
            notebookId = "nb_zip",
            notebookTitle = "Graph Algorithms",
            createdAt = 1000L,
            exportedAt = System.currentTimeMillis(),
            pageCount = 1,
            pages = listOf(InkflowPageEntry("p_zip_web", "Graph BFS", 0, "GRID", 0))
        )

        val zipBaos = ByteArrayOutputStream()
        PageExporter.exportToInkflow(manifest, listOf(page), outputStream = zipBaos)

        val zipIn = java.util.zip.ZipInputStream(ByteArrayInputStream(zipBaos.toByteArray()))
        val entries = mutableListOf<String>()
        var entry = zipIn.nextEntry
        while (entry != null) {
            entries.add(entry.name)
            zipIn.closeEntry()
            entry = zipIn.nextEntry
        }

        assertTrue("ZIP must include manifest.json", entries.contains("manifest.json"))
        assertTrue("ZIP must include index.html for direct PC/Mac double-click viewing", entries.contains("index.html"))
        assertTrue("ZIP must include page binary", entries.contains("pages/p_zip_web.inkpage"))
    }
}
