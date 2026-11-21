package com.antigravity.note.ui.shapes.uml.ui

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.RectF
import androidx.core.content.FileProvider
import com.antigravity.note.ui.shapes.uml.engine.UmlCanvasRenderer
import com.antigravity.note.ui.shapes.uml.model.UmlDiagram
import java.io.File
import java.io.FileOutputStream

/**
 * High-Resolution PNG & Vector SVG Exporter for UML Diagrams.
 */
object UmlExporter {

    fun exportToBitmap(diagram: UmlDiagram, scale: Float = 2.0f, transparent: Boolean = false): Bitmap {
        val bounds = diagram.computeBoundingBox()
        val pad = 60f
        val w = ((bounds.width() + pad * 2f) * scale).toInt().coerceAtLeast(400)
        val h = ((bounds.height() + pad * 2f) * scale).toInt().coerceAtLeast(300)

        val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        if (!transparent) {
            canvas.drawColor(if (diagram.isDarkMode) Color.parseColor("#121418") else Color.parseColor("#F8FAFC"))
        }

        canvas.save()
        canvas.scale(scale, scale)
        canvas.translate(-bounds.left + pad, -bounds.top + pad)

        val renderer = UmlCanvasRenderer().apply { isDarkMode = diagram.isDarkMode }
        renderer.renderDiagram(
            canvas = canvas,
            diagram = diagram,
            drawBackgroundGrid = false
        )
        canvas.restore()

        return bitmap
    }

    fun exportToSvg(diagram: UmlDiagram): String {
        val bounds = diagram.computeBoundingBox()
        val pad = 60f
        val w = bounds.width() + pad * 2f
        val h = bounds.height() + pad * 2f

        val sb = StringBuilder()
        sb.append("""<?xml version="1.0" encoding="UTF-8"?>""").append("\n")
        sb.append("""<svg xmlns="http://www.w3.org/2000/svg" width="$w" height="$h" viewBox="0 0 $w $h">""").append("\n")

        val bgColor = if (diagram.isDarkMode) "#121418" else "#F8FAFC"
        val strokeColor = if (diagram.isDarkMode) "#E2E8F0" else "#1E293B"
        val fillNodeColor = if (diagram.isDarkMode) "#1E222B" else "#FFFFFF"
        val textColor = if (diagram.isDarkMode) "#F8FAFC" else "#0F172A"

        sb.append("""  <rect width="100%" height="100%" fill="$bgColor"/>""").append("\n")
        sb.append("""  <g transform="translate(${-bounds.left + pad}, ${-bounds.top + pad})">""").append("\n")

        // Draw Nodes
        for (n in diagram.nodes) {
            sb.append("""    <!-- Node: ${n.title} -->""").append("\n")
            sb.append("""    <rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="8" fill="$fillNodeColor" stroke="$strokeColor" stroke-width="2"/>""").append("\n")
            sb.append("""    <text x="${n.centerX}" y="${n.y + 24}" font-family="sans-serif" font-size="14" font-weight="bold" fill="$textColor" text-anchor="middle">${n.title}</text>""").append("\n")
        }

        sb.append("  </g>\n")
        sb.append("</svg>")
        return sb.toString()
    }

    fun shareDiagramPng(context: Context, diagram: UmlDiagram) {
        try {
            val bitmap = exportToBitmap(diagram)
            val cacheDir = File(context.cacheDir, "uml_exports").apply { mkdirs() }
            val file = File(cacheDir, "${diagram.title.replace(' ', '_')}_export.png")
            FileOutputStream(file).use { out ->
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
            }

            val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "image/png"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            context.startActivity(Intent.createChooser(intent, "Share UML Diagram"))
        } catch (_: Exception) {
            // Graceful fallback
        }
    }
}
