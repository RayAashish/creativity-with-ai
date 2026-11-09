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
import java.nio.ByteBuffer
import java.util.UUID
import java.util.zip.CRC32

class CorruptedPageException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)

object PageSerializer {

    const val MAGIC_HEADER = 0x494E4B31 // "INK1"
    const val FORMAT_VERSION = 3

    const val BRUSH_FAMILY_PRESSURE_PEN: Byte = 0
    const val BRUSH_FAMILY_HIGHLIGHTER: Byte = 1
    const val BRUSH_FAMILY_MARKER: Byte = 2

    private const val ENCODING_NATIVE_INK_PROTO: Byte = 0
    private const val ENCODING_RAW_INPUT_STREAM: Byte = 1

    val defaultBrushFamily: BrushFamily by lazy { StockBrushes.pressurePen() }

    fun serialize(page: DocumentPage, outputStream: OutputStream) {
        val byteOut = ByteArrayOutputStream()
        val dataOut = DataOutputStream(byteOut)

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

        for (i in page.strokes.indices) {
            val stroke = page.strokes[i]
            val strokeId = page.strokeIds.getOrNull(i) ?: UUID.randomUUID().toString()

            // Write Stroke ID in v3
            dataOut.writeUTF(strokeId)

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
                val protoOut = ByteArrayOutputStream()
                StrokeInputBatchSerialization.encode(stroke.inputs, protoOut)
                encodedBytes = protoOut.toByteArray()
            } catch (t: Throwable) {
                // Fallback to portable raw input stream
                encodingType = ENCODING_RAW_INPUT_STREAM
                val rawOut = ByteArrayOutputStream()
                val rawData = DataOutputStream(rawOut)
                val batch = stroke.inputs
                val count = batch.size
                rawData.writeInt(count)
                for (p in 0 until count) {
                    batch.populate(p, strokeInputTemp)
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

        // 4. Compute CRC32 Checksum over entire payload
        val contentBytes = byteOut.toByteArray()
        val crc = CRC32().apply { update(contentBytes) }.value

        // 5. Write to destination stream: Content + 8-byte CRC32
        val finalOut = DataOutputStream(outputStream)
        finalOut.write(contentBytes)
        finalOut.writeLong(crc)
        finalOut.flush()
    }

    /**
     * Fast-path metadata extractor: reads only the header and metadata block (< 60 bytes).
     * Bypasses stroke decoding completely for sub-millisecond page indexing and listing.
     */
    fun deserializeMetadata(inputStream: InputStream): PageMetadata {
        val dataIn = DataInputStream(inputStream)
        val magic = dataIn.readInt()
        if (magic != MAGIC_HEADER) {
            throw CorruptedPageException("Invalid file magic: 0x%08X (expected 0x%08X)".format(magic, MAGIC_HEADER))
        }
        val version = dataIn.readInt()
        if (version < 1 || version > FORMAT_VERSION) {
            throw CorruptedPageException("Unsupported file version: $version (max supported: $FORMAT_VERSION)")
        }

        val pageId = dataIn.readUTF()
        val notebookId = dataIn.readUTF()
        val pageIndex = dataIn.readInt()
        val title = dataIn.readUTF()
        val templateOrdinal = dataIn.readInt()
        val createdAt = dataIn.readLong()
        val modifiedAt = dataIn.readLong()

        return PageMetadata(
            pageId = pageId,
            notebookId = notebookId,
            pageIndex = pageIndex,
            title = title,
            template = PaperTemplate.fromOrdinal(templateOrdinal),
            strokeCount = 0,
            createdAt = createdAt,
            modifiedAt = modifiedAt
        )
    }

    fun deserialize(inputStream: InputStream): DocumentPage {
        val allBytes = inputStream.readBytes()
        if (allBytes.size < 8) {
            throw CorruptedPageException("File too short (${allBytes.size} bytes)")
        }

        val byteBuffer = ByteBuffer.wrap(allBytes)
        val magic = byteBuffer.int
        if (magic != MAGIC_HEADER) {
            throw CorruptedPageException("Invalid file magic: 0x%08X (expected 0x%08X)".format(magic, MAGIC_HEADER))
        }

        val version = byteBuffer.int
        if (version > FORMAT_VERSION) {
            throw CorruptedPageException("Unsupported file version: $version (max supported: $FORMAT_VERSION)")
        }

        val payloadBytes: ByteArray
        if (version >= 3) {
            if (allBytes.size < 16) {
                throw CorruptedPageException("File too short for version 3 with CRC32 (${allBytes.size} bytes)")
            }
            val contentLen = allBytes.size - 8
            val expectedCrc = ByteBuffer.wrap(allBytes, contentLen, 8).long
            val computedCrc = CRC32().apply { update(allBytes, 0, contentLen) }.value
            if (expectedCrc != computedCrc) {
                throw CorruptedPageException("Checksum mismatch: expected $expectedCrc, computed $computedCrc")
            }
            payloadBytes = allBytes.copyOfRange(0, contentLen)
        } else {
            payloadBytes = allBytes
        }

        val dataIn = DataInputStream(ByteArrayInputStream(payloadBytes))
        // Skip magic and version already read
        dataIn.readInt()
        dataIn.readInt()

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
        val strokeIds = ArrayList<String>(strokeCount)
        val seenIds = HashSet<String>()

        for (i in 0 until strokeCount) {
            val strokeId: String
            val brushFamily: BrushFamily
            val colorArgb: Int
            val size: Float
            val epsilon: Float

            if (version >= 3) {
                strokeId = dataIn.readUTF()
                val familyId = dataIn.readByte()
                brushFamily = when (familyId) {
                    BRUSH_FAMILY_HIGHLIGHTER -> StockBrushes.highlighter()
                    BRUSH_FAMILY_MARKER -> StockBrushes.marker()
                    else -> StockBrushes.pressurePen()
                }
                colorArgb = dataIn.readInt()
                size = dataIn.readFloat()
                epsilon = dataIn.readFloat()
            } else if (version == 2) {
                val familyId = dataIn.readByte()
                brushFamily = when (familyId) {
                    BRUSH_FAMILY_HIGHLIGHTER -> StockBrushes.highlighter()
                    BRUSH_FAMILY_MARKER -> StockBrushes.marker()
                    else -> StockBrushes.pressurePen()
                }
                colorArgb = dataIn.readInt()
                size = dataIn.readFloat()
                epsilon = dataIn.readFloat()
                strokeId = "" // will be synthesized below
            } else {
                colorArgb = dataIn.readInt()
                size = dataIn.readFloat()
                epsilon = dataIn.readFloat()
                val alpha = (colorArgb ushr 24) and 0xFF
                brushFamily = if (alpha <= 0x80) StockBrushes.highlighter() else StockBrushes.pressurePen()
                strokeId = ""
            }

            val encodingType = dataIn.readByte()
            val strokePayloadLength = dataIn.readInt()
            val strokePayloadBytes = ByteArray(strokePayloadLength)
            dataIn.readFully(strokePayloadBytes)

            val resolvedStrokeId = if (strokeId.isNotEmpty()) {
                strokeId
            } else {
                "legacy_" + generateStrokeHash(colorArgb, size, strokePayloadBytes)
            }

            // Deduplicate by ID on load!
            if (seenIds.contains(resolvedStrokeId)) {
                continue
            }
            seenIds.add(resolvedStrokeId)

            val inputs: ImmutableStrokeInputBatch = if (encodingType == ENCODING_NATIVE_INK_PROTO) {
                try {
                    val byteIn = ByteArrayInputStream(strokePayloadBytes)
                    StrokeInputBatchSerialization.decode(byteIn)
                } catch (t: Throwable) {
                    MutableStrokeInputBatch().toImmutable()
                }
            } else {
                val rawIn = DataInputStream(ByteArrayInputStream(strokePayloadBytes))
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
            strokeIds.add(resolvedStrokeId)
        }

        return DocumentPage(
            metadata = metadata.copy(strokeCount = strokes.size),
            strokes = strokes,
            strokeIds = strokeIds
        )
    }

    private fun generateStrokeHash(color: Int, size: Float, payload: ByteArray): String {
        var h = 0x811c9dc5L
        h = (h xor color.toLong()) * 0x01000193L
        h = (h xor java.lang.Float.floatToIntBits(size).toLong()) * 0x01000193L
        for (b in payload) {
            h = (h xor (b.toInt() and 0xFF).toLong()) * 0x01000193L
        }
        return h.toString(16)
    }

    fun serializeSingleStroke(stroke: Stroke, outputStream: OutputStream, strokeId: String = UUID.randomUUID().toString()) {
        val dataOut = DataOutputStream(outputStream)
        dataOut.writeUTF(strokeId)
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

    fun deserializeSingleStroke(inputStream: InputStream, isV3: Boolean = true): Pair<String, Stroke> {
        val dataIn = DataInputStream(inputStream)
        val strokeId: String
        val brushFamily: BrushFamily
        val colorArgb: Int
        val size: Float
        val epsilon: Float

        if (isV3) {
            strokeId = dataIn.readUTF()
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
            strokeId = UUID.randomUUID().toString()
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

        val brush = Brush.createWithColorIntArgb(brushFamily, colorArgb, size, epsilon)
        return Pair(strokeId, Stroke(brush, inputs))
    }
}
