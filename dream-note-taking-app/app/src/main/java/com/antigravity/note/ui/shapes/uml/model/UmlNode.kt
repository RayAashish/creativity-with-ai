package com.antigravity.note.ui.shapes.uml.model

import android.graphics.RectF
import java.util.UUID

enum class UmlNodeType {
    CLASS,
    INTERFACE,
    ACTOR,
    USE_CASE,
    BOUNDARY,
    LIFELINE,
    ACTIVATION_BAR,
    INITIAL_NODE,
    FINAL_NODE,
    ACTION_STATE,
    DECISION,
    FORK_JOIN,
    NOTE
}

/**
 * Immutable UML Node model with support for compartments, dynamic sizing,
 * and magnetic perimeter anchor ports.
 */
data class UmlNode(
    val id: String = UUID.randomUUID().toString(),
    val type: UmlNodeType,
    val x: Float,
    val y: Float,
    val width: Float,
    val height: Float,
    val title: String,
    val stereotype: String? = null,
    val attributes: List<String> = emptyList(),
    val methods: List<String> = emptyList(),
    val customFillColor: Int? = null,
    val customStrokeColor: Int? = null,
    val isLocked: Boolean = false
) {
    fun getBounds(): RectF = RectF(x, y, x + width, y + height)

    val centerX: Float get() = x + width / 2f
    val centerY: Float get() = y + height / 2f

    fun contains(px: Float, py: Float): Boolean {
        return px >= x && px <= x + width && py >= y && py <= y + height
    }

    /**
     * Compute magnetic anchor ports based on node geometry.
     */
    fun computePorts(): List<UmlPort> {
        val cx = centerX
        val cy = centerY
        val r = x + width
        val b = y + height

        return when (type) {
            UmlNodeType.LIFELINE -> listOf(
                UmlPort(id, UmlPortPosition.NORTH, cx, y),
                UmlPort(id, UmlPortPosition.WEST, x, y + 25f),
                UmlPort(id, UmlPortPosition.EAST, r, y + 25f),
                UmlPort(id, UmlPortPosition.SOUTH, cx, y + 50f),
                UmlPort(id, UmlPortPosition.LIFELINE_END, cx, b)
            )
            UmlNodeType.FORK_JOIN -> listOf(
                UmlPort(id, UmlPortPosition.NORTH, cx, y),
                UmlPort(id, UmlPortPosition.SOUTH, cx, b),
                UmlPort(id, UmlPortPosition.WEST, x, cy),
                UmlPort(id, UmlPortPosition.EAST, r, cy)
            )
            UmlNodeType.INITIAL_NODE, UmlNodeType.FINAL_NODE -> listOf(
                UmlPort(id, UmlPortPosition.NORTH, cx, y),
                UmlPort(id, UmlPortPosition.SOUTH, cx, b),
                UmlPort(id, UmlPortPosition.WEST, x, cy),
                UmlPort(id, UmlPortPosition.EAST, r, cy)
            )
            else -> listOf(
                UmlPort(id, UmlPortPosition.NORTH, cx, y),
                UmlPort(id, UmlPortPosition.SOUTH, cx, b),
                UmlPort(id, UmlPortPosition.WEST, x, cy),
                UmlPort(id, UmlPortPosition.EAST, r, cy),
                UmlPort(id, UmlPortPosition.NORTH_WEST, x, y),
                UmlPort(id, UmlPortPosition.NORTH_EAST, r, y),
                UmlPort(id, UmlPortPosition.SOUTH_WEST, x, b),
                UmlPort(id, UmlPortPosition.SOUTH_EAST, r, b)
            )
        }
    }

    fun getPort(position: UmlPortPosition): UmlPort? {
        return computePorts().firstOrNull { it.position == position }
    }

    fun copyMoved(dx: Float, dy: Float): UmlNode {
        return copy(x = x + dx, y = y + dy)
    }

    fun copyResized(newW: Float, newH: Float): UmlNode {
        return copy(width = newW.coerceAtLeast(40f), height = newH.coerceAtLeast(30f))
    }
}
