// app/src/main/java/com/raysi/launcher/service/FocusAccessibilityService.kt
package com.raysi.launcher.service

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.telecom.TelecomManager
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import com.raysi.launcher.FocusApplication
import com.raysi.launcher.R
import com.raysi.launcher.data.model.ActiveSessionEntry
import com.raysi.launcher.data.model.LauncherSettingsSnapshot
import com.raysi.launcher.ui.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * FocusAccessibilityService: Session Warden.
 * Monitors window state changes to detect unauthorized distracting app launches (bypasses)
 * and enforces intentional session expiry. Zero screen scraping; minimal privacy footprint.
 */
class FocusAccessibilityService : AccessibilityService() {

    companion object {
        private const val GRACE_PERIOD_MS = 30_000L
        private const val WARNING_THRESHOLD_MS = 60_000L
    }

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private var scheduledExpiryJob: Job? = null
    private var activeOverlayView: View? = null
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

        // Ignore benign packages (launcher, System UI, Settings, IMEs, telecom, emergency, never-block)
        if (shouldIgnorePackage(pkg, snapshot)) {
            removeOverlay()
            scheduledExpiryJob?.cancel()
            return
        }

        // Check if package is on the Distracting list
        if (!snapshot.distractingPackages.contains(pkg)) {
            removeOverlay()
            scheduledExpiryJob?.cancel()
            return
        }

        val session = snapshot.activeSessions[pkg]
        val nowElapsed = SystemClock.elapsedRealtime()

        if (session == null) {
            // Bypass detected: launching distracting app without an approved session
            triggerEnforcement(pkg, isBypass = true)
            return
        }

        // Active session exists; verify validity
        if (nowElapsed >= session.endElapsedRealtime) {
            // Expired session
            triggerEnforcement(pkg, isBypass = false, session = session)
        } else {
            // Valid active session
            removeOverlay()
            val remainingMs = session.endElapsedRealtime - nowElapsed

            // Schedule near-expiry check / enforcement
            scheduleExpiryCheck(pkg, session, remainingMs)
        }
    }

    private fun shouldIgnorePackage(pkg: String, snapshot: LauncherSettingsSnapshot): Boolean {
        if (pkg == packageName) return true
        if (pkg == "com.android.systemui" || pkg == "com.android.settings") return true
        if (pkg == "com.android.phone" || pkg == "com.android.server.telecom") return true

        // User's never-block list
        if (snapshot.neverBlockPackages.contains(pkg)) return true

        // Default dialer
        try {
            val telecomManager = getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
            val defaultDialer = telecomManager?.defaultDialerPackage
            if (pkg == defaultDialer) return true
        } catch (_: Throwable) {}

        // Active IMEs
        try {
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
            val imes = imm?.enabledInputMethodList
            if (imes?.any { it.packageName == pkg } == true) return true
        } catch (_: Throwable) {}

        return false
    }

    private fun triggerEnforcement(pkg: String, isBypass: Boolean, session: ActiveSessionEntry? = null) {
        performHapticFeedback()
        performGlobalAction(GLOBAL_ACTION_HOME)

        if (isBypass) {
            // Bypass detected: gently return Home and prompt intentional launch
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(intent)
        } else if (session != null) {
            // Session expired: show extension or go home overlay
            showExpiryOverlay(pkg, session)
        }
    }

    private fun scheduleExpiryCheck(pkg: String, session: ActiveSessionEntry, remainingMs: Long) {
        scheduledExpiryJob?.cancel()
        scheduledExpiryJob = serviceScope.launch {
            // 60-second warning check
            if (remainingMs > WARNING_THRESHOLD_MS) {
                delay(remainingMs - WARNING_THRESHOLD_MS)
                if (currentForegroundPackage == pkg) {
                    performHapticFeedback()
                    showWarningOverlay(pkg)
                }
                delay(WARNING_THRESHOLD_MS)
            } else {
                delay(remainingMs)
            }

            // Expiry reached
            if (currentForegroundPackage == pkg) {
                triggerEnforcement(pkg, isBypass = false, session = session)
            }
        }
    }

    private fun performHapticFeedback() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(150, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(150)
            }
        } catch (_: Throwable) {}
    }

    private fun showWarningOverlay(pkg: String) {
        removeOverlay()
        val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager ?: return

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#EE000000"))
            setPadding(48, 32, 48, 32)
            gravity = Gravity.CENTER
        }

        val text = TextView(this).apply {
            setText(R.string.gate_warning_title)
            setTextColor(Color.WHITE)
            textSize = 14f
            gravity = Gravity.CENTER
        }
        layout.addView(text)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP
        }

        try {
            wm.addView(layout, params)
            activeOverlayView = layout

            // Auto-dismiss warning toast after 4 seconds
            Handler(Looper.getMainLooper()).postDelayed({
                if (activeOverlayView === layout) {
                    removeOverlay()
                }
            }, 4000L)
        } catch (_: Throwable) {}
    }

    private fun showExpiryOverlay(pkg: String, session: ActiveSessionEntry) {
        removeOverlay()
        val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager ?: return
        val locator = try { FocusApplication.instance.locator } catch (_: Throwable) { return }
        val snapshot = locator.settingsRepository.snapshot

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#FA000000"))
            setPadding(64, 64, 64, 64)
            gravity = Gravity.CENTER
        }

        val title = TextView(this).apply {
            setText(R.string.gate_expired_title)
            setTextColor(Color.WHITE)
            textSize = 18f
            gravity = Gravity.CENTER
        }
        layout.addView(title)

        val canExtend = session.extensionCount < snapshot.maxExtensionsAllowed
        if (canExtend) {
            val extendBtn = Button(this).apply {
                text = getString(R.string.gate_extend_5m, session.extensionCount + 1, snapshot.maxExtensionsAllowed)
                setTextColor(Color.WHITE)
                setBackgroundColor(Color.parseColor("#333333"))
                setOnClickListener {
                    extendSession(session, 5)
                    removeOverlay()
                }
            }
            layout.addView(extendBtn)
        }

        val homeBtn = Button(this).apply {
            setText(R.string.gate_go_home)
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#222222"))
            setOnClickListener {
                performGlobalAction(GLOBAL_ACTION_HOME)
                removeOverlay()
            }
        }
        layout.addView(homeBtn)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )

        try {
            wm.addView(layout, params)
            activeOverlayView = layout
        } catch (_: Throwable) {}
    }

    private fun extendSession(session: ActiveSessionEntry, extensionMinutes: Int) {
        val locator = try { FocusApplication.instance.locator } catch (_: Throwable) { return }
        val extMs = extensionMinutes * 60_000L
        val updatedSession = session.copy(
            endWallClockMs = session.endWallClockMs + extMs,
            endElapsedRealtime = session.endElapsedRealtime + extMs,
            extensionCount = session.extensionCount + 1
        )
        serviceScope.launch {
            locator.settingsRepository.addOrUpdateSession(updatedSession)
        }
    }

    private fun removeOverlay() {
        activeOverlayView?.let { view ->
            try {
                val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager
                wm?.removeView(view)
            } catch (_: Throwable) {}
            activeOverlayView = null
        }
    }

    override fun onInterrupt() {
        removeOverlay()
        scheduledExpiryJob?.cancel()
    }

    override fun onDestroy() {
        super.onDestroy()
        removeOverlay()
        scheduledExpiryJob?.cancel()
        serviceScope.cancel()
    }
}
