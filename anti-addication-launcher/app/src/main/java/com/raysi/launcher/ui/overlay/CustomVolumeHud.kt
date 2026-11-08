// app/src/main/java/com/raysi/launcher/ui/overlay/CustomVolumeHud.kt
package com.raysi.launcher.ui.overlay

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ObjectAnimator
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.media.AudioManager
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView

/**
 * CustomVolumeHud:
 * High-contrast, monospaced volume HUD rendered via TYPE_ACCESSIBILITY_OVERLAY
 * when hardware volume keys are clicked. Replaces the OEM volume panel.
 *
 * Layout:
 *   VOL  [==========------] 62%
 *   MEDIA · MONOSPACE
 *
 * Auto-dismisses with a fast alpha fade after 1500ms of inactivity.
 */
object CustomVolumeHud {

    private const val AUTO_DISMISS_DELAY_MS = 1500L
    private const val FADE_DURATION_MS = 150L
    private const val TOTAL_BAR_SEGMENTS = 16

    private val mainHandler = Handler(Looper.getMainLooper())
    private var activeHudView: View? = null
    private var line1View: TextView? = null
    private var line2View: TextView? = null
    private var dismissRunnable: Runnable? = null
    private var fadeAnimator: ObjectAnimator? = null

    fun show(context: Context, streamType: Int = AudioManager.STREAM_MUSIC) {
        val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager ?: return
        val current = audioManager.getStreamVolume(streamType)
        val max = audioManager.getStreamMaxVolume(streamType).coerceAtLeast(1)
        val min = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            audioManager.getStreamMinVolume(streamType)
        } else {
            0
        }

        val range = (max - min).coerceAtLeast(1)
        val pct = (((current - min).toFloat() / range.toFloat()) * 100).toInt().coerceIn(0, 100)

        val barText = buildVolumeBar(pct)
        val streamLabel = when (streamType) {
            AudioManager.STREAM_VOICE_CALL -> "CALL · MONOSPACE"
            AudioManager.STREAM_RING -> "RING · MONOSPACE"
            AudioManager.STREAM_ALARM -> "ALARM · MONOSPACE"
            AudioManager.STREAM_NOTIFICATION -> "NOTIF · MONOSPACE"
            else -> "MEDIA · MONOSPACE"
        }

        mainHandler.post {
            updateOrDisplay(context, barText, streamLabel)
        }
    }

    private fun updateOrDisplay(context: Context, line1Text: String, line2Text: String) {
        // Cancel existing dismiss & animation
        dismissRunnable?.let { mainHandler.removeCallbacks(it) }
        fadeAnimator?.cancel()

        if (activeHudView != null && line1View != null && line2View != null) {
            // Update existing view in-place (zero re-allocation)
            activeHudView?.alpha = 1.0f
            line1View?.text = line1Text
            line2View?.text = line2Text
            scheduleDismiss(context)
            return
        }

        val wm = context.getSystemService(Context.WINDOW_SERVICE) as? WindowManager ?: return

        val density = context.resources.displayMetrics.density
        val padH = (16 * density).toInt()
        val padV = (12 * density).toInt()

        // Pure black container with subtle 1dp border
        val backgroundDrawable = GradientDrawable().apply {
            setColor(Color.parseColor("#F5000000"))
            cornerRadius = 8 * density
            setStroke((1 * density).toInt(), Color.parseColor("#333333"))
        }

        val container = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            background = backgroundDrawable
            setPadding(padH, padV, padH, padV)
            alpha = 1.0f
        }

        val tv1 = TextView(context).apply {
            text = line1Text
            setTextColor(Color.WHITE)
            typeface = Typeface.MONOSPACE
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
        }
        val tv2 = TextView(context).apply {
            text = line2Text
            setTextColor(Color.parseColor("#888888"))
            typeface = Typeface.MONOSPACE
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f)
            setPadding(0, (4 * density).toInt(), 0, 0)
        }

        container.addView(tv1)
        container.addView(tv2)

        line1View = tv1
        line2View = tv2

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.END
            x = (20 * density).toInt()
            y = (64 * density).toInt()
        }

        try {
            wm.addView(container, params)
            activeHudView = container
            scheduleDismiss(context)
        } catch (_: Exception) {
            activeHudView = null
        }
    }

    private fun scheduleDismiss(context: Context) {
        val runnable = Runnable {
            val view = activeHudView ?: return@Runnable
            fadeAnimator = ObjectAnimator.ofFloat(view, View.ALPHA, 1.0f, 0.0f).apply {
                duration = FADE_DURATION_MS
                addListener(object : AnimatorListenerAdapter() {
                    override fun onAnimationEnd(animation: Animator) {
                        dismissNow(context)
                    }
                })
                start()
            }
        }
        dismissRunnable = runnable
        mainHandler.postDelayed(runnable, AUTO_DISMISS_DELAY_MS)
    }

    fun dismissNow(context: Context) {
        dismissRunnable?.let { mainHandler.removeCallbacks(it) }
        dismissRunnable = null
        fadeAnimator?.cancel()
        fadeAnimator = null

        activeHudView?.let { view ->
            try {
                val wm = context.getSystemService(Context.WINDOW_SERVICE) as? WindowManager
                wm?.removeView(view)
            } catch (_: Exception) {}
            activeHudView = null
            line1View = null
            line2View = null
        }
    }

    private fun buildVolumeBar(pct: Int): String {
        val filled = ((pct * TOTAL_BAR_SEGMENTS) / 100).coerceIn(0, TOTAL_BAR_SEGMENTS)
        val empty = TOTAL_BAR_SEGMENTS - filled

        return buildString(32) {
            append("VOL  [")
            repeat(filled) { append('=') }
            repeat(empty) { append('-') }
            append("] ")
            append(pct)
            append('%')
        }
    }
}
