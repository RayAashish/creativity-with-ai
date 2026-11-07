package org.ledger.pdf.engine

object RangeParser {

    /**
     * Parses a page range string (1-indexed, human-readable) into a sorted list of 0-based page indices.
     * Example: "1-3, 5, 8-10" with totalPages=10 returns [0, 1, 2, 4, 7, 8, 9]
     *
     * @param expression User entered string, e.g. "1, 3-5, 8"
     * @param totalPages Total page count of the document (1-based)
     * @return List of 0-based page indices in ascending order, deduplicated
     */
    fun parseRange(expression: String, totalPages: Int): List<Int> {
        if (expression.isBlank() || totalPages <= 0) return emptyList()

        val result = mutableSetOf<Int>()
        val segments = expression.split(",", ";")

        for (segment in segments) {
            val trimmed = segment.trim()
            if (trimmed.isEmpty()) continue

            if (trimmed.contains("-")) {
                val parts = trimmed.split("-").map { it.trim() }
                if (parts.size == 2) {
                    val start = parts[0].toIntOrNull()
                    val end = parts[1].toIntOrNull()
                    if (start != null && end != null) {
                        val min = minOf(start, end)
                        val max = maxOf(start, end)
                        for (p in min..max) {
                            if (p in 1..totalPages) {
                                result.add(p - 1)
                            }
                        }
                    }
                }
            } else {
                val page = trimmed.toIntOrNull()
                if (page != null && page in 1..totalPages) {
                    result.add(page - 1)
                }
            }
        }

        return result.sorted()
    }

    /**
     * Formats a list of 0-based page indices into a clean human-readable range string.
     * Example: [0, 1, 2, 4, 7, 8, 9] -> "1-3, 5, 8-10"
     */
    fun formatRange(indices: List<Int>): String {
        if (indices.isEmpty()) return ""
        val sorted = indices.distinct().sorted()
        val ranges = mutableListOf<String>()

        var start = sorted[0]
        var prev = start

        for (i in 1 until sorted.size) {
            val curr = sorted[i]
            if (curr == prev + 1) {
                prev = curr
            } else {
                if (start == prev) {
                    ranges.add("${start + 1}")
                } else {
                    ranges.add("${start + 1}-${prev + 1}")
                }
                start = curr
                prev = curr
            }
        }

        if (start == prev) {
            ranges.add("${start + 1}")
        } else {
            ranges.add("${start + 1}-${prev + 1}")
        }

        return ranges.joinToString(", ")
    }
}
