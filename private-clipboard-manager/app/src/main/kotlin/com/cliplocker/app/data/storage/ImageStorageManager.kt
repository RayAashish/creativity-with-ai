package com.cliplocker.app.data.storage

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

data class StoredImageResult(
    val imageFilePath: String,
    val thumbnailFilePath: String,
    val contentUri: Uri
)

class ImageStorageManager(
    private val context: Context
) {
    private val imagesDir: File
        get() = File(context.filesDir, "clip_images").apply { if (!exists()) mkdirs() }

    private val thumbnailsDir: File
        get() = File(context.filesDir, "clip_thumbnails").apply { if (!exists()) mkdirs() }

    /**
     * Saves an incoming image URI into private app storage and creates a downscaled thumbnail.
     */
    fun storeImageFromUri(sourceUri: Uri): StoredImageResult? {
        return runCatching {
            // Safely attempt persistable permission if content URI
            if (sourceUri.scheme == "content") {
                runCatching {
                    context.contentResolver.takePersistableUriPermission(
                        sourceUri,
                        android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
                    )
                }
            }

            val imageId = UUID.randomUUID().toString()
            val imageFile = File(imagesDir, "$imageId.png")
            val thumbFile = File(thumbnailsDir, "${imageId}_thumb.png")

            // Read original image
            context.contentResolver.openInputStream(sourceUri)?.use { input ->
                FileOutputStream(imageFile).use { output ->
                    input.copyTo(output)
                }
            } ?: run {
                android.util.Log.e("ImageStorageManager", "Could not open input stream for $sourceUri")
                return null
            }

            // Generate thumbnail (max 256x256), fallback to original file if scaling fails
            try {
                generateThumbnail(imageFile, thumbFile, maxDimension = 256)
            } catch (e: Exception) {
                android.util.Log.w("ImageStorageManager", "Failed to generate thumbnail, copying original", e)
                imageFile.copyTo(thumbFile, overwrite = true)
            }

            val contentUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                imageFile
            )

            StoredImageResult(
                imageFilePath = imageFile.absolutePath,
                thumbnailFilePath = thumbFile.absolutePath,
                contentUri = contentUri
            )
        }.onFailure {
            android.util.Log.e("ImageStorageManager", "Failed to store image from URI $sourceUri", it)
        }.getOrNull()
    }

    /**
     * Gets a shareable/copyable FileProvider URI for a stored image file.
     */
    fun getShareableUri(filePath: String): Uri? {
        val file = File(filePath)
        if (!file.exists()) return null
        return runCatching {
            FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
        }.getOrNull()
    }

    /**
     * Deletes image and thumbnail files from private storage.
     */
    fun deleteImageFiles(imageFilePath: String?, thumbnailFilePath: String?) {
        imageFilePath?.let {
            val file = File(it)
            if (file.exists()) file.delete()
        }
        thumbnailFilePath?.let {
            val file = File(it)
            if (file.exists()) file.delete()
        }
    }

    private fun generateThumbnail(sourceFile: File, destFile: File, maxDimension: Int) {
        val options = BitmapFactory.Options().apply {
            inJustDecodeBounds = true
        }
        BitmapFactory.decodeFile(sourceFile.absolutePath, options)

        var sampleSize = 1
        val maxSrc = maxOf(options.outWidth, options.outHeight)
        while (maxSrc / sampleSize > maxDimension * 2) {
            sampleSize *= 2
        }

        val decodeOptions = BitmapFactory.Options().apply {
            inSampleSize = sampleSize
        }
        val originalBitmap = BitmapFactory.decodeFile(sourceFile.absolutePath, decodeOptions) ?: return

        val width = originalBitmap.width
        val height = originalBitmap.height
        val scale = minOf(maxDimension.toFloat() / width, maxDimension.toFloat() / height, 1.0f)
        val targetWidth = (width * scale).toInt().coerceAtLeast(1)
        val targetHeight = (height * scale).toInt().coerceAtLeast(1)

        val scaled = Bitmap.createScaledBitmap(originalBitmap, targetWidth, targetHeight, true)
        FileOutputStream(destFile).use { out ->
            scaled.compress(Bitmap.CompressFormat.PNG, 85, out)
        }
        if (scaled != originalBitmap) {
            scaled.recycle()
        }
        originalBitmap.recycle()
    }
}
