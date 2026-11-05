package com.antigravity.note.ui.dsa.fetcher

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

class Code360ProblemProvider(
    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()
) : ProblemFetcherProvider {

    private val json = Json { ignoreUnknownKeys = true }

    override fun canHandle(url: String): Boolean {
        val lower = url.lowercase()
        return lower.contains("naukri.com/code360") ||
                lower.contains("codingninjas.com") ||
                lower.contains("codestudio")
    }

    override suspend fun fetch(url: String): Result<ProblemDescription> = withContext(Dispatchers.IO) {
        val slug = extractSlug(url)
        if (slug.isBlank()) {
            return@withContext Result.failure(IllegalArgumentException("Could not extract problem slug from Code360 URL: $url"))
        }

        try {
            val apiUrl = "https://api.codingninjas.com/api/v3/public_section/problem_detail?slug=$slug"
            val request = Request.Builder()
                .url(apiUrl)
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .header("Accept", "application/json")
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(
                    IllegalStateException("Code360 API responded with HTTP ${response.code}")
                )
            }

            val bodyStr = response.body?.string().orEmpty()
            val root = json.parseToJsonElement(bodyStr).jsonObject
            val data = root["data"]?.jsonObject
                ?: return@withContext Result.failure(IllegalStateException("Empty data payload from Code360 API"))

            val offering = data["offering"]?.jsonObject
            val problem = data["offerable"]?.jsonObject?.get("problem")?.jsonObject

            val title = problem?.get("name")?.jsonPrimitive?.content
                ?: offering?.get("name")?.jsonPrimitive?.content
                ?: slug.substringBefore("_").replace("-", " ").capitalizeWords()

            val rawDifficulty = problem?.get("difficulty")?.jsonPrimitive?.content ?: "MEDIUM"
            val difficulty = rawDifficulty.lowercase().replaceFirstChar { it.uppercase() }

            val descriptionHtml = problem?.get("description")?.jsonPrimitive?.content.orEmpty()
            val sampleTestcaseHtml = problem?.get("sample_testcase")?.jsonPrimitive?.content.orEmpty()

            val examples = parseExamplesFromSampleTestcase(sampleTestcaseHtml)
            val hints = parseHintsFromText(sampleTestcaseHtml)

            val tags = mutableListOf<String>()
            problem?.get("practice_topics")?.jsonArray?.forEach { topicElem ->
                try {
                    when (topicElem) {
                        is kotlinx.serialization.json.JsonPrimitive -> tags.add(topicElem.content)
                        is kotlinx.serialization.json.JsonObject -> topicElem["name"]?.jsonPrimitive?.content?.let { tags.add(it) }
                        else -> {}
                    }
                } catch (_: Exception) {}
            }

            // Combine problem statement and sample testcase HTML into full styled document
            val fullBody = buildString {
                append(descriptionHtml)
                if (sampleTestcaseHtml.isNotBlank()) {
                    append("<br/><hr style='border: 0.5px solid #444; margin: 16px 0;'/>")
                    append(sampleTestcaseHtml)
                }
            }

            Result.success(
                ProblemDescription(
                    title = title,
                    source = ProblemSource.CODE360,
                    htmlOrMarkdownBody = fullBody,
                    difficulty = difficulty,
                    tags = tags,
                    constraints = extractConstraints(descriptionHtml),
                    examples = examples,
                    hints = hints,
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

    private fun parseExamplesFromSampleTestcase(html: String): List<ExampleCase> {
        val cases = mutableListOf<ExampleCase>()
        // Pattern matches Sample Input 1 ... Sample Output 1 ... (optional Explanation)
        val inputPattern = Pattern.compile(
            "Sample Input (\\d+)[^<]*?:?\\s*</h5>\\s*<pre><code>([\\s\\S]*?)</code></pre>",
            Pattern.CASE_INSENSITIVE
        )
        val outputPattern = Pattern.compile(
            "Sample Output (\\d+)[^<]*?:?\\s*</h5>\\s*<pre><code>([\\s\\S]*?)</code></pre>",
            Pattern.CASE_INSENSITIVE
        )

        val inputMap = mutableMapOf<Int, String>()
        val outputMap = mutableMapOf<Int, String>()

        val inputMatcher = inputPattern.matcher(html)
        while (inputMatcher.find()) {
            val num = inputMatcher.group(1)?.toIntOrNull() ?: continue
            val input = inputMatcher.group(2)?.trim().orEmpty()
            inputMap[num] = input
        }

        val outputMatcher = outputPattern.matcher(html)
        while (outputMatcher.find()) {
            val num = outputMatcher.group(1)?.toIntOrNull() ?: continue
            val output = outputMatcher.group(2)?.trim().orEmpty()
            outputMap[num] = output
        }

        for ((id, input) in inputMap) {
            val output = outputMap[id].orEmpty()
            cases.add(
                ExampleCase(
                    id = id,
                    title = "Example $id",
                    input = input,
                    output = output
                )
            )
        }

        return cases
    }

    private fun parseHintsFromText(html: String): List<String> {
        val hints = mutableListOf<String>()
        val hintRegex = Regex("(?i)Hints?:?\\s*</h5>\\s*<pre><code>([\\s\\S]*?)</code></pre>")
        val match = hintRegex.find(html)
        if (match != null) {
            val block = match.groupValues[1]
            block.lines().forEach { line ->
                val cleaned = line.replace(Regex("^\\d+\\.\\s*"), "").trim()
                if (cleaned.isNotBlank()) {
                    hints.add(cleaned)
                }
            }
        }
        return hints
    }

    private fun extractConstraints(html: String): List<String> {
        val constraints = mutableListOf<String>()
        val regex = Regex("(?i)Constraints?:?\\s*</h5>\\s*([\\s\\S]*?)(?:<h\\d|$)")
        val match = regex.find(html)
        if (match != null) {
            val content = match.groupValues[1].replace(Regex("<[^>]+>"), "\n")
            content.lines().forEach { line ->
                val trimmed = line.trim()
                if (trimmed.isNotBlank() && trimmed.length < 80) {
                    constraints.add(trimmed)
                }
            }
        }
        return constraints
    }

    private fun String.capitalizeWords(): String =
        split(" ").joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
}
