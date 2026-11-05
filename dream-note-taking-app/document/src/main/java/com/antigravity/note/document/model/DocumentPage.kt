package com.antigravity.note.document.model

import androidx.ink.strokes.Stroke
import java.util.UUID

data class DocumentPage(
    var metadata: PageMetadata,
    val strokes: MutableList<Stroke> = mutableListOf(),
    val strokeIds: MutableList<String> = mutableListOf()
) {
    fun addStroke(stroke: Stroke, id: String = UUID.randomUUID().toString()): Boolean {
        if (strokeIds.contains(id)) {
            return false // Deduplicate by unique stroke ID
        }
        strokes.add(stroke)
        strokeIds.add(id)
        metadata = metadata.copy(
            strokeCount = strokes.size,
            modifiedAt = System.currentTimeMillis()
        )
        return true
    }

    fun removeStrokes(strokesToRemove: List<Stroke>) {
        val toRemoveIndices = strokesToRemove.mapNotNull { s ->
            val idx = strokes.indexOf(s)
            if (idx >= 0) idx else null
        }.sortedDescending()

        for (idx in toRemoveIndices) {
            strokes.removeAt(idx)
            if (idx < strokeIds.size) {
                strokeIds.removeAt(idx)
            }
        }
        metadata = metadata.copy(
            strokeCount = strokes.size,
            modifiedAt = System.currentTimeMillis()
        )
    }

    fun removeStrokeById(id: String): Boolean {
        val idx = strokeIds.indexOf(id)
        if (idx >= 0) {
            strokes.removeAt(idx)
            strokeIds.removeAt(idx)
            metadata = metadata.copy(
                strokeCount = strokes.size,
                modifiedAt = System.currentTimeMillis()
            )
            return true
        }
        return false
    }

    fun clearAllStrokes() {
        strokes.clear()
        strokeIds.clear()
        metadata = metadata.copy(
            strokeCount = 0,
            modifiedAt = System.currentTimeMillis()
        )
    }

    fun replaceStrokes(oldStrokes: List<Stroke>, newStrokes: List<Stroke>, newIds: List<String>? = null) {
        removeStrokes(oldStrokes)
        for (i in newStrokes.indices) {
            val stroke = newStrokes[i]
            val id = newIds?.getOrNull(i) ?: UUID.randomUUID().toString()
            addStroke(stroke, id)
        }
    }

    fun computeContentBounds(): FloatArray? {
        var minX = Float.MAX_VALUE
        var minY = Float.MAX_VALUE
        var maxX = -Float.MAX_VALUE
        var maxY = -Float.MAX_VALUE
        for (stroke in strokes) {
            val box = stroke.shape.computeBoundingBox() ?: continue
            if (box.xMin < minX) minX = box.xMin
            if (box.yMin < minY) minY = box.yMin
            if (box.xMax > maxX) maxX = box.xMax
            if (box.yMax > maxY) maxY = box.yMax
        }
        return if (minX <= maxX && minY <= maxY) floatArrayOf(minX, minY, maxX, maxY) else null
    }
}
