package com.antigravity.note.document.storage

import androidx.ink.brush.Brush
import androidx.ink.brush.BrushFamily
import androidx.ink.brush.InputToolType
import androidx.ink.brush.StockBrushes
import androidx.ink.storage.StrokeInputBatchSerialization
import androidx.ink.strokes.ImmutableStrokeInputBatch
import androidx.ink.strokes.MutableStrokeInputBatch
import androidx.ink.strokes.Stroke
import androidx.ink.strokes.StrokeInput
import com.antigravity.note.document.model.DocumentPage
import com.antigravity.note.document.model.PageMetadata
import com.antigravity.note.document.model.PaperTemplate
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.DataInputStream
import java.io.DataOutputStream
import java.io.InputStream
import java.io.OutputStream

object PageSerializer {

    private const val MAGIC_HEADER = 0x494E4B31 // "INK1"
    private const val FORMAT_VERSION = 2

    const val BRUSH_FAMILY_PRESSURE_PEN: Byte = 0
    const val BRUSH_FAMILY_HIGHLIGHTER: Byte = 1
    const val BRUSH_FAMILY_MARKER: Byte = 2

    private const val ENCODING_NATIVE_INK_PROTO: Byte = 0
    private const val ENCODING_RAW_INPUT_STREAM: Byte = 1

    val defaultBrushFamily: BrushFamily by lazy { StockBrushes.pressurePen() }

    fun serialize(page: DocumentPage, outputStream: OutputStream) {
        val dataOut = DataOutputStream(outputStream)
        // 1. Header
        dataOut.writeInt(MAGIC_HEADER)
        dataOut.writeInt(FORMAT_VERSION)

        // 2. Page Metadata
        val meta = page.metadata
        dataOut.writeUTF(meta.pageId)
        dataOut.writeUTF(meta.notebookId)
        dataOut.writeInt(meta.pageIndex)
        dataOut.writeUTF(meta.title)
        dataOut.writeInt(meta.template.ordinal)
        dataOut.writeLong(meta.createdAt)
        dataOut.writeLong(meta.modifiedAt)

        // 3. Strokes
        dataOut.writeInt(page.strokes.size)
        val strokeInputTemp = StrokeInput()

        for (stroke in page.strokes) {
            val brush = stroke.brush
            val familyId = when (brush.family) {
                StockBrushes.highlighter() -> BRUSH_FAMILY_HIGHLIGHTER
                StockBrushes.marker() -> BRUSH_FAMILY_MARKER
                else -> BRUSH_FAMILY_PRESSURE_PEN
            }
            dataOut.writeByte(familyId.toInt())
            dataOut.writeInt(brush.colorIntArgb)
            dataOut.writeFloat(brush.size)
            dataOut.writeFloat(brush.epsilon)

            // Try native Ink serialization first
            var encodedBytes: ByteArray? = null
            var encodingType = ENCODING_NATIVE_INK_PROTO
            try {
                val byteOut = ByteArrayOutputStream()
                StrokeInputBatchSerialization.encode(stroke.inputs, byteOut)
                encodedBytes = byteOut.toByteArray()
            } catch (t: Throwable) {
                // Fallback to portable raw input stream
                encodingType = ENCODING_RAW_INPUT_STREAM
                val rawOut = ByteArrayOutputStream()
                val rawData = DataOutputStream(rawOut)
                val batch = stroke.inputs
                val count = batch.size
                rawData.writeInt(count)
                for (i in 0 until count) {
                    batch.populate(i, strokeInputTemp)
                    rawData.writeFloat(strokeInputTemp.x)
                    rawData.writeFloat(strokeInputTemp.y)
                    rawData.writeLong(strokeInputTemp.elapsedTimeMillis)
                    rawData.writeInt(strokeInputTemp.toolType.value)
                    rawData.writeFloat(strokeInputTemp.strokeUnitLengthCm)
                    rawData.writeFloat(strokeInputTemp.pressure)
                    rawData.writeFloat(strokeInputTemp.tiltRadians)
                    rawData.writeFloat(strokeInputTemp.orientationRadians)
                }
                rawData.flush()
                encodedBytes = rawOut.toByteArray()
            }

            dataOut.writeByte(encodingType.toInt())
            dataOut.writeInt(encodedBytes.size)
            dataOut.write(encodedBytes)
        }
        dataOut.flush()
    }

