package com.antigravity.note.inkengine.eraser

/**
 * Eraser operating modes supported by InkFlow.
 */
enum class EraserMode {
    /**
     * Precision / Partial eraser: Removes only the touched arc/segment,
     * splitting surviving parts into independent sub-strokes. (Default)
     */
    PRECISION,

    /**
     * Stroke eraser: Deletes the entire stroke if any part intersects the eraser.
     */
    STROKE,

    /**
     * Highlighter-only eraser: Only erases strokes drawn with the highlighter brush.
     */
    HIGHLIGHTER
}
