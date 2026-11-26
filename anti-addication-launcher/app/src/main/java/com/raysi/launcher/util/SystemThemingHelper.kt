// app/src/main/java/com/raysi/launcher/util/SystemThemingHelper.kt
package com.raysi.launcher.util

import android.Manifest
import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.media.AudioManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.ScanResult
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.provider.Settings
import android.telephony.CellSignalStrengthGsm
import android.telephony.CellSignalStrengthLte
import android.telephony.CellSignalStrengthNr
import android.telephony.CellSignalStrengthWcdma
import android.telephony.PhoneStateListener
import android.telephony.ServiceState
import android.telephony.SignalStrength
import android.telephony.SubscriptionManager
import android.telephony.TelephonyCallback
import android.telephony.TelephonyDisplayInfo
import android.telephony.TelephonyManager
import android.text.format.DateFormat
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.annotation.RequiresApi
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.raysi.launcher.domain.model.SimSlotStatus
import com.raysi.launcher.domain.model.StatusBarMode
import com.raysi.launcher.domain.model.SystemStatusState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.Closeable
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

/**
 * SystemThemingHelper:
 * 1. Edge-to-edge & display-cutout window configuration for Custom, System, and Stealth status bars.
 * 2. Real-time reactive observer for Battery, Wi-Fi RSSI/Standard, Dual-SIM Carriers & Signal Bars,
 *    Cellular generation (5G / 5G+ / LTE / 4G / 3G / E), Airplane Mode, and Ringer state.
 * 3. Hardware system-wide grayscale mode via WRITE_SECURE_SETTINGS.
 * 4. Zero-jank fade window transitions.
 */
