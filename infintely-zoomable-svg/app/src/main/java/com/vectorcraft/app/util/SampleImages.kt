package com.vectorcraft.app.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.Shader
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

enum class SamplePreset(val title: String, val subtitle: String) {
    STUDIO_HORIZON("Golden Coast & Villa", "Smooth sky/water gradients paired with razor-sharp architecture & rigging"),
    MOON("Lunar Surface Study", "Multi-scale impact craters, mare shading & high-contrast terminator"),
    LOGO("VectorForge Prism", "Crisp precision geometric planes & optical calibration reticle"),
    PIXEL_ART("Retro Knight Sprite", "32×32 integer pixel grid for testing unsmoothed Pixel Art mode")
}

object SampleImages {

    @Suppress("UNUSED_PARAMETER")
    fun init(context: Context) {
        // Pure deterministic high-res procedural scenes — zero distorted bundled bitmaps
    }

    fun generateSample(preset: SamplePreset): Bitmap {
        return when (preset) {
            SamplePreset.STUDIO_HORIZON -> createStudioHorizonBitmap()
            SamplePreset.MOON -> createMoonStudyBitmap()
            SamplePreset.LOGO -> createPrismLogoBitmap()
            SamplePreset.PIXEL_ART -> createPixelArtBitmap()
        }
    }

