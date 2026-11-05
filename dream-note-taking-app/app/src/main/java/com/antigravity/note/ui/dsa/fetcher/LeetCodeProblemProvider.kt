package com.antigravity.note.ui.dsa.fetcher

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

class LeetCodeProblemProvider(
    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()
) : ProblemFetcherProvider {

    private val json = Json { ignoreUnknownKeys = true }

    override fun canHandle(url: String): Boolean {
        val lower = url.lowercase()
        return lower.contains("leetcode.com") || lower.contains("leetcode.cn")
    }

    override suspend fun fetch(url: String): Result<ProblemDescription> = withContext(Dispatchers.IO) {
        val slug = extractSlug(url)
        if (slug.isBlank()) {
            return@withContext Result.failure(IllegalArgumentException("Could not extract LeetCode slug: $url"))
        }

        // 1. Primary: Official LeetCode GraphQL Endpoint
        try {
            val queryBody = """
                {"query":"query questionData(${'$'}titleSlug: String!) { question(titleSlug: ${'$'}titleSlug) { questionId title difficulty content sampleTestCase exampleTestcaseList hints topicTags { name } } }","variables":{"titleSlug":"$slug"}}
            """.trimIndent()

            val request = Request.Builder()
                .url("https://leetcode.com/graphql")
                .header("Content-Type", "application/json")
                .header("Referer", "https://leetcode.com")
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .post(queryBody.toRequestBody("application/json".toMediaType()))
                .build()

            val response = httpClient.newCall(request).execute()
            if (response.isSuccessful) {
                val bodyStr = response.body?.string().orEmpty()
                val root = json.parseToJsonElement(bodyStr).jsonObject
                val data = root["data"]?.jsonObject
                val question = data?.get("question")?.jsonObject
                if (question != null) {
                    val title = question["title"]?.jsonPrimitive?.content ?: slug.replace("-", " ").capitalizeWords()
                    val difficulty = question["difficulty"]?.jsonPrimitive?.content ?: "Medium"
                    val content = question["content"]?.jsonPrimitive?.content.orEmpty()
                    val hintsList = question["hints"]?.jsonArray?.map { it.jsonPrimitive.content } ?: emptyList()

                    val tags = mutableListOf<String>()
                    question["topicTags"]?.jsonArray?.forEach { tagElem ->
                        tagElem.jsonObject["name"]?.jsonPrimitive?.content?.let { tags.add(it) }
                    }

                    val examples = parseExamplesFromHtml(content)

                    return@withContext Result.success(
                        ProblemDescription(
                            title = title,
                            source = ProblemSource.LEETCODE,
                            htmlOrMarkdownBody = content,
                            difficulty = difficulty,
                            tags = tags,
                            constraints = extractConstraints(content),
                            examples = examples,
                            hints = hintsList,
                            sourceUrl = url
                        )
                    )
                }
            }
        } catch (_: Exception) {}

        // 2. Backup: Alfa LeetCode Proxy
        try {
            val fallbackUrl = "https://alfa-leetcode-api.onrender.com/select?titleSlug=$slug"
            val request = Request.Builder()
                .url(fallbackUrl)
                .header("User-Agent", "Mozilla/5.0")
                .build()

            val response = httpClient.newCall(request).execute()
            if (response.isSuccessful) {
                val bodyStr = response.body?.string().orEmpty()
                val root = json.parseToJsonElement(bodyStr).jsonObject
                val title = root["questionTitle"]?.jsonPrimitive?.content ?: slug.replace("-", " ").capitalizeWords()
                val difficulty = root["difficulty"]?.jsonPrimitive?.content ?: "Medium"
                val content = root["question"]?.jsonPrimitive?.content.orEmpty()
                val examples = parseExamplesFromHtml(content)

                return@withContext Result.success(
                    ProblemDescription(
                        title = title,
                        source = ProblemSource.LEETCODE,
                        htmlOrMarkdownBody = content,
                        difficulty = difficulty,
                        tags = emptyList(),
                        constraints = extractConstraints(content),
                        examples = examples,
                        hints = emptyList(),
                        sourceUrl = url
                    )
                )
            }
        } catch (e: Exception) {
            return@withContext Result.failure(e)
        }

        Result.failure(IllegalArgumentException("Could not retrieve LeetCode details for slug: $slug"))
    }

    private fun extractSlug(url: String): String {
        val regex = Regex("problems/([^/?#]+)")
        val match = regex.find(url)
        return match?.groupValues?.get(1) ?: url.trim().removeSuffix("/").substringAfterLast("/")
    }

    private fun parseExamplesFromHtml(html: String): List<ExampleCase> {
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
        val regex = Regex("(?i)Constraints?:?\\s*</strong>\\s*<ul>([\\s\\S]*?)</ul>")
        val match = regex.find(html)
        if (match != null) {
            val items = Regex("<li>([\\s\\S]*?)</li>").findAll(match.groupValues[1])
            items.forEach { item ->
                val clean = item.groupValues[1].replace(Regex("<[^>]+>"), "").trim()
                if (clean.isNotBlank()) constraints.add(clean)
            }
        }
        return constraints
    }

    private fun String.capitalizeWords(): String =
        split(" ").joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
}
