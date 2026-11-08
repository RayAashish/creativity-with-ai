package com.antigravity.note.document.storage

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.antigravity.note.document.model.CanvasImage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.InputStream
import java.security.MessageDigest
import java.util.UUID

/**
 * Off-thread image ingestion engine.
 * Handles downsampling safeguards, WebP compression, and content-addressed storage.
 */
object ImageProcessor {

    private const val MAX_DIMENSION_LIMIT = 4096
    private const val DEFAULT_TARGET_DISPLAY_WIDTH = 700f

    suspend fun processAndStoreImage(
        inputStream: InputStream,
        assetsDir: File,
        targetCenterX: Float = 400f,
        targetCenterY: Float = 500f,
        maxDisplayWidth: Float = DEFAULT_TARGET_DISPLAY_WIDTH
    ): CanvasImage? = withContext(Dispatchers.IO) {
        try {
            if (!assetsDir.exists()) {
                assetsDir.mkdirs()
            }

            // 1. Read input stream bytes
            val rawBytes = inputStream.readBytes()
            if (rawBytes.isEmpty()) return@withContext null

            // 2. Compute SHA-256 content hash
            val sha256 = computeSha256(rawBytes)
            val assetRef = "hash_$sha256.webp"
            val targetFile = File(assetsDir, assetRef)

            // 3. Inspect image dimensions with inJustDecodeBounds
            val boundsOptions = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            BitmapFactory.decodeByteArray(rawBytes, 0, rawBytes.size, boundsOptions)
            val origWidth = boundsOptions.outWidth
            val origHeight = boundsOptions.outHeight
            if (origWidth <= 0 || origHeight <= 0) return@withContext null

            // Downsampling safeguard if longest edge > 4096px
            var sampleSize = 1
            val maxEdge = maxOf(origWidth, origHeight)
            while (maxEdge / sampleSize > MAX_DIMENSION_LIMIT) {
                sampleSize *= 2
            }

            // 4. Decode full bitmap or reuse existing file
            if (!targetFile.exists()) {
                val decodeOptions = BitmapFactory.Options().apply {
                    inSampleSize = sampleSize
                    inPreferredConfig = Bitmap.Config.ARGB_8888
                }
                val bitmap = BitmapFactory.decodeByteArray(rawBytes, 0, rawBytes.size, decodeOptions)
                    ?: return@withContext null

                targetFile.outputStream().use { outStream ->
                    bitmap.compress(Bitmap.CompressFormat.WEBP, 90, outStream)
                }
            }

            // 5. Calculate display dimensions preserving aspect ratio
            val aspectRatio = origHeight.toFloat() / origWidth.toFloat()
            val displayWidth = minOf(origWidth.toFloat() / sampleSize, maxDisplayWidth)
            val displayHeight = displayWidth * aspectRatio

            CanvasImage(
                id = UUID.randomUUID().toString(),
                assetRef = assetRef,
                x = targetCenterX - (displayWidth / 2f),
                y = targetCenterY - (displayHeight / 2f),
                width = displayWidth,
                height = displayHeight,
                rotation = 0f,
                zIndex = 0
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun cropAndStoreImage(
        assetsDir: File,
        sourceAssetRef: String,
        cropNormLeft: Float,
        cropNormTop: Float,
        cropNormRight: Float,
        cropNormBottom: Float,
        rotationDegrees: Float = 0f
    ): Pair<String, Pair<Float, Float>>? = withContext(Dispatchers.IO) {
        try {
            val sourceFile = File(assetsDir, sourceAssetRef)
            if (!sourceFile.exists()) return@withContext null

            val origBitmap = BitmapFactory.decodeFile(sourceFile.absolutePath) ?: return@withContext null
            val baseBitmap = if (rotationDegrees != 0f) {
                val rotMatrix = android.graphics.Matrix().apply { postRotate(rotationDegrees) }
                Bitmap.createBitmap(origBitmap, 0, 0, origBitmap.width, origBitmap.height, rotMatrix, true)
            } else {
                origBitmap
            }
            val bw = baseBitmap.width
            val bh = baseBitmap.height

            val left = (cropNormLeft.coerceIn(0f, 1f) * bw).toInt().coerceIn(0, bw - 1)
            val top = (cropNormTop.coerceIn(0f, 1f) * bh).toInt().coerceIn(0, bh - 1)
            val right = (cropNormRight.coerceIn(0f, 1f) * bw).toInt().coerceIn(left + 1, bw)
            val bottom = (cropNormBottom.coerceIn(0f, 1f) * bh).toInt().coerceIn(top + 1, bh)

            val cropW = right - left
            val cropH = bottom - top

            val cropped = Bitmap.createBitmap(baseBitmap, left, top, cropW, cropH)

            val stream = java.io.ByteArrayOutputStream()
            cropped.compress(Bitmap.CompressFormat.WEBP, 90, stream)
            val rawBytes = stream.toByteArray()
            val sha256 = computeSha256(rawBytes)
            val newAssetRef = "hash_$sha256.webp"
            val targetFile = File(assetsDir, newAssetRef)
            if (!targetFile.exists()) {
                targetFile.writeBytes(rawBytes)
            }

            Pair(newAssetRef, Pair(cropped.width.toFloat(), cropped.height.toFloat()))
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun computeSha256(bytes: ByteArray): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(bytes)
        val sb = StringBuilder(hash.size * 2)
        for (b in hash) {
            sb.append(String.format("%02x", b.toInt() and 0xFF))
        }
        return sb.toString()
    }
}
