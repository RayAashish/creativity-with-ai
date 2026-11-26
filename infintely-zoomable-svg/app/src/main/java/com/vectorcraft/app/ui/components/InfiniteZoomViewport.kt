package com.vectorcraft.app.ui.components

import android.graphics.Bitmap
import android.graphics.Picture
import android.util.Log
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculateCentroid
import androidx.compose.foundation.gestures.calculatePan
import androidx.compose.foundation.gestures.calculateZoom
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.CompareArrows
import androidx.compose.material.icons.rounded.FitScreen
import androidx.compose.material.icons.rounded.GridOn
import androidx.compose.material.icons.rounded.Polyline
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.positionChanged
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.caverock.androidsvg.SVG
import com.vectorcraft.app.ui.theme.AccentAmber
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentCyanMuted
import com.vectorcraft.app.ui.theme.GlassBorder
import com.vectorcraft.app.ui.theme.GlassPillBg
import com.vectorcraft.app.ui.theme.ObsidianBg
import com.vectorcraft.app.ui.theme.ObsidianSurface
import com.vectorcraft.app.ui.theme.TextPrimary
import com.vectorcraft.app.ui.theme.TextSecondary
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.roundToInt

enum class ViewMode(val shortLabel: String) {
    SPLIT_SLIDER("Split"),
    VECTOR_ONLY("Vector"),
    ORIGINAL_ONLY("Original")
}

enum class BackgroundStyle(val displayName: String) {
    DARK_GRID("Dark Grid"),
    LIGHT_CHECKER("Checkerboard"),
    SOLID_BLACK("Obsidian"),
    SOLID_WHITE("Pure White")
}

private data class RecordedVector(
    val picture: Picture,
    val docWidth: Float,
    val docHeight: Float
)

/**
 * Linear-time SVG wireframe builder: extracts <path d="..."> geometries directly without
 * backtracking regexes or translucent stroke saveLayer overhead.
 */
private fun buildWireframeSvg(svg: String, width: Float): String {
    val strokeW = String.format(Locale.US, "%.2f", max(0.35f, width / 1100f))
    val svgStart = svg.indexOf("<svg")
    val svgTagEnd = if (svgStart >= 0) svg.indexOf('>', svgStart) else -1
    if (svgStart < 0 || svgTagEnd < 0) return svg

    val out = StringBuilder(svg.length / 2 + 256)
    out.append(svg, svgStart, svgTagEnd + 1)
    out.append('\n')

    var pos = svgTagEnd + 1
    while (true) {
        val pathIdx = svg.indexOf("<path", pos)
        if (pathIdx < 0) break
        val tagEnd = svg.indexOf('>', pathIdx)
        if (tagEnd < 0) break
        val dAttr = svg.indexOf("d=\"", pathIdx)
        if (dAttr in pathIdx until tagEnd) {
            val dStart = dAttr + 3
            val dEnd = svg.indexOf('"', dStart)
            if (dEnd in dStart until tagEnd) {
                out.append("<path d=\"")
                out.append(svg, dStart, dEnd)
                out.append("\" fill=\"none\" stroke=\"#22D3EE\" stroke-width=\"")
                out.append(strokeW)
                out.append("\"/>\n")
            }
        }
        pos = tagEnd + 1
    }
    out.append("</svg>\n")
    return out.toString()
}

