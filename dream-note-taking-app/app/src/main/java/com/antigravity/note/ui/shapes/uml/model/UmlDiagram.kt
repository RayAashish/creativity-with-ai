package com.antigravity.note.ui.shapes.uml.model

import android.graphics.RectF
import java.util.UUID

/**
 * Top-level UML Diagram model.
 * Serializable to JSON for embedding within .inkflow documents or page assets.
 */
data class UmlDiagram(
    val id: String = UUID.randomUUID().toString(),
    val version: Int = 1,
    val title: String = "UML Diagram",
    val viewportZoom: Float = 1.0f,
    val viewportPanX: Float = 0f,
    val viewportPanY: Float = 0f,
    val nodes: List<UmlNode> = emptyList(),
    val edges: List<UmlEdge> = emptyList(),
    val isDarkMode: Boolean = false
) {
    fun findNode(id: String): UmlNode? = nodes.firstOrNull { it.id == id }

    fun findEdge(id: String): UmlEdge? = edges.firstOrNull { it.id == id }

    fun computeBoundingBox(): RectF {
        if (nodes.isEmpty()) return RectF(0f, 0f, 600f, 400f)
        var minX = Float.MAX_VALUE
        var minY = Float.MAX_VALUE
        var maxX = -Float.MAX_VALUE
        var maxY = -Float.MAX_VALUE
        for (n in nodes) {
            val b = n.getBounds()
            if (b.left < minX) minX = b.left
            if (b.top < minY) minY = b.top
            if (b.right > maxX) maxX = b.right
            if (b.bottom > maxY) maxY = b.bottom
        }
        return RectF(minX, minY, maxX, maxY)
    }

    fun copyWithUpdatedNode(node: UmlNode): UmlDiagram {
        return copy(nodes = nodes.map { if (it.id == node.id) node else it })
    }

    fun copyWithUpdatedEdge(edge: UmlEdge): UmlDiagram {
        return copy(edges = edges.map { if (it.id == edge.id) edge else it })
    }

    fun copyWithoutNode(nodeId: String): UmlDiagram {
        return copy(
            nodes = nodes.filter { it.id != nodeId },
            edges = edges.filter { it.sourceNodeId != nodeId && it.targetNodeId != nodeId }
        )
    }

    fun copyWithoutEdge(edgeId: String): UmlDiagram {
        return copy(edges = edges.filter { it.id != edgeId })
    }
}
