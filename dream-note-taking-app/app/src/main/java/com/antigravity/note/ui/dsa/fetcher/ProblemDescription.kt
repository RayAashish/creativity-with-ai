package com.antigravity.note.ui.dsa.fetcher

import com.antigravity.note.library.model.TestCaseItem

data class ExampleCase(
    val id: Int,
    val title: String,
    val input: String,
    val output: String,
    val explanation: String = ""
)

data class ProblemDescription(
    val title: String,
    val source: ProblemSource,
    val htmlOrMarkdownBody: String,
    val difficulty: String?,
    val tags: List<String> = emptyList(),
    val constraints: List<String> = emptyList(),
    val examples: List<ExampleCase> = emptyList(),
    val hints: List<String> = emptyList(),
    val sourceUrl: String
) {
    fun toTestCases(): List<TestCaseItem> {
        if (examples.isNotEmpty()) {
            return examples.map { ex ->
                TestCaseItem(
                    id = ex.id,
                    title = ex.title,
                    input = ex.input,
                    output = ex.output,
                    isChecked = false
                )
            }
        }
        return listOf(
            TestCaseItem(1, "Case 1", "", "", false),
            TestCaseItem(2, "Case 2", "", "", false),
            TestCaseItem(3, "Case 3", "", "", false)
        )
    }
}
