package com.antigravity.note.inkengine.probe

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.os.SystemClock
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import kotlin.math.cos
import kotlin.math.sin

/**
 * High-performance interactive diagnostic view for stylus and device probing.
 * Zero-allocation during active drawing and touch event handling.
 */
class ProbeInteractiveView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    var probeController: DeviceProbeController? = null

    // Pre-allocated drawing objects to prevent GC churn in 144 Hz path
    private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
        color = Color.parseColor("#005AC1")
        strokeWidth = 6f
    }

    private val historicalPointPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.parseColor("#BA1A1A")
    }

    private val contactEllipsePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2f
        color = Color.parseColor("#44FF9800")
    }

    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.DKGRAY
        textSize = 32f
    }

    private val tiltNeedlePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 4f
        color = Color.parseColor("#2E7D32")
    }

    private val currentPath = Path()
    private val contactRect = RectF()

    private var activePointerX = 0f
    private var activePointerY = 0f
    private var activePressure = 0f
    private var activeTiltDeg = 0f
    private var activeOrientationRad = 0f
    private var activeTouchMajor = 0f
    private var activeTouchMinor = 0f
    private var isPenActive = false

    // Historical points buffer (pre-allocated ring buffer of 128 points)
    private val maxHist = 128
    private val histX = FloatArray(maxHist)
    private val histY = FloatArray(maxHist)
    private var histCount = 0

    init {
        isFocusable = true
        isFocusableInTouchMode = true
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        // Enforce unbuffered dispatch for low latency
        requestUnbufferedDispatch(event)

        val telemetry = probeController?.onMotionEvent(event)

        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                currentPath.reset()
                currentPath.moveTo(event.x, event.y)
                isPenActive = true
                capturePointers(event)
                invalidate()
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                isPenActive = true
                captureHistoricalPoints(event)
                capturePointers(event)
                currentPath.lineTo(event.x, event.y)
                invalidate()
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                isPenActive = false
                invalidate()
                return true
            }
        }

        return super.onTouchEvent(event)
    }

    override fun onGenericMotionEvent(event: MotionEvent): Boolean {
        if (event.actionMasked == MotionEvent.ACTION_HOVER_MOVE ||
            event.actionMasked == MotionEvent.ACTION_HOVER_ENTER ||
            event.actionMasked == MotionEvent.ACTION_HOVER_EXIT) {
            requestUnbufferedDispatch(event)
            probeController?.onMotionEvent(event)
            capturePointers(event)
            invalidate()
            return true
        }
        return super.onGenericMotionEvent(event)
    }

    private fun capturePointers(event: MotionEvent) {
        val index = event.actionIndex.coerceIn(0, (event.pointerCount - 1).coerceAtLeast(0))
        activePointerX = event.getX(index)
        activePointerY = event.getY(index)
        activePressure = event.getPressure(index)
        val tiltRad = event.getAxisValue(MotionEvent.AXIS_TILT, index)
        activeTiltDeg = Math.toDegrees(tiltRad.toDouble()).toFloat()
        activeOrientationRad = event.getAxisValue(MotionEvent.AXIS_ORIENTATION, index)
        activeTouchMajor = event.getTouchMajor(index)
        activeTouchMinor = event.getTouchMinor(index)
    }

    private fun captureHistoricalPoints(event: MotionEvent) {
        val count = event.historySize.coerceAtMost(maxHist)
        histCount = count
        for (i in 0 until count) {
            histX[i] = event.getHistoricalX(i)
            histY[i] = event.getHistoricalY(i)
        }
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // Draw interactive stroke path
        canvas.drawPath(currentPath, strokePaint)

        // Draw historical batch samples (red dots showing digitizer micro-points)
        for (i in 0 until histCount) {
            canvas.drawCircle(histX[i], histY[i], 3f, historicalPointPaint)
        }

        if (isPenActive || activePressure > 0f) {
            // Draw contact geometry ellipse (touchMajor / touchMinor)
            val halfMajor = (activeTouchMajor.coerceAtLeast(8f)) / 2f
            val halfMinor = (activeTouchMinor.coerceAtLeast(8f)) / 2f
            contactRect.set(
                activePointerX - halfMajor,
                activePointerY - halfMinor,
                activePointerX + halfMajor,
                activePointerY + halfMinor
            )
            canvas.drawOval(contactRect, contactEllipsePaint)

            // Draw pressure indicator circle (radius scaled by pressure)
            val pressureRadius = (activePressure * 40f).coerceAtLeast(4f)
            strokePaint.strokeWidth = (activePressure * 16f).coerceAtLeast(2f)
            canvas.drawCircle(activePointerX, activePointerY, pressureRadius, strokePaint)

            // Draw tilt & orientation needle
            if (activeTiltDeg > 0.5f) {
                val needleLen = (activeTiltDeg / 90f) * 80f
                val endX = activePointerX + (needleLen * cos(activeOrientationRad.toDouble())).toFloat()
                val endY = activePointerY + (needleLen * sin(activeOrientationRad.toDouble())).toFloat()
                canvas.drawLine(activePointerX, activePointerY, endX, endY, tiltNeedlePaint)
                canvas.drawCircle(endX, endY, 5f, tiltNeedlePaint)
            }
        }
    }

    fun clearCanvas() {
        currentPath.reset()
        histCount = 0
        invalidate()
    }
}
