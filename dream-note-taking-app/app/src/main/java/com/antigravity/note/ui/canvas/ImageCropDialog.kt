package com.antigravity.note.ui.canvas

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.RotateRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.antigravity.note.document.model.CanvasImage
import com.antigravity.note.document.storage.ImageProcessor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import kotlin.math.hypot

enum class AspectRatioPreset(val label: String, val ratio: Float?) {
    FREE("Free", null),
    ORIGINAL("Original", -1f),
    SQUARE("1:1", 1f),
    RATIO_4_3("4:3", 4f / 3f),
    RATIO_16_9("16:9", 16f / 9f),
    RATIO_3_2("3:2", 3f / 2f)
}

enum class CropHandle {
    NONE, BODY, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, TOP, BOTTOM, LEFT, RIGHT
}

@Composable
fun ImageCropDialog(
    canvasImage: CanvasImage,
    assetsDir: File,
    onDismiss: () -> Unit,
    onCropApplied: (CanvasImage) -> Unit
) {
    val scope = rememberCoroutineScope()
    var bitmap by remember { mutableStateOf<Bitmap?>(null) }
    var rotationAngle by remember { mutableStateOf(0f) }
    var selectedPreset by remember { mutableStateOf(AspectRatioPreset.FREE) }

    // Normalized crop box: [0f..1f]
    var cropLeft by remember { mutableStateOf(0f) }
    var cropTop by remember { mutableStateOf(0f) }
    var cropRight by remember { mutableStateOf(1f) }
    var cropBottom by remember { mutableStateOf(1f) }

    var isProcessing by remember { mutableStateOf(false) }

    // Load original bitmap
    LaunchedEffect(canvasImage.assetRef) {
        withContext(Dispatchers.IO) {
            val file = File(assetsDir, canvasImage.assetRef)
            if (file.exists()) {
                bitmap = BitmapFactory.decodeFile(file.absolutePath)
            }
        }
    }

    val workingBitmap = remember(bitmap, rotationAngle) {
        val src = bitmap ?: return@remember null
        if (rotationAngle == 0f) src
        else {
            val matrix = android.graphics.Matrix().apply { postRotate(rotationAngle) }
            Bitmap.createBitmap(src, 0, 0, src.width, src.height, matrix, true)
        }
    }

    fun applyPreset(preset: AspectRatioPreset) {
        selectedPreset = preset
        val bmp = workingBitmap ?: return
        val targetRatio = when (preset) {
            AspectRatioPreset.FREE -> return
            AspectRatioPreset.ORIGINAL -> {
                val orig = bitmap ?: bmp
                orig.width.toFloat() / orig.height.toFloat()
            }
            else -> preset.ratio ?: 1f
        }
        val currentBmpRatio = bmp.width.toFloat() / bmp.height.toFloat()
        if (targetRatio > currentBmpRatio) {
            // Target is wider: fit width, shrink height
            cropLeft = 0f
            cropRight = 1f
            val normHeight = (currentBmpRatio / targetRatio).coerceIn(0.08f, 1f)
            cropTop = (1f - normHeight) / 2f
            cropBottom = cropTop + normHeight
        } else {
            // Target is taller: fit height, shrink width
            cropTop = 0f
            cropBottom = 1f
            val normWidth = (targetRatio / currentBmpRatio).coerceIn(0.08f, 1f)
            cropLeft = (1f - normWidth) / 2f
            cropRight = cropLeft + normWidth
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFF141414)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .systemBarsPadding()
            ) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                        }
                        Text(
                            text = "Crop & Rotate Image",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        IconButton(onClick = {
                            cropLeft = 0f
                            cropTop = 0f
                            cropRight = 1f
                            cropBottom = 1f
                            rotationAngle = 0f
                            selectedPreset = AspectRatioPreset.FREE
                        }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Reset Crop", tint = Color.LightGray)
                        }
                        IconButton(onClick = {
                            rotationAngle = (rotationAngle + 90f) % 360f
                            cropLeft = 0f
                            cropTop = 0f
                            cropRight = 1f
                            cropBottom = 1f
                            selectedPreset = AspectRatioPreset.FREE
                        }) {
                            Icon(Icons.Default.RotateRight, contentDescription = "Rotate 90", tint = Color.LightGray)
                        }
                        Button(
                            onClick = {
                                if (isProcessing) return@Button
                                isProcessing = true
                                scope.launch {
                                    val result = ImageProcessor.cropAndStoreImage(
                                        assetsDir = assetsDir,
                                        sourceAssetRef = canvasImage.assetRef,
                                        cropNormLeft = cropLeft,
                                        cropNormTop = cropTop,
                                        cropNormRight = cropRight,
                                        cropNormBottom = cropBottom,
                                        rotationDegrees = rotationAngle
                                    )
                                    if (result != null) {
                                        val newAssetRef = result.first
                                        val newW = result.second.first
                                        val newH = result.second.second
                                        val cropAspect = if (newW > 0) newH / newW else 1f
                                        val updated = canvasImage.copy(
                                            assetRef = newAssetRef,
                                            width = canvasImage.width,
                                            height = canvasImage.width * cropAspect,
                                            rotation = 0f
                                        )
                                        onCropApplied(updated)
                                    } else {
                                        onDismiss()
                                    }
                                    isProcessing = false
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            if (isProcessing) {
                                CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Color.White, strokeWidth = 2.dp)
                            } else {
                                Text("Apply Crop", fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }

                // Center Crop Canvas
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(horizontal = 36.dp, vertical = 16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    val currentBmp = workingBitmap
                    if (currentBmp != null) {
                        var containerSize by remember { mutableStateOf(IntSize.Zero) }

                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .onGloballyPositioned { containerSize = it.size },
                            contentAlignment = Alignment.Center
                        ) {
                            if (containerSize.width > 0 && containerSize.height > 0) {
                                val density = androidx.compose.ui.platform.LocalDensity.current.density
                                val bmpW = currentBmp.width.toFloat()
                                val bmpH = currentBmp.height.toFloat()
                                val scale = minOf(
                                    containerSize.width.toFloat() / bmpW,
                                    containerSize.height.toFloat() / bmpH
                                )
                                val previewW = bmpW * scale
                                val previewH = bmpH * scale

                                var activeHandle by remember { mutableStateOf(CropHandle.NONE) }
                                var dragStartLeft by remember { mutableStateOf(0f) }
                                var dragStartTop by remember { mutableStateOf(0f) }
                                var dragStartRight by remember { mutableStateOf(0f) }
                                var dragStartBottom by remember { mutableStateOf(0f) }

                                val imageBitmap = remember(currentBmp) { currentBmp.asImageBitmap() }

                                Canvas(
                                    modifier = Modifier
                                        .size(
                                            width = (previewW / density).dp,
                                            height = (previewH / density).dp
                                        )
                                        .pointerInput(previewW, previewH) {
                                            detectDragGestures(
                                                onDragStart = { offset ->
                                                    val normX = (offset.x / previewW).coerceIn(0f, 1f)
                                                    val normY = (offset.y / previewH).coerceIn(0f, 1f)
                                                    dragStartLeft = cropLeft
                                                    dragStartTop = cropTop
                                                    dragStartRight = cropRight
                                                    dragStartBottom = cropBottom

                                                    val touchRadiusPx = 48f * density
                                                    val hr = touchRadiusPx / previewW
                                                    val vr = touchRadiusPx / previewH

                                                    activeHandle = when {
                                                        hypot((normX - cropLeft) / hr, (normY - cropTop) / vr) <= 1.5f -> CropHandle.TOP_LEFT
                                                        hypot((normX - cropRight) / hr, (normY - cropTop) / vr) <= 1.5f -> CropHandle.TOP_RIGHT
                                                        hypot((normX - cropLeft) / hr, (normY - cropBottom) / vr) <= 1.5f -> CropHandle.BOTTOM_LEFT
                                                        hypot((normX - cropRight) / hr, (normY - cropBottom) / vr) <= 1.5f -> CropHandle.BOTTOM_RIGHT
                                                        kotlin.math.abs(normY - cropTop) <= vr && normX in cropLeft..cropRight -> CropHandle.TOP
                                                        kotlin.math.abs(normY - cropBottom) <= vr && normX in cropLeft..cropRight -> CropHandle.BOTTOM
                                                        kotlin.math.abs(normX - cropLeft) <= hr && normY in cropTop..cropBottom -> CropHandle.LEFT
                                                        kotlin.math.abs(normX - cropRight) <= hr && normY in cropTop..cropBottom -> CropHandle.RIGHT
                                                        normX in cropLeft..cropRight && normY in cropTop..cropBottom -> CropHandle.BODY
                                                        else -> CropHandle.NONE
                                                    }
                                                },
                                                onDrag = { change, dragAmount ->
                                                    change.consume()
                                                    val deltaX = dragAmount.x / previewW
                                                    val deltaY = dragAmount.y / previewH
                                                    val minNorm = 0.08f

                                                    when (activeHandle) {
                                                        CropHandle.BODY -> {
                                                            val width = dragStartRight - dragStartLeft
                                                            val height = dragStartBottom - dragStartTop
                                                            val newLeft = (cropLeft + deltaX).coerceIn(0f, 1f - width)
                                                            val newTop = (cropTop + deltaY).coerceIn(0f, 1f - height)
                                                            cropLeft = newLeft
                                                            cropTop = newTop
                                                            cropRight = newLeft + width
                                                            cropBottom = newTop + height
                                                        }
                                                        CropHandle.TOP_LEFT -> {
                                                            cropLeft = (cropLeft + deltaX).coerceIn(0f, cropRight - minNorm)
                                                            cropTop = (cropTop + deltaY).coerceIn(0f, cropBottom - minNorm)
                                                        }
                                                        CropHandle.TOP_RIGHT -> {
                                                            cropRight = (cropRight + deltaX).coerceIn(cropLeft + minNorm, 1f)
                                                            cropTop = (cropTop + deltaY).coerceIn(0f, cropBottom - minNorm)
                                                        }
                                                        CropHandle.BOTTOM_LEFT -> {
                                                            cropLeft = (cropLeft + deltaX).coerceIn(0f, cropRight - minNorm)
                                                            cropBottom = (cropBottom + deltaY).coerceIn(cropTop + minNorm, 1f)
                                                        }
                                                        CropHandle.BOTTOM_RIGHT -> {
                                                            cropRight = (cropRight + deltaX).coerceIn(cropLeft + minNorm, 1f)
                                                            cropBottom = (cropBottom + deltaY).coerceIn(cropTop + minNorm, 1f)
                                                        }
                                                        CropHandle.TOP -> {
                                                            cropTop = (cropTop + deltaY).coerceIn(0f, cropBottom - minNorm)
                                                        }
                                                        CropHandle.BOTTOM -> {
                                                            cropBottom = (cropBottom + deltaY).coerceIn(cropTop + minNorm, 1f)
                                                        }
                                                        CropHandle.LEFT -> {
                                                            cropLeft = (cropLeft + deltaX).coerceIn(0f, cropRight - minNorm)
                                                        }
                                                        CropHandle.RIGHT -> {
                                                            cropRight = (cropRight + deltaX).coerceIn(cropLeft + minNorm, 1f)
                                                        }
                                                        CropHandle.NONE -> {}
                                                    }
                                                },
                                                onDragEnd = {
                                                    activeHandle = CropHandle.NONE
                                                }
                                            )
                                        }
                                ) {
                                    // 1. Draw source image
                                    drawImage(
                                        image = imageBitmap,
                                        dstSize = IntSize(previewW.toInt(), previewH.toInt())
                                    )

                                    val cLeft = cropLeft * previewW
                                    val cTop = cropTop * previewH
                                    val cRight = cropRight * previewW
                                    val cBottom = cropBottom * previewH
                                    val cWidth = cRight - cLeft
                                    val cHeight = cBottom - cTop

                                    // 2. Dimmed overlay outside crop box
                                    val darkTint = Color.Black.copy(alpha = 0.65f)
                                    // Top rect
                                    drawRect(darkTint, Offset(0f, 0f), Size(previewW, cTop))
                                    // Bottom rect
                                    drawRect(darkTint, Offset(0f, cBottom), Size(previewW, previewH - cBottom))
                                    // Left rect
                                    drawRect(darkTint, Offset(0f, cTop), Size(cLeft, cHeight))
                                    // Right rect
                                    drawRect(darkTint, Offset(cRight, cTop), Size(previewW - cRight, cHeight))

                                    // 3. Crop border
                                    drawRect(
                                        color = Color.White,
                                        topLeft = Offset(cLeft, cTop),
                                        size = Size(cWidth, cHeight),
                                        style = Stroke(width = 2.dp.toPx())
                                    )

                                    // 4. Rule-of-thirds grid lines
                                    val gridColor = Color.White.copy(alpha = 0.35f)
                                    val gridStroke = Stroke(width = 1.dp.toPx())
                                    drawLine(gridColor, Offset(cLeft + cWidth / 3f, cTop), Offset(cLeft + cWidth / 3f, cBottom), strokeWidth = gridStroke.width)
                                    drawLine(gridColor, Offset(cLeft + 2 * cWidth / 3f, cTop), Offset(cLeft + 2 * cWidth / 3f, cBottom), strokeWidth = gridStroke.width)
                                    drawLine(gridColor, Offset(cLeft, cTop + cHeight / 3f), Offset(cRight, cTop + cHeight / 3f), strokeWidth = gridStroke.width)
                                    drawLine(gridColor, Offset(cLeft, cTop + 2 * cHeight / 3f), Offset(cRight, cTop + 2 * cHeight / 3f), strokeWidth = gridStroke.width)

                                    // 5. Corner brackets (L-shapes)
                                    val cornerLen = 22.dp.toPx()
                                    val cornerStroke = 4.dp.toPx()
                                    val cornerColor = Color.White
                                    // TL
                                    drawLine(cornerColor, Offset(cLeft, cTop), Offset(cLeft + cornerLen, cTop), strokeWidth = cornerStroke)
                                    drawLine(cornerColor, Offset(cLeft, cTop), Offset(cLeft, cTop + cornerLen), strokeWidth = cornerStroke)
                                    // TR
                                    drawLine(cornerColor, Offset(cRight, cTop), Offset(cRight - cornerLen, cTop), strokeWidth = cornerStroke)
                                    drawLine(cornerColor, Offset(cRight, cTop), Offset(cRight, cTop + cornerLen), strokeWidth = cornerStroke)
                                    // BL
                                    drawLine(cornerColor, Offset(cLeft, cBottom), Offset(cLeft + cornerLen, cBottom), strokeWidth = cornerStroke)
                                    drawLine(cornerColor, Offset(cLeft, cBottom), Offset(cLeft, cBottom - cornerLen), strokeWidth = cornerStroke)
                                    // BR
                                    drawLine(cornerColor, Offset(cRight, cBottom), Offset(cRight - cornerLen, cBottom), strokeWidth = cornerStroke)
                                    drawLine(cornerColor, Offset(cRight, cBottom), Offset(cRight, cBottom - cornerLen), strokeWidth = cornerStroke)

                                    // 6. Handle indicators (4 corners + 4 edge midpoints)
                                    val handleDotRadius = 6.dp.toPx()
                                    val handleBorder = 2.dp.toPx()
                                    val handleFill = Color(0xFF2196F3)
                                    // Corners
                                    listOf(
                                        Offset(cLeft, cTop),
                                        Offset(cRight, cTop),
                                        Offset(cLeft, cBottom),
                                        Offset(cRight, cBottom)
                                    ).forEach { pt ->
                                        drawCircle(Color.White, radius = handleDotRadius + handleBorder, center = pt)
                                        drawCircle(handleFill, radius = handleDotRadius, center = pt)
                                    }
                                    // Edge midpoints
                                    listOf(
                                        Offset(cLeft + cWidth / 2f, cTop),
                                        Offset(cLeft + cWidth / 2f, cBottom),
                                        Offset(cLeft, cTop + cHeight / 2f),
                                        Offset(cRight, cTop + cHeight / 2f)
                                    ).forEach { pt ->
                                        drawCircle(Color.White, radius = handleDotRadius - 1.dp.toPx() + handleBorder, center = pt)
                                        drawCircle(Color.White, radius = handleDotRadius - 1.dp.toPx(), center = pt)
                                    }
                                }
                            }
                        }
                    } else {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                    }
                }

                // Bottom Aspect Ratio Presets Row
                Surface(
                    color = Color(0xFF1E1E1E),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 28.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Aspect Ratio:",
                            style = MaterialTheme.typography.labelMedium,
                            color = Color.LightGray,
                            modifier = Modifier.padding(end = 4.dp)
                        )
                        AspectRatioPreset.entries.forEach { preset ->
                            FilterChip(
                                selected = selectedPreset == preset,
                                onClick = { applyPreset(preset) },
                                label = { Text(preset.label) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                    selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer,
                                    containerColor = Color(0xFF2C2C2C),
                                    labelColor = Color.White
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}
