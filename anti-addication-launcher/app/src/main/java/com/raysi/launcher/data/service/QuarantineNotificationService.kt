// app/src/main/java/com/raysi/launcher/data/service/QuarantineNotificationService.kt
package com.raysi.launcher.data.service

import android.content.ComponentName
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * NotificationListenerService that tracks unread quiet notifications
 * and exposes a real-time reactive StateFlow of the active count.
 */
class QuarantineNotificationService : NotificationListenerService() {

    companion object {
        private val _activeNotificationCount = MutableStateFlow(0)
        val activeNotificationCount: StateFlow<Int> = _activeNotificationCount.asStateFlow()

        private val _isConnected = MutableStateFlow(false)
        val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

        fun updateCount(count: Int) {
            _activeNotificationCount.value = count
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        _isConnected.value = true
        refreshCount()
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        _isConnected.value = false
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                requestRebind(ComponentName(this, QuarantineNotificationService::class.java))
            } catch (ignored: Exception) {
            }
        }
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        refreshCount()
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        refreshCount()
    }

    private fun refreshCount() {
        try {
            val active = activeNotifications
            if (active != null) {
                _activeNotificationCount.value = active.size
            }
        } catch (ignored: Exception) {
        }
    }
}
