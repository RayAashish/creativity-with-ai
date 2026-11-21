package com.antigravity.note.inkengine.laser

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.os.SystemClock
import android.view.Choreographer
import android.view.View

enum class LaserMode {
    TRAIL,
    DOT
}

enum class LaserDecayType {
    FADE_ON_LIFT,
    CONTINUOUS_TRAIL
}

/**
 * 100% GPU-accelerated, zero-allocation Laser Pointer overlay.
 * Renders dual-pass luminous neon strokes with authentic glowing halo and shining white core.
 * Features an idle-zero Choreographer animation loop (0% idle battery/CPU).
 */
class LaserPointerOverlay(private val hostView: View) {

    companion object {
        const val COLOR_CRIMSON_RED = 0xFFFF2A55.toInt()
        const val COLOR_CYAN = 0xFF00F0FF.toInt()
        const val COLOR_GOLD = 0xFFFFB800.toInt()
        const val COLOR_EMERALD = 0xFF00E676.toInt()
        const val COLOR_VIOLET = 0xFFD500F9.toInt()

        private const val MAX_POINTS = 8192
        private const val MAX_STROKES = 128

        private const val BASE_OUTER_HALO_DP = 16f
        private const val BASE_MID_GLOW_DP = 10f
        private const val BASE_INNER_CORE_DP = 3.5f

        private const val ALPHA_OUTER_HALO = 0.22f
        private const val ALPHA_MID_GLOW = 0.45f
        private const val ALPHA_INNER_CORE = 0.95f
    }

    var mode: LaserMode = LaserMode.TRAIL
    var decayType: LaserDecayType = LaserDecayType.FADE_ON_LIFT
    var fadeDurationMs: Long = 1200L
        set(value) {
            field = value.coerceIn(500L, 600_000L) // Support up to 10 minutes (600,000ms)
        }

    var isLivePermanentGlowActive = false
        private set

    fun startLivePermanentGlow(x: Float, y: Float, timestamp: Long) {
        isLivePermanentGlowActive = true
        onActionDown(x, y, timestamp)
    }

    fun updateLivePermanentGlow(x: Float, y: Float, timestamp: Long) {
        if (!isLivePermanentGlowActive) return
        onActionMove(x, y, timestamp)
    }

    fun finishLivePermanentGlow() {
        if (!isLivePermanentGlowActive) return
        isLivePermanentGlowActive = false
        if (activeStrokeId in 0 until MAX_STROKES) {
            strokeIsActive[activeStrokeId] = false
            strokeLiftTimes[activeStrokeId] = 0L
        }
        pointCount = 0
        pointHead = 0
        isCurrentStrokeDown = false
        activeStrokeId = -1
        hostView.invalidate()
    }

    var neonColor: Int = COLOR_CRIMSON_RED
        set(value) {
            field = value
            updateColors()
        }

    var thicknessMultiplier: Float = 1.0f
        set(value) {
            field = value.coerceIn(0.5f, 3.0f)
            updatePaints()
        }

    var density: Float = hostView.resources.displayMetrics.density
        set(value) {
            field = value
            updatePaints()
        }

    // Pre-allocated ring buffer for points
    private val pointXs = FloatArray(MAX_POINTS)
    private val pointYs = FloatArray(MAX_POINTS)
    private val pointTimes = LongArray(MAX_POINTS)
    private val pointStrokeIndices = IntArray(MAX_POINTS)
    private var pointCount = 0
    private var pointHead = 0

    // Pre-allocated stroke metadata pool
    private val strokeLiftTimes = LongArray(MAX_STROKES)
    private val strokeIsActive = BooleanArray(MAX_STROKES)
    private val strokeColors = IntArray(MAX_STROKES)
    private val strokeInnerCoreColors = IntArray(MAX_STROKES)
    private val strokeMultipliers = FloatArray(MAX_STROKES)
    private var activeStrokeId = -1
    private var isCurrentStrokeDown = false

    // Current dot position for DOT mode
    private var dotX = 0f
    private var dotY = 0f
    private var dotLiftTime = 0L
    private var isDotDown = false

    // Pre-allocated drawing objects (Zero runtime allocations)
    private val strokePath = Path()

