// app/src/main/java/com/raysi/launcher/service/FocusAccessibilityService.kt
package com.raysi.launcher.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.media.AudioManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.telecom.TelecomManager
import android.util.TypedValue
import android.view.Gravity
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.inputmethod.InputMethodManager
import android.widget.LinearLayout
import android.widget.TextView
import com.raysi.launcher.FocusApplication
import com.raysi.launcher.data.model.ActiveSessionEntry
import com.raysi.launcher.data.model.LauncherSettingsSnapshot
import com.raysi.launcher.ui.MainActivity
import com.raysi.launcher.ui.overlay.CustomVolumeHud
import com.raysi.launcher.util.SystemThemingHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.lang.ref.WeakReference

/**
 * FocusAccessibilityService:
 * 1. Hardware Volume Key Interception -> Custom Monospaced Volume HUD.
 * 2. In-App Floating Session Pill (Watchdog) on blacklisted apps: "⏱ 03:42 / 10:00 [exit]".
 * 3. Double-tap to lock screen execution (GLOBAL_ACTION_LOCK_SCREEN).
 * 4. System-wide anti-dopamine hardware grayscale switching.
 * 5. Distracting app bypass interceptor & session expiry enforcement.
 */
class FocusAccessibilityService : AccessibilityService() {

    companion object {
        private var instanceRef: WeakReference<FocusAccessibilityService>? = null

        /**
         * Executes double-tap screen lock.
         */
        fun lockScreen(): Boolean {
            val service = instanceRef?.get() ?: return false
            return service.performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN)
        }
    }

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private var activeOverlayView: View? = null
    private var activeFloatingPillView: View? = null
    private var floatingPillJob: Job? = null
    private var currentForegroundPackage: String? = null

    private val vibrator: Vibrator by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instanceRef = WeakReference(this)

        // Ensure key event filtering flag is explicitly set
        val info = serviceInfo ?: AccessibilityServiceInfo()
        info.flags = info.flags or AccessibilityServiceInfo.FLAG_REQUEST_FILTER_KEY_EVENTS
        serviceInfo = info
    }

    override fun onKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN) {
            when (event.keyCode) {
                KeyEvent.KEYCODE_VOLUME_UP -> {
                    val audioManager = getSystemService(Context.AUDIO_SERVICE) as? AudioManager
                    // Flag 0 suppresses the colorful OEM volume slider popup
                    audioManager?.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_RAISE, 0)
                    CustomVolumeHud.show(this, AudioManager.STREAM_MUSIC)
                    return true
                }
                KeyEvent.KEYCODE_VOLUME_DOWN -> {
                    val audioManager = getSystemService(Context.AUDIO_SERVICE) as? AudioManager
                    // Flag 0 suppresses the colorful OEM volume slider popup
                    audioManager?.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_LOWER, 0)
                    CustomVolumeHud.show(this, AudioManager.STREAM_MUSIC)
                    return true
                }
            }
        }
        return super.onKeyEvent(event)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return
        }

        val pkg = event.packageName?.toString() ?: return
        if (pkg.isBlank()) return

        currentForegroundPackage = pkg
        evaluateForegroundPackage(pkg)
    }

    private fun evaluateForegroundPackage(pkg: String) {
        val locator = try {
            FocusApplication.instance.locator
        } catch (_: Throwable) {
            return
        }

        val snapshot = locator.settingsRepository.snapshot

        // If returned to launcher home, restore normal color and clear overlays
        if (pkg == packageName) {
            removeFloatingPill()
            removeOverlay()
            serviceScope.launch {
                val isGrayscaleEnabled = locator.preferencesRepository.isSystemGrayscaleEnabledFlow.first()
                if (isGrayscaleEnabled) {
                    SystemThemingHelper.setHardwareGrayscale(this@FocusAccessibilityService, false)
                }
            }
            return
        }

        // Ignore benign packages (System UI, Settings, IMEs, dialers, never-block)
        if (shouldIgnorePackage(pkg, snapshot)) {
            removeFloatingPill()
            removeOverlay()
            return
        }

        // Check if package is on the Distracting blacklist
        if (!snapshot.distractingPackages.contains(pkg)) {
            removeFloatingPill()
            removeOverlay()
            return
        }

        // Toggle hardware grayscale mode on blacklisted app entry
        serviceScope.launch {
            val isGrayscaleEnabled = locator.preferencesRepository.isSystemGrayscaleEnabledFlow.first()
            if (isGrayscaleEnabled) {
                SystemThemingHelper.setHardwareGrayscale(this@FocusAccessibilityService, true)
            }
        }

        val session = snapshot.activeSessions[pkg]
        val nowElapsed = SystemClock.elapsedRealtime()

        if (session == null) {
            // Bypass detected: opening distracting app without launch delay / session approval
            triggerEnforcement(pkg, isBypass = true)
            return
        }

        if (nowElapsed >= session.endElapsedRealtime) {
            // Session expired
            triggerEnforcement(pkg, isBypass = false, session = session)
        } else {
            // Active approved session: display floating watchdog session pill
            showFloatingSessionPill(pkg, session)
        }
    }

    private fun shouldIgnorePackage(pkg: String, snapshot: LauncherSettingsSnapshot): Boolean {
        if (pkg == packageName) return true
        if (pkg == "com.android.systemui" || pkg == "com.android.settings") return true
        if (pkg == "com.android.phone" || pkg == "com.android.server.telecom") return true

        if (snapshot.neverBlockPackages.contains(pkg)) return true

        try {
            val telecomManager = getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
            if (pkg == telecomManager?.defaultDialerPackage) return true
        } catch (_: Throwable) {}

        try {
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
            if (imm?.enabledInputMethodList?.any { it.packageName == pkg } == true) return true
        } catch (_: Throwable) {}

        return false
    }

    private fun triggerEnforcement(pkg: String, isBypass: Boolean, session: ActiveSessionEntry? = null) {
        removeFloatingPill()
        performHapticFeedback()
        performGlobalAction(GLOBAL_ACTION_HOME)

        if (isBypass) {
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(intent)
        }
    }

    /**
     * Renders a floating, draggable monochrome text pill: "⏱ 03:42 / 10:00 [exit]"
     */
    private fun showFloatingSessionPill(pkg: String, session: ActiveSessionEntry) {
        if (activeFloatingPillView != null) return
        val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager ?: return

        val density = resources.displayMetrics.density
        val totalMinutes = ((session.endElapsedRealtime - session.startElapsedRealtime) / 60000L).coerceAtLeast(1L)

        val backgroundDrawable = GradientDrawable().apply {
            setColor(Color.parseColor("#EE000000"))
            cornerRadius = 20 * density
            setStroke((1 * density).toInt(), Color.parseColor("#444444"))
        }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            background = backgroundDrawable
            setPadding((14 * density).toInt(), (6 * density).toInt(), (14 * density).toInt(), (6 * density).toInt())
            gravity = Gravity.CENTER_VERTICAL
        }

        val timerTv = TextView(this).apply {
            setTextColor(Color.WHITE)
            typeface = Typeface.MONOSPACE
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            text = formatPillTime(session.endElapsedRealtime - SystemClock.elapsedRealtime(), totalMinutes)
        }

        val exitTv = TextView(this).apply {
            setTextColor(Color.parseColor("#888888"))
            typeface = Typeface.MONOSPACE
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            text = " [exit]"
            setPadding((6 * density).toInt(), 0, 0, 0)
            setOnClickListener {
                performHapticFeedback()
                performGlobalAction(GLOBAL_ACTION_HOME)
                removeFloatingPill()
            }
        }

        container.addView(timerTv)
        container.addView(exitTv)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = (24 * density).toInt()
            y = (80 * density).toInt()
        }

        // Draggable touch handling
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f

        container.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    params.x = initialX + (event.rawX - initialTouchX).toInt()
                    params.y = initialY + (event.rawY - initialTouchY).toInt()
                    try {
                        wm.updateViewLayout(container, params)
                    } catch (_: Exception) {}
                    true
                }
                else -> false
            }
        }

        try {
            wm.addView(container, params)
            activeFloatingPillView = container

            // Ticking loop for the countdown pill
            floatingPillJob?.cancel()
            floatingPillJob = serviceScope.launch {
                while (isActive && activeFloatingPillView != null && currentForegroundPackage == pkg) {
                    delay(1000L)
                    val remainingMs = session.endElapsedRealtime - SystemClock.elapsedRealtime()
                    if (remainingMs <= 0L) {
                        triggerEnforcement(pkg, isBypass = false, session = session)
                        break
                    }
                    timerTv.text = formatPillTime(remainingMs, totalMinutes)
                }
            }
        } catch (_: Exception) {
            activeFloatingPillView = null
        }
    }

    private fun formatPillTime(remainingMs: Long, totalMinutes: Long): String {
        val totalSec = (remainingMs / 1000L).coerceAtLeast(0L)
        val m = totalSec / 60L
        val s = totalSec % 60L
        val sStr = if (s < 10) "0$s" else "$s"
        val mStr = if (m < 10) "0$m" else "$m"
        val totStr = if (totalMinutes < 10) "0$totalMinutes:00" else "$totalMinutes:00"
        return "⏱ $mStr:$sStr / $totStr"
    }

    private fun removeFloatingPill() {
        floatingPillJob?.cancel()
        floatingPillJob = null

        activeFloatingPillView?.let { view ->
            try {
                val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager
                wm?.removeView(view)
            } catch (_: Exception) {}
            activeFloatingPillView = null
        }
    }

    private fun removeOverlay() {
        activeOverlayView?.let { view ->
            try {
                val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager
                wm?.removeView(view)
            } catch (_: Exception) {}
            activeOverlayView = null
        }
    }

    private fun performHapticFeedback() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(120, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(120)
            }
        } catch (_: Throwable) {}
    }

    override fun onInterrupt() {
        removeFloatingPill()
        removeOverlay()
    }

    override fun onDestroy() {
        super.onDestroy()
        instanceRef = null
        removeFloatingPill()
        removeOverlay()
        serviceScope.cancel()
    }
}
