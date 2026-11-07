package com.mindforge.app.core.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import android.media.ExifInterface
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import kotlin.math.min

object ImageCropHelper {

    private const val TARGET_SIZE = 512

    suspend fun processAndSaveAvatar(context: Context, sourceUri: Uri): String? = withContext(Dispatchers.IO) {
        try {
            val inputStream = context.contentResolver.openInputStream(sourceUri) ?: return@withContext null
            val originalBitmap = BitmapFactory.decodeStream(inputStream)
            inputStream.close()

            if (originalBitmap == null) return@withContext null

            // Read EXIF orientation
            val exifStream = context.contentResolver.openInputStream(sourceUri)
            val rotationAngle = if (exifStream != null) {
                val exif = ExifInterface(exifStream)
                val orientation = exif.getAttributeInt(
                    ExifInterface.TAG_ORIENTATION,
                    ExifInterface.ORIENTATION_NORMAL
                )
                exifStream.close()
                when (orientation) {
                    ExifInterface.ORIENTATION_ROTATE_90 -> 90f
                    ExifInterface.ORIENTATION_ROTATE_180 -> 180f
                    ExifInterface.ORIENTATION_ROTATE_270 -> 270f
                    else -> 0f
                }
            } else 0f

            val rotatedBitmap = if (rotationAngle != 0f) {
                val matrix = Matrix().apply { postRotate(rotationAngle) }
                Bitmap.createBitmap(
                    originalBitmap, 0, 0,
                    originalBitmap.width, originalBitmap.height,
                    matrix, true
                )
            } else originalBitmap

            // Center square crop
            val squareDim = min(rotatedBitmap.width, rotatedBitmap.height)
            val cropX = (rotatedBitmap.width - squareDim) / 2
            val cropY = (rotatedBitmap.height - squareDim) / 2
            val croppedBitmap = Bitmap.createBitmap(rotatedBitmap, cropX, cropY, squareDim, squareDim)

            // Scale down to TARGET_SIZE x TARGET_SIZE
            val scaledBitmap = Bitmap.createScaledBitmap(
                croppedBitmap,
                TARGET_SIZE,
                TARGET_SIZE,
                true
            )

            // Save to app internal storage (filesDir)
            val avatarFile = File(context.filesDir, "user_avatar_${System.currentTimeMillis()}.jpg")
            // Clean up older avatar files
            context.filesDir.listFiles { file -> file.name.startsWith("user_avatar_") }?.forEach { it.delete() }

            FileOutputStream(avatarFile).use { out ->
                scaledBitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
            }

            avatarFile.toURI().toString()
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
