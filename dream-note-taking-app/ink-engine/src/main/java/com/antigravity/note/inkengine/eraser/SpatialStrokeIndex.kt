package com.antigravity.note.inkengine.eraser

import androidx.ink.strokes.Stroke
import kotlin.math.floor

/**
 * 2D Spatial Grid Index for sub-millisecond stroke intersection queries at 144 Hz.
 * Divides the canvas into grid cells of [cellSize] x [cellSize] world units.
 */
class SpatialStrokeIndex(private val cellSize: Float = 256f) {

    private val grid = HashMap<Long, ArrayList<Stroke>>()
    private val querySet = HashSet<Stroke>()

    private fun cellCoord(v: Float): Int = floor(v / cellSize).toInt()

    private fun cellKey(cx: Int, cy: Int): Long {
        return (cx.toLong() and 0xFFFFFFFFL) or ((cy.toLong() and 0xFFFFFFFFL) shl 32)
    }

    @Synchronized
    fun add(stroke: Stroke) {
        val box = stroke.shape.computeBoundingBox() ?: return
        val minCx = cellCoord(box.xMin)
        val maxCx = cellCoord(box.xMax)
        val minCy = cellCoord(box.yMin)
        val maxCy = cellCoord(box.yMax)

        for (cx in minCx..maxCx) {
            for (cy in minCy..maxCy) {
                val key = cellKey(cx, cy)
                val list = grid.getOrPut(key) { ArrayList(4) }
                list.add(stroke)
            }
        }
    }

    @Synchronized
    fun remove(stroke: Stroke) {
        val box = stroke.shape.computeBoundingBox() ?: return
        val minCx = cellCoord(box.xMin)
        val maxCx = cellCoord(box.xMax)
        val minCy = cellCoord(box.yMin)
        val maxCy = cellCoord(box.yMax)

        for (cx in minCx..maxCx) {
            for (cy in minCy..maxCy) {
                val key = cellKey(cx, cy)
                val list = grid[key]
                if (list != null) {
                    list.remove(stroke)
                    if (list.isEmpty()) {
                        grid.remove(key)
                    }
                }
            }
        }
    }

    @Synchronized
    fun clear() {
        grid.clear()
    }

    @Synchronized
    fun rebuild(strokes: List<Stroke>) {
        grid.clear()
        for (i in strokes.indices) {
            add(strokes[i])
        }
    }

    /**
     * Query all strokes whose bounding boxes may overlap [minX, minY, maxX, maxY].
     * Appends unique candidate strokes to [outCandidates].
     */
    @Synchronized
    fun query(minX: Float, minY: Float, maxX: Float, maxY: Float, outCandidates: MutableList<Stroke>) {
        outCandidates.clear()
        querySet.clear()

        val minCx = cellCoord(minX)
        val maxCx = cellCoord(maxX)
        val minCy = cellCoord(minY)
        val maxCy = cellCoord(maxY)

        for (cx in minCx..maxCx) {
            for (cy in minCy..maxCy) {
                val list = grid[cellKey(cx, cy)] ?: continue
                for (i in 0 until list.size) {
                    val s = list[i]
                    if (querySet.add(s)) {
                        outCandidates.add(s)
                    }
                }
            }
        }
    }
}