class SystemThemingHelper(
    private val appContext: Context,
    private val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
) : Closeable {

    private val connectivityManager =
        appContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
    private val wifiManager =
        appContext.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
    private val batteryManager =
        appContext.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
    private val powerManager =
        appContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
    private val audioManager =
        appContext.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    private val telephonyManager =
        appContext.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
    private val subscriptionManager =
        appContext.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as? SubscriptionManager

    private val timeFormat12 = SimpleDateFormat("h:mm", Locale.getDefault())
    private val amPmFormat = SimpleDateFormat("a", Locale.US)
    private val timeFormat24 = SimpleDateFormat("HH:mm", Locale.getDefault())

    // Mutable snapshot fields guarded cleanly on main thread / state emissions
    private var batteryPercent: Int = -1
    private var isCharging: Boolean = false
    private var isPowerSave: Boolean = false

    private var isWifiEnabled: Boolean = false
    private var isWifiConnected: Boolean = false
    private var wifiLevel: Int = 0
    private var wifiStandardLabel: String = ""

    private var isAirplaneMode: Boolean = false
    private var isCellularConnected: Boolean = false
    private var cellularFallbackLabel: String = ""
    private var ringerMode: Int = AudioManager.RINGER_MODE_NORMAL

    // Per-subId live telephony cache
    private val perSubSignalLevels = mutableMapOf<Int, Int>()
    private val perSubNetworkBadges = mutableMapOf<Int, String>()
    private val perSubRoaming = mutableMapOf<Int, Boolean>()

    private val registeredApi31Callbacks = mutableListOf<Pair<TelephonyManager, Any>>()
    @Suppress("DEPRECATION")
    private val registeredLegacyListeners = mutableListOf<Pair<TelephonyManager, PhoneStateListener>>()
    private var lastSubscriptionPermissionState: Boolean? = null

    private val _systemStatusState = MutableStateFlow(SystemStatusState())
    val systemStatusState: StateFlow<SystemStatusState> = _systemStatusState.asStateFlow()

    private val _customStatusBarLine = MutableStateFlow("")
    val customStatusBarLine: StateFlow<String> = _customStatusBarLine.asStateFlow()

    private var isReceiverRegistered = false
    private var isNetworkCallbackRegistered = false
    private var isSubListenerRegistered = false

    private val systemReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_BATTERY_CHANGED -> readBatteryFromIntent(intent)
                PowerManager.ACTION_POWER_SAVE_MODE_CHANGED,
                WifiManager.WIFI_STATE_CHANGED_ACTION,
                WifiManager.RSSI_CHANGED_ACTION,
                @Suppress("DEPRECATION") WifiManager.NETWORK_STATE_CHANGED_ACTION,
                AudioManager.RINGER_MODE_CHANGED_ACTION,
                Intent.ACTION_AIRPLANE_MODE_CHANGED,
                "android.intent.action.SIM_STATE_CHANGED",
                TelephonyManager.ACTION_PHONE_STATE_CHANGED -> refreshAllSignals()
                Intent.ACTION_TIME_TICK,
                Intent.ACTION_TIME_CHANGED,
                Intent.ACTION_TIMEZONE_CHANGED -> publishSnapshot()
            }
        }
    }

    private val internetNetworkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) = refreshNetworkSignals()
        override fun onLost(network: Network) = refreshNetworkSignals()
        override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) =
            refreshNetworkSignals(capabilities)
    }

    private val cellNetworkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) = refreshNetworkSignals()
        override fun onLost(network: Network) = refreshNetworkSignals()
        override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) =
            refreshNetworkSignals()
    }

    private val subscriptionsChangedListener =
        object : SubscriptionManager.OnSubscriptionsChangedListener() {
            override fun onSubscriptionsChanged() {
                registerTelephonyObservers()
                refreshAllSignals()
            }
        }

    init {
        readInitialBatterySync()
        registerReceivers()
        registerTelephonyObservers()
        refreshAllSignals()
    }

    fun refreshSystemStatus() {
        val hasPermNow = hasPhoneStatePermission(appContext)
        if (lastSubscriptionPermissionState != hasPermNow) {
            registerTelephonyObservers()
        }
        refreshAllSignals()
    }

    private fun readInitialBatterySync() {
        try {
            val sticky = ContextCompat.registerReceiver(
                appContext,
                null,
                IntentFilter(Intent.ACTION_BATTERY_CHANGED),
                ContextCompat.RECEIVER_EXPORTED
            )
            if (sticky != null) {
                readBatteryFromIntent(sticky)
            } else {
                val cap = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1
                if (cap in 0..100) {
                    batteryPercent = cap
                }
            }
        } catch (_: Exception) {
            val cap = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1
            if (cap in 0..100) batteryPercent = cap
        }
    }

    private fun readBatteryFromIntent(intent: Intent) {
        val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
        val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
        val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)

        isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
            status == BatteryManager.BATTERY_STATUS_FULL

        batteryPercent = if (level >= 0 && scale > 0) {
            ((level.toFloat() / scale.toFloat()) * 100f).roundToInt().coerceIn(0, 100)
        } else {
            batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: batteryPercent
        }
        isPowerSave = powerManager?.isPowerSaveMode == true
        publishSnapshot()
    }

    private fun registerReceivers() {
        if (!isReceiverRegistered) {
            val filter = IntentFilter().apply {
                addAction(Intent.ACTION_BATTERY_CHANGED)
                addAction(PowerManager.ACTION_POWER_SAVE_MODE_CHANGED)
                addAction(Intent.ACTION_TIME_TICK)
                addAction(Intent.ACTION_TIME_CHANGED)
                addAction(Intent.ACTION_TIMEZONE_CHANGED)
                addAction(WifiManager.WIFI_STATE_CHANGED_ACTION)
                addAction(WifiManager.RSSI_CHANGED_ACTION)
                @Suppress("DEPRECATION")
                addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION)
                addAction(AudioManager.RINGER_MODE_CHANGED_ACTION)
                addAction(Intent.ACTION_AIRPLANE_MODE_CHANGED)
                addAction("android.intent.action.SIM_STATE_CHANGED")
            }
            try {
                ContextCompat.registerReceiver(
                    appContext,
                    systemReceiver,
                    filter,
                    ContextCompat.RECEIVER_EXPORTED
                )
                isReceiverRegistered = true
            } catch (_: Exception) {}
        }

        if (!isNetworkCallbackRegistered && connectivityManager != null) {
            try {
                val netReq = NetworkRequest.Builder()
                    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    .build()
                connectivityManager.registerNetworkCallback(netReq, internetNetworkCallback)

                val cellReq = NetworkRequest.Builder()
                    .addTransportType(NetworkCapabilities.TRANSPORT_CELLULAR)
                    .build()
                connectivityManager.registerNetworkCallback(cellReq, cellNetworkCallback)

                isNetworkCallbackRegistered = true
            } catch (_: Exception) {}
        }

        if (!isSubListenerRegistered && subscriptionManager != null) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    subscriptionManager.addOnSubscriptionsChangedListener(
                        appContext.mainExecutor,
                        subscriptionsChangedListener
                    )
                } else {
                    @Suppress("DEPRECATION")
                    subscriptionManager.addOnSubscriptionsChangedListener(subscriptionsChangedListener)
                }
                isSubListenerRegistered = true
            } catch (_: Exception) {}
        }
    }

    private fun registerTelephonyObservers() {
        clearTelephonyObservers()
        val tm = telephonyManager ?: return
        val hasPerm = hasPhoneStatePermission(appContext)
        lastSubscriptionPermissionState = hasPerm

        val subIds = if (hasPerm && subscriptionManager != null) {
            try {
                @Suppress("MissingPermission")
                subscriptionManager.activeSubscriptionInfoList?.map { it.subscriptionId } ?: emptyList()
            } catch (_: SecurityException) {
                emptyList()
            }
        } else {
            emptyList()
        }

        val targetManagers = if (subIds.isNotEmpty()) {
            subIds.map { id -> id to tm.createForSubscriptionId(id) }
        } else {
            listOf(SubscriptionManager.DEFAULT_SUBSCRIPTION_ID to tm)
        }

        for ((subId, subTm) in targetManagers) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                try {
                    val cb = Api31SubCallback(
                        onSignal = { sig ->
                            perSubSignalLevels[subId] = sig.level.coerceIn(0, 4)
                            publishSnapshot()
                        },
                        onServiceState = { ss ->
                            perSubRoaming[subId] = ss.roaming
                            if (perSubNetworkBadges[subId].isNullOrEmpty()) {
                                val fallbackType = inferNetworkTypeFromServiceState(ss, subTm, hasPerm)
                                if (fallbackType.isNotEmpty()) {
                                    perSubNetworkBadges[subId] = fallbackType
                                }
                            }
                            publishSnapshot()
                        },
                        onDisplayInfo = { displayInfo ->
                            val badge = mapDisplayInfoBadge(displayInfo)
                            if (badge.isNotEmpty()) {
                                perSubNetworkBadges[subId] = badge
                            }
                            publishSnapshot()
                        }
                    )
                    subTm.registerTelephonyCallback(appContext.mainExecutor, cb)
                    registeredApi31Callbacks.add(subTm to cb)
                } catch (_: SecurityException) {
                    // Register signal-only callback if DisplayInfo is restricted on ROM
                    try {
                        val sigOnlyCb = Api31SignalOnlyCallback { sig ->
                            perSubSignalLevels[subId] = sig.level.coerceIn(0, 4)
                            publishSnapshot()
                        }
                        subTm.registerTelephonyCallback(appContext.mainExecutor, sigOnlyCb)
                        registeredApi31Callbacks.add(subTm to sigOnlyCb)
                    } catch (_: Exception) {}
                } catch (_: Exception) {}
            } else {
                Handler(Looper.getMainLooper()).post {
                    try {
                        @Suppress("DEPRECATION")
                        val listener = object : PhoneStateListener() {
                            @Deprecated("Deprecated in Java")
                            override fun onSignalStrengthsChanged(signalStrength: SignalStrength?) {
                                if (signalStrength != null) {
                                    perSubSignalLevels[subId] = signalStrength.level.coerceIn(0, 4)
                                    publishSnapshot()
                                }
                            }

                            @Deprecated("Deprecated in Java")
                            override fun onServiceStateChanged(serviceState: ServiceState?) {
                                if (serviceState != null) {
                                    perSubRoaming[subId] = serviceState.roaming
                                    publishSnapshot()
                                }
                            }
                        }
                        @Suppress("DEPRECATION")
                        subTm.listen(
                            listener,
                            PhoneStateListener.LISTEN_SIGNAL_STRENGTHS or PhoneStateListener.LISTEN_SERVICE_STATE
                        )
                        registeredLegacyListeners.add(subTm to listener)
                    } catch (_: Exception) {}
                }
            }
        }
    }

    private fun clearTelephonyObservers() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            for ((subTm, cb) in registeredApi31Callbacks) {
                try {
                    if (cb is TelephonyCallback) {
                        subTm.unregisterTelephonyCallback(cb)
                    }
                } catch (_: Exception) {}
            }
            registeredApi31Callbacks.clear()
        }
        @Suppress("DEPRECATION")
        for ((subTm, listener) in registeredLegacyListeners) {
            try {
                subTm.listen(listener, PhoneStateListener.LISTEN_NONE)
            } catch (_: Exception) {}
        }
        registeredLegacyListeners.clear()
    }

    private fun refreshAllSignals() {
        scope.launch(Dispatchers.Default) {
            readDeviceGlobals()
            refreshNetworkSignalsInternal()
            publishSnapshot()
        }
    }

    private fun refreshNetworkSignals(latestCaps: NetworkCapabilities? = null) {
        scope.launch(Dispatchers.Default) {
            readDeviceGlobals()
            refreshNetworkSignalsInternal(latestCaps)
            publishSnapshot()
        }
    }

    private fun readDeviceGlobals() {
        isAirplaneMode = try {
            Settings.Global.getInt(appContext.contentResolver, Settings.Global.AIRPLANE_MODE_ON, 0) != 0
        } catch (_: Exception) {
            false
        }
        isPowerSave = powerManager?.isPowerSaveMode == true
        ringerMode = audioManager?.ringerMode ?: AudioManager.RINGER_MODE_NORMAL
        isWifiEnabled = try {
            wifiManager?.isWifiEnabled == true
        } catch (_: Exception) {
            false
        }
    }

    private fun refreshNetworkSignalsInternal(latestCaps: NetworkCapabilities? = null) {
        val cm = connectivityManager ?: return
        val activeNetwork = cm.activeNetwork
        val activeCaps = latestCaps ?: cm.getNetworkCapabilities(activeNetwork)

        var wifiConn = false
        var cellConn = false
        var cellCapRef: NetworkCapabilities? = null
        var wifiCapRef: NetworkCapabilities? = null

        if (activeCaps != null) {
            if (activeCaps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
                wifiConn = true
                wifiCapRef = activeCaps
            }
            if (activeCaps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) {
                cellConn = true
                cellCapRef = activeCaps
            }
        }

        // Also inspect all active networks so cellular link info is visible while on Wi-Fi
        try {
            @Suppress("DEPRECATION")
            for (net in cm.allNetworks) {
                val caps = cm.getNetworkCapabilities(net) ?: continue
                if (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
                    wifiConn = true
                    if (wifiCapRef == null) wifiCapRef = caps
                }
                if (caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) {
                    cellConn = true
                    if (cellCapRef == null) cellCapRef = caps
                }
            }
        } catch (_: Exception) {}

        isWifiConnected = wifiConn
        if (wifiConn) {
            val wifiInfo = extractWifiInfo(wifiCapRef)
            val rssi = when {
                wifiInfo != null && wifiInfo.rssi > -127 -> wifiInfo.rssi
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && wifiCapRef != null &&
                    wifiCapRef.signalStrength != Int.MIN_VALUE -> wifiCapRef.signalStrength
                else -> {
                    @Suppress("DEPRECATION")
                    wifiManager?.connectionInfo?.rssi ?: -70
                }
            }
            wifiLevel = rssiToWifiLevel(rssi)
            wifiStandardLabel = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && wifiInfo != null) {
                when (wifiInfo.wifiStandard) {
                    ScanResult.WIFI_STANDARD_11BE -> "7"
                    ScanResult.WIFI_STANDARD_11AX -> "6"
                    ScanResult.WIFI_STANDARD_11AC -> "5"
                    else -> ""
                }
            } else ""
        } else {
            wifiLevel = 0
            wifiStandardLabel = ""
        }

        isCellularConnected = cellConn
        cellularFallbackLabel = if (cellCapRef != null) {
            if (cellCapRef.linkDownstreamBandwidthKbps >= 100_000) "5G" else "LTE"
        } else ""
    }

    private fun extractWifiInfo(caps: NetworkCapabilities?): WifiInfo? {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val ti = caps?.transportInfo
            if (ti is WifiInfo) return ti
        }
        return try {
            @Suppress("DEPRECATION")
            wifiManager?.connectionInfo
        } catch (_: Exception) {
            null
        }
    }

    private fun rssiToWifiLevel(rssi: Int): Int {
        val wm = wifiManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && wm != null) {
            val max = wm.maxSignalLevel.coerceAtLeast(1)
            val raw = wm.calculateSignalLevel(rssi).coerceIn(0, max)
            ((raw.toFloat() / max.toFloat()) * 4f).roundToInt().coerceIn(1, 4)
        } else {
            @Suppress("DEPRECATION")
            WifiManager.calculateSignalLevel(rssi, 5).coerceIn(0, 4)
        }
    }

    private fun buildSimSlots(hasPerm: Boolean): List<SimSlotStatus> {
        if (isAirplaneMode) return emptyList()
        val tm = telephonyManager ?: return emptyList()
        val defaultDataSubId = SubscriptionManager.getDefaultDataSubscriptionId()

        if (hasPerm && subscriptionManager != null) {
            val activeSubs = try {
                @Suppress("MissingPermission")
                subscriptionManager.activeSubscriptionInfoList?.sortedBy { it.simSlotIndex }
            } catch (_: SecurityException) {
                null
            }

            if (!activeSubs.isNullOrEmpty()) {
                return activeSubs.map { sub ->
                    val subTm = tm.createForSubscriptionId(sub.subscriptionId)
                    val sigObj = subTm.signalStrength
                    val level = perSubSignalLevels[sub.subscriptionId]
                        ?: sigObj?.level?.coerceIn(0, 4)
                        ?: -1
                    val rawNet = try {
                        @Suppress("MissingPermission")
                        mapNetworkTypeInt(subTm.dataNetworkType)
                    } catch (_: Exception) {
                        ""
                    }
                    val cachedBadge = perSubNetworkBadges[sub.subscriptionId]
                    val sigBadge = inferBadgeFromSignalStrength(sigObj)
                    val badge = when {
                        !cachedBadge.isNullOrEmpty() -> cachedBadge
                        rawNet.isNotEmpty() -> rawNet
                        sigBadge.isNotEmpty() -> sigBadge
                        sub.subscriptionId == defaultDataSubId && cellularFallbackLabel.isNotEmpty() -> cellularFallbackLabel
                        else -> ""
                    }
                    val carrier = (sub.carrierName ?: sub.displayName)?.toString()?.trim()
                        ?.ifBlank { "SIM ${sub.simSlotIndex + 1}" }
                        ?: "SIM ${sub.simSlotIndex + 1}"

                    SimSlotStatus(
                        slotIndex = sub.simSlotIndex,
                        carrierName = shortenCarrierName(carrier),
                        networkBadge = badge,
                        signalLevel = level,
                        isAbsent = false,
                        isDataActive = sub.subscriptionId == defaultDataSubId,
                        isRoaming = perSubRoaming[sub.subscriptionId] == true
                    )
                }
            }
        }

        // Graceful zero-permission fallback using public TelephonyManager APIs
        val modemCount = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            tm.activeModemCount.coerceIn(1, 2)
        } else {
            @Suppress("DEPRECATION")
            tm.phoneCount.coerceIn(1, 2)
        }

        val fallbackSlots = mutableListOf<SimSlotStatus>()
        val primarySignalObj = tm.signalStrength
        val primaryLevel = primarySignalObj?.level?.coerceIn(0, 4) ?: -1
        val signalBadge = inferBadgeFromSignalStrength(primarySignalObj)
        val opName = tm.networkOperatorName?.trim()?.takeIf { it.isNotBlank() }
            ?: tm.simOperatorName?.trim()?.takeIf { it.isNotBlank() }
            ?: ""

        for (slot in 0 until modemCount) {
            val state = try {
                tm.getSimState(slot)
            } catch (_: Exception) {
                if (slot == 0) tm.simState else TelephonyManager.SIM_STATE_ABSENT
            }
            if (state == TelephonyManager.SIM_STATE_ABSENT || state == TelephonyManager.SIM_STATE_UNKNOWN) {
                continue
            }
            val label = if (slot == 0 && opName.isNotEmpty()) shortenCarrierName(opName) else "SIM ${slot + 1}"
            val badge = when {
                slot == 0 && signalBadge.isNotEmpty() -> signalBadge
                slot == 0 && cellularFallbackLabel.isNotEmpty() -> cellularFallbackLabel
                else -> ""
            }
            val level = if (slot == 0) primaryLevel else (perSubSignalLevels[slot] ?: primaryLevel)
            fallbackSlots.add(
                SimSlotStatus(
                    slotIndex = slot,
                    carrierName = label,
                    networkBadge = badge,
                    signalLevel = level,
                    isAbsent = false,
                    isDataActive = slot == 0 && (isCellularConnected || signalBadge.isNotEmpty())
                )
            )
        }
        return fallbackSlots
    }

    private fun inferBadgeFromSignalStrength(signalStrength: SignalStrength?): String {
        if (signalStrength == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return ""
        return try {
            val cells = signalStrength.cellSignalStrengths
            when {
                cells.any { it is CellSignalStrengthNr } -> "5G"
                cells.any { it is CellSignalStrengthLte } -> "LTE"
                cells.any { it is CellSignalStrengthWcdma } -> "3G"
                cells.any { it is CellSignalStrengthGsm } -> "2G"
                else -> ""
            }
        } catch (_: Exception) {
            ""
        }
    }

    private fun publishSnapshot() {
        val now = Date()
        val is24Hour = DateFormat.is24HourFormat(appContext)
        val timeText = if (is24Hour) {
            synchronized(timeFormat24) { timeFormat24.format(now) }
        } else {
            synchronized(timeFormat12) { timeFormat12.format(now) }
        }
        val amPm = if (is24Hour) "" else synchronized(amPmFormat) { amPmFormat.format(now).uppercase(Locale.US) }

        val hasPerm = hasPhoneStatePermission(appContext)
        val sims = buildSimSlots(hasPerm)

        val snapshot = SystemStatusState(
            timeText = timeText,
            amPmText = amPm,
            batteryPercent = batteryPercent,
            isCharging = isCharging,
            isPowerSave = isPowerSave,
            isWifiEnabled = isWifiEnabled,
            isWifiConnected = isWifiConnected,
            wifiLevel = wifiLevel,
            wifiStandardLabel = wifiStandardLabel,
            isAirplaneMode = isAirplaneMode,
            isCellularConnected = isCellularConnected,
            cellularFallbackLabel = cellularFallbackLabel,
            simSlots = sims,
            ringerMode = ringerMode,
            hasPhoneStatePermission = hasPerm
        )
        _systemStatusState.value = snapshot
        _customStatusBarLine.value = buildLegacySummaryLine(snapshot)
    }

    private fun buildLegacySummaryLine(state: SystemStatusState): String {
        val batt = if (state.batteryPercent >= 0) "${state.batteryPercent}%" else "--%"
        val charge = if (state.isCharging) "⚡" else ""
        val wifiPart = when {
            state.isWifiConnected -> "WIFI(${state.wifiLevel}/4)"
            state.isWifiEnabled -> "WIFI"
            else -> ""
        }
        val simPart = state.simSlots.joinToString(" | ") { sim ->
            val badge = if (sim.networkBadge.isNotEmpty()) " ${sim.networkBadge}" else ""
            "${sim.carrierName}$badge"
        }.ifBlank { if (state.isAirplaneMode) "AIRPLANE" else "NO SIM" }

        return listOfNotNull(
            "$batt$charge",
            wifiPart.takeIf { it.isNotEmpty() },
            simPart,
            "${state.timeText} ${state.amPmText}".trim()
        ).joinToString(" · ")
    }

    override fun close() {
        clearTelephonyObservers()
        if (isReceiverRegistered) {
            try {
                appContext.unregisterReceiver(systemReceiver)
            } catch (_: Exception) {}
            isReceiverRegistered = false
        }
        if (isNetworkCallbackRegistered && connectivityManager != null) {
            try {
                connectivityManager.unregisterNetworkCallback(internetNetworkCallback)
                connectivityManager.unregisterNetworkCallback(cellNetworkCallback)
            } catch (_: Exception) {}
            isNetworkCallbackRegistered = false
        }
        if (isSubListenerRegistered && subscriptionManager != null) {
            try {
                subscriptionManager.removeOnSubscriptionsChangedListener(subscriptionsChangedListener)
            } catch (_: Exception) {}
            isSubListenerRegistered = false
        }
        scope.cancel()
    }

    @RequiresApi(Build.VERSION_CODES.S)
    private class Api31SubCallback(
        private val onSignal: (SignalStrength) -> Unit,
        private val onServiceState: (ServiceState) -> Unit,
        private val onDisplayInfo: (TelephonyDisplayInfo) -> Unit
    ) : TelephonyCallback(),
        TelephonyCallback.SignalStrengthsListener,
        TelephonyCallback.ServiceStateListener,
        TelephonyCallback.DisplayInfoListener {
        override fun onSignalStrengthsChanged(signalStrength: SignalStrength) = onSignal(signalStrength)
        override fun onServiceStateChanged(serviceState: ServiceState) = onServiceState(serviceState)
        override fun onDisplayInfoChanged(telephonyDisplayInfo: TelephonyDisplayInfo) = onDisplayInfo(telephonyDisplayInfo)
    }

    @RequiresApi(Build.VERSION_CODES.S)
    private class Api31SignalOnlyCallback(
        private val onSignal: (SignalStrength) -> Unit
    ) : TelephonyCallback(), TelephonyCallback.SignalStrengthsListener {
        override fun onSignalStrengthsChanged(signalStrength: SignalStrength) = onSignal(signalStrength)
    }

    companion object {
        fun hasPhoneStatePermission(context: Context): Boolean {
            return ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.READ_PHONE_STATE
            ) == PackageManager.PERMISSION_GRANTED
        }

        private fun shortenCarrierName(name: String): String {
            return when {
                name.contains("Jio", ignoreCase = true) -> "Jio"
                name.contains("Airtel", ignoreCase = true) -> "Airtel"
                name.contains("VI ", ignoreCase = true) || name.equals("Vi", ignoreCase = true) -> "Vi"
                name.contains("BSNL", ignoreCase = true) -> "BSNL"
                name.length > 10 -> name.take(9)
                else -> name
            }
        }

        private fun inferNetworkTypeFromServiceState(
            ss: ServiceState,
            tm: TelephonyManager,
            hasPerm: Boolean
        ): String {
            if (hasPerm) {
                try {
                    @Suppress("MissingPermission")
                    val fromTm = mapNetworkTypeInt(tm.dataNetworkType)
                    if (fromTm.isNotEmpty()) return fromTm
                } catch (_: Exception) {}
            }
            val raw = ss.toString()
            return when {
                raw.contains("NR", ignoreCase = true) -> "5G"
                raw.contains("LTE", ignoreCase = true) -> "LTE"
                raw.contains("HSPAP", ignoreCase = true) || raw.contains("HSPA", ignoreCase = true) -> "H+"
                raw.contains("UMTS", ignoreCase = true) -> "3G"
                raw.contains("EDGE", ignoreCase = true) -> "E"
                else -> ""
            }
        }

        @RequiresApi(Build.VERSION_CODES.R)
        private fun mapDisplayInfoBadge(info: TelephonyDisplayInfo): String {
            return when (info.overrideNetworkType) {
                TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_ADVANCED,
                TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA_MMWAVE -> "5G+"
                TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA -> "5G"
                TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_LTE_ADVANCED_PRO,
                TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_LTE_CA -> "4G+"
                else -> mapNetworkTypeInt(info.networkType)
            }
        }

        @Suppress("DEPRECATION")
        private fun mapNetworkTypeInt(type: Int): String {
            return when (type) {
                TelephonyManager.NETWORK_TYPE_NR -> "5G"
                TelephonyManager.NETWORK_TYPE_LTE -> "LTE"
                TelephonyManager.NETWORK_TYPE_HSPAP,
                TelephonyManager.NETWORK_TYPE_HSPA,
                TelephonyManager.NETWORK_TYPE_HSDPA,
                TelephonyManager.NETWORK_TYPE_HSUPA -> "H+"
                TelephonyManager.NETWORK_TYPE_UMTS,
                TelephonyManager.NETWORK_TYPE_EVDO_0,
                TelephonyManager.NETWORK_TYPE_EVDO_A,
                TelephonyManager.NETWORK_TYPE_EVDO_B -> "3G"
                TelephonyManager.NETWORK_TYPE_EDGE,
                TelephonyManager.NETWORK_TYPE_GPRS,
                TelephonyManager.NETWORK_TYPE_1xRTT,
                TelephonyManager.NETWORK_TYPE_CDMA -> "2G"
                else -> ""
            }
        }

        /**
         * Configures edge-to-edge window insets, cutout extension, and status bar visibility mode.
         */
        fun configureEdgeToEdge(activity: ComponentActivity, mode: StatusBarMode) {
            activity.enableEdgeToEdge()

            val window = activity.window
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val attrs = window.attributes
                attrs.layoutInDisplayCutoutMode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                } else {
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                }
                window.attributes = attrs
            }

            val insetsController = WindowCompat.getInsetsController(window, window.decorView)
            insetsController.isAppearanceLightStatusBars = false
            insetsController.isAppearanceLightNavigationBars = false

            when (mode) {
                StatusBarMode.SYSTEM -> {
                    insetsController.show(WindowInsetsCompat.Type.statusBars())
                }
                StatusBarMode.CUSTOM,
                StatusBarMode.STEALTH -> {
                    insetsController.systemBarsBehavior =
                        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                    insetsController.hide(WindowInsetsCompat.Type.statusBars())
                }
            }
        }

        /**
         * Backwards-compatible overload for callers passing boolean stealth flag.
         */
        fun configureEdgeToEdge(activity: ComponentActivity, isStealthMode: Boolean) {
            configureEdgeToEdge(
                activity,
                if (isStealthMode) StatusBarMode.STEALTH else StatusBarMode.CUSTOM
            )
        }

        fun isSecureSettingsGranted(context: Context): Boolean {
            return context.checkSelfPermission(Manifest.permission.WRITE_SECURE_SETTINGS) ==
                PackageManager.PERMISSION_GRANTED
        }

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
                    0
                )
                true
            } catch (_: Exception) {
                false
            }
        }

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
