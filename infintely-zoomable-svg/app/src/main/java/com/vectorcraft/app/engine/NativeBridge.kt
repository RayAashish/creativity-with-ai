package com.vectorcraft.app.engine

import android.graphics.Bitmap
import android.util.Log

object NativeBridge {
    private const val TAG = "VectorForge-Native"

    init {
        try {
            System.loadLibrary("rust_engine")
            Log.i(TAG, "Native library 'rust_engine' loaded: " + getEngineVersion())
        } catch (e: UnsatisfiedLinkError) {
            Log.e(TAG, "Failed to load 'rust_engine' library!", e)
        }
    }

    external fun vectorizeRgbaV2(
        pixels: ByteArray,
        width: Int,
        height: Int,
        fitMode: Int,
        gradientShading: Boolean,
        detailLevel: Float,
        sharpenAmount: Float,
        filterMode: Int,
        filterStrength: Float,
        colorQuantizeK: Int,
        simplifyTolerance: Float,
        filterSpeckle: Int
    ): String

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
     * Traces [bitmap] via the native Rust Neural-Gradient Mosaic / Pixel Art engine on a background thread.
     * Enforces [maxDimension] only on the temporary native trace buffer so display previews stay crisp
     * while exported SVG root dimensions match [bitmap.width] x [bitmap.height].
     */
    fun vectorizeBitmap(
        bitmap: Bitmap,
        config: VectorizationConfig,
        maxDimension: Int = 1080
    ): String {
        val traceCap = if (config.fitMode == FitMode.PIXEL_ART) 512 else maxDimension
        var tempScaled: Bitmap? = null
        val source = if (bitmap.width > traceCap || bitmap.height > traceCap) {
            val scale = traceCap.toFloat() / maxOf(bitmap.width, bitmap.height)
            Bitmap.createScaledBitmap(
                bitmap,
                (bitmap.width * scale).toInt().coerceAtLeast(1),
                (bitmap.height * scale).toInt().coerceAtLeast(1),
                config.fitMode != FitMode.PIXEL_ART
            ).also { tempScaled = it }
        } else {
            bitmap
        }

        return try {
            val traceW = source.width
            val traceH = source.height
            val pixels = IntArray(traceW * traceH)
            source.getPixels(pixels, 0, traceW, 0, 0, traceW, traceH)

            val rgbaBytes = ByteArray(traceW * traceH * 4)
            var byteIdx = 0
            for (color in pixels) {
                rgbaBytes[byteIdx] = ((color ushr 16) and 0xFF).toByte()
                rgbaBytes[byteIdx + 1] = ((color ushr 8) and 0xFF).toByte()
                rgbaBytes[byteIdx + 2] = (color and 0xFF).toByte()
                rgbaBytes[byteIdx + 3] = ((color ushr 24) and 0xFF).toByte()
                byteIdx += 4
            }

            Log.i(TAG, "vectorizeRgbaV2: ${traceW}x${traceH} (display=${bitmap.width}x${bitmap.height}), mode=${config.fitMode}")
            val svg = vectorizeRgbaV2(
                pixels = rgbaBytes,
                width = traceW,
                height = traceH,
                fitMode = config.fitMode.id,
                gradientShading = config.gradientShading,
                detailLevel = config.detailLevel,
                sharpenAmount = config.sharpenAmount,
                filterMode = config.filterMode.id,
                filterStrength = config.filterStrength,
                colorQuantizeK = config.colorQuantizeK,
                simplifyTolerance = config.simplifyTolerance,
                filterSpeckle = config.filterSpeckle
            )

            if (traceW != bitmap.width || traceH != bitmap.height) {
                matchSvgDimensionsToDisplay(svg, traceW, traceH, bitmap.width, bitmap.height)
            } else {
                svg
            }
        } finally {
            tempScaled?.let { if (!it.isRecycled && it !== bitmap) it.recycle() }
        }
    }

    private fun matchSvgDimensionsToDisplay(
        svg: String,
        traceW: Int,
        traceH: Int,
        displayW: Int,
        displayH: Int
    ): String {
        val openIdx = svg.indexOf("<svg")
        if (openIdx == -1) return svg
        val closeIdx = svg.indexOf('>', openIdx)
        if (closeIdx == -1) return svg

        val header = svg.substring(openIdx, closeIdx + 1)
        val updatedHeader = header
            .replaceFirst("width=\"$traceW\"", "width=\"$displayW\"")
            .replaceFirst("height=\"$traceH\"", "height=\"$displayH\"")

        return StringBuilder(svg.length + 16)
            .append(svg, 0, openIdx)
            .append(updatedHeader)
            .append(svg, closeIdx + 1, svg.length)
            .toString()
    }
}

enum class FitMode(val id: Int, val displayName: String, val description: String) {
    SPLINE(0, "Spline Curves", "Cubic Bézier mosaic; ultra-sharp portraits, photography & organic curves"),
    POLYGON(1, "Polygon (RDP)", "Straight Douglas–Peucker facets; geometric logos & low-poly graphics"),
    PIXEL_ART(2, "Pixel Art", "Exact unsmoothed square pixel boundaries; zero smoothing for sprites")
}

enum class FilterMode(val id: Int, val displayName: String, val description: String) {
    NONE(0, "Off (Pure)", "Preserves full optical sharpness and micro-contrast"),
    BILATERAL(1, "Bilateral", "Edge-preserving filter to clean JPEG compression artifacts"),
    MEDIAN(2, "Median 3×3", "Strips isolated salt-and-pepper noise speckles")
}

enum class StudioPreset(val label: String) {
    PHOTO_HD("Photo HD"),
    FLAT_VECTOR("Flat Vector"),
    POLYGON("Polygon"),
    PIXEL_ART("Pixel Art")
}

data class VectorizationConfig(
    val fitMode: FitMode = FitMode.SPLINE,
    val gradientShading: Boolean = true,
    val detailLevel: Float = 0.84f,
    val sharpenAmount: Float = 0.22f,
    val filterMode: FilterMode = FilterMode.NONE,
    val filterStrength: Float = 1.0f,
    val colorQuantizeK: Int = 0,
    val simplifyTolerance: Float = 0.0f,
    val filterSpeckle: Int = 0
) {
    val activePreset: StudioPreset
        get() = when {
            fitMode == FitMode.PIXEL_ART -> StudioPreset.PIXEL_ART
            fitMode == FitMode.POLYGON -> StudioPreset.POLYGON
            gradientShading && colorQuantizeK == 0 -> StudioPreset.PHOTO_HD
            else -> StudioPreset.FLAT_VECTOR
        }
}
