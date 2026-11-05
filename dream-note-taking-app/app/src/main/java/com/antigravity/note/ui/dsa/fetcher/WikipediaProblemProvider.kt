package com.antigravity.note.ui.dsa.fetcher

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

class WikipediaProblemProvider(
    private val httpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()
) : ProblemFetcherProvider {

    private val json = Json { ignoreUnknownKeys = true }

    override fun canHandle(url: String): Boolean {
        return url.lowercase().contains("wikipedia.org/wiki/")
    }

    override suspend fun fetch(url: String): Result<ProblemDescription> = withContext(Dispatchers.IO) {
        val topicSlug = url.substringAfter("wiki/").substringBefore("?").substringBefore("#")
        if (topicSlug.isBlank()) {
            return@withContext Result.failure(IllegalArgumentException("Could not extract Wikipedia topic from: $url"))
        }

        try {
            val encodedTitle = URLEncoder.encode(topicSlug, "UTF-8")
            // Fetch clean HTML content
            val htmlUrl = "https://en.wikipedia.org/api/rest_v1/page/html/$encodedTitle"
            val request = Request.Builder()
                .url(htmlUrl)
                .header("User-Agent", "InkFlow-NoteTaking/1.0 (Android; contact@inkflow.app)")
                .build()

            val response = httpClient.newCall(request).execute()
            if (response.isSuccessful) {
                val fullHtml = response.body?.string().orEmpty()
                val displayTitle = topicSlug.replace("_", " ")

                val cleanHtml = sanitizeWikipediaHtml(fullHtml)

                return@withContext Result.success(
                    ProblemDescription(
                        title = displayTitle,
                        source = ProblemSource.WIKIPEDIA,
                        htmlOrMarkdownBody = cleanHtml,
                        difficulty = "Concept",
                        tags = listOf("Wikipedia", "Concept"),
                        constraints = emptyList(),
                        examples = emptyList(),
                        hints = emptyList(),
                        sourceUrl = url
                    )
                )
            }

            // Fallback: Page summary endpoint
            val summaryUrl = "https://en.wikipedia.org/api/rest_v1/page/summary/$encodedTitle"
            val summaryReq = Request.Builder()
                .url(summaryUrl)
                .header("User-Agent", "InkFlow-NoteTaking/1.0 (Android; contact@inkflow.app)")
                .build()

            val sumResponse = httpClient.newCall(summaryReq).execute()
            if (sumResponse.isSuccessful) {
                val sumBody = sumResponse.body?.string().orEmpty()
                val root = json.parseToJsonElement(sumBody).jsonObject
                val title = root["title"]?.jsonPrimitive?.content ?: topicSlug.replace("_", " ")
                val extract = root["extract"]?.jsonPrimitive?.content.orEmpty()
                val extractHtml = root["extract_html"]?.jsonPrimitive?.content ?: "<p>$extract</p>"

                return@withContext Result.success(
                    ProblemDescription(
                        title = title,
                        source = ProblemSource.WIKIPEDIA,
                        htmlOrMarkdownBody = extractHtml,
                        difficulty = "Concept",
                        tags = listOf("Wikipedia", "Overview"),
                        constraints = emptyList(),
                        examples = emptyList(),
                        hints = emptyList(),
                        sourceUrl = url
                    )
                )
            }

            Result.failure(IllegalStateException("Wikipedia API returned HTTP ${response.code}"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun sanitizeWikipediaHtml(rawHtml: String): String {
        // Strip heavy navigation headers, metadata tables, edit links
        var cleaned = rawHtml.replace(Regex("(?i)<link[^>]*>"), "")
        cleaned = cleaned.replace(Regex("(?i)<style[^>]*>[\\s\\S]*?</style>"), "")
        cleaned = cleaned.replace(Regex("(?i)<script[^>]*>[\\s\\S]*?</script>"), "")
        cleaned = cleaned.replace(Regex("(?i)<table class=\"(?:metadata|navbox|infobox)[^\"]*\"[\\s\\S]*?</table>"), "")
        // Cap to reasonable length for fluid in-window rendering
        return if (cleaned.length > 80000) cleaned.substring(0, 80000) + "<p><em>[Article truncated for smooth canvas performance]</em></p>" else cleaned
    }
}
