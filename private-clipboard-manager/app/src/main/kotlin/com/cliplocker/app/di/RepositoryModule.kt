package com.cliplocker.app.di

import android.content.Context
import com.cliplocker.app.data.local.ClipDao
import com.cliplocker.app.data.local.IgnoreAppDao
import com.cliplocker.app.data.preferences.PreferencesManager
import com.cliplocker.app.data.repository.ClipRepository
import com.cliplocker.app.data.repository.ClipRepositoryImpl
import com.cliplocker.app.data.storage.ImageStorageManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun providePreferencesManager(
        @ApplicationContext context: Context
    ): PreferencesManager {
        return PreferencesManager(context)
    }

    @Provides
    @Singleton
    fun provideClipRepository(
        @ApplicationContext context: Context,
        clipDao: ClipDao,
        ignoreAppDao: IgnoreAppDao,
        preferencesManager: PreferencesManager,
        imageStorageManager: ImageStorageManager
    ): ClipRepository {
        return ClipRepositoryImpl(
            context = context,
            clipDao = clipDao,
            ignoreAppDao = ignoreAppDao,
            preferencesManager = preferencesManager,
            imageStorageManager = imageStorageManager
        )
    }
}
