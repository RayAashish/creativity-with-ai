package com.antigravity.note.ui.dsa.fetcher

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CompositeProblemFetcher(
    val providers: List<ProblemFetcherProvider> = listOf(
        LeetCodeProblemProvider(),
        Code360ProblemProvider(),
        GeeksforGeeksProblemProvider(),
        CodeforcesProblemProvider(),
        HackerRankProblemProvider(),
        WikipediaProblemProvider(),
        GenericWebProvider()
    )
) {
    fun getProviderForUrl(url: String): ProblemFetcherProvider {
        val trimmed = url.trim()
        return providers.firstOrNull { it.canHandle(trimmed) }
            ?: providers.first { it is GenericWebProvider }
    }

    suspend fun fetchProblem(url: String): Result<ProblemDescription> = withContext(Dispatchers.IO) {
        val trimmed = url.trim()
        if (trimmed.isBlank()) {
            return@withContext Result.failure(IllegalArgumentException("URL is blank"))
        }
        val provider = getProviderForUrl(trimmed)
        provider.fetch(trimmed)
    }
}
