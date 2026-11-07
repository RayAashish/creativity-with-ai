// app/src/main/java/com/raysi/launcher/service/notification/FocusNotificationService.kt
package com.raysi.launcher.service.notification

import android.app.Notification
import android.content.ComponentName
import android.os.Build
import android.provider.Telephony
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.raysi.launcher.FocusApplication
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * Service that intercepts incoming non-essential notifications, logs them to the Room
 * quarantine database, and cancels them from the system tray.
 *
 * Essential categories (calls, alarms, reminders, calendar events, navigation, media,
 * default SMS app, ongoing services, and user-exempted packages) pass through untouched.
 */
class FocusNotificationService : NotificationListenerService() {

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)

    override fun onListenerConnected() {
        super.onListenerConnected()
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        // API 24+ support for requesting rebind when unexpectedly disconnected
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                requestRebind(ComponentName(this, FocusNotificationService::class.java))
            } catch (ignored: Exception) {
            }
        }
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return

        val app = application as? FocusApplication ?: return
        val locator = app.locator
        val snapshot = locator.settingsRepository.snapshot
        val quarantineRepo = locator.quarantineRepository

        val defaultSmsPackage = try {
            Telephony.Sms.getDefaultSmsPackage(this)
        } catch (ignored: Exception) {
            null
        }

        val metadata = NotificationFilter.extractMetadata(sbn)
        val decision = NotificationFilter.evaluate(
            metadata = metadata,
            alwaysAllowPackages = snapshot.alwaysAllowPackages,
            defaultSmsPackage = defaultSmsPackage,
            launcherPackage = packageName
        )

        if (decision.shouldQuarantine) {
            val extras = sbn.notification?.extras
            val title = extras?.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
            val text = extras?.getCharSequence(Notification.EXTRA_TEXT)?.toString().orEmpty()
            val category = sbn.notification?.category.orEmpty()
            val channelId = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                sbn.notification?.channelId.orEmpty()
            } else {
                ""
            }
            val postTime = sbn.postTime
            val sbnKey = sbn.key

            serviceScope.launch {
                try {
                    val id = quarantineRepo.quarantineNotification(
                        packageName = sbn.packageName,
                        title = title,
                        text = text,
                        timestamp = postTime,
                        category = category,
                        channelId = channelId
                    )
                    // Hard requirement: cancelNotification only after Room insert succeeds!
                    if (id > 0) {
                        cancelNotification(sbnKey)
                    }
                } catch (ignored: Exception) {
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
    }
}
