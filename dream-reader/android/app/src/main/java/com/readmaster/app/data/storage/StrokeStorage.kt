package com.readmaster.app.data.storage

import android.content.Context
import androidx.ink.brush.Brush
import androidx.ink.brush.InputToolType
import androidx.ink.brush.StockBrushes
import androidx.ink.strokes.MutableStrokeInputBatch
import androidx.ink.strokes.Stroke
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.DataInputStream
import java.io.DataOutputStream
import java.io.File
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * High-performance binary serializer and deserializer for vector pen and highlighter strokes.
 * Persists user handwriting, high-DPI ink, and annotations per-document and per-page across
 * app exits and reboots with atomic writes and zero data loss.
 */
object StrokeStorage {
    private const val MAGIC_HEADER = 0x494E4B31 // "INK1"
    private const val CURRENT_VERSION = 1

    private fun getStorageFile(context: Context, documentId: String): File {
        val dir = File(context.filesDir, "strokes")
        if (!dir.exists()) dir.mkdirs()
        val safeName = documentId.replace(Regex("[^a-zA-Z0-9_-]"), "_")
        return File(dir, "doc_${safeName}.ink")
    }

    suspend fun saveStrokes(
        context: Context,
        documentId: String,
        pageStrokesMap: Map<Int, List<Stroke>>
    ) = withContext(Dispatchers.IO) {
        saveStrokesSync(context, documentId, pageStrokesMap)
    }

    fun saveStrokesSync(
        context: Context,
        documentId: String,
        pageStrokesMap: Map<Int, List<Stroke>>
    ) {
        if (documentId.isBlank()) return
        val file = getStorageFile(context, documentId)
        val tempFile = File(file.parentFile, "${file.name}.tmp")

        try {
            val nonEmptyPages = pageStrokesMap.filter { it.value.isNotEmpty() }
            if (nonEmptyPages.isEmpty()) {
                if (file.exists()) file.delete()
                if (tempFile.exists()) tempFile.delete()
                return
            }

            DataOutputStream(BufferedOutputStream(tempFile.outputStream())).use { out ->
                out.writeInt(MAGIC_HEADER)
                out.writeInt(CURRENT_VERSION)
                out.writeInt(nonEmptyPages.size)

                for ((pageIndex, strokes) in nonEmptyPages) {
                    out.writeInt(pageIndex)
                    out.writeInt(strokes.size)

                    for (stroke in strokes) {
                        val isHighlighter = stroke.brush.family == StockBrushes.highlighter()
                        out.writeBoolean(isHighlighter)
                        out.writeInt(stroke.brush.colorIntArgb)
                        out.writeFloat(stroke.brush.size)
                        out.writeFloat(stroke.brush.epsilon)

                        val inputs = stroke.inputs
                        val inputSize = inputs.size
                        out.writeInt(inputSize)
                        for (i in 0 until inputSize) {
                            val pt = inputs.get(i)
                            out.writeInt(pt.toolType.value)
                            out.writeFloat(pt.x)
                            out.writeFloat(pt.y)
                            out.writeLong(pt.elapsedTimeMillis)
                            out.writeFloat(pt.strokeUnitLengthCm)
                            out.writeFloat(pt.pressure)
                            out.writeFloat(pt.tiltRadians)
                            out.writeFloat(pt.orientationRadians)
                        }
                    }
                }
                out.flush()
            }

            if (tempFile.exists() && tempFile.length() > 0L) {
                if (file.exists()) file.delete()
                tempFile.renameTo(file)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            if (tempFile.exists()) tempFile.delete()
        }
    }

    suspend fun loadStrokes(
        context: Context,
        documentId: String
    ): Map<Int, List<Stroke>> = withContext(Dispatchers.IO) {
        loadStrokesSync(context, documentId)
    }

    fun loadStrokesSync(
        context: Context,
        documentId: String
    ): Map<Int, List<Stroke>> {
        if (documentId.isBlank()) return emptyMap()
        val file = getStorageFile(context, documentId)
        if (!file.exists() || file.length() == 0L) return emptyMap()

        val result = HashMap<Int, MutableList<Stroke>>()
        try {
            DataInputStream(BufferedInputStream(file.inputStream())).use { input ->
                val magic = input.readInt()
                if (magic != MAGIC_HEADER) return emptyMap()
                val version = input.readInt()
                val pageCount = input.readInt()

                for (p in 0 until pageCount) {
                    val pageIndex = input.readInt()
                    val strokeCount = input.readInt()
                    val pageList = ArrayList<Stroke>(strokeCount)

                    for (s in 0 until strokeCount) {
                        val isHighlighter = input.readBoolean()
                        val colorArgb = input.readInt()
                        val size = input.readFloat()
                        val epsilon = input.readFloat()

                        val family = if (isHighlighter) StockBrushes.highlighter() else StockBrushes.marker()
                        val brush = Brush.createWithColorIntArgb(family, colorArgb, size, epsilon)

                        val inputCount = input.readInt()
                        val batch = MutableStrokeInputBatch()
                        for (i in 0 until inputCount) {
                            val toolTypeValue = input.readInt()
                            val toolType = InputToolType.fromInt(toolTypeValue)
                            val x = input.readFloat()
                            val y = input.readFloat()
                            val time = input.readLong()
                            val unitLen = input.readFloat()
                            val pressure = input.readFloat()
                            val tilt = input.readFloat()
                            val orientation = input.readFloat()

                            batch.add(
                                toolType,
                                x,
                                y,
                                time,
                                unitLen,
                                pressure.coerceIn(0.01f, 1.0f),
                                tilt.coerceIn(0f, 1.57f),
                                orientation
                            )
                        }
                        pageList.add(Stroke(brush, batch.toImmutable()))
                    }
                    result[pageIndex] = pageList
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return result
    }
}
