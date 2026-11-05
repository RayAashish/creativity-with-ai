package com.antigravity.note.ui.dsa.fetcher

enum class ProblemSource(val displayName: String, val badgeColor: Long) {
    LEETCODE("LeetCode", 0xFFFFA116),
    CODE360("Code360", 0xFFFF5722),
    GEEKSFORGEEKS("GeeksforGeeks", 0xFF2E7D32),
    CODEFORCES("Codeforces", 0xFF1976D2),
    HACKERRANK("HackerRank", 0xFF00EA64),
    WIKIPEDIA("Wikipedia", 0xFF607D8B),
    GENERIC("Web", 0xFF7C4DFF);

    companion object {
        fun fromUrl(url: String?): ProblemSource {
            if (url.isNullOrBlank()) return GENERIC
            val lower = url.lowercase()
            return when {
                lower.contains("leetcode") -> LEETCODE
                lower.contains("code360") || lower.contains("codingninjas") || lower.contains("codestudio") -> CODE360
                lower.contains("geeksforgeeks") -> GEEKSFORGEEKS
                lower.contains("codeforces") -> CODEFORCES
                lower.contains("hackerrank") -> HACKERRANK
                lower.contains("wikipedia.org") -> WIKIPEDIA
                else -> GENERIC
            }
        }
    }
}