    fun deserialize(inputStream: InputStream): DocumentPage {
        val dataIn = DataInputStream(inputStream)

        // 1. Header check
        val magic = dataIn.readInt()
        if (magic != MAGIC_HEADER) {
            throw IllegalArgumentException("Invalid file magic: 0x%08X (expected 0x%08X)".format(magic, MAGIC_HEADER))
        }
        val version = dataIn.readInt()
        if (version > FORMAT_VERSION) {
            throw IllegalArgumentException("Unsupported file version: $version (max supported: $FORMAT_VERSION)")
        }

        // 2. Metadata
        val pageId = dataIn.readUTF()
        val notebookId = dataIn.readUTF()
        val pageIndex = dataIn.readInt()
        val title = dataIn.readUTF()
        val templateOrdinal = dataIn.readInt()
        val createdAt = dataIn.readLong()
        val modifiedAt = dataIn.readLong()

        val metadata = PageMetadata(
            pageId = pageId,
            notebookId = notebookId,
            pageIndex = pageIndex,
            title = title,
            template = PaperTemplate.fromOrdinal(templateOrdinal),
            strokeCount = 0,
            createdAt = createdAt,
            modifiedAt = modifiedAt
        )

        // 3. Strokes
        val strokeCount = dataIn.readInt()
        val strokes = ArrayList<Stroke>(strokeCount)

        for (i in 0 until strokeCount) {
            val brushFamily: BrushFamily
            val colorArgb: Int
            val size: Float
            val epsilon: Float

            if (version >= 2) {
                val familyId = dataIn.readByte()
                brushFamily = when (familyId) {
                    BRUSH_FAMILY_HIGHLIGHTER -> StockBrushes.highlighter()
                    BRUSH_FAMILY_MARKER -> StockBrushes.marker()
                    else -> StockBrushes.pressurePen()
                }
                colorArgb = dataIn.readInt()
                size = dataIn.readFloat()
                epsilon = dataIn.readFloat()
            } else {
                colorArgb = dataIn.readInt()
                size = dataIn.readFloat()
                epsilon = dataIn.readFloat()
                val alpha = (colorArgb ushr 24) and 0xFF
                // Auto-detect highlighters in v1 by translucent alpha channel
                brushFamily = if (alpha <= 0x80) StockBrushes.highlighter() else StockBrushes.pressurePen()
            }

            val encodingType = dataIn.readByte()
            val payloadLength = dataIn.readInt()
            val payloadBytes = ByteArray(payloadLength)
            dataIn.readFully(payloadBytes)

            val inputs: ImmutableStrokeInputBatch = if (encodingType == ENCODING_NATIVE_INK_PROTO) {
                try {
                    val byteIn = ByteArrayInputStream(payloadBytes)
                    StrokeInputBatchSerialization.decode(byteIn)
                } catch (t: Throwable) {
                    // Fallback empty if native decode fails
                    MutableStrokeInputBatch().toImmutable()
                }
            } else {
                val rawIn = DataInputStream(ByteArrayInputStream(payloadBytes))
                val count = rawIn.readInt()
                val mutableBatch = MutableStrokeInputBatch()
                for (p in 0 until count) {
                    val x = rawIn.readFloat()
                    val y = rawIn.readFloat()
                    val elapsed = rawIn.readLong()
                    val toolValue = rawIn.readInt()
                    val strokeUnit = rawIn.readFloat()
                    val pressure = rawIn.readFloat()
                    val tilt = rawIn.readFloat()
                    val orientation = rawIn.readFloat()
                    val tool = InputToolType.fromInt(toolValue)
                    mutableBatch.add(tool, x, y, elapsed, strokeUnit, pressure, tilt, orientation)
                }
                mutableBatch.toImmutable()
            }

            val brush = Brush.createWithColorIntArgb(brushFamily, colorArgb, size, epsilon)
            val stroke = Stroke(brush, inputs)
            strokes.add(stroke)
        }

        return DocumentPage(
            metadata = metadata.copy(strokeCount = strokes.size),
            strokes = strokes
        )
    }

