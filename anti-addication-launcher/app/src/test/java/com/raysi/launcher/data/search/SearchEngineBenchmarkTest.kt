// app/src/test/java/com/raysi/launcher/data/search/SearchEngineBenchmarkTest.kt
package com.raysi.launcher.data.search

import com.raysi.launcher.data.model.AppInfo
import org.junit.After
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.io.File
import kotlin.math.roundToLong

class SearchEngineBenchmarkTest {

    private lateinit var kotlinEngine: KotlinSearchEngine
    private var rustEngine: RustSearchEngine? = null

    private val benchmarkQueries = listOf(
        "chr", "set", "cam", "mes", "clo",       // Prefix
        "map", "pho", "dri", "fil", "cal",       // Word boundary
        "yt", "gcal", "wapp", "spot", "tw",      // Subsequence
        "camer", "stetings", "twtter", "phome",  // Typo (edit distance 1)
        "zzzz", "qwerty", "notfound"             // Negative / mismatch
    )

    @Before
    fun setUp() {
        kotlinEngine = KotlinSearchEngine()

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

        if (RustSearchEngine.isNativeAvailable()) {
            rustEngine = RustSearchEngine()
        }
    }

    @After
    fun tearDown() {
        rustEngine?.close()
    }

    private fun generateApps(count: Int): List<AppInfo> {
        val baseWords = listOf(
            "Google", "Android", "Focus", "Audio", "Video", "Media", "Player", "Reader",
            "Photo", "Camera", "Gallery", "Browser", "Chrome", "Firefox", "Calculator",
            "Calendar", "Clock", "Alarm", "Timer", "Settings", "Preferences", "Manager",
            "Files", "Documents", "Drive", "Cloud", "Backup", "Sync", "Mail", "Gmail",
            "Outlook", "Slack", "Teams", "Discord", "Telegram", "WhatsApp", "Messages",
            "Phone", "Dialer", "Contacts", "People", "Address", "Book", "Notes", "Keep",
            "Evernote", "Notion", "Tasks", "Todo", "Reminder", "Tracker", "Fitness",
            "Health", "Fit", "Workout", "Running", "Music", "Spotify", "YouTube", "Podcasts",
            "SoundCloud", "Radio", "Tuner", "News", "Feed", "Reader", "Weather", "Forecast",
            "Maps", "Navigation", "Transit", "Ride", "Uber", "Lyft", "Food", "Delivery",
            "Shopping", "Amazon", "Store", "Market", "Bank", "Wallet", "Pay", "Finance",
            "Stock", "Crypto", "Investment", "Security", "Authenticator", "VPN", "Terminal"
        )

        val list = ArrayList<AppInfo>(count)
        var wordIdx1 = 0
        var wordIdx2 = 1
        var counter = 1

        for (i in 0 until count) {
            val w1 = baseWords[wordIdx1 % baseWords.size]
            val w2 = baseWords[wordIdx2 % baseWords.size]
            val label = "$w1 $w2 $counter"
            val pkg = "com.app.pkg$counter"
            list.add(
                AppInfo(
                    label = label,
                    packageName = pkg,
                    className = "$pkg.MainActivity"
                )
            )
            counter++
            wordIdx1++
            if (wordIdx1 % baseWords.size == 0) {
                wordIdx2++
            }
        }
        return list
    }

    private data class BenchmarkStats(
        val meanUs: Double,
        val p50Us: Double,
        val p95Us: Double,
        val p99Us: Double,
        val maxUs: Double
    )

    private fun runBenchmark(engine: SearchEngine, iterations: Int): BenchmarkStats {
        val latenciesNs = LongArray(iterations)

        for (i in 0 until iterations) {
            val query = benchmarkQueries[i % benchmarkQueries.size]
            val start = System.nanoTime()
            val results = engine.search(query, maxResults = 50)
            val duration = System.nanoTime() - start
            latenciesNs[i] = duration
            // Prevent JVM dead code elimination
            if (results.size == 999_999) println("unreachable")
        }

        latenciesNs.sort()
        val sumNs = latenciesNs.sum()
        val meanUs = (sumNs / iterations.toDouble()) / 1_000.0
        val p50Us = latenciesNs[(iterations * 0.50).toInt()] / 1_000.0
        val p95Us = latenciesNs[(iterations * 0.95).toInt()] / 1_000.0
        val p99Us = latenciesNs[(iterations * 0.99).toInt()] / 1_000.0
        val maxUs = latenciesNs.last() / 1_000.0

        return BenchmarkStats(meanUs, p50Us, p95Us, p99Us, maxUs)
    }

