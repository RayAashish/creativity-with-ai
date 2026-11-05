package com.antigravity.note.ui.dsa.fetcher

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

class HackerRankProblemProvider(
    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()
) : ProblemFetcherProvider {

    private val json = Json { ignoreUnknownKeys = true }

    override fun canHandle(url: String): Boolean {
        return url.lowercase().contains("hackerrank.com")
    }

    override suspend fun fetch(url: String): Result<ProblemDescription> = withContext(Dispatchers.IO) {
        val slug = extractSlug(url)
        if (slug.isBlank()) {
            return@withContext Result.failure(IllegalArgumentException("Could not extract HackerRank challenge slug from: $url"))
        }

        try {
            val apiUrl = "https://www.hackerrank.com/rest/contests/master/challenges/$slug"
            val request = Request.Builder()
                .url(apiUrl)
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .header("Accept", "application/json")
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(IllegalStateException("HackerRank API responded with HTTP ${response.code}"))
            }

            val bodyStr = response.body?.string().orEmpty()
            val root = json.parseToJsonElement(bodyStr).jsonObject
            val model = root["model"]?.jsonObject
                ?: return@withContext Result.failure(IllegalStateException("Empty model in HackerRank challenge response"))

            val title = model["name"]?.jsonPrimitive?.content ?: slug.replace("-", " ").capitalizeWords()
            val rawDiff = model["difficulty_name"]?.jsonPrimitive?.content ?: "Medium"
            val difficulty = rawDiff.lowercase().replaceFirstChar { it.uppercase() }

            val bodyHtml = model["body_html"]?.jsonPrimitive?.content
                ?: model["body"]?.jsonPrimitive?.content
                ?: model["problem_statement"]?.jsonPrimitive?.content.orEmpty()

            val examples = parseExamples(bodyHtml)

            Result.success(
                ProblemDescription(
                    title = title,
                    source = ProblemSource.HACKERRANK,
                    htmlOrMarkdownBody = bodyHtml,
                    difficulty = difficulty,
                    tags = emptyList(),
                    constraints = extractConstraints(bodyHtml),
                    examples = examples,
                    hints = emptyList(),
                    sourceUrl = url
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun extractSlug(url: String): String {
        val regex = Regex("challenges/([^/?#]+)")
        val match = regex.find(url)
        return match?.groupValues?.get(1) ?: url.trim().removeSuffix("/").substringAfterLast("/")
    }

    private fun parseExamples(html: String): List<ExampleCase> {
        val cases = mutableListOf<ExampleCase>()
        val pattern = Pattern.compile(
            "(?:Sample\\s*Input(?:\\s*(\\d+))?)[\\s\\S]*?<pre>([\\s\\S]*?)</pre>[\\s\\S]*?(?:Sample\\s*Output(?:\\s*\\d+)?)[\\s\\S]*?<pre>([\\s\\S]*?)</pre>",
            Pattern.CASE_INSENSITIVE
        )
        val matcher = pattern.matcher(html)
        var count = 1
        while (matcher.find() && count <= 8) {
            val numStr = matcher.group(1)
            val input = matcher.group(2)?.replace(Regex("<[^>]+>"), "")?.trim().orEmpty()
            val output = matcher.group(3)?.replace(Regex("<[^>]+>"), "")?.trim().orEmpty()
            if (input.isNotBlank()) {
                val caseTitle = if (!numStr.isNullOrBlank()) "Sample $numStr" else "Sample $count"
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

    private fun extractConstraints(html: String): List<String> {
        val constraints = mutableListOf<String>()
        val match = Regex("(?i)Constraints[\\s\\S]*?<ul>([\\s\\S]*?)</ul>").find(html)
        if (match != null) {
            Regex("<li>([\\s\\S]*?)</li>").findAll(match.groupValues[1]).forEach { item ->
                val clean = item.groupValues[1].replace(Regex("<[^>]+>"), "").trim()
                if (clean.isNotBlank()) constraints.add(clean)
            }
        }
        return constraints
    }

    private fun String.capitalizeWords(): String =
        split(" ").joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
}