    /**
     * High-resolution (720x960) coastal twilight vista combining continuous atmospheric
     * sky/water gradients with fine crisp architectural lines, lighthouse windows, and sailboats.
     */
    private fun createStudioHorizonBitmap(): Bitmap {
        val w = 720
        val h = 960
        val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val p = Paint(Paint.ANTI_ALIAS_FLAG)

        // 1. Rich multi-stop twilight sky gradient
        val horizonY = h * 0.60f
        p.shader = LinearGradient(
            0f, 0f, 0f, horizonY,
            intArrayOf(
                Color.rgb(12, 18, 42),
                Color.rgb(34, 48, 92),
                Color.rgb(112, 72, 118),
                Color.rgb(226, 118, 86),
                Color.rgb(252, 198, 120)
            ),
            floatArrayOf(0f, 0.28f, 0.56f, 0.80f, 1.0f),
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(0f, 0f, w.toFloat(), horizonY, p)
        p.shader = null

        // Subtle crisp stars in upper sky
        val rng = Random(42)
        for (i in 0 until 38) {
            val sx = rng.nextFloat() * w
            val sy = rng.nextFloat() * horizonY * 0.42f
            val r = 1.0f + rng.nextFloat() * 1.6f
            p.color = Color.argb(140 + rng.nextInt(115), 240, 246, 255)
            canvas.drawCircle(sx, sy, r, p)
        }

        // 2. Solar glow & setting sun disk
        val sunX = w * 0.34f
        val sunY = horizonY - 48f
        p.shader = RadialGradient(
            sunX, sunY, 210f,
            intArrayOf(
                Color.argb(220, 255, 242, 190),
                Color.argb(95, 255, 165, 92),
                Color.argb(0, 255, 120, 80)
            ),
            floatArrayOf(0f, 0.45f, 1f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(sunX, sunY, 210f, p)
        p.shader = null

        p.shader = LinearGradient(
            sunX, sunY - 64f, sunX, sunY + 64f,
            Color.rgb(255, 249, 218),
            Color.rgb(255, 178, 88),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(sunX, sunY, 64f, p)
        p.shader = null

        // 3. Layered mountain ranges with atmospheric perspective
        val farRange = Path().apply {
            moveTo(0f, horizonY)
            lineTo(0f, horizonY - 110f)
            cubicTo(110f, horizonY - 195f, 200f, horizonY - 140f, 290f, horizonY - 95f)
            cubicTo(390f, horizonY - 170f, 510f, horizonY - 210f, 620f, horizonY - 135f)
            lineTo(w.toFloat(), horizonY - 160f)
            lineTo(w.toFloat(), horizonY)
            close()
        }
        p.shader = LinearGradient(
            0f, horizonY - 210f, 0f, horizonY,
            Color.rgb(86, 66, 108),
            Color.rgb(154, 96, 110),
            Shader.TileMode.CLAMP
        )
        canvas.drawPath(farRange, p)
        p.shader = null

        val midRange = Path().apply {
            moveTo(0f, horizonY)
            lineTo(0f, horizonY - 62f)
            cubicTo(140f, horizonY - 110f, 260f, horizonY - 40f, 380f, horizonY - 72f)
            cubicTo(500f, horizonY - 105f, 610f, horizonY - 58f, w.toFloat(), horizonY - 92f)
            lineTo(w.toFloat(), horizonY)
            close()
        }
        p.shader = LinearGradient(
            0f, horizonY - 110f, 0f, horizonY,
            Color.rgb(42, 39, 68),
            Color.rgb(74, 52, 82),
            Shader.TileMode.CLAMP
        )
        canvas.drawPath(midRange, p)
        p.shader = null

        // 4. Reflective water plane with golden sun path ripples
        p.shader = LinearGradient(
            0f, horizonY, 0f, h.toFloat(),
            Color.rgb(228, 128, 92),
            Color.rgb(18, 28, 54),
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(0f, horizonY, w.toFloat(), h.toFloat(), p)
        p.shader = null

        // Golden water shimmer bars
        for (i in 0 until 26) {
            val t = i / 25f
            val ry = horizonY + 12f + t * t * (h - horizonY - 26f)
            val rw = 125f - t * 65f
            val rh = 3.0f + t * 5.0f
            val offsetX = sin(i * 1.4f) * (12f + t * 20f)
            p.color = Color.argb((195 - t * 110).toInt(), 255, (235 - t * 65).toInt(), 145)
            canvas.drawRoundRect(sunX - rw + offsetX, ry, sunX + rw + offsetX, ry + rh, rh, rh, p)
        }

        // 5. Sleek Sailboat silhouette with crisp white mainsail & jib
        val boatX = w * 0.25f
        val boatY = horizonY + 88f
        p.shader = LinearGradient(boatX - 20f, boatY - 140f, boatX + 45f, boatY - 8f, Color.rgb(255, 246, 224), Color.rgb(235, 168, 122), Shader.TileMode.CLAMP)
        val mainSail = Path().apply {
            moveTo(boatX, boatY - 135f)
            quadTo(boatX + 44f, boatY - 70f, boatX + 52f, boatY - 10f)
            lineTo(boatX + 4f, boatY - 10f)
            close()
        }
        canvas.drawPath(mainSail, p)
        p.shader = null

        p.color = Color.rgb(245, 212, 168)
        val jib = Path().apply {
            moveTo(boatX - 4f, boatY - 110f)
            lineTo(boatX - 38f, boatY - 14f)
            lineTo(boatX - 4f, boatY - 14f)
            close()
        }
        canvas.drawPath(jib, p)

        p.color = Color.rgb(24, 30, 48)
        val hull = Path().apply {
            moveTo(boatX - 54f, boatY - 6f)
            lineTo(boatX + 60f, boatY - 6f)
            lineTo(boatX + 44f, boatY + 12f)
            lineTo(boatX - 40f, boatY + 12f)
            close()
        }
        canvas.drawPath(hull, p)
        p.strokeWidth = 3f
        p.color = Color.rgb(42, 48, 68)
        canvas.drawLine(boatX, boatY - 142f, boatX, boatY - 6f, p)

        // 6. Crisp Coastal Headland + Modern Lighthouse Architecture (right side)
        val cliff = Path().apply {
            moveTo(w * 0.48f, h.toFloat())
            lineTo(w * 0.56f, horizonY + 115f)
            lineTo(w * 0.72f, horizonY + 86f)
            lineTo(w.toFloat(), horizonY + 104f)
            lineTo(w.toFloat(), h.toFloat())
            close()
        }
        p.shader = LinearGradient(
            w * 0.5f, horizonY + 80f, w.toFloat(), h.toFloat(),
            Color.rgb(34, 42, 58),
            Color.rgb(12, 16, 26),
            Shader.TileMode.CLAMP
        )
        canvas.drawPath(cliff, p)
        p.shader = null

        // Lighthouse tower (clean tapered polygon + crisp stripes + glass lantern dome)
        val lx = w * 0.76f
        val lyBase = horizonY + 96f
        val lyTop = horizonY - 168f
        val tower = Path().apply {
            moveTo(lx - 34f, lyBase)
            lineTo(lx - 20f, lyTop)
            lineTo(lx + 20f, lyTop)
            lineTo(lx + 34f, lyBase)
            close()
        }
        p.shader = LinearGradient(
            lx - 34f, lyBase, lx + 34f, lyBase,
            Color.rgb(252, 240, 224),
            Color.rgb(156, 158, 178),
            Shader.TileMode.CLAMP
        )
        canvas.drawPath(tower, p)
        p.shader = null

        // Crisp Crimson Signal Bands on Tower
        p.color = Color.rgb(212, 62, 62)
        val band1 = Path().apply {
            moveTo(lx - 26f, lyBase - 145f)
            lineTo(lx - 23f, lyBase - 195f)
            lineTo(lx + 23f, lyBase - 195f)
            lineTo(lx + 26f, lyBase - 145f)
            close()
        }
        canvas.drawPath(band1, p)

        // Gallery Deck & Glass Lantern Room with glowing warm beacon
        p.color = Color.rgb(26, 32, 46)
        canvas.drawRect(lx - 28f, lyTop - 10f, lx + 28f, lyTop + 4f, p)

        // Glowing warm beam sweep left
        p.shader = LinearGradient(
            lx - 18f, lyTop - 28f, lx - 360f, lyTop - 95f,
            Color.argb(135, 255, 244, 178),
            Color.argb(0, 255, 244, 178),
            Shader.TileMode.CLAMP
        )
        val beam = Path().apply {
            moveTo(lx - 10f, lyTop - 36f)
            lineTo(lx - 380f, lyTop - 135f)
            lineTo(lx - 380f, lyTop + 20f)
            lineTo(lx - 10f, lyTop - 18f)
            close()
        }
        canvas.drawPath(beam, p)
        p.shader = null

        p.color = Color.rgb(255, 242, 168)
        canvas.drawRect(lx - 14f, lyTop - 42f, lx + 14f, lyTop - 10f, p)

        // Crisp black lantern mullions & domed roof
        p.color = Color.rgb(20, 26, 38)
        p.strokeWidth = 3f
        canvas.drawLine(lx - 5f, lyTop - 42f, lx - 5f, lyTop - 10f, p)
        canvas.drawLine(lx + 5f, lyTop - 42f, lx + 5f, lyTop - 10f, p)
        val dome = Path().apply {
            moveTo(lx - 22f, lyTop - 42f)
            cubicTo(lx - 14f, lyTop - 68f, lx + 14f, lyTop - 68f, lx + 22f, lyTop - 42f)
            close()
        }
        canvas.drawPath(dome, p)
        canvas.drawLine(lx, lyTop - 62f, lx, lyTop - 80f, p)

        // Precision window + door details on tower
        p.color = Color.rgb(255, 214, 128)
        canvas.drawRoundRect(lx - 7f, lyBase - 235f, lx + 7f, lyBase - 210f, 7f, 7f, p)
        canvas.drawRoundRect(lx - 7f, lyBase - 120f, lx + 7f, lyBase - 95f, 7f, 7f, p)
        p.color = Color.rgb(22, 28, 42)
        canvas.drawRoundRect(lx - 10f, lyBase - 44f, lx + 10f, lyBase, 10f, 10f, p)

        // Keeper's Villa adjacent to lighthouse with warm lit windows & crisp roofline
        val vx = w * 0.61f
        val vy = horizonY + 98f
        p.color = Color.rgb(224, 212, 200)
        canvas.drawRect(vx - 44f, vy - 44f, vx + 44f, vy + 4f, p)
        p.color = Color.rgb(42, 48, 66)
        val roof = Path().apply {
            moveTo(vx - 52f, vy - 44f)
            lineTo(vx, vy - 76f)
            lineTo(vx + 52f, vy - 44f)
            close()
        }
        canvas.drawPath(roof, p)
        p.color = Color.rgb(255, 202, 104)
        canvas.drawRect(vx - 30f, vy - 30f, vx - 12f, vy - 12f, p)
        canvas.drawRect(vx + 12f, vy - 30f, vx + 30f, vy - 12f, p)

        // Foreground curved pine silhouettes on bottom-left for deep depth contrast
        p.color = Color.rgb(10, 14, 22)
        val fgShore = Path().apply {
            moveTo(0f, h.toFloat())
            lineTo(0f, h - 135f)
            quadTo(140f, h - 108f, 255f, h - 42f)
            lineTo(290f, h.toFloat())
            close()
        }
        canvas.drawPath(fgShore, p)
        drawCrispPine(canvas, 68f, h - 115f, 128f, p)
        drawCrispPine(canvas, 138f, h - 98f, 152f, p)
        drawCrispPine(canvas, 204f, h - 68f, 108f, p)

        return bitmap
    }

    private fun drawCrispPine(canvas: Canvas, cx: Float, baseY: Float, height: Float, paint: Paint) {
        paint.color = Color.rgb(12, 16, 24)
        for (tier in 0 until 3) {
            val yTop = baseY - height * (0.45f + tier * 0.25f)
            val yBot = baseY - height * (tier * 0.22f)
            val halfW = height * (0.34f - tier * 0.08f)
            val tri = Path().apply {
                moveTo(cx, yTop)
                lineTo(cx - halfW, yBot)
                lineTo(cx + halfW, yBot)
                close()
            }
            canvas.drawPath(tri, paint)
        }
    }

    /**
     * Ultra-crisp Lunar Study (720x720) with rich maria gradients, multi-scale rimmed craters,
     * and crisp terminator lighting against deep obsidian space.
     */
    private fun createMoonStudyBitmap(): Bitmap {
        val size = 720
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val p = Paint(Paint.ANTI_ALIAS_FLAG)

        // Deep space starfield backdrop
        canvas.drawColor(Color.rgb(9, 11, 18))
        val rng = Random(1337)
        for (i in 0 until 75) {
            p.color = Color.argb(110 + rng.nextInt(145), 220 + rng.nextInt(35), 225 + rng.nextInt(30), 255)
            canvas.drawCircle(rng.nextFloat() * size, rng.nextFloat() * size, 0.8f + rng.nextFloat() * 1.6f, p)
        }

        val cx = size * 0.5f
        val cy = size * 0.5f
        val r = size * 0.36f

        // Subtle atmospheric halo
        p.shader = RadialGradient(
            cx - r * 0.25f, cy - r * 0.25f, r * 1.38f,
            intArrayOf(Color.argb(70, 210, 224, 255), Color.argb(0, 120, 140, 180)),
            floatArrayOf(0.55f, 1.0f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(cx, cy, r * 1.38f, p)
        p.shader = null

        // Main lunar sphere gradient (waxing gibbous illumination from top-left)
        val clipMoon = Path().apply { addCircle(cx, cy, r, Path.Direction.CW) }
        canvas.save()
        canvas.clipPath(clipMoon)

        p.shader = RadialGradient(
            cx - r * 0.42f, cy - r * 0.42f, r * 1.85f,
            intArrayOf(
                Color.rgb(242, 240, 232),
                Color.rgb(186, 186, 182),
                Color.rgb(104, 108, 116),
                Color.rgb(28, 32, 42)
            ),
            floatArrayOf(0f, 0.46f, 0.78f, 1.0f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(cx, cy, r, p)
        p.shader = null

        // Dark basaltic Lunar Maria patches
        val maria = listOf(
            Triple(cx - 58f, cy - 62f, 88f),
            Triple(cx + 42f, cy - 78f, 64f),
            Triple(cx - 88f, cy + 32f, 70f),
            Triple(cx + 16f, cy + 28f, 52f),
            Triple(cx - 18f, cy - 118f, 54f)
        )
        for ((mx, my, mr) in maria) {
            p.shader = RadialGradient(
                mx, my, mr,
                intArrayOf(Color.argb(92, 62, 66, 76), Color.argb(0, 80, 84, 94)),
                null,
                Shader.TileMode.CLAMP
            )
            canvas.drawCircle(mx, my, mr, p)
        }
        p.shader = null

        // Multi-scale crisp impact craters (highlighted far rim, shaded near basin)
        for (i in 0 until 42) {
            val angle = rng.nextFloat() * Math.PI.toFloat() * 2f
            val dist = kotlin.math.sqrt(rng.nextFloat()) * (r * 0.88f)
            val kx = cx + cos(angle) * dist
            val ky = cy + sin(angle) * dist
            val kr = 5f + rng.nextFloat() * rng.nextFloat() * 34f

            // Shadowed interior floor
            p.color = Color.argb(120, 48, 52, 62)
            canvas.drawCircle(kx - kr * 0.08f, ky - kr * 0.08f, kr * 0.88f, p)

            // Crisp sunlit inner lip
            p.color = Color.argb(165, 248, 246, 238)
            canvas.drawCircle(kx + kr * 0.10f, ky + kr * 0.10f, kr * 0.78f, p)

            // Center crater floor gradient
            p.shader = LinearGradient(
                kx - kr * 0.7f, ky - kr * 0.7f, kx + kr * 0.7f, ky + kr * 0.7f,
                Color.rgb(112, 114, 120),
                Color.rgb(206, 204, 198),
                Shader.TileMode.CLAMP
            )
            canvas.drawCircle(kx, ky, kr * 0.74f, p)
            p.shader = null
        }

        // Prominent Tycho crater with bright radial ejecta rays
        val tx = cx - r * 0.18f
        val ty = cy + r * 0.48f
        p.color = Color.argb(85, 250, 248, 242)
        p.strokeWidth = 2.6f
        for (ray in 0 until 14) {
            val a = ray * (Math.PI.toFloat() * 2f / 14f) + 0.2f
            val len = 65f + (ray % 3) * 58f
            canvas.drawLine(tx, ty, tx + cos(a) * len, ty + sin(a) * len, p)
        }
        p.color = Color.rgb(245, 242, 232)
        canvas.drawCircle(tx, ty, 20f, p)
        p.color = Color.rgb(118, 120, 128)
        canvas.drawCircle(tx - 2f, ty - 2f, 14f, p)

        canvas.restore()
        return bitmap
    }

    /**
     * Precision VectorForge Prism Emblem (720x720) testing crisp geometric edges & curves.
     */
    private fun createPrismLogoBitmap(): Bitmap {
        val size = 720
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val p = Paint(Paint.ANTI_ALIAS_FLAG)

        p.shader = RadialGradient(
            size * 0.5f, size * 0.45f, size * 0.65f,
            Color.rgb(22, 30, 48), Color.rgb(8, 12, 20),
            Shader.TileMode.CLAMP
        )
        canvas.drawRect(0f, 0f, size.toFloat(), size.toFloat(), p)
        p.shader = null

        val cx = size / 2f
        val cy = size / 2f

        // Outer technical reticle ring
        p.style = Paint.Style.STROKE
        p.strokeWidth = 4f
        p.color = Color.rgb(34, 211, 238)
        canvas.drawCircle(cx, cy, 245f, p)
        p.strokeWidth = 2f
        p.color = Color.rgb(99, 102, 241)
        canvas.drawCircle(cx, cy, 212f, p)
        p.style = Paint.Style.FILL

        // Interlocking geometric V-prism facets
        val leftFacet = Path().apply {
            moveTo(cx - 175f, cy - 110f)
            lineTo(cx - 75f, cy - 110f)
            lineTo(cx, cy + 75f)
            lineTo(cx, cy + 185f)
            close()
        }
        p.shader = LinearGradient(cx - 175f, cy - 110f, cx, cy + 185f, Color.rgb(34, 211, 238), Color.rgb(59, 130, 246), Shader.TileMode.CLAMP)
        canvas.drawPath(leftFacet, p)

        val rightFacet = Path().apply {
            moveTo(cx + 175f, cy - 110f)
            lineTo(cx + 75f, cy - 110f)
            lineTo(cx, cy + 75f)
            lineTo(cx, cy + 185f)
            close()
        }
        p.shader = LinearGradient(cx + 175f, cy - 110f, cx, cy + 185f, Color.rgb(168, 85, 247), Color.rgb(79, 70, 229), Shader.TileMode.CLAMP)
        canvas.drawPath(rightFacet, p)

        // Precision center vector node
        p.shader = null
        p.color = Color.rgb(248, 250, 252)
        canvas.drawCircle(cx, cy - 75f, 34f, p)
        p.color = Color.rgb(15, 23, 42)
        canvas.drawCircle(cx, cy - 75f, 18f, p)
        p.color = Color.rgb(34, 211, 238)
        canvas.drawCircle(cx, cy - 75f, 9f, p)

        return bitmap
    }

    /**
     * Exact 32x32 Retro Knight sprite scaled crisply to 512x512 without anti-aliasing.
     */
    private fun createPixelArtBitmap(): Bitmap {
        val grid = 16
        val cell = 32
        val size = grid * cell
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val p = Paint().apply { isAntiAlias = false }

        val palette = mapOf(
            '.' to Color.rgb(18, 22, 34),
            'K' to Color.rgb(12, 14, 20),
            'S' to Color.rgb(198, 212, 228),
            'H' to Color.rgb(244, 250, 255),
            'D' to Color.rgb(108, 124, 148),
            'C' to Color.rgb(34, 211, 238),
            'R' to Color.rgb(239, 68, 68),
            'G' to Color.rgb(250, 204, 21),
            'B' to Color.rgb(59, 130, 246)
        )

        val sprite = arrayOf(
            "......RRRR......",
            ".....RRRRRR.....",
            "....KKKKKKKK....",
            "....KSHHHHSK....",
            "...KSSKKKKSSK...",
            "...KSDKCCKDSK...",
            "...KSDKCCKDSK...",
            "....KSDDDDSK....",
            "..KKBBBBBBBBKK..",
            ".KSSBGGGGGGSSSK.",
            ".KSSKBBBBBBKSSK.",
            ".KDDKBBGGBBKDDK.",
            "..KK.KBBBBK.KK..",
            ".....KSDDSK.....",
            "....KKK..KKK....",
            "....DDD..DDD...."
        )

        for (y in 0 until grid) {
            val row = sprite[y]
            for (x in 0 until grid) {
                p.color = palette[row[x]] ?: Color.BLACK
                canvas.drawRect(
                    (x * cell).toFloat(),
                    (y * cell).toFloat(),
                    ((x + 1) * cell).toFloat(),
                    ((y + 1) * cell).toFloat(),
                    p
                )
            }
        }
        return bitmap
    }
}
