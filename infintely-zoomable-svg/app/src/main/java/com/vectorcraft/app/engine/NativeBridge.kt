package com.vectorcraft.app.engine

import android.graphics.Bitmap
import android.util.Log

object NativeBridge {
    private const val TAG = "Curvify-Native"

    init {
        try {
            System.loadLibrary("rust_engine")
            Log.i(TAG, "Native library 'rust_engine' loaded successfully. Engine: " + getEngineVersion())
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "Failed to load 'rust_engine' library!", e)
        }
    }

    external fun vectorizeRgba(
        pixels: ByteArray,
        width: Int,
        height: Int,
        fitMode: Int,
        filterMode: Int,
        filterStrength: Float,
        colorQuantizeK: Int,
        simplifyTolerance: Float,
        filterSpeckle: Int
    ): String

    external fun getEngineVersion(): String

    /**
     * Extracts raw RGBA bytes from an Android [Bitmap] with explicit channel conversion (avoiding
     * premultiplication or hardware buffer reversal bugs) and invokes the Rust vectorization core.
     * Enforces a maximum dimension limit (default 1280px) to prevent Out-Of-Memory and ANRs.
     */
    fun vectorizeBitmap(
        bitmap: Bitmap,
        config: VectorizationConfig,
        maxDimension: Int = 1024
    ): String {
        // Enforce safe memory footprint & sub-second compute time for on-device vectorization
        val source = if (bitmap.width > maxDimension || bitmap.height > maxDimension) {
            val scale = maxDimension.toFloat() / maxOf(bitmap.width, bitmap.height)
            Bitmap.createScaledBitmap(
                bitmap,
                (bitmap.width * scale).toInt().coerceAtLeast(1),
                (bitmap.height * scale).toInt().coerceAtLeast(1),
                true
            )
        } else {
            bitmap
        }

        val width = source.width
        val height = source.height

        // Extract RGBA bytes directly via getPixels to ensure standard [R, G, B, A] ordering
        val pixels = IntArray(width * height)
        source.getPixels(pixels, 0, width, 0, 0, width, height)

        val rgbaBytes = ByteArray(width * height * 4)
        var byteIdx = 0
        for (color in pixels) {
            val a = (color ushr 24) and 0xFF
            val r = (color ushr 16) and 0xFF
            val g = (color ushr 8) and 0xFF
            val b = color and 0xFF

            rgbaBytes[byteIdx] = r.toByte()
            rgbaBytes[byteIdx + 1] = g.toByte()
            rgbaBytes[byteIdx + 2] = b.toByte()
            rgbaBytes[byteIdx + 3] = a.toByte()
            byteIdx += 4
        }

        return vectorizeRgba(
            pixels = rgbaBytes,
            width = width,
            height = height,
            fitMode = config.fitMode.id,
            filterMode = config.filterMode.id,
            filterStrength = config.filterStrength,
            colorQuantizeK = config.colorQuantizeK,
            simplifyTolerance = config.simplifyTolerance,
            filterSpeckle = config.filterSpeckle
        )
    }
}

enum class FitMode(val id: Int, val displayName: String, val description: String) {
    SPLINE(0, "Spline (Smooth)", "Fits cubic Bézier curves; ideal for photos, illustrations & organic contours"),
    POLYGON(1, "Polygon (RDP)", "Straight-line Douglas–Peucker approximation; best for geometric shapes & logos"),
    PIXEL_ART(2, "Pixel Art", "Sharp pixel-lattice boundaries with zero smoothing; perfect for retro game sprites")
}

enum class FilterMode(val id: Int, val displayName: String, val description: String) {
    NONE(0, "None", "No pre-filtering"),
    BILATERAL(1, "Bilateral Filter", "Edge-preserving spatial/intensity blur to strip JPEG ringing without blurring contours"),
    MEDIAN(2, "Median Blur", "3x3 median filter to eliminate salt-and-pepper compression noise")
}

data class VectorizationConfig(
    val fitMode: FitMode = FitMode.SPLINE,
    val filterMode: FilterMode = FilterMode.NONE, // Default to NONE so portraits and low-contrast images are never blurred
    val filterStrength: Float = 1.0f,
    val colorQuantizeK: Int = 0, // 0 = Full Color high fidelity by default
    val simplifyTolerance: Float = 0.8f,
    val filterSpeckle: Int = 2
)
