package com.antigravity.note.ui.dsa.fetcher

interface ProblemFetcherProvider {
    fun canHandle(url: String): Boolean
    suspend fun fetch(url: String): Result<ProblemDescription>
}
