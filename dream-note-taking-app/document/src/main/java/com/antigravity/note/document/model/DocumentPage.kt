package com.antigravity.note.document.model

import androidx.ink.strokes.Stroke

data class DocumentPage(
    var metadata: PageMetadata,
    val strokes: MutableList<Stroke> = mutableListOf()
) {
    fun addStroke(stroke: Stroke) {
        strokes.add(stroke)
        metadata = metadata.copy(
            strokeCount = strokes.size,
            modifiedAt = System.currentTimeMillis()
        )
    }

    fun removeStrokes(strokesToRemove: List<Stroke>) {
        strokes.removeAll(strokesToRemove.toSet())
        metadata = metadata.copy(
            strokeCount = strokes.size,
            modifiedAt = System.currentTimeMillis()
        )
    }

    fun clearAllStrokes() {
        strokes.clear()
        metadata = metadata.copy(
            strokeCount = 0,
            modifiedAt = System.currentTimeMillis()
        )
    }
}
