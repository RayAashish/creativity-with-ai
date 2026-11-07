package org.ledger.pdf

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import dagger.hilt.android.HiltAndroidApp
import org.ledger.pdf.data.repository.ScratchFileManager
import javax.inject.Inject

@HiltAndroidApp
class LedgerApp : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    @Inject
    lateinit var scratchFileManager: ScratchFileManager

    override fun onCreate() {
        super.onCreate()
        // Initialize PdfBox resource loader for fonts & glyph tables
        PDFBoxResourceLoader.init(applicationContext)

        // Security & hygiene: sweep any leftover intermediate scratch files on startup
        scratchFileManager.cleanStaleScratch()
    }

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
}
