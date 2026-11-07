package org.ledger.pdf.worker

import android.app.NotificationChannel
import android.app.NotificationManager
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
import org.ledger.pdf.data.model.CompressLevel
import org.ledger.pdf.data.model.CompressMode
import org.ledger.pdf.data.repository.ScratchFileManager
import org.ledger.pdf.data.saf.SafFileHandler
import org.ledger.pdf.engine.PdfEngine
import org.ledger.pdf.security.CertGenerator
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

@HiltWorker
class BatchWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted params: WorkerParameters,
    private val pdfEngine: PdfEngine,
    private val safFileHandler: SafFileHandler,
    private val scratchFileManager: ScratchFileManager,
    private val certGenerator: CertGenerator
) : CoroutineWorker(context, params) {

    companion object {
        const val KEY_INPUT_URI = "input_uri"
        const val KEY_OUTPUT_URI = "output_uri"
        const val KEY_OPERATIONS = "operations" // e.g. "STRIP,COMPRESS_WEB,SIGN:my_cert"
        const val CHANNEL_ID = "batch_worker_channel"
        private const val NOTIFICATION_ID = 2002
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val inputUriStr = inputData.getString(KEY_INPUT_URI) ?: return@withContext Result.failure()
        val outputUriStr = inputData.getString(KEY_OUTPUT_URI) ?: return@withContext Result.failure()
        val opsString = inputData.getString(KEY_OPERATIONS) ?: return@withContext Result.failure()

        val operations = opsString.split(";").filter { it.isNotBlank() }
        val totalSteps = operations.size
        createNotificationChannel()
        setForeground(createForegroundInfo(0, totalSteps, "Initializing batch pipeline..."))

        val inputUri = Uri.parse(inputUriStr)
        val finalOutputUri = Uri.parse(outputUriStr)

        var currentFile = scratchFileManager.createScratchFile("batch_in", ".pdf")
        var nextFile = scratchFileManager.createScratchFile("batch_out", ".pdf")

        try {
            // Copy input SAF to first scratch
            safFileHandler.openInputStream(inputUri)?.use { input ->
                FileOutputStream(currentFile).use { out ->
                    input.copyTo(out)
                }
            } ?: return@withContext Result.failure()

            for ((stepIndex, op) in operations.withIndex()) {
                val stepName = op.trim()
                setForeground(createForegroundInfo(stepIndex + 1, totalSteps, "Step ${stepIndex + 1}/$totalSteps: $stepName"))

                val stepInputUri = Uri.fromFile(currentFile)
                FileOutputStream(nextFile).use { stepOut ->
                    when {
                        stepName.startsWith("STRIP") -> {
                            pdfEngine.stripMetadata(stepInputUri, stepOut, stripBookmarks = true)
                        }
                        stepName.startsWith("COMPRESS_") -> {
                            val level = when (stepName.removePrefix("COMPRESS_")) {
                                "EMAIL" -> CompressLevel.EMAIL
                                "PRINT" -> CompressLevel.PRINT
                                else -> CompressLevel.WEB
                            }
                            pdfEngine.compress(stepInputUri, stepOut, CompressMode.Preset(level))
                        }
                        stepName.startsWith("SIGN:") -> {
                            val alias = stepName.removePrefix("SIGN:")
                            val keyChain = certGenerator.getKeyAndChain(alias)
                            if (keyChain != null) {
                                pdfEngine.signCryptographic(
                                    source = stepInputUri,
                                    output = stepOut,
                                    privateKey = keyChain.first,
                                    certificateChain = keyChain.second,
                                    reason = "Batch Automated Signature",
                                    location = "Ledger Offline Toolkit"
                                )
                            } else {
                                // If no key found, copy through
                                FileInputStream(currentFile).use { it.copyTo(stepOut) }
                            }
                        }
                        else -> {
                            FileInputStream(currentFile).use { it.copyTo(stepOut) }
                        }
                    }
                }

                // Swap files for next step
                currentFile.delete()
                currentFile = nextFile
                nextFile = scratchFileManager.createScratchFile("batch_step_${stepIndex + 2}", ".pdf")
            }

            // Write final result to SAF destination
            safFileHandler.openOutputStream(finalOutputUri)?.use { finalOut ->
                FileInputStream(currentFile).use { fis ->
                    fis.copyTo(finalOut)
                }
                finalOut.flush()
            } ?: return@withContext Result.failure()

            Result.success()
        } catch (e: Exception) {
            Result.failure()
        } finally {
            if (currentFile.exists()) currentFile.delete()
            if (nextFile.exists()) nextFile.delete()
        }
    }

    private fun createForegroundInfo(step: Int, total: Int, text: String): ForegroundInfo {
        val cancelIntent = WorkManager.getInstance(context).createCancelPendingIntent(id)
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("Ledger Batch Pipeline")
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .setProgress(total, step, false)
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
            val name = "Batch Operations"
            val channel = NotificationChannel(
                CHANNEL_ID,
                name,
                NotificationManager.IMPORTANCE_LOW
            )
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}
