package com.antigravity.note.document.export

import androidx.ink.strokes.Stroke
import androidx.ink.strokes.StrokeInput
import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PaperTemplate

/**
 * Generates standards-compliant vector SVG representations of DocumentPage notes.
 * Directly renderable in GitHub web, browsers, Markdown viewers, and laptop displays.
 */
object SvgExporter {

    fun exportToSvg(
        page: DocumentPage,
        width: Float = 2190f,
        height: Float = 3504f
    ): String {
        val sb = StringBuilder()
        sb.append("""<?xml version="1.0" encoding="UTF-8"?>""").append("\n")
        sb.append("""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 $width $height" width="100%" height="100%">""").append("\n")
        sb.append("""  <style>""").append("\n")
        sb.append("""    .bg { fill: #ffffff; }""").append("\n")
        sb.append("""    .line { stroke: #e5e7eb; stroke-width: 1.5; }""").append("\n")
        sb.append("""    .margin { stroke: #fca5a5; stroke-width: 2; }""").append("\n")
        sb.append("""    .header-title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 32px; font-weight: bold; fill: #374151; }""").append("\n")
        sb.append("""    .header-sub { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; fill: #9ca3af; }""").append("\n")
        sb.append("""  </style>""").append("\n")

        // 1. Paper Background
        sb.append("""  <rect class="bg" width="$width" height="$height"/>""").append("\n")

        // 2. Paper Template Guidelines
        when (page.metadata.template) {
            PaperTemplate.RULED -> {
                val startY = 160f
                val spacing = 56f
                var y = startY
                while (y < height) {
                    sb.append("""  <line class="line" x1="0" y1="$y" x2="$width" y2="$y"/>""").append("\n")
                    y += spacing
                }
                // Red margin line
                sb.append("""  <line class="margin" x1="180" y1="0" x2="180" y2="$height"/>""").append("\n")
            }
            PaperTemplate.GRID -> {
                val spacing = 48f
                var x = 0f
                while (x < width) {
                    sb.append("""  <line class="line" x1="$x" y1="0" x2="$x" y2="$height"/>""").append("\n")
                    x += spacing
                }
                var y = 0f
                while (y < height) {
                    sb.append("""  <line class="line" x1="0" y1="$y" x2="$width" y2="$y"/>""").append("\n")
                    y += spacing
                }
            }
            PaperTemplate.DOT -> {
                val spacing = 48f
                var x = spacing
                while (x < width) {
                    var y = spacing
                    while (y < height) {
                        sb.append("""  <circle cx="$x" cy="$y" r="2" fill="#d1d5db"/>""").append("\n")
                        y += spacing
                    }
                    x += spacing
                }
            }
            PaperTemplate.CORNELL -> {
                sb.append("""  <line class="line" x1="0" y1="200" x2="$width" y2="200"/>""").append("\n")
                sb.append("""  <line class="line" x1="520" y1="200" x2="520" y2="${height - 350}"/>""").append("\n")
                sb.append("""  <line class="line" x1="0" y1="${height - 350}" x2="$width" y2="${height - 350}"/>""").append("\n")
            }
            else -> {}
        }

        // Header watermark with note title
        val safeTitle = escapeXml(page.metadata.title.ifEmpty { "InkFlow Note" })
        sb.append("""  <text x="48" y="72" class="header-title">$safeTitle</text>""").append("\n")
        sb.append("""  <text x="48" y="108" class="header-sub">InkFlow Vector Canvas • ${page.metadata.template.displayName}</text>""").append("\n")

        // 3. Render Vector Strokes
        val strokeInputTemp = StrokeInput()
        for (stroke in page.strokes) {
            val colorInt = stroke.brush.colorIntArgb
            val a = ((colorInt ushr 24) and 0xFF) / 255f
            val r = (colorInt ushr 16) and 0xFF
            val g = (colorInt ushr 8) and 0xFF
            val b = colorInt and 0xFF
            val hexColor = String.format("#%02x%02x%02x", r, g, b)
            val strokeWidth = stroke.brush.size.coerceAtLeast(1.5f)

            val batch = stroke.inputs
            val count = batch.size
            if (count > 0) {
                sb.append("""  <path d="""")
                batch.populate(0, strokeInputTemp)
                sb.append("M ").append(formatCoord(strokeInputTemp.x)).append(" ").append(formatCoord(strokeInputTemp.y))
                for (i in 1 until count) {
                    batch.populate(i, strokeInputTemp)
                    sb.append(" L ").append(formatCoord(strokeInputTemp.x)).append(" ").append(formatCoord(strokeInputTemp.y))
                }
                sb.append("""" stroke="$hexColor" stroke-width="$strokeWidth" stroke-opacity="$a" stroke-linecap="round" stroke-linejoin="round" fill="none"/>""").append("\n")
            }
        }

        sb.append("""</svg>""").append("\n")
        return sb.toString()
    }

    private fun formatCoord(v: Float): String = String.format(java.util.Locale.US, "%.1f", v)

    private fun escapeXml(text: String): String {
        return text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&apos;")
    }
}
