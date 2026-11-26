package com.vectorcraft.app.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Code
import androidx.compose.material.icons.rounded.ContentCopy
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Polyline
import androidx.compose.material.icons.rounded.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vectorcraft.app.VectorStats
import com.vectorcraft.app.ui.theme.AccentAmber
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentEmerald
import com.vectorcraft.app.ui.theme.AccentIndigo
import com.vectorcraft.app.ui.theme.GlassBorder
import com.vectorcraft.app.ui.theme.ObsidianBg
import com.vectorcraft.app.ui.theme.ObsidianCard
import com.vectorcraft.app.ui.theme.ObsidianSurface
import com.vectorcraft.app.ui.theme.TextPrimary
import com.vectorcraft.app.ui.theme.TextSecondary
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SvgStudioSheet(
    svgContent: String?,
    stats: VectorStats,
    isWireframe: Boolean,
    onToggleWireframe: () -> Unit,
    onSaveToDownloads: () -> Unit,
    onShareSvg: () -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val previewCode = remember(svgContent) {
        if (svgContent == null) "// Generating SVG..."
        else if (svgContent.length > 3500) {
            svgContent.substring(0, 3500) + "\n\n... (${svgContent.length / 1024} KB total SVG source)"
        } else svgContent
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = ObsidianSurface,
        contentColor = TextPrimary
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .navigationBarsPadding()
                .padding(bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Rounded.Code, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(20.dp))
                Text("SVG Vector Inspector", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            }

            // Telemetry Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricTile("PATHS", stats.pathCount.toString(), AccentCyan, Modifier.weight(1f))
                MetricTile("GRADIENTS", stats.gradientCount.toString(), AccentAmber, Modifier.weight(1f))
                MetricTile("TIME", "${stats.durationMs}ms", AccentEmerald, Modifier.weight(1f))
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricTile("DIMENSIONS", "${stats.viewBoxWidth}×${stats.viewBoxHeight}", AccentIndigo, Modifier.weight(1f))
                MetricTile("NODES", "~${stats.nodeCount}", TextPrimary, Modifier.weight(1f))
                val sizeLabel = if (stats.svgSizeBytes >= 1024 * 1024) {
                    String.format(Locale.US, "%.2f MB", stats.svgSizeBytes / (1024f * 1024f))
                } else {
                    String.format(Locale.US, "%.1f KB", stats.svgSizeBytes / 1024f)
                }
                MetricTile("SIZE", sizeLabel, AccentCyan, Modifier.weight(1f))
            }

            // Wireframe Toggle
            Surface(
                color = ObsidianCard,
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Rounded.Polyline, contentDescription = null, tint = AccentCyan)
                        Column {
                            Text("Wireframe Skeleton", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                            Text("Strip gradient fills to inspect curve topology", fontSize = 11.sp, color = TextSecondary)
                        }
                    }
                    Switch(
                        checked = isWireframe,
                        onCheckedChange = { onToggleWireframe() },
                        colors = SwitchDefaults.colors(checkedThumbColor = ObsidianBg, checkedTrackColor = AccentCyan)
                    )
                }
            }

            // Source Snippet Viewer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("W3C SVG 1.1 MARKUP", fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.8.sp, color = AccentCyan)
                if (!svgContent.isNullOrEmpty()) {
                    OutlinedButton(
                        onClick = {
                            val cb = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            cb.setPrimaryClip(ClipData.newPlainText("VectorForge SVG", svgContent))
                            Toast.makeText(context, "SVG markup copied to clipboard", Toast.LENGTH_SHORT).show()
                        },
                        border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder),
                        modifier = Modifier.height(30.dp),
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp, vertical = 0.dp)
                    ) {
                        Icon(Icons.Rounded.ContentCopy, null, tint = AccentCyan, modifier = Modifier.size(13.dp))
                        Spacer(modifier = Modifier.width(5.dp))
                        Text("Copy", fontSize = 11.sp, color = AccentCyan)
                    }
                }
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(170.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(ObsidianBg)
                    .border(1.dp, GlassBorder, RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Text(
                    text = previewCode,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    lineHeight = 14.sp,
                    color = AccentCyan.copy(alpha = 0.9f),
                    modifier = Modifier
                        .verticalScroll(rememberScrollState())
                        .horizontalScroll(rememberScrollState())
                )
            }

            // Export Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onSaveToDownloads,
                    enabled = !svgContent.isNullOrEmpty(),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentCyan, contentColor = ObsidianBg),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Rounded.Download, null, modifier = Modifier.size(17.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Save to Downloads", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
                OutlinedButton(
                    onClick = onShareSvg,
                    enabled = !svgContent.isNullOrEmpty(),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AccentCyan.copy(alpha = 0.6f)),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Rounded.Share, null, tint = AccentCyan, modifier = Modifier.size(17.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Share SVG", color = AccentCyan, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
private fun MetricTile(label: String, value: String, tint: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        color = ObsidianCard,
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 9.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(label, fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.6.sp, color = TextSecondary)
            Text(value, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = tint, maxLines = 1)
        }
    }
}
