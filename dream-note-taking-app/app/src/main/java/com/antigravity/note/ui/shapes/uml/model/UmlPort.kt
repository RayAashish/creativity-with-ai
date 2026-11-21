package com.antigravity.note.ui.shapes.uml.model

import android.graphics.PointF

data class UmlPoint(val x: Float, val y: Float) {
    fun toPointF(): PointF = PointF(x, y)
}

enum class UmlPortPosition {
    NORTH,
    SOUTH,
    EAST,
    WEST,
    NORTH_EAST,
    NORTH_WEST,
    SOUTH_EAST,
    SOUTH_WEST,
    LIFELINE_START,
    LIFELINE_END
}

/**
 * Magnetic anchor port on a UML node boundary.
 * Provides hit testing with generous touch slop (48dp) for effortless mobile snapping.
 */
data class UmlPort(
    val nodeId: String,
    val position: UmlPortPosition,
    val x: Float,
    val y: Float
) {
    fun toPointF(): PointF = PointF(x, y)

    fun distanceTo(px: Float, py: Float): Float {
        val dx = x - px
        val dy = y - py
        return kotlin.math.sqrt(dx * dx + dy * dy)
    }

    fun isNear(px: Float, py: Float, slopPx: Float = 48f): Boolean {
        return distanceTo(px, py) <= slopPx
    }
}
