package org.ledger.pdf.data.repository

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScratchFileManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val scratchDir: File by lazy {
        File(context.cacheDir, "ledger_scratch").apply {
            if (!exists()) {
                mkdirs()
            }
        }
    }

    /**
     * Creates a uniquely named temporary scratch file.
     */
    fun createScratchFile(prefix: String = "tmp", suffix: String = ".pdf"): File {
        if (!scratchDir.exists()) {
            scratchDir.mkdirs()
        }
        val fileName = "${prefix}_${UUID.randomUUID()}$suffix"
        return File(scratchDir, fileName).apply {
            createNewFile()
        }
    }

    /**
     * Executes a block with a temporary scratch file, guaranteed to delete it immediately upon exit.
     */
    inline fun <R> withScratchFile(
        prefix: String = "scratch",
        suffix: String = ".pdf",
        block: (File) -> R
    ): R {
        val file = createScratchFile(prefix, suffix)
        return try {
            block(file)
        } finally {
            if (file.exists()) {
                file.delete()
            }
        }
    }

    /**
     * Copies an input stream to a scratch file and executes block, then wipes the scratch file.
     */
    inline fun <R> withScratchCopy(
        inputStream: InputStream,
        prefix: String = "input_copy",
        block: (File) -> R
    ): R {
        return withScratchFile(prefix) { scratchFile ->
            FileOutputStream(scratchFile).use { out ->
                inputStream.copyTo(out)
            }
            block(scratchFile)
        }
    }

    /**
     * Wipes all files in the scratch directory (used at app launch and manual cache cleanup).
     */
    fun cleanStaleScratch(): Long {
        if (!scratchDir.exists()) return 0L
        var reclaimedBytes = 0L
        scratchDir.listFiles()?.forEach { file ->
            reclaimedBytes += file.length()
            file.deleteRecursively()
        }
        return reclaimedBytes
    }

    /**
     * Calculates total bytes currently occupied by scratch files.
     */
    fun getScratchSizeBytes(): Long {
        if (!scratchDir.exists()) return 0L
        var total = 0L
        scratchDir.listFiles()?.forEach { file ->
            total += file.length()
        }
        return total
    }
}
