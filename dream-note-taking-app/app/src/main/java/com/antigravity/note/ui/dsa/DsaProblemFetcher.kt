package com.antigravity.note.ui.dsa

import com.antigravity.note.library.model.TestCaseItem
import com.antigravity.note.ui.dsa.fetcher.CompositeProblemFetcher
import com.antigravity.note.ui.dsa.fetcher.ProblemSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.regex.Pattern

data class DsaProblemDetails(
    val title: String,
    val difficulty: String?,
    val platform: String,
    val descriptionHtml: String,
    val testCases: List<TestCaseItem>,
    val hints: List<String> = emptyList(),
    val source: ProblemSource? = null,
    val tags: List<String> = emptyList()
)

object DsaProblemFetcher {

    val compositeFetcher = CompositeProblemFetcher()

    suspend fun fetchProblem(url: String): Result<DsaProblemDetails> = withContext(Dispatchers.IO) {
        val trimmed = url.trim()
        val result = compositeFetcher.fetchProblem(trimmed)
        result.map { desc ->
            DsaProblemDetails(
                title = desc.title,
                difficulty = desc.difficulty,
                platform = desc.source.displayName,
                descriptionHtml = desc.htmlOrMarkdownBody,
                testCases = desc.toTestCases(),
                hints = desc.hints,
                source = desc.source,
                tags = desc.tags
            )
        }
    }

    fun extractTestCasesFromHtml(html: String): List<TestCaseItem> {
        val result = mutableListOf<TestCaseItem>()
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
}
