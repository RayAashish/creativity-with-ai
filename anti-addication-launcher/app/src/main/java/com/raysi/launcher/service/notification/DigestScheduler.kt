// app/src/main/java/com/raysi/launcher/service/notification/DigestScheduler.kt
package com.raysi.launcher.service.notification

import android.content.Context
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import java.util.Calendar
import java.util.TimeZone
import java.util.concurrent.TimeUnit

object DigestScheduler {

    const val WORK_NAME = "focus_digest_work"

    /**
     * Pure function to calculate delay from nowMillis until the next target hour (at :00 minute).
     *
     * @param nowMillis Current timestamp in epoch milliseconds
     * @param digestHours List of 24-hour integers (e.g. listOf(12, 18, 21))
     * @param timeZone Timezone for calculating local wall clock
     * @return Milliseconds delay to next digest
     */
    fun calculateDelayToNextDigest(
        nowMillis: Long,
        digestHours: List<Int>,
        timeZone: TimeZone = TimeZone.getDefault()
    ): Long {
        if (digestHours.isEmpty()) {
            return TimeUnit.HOURS.toMillis(6) // Default 6h fallback if unconfigured
        }

        val sortedHours = digestHours.map { it.coerceIn(0, 23) }.distinct().sorted()

        val cal = Calendar.getInstance(timeZone).apply {
            timeInMillis = nowMillis
        }

        // Check if any hour today is strictly in the future
        for (hour in sortedHours) {
            val targetCal = (cal.clone() as Calendar).apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            if (targetCal.timeInMillis > nowMillis) {
                return (targetCal.timeInMillis - nowMillis).coerceAtLeast(15_000L)
            }
        }

        // None left today; schedule for tomorrow at the earliest digest hour
        val tomorrowCal = (cal.clone() as Calendar).apply {
            add(Calendar.DAY_OF_YEAR, 1)
            set(Calendar.HOUR_OF_DAY, sortedHours.first())
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        return (tomorrowCal.timeInMillis - nowMillis).coerceAtLeast(15_000L)
    }

    /**
     * Enqueues the next notification digest work request using WorkManager.
     */
    fun scheduleNextDigest(context: Context, digestHours: List<Int>) {
        val delayMillis = calculateDelayToNextDigest(System.currentTimeMillis(), digestHours)

        val workRequest = OneTimeWorkRequestBuilder<NotificationDigestWorker>()
            .setInitialDelay(delayMillis, TimeUnit.MILLISECONDS)
            .build()

        try {
            WorkManager.getInstance(context).enqueueUniqueWork(
                WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                workRequest
            )
        } catch (ignored: Exception) {
        }
    }
}
