package com.vectorcraft.app.util

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader

enum class SamplePreset(val title: String, val subtitle: String) {
    PIXEL_ART("Pixel Art Retro Sprite", "Ideal for testing Pixel Art mode without smoothing"),
    LOGO("Geometric Emblem", "Ideal for testing Spline curves & Ramer–Douglas–Peucker"),
    PHOTO("Sunset Landscape", "Ideal for testing OKLab quantization & Bilateral filtering")
}

object SampleImages {

    fun generateSample(preset: SamplePreset): Bitmap {
        return when (preset) {
            SamplePreset.PIXEL_ART -> createPixelArtBitmap()
            SamplePreset.LOGO -> createLogoBitmap()
            SamplePreset.PHOTO -> createLandscapeBitmap()
        }
    }

    private fun createPixelArtBitmap(): Bitmap {
        // 16x16 pixel art sprite scaled up
        val pixelGrid = arrayOf(
            "....rrrr....rrrr",
            "..rrrrrrrrrrrrrr",
            ".rrrrrrrrrrrrrrr",
            ".rrrrrrrrrrrrrrr",
            ".rrrrrrrrrrrrrrr",
            "..rrrrrrrrrrrrr.",
            "...rrrrrrrrrrr..",
            "....rrrrrrrrr...",
            ".....rrrrrrr....",
            "......rrrrr.....",
            ".......rrr......",
            "........r.......",
            "................",
            "....gg....gg....",
            "...gggg..gggg...",
            "....gg....gg...."
        )

        val size = 256
        val pixelSize = size / 16
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        canvas.drawColor(Color.rgb(20, 24, 38)) // Dark stylish background

        for (y in 0 until 16) {
            val row = pixelGrid[y]
            for (x in 0 until 16) {
                val ch = row.getOrElse(x) { '.' }
                if (ch != '.') {
                    paint.color = when (ch) {
                        'r' -> Color.rgb(239, 68, 68) // Crimson red
                        'g' -> Color.rgb(34, 197, 94) // Emerald green
                        else -> Color.WHITE
                    }
                    canvas.drawRect(
                        (x * pixelSize).toFloat(),
                        (y * pixelSize).toFloat(),
                        ((x + 1) * pixelSize).toFloat(),
                        ((y + 1) * pixelSize).toFloat(),
                        paint
                    )
                }
            }
        }
        return bitmap
    }

    private fun createLogoBitmap(): Bitmap {
        val size = 512
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawColor(Color.rgb(15, 23, 42))

        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        // Gradient hexagon background
        val hexPath = Path()
        val cx = size / 2f
        val cy = size / 2f
        val r = size * 0.4f
        for (i in 0 until 6) {
            val angle = Math.toRadians((60 * i - 30).toDouble())
            val x = (cx + r * Math.cos(angle)).toFloat()
            val y = (cy + r * Math.sin(angle)).toFloat()
            if (i == 0) hexPath.moveTo(x, y) else hexPath.lineTo(x, y)
        }
        hexPath.close()

        paint.shader = LinearGradient(
            0f, 0f, size.toFloat(), size.toFloat(),
            intArrayOf(Color.rgb(99, 102, 241), Color.rgb(236, 72, 153), Color.rgb(249, 115, 22)),
            null,
            Shader.TileMode.CLAMP
        )
        canvas.drawPath(hexPath, paint)
        paint.shader = null

        // Inner polygon star / V mark
        val starPath = Path()
        paint.color = Color.WHITE
        starPath.moveTo(cx, cy - r * 0.6f)
        starPath.lineTo(cx + r * 0.5f, cy + r * 0.4f)
        starPath.lineTo(cx, cy + r * 0.2f)
        starPath.lineTo(cx - r * 0.5f, cy + r * 0.4f)
        starPath.close()
        canvas.drawPath(starPath, paint)

        // Cyan accent circle
        paint.color = Color.rgb(6, 182, 212)
        canvas.drawCircle(cx, cy + r * 0.55f, r * 0.12f, paint)

        return bitmap
    }

    private fun createLandscapeBitmap(): Bitmap {
        val width = 480
        val height = 360
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        // Sunset gradient sky
        paint.shader = LinearGradient(
            0f, 0f, 0f, height * 0.7f,
            intArrayOf(
                Color.rgb(49, 46, 129),
                Color.rgb(190, 24, 93),
                Color.rgb(249, 115, 22),
                Color.rgb(253, 224, 71)
            ),
            null,
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)
        paint.shader = null

        // Glowing Sun
        paint.color = Color.rgb(255, 241, 148)
        canvas.drawCircle(width * 0.5f, height * 0.52f, 48f, paint)

        // Distant mountains
        paint.color = Color.rgb(67, 24, 88)
        val mountainFar = Path().apply {
            moveTo(0f, height.toFloat())
            lineTo(0f, height * 0.62f)
            lineTo(width * 0.35f, height * 0.45f)
            lineTo(width * 0.7f, height * 0.65f)
            lineTo(width.toFloat(), height * 0.5f)
            lineTo(width.toFloat(), height.toFloat())
            close()
        }
        canvas.drawPath(mountainFar, paint)

        // Foreground mountains
        paint.color = Color.rgb(26, 16, 48)
        val mountainNear = Path().apply {
            moveTo(0f, height.toFloat())
            lineTo(0f, height * 0.75f)
            lineTo(width * 0.25f, height * 0.58f)
            lineTo(width * 0.55f, height * 0.72f)
            lineTo(width * 0.85f, height * 0.54f)
            lineTo(width.toFloat(), height * 0.68f)
            lineTo(width.toFloat(), height.toFloat())
            close()
        }
        canvas.drawPath(mountainNear, paint)

        // Foreground water reflection
        val waterPath = Path().apply {
            moveTo(0f, height * 0.82f)
            lineTo(width.toFloat(), height * 0.82f)
            lineTo(width.toFloat(), height.toFloat())
            lineTo(0f, height.toFloat())
            close()
        }
        paint.color = Color.rgb(15, 12, 35)
        canvas.drawPath(waterPath, paint)

        return bitmap
    }
}
