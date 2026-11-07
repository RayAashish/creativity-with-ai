// app/src/test/java/com/raysi/launcher/data/search/KotlinSearchEngineTest.kt
package com.raysi.launcher.data.search

import android.content.ComponentName
import android.os.Process
import com.raysi.launcher.data.model.AppInfo
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class KotlinSearchEngineTest {

    private lateinit var engine: KotlinSearchEngine

    private fun createApp(label: String, pkg: String = "com.example.${label.lowercase()}"): AppInfo {
        return AppInfo(
            label = label,
            packageName = pkg,
            className = "$pkg.MainActivity"
        )
    }

    @Before
    fun setUp() {
        engine = KotlinSearchEngine()
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
        engine.updateIndex(apps)
    }

    @Test
    fun emptyQuery_returnsAllApps() {
        val results = engine.search("")
        assertEquals(17, results.size)
    }

    @Test
    fun exactPrefix_ranksHighest() {
        val results = engine.search("cam")
        assertTrue(results.isNotEmpty())
        assertEquals("Camera", results.first().label)
    }

    @Test
    fun wordBoundaryPrefix_matchesSecondWord() {
        val results = engine.search("maps")
        assertTrue(results.isNotEmpty())
        assertEquals("Google Maps", results.first().label)
    }

    @Test
    fun subsequenceMatching_findsInitials() {
        val results = engine.search("gcal")
        assertTrue(results.isNotEmpty())
        assertEquals("Google Calendar", results.first().label)
    }

    @Test
    fun transpositionTypo_matchesDamerauLevenshtein() {
        // "stetings" has transposition of 't' and 'e' -> edit distance 1
        val results = engine.search("stetings")
        assertTrue("Expected Settings for 'stetings', got: $results", results.isNotEmpty())
        assertEquals("Settings", results.first().label)
    }

    @Test
    fun singleCharInsertionTypo_matchesDamerauLevenshtein() {
        // "camer" is missing 'a' -> edit distance 1
        val results = engine.search("camer")
        assertTrue(results.isNotEmpty())
        assertEquals("Camera", results.first().label)
    }

    @Test
    fun singleCharSubstitutionTypo_matchesDamerauLevenshtein() {
        // "phome" has 'm' instead of 'n' -> edit distance 1
        val results = engine.search("phome")
        assertTrue(results.isNotEmpty())
        assertEquals("Phone", results.first().label)
    }

    @Test
    fun excessiveDistance_doesNotMatch() {
        val results = engine.search("xyzzy")
        assertTrue("Expected 0 matches for 'xyzzy', got: $results", results.isEmpty())
    }

    @Test
    fun caseInsensitive_matchesCorrectly() {
        val results = engine.search("YOUTUBE")
        assertTrue(results.isNotEmpty())
        assertEquals("YouTube", results.first().label)
    }

    @Test
    fun maxResults_limitsOutput() {
        val results = engine.search("c", maxResults = 2)
        assertEquals(2, results.size)
    }
}
