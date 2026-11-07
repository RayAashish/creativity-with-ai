// app/src/main/java/com/raysi/launcher/service/notification/NotificationDigestWorker.kt
package com.raysi.launcher.service.notification

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.raysi.launcher.FocusApplication
import com.raysi.launcher.R
import com.raysi.launcher.ui.MainActivity
import java.util.concurrent.TimeUnit

/**
 * Background worker that triggers at user-configured digest times (default 12:00, 18:00, 21:00).
 *
 * 1. Performs automated 7-day database cleanup.
 * 2. Compiles quarantined notifications and posts a summary digest alert.
 * 3. Schedules the subsequent digest execution.
 */
class NotificationDigestWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val app = applicationContext as? FocusApplication ?: return Result.failure()
        val locator = app.locator
        val quarantineRepo = locator.quarantineRepository
        val settingsRepo = locator.settingsRepository

        // 1. Enforce 7-day retention policy: purge expired notifications
        val sevenDaysAgo = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(7)
        try {
            quarantineRepo.purgeOlderThan(sevenDaysAgo)
        } catch (ignored: Exception) {
        }

        // 2. Query notifications intercepted within the previous digest window (last 8 hours)
        val eightHoursAgo = System.currentTimeMillis() - TimeUnit.HOURS.toMillis(8)
        val recentNotifications = try {
            quarantineRepo.getNotificationsSince(eightHoursAgo)
        } catch (e: Exception) {
            emptyList()
        }

        // 3. Post summary notification if any notifications were quarantined
        if (recentNotifications.isNotEmpty()) {
            postDigestNotification(recentNotifications.size)
        }

        // 4. Schedule subsequent digest
        val digestHours = settingsRepo.snapshot.digestHours
        DigestScheduler.scheduleNextDigest(applicationContext, digestHours)

        return Result.success()
    }

    private fun postDigestNotification(count: Int) {
        NotificationUtils.createDigestNotificationChannel(applicationContext)

        val tapIntent = Intent(applicationContext, MainActivity::class.java).apply {
            action = NotificationUtils.ACTION_OPEN_QUARANTINE
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            applicationContext,
            0,
            tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(applicationContext, NotificationUtils.DIGEST_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle("Focus Notification Digest")
            .setContentText("$count notifications quarantined while you focused.")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("$count notifications were safely quarantined so you could stay in flow. Tap to review.")
            )
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        val notificationManager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        try {
            notificationManager?.notify(NotificationUtils.DIGEST_NOTIFICATION_ID, notification)
        } catch (ignored: SecurityException) {
            // Android 13+ POST_NOTIFICATIONS permission not granted
        }
    }
}
