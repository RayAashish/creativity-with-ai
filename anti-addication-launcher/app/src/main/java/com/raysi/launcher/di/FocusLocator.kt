// app/src/main/java/com/raysi/launcher/di/FocusLocator.kt
package com.raysi.launcher.di

import android.content.Context
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.core.dispatchers.StandardFocusDispatchers
import com.raysi.launcher.data.quarantine.QuarantineDatabase
import com.raysi.launcher.data.receiver.DeviceStateReceiver
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.AppInventoryRepositoryImpl
import com.raysi.launcher.data.repository.PreferencesRepository
import com.raysi.launcher.data.repository.PreferencesRepositoryImpl
import com.raysi.launcher.data.repository.QuarantineRepository
import com.raysi.launcher.data.repository.QuarantineRepositoryImpl
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.repository.SettingsRepositoryImpl
import com.raysi.launcher.data.repository.TelemetryRepository
import com.raysi.launcher.data.repository.TelemetryRepositoryImpl
import com.raysi.launcher.data.repository.UsageRepository
import com.raysi.launcher.data.repository.UsageRepositoryImpl
import com.raysi.launcher.data.search.KotlinSearchEngine
import com.raysi.launcher.data.search.SearchEngine
import com.raysi.launcher.util.SystemThemingHelper
import java.io.Closeable

/**
 * FocusLocator provides manual, zero-reflection service location held in FocusApplication.
 * Strictly guarantees no runtime reflection or synthetic accessor overhead.
 */
class FocusLocator(
    private val appContext: Context,
    val dispatchers: FocusDispatchers = StandardFocusDispatchers()
) : Closeable {

    val settingsRepository: SettingsRepository by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        SettingsRepositoryImpl(appContext, dispatchers)
    }

    val appInventoryRepository: AppInventoryRepository by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        AppInventoryRepositoryImpl(appContext, dispatchers)
    }

    val usageRepository: UsageRepository by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        UsageRepositoryImpl(appContext, dispatchers)
    }

    val searchEngine: SearchEngine by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        KotlinSearchEngine()
    }

    val quarantineDatabase: QuarantineDatabase by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        QuarantineDatabase.getInstance(appContext)
    }

    val quarantineRepository: QuarantineRepository by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        QuarantineRepositoryImpl(quarantineDatabase.quarantineDao(), dispatchers)
    }

    val preferencesRepository: PreferencesRepository by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        PreferencesRepositoryImpl(appContext, dispatchers)
    }

    val deviceStateReceiver: DeviceStateReceiver by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        DeviceStateReceiver(preferencesRepository, dispatchers)
    }

    val telemetryRepository: TelemetryRepository by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        TelemetryRepositoryImpl(
            context = appContext,
            preferencesRepository = preferencesRepository,
            quarantineRepository = quarantineRepository,
            appInventoryRepository = appInventoryRepository,
            settingsRepository = settingsRepository,
            deviceStateReceiver = deviceStateReceiver,
            dispatchers = dispatchers
        )
    }

    val systemThemingHelper: SystemThemingHelper by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
        SystemThemingHelper(appContext)
    }

    override fun close() {
        try {
            systemThemingHelper.close()
        } catch (_: Exception) {}
        try {
            telemetryRepository.close()
        } catch (ignored: Exception) {
        }
        try {
            if (quarantineDatabase.isOpen) {
                quarantineDatabase.close()
            }
        } catch (ignored: Exception) {
        }
        if (searchEngine is Closeable) {
            (searchEngine as Closeable).close()
        }
        if (usageRepository is Closeable) {
            (usageRepository as Closeable).close()
        }
        if (appInventoryRepository is Closeable) {
            (appInventoryRepository as Closeable).close()
        }
        if (dispatchers is Closeable) {
            dispatchers.close()
        }
    }
}
