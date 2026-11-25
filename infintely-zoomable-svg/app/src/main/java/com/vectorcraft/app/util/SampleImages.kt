package com.vectorcraft.app.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
import com.vectorcraft.app.R

enum class SamplePreset(val title: String, val subtitle: String) {
    PORTRAIT("Portrait (High-Fidelity)", "Fine skin tones, eyes, hair & sub-250ms vectorization"),
    LOGO("Geometric Emblem", "Ideal for testing Spline curves & Ramer–Douglas–Peucker"),
    PIXEL_ART("Pixel Art Retro Sprite", "Ideal for testing Pixel Art mode without smoothing"),
    PHOTO("Sunset Landscape", "Ideal for testing OKLab quantization & Bilateral filtering")
}

object SampleImages {

    private var appContext: Context? = null

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun generateSample(preset: SamplePreset): Bitmap {
        return when (preset) {
            SamplePreset.PORTRAIT -> loadPortraitBitmap()
            SamplePreset.PIXEL_ART -> createPixelArtBitmap()
            SamplePreset.LOGO -> createLogoBitmap()
            SamplePreset.PHOTO -> createLandscapeBitmap()
        }
    }

    private fun loadPortraitBitmap(): Bitmap {
        val ctx = appContext
        if (ctx != null) {
            try {
                val opts = BitmapFactory.Options().apply {
                    inScaled = false
                    inPreferredConfig = Bitmap.Config.ARGB_8888
                }
                val bitmap = BitmapFactory.decodeResource(ctx.resources, R.drawable.sample_portrait, opts)
                if (bitmap != null) return bitmap
            } catch (e: Exception) {
                // fallback to procedural below
            }
        }
        return createPortraitProceduralBitmap()
    }

    private fun createPortraitProceduralBitmap(): Bitmap {
        val width = 420
        val height = 560
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        // Studio warm backdrop
        paint.shader = LinearGradient(
            0f, 0f, 0f, height.toFloat(),
            intArrayOf(Color.rgb(235, 230, 220), Color.rgb(210, 200, 190)),
            null,
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)
        paint.shader = null

        // Shoulders & maroon shirt
        paint.color = Color.rgb(94, 23, 35)
        val shirtPath = Path().apply {
            moveTo(0f, height.toFloat())
            lineTo(0f, height * 0.75f)
            quadTo(width * 0.25f, height * 0.68f, width * 0.35f, height * 0.72f)
            lineTo(width * 0.65f, height * 0.72f)
            quadTo(width * 0.75f, height * 0.68f, width.toFloat(), height * 0.75f)
            lineTo(width.toFloat(), height.toFloat())
            close()
        }
        canvas.drawPath(shirtPath, paint)

        // Neck
        paint.color = Color.rgb(180, 125, 95)
        canvas.drawRect(width * 0.40f, height * 0.52f, width * 0.60f, height * 0.72f, paint)

        // Head oval with skin tone
        paint.color = Color.rgb(205, 145, 110)
        canvas.drawOval(width * 0.26f, height * 0.16f, width * 0.74f, height * 0.60f, paint)

        // Hair
        paint.color = Color.rgb(25, 20, 20)
        val hairPath = Path().apply {
            moveTo(width * 0.24f, height * 0.35f)
            quadTo(width * 0.22f, height * 0.10f, width * 0.50f, height * 0.08f)
            quadTo(width * 0.78f, height * 0.10f, width * 0.76f, height * 0.35f)
            quadTo(width * 0.68f, height * 0.22f, width * 0.50f, height * 0.24f)
            quadTo(width * 0.32f, height * 0.22f, width * 0.24f, height * 0.35f)
            close()
        }
        canvas.drawPath(hairPath, paint)

        // Eyebrows
        paint.color = Color.rgb(35, 25, 25)
        paint.strokeWidth = 5f
        paint.style = Paint.Style.STROKE
        canvas.drawLine(width * 0.34f, height * 0.33f, width * 0.44f, height * 0.32f, paint)
        canvas.drawLine(width * 0.56f, height * 0.32f, width * 0.66f, height * 0.33f, paint)

        // Eyes (white sclera)
        paint.style = Paint.Style.FILL
        paint.color = Color.WHITE
        canvas.drawOval(width * 0.35f, height * 0.35f, width * 0.43f, height * 0.39f, paint)
        canvas.drawOval(width * 0.57f, height * 0.35f, width * 0.65f, height * 0.39f, paint)

        // Irises
        paint.color = Color.rgb(45, 30, 25)
        canvas.drawCircle(width * 0.39f, height * 0.37f, 9f, paint)
        canvas.drawCircle(width * 0.61f, height * 0.37f, 9f, paint)

        // Mustache
        paint.color = Color.rgb(40, 30, 30)
        canvas.drawOval(width * 0.42f, height * 0.47f, width * 0.58f, height * 0.50f, paint)

        // Lips
        paint.color = Color.rgb(160, 90, 80)
        canvas.drawOval(width * 0.44f, height * 0.51f, width * 0.56f, height * 0.535f, paint)

        return bitmap
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
