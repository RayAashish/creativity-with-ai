package com.antigravity.note.ui.dsa

import com.antigravity.note.library.model.TestCaseItem
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

data class DsaProblemDetails(
    val title: String,
    val difficulty: String?,
    val platform: String,
    val descriptionHtml: String,
    val testCases: List<TestCaseItem>,
    val hints: List<String> = emptyList()
)

object DsaProblemFetcher {

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val json = Json { ignoreUnknownKeys = true }

    suspend fun fetchProblem(url: String): Result<DsaProblemDetails> = withContext(Dispatchers.IO) {
        val trimmed = url.trim()
        try {
            when {
                trimmed.contains("leetcode.com") || trimmed.contains("leetcode.cn") -> {
                    fetchLeetCode(trimmed)
                }
                trimmed.contains("geeksforgeeks.org") -> {
                    fetchGeeksForGeeks(trimmed)
                }
                trimmed.contains("codeforces.com") -> {
                    fetchCodeforces(trimmed)
                }
                else -> {
                    fetchGenericUrl(trimmed)
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun extractLeetCodeSlug(url: String): String {
        val regex = Regex("problems/([^/?#]+)")
        val match = regex.find(url)
        return match?.groupValues?.get(1) ?: url.trim().removeSuffix("/").substringAfterLast("/")
    }

    private fun fetchLeetCode(url: String): Result<DsaProblemDetails> {
        val slug = extractLeetCodeSlug(url)
        // 1. Primary: Official LeetCode GraphQL Endpoint
        try {
            val queryBody = """
                {"query":"query questionData(${'$'}titleSlug: String!) { question(titleSlug: ${'$'}titleSlug) { questionId title difficulty content sampleTestCase exampleTestcaseList hints } }","variables":{"titleSlug":"$slug"}}
            """.trimIndent()

            val request = Request.Builder()
                .url("https://leetcode.com/graphql")
                .header("Content-Type", "application/json")
                .header("Referer", "https://leetcode.com")
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
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
                    val rawTestcases = question["exampleTestcaseList"]?.jsonArray?.map { it.jsonPrimitive.content } ?: emptyList()
                    val hintsList = question["hints"]?.jsonArray?.map { it.jsonPrimitive.content } ?: emptyList()

                    val numExamples = countExamples(content, rawTestcases.size)
                    val testCases = (1..maxOf(1, numExamples)).map { idx ->
                        TestCaseItem(id = idx, title = "Example $idx", input = "", output = "", isChecked = false)
                    }

                    return Result.success(
                        DsaProblemDetails(
                            title = title,
                            difficulty = difficulty,
                            platform = "LeetCode",
                            descriptionHtml = content,
                            testCases = testCases,
                            hints = hintsList
                        )
                    )
                }
            }
        } catch (_: Exception) {}

        // 2. Backup: Alfa LeetCode Proxy API
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
                val testCases = extractTestCasesFromHtml(content)
                return Result.success(
                    DsaProblemDetails(
                        title = title,
                        difficulty = difficulty,
                        platform = "LeetCode",
                        descriptionHtml = content,
                        testCases = testCases
                    )
                )
            }
        } catch (e: Exception) {
            return Result.failure(e)
        }

        return Result.failure(IllegalArgumentException("Could not retrieve problem details for slug: $slug"))
    }

    private fun extractGfgSlug(url: String): String {
        val regex = Regex("problems/([^/?#]+)")
        val match = regex.find(url)
        return match?.groupValues?.get(1) ?: url.trim().removeSuffix("/").substringAfterLast("/")
    }

    private fun fetchGeeksForGeeks(url: String): Result<DsaProblemDetails> {
        val slug = extractGfgSlug(url)
        val apiUrl = "https://practiceapi.geeksforgeeks.org/api/v1/problems/$slug/"
        val request = Request.Builder()
            .url(apiUrl)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
            .build()

        val response = httpClient.newCall(request).execute()
        if (!response.isSuccessful) {
            return Result.failure(IllegalStateException("GFG API responded with ${response.code}"))
        }

        val bodyStr = response.body?.string().orEmpty()
        val root = json.parseToJsonElement(bodyStr).jsonObject
        val results = root["results"]?.jsonObject ?: return Result.failure(IllegalStateException("Empty GFG results"))

        val title = results["problem_name"]?.jsonPrimitive?.content ?: slug.replace("-", " ").capitalizeWords()
        val difficulty = results["difficulty"]?.jsonPrimitive?.content ?: "Medium"
        val questionHtml = results["problem_question"]?.jsonPrimitive?.content.orEmpty()
        val numExamples = countExamples(questionHtml)
        val testCases = (1..maxOf(1, numExamples)).map { idx ->
            TestCaseItem(id = idx, title = "Example $idx", input = "", output = "", isChecked = false)
        }

        return Result.success(
            DsaProblemDetails(
                title = title,
                difficulty = difficulty,
                platform = "GeeksforGeeks",
                descriptionHtml = questionHtml,
                testCases = testCases
            )
        )
    }

