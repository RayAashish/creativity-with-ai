package org.ledger.pdf.data.model

import android.net.Uri

data class DocumentInfo(
    val uri: Uri,
    val name: String,
    val sizeBytes: Long,
    val pageCount: Int = 0,
    val isEncrypted: Boolean = false,
    val hasSignatures: Boolean = false,
    val lastModified: Long = System.currentTimeMillis()
) {
    val formattedSize: String
        get() = formatBytes(sizeBytes)

    companion object {
        fun formatBytes(bytes: Long): String {
            if (bytes <= 0) return "0 B"
            val units = arrayOf("B", "KB", "MB", "GB")
            val digitGroups = (Math.log10(bytes.toDouble()) / Math.log10(1024.0)).toInt()
            val clamped = digitGroups.coerceIn(0, units.size - 1)
            val value = bytes / Math.pow(1024.0, clamped.toDouble())
            return if (clamped == 0) {
                "${bytes} ${units[clamped]}"
            } else {
                String.format(java.util.Locale.US, "%.1f %s", value, units[clamped])
            }
        }
    }
}

data class PageInfo(
    val pageIndex: Int,
    val width: Int = 595,
    val height: Int = 842,
    val rotation: Int = 0,
    val isSelected: Boolean = false
) {
    val pageNumber: Int get() = pageIndex + 1
}
