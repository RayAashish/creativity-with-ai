// app/src/main/java/com/raysi/launcher/FocusApplication.kt
package com.raysi.launcher

import android.app.Application
import com.raysi.launcher.di.FocusLocator
import com.raysi.launcher.service.notification.DigestScheduler

/**
 * FocusApplication holds the singleton FocusLocator instance.
 * Warms up the in-memory immutable settings snapshot synchronously on cold start
 * so that the first frame never blocks on disk I/O.
 */
class FocusApplication : Application() {

    lateinit var locator: FocusLocator
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        locator = FocusLocator(this)

        // Warm up immutable snapshot in memory immediately
        val initialSnapshot = locator.settingsRepository.snapshot
        // Touch memory to verify warm-up
        checkNotNull(initialSnapshot)

        // Schedule periodic notification digest via WorkManager
        DigestScheduler.scheduleNextDigest(this, initialSnapshot.digestHours)
    }

    override fun onTerminate() {
        locator.close()
        super.onTerminate()
    }

    companion object {
        lateinit var instance: FocusApplication
            private set
    }
}
