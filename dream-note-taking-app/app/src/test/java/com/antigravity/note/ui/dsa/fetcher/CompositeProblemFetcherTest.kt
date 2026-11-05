package com.antigravity.note.ui.dsa.fetcher

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CompositeProblemFetcherTest {

    private val fetcher = CompositeProblemFetcher()

    @Test
    fun testProviderRoutingForCode360() {
        val url = "https://www.naukri.com/code360/problems/frog-jump_3621012"
        val provider = fetcher.getProviderForUrl(url)
        assertTrue("Provider should be Code360ProblemProvider", provider is Code360ProblemProvider)
    }

    @Test
    fun testProviderRoutingForCodingNinjas() {
        val url = "https://codingninjas.com/studio/problems/frog-jump_3621012"
        val provider = fetcher.getProviderForUrl(url)
        assertTrue("Provider should be Code360ProblemProvider", provider is Code360ProblemProvider)
    }

    @Test
    fun testProviderRoutingForLeetCode() {
        val url = "https://leetcode.com/problems/climbing-stairs/"
        val provider = fetcher.getProviderForUrl(url)
        assertTrue("Provider should be LeetCodeProblemProvider", provider is LeetCodeProblemProvider)
    }

    @Test
    fun testProviderRoutingForGeeksforGeeks() {
        val url = "https://practice.geeksforgeeks.org/problems/geek-jump/1"
        val provider = fetcher.getProviderForUrl(url)
        assertTrue("Provider should be GeeksforGeeksProblemProvider", provider is GeeksforGeeksProblemProvider)
    }

    @Test
    fun testProviderRoutingForCodeforces() {
        val url = "https://codeforces.com/problemset/problem/1850/A"
        val provider = fetcher.getProviderForUrl(url)
        assertTrue("Provider should be CodeforcesProblemProvider", provider is CodeforcesProblemProvider)
    }

    @Test
    fun testProviderRoutingForHackerRank() {
        val url = "https://www.hackerrank.com/challenges/simple-array-sum/problem"
        val provider = fetcher.getProviderForUrl(url)
        assertTrue("Provider should be HackerRankProblemProvider", provider is HackerRankProblemProvider)
    }

    @Test
    fun testProviderRoutingForWikipedia() {
        val url = "https://en.wikipedia.org/wiki/Dynamic_programming"
        val provider = fetcher.getProviderForUrl(url)
        assertTrue("Provider should be WikipediaProblemProvider", provider is WikipediaProblemProvider)
    }

    @Test
    fun testProviderRoutingForGeneric() {
        val url = "https://martinfowler.com/articles/microservices.html"
        val provider = fetcher.getProviderForUrl(url)
        assertTrue("Provider should fall back to GenericWebProvider", provider is GenericWebProvider)
    }

    @Test
    fun testProblemSourceFromUrl() {
        assertEquals(ProblemSource.CODE360, ProblemSource.fromUrl("https://www.naukri.com/code360/problems/frog-jump_3621012"))
        assertEquals(ProblemSource.LEETCODE, ProblemSource.fromUrl("https://leetcode.com/problems/two-sum"))
        assertEquals(ProblemSource.GEEKSFORGEEKS, ProblemSource.fromUrl("https://practice.geeksforgeeks.org/problems/reverse-a-linked-list/1"))
        assertEquals(ProblemSource.CODEFORCES, ProblemSource.fromUrl("https://codeforces.com/problemset/problem/4/A"))
        assertEquals(ProblemSource.HACKERRANK, ProblemSource.fromUrl("https://www.hackerrank.com/challenges/solve-me-first/problem"))
        assertEquals(ProblemSource.WIKIPEDIA, ProblemSource.fromUrl("https://en.wikipedia.org/wiki/Breadth-first_search"))
        assertEquals(ProblemSource.GENERIC, ProblemSource.fromUrl("https://github.com"))
    }

    @Test
    fun testCode360SlugExtraction() {
        val url1 = "https://www.naukri.com/code360/problems/frog-jump_3621012"
        val url2 = "https://www.codingninjas.com/studio/problems/frog-jump_3621012?leftPanelTabValue=PROBLEM"
        val provider = Code360ProblemProvider()
        assertTrue(provider.canHandle(url1))
        assertTrue(provider.canHandle(url2))
    }

    @Test
    fun testProblemDescriptionToTestCases() {
        val desc = ProblemDescription(
            title = "Frog Jump",
            source = ProblemSource.CODE360,
            htmlOrMarkdownBody = "<p>Frog jump details</p>",
            difficulty = "Easy",
            examples = listOf(
                ExampleCase(1, "Sample 1", "4\n10 20 30 10", "20"),
                ExampleCase(2, "Sample 2", "3\n10 50 10", "0")
            ),
            sourceUrl = "https://www.naukri.com/code360/problems/frog-jump_3621012"
        )

        val testCases = desc.toTestCases()
        assertEquals(2, testCases.size)
        assertEquals("Sample 1", testCases[0].title)
        assertEquals("4\n10 20 30 10", testCases[0].input)
        assertEquals("20", testCases[0].output)
    }

    @Test
    fun testLiveCode360Fetch() = runBlocking {
        val provider = Code360ProblemProvider()
        val result = provider.fetch("https://www.naukri.com/code360/problems/frog-jump_3621012")
        result.exceptionOrNull()?.printStackTrace()
        assertTrue("Live fetch must succeed: ${result.exceptionOrNull()?.message}", result.isSuccess)
        val desc = result.getOrNull()!!
        assertEquals("Frog Jump", desc.title)
        assertTrue("Body should contain frog jump statement", desc.htmlOrMarkdownBody.contains("frog", ignoreCase = true))
        assertTrue("Examples should be parsed", desc.examples.isNotEmpty())
    }

    @Test
    fun testLiveWikipediaFetch() = runBlocking {
        val provider = WikipediaProblemProvider()
        val result = provider.fetch("https://en.wikipedia.org/wiki/Dynamic_programming")
        assertTrue("Wikipedia fetch must succeed: ${result.exceptionOrNull()?.message}", result.isSuccess)
        val desc = result.getOrNull()!!
        assertTrue("Title should be Dynamic programming", desc.title.contains("Dynamic programming", ignoreCase = true))
        assertTrue("Body should not be empty", desc.htmlOrMarkdownBody.isNotBlank())
    }

    @Test
    fun testLiveHackerRankFetch() = runBlocking {
        val provider = HackerRankProblemProvider()
        val result = provider.fetch("https://www.hackerrank.com/challenges/simple-array-sum/problem")
        assertTrue("HackerRank fetch must succeed: ${result.exceptionOrNull()?.message}", result.isSuccess)
        val desc = result.getOrNull()!!
        assertEquals("Simple Array Sum", desc.title)
        assertTrue("Body should contain statement", desc.htmlOrMarkdownBody.isNotBlank())
    }
}
