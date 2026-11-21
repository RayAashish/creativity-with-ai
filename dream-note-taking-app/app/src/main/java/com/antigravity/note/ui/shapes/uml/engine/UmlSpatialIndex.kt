package com.antigravity.note.ui.shapes.uml.engine

import android.graphics.PointF
import android.graphics.RectF
import com.antigravity.note.ui.shapes.uml.model.UmlDiagram
import com.antigravity.note.ui.shapes.uml.model.UmlEdge
import com.antigravity.note.ui.shapes.uml.model.UmlNode
import com.antigravity.note.ui.shapes.uml.model.UmlPort

enum class ResizeHandlePosition {
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
}

/**
 * Fast spatial hit-testing engine for mobile and stylus interactions.
 * Enforces minimum 48dp touch slops for handles and ports to guarantee
 * effortless touch targeting on Moto Pad 70 Pro and other tablets.
 */
object UmlSpatialIndex {

    fun hitTestNode(worldX: Float, worldY: Float, nodes: List<UmlNode>): UmlNode? {
        // Iterate backwards so top-most rendered nodes receive hits first
        for (i in nodes.indices.reversed()) {
            val node = nodes[i]
            if (node.contains(worldX, worldY)) {
                return node
            }
        }
        return null
    }

    fun hitTestPort(worldX: Float, worldY: Float, nodes: List<UmlNode>, touchSlopPx: Float = 48f): UmlPort? {
        var closestPort: UmlPort? = null
        var minDistance = touchSlopPx

        for (node in nodes) {
            val ports = node.computePorts()
            for (p in ports) {
                val dist = p.distanceTo(worldX, worldY)
                if (dist < minDistance) {
                    minDistance = dist
                    closestPort = p
                }
            }
        }
        return closestPort
    }

    fun hitTestResizeHandle(
        worldX: Float,
        worldY: Float,
        selectedNode: UmlNode?,
        touchSlopPx: Float = 48f
    ): ResizeHandlePosition? {
        if (selectedNode == null) return null
        val b = selectedNode.getBounds()

        val handles = listOf(
            ResizeHandlePosition.TOP_LEFT to PointF(b.left, b.top),
            ResizeHandlePosition.TOP_RIGHT to PointF(b.right, b.top),
            ResizeHandlePosition.BOTTOM_LEFT to PointF(b.left, b.bottom),
            ResizeHandlePosition.BOTTOM_RIGHT to PointF(b.right, b.bottom)
        )

        for ((pos, pt) in handles) {
            val dx = pt.x - worldX
            val dy = pt.y - worldY
            if (kotlin.math.sqrt(dx * dx + dy * dy) <= touchSlopPx) {
                return pos
            }
        }
        return null
    }

    fun hitTestEdge(
        worldX: Float,
        worldY: Float,
        diagram: UmlDiagram,
        tolerancePx: Float = 32f
    ): UmlEdge? {
        for (edge in diagram.edges) {
            val sourceNode = diagram.findNode(edge.sourceNodeId) ?: continue
            val targetNode = diagram.findNode(edge.targetNodeId) ?: continue
            val sPort = sourceNode.getPort(edge.sourcePortPosition) ?: continue
            val tPort = targetNode.getPort(edge.targetPortPosition) ?: continue

            val waypoints = OrthogonalRouter.computeWaypoints(
                sPort.x, sPort.y, sPort.position,
                tPort.x, tPort.y, tPort.position,
                edge.routingMode
            )

            for (i in 0 until waypoints.size - 1) {
                val p1 = waypoints[i]
                val p2 = waypoints[i + 1]
                if (distancePointToSegment(worldX, worldY, p1.x, p1.y, p2.x, p2.y) <= tolerancePx) {
                    return edge
                }
            }
        }
        return null
    }

    private fun distancePointToSegment(px: Float, py: Float, x1: Float, y1: Float, x2: Float, y2: Float): Float {
        val l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
        if (l2 == 0f) {
            val dx = px - x1
            val dy = py - y1
            return kotlin.math.sqrt(dx * dx + dy * dy)
        }
        var t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2
        t = t.coerceIn(0f, 1f)
        val projX = x1 + t * (x2 - x1)
        val projY = y1 + t * (y2 - y1)
        val dx = px - projX
        val dy = py - projY
        return kotlin.math.sqrt(dx * dx + dy * dy)
    }
}
