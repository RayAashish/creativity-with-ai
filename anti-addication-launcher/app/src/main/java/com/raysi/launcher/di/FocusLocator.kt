// app/src/main/java/com/raysi/launcher/di/FocusLocator.kt
package com.raysi.launcher.di

import android.content.Context
import com.raysi.launcher.core.dispatchers.FocusDispatchers
import com.raysi.launcher.core.dispatchers.StandardFocusDispatchers
import com.raysi.launcher.data.quarantine.QuarantineDatabase
import com.raysi.launcher.data.repository.AppInventoryRepository
import com.raysi.launcher.data.repository.AppInventoryRepositoryImpl
import com.raysi.launcher.data.repository.QuarantineRepository
import com.raysi.launcher.data.repository.QuarantineRepositoryImpl
import com.raysi.launcher.data.repository.SettingsRepository
import com.raysi.launcher.data.repository.SettingsRepositoryImpl
import com.raysi.launcher.data.repository.UsageRepository
import com.raysi.launcher.data.repository.UsageRepositoryImpl
import com.raysi.launcher.data.search.KotlinSearchEngine
import com.raysi.launcher.data.search.SearchEngine
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

    override fun close() {
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