    private fun fetchCodeforces(url: String): Result<DsaProblemDetails> {
        // Codeforces URL pattern: codeforces.com/problemset/problem/<contestId>/<index> or /contest/<contestId>/problem/<index>
        val regex = Regex("problem(?:set/problem|s)?/(\\d+)/([A-Za-z0-9]+)")
        val match = regex.find(url)
        val contestId = match?.groupValues?.get(1) ?: ""
        val index = match?.groupValues?.get(2)?.uppercase() ?: ""

        val fallbackTitle = if (contestId.isNotBlank() && index.isNotBlank()) "Codeforces $contestId$index" else "Codeforces Problem"
        val fallbackHtml = """
            <h3>Codeforces Problem $contestId$index</h3>
            <p><strong>URL:</strong> <a href="$url">$url</a></p>
            <p>Codeforces statements are protected by Cloudflare bot protection. You can read the statement directly using the link above, and trace your solution on this canvas.</p>
        """.trimIndent()

        val defaultTestCases = listOf(
            TestCaseItem(id = 1, title = "Example 1", input = "Standard Sample 1", output = "", isChecked = false),
            TestCaseItem(id = 2, title = "Example 2", input = "Standard Sample 2", output = "", isChecked = false)
        )

        return Result.success(
            DsaProblemDetails(
                title = fallbackTitle,
                difficulty = "Medium",
                platform = "Codeforces",
                descriptionHtml = fallbackHtml,
                testCases = defaultTestCases
            )
        )
    }

    private fun fetchGenericUrl(url: String): Result<DsaProblemDetails> {
        val request = Request.Builder()
            .url(url)
            .header("User-Agent", "Mozilla/5.0")
            .build()
        val response = httpClient.newCall(request).execute()
        if (!response.isSuccessful) {
            return Result.failure(IllegalStateException("Failed fetching URL: ${response.code}"))
        }

        val body = response.body?.string().orEmpty()
        val titleMatch = Regex("<title>([^<]+)</title>", RegexOption.IGNORE_CASE).find(body)
        val title = titleMatch?.groupValues?.get(1)?.trim() ?: "DSA Problem"
        val testCases = extractTestCasesFromHtml(body)

        val cleanBody = if (body.length > 50000) body.substring(0, 50000) else body
        return Result.success(
            DsaProblemDetails(
                title = title,
                difficulty = "Medium",
                platform = "Web",
                descriptionHtml = cleanBody,
                testCases = testCases
            )
        )
    }

    private fun parseLeetCodeTestCases(contentHtml: String, rawTestCases: List<String>): List<TestCaseItem> {
        val htmlCases = extractTestCasesFromHtml(contentHtml)
        if (htmlCases.isNotEmpty()) return htmlCases

        if (rawTestCases.isNotEmpty()) {
            return rawTestCases.mapIndexed { idx, raw ->
                val formattedInput = raw.replace("\n", ", ")
                TestCaseItem(
                    id = idx + 1,
                    title = "Testcase ${idx + 1}",
                    input = formattedInput,
                    output = "",
                    isChecked = false
                )
            }
        }

        return listOf(
            TestCaseItem(1, "Testcase 1", "Sample input", "Expected output", false),
            TestCaseItem(2, "Testcase 2", "Sample input", "Expected output", false)
        )
    }

    fun extractTestCasesFromHtml(html: String): List<TestCaseItem> {
        val result = mutableListOf<TestCaseItem>()
        // Pattern looking for Example 1, Input: ..., Output: ...
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
                val caseTitle = if (!numStr.isNullOrBlank()) "Testcase $numStr" else "Testcase $count"
                result.add(
                    TestCaseItem(
                        id = count,
                        title = caseTitle,
                        input = input,
                        output = output,
                        isChecked = false
                    )
                )
                count++
            }
        }

        if (result.isEmpty()) {
            // Check for pre blocks with inputs
            val prePattern = Pattern.compile("<pre>([\\s\\S]*?)</pre>", Pattern.CASE_INSENSITIVE)
            val preMatcher = prePattern.matcher(html)
            var pCount = 1
            while (preMatcher.find() && pCount <= 5) {
                val preContent = preMatcher.group(1).orEmpty().replace(Regex("<[^>]+>"), " ").trim()
                if (preContent.contains("Input", ignoreCase = true)) {
                    val inputLine = Regex("Input:?\\s*([^\n]+)", RegexOption.IGNORE_CASE).find(preContent)?.groupValues?.get(1)?.trim() ?: preContent
                    val outputLine = Regex("Output:?\\s*([^\n]+)", RegexOption.IGNORE_CASE).find(preContent)?.groupValues?.get(1)?.trim() ?: ""
                    result.add(
                        TestCaseItem(
                            id = pCount,
                            title = "Testcase $pCount",
                            input = inputLine,
                            output = outputLine,
                            isChecked = false
                        )
                    )
                    pCount++
                }
            }
        }

        return result
    }

    fun countExamples(html: String, rawCount: Int = 0): Int {
        if (rawCount > 0) return rawCount
        val regex = Regex("Example\\s*\\d+", RegexOption.IGNORE_CASE)
        val matches = regex.findAll(html).count()
        return if (matches > 0) matches else 3
    }

    private fun String.capitalizeWords(): String =
        split(" ").joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
}
