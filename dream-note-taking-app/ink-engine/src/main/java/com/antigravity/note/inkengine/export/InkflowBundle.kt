package com.antigravity.note.inkengine.export

/**
 * Metadata manifest for a lossless .inkflow notebook bundle archive.
 */
data class InkflowManifest(
    val version: Int = 1,
    val appName: String = "Dream Note",
    val notebookId: String,
    val notebookTitle: String,
    val createdAt: Long,
    val exportedAt: Long,
    val pageCount: Int,
    val pages: List<InkflowPageEntry>
) {
    fun toJsonString(): String {
        val sb = StringBuilder()
        sb.append("{\n")
        sb.append("  \"version\": ").append(version).append(",\n")
        sb.append("  \"appName\": \"").append(escapeJson(appName)).append("\",\n")
        sb.append("  \"notebookId\": \"").append(escapeJson(notebookId)).append("\",\n")
        sb.append("  \"notebookTitle\": \"").append(escapeJson(notebookTitle)).append("\",\n")
        sb.append("  \"createdAt\": ").append(createdAt).append(",\n")
        sb.append("  \"exportedAt\": ").append(exportedAt).append(",\n")
        sb.append("  \"pageCount\": ").append(pageCount).append(",\n")
        sb.append("  \"pages\": [\n")
        for ((index, page) in pages.withIndex()) {
            sb.append("    {\n")
            sb.append("      \"pageId\": \"").append(escapeJson(page.pageId)).append("\",\n")
            sb.append("      \"title\": \"").append(escapeJson(page.title)).append("\",\n")
            sb.append("      \"pageIndex\": ").append(page.pageIndex).append(",\n")
            sb.append("      \"template\": \"").append(escapeJson(page.template)).append("\",\n")
            sb.append("      \"strokeCount\": ").append(page.strokeCount)
            if (page.audioFile != null) {
                sb.append(",\n      \"audioFile\": \"").append(escapeJson(page.audioFile)).append("\"\n")
            } else {
                sb.append("\n")
            }
            sb.append("    }")
            if (index < pages.size - 1) sb.append(",")
            sb.append("\n")
        }
        sb.append("  ]\n")
        sb.append("}")
        return sb.toString()
    }

    companion object {
        private fun escapeJson(value: String): String {
            return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r")
        }

        fun fromJsonString(json: String): InkflowManifest {
            fun extractString(key: String, source: String): String? {
                val pattern = Regex("\"$key\"\\s*:\\s*\"(.*?)\"")
                return pattern.find(source)?.groupValues?.get(1)?.replace("\\\"", "\"")?.replace("\\\\", "\\")
            }

            fun extractLong(key: String, source: String): Long? {
                val pattern = Regex("\"$key\"\\s*:\\s*(\\d+)")
                return pattern.find(source)?.groupValues?.get(1)?.toLongOrNull()
            }

            val version = extractLong("version", json)?.toInt() ?: 1
            val appName = extractString("appName", json) ?: "Dream Note"
            val notebookId = extractString("notebookId", json) ?: ""
            val notebookTitle = extractString("notebookTitle", json) ?: "Untitled Notebook"
            val createdAt = extractLong("createdAt", json) ?: System.currentTimeMillis()
            val exportedAt = extractLong("exportedAt", json) ?: System.currentTimeMillis()
            val pageCount = extractLong("pageCount", json)?.toInt() ?: 0

            val pagesList = mutableListOf<InkflowPageEntry>()
            val pageBlocks = Regex("\\{[^{}]*\"pageId\"[^{}]*\\}").findAll(json)
            for (match in pageBlocks) {
                val block = match.value
                val pId = extractString("pageId", block) ?: continue
                val title = extractString("title", block) ?: ""
                val pIndex = extractLong("pageIndex", block)?.toInt() ?: 0
                val template = extractString("template", block) ?: "GRID"
                val strokeCount = extractLong("strokeCount", block)?.toInt() ?: 0
                val audioFile = extractString("audioFile", block)
                pagesList.add(
                    InkflowPageEntry(
                        pageId = pId,
                        title = title,
                        pageIndex = pIndex,
                        template = template,
                        strokeCount = strokeCount,
                        audioFile = audioFile
                    )
                )
            }

            return InkflowManifest(
                version = version,
                appName = appName,
                notebookId = notebookId,
                notebookTitle = notebookTitle,
                createdAt = createdAt,
                exportedAt = exportedAt,
                pageCount = if (pageCount > 0) pageCount else pagesList.size,
                pages = pagesList
            )
        }
    }
}

/**
 * Manifest entry for an individual page inside an .inkflow bundle.
 */
data class InkflowPageEntry(
    val pageId: String,
    val title: String,
    val pageIndex: Int,
    val template: String,
    val strokeCount: Int,
    val audioFile: String? = null
)
