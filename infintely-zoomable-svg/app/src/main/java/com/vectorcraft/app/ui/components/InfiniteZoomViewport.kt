package com.vectorcraft.app.ui.components

import android.graphics.Bitmap
import android.graphics.Picture
import android.graphics.RectF
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.VectorConverter
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.caverock.androidsvg.SVG
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentGold
import com.vectorcraft.app.ui.theme.DarkBackdrop
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.roundToInt

enum class ViewMode {
    SPLIT_SLIDER,
    VECTOR_ONLY,
    ORIGINAL_ONLY
}

enum class BackgroundStyle(val displayName: String) {
    DARK_GRID("Dark Grid"),
    LIGHT_CHECKER("Checkerboard"),
    SOLID_BLACK("Solid Black"),
    SOLID_WHITE("Solid White")
}

@Composable
fun InfiniteZoomViewport(
    bitmap: Bitmap?,
    svgContent: String?,
    viewMode: ViewMode,
    splitRatio: Float,
    onSplitRatioChange: (Float) -> Unit,
    isWireframe: Boolean = false,
    backgroundStyle: BackgroundStyle = BackgroundStyle.DARK_GRID,
    modifier: Modifier = Modifier
) {
    var scale by remember { mutableFloatStateOf(1.0f) }
    var panOffset by remember { mutableStateOf(Offset.Zero) }

    val scope = rememberCoroutineScope()
    val scaleAnim = remember { Animatable(1.0f) }
    val offsetAnim = remember { Animatable(Offset.Zero, Offset.VectorConverter) }

    var isDraggingDivider by remember { mutableStateOf(false) }
    val density = LocalDensity.current
    val hitTargetThresholdPx = remember(density) { with(density) { 44.dp.toPx() } }

    // Two-Tier Hardware Caching Layer:
    // Pre-record SVG vector paths into an offscreen android.graphics.Picture ONCE after generation.
    // During active pinch-to-zoom, pan, or split slider movement, the GPU simply applies
    // matrix transforms directly to this hardware display list with zero frame drops!
    val cachedPicture: Picture? = remember(svgContent, isWireframe, bitmap) {
        if (!svgContent.isNullOrBlank() && bitmap != null) {
            try {
                val effectiveSvg = if (isWireframe) {
                    svgContent
                        .replace("fill=\"#[0-9a-fA-F]+\"".toRegex(), "fill=\"none\" stroke=\"#00E5FF\" stroke-width=\"1\"")
                        .replace("fill=\"rgb[^\"]+\"".toRegex(), "fill=\"none\" stroke=\"#00E5FF\" stroke-width=\"1\"")
                } else {
                    svgContent
                }
                val svg = SVG.getFromString(effectiveSvg)
                val pic = Picture()
                val canvas = pic.beginRecording(bitmap.width, bitmap.height)
                svg.renderToCanvas(canvas, RectF(0f, 0f, bitmap.width.toFloat(), bitmap.height.toFloat()))
                pic.endRecording()
                pic
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackdrop)
            // Gesture Layer 1: Double-tap to reset zoom
            .pointerInput(Unit) {
                detectTapGestures(
                    onDoubleTap = {
                        scope.launch {
                            launch { scaleAnim.animateTo(1.0f, tween(250)) }
                            launch { offsetAnim.animateTo(Offset.Zero, tween(250)) }
                        }
                    }
                )
            }
            // Gesture Layer 2: Dedicated Split Slider Drag Layer (takes ownership when touching near divider)
            .pointerInput(viewMode, splitRatio) {
                if (viewMode == ViewMode.SPLIT_SLIDER) {
                    detectDragGestures(
                        onDragStart = { startPos ->
                            val currentDividerX = size.width * splitRatio
                            if (abs(startPos.x - currentDividerX) <= hitTargetThresholdPx) {
                                isDraggingDivider = true
                            }
                        },
                        onDrag = { change, dragAmount ->
                            if (isDraggingDivider) {
                                change.consume()
                                val newRatio = (splitRatio + dragAmount.x / size.width).coerceIn(0.02f, 0.98f)
                                onSplitRatioChange(newRatio)
                            }
                        },
                        onDragEnd = { isDraggingDivider = false },
                        onDragCancel = { isDraggingDivider = false }
                    )
                }
            }
            // Gesture Layer 3: Multi-touch pinch-to-zoom & pan (active when not dragging divider)
            .pointerInput(isDraggingDivider) {
                if (!isDraggingDivider) {
                    detectTransformGestures { _, pan, zoom, _ ->
                        val oldScale = scaleAnim.value
                        val newScale = (oldScale * zoom).coerceIn(0.5f, 50.0f)
                        val newOffset = offsetAnim.value + pan

                        scope.launch {
                            scaleAnim.snapTo(newScale)
                            offsetAnim.snapTo(newOffset)
                        }
                    }
                }
            }
    ) {
        scale = scaleAnim.value
        panOffset = offsetAnim.value

        Canvas(modifier = Modifier.fillMaxSize()) {
            val canvasWidth = size.width
            val canvasHeight = size.height

            // 1. Background Grid / Texture
            when (backgroundStyle) {
                BackgroundStyle.DARK_GRID -> {
                    val gridSize = 48f * scale.coerceAtMost(4f)
                    val gridColor = Color(0x1800E5FF)
                    var gx = (panOffset.x % gridSize)
                    while (gx < canvasWidth) {
                        drawLine(gridColor, Offset(gx, 0f), Offset(gx, canvasHeight), strokeWidth = 1f)
                        gx += gridSize
                    }
                    var gy = (panOffset.y % gridSize)
                    while (gy < canvasHeight) {
                        drawLine(gridColor, Offset(0f, gy), Offset(canvasWidth, gy), strokeWidth = 1f)
                        gy += gridSize
                    }
                }

                BackgroundStyle.LIGHT_CHECKER -> {
                    val checkSize = 24f * scale.coerceAtMost(3f)
                    var y = (panOffset.y % (checkSize * 2))
                    var row = 0
                    while (y < canvasHeight) {
                        var x = (panOffset.x % (checkSize * 2))
                        var col = 0
                        while (x < canvasWidth) {
                            if ((row + col) % 2 == 0) {
                                drawRect(Color(0xFFE2E8F0), Offset(x, y), Size(checkSize, checkSize))
                            } else {
                                drawRect(Color(0xFFCBD5E1), Offset(x, y), Size(checkSize, checkSize))
                            }
                            x += checkSize
                            col++
                        }
                        y += checkSize
                        row++
                    }
                }

                BackgroundStyle.SOLID_BLACK -> {
                    drawRect(Color.Black, Offset.Zero, size)
                }

                BackgroundStyle.SOLID_WHITE -> {
                    drawRect(Color.White, Offset.Zero, size)
                }
            }

            if (bitmap == null) return@Canvas

            val contentWidth = bitmap.width.toFloat()
            val contentHeight = bitmap.height.toFloat()
            val baseScale = (canvasWidth / contentWidth).coerceAtMost(canvasHeight / contentHeight) * 0.90f

            val totalScale = baseScale * scale
            val drawWidth = contentWidth * totalScale
            val drawHeight = contentHeight * totalScale
            val drawLeft = (canvasWidth - drawWidth) / 2f + panOffset.x
            val drawTop = (canvasHeight - drawHeight) / 2f + panOffset.y

            val splitX = canvasWidth * splitRatio

            when (viewMode) {
                ViewMode.ORIGINAL_ONLY -> {
                    drawContext.canvas.nativeCanvas.save()
                    drawContext.canvas.nativeCanvas.translate(drawLeft, drawTop)
                    drawContext.canvas.nativeCanvas.scale(totalScale, totalScale)
                    drawImage(
                        image = bitmap.asImageBitmap(),
                        dstSize = IntSize(bitmap.width, bitmap.height)
                    )
                    drawContext.canvas.nativeCanvas.restore()
                }

                ViewMode.VECTOR_ONLY -> {
                    drawIntoCanvas { canvas ->
                        canvas.save()
                        canvas.translate(drawLeft, drawTop)
                        canvas.scale(totalScale, totalScale)
                        if (cachedPicture != null) {
                            canvas.nativeCanvas.drawPicture(cachedPicture)
                        } else {
                            drawImage(
                                image = bitmap.asImageBitmap(),
                                dstSize = IntSize(bitmap.width, bitmap.height)
                            )
                        }
                        canvas.restore()
                    }
                }

                ViewMode.SPLIT_SLIDER -> {
                    // Left side: Original Raster Bitmap clipped to [0..splitX]
                    clipRect(left = 0f, top = 0f, right = splitX, bottom = canvasHeight) {
                        drawContext.canvas.nativeCanvas.save()
                        drawContext.canvas.nativeCanvas.translate(drawLeft, drawTop)
                        drawContext.canvas.nativeCanvas.scale(totalScale, totalScale)
                        drawImage(
                            image = bitmap.asImageBitmap(),
                            dstSize = IntSize(bitmap.width, bitmap.height)
                        )
                        drawContext.canvas.nativeCanvas.restore()
                    }

                    // Right side: Cached Vector Picture clipped to [splitX..canvasWidth]
                    clipRect(left = splitX, top = 0f, right = canvasWidth, bottom = canvasHeight) {
                        drawIntoCanvas { canvas ->
                            canvas.save()
                            canvas.translate(drawLeft, drawTop)
                            canvas.scale(totalScale, totalScale)
                            if (cachedPicture != null) {
                                canvas.nativeCanvas.drawPicture(cachedPicture)
                            } else {
                                drawImage(
                                    image = bitmap.asImageBitmap(),
                                    dstSize = IntSize(bitmap.width, bitmap.height)
                                )
                            }
                            canvas.restore()
                        }
                    }

                    // Luminous neon divider line
                    drawLine(
                        color = if (isDraggingDivider) AccentGold else AccentCyan,
                        start = Offset(splitX, 0f),
                        end = Offset(splitX, canvasHeight),
                        strokeWidth = if (isDraggingDivider) 4f else 2.5f
                    )
                }
            }
        }

        // Tactile Drag Knob Handle
        if (viewMode == ViewMode.SPLIT_SLIDER) {
            BoxWithConstraints(
                modifier = Modifier.fillMaxSize()
            ) {
                val knobSizePx = with(density) { 42.dp.toPx() }
                val targetXPx = constraints.maxWidth * splitRatio - (knobSizePx / 2f)
                Surface(
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .offset {
                            IntOffset(targetXPx.roundToInt(), 0)
                        }
                        .size(42.dp),
                    shape = CircleShape,
                    color = if (isDraggingDivider) AccentGold else AccentCyan,
                    shadowElevation = 10.dp
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.SwapHoriz,
                            contentDescription = "Drag Divider",
                            tint = Color.Black,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }

        // Glassmorphic Zoom HUD Badge (Top Left)
        Surface(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(16.dp),
            shape = RoundedCornerShape(20.dp),
            color = Color(0x33101624),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x33FFFFFF)),
            shadowElevation = 8.dp
        ) {
            Text(
                text = "${String.format("%.1f", scale)}x (Double-tap to reset)",
                color = if (scale > 1.0f) AccentCyan else Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
            )
        }

        // Split Mode Labels (Bottom)
        if (viewMode == ViewMode.SPLIT_SLIDER) {
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(start = 16.dp, bottom = 16.dp),
                shape = RoundedCornerShape(12.dp),
                color = Color(0x660A0D14),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x22FFFFFF))
            ) {
                Text(
                    text = "◀ RASTER",
                    color = Color.LightGray,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                )
            }

            Surface(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 16.dp, bottom = 16.dp),
                shape = RoundedCornerShape(12.dp),
                color = Color(0x660A0D14),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x22FFFFFF))
            ) {
                Text(
                    text = if (isWireframe) "WIREFRAME ▶" else "VECTOR ▶",
                    color = if (isWireframe) AccentGold else AccentCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                )
            }
        }
    }
}
