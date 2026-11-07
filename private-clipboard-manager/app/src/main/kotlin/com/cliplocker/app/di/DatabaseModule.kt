package com.cliplocker.app.di

import android.content.Context
import com.cliplocker.app.core.crypto.DatabaseKeyManager
import com.cliplocker.app.data.local.AppDatabase
import com.cliplocker.app.data.local.ClipDao
import com.cliplocker.app.data.local.IgnoreAppDao
import com.cliplocker.app.data.storage.ImageStorageManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabaseKeyManager(
        @ApplicationContext context: Context
    ): DatabaseKeyManager {
        return DatabaseKeyManager(context)
    }

    @Provides
    @Singleton
    fun provideAppDatabase(
        @ApplicationContext context: Context,
        databaseKeyManager: DatabaseKeyManager
    ): AppDatabase {
        val passphrase = databaseKeyManager.getOrCreateDatabasePassphrase()
        return AppDatabase.buildEncrypted(context, passphrase)
    }

    @Provides
    fun provideClipDao(database: AppDatabase): ClipDao {
        return database.clipDao()
    }

    @Provides
    fun provideIgnoreAppDao(database: AppDatabase): IgnoreAppDao {
        return database.ignoreAppDao()
    }

    @Provides
    @Singleton
    fun provideImageStorageManager(
        @ApplicationContext context: Context
    ): ImageStorageManager {
        return ImageStorageManager(context)
    }
}
