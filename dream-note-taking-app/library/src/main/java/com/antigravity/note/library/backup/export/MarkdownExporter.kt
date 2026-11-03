package com.antigravity.note.library.backup.export

import com.antigravity.note.library.db.PageEntity

object MarkdownExporter {

    /**
     * Sanitizes path component removing illegal filesystem characters and limiting length.
     */
    fun sanitizeName(name: String): String {
        val cleaned = name.trim()
            .replace(Regex("[/\\\\:*?\"<>|]"), "-")
            .replace(Regex("\\s+"), "-")
            .replace(Regex("-+"), "-")
            .trim('-')
        return if (cleaned.length > 64) cleaned.substring(0, 64).trim('-') else cleaned.ifBlank { "Untitled" }
    }

    /**
     * Generates standard GitHub-flavored Markdown for any page or DSA problem.
     */
    fun exportToMarkdown(
        page: PageEntity,
        folderPath: String = "",
        notebookTitle: String = "Notebook",
        ocrText: String? = null
    ): String {
        val sb = StringBuilder()

        // Title
        sb.append("# ").append(page.title.ifBlank { "Untitled Note" }).append("\n\n")

        // Location breadcrumb
        val fullPath = if (folderPath.isNotBlank()) "$folderPath / $notebookTitle" else notebookTitle
        sb.append("> **Location:** `").append(fullPath).append("`  \n")
        sb.append("> **Page:** ").append(page.pageIndex + 1).append("  \n")
        sb.append("> **Template:** `").append(page.template).append("`  \n\n")

        if (page.isProblemPage) {
            sb.append("## Problem Overview\n\n")
            sb.append("| Property | Value |\n")
            sb.append("| :--- | :--- |\n")
            if (!page.difficulty.isNullOrBlank()) {
                val badge = when (page.difficulty.lowercase()) {
                    "easy" -> "🟢 **Easy**"
                    "medium" -> "🟡 **Medium**"
                    "hard" -> "🔴 **Hard**"
                    else -> page.difficulty
                }
                sb.append("| **Difficulty** | ").append(badge).append(" |\n")
            }
            sb.append("| **Status** | `").append(page.problemStatus).append("` |\n")
            if (!page.sourceUrl.isNullOrBlank()) {
                sb.append("| **Source URL** | [View Problem](").append(page.sourceUrl).append(") |\n")
            }
            if (page.timeComplexity.isNotBlank()) {
                sb.append("| **Time Complexity** | `").append(page.timeComplexity).append("` |\n")
            }
            if (page.spaceComplexity.isNotBlank()) {
                sb.append("| **Space Complexity** | `").append(page.spaceComplexity).append("` |\n")
            }
            if (page.timeTakenMinutes > 0) {
                sb.append("| **Time Taken** | ").append(page.timeTakenMinutes).append(" mins |\n")
            }
            sb.append("\n")

            if (page.tags.isNotBlank()) {
                sb.append("### Tags\n")
                val tagsList = page.tags.split(",").map { it.trim() }.filter { it.isNotBlank() }
                for (tag in tagsList) {
                    sb.append("`#").append(tag).append("` ")
                }
                sb.append("\n\n")
            }

            if (page.approachSummary.isNotBlank()) {
                sb.append("## Approach & Intuition\n\n")
                sb.append(page.approachSummary.trim()).append("\n\n")
            }

            if (page.codeSnippet.isNotBlank()) {
                val lang = page.codeLanguage.lowercase()
                sb.append("## Solution (").append(page.codeLanguage).append(")\n\n")
                sb.append("```").append(lang).append("\n")
                sb.append(page.codeSnippet.trim()).append("\n")
                sb.append("```\n\n")
            }
        }

        // Handwriting / OCR Notes Section
        if (!ocrText.isNullOrBlank()) {
            sb.append("## Handwritten Notes (OCR)\n\n")
            sb.append(ocrText.trim()).append("\n\n")
        }

        // Visual Note & Vector Drawing Section
        val safeTitle = sanitizeName(page.title)
        val relativeThumb = "../../notebooks/${page.notebookId}/pages/${page.pageId}.thumb.webp"
        sb.append("## Handwritten Note & Diagram\n\n")
        sb.append("![Vector Note Drawing]($safeTitle.svg)\n\n")
        sb.append("> *Interactive vector graphic: click [`$safeTitle.svg`]($safeTitle.svg) to view in GitHub.*  \n")
        sb.append("![Page Thumbnail](").append(relativeThumb).append(")\n\n")

        return sb.toString()
    }
}
