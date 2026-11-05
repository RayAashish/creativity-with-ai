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

class CodeforcesProblemProvider(
    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()
) : ProblemFetcherProvider {

    private val json = Json { ignoreUnknownKeys = true }

    override fun canHandle(url: String): Boolean {
        return url.lowercase().contains("codeforces.com")
    }

    override suspend fun fetch(url: String): Result<ProblemDescription> = withContext(Dispatchers.IO) {
        val regex = Regex("problem(?:set/problem|s)?/(\\d+)/([A-Za-z0-9]+)")
        val match = regex.find(url)
        val contestId = match?.groupValues?.get(1)?.toIntOrNull()
        val index = match?.groupValues?.get(2)?.uppercase()

        var title = if (contestId != null && index != null) "Codeforces $contestId$index" else "Codeforces Problem"
        var difficulty = "Medium"
        val tags = mutableListOf<String>()

        try {
            // Query Codeforces API problemset.problems
            val apiUrl = "https://codeforces.com/api/problemset.problems"
            val request = Request.Builder().url(apiUrl).header("User-Agent", "Mozilla/5.0").build()
            val response = httpClient.newCall(request).execute()
            if (response.isSuccessful) {
                val bodyStr = response.body?.string().orEmpty()
                val root = json.parseToJsonElement(bodyStr).jsonObject
                val probs = root["result"]?.jsonObject?.get("problems")?.jsonArray
                if (probs != null && contestId != null && index != null) {
                    val found = probs.find { elem ->
                        val obj = elem.jsonObject
                        obj["contestId"]?.jsonPrimitive?.content?.toIntOrNull() == contestId &&
                                obj["index"]?.jsonPrimitive?.content?.equals(index, ignoreCase = true) == true
                    }
                    if (found != null) {
                        val obj = found.jsonObject
                        val probName = obj["name"]?.jsonPrimitive?.content
                        if (!probName.isNullOrBlank()) {
                            title = "$contestId$index - $probName"
                        }
                        val rating = obj["rating"]?.jsonPrimitive?.content?.toIntOrNull()
                        difficulty = when {
                            rating == null -> "Medium"
                            rating < 1300 -> "Easy"
                            rating < 1800 -> "Medium"
                            else -> "Hard"
                        }
                        obj["tags"]?.jsonArray?.forEach { tagElem ->
                            tags.add(tagElem.jsonPrimitive.content)
                        }
                    }
                }
            }
        } catch (_: Exception) {}

        val statementHtml = buildString {
            append("<h3>$title</h3>")
            append("<p><strong>Codeforces Link:</strong> <a href='$url'>$url</a></p>")
            if (tags.isNotEmpty()) {
                append("<p><strong>Tags:</strong> ${tags.joinToString(", ")}</p>")
            }
            append("<div style='background: #2b2b30; padding: 12px; border-radius: 8px; margin-top: 12px;'>")
            append("<p>Codeforces statements use Cloudflare bot verification for raw HTML. You can view the problem statement directly from the URL above and trace sample executions below.</p>")
            append("</div>")
        }

        val examples = listOf(
            ExampleCase(1, "Sample 1", "Standard input 1", "Expected output 1"),
            ExampleCase(2, "Sample 2", "Standard input 2", "Expected output 2")
        )

        Result.success(
            ProblemDescription(
                title = title,
                source = ProblemSource.CODEFORCES,
                htmlOrMarkdownBody = statementHtml,
                difficulty = difficulty,
                tags = tags,
                constraints = emptyList(),
                examples = examples,
                hints = emptyList(),
                sourceUrl = url
            )
        )
    }
}
