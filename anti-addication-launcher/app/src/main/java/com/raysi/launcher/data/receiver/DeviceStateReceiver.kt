// app/src/main/java/com/raysi/launcher/data/receiver/DeviceStateReceiver.kt
package com.raysi.launcher.data.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.data.repository.PreferencesRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch

sealed interface DeviceStateEvent {
    data object ScreenOn : DeviceStateEvent
    data object ScreenOff : DeviceStateEvent
    data class UserPresent(val unlockCount: Int) : DeviceStateEvent
    data object TimeTick : DeviceStateEvent
}

class DeviceStateReceiver(
    private val preferencesRepository: PreferencesRepository,
    private val dispatchers: FocusDispatchers
) : BroadcastReceiver() {

    private val receiverScope = CoroutineScope(SupervisorJob() + dispatchers.io)

    private val _events = MutableSharedFlow<DeviceStateEvent>(extraBufferCapacity = 16)
    val events: SharedFlow<DeviceStateEvent> = _events.asSharedFlow()

    private var isRegistered = false

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action ?: return
        when (action) {
            Intent.ACTION_SCREEN_OFF -> {
                receiverScope.launch {
                    preferencesRepository.recordScreenOff(System.currentTimeMillis())
                    _events.emit(DeviceStateEvent.ScreenOff)
                }
            }
            Intent.ACTION_USER_PRESENT -> {
                receiverScope.launch {
                    val count = preferencesRepository.recordUserPresent(System.currentTimeMillis())
                    _events.emit(DeviceStateEvent.UserPresent(count))
                }
            }
            Intent.ACTION_SCREEN_ON -> {
                receiverScope.launch {
                    _events.emit(DeviceStateEvent.ScreenOn)
                }
            }
            Intent.ACTION_TIME_TICK,
            Intent.ACTION_DATE_CHANGED,
            Intent.ACTION_TIMEZONE_CHANGED -> {
                receiverScope.launch {
                    _events.emit(DeviceStateEvent.TimeTick)
                }
            }
        }
    }

    fun register(context: Context) {
        if (isRegistered) return
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_USER_PRESENT)
            addAction(Intent.ACTION_TIME_TICK)
            addAction(Intent.ACTION_DATE_CHANGED)
            addAction(Intent.ACTION_TIMEZONE_CHANGED)
        }
        context.registerReceiver(this, filter)
        isRegistered = true
    }

    fun unregister(context: Context) {
        if (!isRegistered) return
        try {
            context.unregisterReceiver(this)
        } catch (ignored: Exception) {
        }
        isRegistered = false
        receiverScope.cancel()
    }
}
