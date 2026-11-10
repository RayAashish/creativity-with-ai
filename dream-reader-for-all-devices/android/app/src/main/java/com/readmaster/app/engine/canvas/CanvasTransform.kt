package com.readmaster.app.engine.canvas

import android.graphics.Matrix
import android.graphics.PointF
import android.graphics.RectF

/**
 * High-performance 2D canvas transform for pan and pinch-zoom.
 * Zero allocations during active gesture handling.
 */
class CanvasTransform {
    var scale = 1.0f
        private set
    var translationX = 0.0f
        private set
    var translationY = 0.0f
        private set

    val minScale = 0.5f
    val maxScale = 10.0f

    // Pre-allocated matrices
    val worldToScreenMatrix = Matrix()
    val screenToWorldMatrix = Matrix()

    private val tempPoints = FloatArray(2)

    init {
        updateMatrices()
    }

    fun setTransform(newScale: Float, newTx: Float, newTy: Float) {
        scale = newScale.coerceIn(minScale, maxScale)
        translationX = newTx
        translationY = newTy
        updateMatrices()
    }

    fun postTranslate(dx: Float, dy: Float) {
        translationX += dx
        translationY += dy
        updateMatrices()
    }

    fun postScale(factor: Float, focusX: Float, focusY: Float) {
        val oldScale = scale
        scale = (scale * factor).coerceIn(minScale, maxScale)
        val actualFactor = scale / oldScale

        // Zoom centered on focus point
        translationX = focusX - (focusX - translationX) * actualFactor
        translationY = focusY - (focusY - translationY) * actualFactor
        updateMatrices()
    }

    fun reset() {
        scale = 1.0f
        translationX = 0.0f
        translationY = 0.0f
        updateMatrices()
    }

    private fun updateMatrices() {
        worldToScreenMatrix.reset()
        worldToScreenMatrix.postScale(scale, scale)
        worldToScreenMatrix.postTranslate(translationX, translationY)

        worldToScreenMatrix.invert(screenToWorldMatrix)
    }

    /**
     * Map screen coordinates to canvas world coordinates.
     */
    fun screenToWorld(screenX: Float, screenY: Float, outPoint: PointF) {
        tempPoints[0] = screenX
        tempPoints[1] = screenY
        screenToWorldMatrix.mapPoints(tempPoints)
        outPoint.x = tempPoints[0]
        outPoint.y = tempPoints[1]
    }

    /**
     * Map world coordinates to screen coordinates.
     */
    fun worldToScreen(worldX: Float, worldY: Float, outPoint: PointF) {
        tempPoints[0] = worldX
        tempPoints[1] = worldY
        worldToScreenMatrix.mapPoints(tempPoints)
        outPoint.x = tempPoints[0]
        outPoint.y = tempPoints[1]
    }

    /**
     * Map screen rect to world rect.
     */
    fun screenToWorld(rect: RectF) {
        screenToWorldMatrix.mapRect(rect)
    }
}
