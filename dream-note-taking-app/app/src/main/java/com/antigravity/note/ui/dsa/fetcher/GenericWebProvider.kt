package com.antigravity.note.ui.dsa.fetcher

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

class GenericWebProvider(
    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(12, TimeUnit.SECONDS)
        .build()
) : ProblemFetcherProvider {

    override fun canHandle(url: String): Boolean = true // Catch-all fallback

    override suspend fun fetch(url: String): Result<ProblemDescription> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(url)
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(IllegalStateException("HTTP ${response.code} loading $url"))
            }

            val body = response.body?.string().orEmpty()
            val titleMatch = Regex("<title>([^<]+)</title>", RegexOption.IGNORE_CASE).find(body)
            val title = titleMatch?.groupValues?.get(1)?.trim() ?: "Web Problem Statement"

            // Extract main content / article
            val articleHtml = extractMainArticle(body)
            val examples = parseExamples(articleHtml)

            Result.success(
                ProblemDescription(
                    title = title,
                    source = ProblemSource.GENERIC,
                    htmlOrMarkdownBody = articleHtml,
                    difficulty = "Medium",
                    tags = listOf("Web"),
                    constraints = emptyList(),
                    examples = examples,
                    hints = emptyList(),
                    sourceUrl = url
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun extractMainArticle(html: String): String {
        // Look for <article>, <main>, or .problem-statement
        val articleMatch = Regex("(?i)<(?:article|main)[^>]*>([\\s\\S]*?)</(?:article|main)>").find(html)
        if (articleMatch != null) {
            return sanitize(articleMatch.groupValues[1])
        }

        // Look for body
        val bodyMatch = Regex("(?i)<body[^>]*>([\\s\\S]*?)</body>").find(html)
        val raw = bodyMatch?.groupValues?.get(1) ?: html
        return sanitize(raw)
    }

    private fun sanitize(content: String): String {
        var clean = content.replace(Regex("(?i)<script[^>]*>[\\s\\S]*?</script>"), "")
        clean = clean.replace(Regex("(?i)<style[^>]*>[\\s\\S]*?</style>"), "")
        clean = clean.replace(Regex("(?i)<nav[^>]*>[\\s\\S]*?</nav>"), "")
        clean = clean.replace(Regex("(?i)<footer[^>]*>[\\s\\S]*?</footer>"), "")
        clean = clean.replace(Regex("(?i)<header[^>]*>[\\s\\S]*?</header>"), "")
        return if (clean.length > 50000) clean.substring(0, 50000) else clean
    }

    private fun parseExamples(html: String): List<ExampleCase> {
        val cases = mutableListOf<ExampleCase>()
        val pattern = Pattern.compile(
            "(?:Example\\s*(\\d+)[^:]*?:?)?[\\s\\S]*?Input:?\\s*([^\n<]+)[\\s\\S]*?Output:?\\s*([^\n<]+)",
            Pattern.CASE_INSENSITIVE
        )
        val matcher = pattern.matcher(html)
        var count = 1
        while (matcher.find() && count <= 5) {
            val numStr = matcher.group(1)
            val input = matcher.group(2)?.trim().orEmpty()
            val output = matcher.group(3)?.trim().orEmpty()
            if (input.isNotBlank()) {
                val caseTitle = if (!numStr.isNullOrBlank()) "Example $numStr" else "Example $count"
                cases.add(
                    ExampleCase(
                        id = count,
                        title = caseTitle,
                        input = input,
                        output = output
                    )
                )
                count++
            }
        }
        return cases
    }
}
