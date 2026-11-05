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

class GeeksforGeeksProblemProvider(
    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()
) : ProblemFetcherProvider {

    private val json = Json { ignoreUnknownKeys = true }

    override fun canHandle(url: String): Boolean {
        return url.lowercase().contains("geeksforgeeks.org")
    }

    override suspend fun fetch(url: String): Result<ProblemDescription> = withContext(Dispatchers.IO) {
        val slug = extractSlug(url)
        val apiUrl = "https://practiceapi.geeksforgeeks.org/api/v1/problems/$slug/"

        try {
            val request = Request.Builder()
                .url(apiUrl)
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(IllegalStateException("GFG API HTTP ${response.code}"))
            }

            val bodyStr = response.body?.string().orEmpty()
            val root = json.parseToJsonElement(bodyStr).jsonObject
            val results = root["results"]?.jsonObject
                ?: return@withContext Result.failure(IllegalStateException("Empty GFG results"))

            val title = results["problem_name"]?.jsonPrimitive?.content ?: slug.replace("-", " ").capitalizeWords()
            val rawDiff = results["difficulty"]?.jsonPrimitive?.content ?: "Medium"
            val difficulty = rawDiff.lowercase().replaceFirstChar { it.uppercase() }
            val questionHtml = results["problem_question"]?.jsonPrimitive?.content.orEmpty()

            val examples = parseExamples(questionHtml)

            Result.success(
                ProblemDescription(
                    title = title,
                    source = ProblemSource.GEEKSFORGEEKS,
                    htmlOrMarkdownBody = questionHtml,
                    difficulty = difficulty,
                    tags = emptyList(),
                    constraints = extractConstraints(questionHtml),
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
        val regex = Regex("problems/([^/?#]+)")
        val match = regex.find(url)
        return match?.groupValues?.get(1) ?: url.trim().removeSuffix("/").substringAfterLast("/")
    }

    private fun parseExamples(html: String): List<ExampleCase> {
        val cases = mutableListOf<ExampleCase>()
        val pattern = Pattern.compile(
            "(?:Example\\s*(\\d+)[^:]*?:?)?[\\s\\S]*?Input:?\\s*([^\n<]+)[\\s\\S]*?Output:?\\s*([^\n<]+)",
            Pattern.CASE_INSENSITIVE
        )
        val matcher = pattern.matcher(html)
        var count = 1
        while (matcher.find() && count <= 8) {
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

    private fun extractConstraints(html: String): List<String> {
        val constraints = mutableListOf<String>()
        val match = Regex("(?i)Constraints?:?\\s*</strong>([\\s\\S]*?)(?:<p|$)").find(html)
        if (match != null) {
            val text = match.groupValues[1].replace(Regex("<[^>]+>"), "\n")
            text.lines().forEach { line ->
                val tr = line.trim()
                if (tr.isNotBlank() && tr.length < 80) constraints.add(tr)
            }
        }
        return constraints
    }

    private fun String.capitalizeWords(): String =
        split(" ").joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
}
