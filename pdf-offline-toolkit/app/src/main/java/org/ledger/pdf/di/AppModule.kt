package org.ledger.pdf.di

import android.content.Context
import androidx.room.Room
import androidx.work.WorkManager
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import org.ledger.pdf.data.db.LedgerDatabase
import org.ledger.pdf.data.db.RecentDocumentDao
import org.ledger.pdf.engine.PdfBoxAndroidEngine
import org.ledger.pdf.engine.PdfEngine
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class EngineModule {
    @Binds
    @Singleton
    abstract fun bindPdfEngine(impl: PdfBoxAndroidEngine): PdfEngine
}

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideLedgerDatabase(@ApplicationContext context: Context): LedgerDatabase {
        return Room.databaseBuilder(
            context,
            LedgerDatabase::class.java,
            "ledger_db"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    fun provideRecentDocumentDao(db: LedgerDatabase): RecentDocumentDao {
        return db.recentDocumentDao()
    }

    @Provides
    @Singleton
    fun provideWorkManager(@ApplicationContext context: Context): WorkManager {
        return WorkManager.getInstance(context)
    }
}