    @Test
    fun benchmarkSearchEngines_500Apps() {
        val apps = generateApps(500)
        kotlinEngine.updateIndex(apps)
        rustEngine?.updateIndex(apps)

        // Warmup: 1,000 queries
        for (i in 0 until 1_000) {
            val q = benchmarkQueries[i % benchmarkQueries.size]
            kotlinEngine.search(q, 50)
            rustEngine?.search(q, 50)
        }

        // Measure: 2,000 queries
        val kotlinStats = runBenchmark(kotlinEngine, 2_000)
        val rustStats = rustEngine?.let { runBenchmark(it, 2_000) }

        println("\n================================================================================")
        println("  SEARCH ENGINE BENCHMARK (500 APPS) - 2,000 MEASURED QUERIES")
        println("================================================================================")
        println(String.format("%-18s | %-10s | %-10s | %-10s | %-10s | %-10s", "Engine", "Mean (µs)", "P50 (µs)", "P95 (µs)", "P99 (µs)", "Max (µs)"))
        println("--------------------------------------------------------------------------------")
        println(String.format("%-18s | %10.2f | %10.2f | %10.2f | %10.2f | %10.2f", "Kotlin Engine", kotlinStats.meanUs, kotlinStats.p50Us, kotlinStats.p95Us, kotlinStats.p99Us, kotlinStats.maxUs))
        if (rustStats != null) {
            println(String.format("%-18s | %10.2f | %10.2f | %10.2f | %10.2f | %10.2f", "Rust (JNI) Engine", rustStats.meanUs, rustStats.p50Us, rustStats.p95Us, rustStats.p99Us, rustStats.maxUs))
        }
        println("================================================================================\n")

        // Hard constraint verification: keystroke -> results <= 1 ms (1,000 µs) for 500 apps
        assertTrue(
            "Kotlin engine must satisfy keystroke -> results <= 1.0 ms for 500 apps. Got: ${kotlinStats.meanUs} µs",
            kotlinStats.meanUs <= 1_000.0
        )
    }

    @Test
    fun benchmarkSearchEngines_2000Apps() {
        val apps = generateApps(2_000)
        kotlinEngine.updateIndex(apps)
        rustEngine?.updateIndex(apps)

        // Warmup: 1,000 queries
        for (i in 0 until 1_000) {
            val q = benchmarkQueries[i % benchmarkQueries.size]
            kotlinEngine.search(q, 50)
            rustEngine?.search(q, 50)
        }

        // Measure: 2,000 queries
        val kotlinStats = runBenchmark(kotlinEngine, 2_000)
        val rustStats = rustEngine?.let { runBenchmark(it, 2_000) }

        println("\n================================================================================")
        println("  SEARCH ENGINE BENCHMARK (2,000 APPS) - 2,000 MEASURED QUERIES")
        println("================================================================================")
        println(String.format("%-18s | %-10s | %-10s | %-10s | %-10s | %-10s", "Engine", "Mean (µs)", "P50 (µs)", "P95 (µs)", "P99 (µs)", "Max (µs)"))
        println("--------------------------------------------------------------------------------")
        println(String.format("%-18s | %10.2f | %10.2f | %10.2f | %10.2f | %10.2f", "Kotlin Engine", kotlinStats.meanUs, kotlinStats.p50Us, kotlinStats.p95Us, kotlinStats.p99Us, kotlinStats.maxUs))
        if (rustStats != null) {
            println(String.format("%-18s | %10.2f | %10.2f | %10.2f | %10.2f | %10.2f", "Rust (JNI) Engine", rustStats.meanUs, rustStats.p50Us, rustStats.p95Us, rustStats.p99Us, rustStats.maxUs))
        }
        println("================================================================================\n")
    }
}
