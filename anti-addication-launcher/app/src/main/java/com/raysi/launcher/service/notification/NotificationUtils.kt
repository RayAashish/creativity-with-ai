// app/src/main/java/com/raysi/launcher/service/notification/NotificationUtils.kt
package com.raysi.launcher.service.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat

object NotificationUtils {

    const val DIGEST_CHANNEL_ID = "focus_notification_digest"
    const val DIGEST_NOTIFICATION_ID = 4001
    const val ACTION_OPEN_QUARANTINE = "com.raysi.launcher.action.OPEN_QUARANTINE"

    /**
     * Checks if this app is authorized as a NotificationListenerService.
     */
    fun isNotificationListenerEnabled(context: Context): Boolean {
        val enabledPackages = NotificationManagerCompat.getEnabledListenerPackages(context)
        if (enabledPackages.contains(context.packageName)) {
            return true
        }

        // Secondary fallback checking enabled_notification_listeners string in Settings.Secure
        val flat = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners"
        ) ?: return false

        val expectedComponent = ComponentName(context, FocusNotificationService::class.java).flattenToString()
        return flat.split(":").any { it.equals(expectedComponent, ignoreCase = true) }
    }

    /**
     * Intent to open the Android Notification Listener access settings screen.
     */
    fun getNotificationListenerSettingsIntent(): Intent {
        return Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }

    /**
     * Creates the notification channel for the periodic notification digest.
     */
    fun createDigestNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Focus Digest"
            val descriptionText = "Periodic digest summarizing quarantined notifications"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(DIGEST_CHANNEL_ID, name, importance).apply {
                description = descriptionText
                enableLights(false)
                enableVibration(true)
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}
