package com.antigravity.note.document.repair

import androidx.ink.strokes.Stroke
import com.antigravity.note.document.model.DocumentPage
import java.util.UUID

object PageRepairTool {

    data class RepairScanResult(
        val pageId: String,
        val pageTitle: String,
        val originalStrokeCount: Int,
        val redundantStrokeIndices: List<Int>,
        val cleanedStrokeCount: Int,
        val isDamaged: Boolean
    )

    /**
     * Scans a DocumentPage for stacked or concentric redundant strokes produced by
     * intermediate drag/transform frames (e.g., 3 or more consecutive strokes with identical
     * brush properties and point counts where intermediate moves were recorded).
     */
    fun scan(page: DocumentPage): RepairScanResult {
        val strokes = page.strokes
        val redundant = mutableListOf<Int>()
        var i = 0

        while (i < strokes.size) {
            val strokeI = strokes[i]
            var j = i + 1
            while (j < strokes.size) {
                val strokeJ = strokes[j]
                val sameBrush = strokeJ.brush.family == strokeI.brush.family &&
                        strokeJ.brush.colorIntArgb == strokeI.brush.colorIntArgb &&
                        kotlin.math.abs(strokeJ.brush.size - strokeI.brush.size) < 0.01f
                val samePointCount = kotlin.math.abs(strokeJ.inputs.size - strokeI.inputs.size) <= 1

                if (sameBrush && samePointCount) {
                    j++
                } else {
                    break
                }
            }
            val runLen = j - i
            if (runLen >= 3) {
                // Keep only the final stroke in the drag sequence (the destination)
                for (k in i until (j - 1)) {
                    redundant.add(k)
                }
            }
            i = j
        }

        return RepairScanResult(
            pageId = page.metadata.pageId,
            pageTitle = page.metadata.title,
            originalStrokeCount = strokes.size,
            redundantStrokeIndices = redundant,
            cleanedStrokeCount = strokes.size - redundant.size,
            isDamaged = redundant.isNotEmpty()
        )
    }

    /**
     * Creates a cleaned copy of DocumentPage with redundant intermediate drag strokes removed.
     */
    fun applyRepair(page: DocumentPage): DocumentPage {
        val scanResult = scan(page)
        if (!scanResult.isDamaged) return page

        val redundantSet = scanResult.redundantStrokeIndices.toSet()
        val cleanedStrokes = mutableListOf<Stroke>()
        val cleanedIds = mutableListOf<String>()

        for (i in page.strokes.indices) {
            if (!redundantSet.contains(i)) {
                cleanedStrokes.add(page.strokes[i])
                val id = page.strokeIds.getOrNull(i) ?: UUID.randomUUID().toString()
                cleanedIds.add(id)
            }
        }

        return page.copy(
            metadata = page.metadata.copy(
                strokeCount = cleanedStrokes.size,
                modifiedAt = System.currentTimeMillis()
            ),
            strokes = cleanedStrokes,
            strokeIds = cleanedIds
        )
    }
}
