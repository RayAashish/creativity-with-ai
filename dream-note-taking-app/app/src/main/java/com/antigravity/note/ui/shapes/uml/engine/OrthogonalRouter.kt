package com.antigravity.note.ui.shapes.uml.engine

import android.graphics.Path
import com.antigravity.note.ui.shapes.uml.model.UmlPoint
import com.antigravity.note.ui.shapes.uml.model.UmlPortPosition
import com.antigravity.note.ui.shapes.uml.model.UmlRoutingMode
import kotlin.math.abs

/**
 * Smart Orthogonal & Dynamic Connector Router for UML.
 * Computes 90° elbow waypoints between source and target anchor ports.
 */
object OrthogonalRouter {

    fun computeWaypoints(
        sx: Float, sy: Float, sPos: UmlPortPosition,
        tx: Float, ty: Float, tPos: UmlPortPosition,
        mode: UmlRoutingMode
    ): List<UmlPoint> {
        val points = mutableListOf<UmlPoint>()
        points.add(UmlPoint(sx, sy))

        when (mode) {
            UmlRoutingMode.STRAIGHT -> {
                points.add(UmlPoint(tx, ty))
                return points
            }
            UmlRoutingMode.CURVED -> {
                points.add(UmlPoint(tx, ty))
                return points
            }
            UmlRoutingMode.ORTHOGONAL -> {
                val isHorizontalExit = (sPos == UmlPortPosition.EAST || sPos == UmlPortPosition.WEST)
                val isHorizontalEntry = (tPos == UmlPortPosition.EAST || tPos == UmlPortPosition.WEST)

                if (isHorizontalExit && isHorizontalEntry) {
                    val midX = (sx + tx) / 2f
                    if ((sPos == UmlPortPosition.EAST && tx > sx + 30f) || (sPos == UmlPortPosition.WEST && tx < sx - 30f)) {
                        points.add(UmlPoint(midX, sy))
                        points.add(UmlPoint(midX, ty))
                    } else {
                        val offset = if (sPos == UmlPortPosition.EAST) 40f else -40f
                        val midY = (sy + ty) / 2f
                        points.add(UmlPoint(sx + offset, sy))
                        points.add(UmlPoint(sx + offset, midY))
                        points.add(UmlPoint(tx - offset, midY))
                        points.add(UmlPoint(tx - offset, ty))
                    }
                } else if (!isHorizontalExit && !isHorizontalEntry) {
                    val midY = (sy + ty) / 2f
                    if ((sPos == UmlPortPosition.SOUTH && ty > sy + 30f) || (sPos == UmlPortPosition.NORTH && ty < sy - 30f)) {
                        points.add(UmlPoint(sx, midY))
                        points.add(UmlPoint(tx, midY))
                    } else {
                        val offset = if (sPos == UmlPortPosition.SOUTH) 40f else -40f
                        val midX = (sx + tx) / 2f
                        points.add(UmlPoint(sx, sy + offset))
                        points.add(UmlPoint(midX, sy + offset))
                        points.add(UmlPoint(midX, ty - offset))
                        points.add(UmlPoint(tx, ty - offset))
                    }
                } else if (isHorizontalExit && !isHorizontalEntry) {
                    points.add(UmlPoint(tx, sy))
                } else {
                    points.add(UmlPoint(sx, ty))
                }

                points.add(UmlPoint(tx, ty))
                return points
            }
        }
    }

    /**
     * Builds a smoothed Android Path from waypoints with optional rounded corners.
     */
    fun buildPath(waypoints: List<UmlPoint>, mode: UmlRoutingMode, path: Path) {
        path.reset()
        if (waypoints.isEmpty()) return
        val start = waypoints.first()
        path.moveTo(start.x, start.y)

        if (mode == UmlRoutingMode.CURVED && waypoints.size == 2) {
            val end = waypoints.last()
            val dx = end.x - start.x
            val dy = end.y - start.y
            val cx1 = start.x + dx * 0.5f
            val cy1 = start.y
            val cx2 = start.x + dx * 0.5f
            val cy2 = end.y
            path.cubicTo(cx1, cy1, cx2, cy2, end.x, end.y)
            return
        }

        // Orthogonal or polyline with subtle rounded corners
        val cornerRadius = 12f
        for (i in 1 until waypoints.size) {
            val prev = waypoints[i - 1]
            val curr = waypoints[i]
            if (i < waypoints.size - 1 && mode == UmlRoutingMode.ORTHOGONAL) {
                val next = waypoints[i + 1]
                val dPrevX = curr.x - prev.x
                val dPrevY = curr.y - prev.y
                val dNextX = next.x - curr.x
                val dNextY = next.y - curr.y

                val lenPrev = kotlin.math.sqrt(dPrevX * dPrevX + dPrevY * dPrevY)
                val lenNext = kotlin.math.sqrt(dNextX * dNextX + dNextY * dNextY)
                val r = cornerRadius.coerceAtMost(lenPrev / 2f).coerceAtMost(lenNext / 2f)

                if (r > 1f) {
                    val pBeforeX = curr.x - (dPrevX / lenPrev) * r
                    val pBeforeY = curr.y - (dPrevY / lenPrev) * r
                    val pAfterX = curr.x + (dNextX / lenNext) * r
                    val pAfterY = curr.y + (dNextY / lenNext) * r

                    path.lineTo(pBeforeX, pBeforeY)
                    path.quadTo(curr.x, curr.y, pAfterX, pAfterY)
                    continue
                }
            }
            path.lineTo(curr.x, curr.y)
        }
    }
}
