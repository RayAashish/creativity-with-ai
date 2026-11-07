package com.cliplocker.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.cliplocker.app.core.model.SecretTtl
import com.cliplocker.app.data.preferences.PreferencesManager
import com.cliplocker.app.data.repository.ClipRepository
import com.cliplocker.app.ui.MainActivity
import com.cliplocker.app.widget.CliplockerWidgetProvider
import com.cliplocker.app.worker.ExpiryWorker
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class ClipboardCaptureService : Service() {

    @Inject
    lateinit var clipRepository: ClipRepository

    @Inject
    lateinit var preferencesManager: PreferencesManager

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var clipboardManager: ClipboardManager? = null

    private val clipListener = ClipboardManager.OnPrimaryClipChangedListener {
        onClipboardChanged()
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification(isPaused = false))

        clipboardManager = getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        clipboardManager?.addPrimaryClipChangedListener(clipListener)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_TOGGLE_PAUSE -> {
                val current = preferencesManager.userPreferences.value.isCaptureEnabled
                preferencesManager.updatePreferences { it.copy(isCaptureEnabled = !current) }
                updateNotification(!current)
            }
        }
        return START_STICKY
    }

    private fun onClipboardChanged() {
        val prefs = preferencesManager.userPreferences.value
        if (!prefs.isCaptureEnabled || prefs.isIncognito) return

        val clipboard = clipboardManager ?: return
        if (!clipboard.hasPrimaryClip()) return

        val clip = clipboard.primaryClip ?: return
        if (clip.itemCount == 0) return

        val item = clip.getItemAt(0) ?: return
        val description = clip.description

        var sourcePackage: String? = null
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10+ extras may contain source package in specific OEM setups
            val extras = description.extras
            sourcePackage = extras?.getString("android.intent.extra.PACKAGE_NAME")
        }

        val hasImage = description.hasMimeType("image/*") || description.hasMimeType(ClipDescription.MIMETYPE_TEXT_URILIST)
        val imageUri = if (hasImage) item.uri else null
        val text = item.text?.toString() ?: if (!hasImage) item.coerceToText(this)?.toString() else null

        if (sourcePackage == packageName) return

        val content = text ?: imageUri?.toString() ?: return
        if (content.isBlank()) return

        serviceScope.launch {
            val insertedId = clipRepository.saveNewClipFromCapture(
                content = content,
                sourceAppPackage = sourcePackage,
                imageUri = imageUri
            )

            if (insertedId != null) {
                // If the inserted item is a secret, schedule quick expiry check
                val savedClip = clipRepository.getClipByIdSync(insertedId)
                if (savedClip != null && savedClip.isSecret && savedClip.secretExpiresAt != null) {
                    val delay = (savedClip.secretExpiresAt - System.currentTimeMillis()).coerceAtLeast(0L)
                    ExpiryWorker.scheduleImmediate(this@ClipboardCaptureService, delay)
                }

                // Update widgets
                CliplockerWidgetProvider.updateAllWidgets(this@ClipboardCaptureService)
            }
        }
    }

    private fun buildNotification(isPaused: Boolean): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent, PendingIntent.FLAG_IMMUTABLE
        )

        // Capture Now action triggers CaptureActivity which has foreground window focus
        val captureIntent = Intent(this, CaptureActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val capturePendingIntent = PendingIntent.getActivity(
            this, 3, captureIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val toggleIntent = Intent(this, ClipboardCaptureService::class.java).apply {
            action = ACTION_TOGGLE_PAUSE
        }
        val togglePendingIntent = PendingIntent.getService(
            this, 1, toggleIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val searchIntent = Intent(this, MainActivity::class.java).apply {
            action = MainActivity.ACTION_OPEN_SEARCH
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val searchPendingIntent = PendingIntent.getActivity(
            this, 2, searchIntent, PendingIntent.FLAG_IMMUTABLE
        )

        val statusText = if (isPaused) "Capture paused" else "Active — on-device encrypted"
        val toggleActionTitle = if (isPaused) "Resume" else "Pause"

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Cliplocker")
            .setContentText(statusText)
            .setSmallIcon(android.R.drawable.ic_menu_agenda)
            .setOngoing(true)
            .setContentIntent(openAppPendingIntent)
            .addAction(0, "Capture Now", capturePendingIntent)
            .addAction(0, toggleActionTitle, togglePendingIntent)
            .addAction(0, "Search", searchPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setShowWhen(false)
            .build()
    }

    private fun updateNotification(isPaused: Boolean) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, buildNotification(isPaused))
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Cliplocker Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitors local clipboard events offline"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        clipboardManager?.removePrimaryClipChangedListener(clipListener)
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val CHANNEL_ID = "cliplocker_capture_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_START = "com.cliplocker.action.START"
        const val ACTION_STOP = "com.cliplocker.action.STOP"
        const val ACTION_TOGGLE_PAUSE = "com.cliplocker.action.TOGGLE_PAUSE"

        fun start(context: Context) {
            val intent = Intent(context, ClipboardCaptureService::class.java).apply {
                action = ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, ClipboardCaptureService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }
}