    private val outerHaloPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }
    private val midGlowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }
    private val innerCorePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    private val outerHaloFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }
    private val midGlowFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }
    private val innerCoreFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private var cachedInnerCoreColor: Int = computeInnerCoreColor(COLOR_CRIMSON_RED)

    // Animation loop state
    private var isAnimating = false
    private val frameCallback = object : Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (!isAnimating) return
            val hasActive = cleanExpiredPoints(SystemClock.uptimeMillis())
            hostView.invalidate()
            if (hasActive) {
                Choreographer.getInstance().postFrameCallback(this)
            } else {
                isAnimating = false
            }
        }
    }

    init {
        updateColors()
        updatePaints()
    }

    private fun updateColors() {
        cachedInnerCoreColor = computeInnerCoreColor(neonColor)
    }

    private fun updatePaints() {
        val outerHaloW = BASE_OUTER_HALO_DP * density * thicknessMultiplier
        val midGlowW = BASE_MID_GLOW_DP * density * thicknessMultiplier
        val innerCoreW = BASE_INNER_CORE_DP * density * thicknessMultiplier

        outerHaloPaint.strokeWidth = outerHaloW
        midGlowPaint.strokeWidth = midGlowW
        innerCorePaint.strokeWidth = innerCoreW
    }

    private fun computeInnerCoreColor(color: Int): Int {
        val r = (color ushr 16) and 0xFF
        val g = (color ushr 8) and 0xFF
        val b = color and 0xFF
        val coreR = (255 * 0.85f + r * 0.15f).toInt().coerceIn(0, 255)
        val coreG = (255 * 0.85f + g * 0.15f).toInt().coerceIn(0, 255)
        val coreB = (255 * 0.85f + b * 0.15f).toInt().coerceIn(0, 255)
        return (0xFF shl 24) or (coreR shl 16) or (coreG shl 8) or coreB
    }

    private fun ensureAnimationRunning() {
        if (!isAnimating) {
            isAnimating = true
            Choreographer.getInstance().postFrameCallback(frameCallback)
        }
    }

    fun onActionDown(worldX: Float, worldY: Float, timestamp: Long) {
        if (mode == LaserMode.DOT) {
            dotX = worldX
            dotY = worldY
            isDotDown = true
            dotLiftTime = 0L
            hostView.invalidate()
            return
        }

        // Mode: TRAIL
        activeStrokeId = (activeStrokeId + 1) % MAX_STROKES
        strokeIsActive[activeStrokeId] = true
        strokeLiftTimes[activeStrokeId] = 0L
        strokeColors[activeStrokeId] = neonColor
        strokeInnerCoreColors[activeStrokeId] = cachedInnerCoreColor
        strokeMultipliers[activeStrokeId] = thicknessMultiplier
        isCurrentStrokeDown = true

        addPointInternal(worldX, worldY, timestamp, activeStrokeId)
        hostView.invalidate()
    }

    fun onHistoricalMove(worldX: Float, worldY: Float, timestamp: Long) {
        if (mode == LaserMode.DOT) {
            dotX = worldX
            dotY = worldY
            return
        }
        if (isCurrentStrokeDown && activeStrokeId >= 0) {
            addPointInternal(worldX, worldY, timestamp, activeStrokeId)
        }
    }

    fun onActionMove(worldX: Float, worldY: Float, timestamp: Long) {
        if (mode == LaserMode.DOT) {
            dotX = worldX
            dotY = worldY
            hostView.invalidate()
            return
        }

        if (isCurrentStrokeDown && activeStrokeId >= 0) {
            addPointInternal(worldX, worldY, timestamp, activeStrokeId)
            hostView.invalidate()
            if (decayType == LaserDecayType.CONTINUOUS_TRAIL) {
                ensureAnimationRunning()
            }
        }
    }

    fun onActionUp(timestamp: Long) {
        val now = if (timestamp > 0L) timestamp else SystemClock.uptimeMillis()
        if (mode == LaserMode.DOT) {
            isDotDown = false
            dotLiftTime = now
            ensureAnimationRunning()
            hostView.invalidate()
            return
        }

        if (isCurrentStrokeDown && activeStrokeId >= 0) {
            strokeLiftTimes[activeStrokeId] = now
            isCurrentStrokeDown = false
            ensureAnimationRunning()
            hostView.invalidate()
        }
    }

    fun onActionCancel() {
        onActionUp(SystemClock.uptimeMillis())
    }

    private fun addPointInternal(x: Float, y: Float, time: Long, strokeId: Int) {
        val idx = pointHead
        pointXs[idx] = x
        pointYs[idx] = y
        pointTimes[idx] = time
        pointStrokeIndices[idx] = strokeId

        pointHead = (pointHead + 1) % MAX_POINTS
        if (pointCount < MAX_POINTS) {
            pointCount++
        }
    }

    /**
     * Cleans expired points and strokes. Returns true if there are still visible decaying points.
     */
    private fun cleanExpiredPoints(now: Long): Boolean {
        var hasVisible = false

        if (mode == LaserMode.DOT) {
            if (isDotDown) return true
            if (dotLiftTime > 0L) {
                val elapsed = now - dotLiftTime
                if (elapsed < fadeDurationMs) {
                    return true
                } else {
                    dotLiftTime = 0L
                    return false
                }
            }
            return false
        }

        // For TRAIL mode
        // 1. Check active strokes
        for (s in 0 until MAX_STROKES) {
            if (strokeIsActive[s]) {
                val liftTime = strokeLiftTimes[s]
                if (liftTime == 0L) {
                    // Still actively being drawn
                    hasVisible = true
                } else {
                    val elapsed = now - liftTime
                    if (elapsed >= fadeDurationMs) {
                        strokeIsActive[s] = false
                    } else {
                        hasVisible = true
                    }
                }
            }
        }

        // 2. Check continuous trail decay if active
        if (decayType == LaserDecayType.CONTINUOUS_TRAIL && pointCount > 0) {
            var activePoints = 0
            val startIdx = (pointHead - pointCount + MAX_POINTS) % MAX_POINTS
            for (i in 0 until pointCount) {
                val idx = (startIdx + i) % MAX_POINTS
                val elapsed = now - pointTimes[idx]
                if (elapsed < fadeDurationMs) {
                    activePoints++
                }
            }
            if (activePoints > 0) {
                hasVisible = true
            }
        }

        if (!hasVisible && !isCurrentStrokeDown) {
            // Clean slate when all faded
            pointCount = 0
            pointHead = 0
        }

        return hasVisible || isCurrentStrokeDown
    }

    /**
     * Draws the laser overlay on the canvas.
     * Note: Expects canvas to already be in world space (matching DryInkCanvasView transform).
     */
    fun draw(canvas: Canvas) {
        val now = SystemClock.uptimeMillis()

        if (mode == LaserMode.DOT) {
            drawDot(canvas, now)
            return
        }

        drawTrails(canvas, now)
    }

    private fun drawDot(canvas: Canvas, now: Long) {
        val fadeFactor = when {
            isDotDown -> 1.0f
            dotLiftTime > 0L -> {
                val elapsed = now - dotLiftTime
                if (elapsed >= fadeDurationMs) 0f
                else {
                    val p = (elapsed.toFloat() / fadeDurationMs).coerceIn(0f, 1f)
                    (1f - p) * (1f - p) * (1f - p) // Smooth cubic ease-out
                }
            }
            else -> 0f
        }

        if (fadeFactor <= 0.001f) return

        val outerR = BASE_OUTER_HALO_DP * density * thicknessMultiplier
        val midR = BASE_MID_GLOW_DP * density * thicknessMultiplier
        val coreR = BASE_INNER_CORE_DP * density * thicknessMultiplier

        // Outer halo
        val outerAlpha = (255 * ALPHA_OUTER_HALO * fadeFactor).toInt().coerceIn(0, 255)
        outerHaloFillPaint.color = (neonColor and 0x00FFFFFF) or (outerAlpha shl 24)
        canvas.drawCircle(dotX, dotY, outerR, outerHaloFillPaint)

        // Mid glow
        val midAlpha = (255 * ALPHA_MID_GLOW * fadeFactor).toInt().coerceIn(0, 255)
        midGlowFillPaint.color = (neonColor and 0x00FFFFFF) or (midAlpha shl 24)
        canvas.drawCircle(dotX, dotY, midR, midGlowFillPaint)

        // Inner core
        val coreAlpha = (255 * ALPHA_INNER_CORE * fadeFactor).toInt().coerceIn(0, 255)
        innerCoreFillPaint.color = (cachedInnerCoreColor and 0x00FFFFFF) or (coreAlpha shl 24)
        canvas.drawCircle(dotX, dotY, coreR, innerCoreFillPaint)
    }

    private fun drawTrails(canvas: Canvas, now: Long) {
        if (pointCount < 2) return

        val startIdx = (pointHead - pointCount + MAX_POINTS) % MAX_POINTS

        // Iterate per active stroke
        for (s in 0 until MAX_STROKES) {
            if (!strokeIsActive[s]) continue

            val liftTime = strokeLiftTimes[s]
            val strokeFade: Float = when {
                liftTime == 0L -> 1.0f // Still drawing
                else -> {
                    val elapsed = now - liftTime
                    if (elapsed >= fadeDurationMs) 0f
                    else {
                        val p = (elapsed.toFloat() / fadeDurationMs).coerceIn(0f, 1f)
                        (1f - p) * (1f - p) * (1f - p) // Cubic ease-out
                    }
                }
            }

            if (strokeFade <= 0.001f) continue

            val sColor = strokeColors[s]
            val sCoreColor = strokeInnerCoreColors[s]
            val mult = strokeMultipliers[s]

            val haloW = BASE_OUTER_HALO_DP * density * mult
            val midW = BASE_MID_GLOW_DP * density * mult
            val coreW = BASE_INNER_CORE_DP * density * mult

            outerHaloPaint.strokeWidth = haloW
            midGlowPaint.strokeWidth = midW
            innerCorePaint.strokeWidth = coreW

            // Build smooth Quadratic Bézier path for stroke s
            strokePath.rewind()
            var strokePointCount = 0
            var prevX = 0f
            var prevY = 0f

            for (i in 0 until pointCount) {
                val idx = (startIdx + i) % MAX_POINTS
                if (pointStrokeIndices[idx] != s) continue

                // Check continuous comet trail decay if enabled
                if (decayType == LaserDecayType.CONTINUOUS_TRAIL) {
                    val ptElapsed = now - pointTimes[idx]
                    if (ptElapsed >= fadeDurationMs) continue
                }

                val px = pointXs[idx]
                val py = pointYs[idx]

                if (strokePointCount == 0) {
                    strokePath.moveTo(px, py)
                } else if (strokePointCount == 1) {
                    strokePath.lineTo(px, py)
                } else {
                    val midX = (prevX + px) * 0.5f
                    val midY = (prevY + py) * 0.5f
                    strokePath.quadTo(prevX, prevY, midX, midY)
                }
                prevX = px
                prevY = py
                strokePointCount++
            }

            if (strokePointCount >= 2) {
                strokePath.lineTo(prevX, prevY)

                // 1. Wide Outer Halo Pass
                val haloAlpha = (255 * ALPHA_OUTER_HALO * strokeFade).toInt().coerceIn(0, 255)
                outerHaloPaint.color = (sColor and 0x00FFFFFF) or (haloAlpha shl 24)
                canvas.drawPath(strokePath, outerHaloPaint)

                // 2. Mid Glow Pass
                val midAlpha = (255 * ALPHA_MID_GLOW * strokeFade).toInt().coerceIn(0, 255)
                midGlowPaint.color = (sColor and 0x00FFFFFF) or (midAlpha shl 24)
                canvas.drawPath(strokePath, midGlowPaint)

                // 3. Crisp Luminous Inner Core Pass
                val coreAlpha = (255 * ALPHA_INNER_CORE * strokeFade).toInt().coerceIn(0, 255)
                innerCorePaint.color = (sCoreColor and 0x00FFFFFF) or (coreAlpha shl 24)
                canvas.drawPath(strokePath, innerCorePaint)
            }
        }
    }

    fun clear() {
        pointCount = 0
        pointHead = 0
        for (i in 0 until MAX_STROKES) {
            strokeIsActive[i] = false
            strokeLiftTimes[i] = 0L
        }
        isCurrentStrokeDown = false
        activeStrokeId = -1
        isDotDown = false
        dotLiftTime = 0L
        isAnimating = false
        hostView.invalidate()
    }

    fun hasActiveContent(): Boolean {
        if (mode == LaserMode.DOT) {
            return isDotDown || dotLiftTime > 0L
        }
        return pointCount > 0 || isCurrentStrokeDown
    }
}
