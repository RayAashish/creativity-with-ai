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
import com.antigravity.note.library.backup.gdrive.GoogleDriveAuthStorage
import com.antigravity.note.library.backup.gdrive.GoogleDriveBackupEngine
import com.antigravity.note.library.backup.gdrive.GoogleDriveClient
import com.antigravity.note.library.db.NoteDatabase
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
        val authStorage = GoogleDriveAuthStorage(applicationContext)

        if (authStorage.getAccessToken() == null) {
            // No Google Drive token configured yet; finish cleanly without failing
            return Result.success()
        }

        val driveClient = GoogleDriveClient(authStorage)
        val engine = GoogleDriveBackupEngine(
            database = database,
            pageRepository = pageRepository,
            authStorage = authStorage,
            driveClient = driveClient
        )

        val isManual = inputData.getBoolean("is_manual", false)
        val backupResult = engine.uploadBackup(forceFullSnapshot = isManual)

        return if (backupResult.isSuccess) {
            Result.success()
        } else {
            val exception = backupResult.exceptionOrNull()
            android.util.Log.e("BackupWorker", "Google Drive backup failed in worker", exception)
            if (runAttemptCount < 3) {
                Result.retry()
            } else {
                Result.failure()
            }
        }
    }

    companion object {
        private const val UNIQUE_PERIODIC_WORK_NAME = "inkflow_periodic_gdrive_backup"
        private const val UNIQUE_ONE_TIME_WORK_NAME = "inkflow_immediate_gdrive_backup"

        fun schedulePeriodic(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
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
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
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
