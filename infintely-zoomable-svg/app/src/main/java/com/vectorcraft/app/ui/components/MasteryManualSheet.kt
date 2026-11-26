package com.vectorcraft.app.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AutoFixHigh
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Gesture
import androidx.compose.material.icons.rounded.Speed
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vectorcraft.app.ui.theme.AccentAmber
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentEmerald
import com.vectorcraft.app.ui.theme.AccentIndigo
import com.vectorcraft.app.ui.theme.GlassBorder
import com.vectorcraft.app.ui.theme.ObsidianCard
import com.vectorcraft.app.ui.theme.ObsidianSurface
import com.vectorcraft.app.ui.theme.TextPrimary
import com.vectorcraft.app.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MasteryManualSheet(
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

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
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "VectorForge v4 Studio Guide",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "100% offline Rust engine compiled directly for ARM64 & x86_64 devices.",
                fontSize = 12.sp,
                color = TextSecondary
            )

            GuideCard(
                icon = Icons.Rounded.AutoFixHigh,
                accent = AccentCyan,
                title = "Neural-Gradient Mosaic (Photo HD)",
                body = "Instead of posterizing photos into coarse muddy bands, VectorForge builds a luminance-weighted perceptual watershed graph, extracts watertight topological boundaries across all CPU cores, fits tight cubic Béziers, and solves clamped 2D linear gradients per region."
            )
            GuideCard(
                icon = Icons.Rounded.Gesture,
                accent = AccentAmber,
                title = "50× Focal Zoom & Split Inspection",
                body = "• Drag the center split handle left/right to compare Original pixels against Vector geometry.\n• Two-finger pinch zooms centered cleanly beneath your fingers up to 50× with live Skia curve tessellation.\n• Double-tap any feature to inspect at 4×, or double-tap again to fit screen."
            )
            GuideCard(
                icon = Icons.Rounded.Speed,
                accent = AccentEmerald,
                title = "Engine Presets",
                body = "• Photo HD: Cubic Béziers + Clamped Linear Gradients (best for portraits & photography).\n• Flat Vector: Solid-fill watertight Béziers (great for illustrations & editorial art).\n• Polygon: Sharp Douglas–Peucker faceted planes (logos & geometric graphics).\n• Pixel Art: Unsmoothed pixel-lattice boundaries for sprites."
            )
            GuideCard(
                icon = Icons.Rounded.Download,
                accent = AccentIndigo,
                title = "Direct Scoped Storage SVG Export",
                body = "Tap Save to write standard W3C SVG 1.1 files directly into Downloads/VectorForge/ ready for Figma, Illustrator, Affinity, Inkscape, or web browsers."
            )
        }
    }
}

@Composable
private fun GuideCard(
    icon: ImageVector,
    accent: Color,
    title: String,
    body: String
) {
    Surface(
        color = ObsidianCard,
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(icon, contentDescription = null, tint = accent, modifier = Modifier.size(18.dp))
                Text(title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = accent)
            }
            Text(body, fontSize = 12.sp, color = TextSecondary, lineHeight = 17.sp)
        }
    }
}
