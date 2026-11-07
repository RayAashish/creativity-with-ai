package com.cliplocker.app.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.cliplocker.app.data.preferences.PreferencesManager
import com.cliplocker.app.worker.ExpiryWorker
import com.cliplocker.app.worker.RetentionWorker
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {

    @Inject
    lateinit var preferencesManager: PreferencesManager

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action
        if (action == Intent.ACTION_BOOT_COMPLETED || action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            // Re-schedule workers
            ExpiryWorker.schedulePeriodic(context)
            RetentionWorker.schedulePeriodic(context)

            // Start capture service if enabled
            val prefs = preferencesManager.userPreferences.value
            if (prefs.isCaptureEnabled) {
                val serviceIntent = Intent(context, ClipboardCaptureService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}
