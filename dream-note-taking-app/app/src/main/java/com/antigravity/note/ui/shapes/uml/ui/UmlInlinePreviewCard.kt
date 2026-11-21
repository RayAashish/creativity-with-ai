package com.antigravity.note.ui.shapes.uml.ui

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.Schema
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.antigravity.note.ui.shapes.uml.model.UmlDiagram

/**
 * Embedded preview card inside the note canvas or problem description.
 * STRICT ZERO-SCROLL-HIJACKING: Single-finger dragging passes right through to the note scroll view.
 * Single-tap reveals the "Edit Diagram" chip; double-tap immediately launches the Fullscreen Editor.
 */
@Composable
fun UmlInlinePreviewCard(
    diagram: UmlDiagram,
    previewBitmap: Bitmap? = null,
    onOpenFullscreenEditor: (UmlDiagram) -> Unit,
    modifier: Modifier = Modifier
) {
    var isOverlayChipVisible by remember { mutableStateOf(false) }

    val bitmapToUse = remember(diagram, previewBitmap) {
        previewBitmap ?: try {
            UmlExporter.exportToBitmap(diagram, scale = 1.0f)
        } catch (_: Exception) { null }
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        ),
        modifier = modifier
            .fillMaxWidth()
            .height(260.dp)
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
            .pointerInput(diagram.id) {
                detectTapGestures(
                    onTap = { isOverlayChipVisible = !isOverlayChipVisible },
                    onDoubleTap = { onOpenFullscreenEditor(diagram) }
                )
            }
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            if (bitmapToUse != null) {
                Image(
                    bitmap = bitmapToUse.asImageBitmap(),
                    contentDescription = diagram.title,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(8.dp)
                        .clip(RoundedCornerShape(12.dp))
                )
            } else {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Schema, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Double-tap to open ${diagram.title}", fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            // Top-left title pill
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.88f),
                modifier = Modifier
                    .padding(10.dp)
                    .align(Alignment.TopStart)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Schema, contentDescription = null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(diagram.title, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Bottom-right Edit overlay chip
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier
                    .padding(10.dp)
                    .align(Alignment.BottomEnd)
                    .clip(RoundedCornerShape(16.dp))
                    .clickable { onOpenFullscreenEditor(diagram) }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(Icons.Default.Fullscreen, contentDescription = "Edit Fullscreen", tint = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(16.dp))
                    Text("Edit Diagram", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onPrimary)
                }
            }
        }
    }
}
