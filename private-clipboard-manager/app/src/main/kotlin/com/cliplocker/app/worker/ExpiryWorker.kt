package com.cliplocker.app.worker

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import androidx.hilt.work.HiltWorker
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.cliplocker.app.data.preferences.PreferencesManager
import com.cliplocker.app.data.repository.ClipRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import java.util.concurrent.TimeUnit

@HiltWorker
class ExpiryWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted params: WorkerParameters,
    private val repository: ClipRepository,
    private val preferencesManager: PreferencesManager
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return runCatching {
            val purgedClips = repository.purgeExpiredSecrets()
            val prefs = preferencesManager.userPreferences.value

            if (purgedClips.isNotEmpty() && prefs.wipeClipboardOnSecretExpiry) {
                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
                if (clipboard != null && clipboard.hasPrimaryClip()) {
                    val currentClip = clipboard.primaryClip?.getItemAt(0)?.text?.toString()
                    if (currentClip != null) {
                        val matchesPurged = purgedClips.any { it.content == currentClip }
                        if (matchesPurged) {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                                clipboard.clearPrimaryClip()
                            } else {
                                clipboard.setPrimaryClip(ClipData.newPlainText("", ""))
                            }
                        }
                    }
                }
            }
            Result.success()
        }.getOrElse {
            Result.retry()
        }
    }

    companion object {
        private const val PERIODIC_WORK_NAME = "cliplocker_secret_expiry_periodic"
        private const val ONE_TIME_WORK_NAME = "cliplocker_secret_expiry_immediate"

        fun schedulePeriodic(context: Context) {
            val request = PeriodicWorkRequestBuilder<ExpiryWorker>(15, TimeUnit.MINUTES)
                .build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                PERIODIC_WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
        }

        fun scheduleImmediate(context: Context, delayMillis: Long = 0L) {
            val builder = OneTimeWorkRequestBuilder<ExpiryWorker>()
            if (delayMillis > 0) {
                builder.setInitialDelay(delayMillis, TimeUnit.MILLISECONDS)
            }
            WorkManager.getInstance(context).enqueueUniqueWork(
                ONE_TIME_WORK_NAME + "_" + System.currentTimeMillis(),
                ExistingWorkPolicy.REPLACE,
                builder.build()
            )
        }
    }
}