@Composable
fun InfiniteZoomViewport(
    bitmap: Bitmap?,
    svgContent: String?,
    viewMode: ViewMode,
    splitRatio: Float,
    isProcessing: Boolean,
    isWireframe: Boolean,
    isPixelArt: Boolean,
    backgroundStyle: BackgroundStyle,
    onViewModeChange: (ViewMode) -> Unit,
    onSplitRatioChange: (Float) -> Unit,
    onToggleWireframe: () -> Unit,
    modifier: Modifier = Modifier
) {
    var zoomScale by remember { mutableFloatStateOf(1f) }
    var panOffset by remember { mutableStateOf(Offset.Zero) }
    var viewportSize by remember { mutableStateOf(IntSize.Zero) }

    // Reset zoom smoothly only when a brand-new image asset loads
    val bitmapKey = remember(bitmap) { bitmap?.let { System.identityHashCode(it) } ?: 0 }
    remember(bitmapKey) {
        zoomScale = 1f
        panOffset = Offset.Zero
        bitmapKey
    }

    val latestSplitRatio by rememberUpdatedState(splitRatio)
    val latestViewMode by rememberUpdatedState(viewMode)
    val latestOnSplitChange by rememberUpdatedState(onSplitRatioChange)

    val imageBitmap = remember(bitmap) { bitmap?.asImageBitmap() }

    // Parse SVG & record hardware display list Picture asynchronously on Dispatchers.Default
    // so sliders, photo imports, and wireframe toggles never drop a single UI frame.
    val recordedVector by produceState<RecordedVector?>(
        initialValue = null,
        key1 = svgContent,
        key2 = isWireframe,
        key3 = bitmap?.width to bitmap?.height
    ) {
        if (svgContent.isNullOrEmpty() || bitmap == null) {
            value = null
            return@produceState
        }
        val parsed = withContext(Dispatchers.Default) {
            try {
                val t0 = System.currentTimeMillis()
                val docW = bitmap.width.toFloat().coerceAtLeast(1f)
                val docH = bitmap.height.toFloat().coerceAtLeast(1f)
                val effectiveSvg = if (isWireframe) buildWireframeSvg(svgContent, docW) else svgContent
                val parsedSvg = SVG.getFromString(effectiveSvg).apply {
                    documentWidth = docW
                    documentHeight = docH
                }
                val pic = parsedSvg.renderToPicture(docW.roundToInt(), docH.roundToInt())
                val elapsed = System.currentTimeMillis() - t0
                Log.i("VectorForge-Viewport", "Recorded ${docW.toInt()}x${docH.toInt()} Picture in ${elapsed}ms (wireframe=$isWireframe)")
                RecordedVector(pic, docW, docH)
            } catch (t: Throwable) {
                Log.e("VectorForge-Viewport", "Failed to parse SVG in viewport", t)
                null
            }
        }
        if (parsed != null) {
            value = parsed
        }
    }

    val dividerHitHalfPx = with(LocalDensity.current) { 32.dp.toPx() }

    Box(
        modifier = modifier
            .fillMaxSize()
            .clipToBounds()
            .background(
                when (backgroundStyle) {
                    BackgroundStyle.SOLID_WHITE -> Color.White
                    BackgroundStyle.SOLID_BLACK -> Color.Black
                    else -> ObsidianBg
                }
            )
            .onSizeChanged { viewportSize = it }
            // Double-tap focal zoom toggle (1x <-> 4x centered on tap coordinates)
            .pointerInput(bitmapKey) {
                detectTapGestures(
                    onDoubleTap = { tap ->
                        if (zoomScale > 1.15f) {
                            zoomScale = 1f
                            panOffset = Offset.Zero
                        } else if (size.width > 0 && size.height > 0) {
                            val center = Offset(size.width / 2f, size.height / 2f)
                            val targetScale = 4.0f
                            val nextOffset = tap - center - (tap - center) * targetScale
                            val maxX = size.width * (targetScale - 1f) * 0.65f
                            val maxY = size.height * (targetScale - 1f) * 0.65f
                            zoomScale = targetScale
                            panOffset = Offset(
                                nextOffset.x.coerceIn(-maxX, maxX),
                                nextOffset.y.coerceIn(-maxY, maxY)
                            )
                        }
                    }
                )
            }
            // Arbitrated multi-touch focal zoom + pan + split divider drag
            .pointerInput(bitmapKey) {
                val touchSlop = viewConfiguration.touchSlop
                awaitEachGesture {
                    val down = awaitFirstDown(requireUnconsumed = false)
                    val vw = size.width.toFloat().coerceAtLeast(1f)
                    val vh = size.height.toFloat().coerceAtLeast(1f)
                    val center = Offset(vw / 2f, vh / 2f)

                    val dividerX = vw * latestSplitRatio
                    var draggingDivider = latestViewMode == ViewMode.SPLIT_SLIDER &&
                        abs(down.position.x - dividerX) <= dividerHitHalfPx

                    var panAccum = Offset.Zero
                    var zoomAccum = 1f
                    var pastSlop = draggingDivider

                    while (true) {
                        val event = awaitPointerEvent()
                        val pressed = event.changes.count { it.pressed }
                        if (pressed == 0) break

                        if (pressed >= 2) {
                            draggingDivider = false
                            pastSlop = true
                        }

                        val zoomChange = event.calculateZoom()
                        val panChange = event.calculatePan()
                        val centroid = event.calculateCentroid(useCurrent = true)

                        if (!pastSlop) {
                            zoomAccum *= zoomChange
                            panAccum += panChange
                            if (abs(1f - zoomAccum) > 0.02f || panAccum.getDistance() > touchSlop) {
                                pastSlop = true
                            }
                        }

                        if (pastSlop) {
                            if (draggingDivider && pressed == 1) {
                                val pointer = event.changes.firstOrNull { it.pressed }
                                if (pointer != null) {
                                    latestOnSplitChange((pointer.position.x / vw).coerceIn(0.03f, 0.97f))
                                    pointer.consume()
                                }
                            } else if (pressed >= 2 || zoomScale > 1.02f) {
                                val oldScale = zoomScale
                                val newScale = (oldScale * zoomChange).coerceIn(1f, 50f)
                                val ratio = newScale / oldScale
                                val unclamped = if (newScale <= 1.005f) {
                                    Offset.Zero
                                } else {
                                    centroid + panChange - center - (centroid - center - panOffset) * ratio
                                }
                                val maxPanX = vw * (newScale - 1f) * 0.72f + vw * 0.15f
                                val maxPanY = vh * (newScale - 1f) * 0.72f + vh * 0.15f
                                zoomScale = newScale
                                panOffset = if (newScale <= 1.005f) {
                                    Offset.Zero
                                } else {
                                    Offset(
                                        unclamped.x.coerceIn(-maxPanX, maxPanX),
                                        unclamped.y.coerceIn(-maxPanY, maxPanY)
                                    )
                                }
                                event.changes.forEach { if (it.positionChanged()) it.consume() }
                            }
                        }
                    }
                }
            }
    ) {
        // 1. Engineering grid or checkerboard canvas backdrop
        Canvas(modifier = Modifier.fillMaxSize()) {
            when (backgroundStyle) {
                BackgroundStyle.DARK_GRID -> {
                    val step = 28.dp.toPx()
                    val minor = Color(0x0D94A3B8)
                    val major = Color(0x1822D3EE)
                    var x = 0f
                    var i = 0
                    while (x < size.width) {
                        drawLine(if (i % 4 == 0) major else minor, Offset(x, 0f), Offset(x, size.height), strokeWidth = 1f)
                        x += step
                        i++
                    }
                    var y = 0f
                    var j = 0
                    while (y < size.height) {
                        drawLine(if (j % 4 == 0) major else minor, Offset(0f, y), Offset(size.width, y), strokeWidth = 1f)
                        y += step
                        j++
                    }
                }
                BackgroundStyle.LIGHT_CHECKER -> {
                    val cell = 18.dp.toPx()
                    val light = Color(0xFFE2E8F0)
                    val dark = Color(0xFFCBD5E1)
                    val cols = (size.width / cell).toInt() + 1
                    val rows = (size.height / cell).toInt() + 1
                    for (r in 0..rows) {
                        for (c in 0..cols) {
                            drawRect(
                                color = if ((r + c) % 2 == 0) light else dark,
                                topLeft = Offset(c * cell, r * cell),
                                size = androidx.compose.ui.geometry.Size(cell, cell)
                            )
                        }
                    }
                }
                else -> Unit
            }
        }

        // 2. Vector & Original Image Canvas (Hardware-accelerated nativeCanvas Picture scaling)
        if (imageBitmap != null) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val vw = size.width
                val vh = size.height
                val imgW = imageBitmap.width.toFloat()
                val imgH = imageBitmap.height.toFloat()
                val topReserve = 56.dp.toPx()
                val pad = 8.dp.toPx()
                val availW = (vw - pad * 2f).coerceAtLeast(1f)
                val availH = (vh - topReserve - pad * 2f).coerceAtLeast(1f)
                val fitScale = minOf(availW / imgW, availH / imgH)
                val baseLeft = pad + (availW - imgW * fitScale) / 2f
                val baseTop = topReserve + pad + (availH - imgH * fitScale) / 2f
                val cx = vw / 2f
                val cy = vh / 2f
                val dividerPx = vw * splitRatio

                fun drawTransformedOriginal() {
                    withTransform({
                        translate(cx + panOffset.x, cy + panOffset.y)
                        scale(zoomScale, zoomScale, pivot = Offset.Zero)
                        translate(-cx + baseLeft, -cy + baseTop)
                        scale(fitScale, fitScale, pivot = Offset.Zero)
                    }) {
                        drawImage(
                            image = imageBitmap,
                            filterQuality = if (isPixelArt || zoomScale >= 6f) FilterQuality.None else FilterQuality.High
                        )
                    }
                }

                fun drawTransformedVector() {
                    val vec = recordedVector ?: return
                    val sx = imgW / vec.docWidth
                    val sy = imgH / vec.docHeight
                    drawContext.canvas.nativeCanvas.apply {
                        save()
                        translate(cx + panOffset.x, cy + panOffset.y)
                        scale(zoomScale, zoomScale)
                        translate(-cx + baseLeft, -cy + baseTop)
                        scale(fitScale * sx, fitScale * sy)
                        drawPicture(vec.picture)
                        restore()
                    }
                }

                when (viewMode) {
                    ViewMode.ORIGINAL_ONLY -> drawTransformedOriginal()
                    ViewMode.VECTOR_ONLY -> {
                        if (recordedVector != null) drawTransformedVector() else drawTransformedOriginal()
                    }
                    ViewMode.SPLIT_SLIDER -> {
                        clipRect(left = 0f, top = 0f, right = dividerPx, bottom = vh) {
                            drawTransformedOriginal()
                        }
                        clipRect(left = dividerPx, top = 0f, right = vw, bottom = vh) {
                            if (recordedVector != null) drawTransformedVector() else drawTransformedOriginal()
                        }
                    }
                }
            }
        }

        // 3. Split Divider Line, Handle & Non-Colliding Badges
        if (viewMode == ViewMode.SPLIT_SLIDER && viewportSize.width > 0) {
            val dividerPx = viewportSize.width * splitRatio
            val heightPx = viewportSize.height.toFloat()

            // Crisp cyan hairline
            Canvas(modifier = Modifier.fillMaxSize()) {
                drawLine(
                    color = AccentCyan.copy(alpha = 0.9f),
                    start = Offset(dividerPx, 52.dp.toPx()),
                    end = Offset(dividerPx, size.height),
                    strokeWidth = 2.dp.toPx()
                )
            }

            // Center interactive thumb badge
            Box(
                modifier = Modifier
                    .offset {
                        IntOffset(
                            (dividerPx - 20.dp.toPx()).roundToInt(),
                            (heightPx * 0.52f - 20.dp.toPx()).roundToInt()
                        )
                    }
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(ObsidianSurface.copy(alpha = 0.92f))
                    .border(1.5.dp, AccentCyan, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Rounded.CompareArrows,
                    contentDescription = "Drag Split Divider",
                    tint = AccentCyan,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Discrete RAW / VECTOR pills near upper divider (never overlaps bottom dock)
            val showLeftBadge = dividerPx > 96f
            val showRightBadge = viewportSize.width - dividerPx > 96f
            if (showLeftBadge) {
                SplitSidePill(
                    label = "ORIGINAL",
                    tint = TextSecondary,
                    modifier = Modifier.offset {
                        IntOffset(
                            (dividerPx - 78.dp.toPx()).roundToInt().coerceAtLeast(8.dp.roundToPx()),
                            66.dp.roundToPx()
                        )
                    }
                )
            }
            if (showRightBadge) {
                SplitSidePill(
                    label = if (isWireframe) "WIRE" else "VECTOR",
                    tint = AccentCyan,
                    modifier = Modifier.offset {
                        IntOffset(
                            (dividerPx + 8.dp.toPx()).roundToInt()
                                .coerceAtMost(viewportSize.width - 72.dp.roundToPx()),
                            66.dp.roundToPx()
                        )
                    }
                )
            }
        }

        // 4. Floating Top Viewport Control Strip (ViewMode + Zoom + Wireframe toggle)
        Row(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // ViewMode Segmented Pill
            Surface(
                color = GlassPillBg,
                shape = RoundedCornerShape(50),
                border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder)
            ) {
                Row(
                    modifier = Modifier.padding(3.dp),
                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    ViewMode.entries.forEach { mode ->
                        val active = viewMode == mode
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(50))
                                .background(if (active) AccentCyanMuted else Color.Transparent)
                                .then(
                                    if (active) Modifier.border(1.dp, AccentCyan.copy(alpha = 0.65f), RoundedCornerShape(50))
                                    else Modifier
                                )
                                .clickable { onViewModeChange(mode) }
                                .padding(horizontal = 12.dp, vertical = 5.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = mode.shortLabel,
                                fontSize = 11.sp,
                                fontWeight = if (active) FontWeight.Bold else FontWeight.Medium,
                                color = if (active) AccentCyan else TextSecondary
                            )
                        }
                    }
                }
            }

            // Zoom Indicator + Tap-to-Reset Chip
            Surface(
                color = GlassPillBg,
                shape = RoundedCornerShape(50),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (zoomScale > 1.05f) AccentAmber.copy(alpha = 0.7f) else GlassBorder
                ),
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .clickable(enabled = zoomScale > 1.01f) {
                        zoomScale = 1f
                        panOffset = Offset.Zero
                    }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    if (zoomScale > 1.05f) {
                        Icon(
                            imageVector = Icons.Rounded.FitScreen,
                            contentDescription = "Reset Zoom",
                            tint = AccentAmber,
                            modifier = Modifier.size(13.dp)
                        )
                    }
                    Text(
                        text = String.format(Locale.US, "%.1fx", zoomScale),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (zoomScale > 1.05f) AccentAmber else TextSecondary
                    )
                }
            }

            // Wireframe Toggle Chip
            Surface(
                color = if (isWireframe) AccentCyanMuted else GlassPillBg,
                shape = RoundedCornerShape(50),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (isWireframe) AccentCyan else GlassBorder
                ),
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .clickable { onToggleWireframe() }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(3.dp)
                ) {
                    Icon(
                        imageVector = if (isWireframe) Icons.Rounded.Polyline else Icons.Rounded.GridOn,
                        contentDescription = "Toggle Wireframe",
                        tint = if (isWireframe) AccentCyan else TextSecondary,
                        modifier = Modifier.size(13.dp)
                    )
                }
            }
        }

        // 5. Non-blocking Tracing Progress Pill
        AnimatedVisibility(
            visible = isProcessing,
            enter = fadeIn(),
            exit = fadeOut(),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 12.dp)
        ) {
            Surface(
                color = GlassPillBg,
                shape = RoundedCornerShape(50),
                border = androidx.compose.foundation.BorderStroke(1.dp, AccentCyan.copy(alpha = 0.55f))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CircularProgressIndicator(
                        color = AccentCyan,
                        strokeWidth = 2.dp,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Tracing vector contours…",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextPrimary
                    )
                }
            }
        }
    }
}

@Composable
private fun SplitSidePill(
    label: String,
    tint: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        color = ObsidianSurface.copy(alpha = 0.80f),
        shape = RoundedCornerShape(50),
        border = androidx.compose.foundation.BorderStroke(1.dp, tint.copy(alpha = 0.4f))
    ) {
        Text(
            text = label,
            fontSize = 9.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.6.sp,
            color = tint,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}
