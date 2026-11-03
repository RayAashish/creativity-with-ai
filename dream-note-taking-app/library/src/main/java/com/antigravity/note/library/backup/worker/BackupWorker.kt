package com.antigravity.note.library.backup.worker

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.library.backup.api.SafeLoggingInterceptor
import com.antigravity.note.library.backup.auth.EncryptedTokenStorage
import com.antigravity.note.library.backup.engine.BackupEngine
import com.antigravity.note.library.backup.engine.BackupResult
import com.antigravity.note.library.backup.engine.GitHubGitDataClient
import com.antigravity.note.library.db.NoteDatabase
import okhttp3.OkHttpClient
import java.io.File
import java.util.concurrent.TimeUnit

class BackupWorker(
    appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val database = NoteDatabase.getInstance(applicationContext)
        val rootDir = File(applicationContext.filesDir, "notebooks")
        val pageRepository = PageRepository(rootDir)
        val tokenStorage = EncryptedTokenStorage(applicationContext)

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(SafeLoggingInterceptor())
            .build()
        val gitDataClient = GitHubGitDataClient(tokenStorage, okHttpClient)

        val engine = BackupEngine(
            database = database,
            pageRepository = pageRepository,
            tokenStorage = tokenStorage,
            gitDataClient = gitDataClient
        )

        val isManual = inputData.getBoolean("is_manual", false)
        return when (val result = engine.performBackup(isManualExpedited = isManual)) {
            is BackupResult.Success, is BackupResult.UpToDate, is BackupResult.Conflicted -> {
                Result.success()
            }
            is BackupResult.Failure -> {
                if (runAttemptCount < 3) {
                    Result.retry()
                } else {
                    Result.failure()
                }
            }
        }
    }

    companion object {
        private const val UNIQUE_PERIODIC_WORK_NAME = "inkflow_periodic_github_backup"
        private const val UNIQUE_ONE_TIME_WORK_NAME = "inkflow_immediate_github_backup"

        fun schedulePeriodic(context: Context) {
            val tokenStorage = EncryptedTokenStorage(context)
            val networkType = if (tokenStorage.isWifiOnly()) NetworkType.UNMETERED else NetworkType.CONNECTED
            val requiresCharging = tokenStorage.isChargingOnly()

            val constraints = Constraints.Builder()
                .setRequiredNetworkType(networkType)
                .setRequiresCharging(requiresCharging)
                .setRequiresBatteryNotLow(true)
                .build()

            val periodicRequest = PeriodicWorkRequestBuilder<BackupWorker>(
                15, TimeUnit.MINUTES,
                5, TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                UNIQUE_PERIODIC_WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                periodicRequest
            )
        }

        fun enqueueImmediate(context: Context) {
            val tokenStorage = EncryptedTokenStorage(context)
            val networkType = if (tokenStorage.isWifiOnly()) NetworkType.UNMETERED else NetworkType.CONNECTED

            val constraints = Constraints.Builder()
                .setRequiredNetworkType(networkType)
                .build()

            val request = OneTimeWorkRequestBuilder<BackupWorker>()
                .setConstraints(constraints)
                .setInputData(androidx.work.workDataOf("is_manual" to true))
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                UNIQUE_ONE_TIME_WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                request
            )
        }
    }
}
