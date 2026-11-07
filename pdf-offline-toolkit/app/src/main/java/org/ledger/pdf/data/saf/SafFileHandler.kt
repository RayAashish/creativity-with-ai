package org.ledger.pdf.data.saf

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.provider.OpenableColumns
import androidx.documentfile.provider.DocumentFile
import dagger.hilt.android.qualifiers.ApplicationContext
import org.ledger.pdf.data.model.DocumentInfo
import java.io.InputStream
import java.io.OutputStream
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SafFileHandler @Inject constructor(
    @ApplicationContext private val context: Context
) {
    /**
     * Persists URI read/write permissions so the document can be reopened from recent list.
     */
    fun takePersistablePermission(uri: Uri): Boolean {
        return try {
            val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
            context.contentResolver.takePersistableUriPermission(uri, takeFlags)
            true
        } catch (e: Exception) {
            try {
                // If write flag failed, try read-only
                context.contentResolver.takePersistableUriPermission(
                    uri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
                )
                true
            } catch (ignored: Exception) {
                false
            }
        }
    }

    /**
     * Queries display name and size via ContentResolver or direct file metadata without copying the file.
     */
    fun getDocumentInfo(uri: Uri): DocumentInfo {
        var name: String? = null
        var size: Long = 0

        // Handle file scheme directly
        if (uri.scheme == "file") {
            uri.path?.let { path ->
                val file = java.io.File(path)
                if (file.exists()) {
                    name = file.name
                    size = file.length()
                }
            }
        }

        // For content URIs, query OpenableColumns via ContentResolver
        if (name == null && uri.scheme == "content") {
            try {
                context.contentResolver.query(
                    uri,
                    arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE),
                    null,
                    null,
                    null
                )?.use { cursor ->
                    val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                    if (cursor.moveToFirst()) {
                        if (nameIndex != -1 && !cursor.isNull(nameIndex)) {
                            name = cursor.getString(nameIndex)
                        }
                        if (sizeIndex != -1 && !cursor.isNull(sizeIndex)) {
                            size = cursor.getLong(sizeIndex)
                        }
                    }
                }
            } catch (_: Exception) {
                // Ignore and proceed to fallbacks
            }
        }

        // Fallback to DocumentFile if needed
        if (name == null || size == 0L) {
            try {
                val docFile = DocumentFile.fromSingleUri(context, uri)
                if (name == null) {
                    name = docFile?.name
                }
                if (size == 0L) {
                    size = docFile?.length() ?: 0L
                }
            } catch (_: Exception) {
                // Ignore
            }
        }

        // If size is still 0, try opening ParcelFileDescriptor to read statSize
        if (size == 0L) {
            try {
                context.contentResolver.openFileDescriptor(uri, "r")?.use { pfd ->
                    val statSize = pfd.statSize
                    if (statSize > 0) size = statSize
                }
            } catch (_: Exception) {
                // Ignore
            }
        }

        // Fallback for name: URI's last path segment or Document.pdf
        val finalName = name
            ?: uri.lastPathSegment?.substringAfterLast('/')
            ?: "Document.pdf"

        return DocumentInfo(
            uri = uri,
            name = finalName,
            sizeBytes = size
        )
    }

    fun openInputStream(uri: Uri): InputStream? {
        return context.contentResolver.openInputStream(uri)
    }

    fun openOutputStream(uri: Uri, mode: String = "wt"): OutputStream? {
        return context.contentResolver.openOutputStream(uri, mode)
    }

    fun openFileDescriptor(uri: Uri, mode: String = "r"): ParcelFileDescriptor? {
        return try {
            context.contentResolver.openFileDescriptor(uri, mode)
        } catch (_: Exception) {
            null
        }
    }
}
