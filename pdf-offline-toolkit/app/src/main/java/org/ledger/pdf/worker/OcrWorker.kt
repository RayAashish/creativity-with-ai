package org.ledger.pdf.worker

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.pm.ServiceInfo
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.ledger.pdf.R
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import java.io.IOException

@HiltWorker
class OcrWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted params: WorkerParameters,
    private val pdfEngine: PdfEngine,
    private val safFileHandler: SafFileHandler
) : CoroutineWorker(context, params) {

    companion object {
        const val KEY_INPUT_URI = "input_uri"
        const val KEY_OUTPUT_URI = "output_uri"
        const val KEY_LANGUAGE = "language"
        const val KEY_PROGRESS_CURRENT = "progress_current"
        const val KEY_PROGRESS_TOTAL = "progress_total"
        const val CHANNEL_ID = "ocr_worker_channel"
        private const val NOTIFICATION_ID = 2001
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val inputUriStr = inputData.getString(KEY_INPUT_URI) ?: return@withContext Result.failure()
        val outputUriStr = inputData.getString(KEY_OUTPUT_URI) ?: return@withContext Result.failure()
        val language = inputData.getString(KEY_LANGUAGE) ?: "eng"

        val inputUri = Uri.parse(inputUriStr)
        val outputUri = Uri.parse(outputUriStr)

        createNotificationChannel()
        setForeground(createForegroundInfo(0, 1))

        try {
            safFileHandler.openOutputStream(outputUri)?.use { outputStream ->
                pdfEngine.ocrPages(
                    source = inputUri,
                    output = outputStream,
                    language = language,
                    onProgress = { current, total ->
                        setProgressAsync(
                            workDataOf(
                                KEY_PROGRESS_CURRENT to current,
                                KEY_PROGRESS_TOTAL to total
                            )
                        )
                        setForegroundAsync(createForegroundInfo(current, total))
                    }
                )
            } ?: return@withContext Result.failure()

            Result.success()
        } catch (e: Exception) {
            if (isStopped) {
                Result.failure()
            } else {
                Result.failure()
            }
        }
    }

    private fun createForegroundInfo(current: Int, total: Int): ForegroundInfo {
        val cancelIntent = WorkManager.getInstance(context)
            .createCancelPendingIntent(id)

        val progressPercent = if (total > 0) (current * 100) / total else 0
        val contentText = if (total > 0) "Processing $current of $total pages ($progressPercent%)" else "Initializing air-gapped OCR..."

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("Ledger OCR")
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .setProgress(total, current, total == 0)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Cancel", cancelIntent)
            .build()

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ForegroundInfo(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            ForegroundInfo(NOTIFICATION_ID, notification)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Air-Gapped OCR"
            val descriptionText = "Notifications for local document text recognition"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}
