package com.antigravity.note.document.model

import androidx.ink.strokes.Stroke
import java.util.UUID

data class DocumentPage(
    var metadata: PageMetadata,
    val strokes: MutableList<Stroke> = mutableListOf(),
    val strokeIds: MutableList<String> = mutableListOf(),
    val images: MutableList<CanvasImage> = mutableListOf()
) {
    fun addImage(image: CanvasImage) {
        images.add(image)
        metadata = metadata.copy(modifiedAt = System.currentTimeMillis())
    }

    fun removeImage(imageId: String): Boolean {
        val removed = images.removeAll { it.id == imageId }
        if (removed) {
            metadata = metadata.copy(modifiedAt = System.currentTimeMillis())
        }
        return removed
    }

    fun clearAllImages() {
        images.clear()
        metadata = metadata.copy(modifiedAt = System.currentTimeMillis())
    }
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

    fun removeStrokes(strokesToRemove: List<Stroke>): List<String> {
        val removedIds = mutableListOf<String>()
        val toRemoveIndices = strokesToRemove.mapNotNull { s ->
            var idx = strokes.indexOf(s)
            if (idx < 0) {
                val sBox = s.shape.computeBoundingBox()
                idx = strokes.indexOfFirst { cand ->
                    if (cand.inputs.size != s.inputs.size || cand.brush.colorIntArgb != s.brush.colorIntArgb) false
                    else {
                        val cBox = cand.shape.computeBoundingBox()
                        cBox != null && sBox != null &&
                        kotlin.math.abs(sBox.xMin - cBox.xMin) < 0.01f &&
                        kotlin.math.abs(sBox.yMin - cBox.yMin) < 0.01f &&
                        kotlin.math.abs(sBox.xMax - cBox.xMax) < 0.01f &&
                        kotlin.math.abs(sBox.yMax - cBox.yMax) < 0.01f
                    }
                }
            }
            if (idx >= 0) idx else null
        }.distinct().sortedDescending()

        for (idx in toRemoveIndices) {
            strokes.removeAt(idx)
            if (idx < strokeIds.size) {
                removedIds.add(strokeIds.removeAt(idx))
            }
        }
        metadata = metadata.copy(
            strokeCount = strokes.size,
            modifiedAt = System.currentTimeMillis()
        )
        return removedIds
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

    fun replaceStrokes(
        oldStrokes: List<Stroke>,
        newStrokes: List<Stroke>,
        newIds: List<String>? = null
    ): Pair<List<String>, List<String>> {
        val removedIds = removeStrokes(oldStrokes)
        val addedIds = mutableListOf<String>()
        for (i in newStrokes.indices) {
            val stroke = newStrokes[i]
            val id = newIds?.getOrNull(i) ?: UUID.randomUUID().toString()
            if (addStroke(stroke, id)) {
                addedIds.add(id)
            }
        }
        return Pair(removedIds, addedIds)
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