    fun serializeSingleStroke(stroke: Stroke, outputStream: OutputStream) {
        val dataOut = DataOutputStream(outputStream)
        val brush = stroke.brush
        val familyId = when (brush.family) {
            StockBrushes.highlighter() -> BRUSH_FAMILY_HIGHLIGHTER
            StockBrushes.marker() -> BRUSH_FAMILY_MARKER
            else -> BRUSH_FAMILY_PRESSURE_PEN
        }
        dataOut.writeByte(familyId.toInt())
        dataOut.writeInt(brush.colorIntArgb)
        dataOut.writeFloat(brush.size)
        dataOut.writeFloat(brush.epsilon)

        var encodedBytes: ByteArray? = null
        var encodingType = ENCODING_NATIVE_INK_PROTO
        try {
            val byteOut = ByteArrayOutputStream()
            StrokeInputBatchSerialization.encode(stroke.inputs, byteOut)
            encodedBytes = byteOut.toByteArray()
        } catch (t: Throwable) {
            encodingType = ENCODING_RAW_INPUT_STREAM
            val rawOut = ByteArrayOutputStream()
            val rawData = DataOutputStream(rawOut)
            val batch = stroke.inputs
            val count = batch.size
            val temp = StrokeInput()
            rawData.writeInt(count)
            for (i in 0 until count) {
                batch.populate(i, temp)
                rawData.writeFloat(temp.x)
                rawData.writeFloat(temp.y)
                rawData.writeLong(temp.elapsedTimeMillis)
                rawData.writeInt(temp.toolType.value)
                rawData.writeFloat(temp.strokeUnitLengthCm)
                rawData.writeFloat(temp.pressure)
                rawData.writeFloat(temp.tiltRadians)
                rawData.writeFloat(temp.orientationRadians)
            }
            rawData.flush()
            encodedBytes = rawOut.toByteArray()
        }

        dataOut.writeByte(encodingType.toInt())
        dataOut.writeInt(encodedBytes.size)
        dataOut.write(encodedBytes)
        dataOut.flush()
    }

    fun deserializeSingleStroke(inputStream: InputStream, isV2: Boolean = true): Stroke {
        val dataIn = DataInputStream(inputStream)
        val brushFamily: BrushFamily
        val colorArgb: Int
        val size: Float
        val epsilon: Float

        if (isV2) {
            val familyId = dataIn.readByte()
            brushFamily = when (familyId) {
                BRUSH_FAMILY_HIGHLIGHTER -> StockBrushes.highlighter()
                BRUSH_FAMILY_MARKER -> StockBrushes.marker()
                else -> StockBrushes.pressurePen()
            }
            colorArgb = dataIn.readInt()
            size = dataIn.readFloat()
            epsilon = dataIn.readFloat()
        } else {
            colorArgb = dataIn.readInt()
            size = dataIn.readFloat()
            epsilon = dataIn.readFloat()
            val alpha = (colorArgb ushr 24) and 0xFF
            brushFamily = if (alpha <= 0x80) StockBrushes.highlighter() else StockBrushes.pressurePen()
        }

        val encodingType = dataIn.readByte()
        val payloadLength = dataIn.readInt()
        val payloadBytes = ByteArray(payloadLength)
        dataIn.readFully(payloadBytes)

        val inputs: ImmutableStrokeInputBatch = if (encodingType == ENCODING_NATIVE_INK_PROTO) {
            try {
                val byteIn = ByteArrayInputStream(payloadBytes)
                StrokeInputBatchSerialization.decode(byteIn)
            } catch (t: Throwable) {
                MutableStrokeInputBatch().toImmutable()
            }
        } else {
            val rawIn = DataInputStream(ByteArrayInputStream(payloadBytes))
            val count = rawIn.readInt()
            val mutableBatch = MutableStrokeInputBatch()
            for (p in 0 until count) {
                val x = rawIn.readFloat()
                val y = rawIn.readFloat()
                val elapsed = rawIn.readLong()
                val toolValue = rawIn.readInt()
                val strokeUnit = rawIn.readFloat()
                val pressure = rawIn.readFloat()
                val tilt = rawIn.readFloat()
                val orientation = rawIn.readFloat()
                val tool = InputToolType.fromInt(toolValue)
                mutableBatch.add(tool, x, y, elapsed, strokeUnit, pressure, tilt, orientation)
            }
            mutableBatch.toImmutable()
        }

        val brush = Brush.createWithColorIntArgb(defaultBrushFamily, colorArgb, size, epsilon)
        return Stroke(brush, inputs)
    }
}
