package org.ledger.pdf.data.model

enum class CompressLevel(val title: String, val dpi: Int, val quality: Int, val description: String) {
    EMAIL("Email / Ultra-Compact", 72, 45, "Smallest file size. Suitable for text attachments."),
    WEB("Web / Balanced", 144, 70, "Good balance of clarity and byte savings."),
    PRINT("Print / High Quality", 200, 85, "Preserves fine details and crisp graphics.")
}

sealed class CompressMode {
    data class Preset(val level: CompressLevel) : CompressMode()
    data class TargetSize(val targetBytes: Long) : CompressMode()
}

sealed class SplitMode {
    data class ByRange(val rangeExpression: String) : SplitMode()
    data class EveryNPages(val n: Int) : SplitMode()
    data object AtBookmarks : SplitMode()
}

data class MetadataItem(
    val key: String,
    val originalValue: String?,
    val willRemove: Boolean = true
)

data class MetadataDiff(
    val items: List<MetadataItem>,
    val hasXmpMetadata: Boolean,
    val annotationCount: Int,
    val thumbnailCount: Int
) {
    val totalRemovableCount: Int
        get() = items.count { it.originalValue != null } +
                (if (hasXmpMetadata) 1 else 0) +
                annotationCount +
                thumbnailCount
}

data class DigitalCertificate(
    val alias: String,
    val subjectDn: String,
    val issuerDn: String,
    val validFrom: Long,
    val validUntil: Long,
    val serialNumber: String,
    val isSelfSigned: Boolean,
    val hasPrivateKey: Boolean
) {
    val commonName: String
        get() {
            val parts = subjectDn.split(",")
            for (part in parts) {
                val trimmed = part.trim()
                if (trimmed.startsWith("CN=", ignoreCase = true)) {
                    return trimmed.substring(3)
                }
            }
            return alias
        }
}

data class SignatureInfo(
    val signerName: String,
    val signDate: Long,
    val reason: String?,
    val location: String?,
    val isValid: Boolean,
    val digestAlgorithm: String,
    val certificateSubject: String
)

sealed class BatchAction {
    data object StripMetadata : BatchAction()
    data class Compress(val level: CompressLevel) : BatchAction()
    data class Sign(val certAlias: String) : BatchAction()
    data class RotateAll(val degrees: Int) : BatchAction()

    val displayTitle: String
        get() = when (this) {
            is StripMetadata -> "Strip All Metadata & Tracking"
            is Compress -> "Compress (${level.title})"
            is Sign -> "Cryptographically Sign ($certAlias)"
            is RotateAll -> "Rotate All Pages ($degrees°)"
        }
}
