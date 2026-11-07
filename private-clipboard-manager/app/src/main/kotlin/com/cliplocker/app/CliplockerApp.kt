package com.cliplocker.app

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.cliplocker.app.data.preferences.PreferencesManager
import com.cliplocker.app.service.ClipboardCaptureService
import com.cliplocker.app.worker.ExpiryWorker
import com.cliplocker.app.worker.RetentionWorker
import dagger.hilt.android.HiltAndroidApp
import net.sqlcipher.database.SQLiteDatabase
import javax.inject.Inject

@HiltAndroidApp
class CliplockerApp : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    @Inject
    lateinit var preferencesManager: PreferencesManager

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()

        // Initialize SQLCipher native libraries
        SQLiteDatabase.loadLibs(this)

        // Schedule periodic maintenance & expiry workers
        ExpiryWorker.schedulePeriodic(this)
        RetentionWorker.schedulePeriodic(this)

        // Start capture foreground service if enabled in preferences
        if (preferencesManager.userPreferences.value.isCaptureEnabled) {
            ClipboardCaptureService.start(this)
        }
    }
}
