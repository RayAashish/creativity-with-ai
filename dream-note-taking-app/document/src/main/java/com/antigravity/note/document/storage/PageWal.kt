package com.antigravity.note.document.storage

import androidx.ink.strokes.Stroke
import com.antigravity.note.document.model.DocumentPage
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.DataInputStream
import java.io.DataOutputStream
import java.io.EOFException
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.UUID

class PageWal(private val walFile: File) {

    companion object {
        private const val WAL_MAGIC = 0x57414C33 // "WAL3"
        private const val LEGACY_WAL2_MAGIC = 0x57414C32 // "WAL2"
        private const val LEGACY_WAL1_MAGIC = 0x57414C31 // "WAL1"
        const val OP_ADD_STROKE: Byte = 1
        const val OP_REMOVE_LAST: Byte = 2
        const val OP_CLEAR: Byte = 3
    }

    @Synchronized
    fun appendAddStroke(stroke: Stroke, strokeId: String = UUID.randomUUID().toString()) {
        val appendHeader = !walFile.exists() || walFile.length() == 0L
        FileOutputStream(walFile, true).use { fos ->
            BufferedOutputStream(fos).use { bos ->
                val dataOut = DataOutputStream(bos)
                if (appendHeader) {
                    dataOut.writeInt(WAL_MAGIC)
                }
                dataOut.writeByte(OP_ADD_STROKE.toInt())
                dataOut.writeLong(System.currentTimeMillis())
                PageSerializer.serializeSingleStroke(stroke, dataOut, strokeId)
                dataOut.flush()
            }
        }
    }

    @Synchronized
    fun appendRemoveLast() {
        val appendHeader = !walFile.exists() || walFile.length() == 0L
        FileOutputStream(walFile, true).use { fos ->
            BufferedOutputStream(fos).use { bos ->
                val dataOut = DataOutputStream(bos)
                if (appendHeader) {
                    dataOut.writeInt(WAL_MAGIC)
                }
                dataOut.writeByte(OP_REMOVE_LAST.toInt())
                dataOut.writeLong(System.currentTimeMillis())
                dataOut.flush()
            }
        }
    }

    @Synchronized
    fun appendClear() {
        val appendHeader = !walFile.exists() || walFile.length() == 0L
        FileOutputStream(walFile, true).use { fos ->
            BufferedOutputStream(fos).use { bos ->
                val dataOut = DataOutputStream(bos)
                if (appendHeader) {
                    dataOut.writeInt(WAL_MAGIC)
                }
                dataOut.writeByte(OP_CLEAR.toInt())
                dataOut.writeLong(System.currentTimeMillis())
                dataOut.flush()
            }
        }
    }

    @Synchronized
    fun replayInto(page: DocumentPage): Boolean {
        if (!walFile.exists() || walFile.length() == 0L) return false

        var replayedAny = false
        try {
            FileInputStream(walFile).use { fis ->
                BufferedInputStream(fis).use { bis ->
                    val dataIn = DataInputStream(bis)
                    val magic = dataIn.readInt()
                    if (magic != WAL_MAGIC && magic != LEGACY_WAL2_MAGIC && magic != LEGACY_WAL1_MAGIC) {
                        return false
                    }
                    val isV3 = magic == WAL_MAGIC

                    while (true) {
                        val opCode = try {
                            dataIn.readByte()
                        } catch (e: EOFException) {
                            break
                        }
                        val timestamp = dataIn.readLong()

                        when (opCode) {
                            OP_ADD_STROKE -> {
                                val (strokeId, stroke) = PageSerializer.deserializeSingleStroke(dataIn, isV3)
                                val added = page.addStroke(stroke, strokeId)
                                if (added) {
                                    replayedAny = true
                                }
                            }
                            OP_REMOVE_LAST -> {
                                if (page.strokes.isNotEmpty()) {
                                    val last = page.strokes.last()
                                    page.removeStrokes(listOf(last))
                                    replayedAny = true
                                }
                            }
                            OP_CLEAR -> {
                                page.clearAllStrokes()
                                replayedAny = true
                            }
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // Partial write recovered up to failure point
        }
        return replayedAny
    }

    @Synchronized
    fun deleteWal(): Boolean {
        return if (walFile.exists()) {
            walFile.delete()
        } else {
            true
        }
    }

    fun exists(): Boolean = walFile.exists() && walFile.length() > 0L
}
