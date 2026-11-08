package com.antigravity.note.document.model

import android.graphics.RectF
import java.util.UUID

/**
 * First-class canvas element for inserted/pasted/dropped images.
 * Supports hardware-accelerated transform matrix manipulation via Lasso tool.
 */
data class CanvasImage(
    val id: String = UUID.randomUUID().toString(),
    val type: String = "image",
    val assetRef: String, // e.g. "hash_abc123.webp"
    var x: Float = 0f,
    var y: Float = 0f,
    var width: Float = 400f,
    var height: Float = 300f,
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

    fun copyElement(): CanvasImage {
        return copy(
            id = UUID.randomUUID().toString(),
            x = x + 30f,
            y = y + 30f
        )
    }

    fun toJsonString(): String {
        return """
            {
              "id": "$id",
              "type": "$type",
              "assetRef": "$assetRef",
              "x": $x,
              "y": $y,
              "width": $width,
              "height": $height,
              "rotation": $rotation,
              "zIndex": $zIndex
            }
        """.trimIndent()
    }

    companion object {
        fun fromJson(json: String): CanvasImage? {
            fun extractString(key: String): String? {
                val pattern = Regex("\"$key\"\\s*:\\s*\"(.*?)\"")
                return pattern.find(json)?.groupValues?.get(1)
            }
            fun extractFloat(key: String, default: Float): Float {
                val pattern = Regex("\"$key\"\\s*:\\s*([0-9.-]+)")
                return pattern.find(json)?.groupValues?.get(1)?.toFloatOrNull() ?: default
            }
            fun extractInt(key: String, default: Int): Int {
                val pattern = Regex("\"$key\"\\s*:\\s*([0-9-]+)")
                return pattern.find(json)?.groupValues?.get(1)?.toIntOrNull() ?: default
            }

            val assetRef = extractString("assetRef") ?: return null
            val id = extractString("id") ?: UUID.randomUUID().toString()
            val type = extractString("type") ?: "image"
            val x = extractFloat("x", 0f)
            val y = extractFloat("y", 0f)
            val width = extractFloat("width", 400f)
            val height = extractFloat("height", 300f)
            val rotation = extractFloat("rotation", 0f)
            val zIndex = extractInt("zIndex", 0)

            return CanvasImage(
                id = id,
                type = type,
                assetRef = assetRef,
                x = x,
                y = y,
                width = width,
                height = height,
                rotation = rotation,
                zIndex = zIndex
            )
        }
    }
}
