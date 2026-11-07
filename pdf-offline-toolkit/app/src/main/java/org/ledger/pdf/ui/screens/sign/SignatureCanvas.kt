package org.ledger.pdf.ui.screens.sign

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path as AndroidPath
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import org.ledger.pdf.ui.components.LedgerButton
import org.ledger.pdf.ui.components.LedgerButtonStyle
import org.ledger.pdf.ui.theme.LedgerTheme
import org.ledger.pdf.ui.theme.rememberLedgerHaptics

data class SignatureStroke(
    val path: Path,
    val color: Color,
    val strokeWidth: Float
)

@Composable
fun SignatureCanvas(
    onSignatureCaptured: (Bitmap) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LedgerTheme.colors
    val typography = LedgerTheme.typography
    val spacing = LedgerTheme.spacing
    val haptics = rememberLedgerHaptics()

    val strokes = remember { mutableStateListOf<SignatureStroke>() }
    val currentPath = remember { mutableStateListOf<Offset>() }

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(spacing.m)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp)
                .clip(RoundedCornerShape(spacing.cornerSmall))
                .background(Color.White)
                .border(spacing.borderWidthThin, colors.borderFocus, RoundedCornerShape(spacing.cornerSmall))
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { offset ->
                            haptics.tick()
                            currentPath.clear()
                            currentPath.add(offset)
                        },
                        onDrag = { change, _ ->
                            change.consume()
                            currentPath.add(change.position)
                        },
                        onDragEnd = {
                            if (currentPath.size > 1) {
                                val p = Path()
                                p.moveTo(currentPath[0].x, currentPath[0].y)
                                for (i in 1 until currentPath.size) {
                                    val prev = currentPath[i - 1]
                                    val curr = currentPath[i]
                                    p.quadraticBezierTo(
                                        prev.x,
                                        prev.y,
                                        (prev.x + curr.x) / 2f,
                                        (prev.y + curr.y) / 2f
                                    )
                                }
                                strokes.add(SignatureStroke(p, Color(0xFF171717), 4.5f))
                            }
                            currentPath.clear()
                        }
                    )
                }
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                // Baseline guide
                drawLine(
                    color = Color.LightGray,
                    start = Offset(40f, size.height * 0.75f),
                    end = Offset(size.width - 40f, size.height * 0.75f),
                    strokeWidth = 2f
                )

                // Drawn strokes
                for (stroke in strokes) {
                    drawPath(
                        path = stroke.path,
                        color = stroke.color,
                        style = Stroke(
                            width = stroke.strokeWidth,
                            cap = StrokeCap.Round,
                            join = StrokeJoin.Round
                        )
                    )
                }

                // Currently in-flight stroke
                if (currentPath.size > 1) {
                    val p = Path()
                    p.moveTo(currentPath[0].x, currentPath[0].y)
                    for (i in 1 until currentPath.size) {
                        val prev = currentPath[i - 1]
                        val curr = currentPath[i]
                        p.quadraticBezierTo(
                            prev.x,
                            prev.y,
                            (prev.x + curr.x) / 2f,
                            (prev.y + curr.y) / 2f
                        )
                    }
                    drawPath(
                        path = p,
                        color = Color(0xFF171717),
                        style = Stroke(
                            width = 4.5f,
                            cap = StrokeCap.Round,
                            join = StrokeJoin.Round
                        )
                    )
                }
            }

            if (strokes.isEmpty() && currentPath.isEmpty()) {
                Text(
                    text = "Sign with finger or stylus here",
                    style = typography.monoLabel,
                    color = Color.Gray,
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(spacing.m)
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(spacing.s)) {
                LedgerButton(
                    text = "Undo",
                    icon = Icons.Default.Undo,
                    style = LedgerButtonStyle.OUTLINE,
                    enabled = strokes.isNotEmpty(),
                    onClick = {
                        if (strokes.isNotEmpty()) {
                            strokes.removeAt(strokes.size - 1)
                        }
                    }
                )
                LedgerButton(
                    text = "Clear",
                    icon = Icons.Default.Clear,
                    style = LedgerButtonStyle.GHOST,
                    enabled = strokes.isNotEmpty(),
                    onClick = { strokes.clear() }
                )
            }

            LedgerButton(
                text = "Apply Signature",
                enabled = strokes.isNotEmpty(),
                onClick = {
                    val bmp = renderStrokesToBitmap(strokes, 600, 300)
                    onSignatureCaptured(bmp)
                }
            )
        }
    }
}

fun renderStrokesToBitmap(strokes: List<SignatureStroke>, width: Int, height: Int): Bitmap {
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    val paint = Paint().apply {
        isAntiAlias = true
        color = android.graphics.Color.BLACK
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    for (stroke in strokes) {
        paint.strokeWidth = stroke.strokeWidth * 1.5f
        canvas.drawPath(stroke.path.asAndroidPath(), paint)
    }

    return bitmap
}
