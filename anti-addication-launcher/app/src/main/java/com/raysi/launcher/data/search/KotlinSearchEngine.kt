// app/src/main/java/com/raysi/launcher/data/search/KotlinSearchEngine.kt
package com.raysi.launcher.data.search

import com.raysi.launcher.data.model.AppInfo
import java.util.Locale
import kotlin.math.abs
import kotlin.math.min

/**
 * Pure-Kotlin high-performance search engine.
 * Implements:
 * 1. Exact prefix matching (highest rank)
 * 2. Word boundary prefix matching
 * 3. Subsequence matching (acronym / initials / mid-word)
 * 4. Damerau-Levenshtein edit distance <= 2 (transposition, insertion, deletion, substitution)
 *
 * Performance optimizations:
 * - Pre-computes lowercased char arrays and word boundary offsets on index update.
 * - Flat 64x64 pre-allocated integer matrix for zero heap allocation in search loops.
 * - Early cutoff pruning when row minimum exceeds max edit distance.
 */
class KotlinSearchEngine : SearchEngine {

    private class IndexedEntry(
        val app: AppInfo,
        val chars: CharArray,
        val length: Int,
        val wordBoundaries: IntArray
    )

    private var indexedApps: Array<IndexedEntry> = emptyArray()
    private var allAppsCached: List<AppInfo> = emptyList()

    // Pre-allocated flat DP matrix (64x64) for zero allocation in edit distance calculation
    private val matrix = IntArray(64 * 64)
    private val queryCharBuffer = CharArray(64)

    @Synchronized
    override fun updateIndex(apps: List<AppInfo>) {
        allAppsCached = apps
        val list = ArrayList<IndexedEntry>(apps.size)

        for (app in apps) {
            val lower = app.label.lowercase(Locale.getDefault())
            val chars = lower.toCharArray()
            val len = chars.size

            // Identify word boundary offsets (spaces, hyphens, underscores, dots)
            val boundaries = ArrayList<Int>(4)
            for (i in 1 until len) {
                val prev = chars[i - 1]
                if (prev == ' ' || prev == '-' || prev == '_' || prev == '.') {
                    boundaries.add(i)
                }
            }

            list.add(
                IndexedEntry(
                    app = app,
                    chars = chars,
                    length = len,
                    wordBoundaries = boundaries.toIntArray()
                )
            )
        }
        indexedApps = list.toTypedArray()
    }

    @Synchronized
    override fun search(query: String, maxResults: Int): List<AppInfo> {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) {
            return allAppsCached
        }

        val qLen = min(trimmed.length, 63)
        val lowerQuery = trimmed.lowercase(Locale.getDefault())
        for (i in 0 until qLen) {
            queryCharBuffer[i] = lowerQuery[i]
        }

        val matches = ArrayList<ScoredApp>(min(indexedApps.size, maxResults * 2))

        for (entry in indexedApps) {
            val score = scoreEntry(entry, queryCharBuffer, qLen)
            if (score > 0) {
                matches.add(ScoredApp(entry.app, score))
            }
        }

        // Sort descending by score, tie-break by original label
        matches.sortWith { a, b ->
            val sComp = b.score.compareTo(a.score)
            if (sComp != 0) sComp else a.app.label.compareTo(b.app.label)
        }

        val resultSize = min(matches.size, maxResults)
        val results = ArrayList<AppInfo>(resultSize)
        for (i in 0 until resultSize) {
            results.add(matches[i].app)
        }
        return results
    }

    private fun scoreEntry(entry: IndexedEntry, qChars: CharArray, qLen: Int): Int {
        val len = entry.length
        val sChars = entry.chars

        // 1. Exact match
        if (len == qLen) {
            var exact = true
            for (i in 0 until qLen) {
                if (sChars[i] != qChars[i]) {
                    exact = false
                    break
                }
            }
            if (exact) return 10_000
        }

        // 2. Prefix match
        if (len >= qLen) {
            var prefixMatch = true
            for (i in 0 until qLen) {
                if (sChars[i] != qChars[i]) {
                    prefixMatch = false
                    break
                }
            }
            if (prefixMatch) {
                return 5_000 - (len - qLen)
            }
        }

        // 3. Word boundary prefix match
        for (wb in entry.wordBoundaries) {
            if (wb + qLen <= len) {
                var wordMatch = true
                for (i in 0 until qLen) {
                    if (sChars[wb + i] != qChars[i]) {
                        wordMatch = false
                        break
                    }
                }
                if (wordMatch) {
                    return 3_500 - (wb * 5) - (len - qLen)
                }
            }
        }

        // 4. Subsequence match
        var sIdx = 0
        var qIdx = 0
        var firstMatch = -1
        var lastMatch = -1
        while (sIdx < len && qIdx < qLen) {
            if (sChars[sIdx] == qChars[qIdx]) {
                if (firstMatch == -1) firstMatch = sIdx
                lastMatch = sIdx
                qIdx++
            }
            sIdx++
        }
        if (qIdx == qLen) {
            val spread = lastMatch - firstMatch
            return 2_000 - (spread * 2) - (len - qLen)
        }

        // 5. Damerau-Levenshtein edit distance <= 2
        // Length difference optimization: if |len - qLen| > 2, distance cannot be <= 2
        if (abs(len - qLen) <= 2 && qLen >= 2) {
            val dist = damerauLevenshteinDistance(sChars, len, qChars, qLen, maxDistance = 2)
            if (dist <= 2) {
                return (1_000 - dist * 300) - abs(len - qLen)
            }
        }

        return 0
    }

    private fun damerauLevenshteinDistance(
        s1: CharArray,
        len1: Int,
        s2: CharArray,
        len2: Int,
        maxDistance: Int
    ): Int {
        if (len1 > 63 || len2 > 63) return maxDistance + 1
        val stride = 64

        for (i in 0..len1) {
            matrix[i * stride] = i
        }
        for (j in 0..len2) {
            matrix[j] = j
        }

        for (i in 1..len1) {
            val ch1 = s1[i - 1]
            var minRowDistance = matrix[i * stride]

            for (j in 1..len2) {
                val ch2 = s2[j - 1]
                val cost = if (ch1 == ch2) 0 else 1

                var d = minOf(
                    matrix[(i - 1) * stride + j] + 1,       // deletion
                    matrix[i * stride + (j - 1)] + 1,       // insertion
                    matrix[(i - 1) * stride + (j - 1)] + cost // substitution
                )

                // Transposition
                if (i > 1 && j > 1 && ch1 == s2[j - 2] && s1[i - 2] == ch2) {
                    val transCost = matrix[(i - 2) * stride + (j - 2)] + 1
                    if (transCost < d) {
                        d = transCost
                    }
                }

                matrix[i * stride + j] = d
                if (d < minRowDistance) {
                    minRowDistance = d
                }
            }

            // Pruning cutoff: if minimum in this row already exceeds maxDistance, abort
            if (minRowDistance > maxDistance) {
                return maxDistance + 1
            }
        }
        return matrix[len1 * stride + len2]
    }

    private class ScoredApp(
        val app: AppInfo,
        val score: Int
    )
}
