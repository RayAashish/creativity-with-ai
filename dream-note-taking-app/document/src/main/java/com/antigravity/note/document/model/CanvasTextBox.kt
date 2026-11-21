package com.antigravity.note.document.model

import android.graphics.RectF
import java.util.UUID

enum class FontStyleType {
    SANS,
    SERIF,
    MONOSPACE
}

/**
 * First-class vector text element for typed notes and DSA code snippets.
 * Supports tap-to-type, drag-to-size, multi-line auto-wrapping,
 * font styles (Sans/Serif/Monospace), sizing (12sp-48sp), formatting (B/I/U),
 * text color, optional fill and border.
 */
data class CanvasTextBox(
    val id: String = UUID.randomUUID().toString(),
    val type: String = "text",
    var text: String = "",
    var x: Float = 0f,
    var y: Float = 0f,
    var width: Float = 280f,
    var height: Float = 90f,
    var fontSizeSp: Float = 18f,
    var fontStyle: FontStyleType = FontStyleType.SANS,
    var isBold: Boolean = false,
    var isItalic: Boolean = false,
    var isUnderline: Boolean = false,
    var textColorArgb: Int = 0xFFFFFFFF.toInt(),
    var isFilled: Boolean = false,
    var fillColorArgb: Int = 0x1AFFFFFF.toInt(),
    var isBordered: Boolean = true,
    var borderColorArgb: Int = 0x40FFFFFF.toInt(),
    var rotation: Float = 0f,
    var zIndex: Int = 0
) {
    fun getBounds(): RectF = RectF(x, y, x + width, y + height)

    fun contains(px: Float, py: Float): Boolean {
        return px >= x && px <= x + width && py >= y && py <= y + height
    }

    fun intersects(r: RectF): Boolean {
        return RectF.intersects(getBounds(), r)
    }

    fun copyElement(): CanvasTextBox {
        return copy(
            id = UUID.randomUUID().toString(),
            x = x + 30f,
            y = y + 30f
        )
    }

    fun toJsonString(): String {
        val escapedText = text.replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
        return """
            {
              "id": "$id",
              "type": "$type",
              "text": "$escapedText",
              "x": $x,
              "y": $y,
              "width": $width,
              "height": $height,
              "fontSizeSp": $fontSizeSp,
              "fontStyle": "${fontStyle.name}",
              "isBold": $isBold,
              "isItalic": $isItalic,
              "isUnderline": $isUnderline,
              "textColorArgb": $textColorArgb,
              "isFilled": $isFilled,
              "fillColorArgb": $fillColorArgb,
              "isBordered": $isBordered,
              "borderColorArgb": $borderColorArgb,
              "rotation": $rotation,
              "zIndex": $zIndex
            }
        """.trimIndent()
    }

    companion object {
        fun fromJson(json: String): CanvasTextBox? {
            fun extractString(key: String): String? {
                val pattern = Regex("\"$key\"\\s*:\\s*\"(.*?)\"")
                val raw = pattern.find(json)?.groupValues?.get(1) ?: return null
                return raw.replace("\\n", "\n")
                    .replace("\\r", "\r")
                    .replace("\\\"", "\"")
                    .replace("\\\\", "\\")
            }
            fun extractFloat(key: String, default: Float): Float {
                val pattern = Regex("\"$key\"\\s*:\\s*([0-9.-]+)")
                return pattern.find(json)?.groupValues?.get(1)?.toFloatOrNull() ?: default
            }
            fun extractInt(key: String, default: Int): Int {
                val pattern = Regex("\"$key\"\\s*:\\s*([0-9-]+)")
                return pattern.find(json)?.groupValues?.get(1)?.toIntOrNull() ?: default
            }
            fun extractBool(key: String, default: Boolean): Boolean {
                val pattern = Regex("\"$key\"\\s*:\\s*(true|false)")
                return pattern.find(json)?.groupValues?.get(1)?.toBooleanStrictOrNull() ?: default
            }

            val text = extractString("text") ?: ""
            val id = extractString("id") ?: UUID.randomUUID().toString()
            val type = extractString("type") ?: "text"
            val x = extractFloat("x", 0f)
            val y = extractFloat("y", 0f)
            val width = extractFloat("width", 280f)
            val height = extractFloat("height", 90f)
            val fontSizeSp = extractFloat("fontSizeSp", 18f)
            val fontStyleStr = extractString("fontStyle") ?: FontStyleType.SANS.name
            val fontStyle = try { FontStyleType.valueOf(fontStyleStr) } catch (e: Exception) { FontStyleType.SANS }
            val isBold = extractBool("isBold", false)
            val isItalic = extractBool("isItalic", false)
            val isUnderline = extractBool("isUnderline", false)
            val textColorArgb = extractInt("textColorArgb", 0xFFFFFFFF.toInt())
            val isFilled = extractBool("isFilled", false)
            val fillColorArgb = extractInt("fillColorArgb", 0x1AFFFFFF.toInt())
            val isBordered = extractBool("isBordered", true)
            val borderColorArgb = extractInt("borderColorArgb", 0x40FFFFFF.toInt())
            val rotation = extractFloat("rotation", 0f)
            val zIndex = extractInt("zIndex", 0)

            return CanvasTextBox(
                id = id,
                type = type,
                text = text,
                x = x,
                y = y,
                width = width,
                height = height,
                fontSizeSp = fontSizeSp,
                fontStyle = fontStyle,
                isBold = isBold,
                isItalic = isItalic,
                isUnderline = isUnderline,
                textColorArgb = textColorArgb,
                isFilled = isFilled,
                fillColorArgb = fillColorArgb,
                isBordered = isBordered,
                borderColorArgb = borderColorArgb,
                rotation = rotation,
                zIndex = zIndex
            )
        }
    }
}
