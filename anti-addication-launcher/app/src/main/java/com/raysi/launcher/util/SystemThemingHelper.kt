// app/src/main/java/com/raysi/launcher/util/SystemThemingHelper.kt
package com.raysi.launcher.util

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.BatteryManager
import android.os.Build
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.Closeable
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * SystemThemingHelper:
 * 1. Edge-to-edge window insets configuration (Stealth vs Themed Integrated Bar mode).
 * 2. Hardware system-wide grayscale mode via WRITE_SECURE_SETTINGS.
 * 3. Reactive device telemetry observer for the Custom Monospaced Top Status Bar:
 *    "BATT 88% [====-] · WIFI ON · LTE · 10:19 PM"
 * 4. Zero-jank window transitions (eliminates bouncy/colorful OEM zoom animations).
 */
class SystemThemingHelper(
    private val appContext: Context,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main.immediate)
) : Closeable {

    private val connectivityManager =
        appContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager

    private val timeFormat = SimpleDateFormat("h:mm a", Locale.US)

    // Current state values
    private var batteryLevel: Int = -1
    private var isCharging: Boolean = false
    private var networkType: String = "NO NET"

    private val _customStatusBarLine = MutableStateFlow(buildStatusBarString())
    val customStatusBarLine: StateFlow<String> = _customStatusBarLine.asStateFlow()

    private var isReceiverRegistered = false
    private var isNetworkCallbackRegistered = false

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == Intent.ACTION_BATTERY_CHANGED) {
                val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)

                isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                        status == BatteryManager.BATTERY_STATUS_FULL

                batteryLevel = if (level >= 0 && scale > 0) {
                    ((level.toFloat() / scale.toFloat()) * 100).toInt()
                } else {
                    level
                }
                updateStatusBarString()
            } else if (intent?.action == Intent.ACTION_TIME_TICK ||
                intent?.action == Intent.ACTION_TIMEZONE_CHANGED ||
                intent?.action == Intent.ACTION_TIME_CHANGED
            ) {
                updateStatusBarString()
            }
        }
    }

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            refreshNetworkState()
        }

        override fun onLost(network: Network) {
            refreshNetworkState()
        }

        override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) {
            refreshNetworkState()
        }
    }

    init {
        registerReceivers()
        refreshNetworkState()
    }

    fun registerReceivers() {
        if (!isReceiverRegistered) {
            val filter = IntentFilter().apply {
                addAction(Intent.ACTION_BATTERY_CHANGED)
                addAction(Intent.ACTION_TIME_TICK)
                addAction(Intent.ACTION_TIME_CHANGED)
                addAction(Intent.ACTION_TIMEZONE_CHANGED)
            }
            try {
                appContext.registerReceiver(batteryReceiver, filter)
                isReceiverRegistered = true
            } catch (_: Exception) {}
        }

        if (!isNetworkCallbackRegistered && connectivityManager != null) {
            try {
                val request = NetworkRequest.Builder()
                    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    .build()
                connectivityManager.registerNetworkCallback(request, networkCallback)
                isNetworkCallbackRegistered = true
            } catch (_: Exception) {}
        }
    }

    private fun refreshNetworkState() {
        scope.launch(Dispatchers.Default) {
            val cm = connectivityManager ?: return@launch
            val activeNetwork = cm.activeNetwork
            val capabilities = cm.getNetworkCapabilities(activeNetwork)

            networkType = when {
                capabilities == null -> "NO NET"
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WIFI ON"
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> {
                    // Check for modern cellular link bandwidth or default to LTE
                    if (capabilities.linkDownstreamBandwidthKbps >= 100_000) "5G" else "LTE"
                }
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "ETH"
                else -> "ONLINE"
            }
            updateStatusBarString()
        }
    }

    private fun updateStatusBarString() {
        _customStatusBarLine.value = buildStatusBarString()
    }

    private fun buildStatusBarString(): String {
        val battText = if (batteryLevel >= 0) "$batteryLevel%" else "--%"
        val battBar = formatBatteryBar(batteryLevel.coerceIn(0, 100))
        val chargeMarker = if (isCharging) "⚡" else ""
        val timeStr = synchronized(timeFormat) { timeFormat.format(Date()).uppercase(Locale.US) }

        return "BATT $battText$chargeMarker $battBar · $networkType · $timeStr"
    }

    private fun formatBatteryBar(level: Int): String {
        // 5-segment battery progress bar: [====-]
        val totalSegments = 5
        val filled = ((level * totalSegments) / 100).coerceIn(0, totalSegments)
        val empty = totalSegments - filled
        return buildString(7) {
            append('[')
            repeat(filled) { append('=') }
            repeat(empty) { append('-') }
            append(']')
        }
    }

    override fun close() {
        if (isReceiverRegistered) {
            try {
                appContext.unregisterReceiver(batteryReceiver)
            } catch (_: Exception) {}
            isReceiverRegistered = false
        }
        if (isNetworkCallbackRegistered) {
            try {
                connectivityManager?.unregisterNetworkCallback(networkCallback)
            } catch (_: Exception) {}
            isNetworkCallbackRegistered = false
        }
    }

    companion object {
        /**
         * Configures edge-to-edge window insets, status bar appearance, and stealth mode.
         */
        fun configureEdgeToEdge(activity: ComponentActivity, isStealthMode: Boolean) {
            activity.enableEdgeToEdge()

            val window = activity.window
            val insetsController = WindowCompat.getInsetsController(window, window.decorView)

            // Pure white text/icons on OLED black
            insetsController.isAppearanceLightStatusBars = false
            insetsController.isAppearanceLightNavigationBars = false

            if (isStealthMode) {
                // Mode A: Fully hide system bars with transient swipe reveal
                insetsController.systemBarsBehavior =
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                insetsController.hide(WindowInsetsCompat.Type.statusBars())
            } else {
                // Mode B: Integrated bar visible
                insetsController.show(WindowInsetsCompat.Type.statusBars())
            }
        }

        /**
         * Verifies if WRITE_SECURE_SETTINGS has been granted via ADB:
         * adb shell pm grant com.raysi.launcher android.permission.WRITE_SECURE_SETTINGS
         */
        fun isSecureSettingsGranted(context: Context): Boolean {
            return context.checkSelfPermission(android.Manifest.permission.WRITE_SECURE_SETTINGS) ==
                    PackageManager.PERMISSION_GRANTED
        }

        /**
         * Toggles hardware OS-wide grayscale (Daltonizer) mode:
         * Settings.Secure.putInt(contentResolver, "accessibility_display_daltonizer_enabled", 1)
         * Settings.Secure.putInt(contentResolver, "accessibility_display_daltonizer", 0) // Monochromacy
         */
        fun setHardwareGrayscale(context: Context, enabled: Boolean): Boolean {
            if (!isSecureSettingsGranted(context)) return false
            return try {
                val resolver = context.contentResolver
                Settings.Secure.putInt(
                    resolver,
                    "accessibility_display_daltonizer_enabled",
                    if (enabled) 1 else 0
                )
                Settings.Secure.putInt(
                    resolver,
                    "accessibility_display_daltonizer",
                    0 // 0 = Monochromacy (Grayscale)
                )
                true
            } catch (_: Exception) {
                false
            }
        }

        /**
         * Overrides window open/close animations with zero-jank, distraction-free fades.
         */
        fun applyZeroJankTransition(activity: Activity) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    activity.overrideActivityTransition(
                        Activity.OVERRIDE_TRANSITION_OPEN,
                        android.R.anim.fade_in,
                        android.R.anim.fade_out
                    )
                    activity.overrideActivityTransition(
                        Activity.OVERRIDE_TRANSITION_CLOSE,
                        android.R.anim.fade_in,
                        android.R.anim.fade_out
                    )
                } else {
                    @Suppress("DEPRECATION")
                    activity.overridePendingTransition(
                        android.R.anim.fade_in,
                        android.R.anim.fade_out
                    )
                }
            } catch (_: Exception) {}
        }
    }
}
