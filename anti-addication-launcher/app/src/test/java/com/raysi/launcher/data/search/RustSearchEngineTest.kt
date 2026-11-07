// app/src/test/java/com/raysi/launcher/data/search/RustSearchEngineTest.kt
package com.raysi.launcher.data.search

import com.raysi.launcher.data.model.AppInfo
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Before
import org.junit.Test
import java.io.File

class RustSearchEngineTest {

    private var engine: RustSearchEngine? = null

    private fun createApp(label: String, pkg: String = "com.example.${label.lowercase()}"): AppInfo {
        return AppInfo(
            label = label,
            packageName = pkg,
            className = "$pkg.MainActivity"
        )
    }

    @Before
    fun setUp() {
        val projectRoot = File(System.getProperty("user.dir") ?: ".")
        val dylibPath = File(projectRoot, "../native/focus_search/target/release/libfocus_search.dylib").canonicalFile
        val soPath = File(projectRoot, "../native/focus_search/target/release/libfocus_search.so").canonicalFile

        val pathToLoad = when {
            dylibPath.exists() -> dylibPath.absolutePath
            soPath.exists() -> soPath.absolutePath
            else -> null
        }

        if (pathToLoad != null) {
            RustSearchEngine.loadExplicit(pathToLoad)
        }

        assumeTrue("Native library focus_search is not available for host test", RustSearchEngine.isNativeAvailable())

        val eng = RustSearchEngine()
        val apps = listOf(
            createApp("Chrome"),
            createApp("Camera"),
            createApp("Calculator"),
            createApp("Calendar"),
            createApp("Clock"),
            createApp("Contacts"),
            createApp("Google Chrome"),
            createApp("Google Maps"),
            createApp("Google Calendar"),
            createApp("Messages"),
            createApp("Phone"),
            createApp("Photos"),
            createApp("Settings"),
            createApp("Slack"),
            createApp("Spotify"),
            createApp("Twitter"),
            createApp("YouTube")
        )
        eng.updateIndex(apps)
        engine = eng
    }

    @After
    fun tearDown() {
        engine?.close()
    }

    @Test
    fun emptyQuery_returnsAllApps() {
        val results = engine!!.search("")
        assertEquals(17, results.size)
    }

    @Test
    fun exactPrefix_ranksHighest() {
        val results = engine!!.search("cam")
        assertTrue(results.isNotEmpty())
        assertEquals("Camera", results.first().label)
    }

    @Test
    fun wordBoundaryPrefix_matchesSecondWord() {
        val results = engine!!.search("maps")
        assertTrue(results.isNotEmpty())
        assertEquals("Google Maps", results.first().label)
    }

    @Test
    fun subsequenceMatching_findsInitials() {
        val results = engine!!.search("gcal")
        assertTrue(results.isNotEmpty())
        assertEquals("Google Calendar", results.first().label)
    }

    @Test
    fun transpositionTypo_matchesDamerauLevenshtein() {
        val results = engine!!.search("stetings")
        assertTrue("Expected Settings for 'stetings', got: $results", results.isNotEmpty())
        assertEquals("Settings", results.first().label)
    }

    @Test
    fun singleCharInsertionTypo_matchesDamerauLevenshtein() {
        val results = engine!!.search("camer")
        assertTrue(results.isNotEmpty())
        assertEquals("Camera", results.first().label)
    }

    @Test
    fun singleCharSubstitutionTypo_matchesDamerauLevenshtein() {
        val results = engine!!.search("phome")
        assertTrue(results.isNotEmpty())
        assertEquals("Phone", results.first().label)
    }

    @Test
    fun excessiveDistance_doesNotMatch() {
        val results = engine!!.search("xyzzy")
        assertTrue("Expected 0 matches for 'xyzzy', got: $results", results.isEmpty())
    }

    @Test
    fun caseInsensitive_matchesCorrectly() {
        val results = engine!!.search("YOUTUBE")
        assertTrue(results.isNotEmpty())
        assertEquals("YouTube", results.first().label)
    }

    @Test
    fun maxResults_limitsOutput() {
        val results = engine!!.search("c", maxResults = 2)
        assertEquals(2, results.size)
    }
}
