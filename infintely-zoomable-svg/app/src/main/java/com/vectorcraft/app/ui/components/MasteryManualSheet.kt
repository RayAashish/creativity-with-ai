package com.vectorcraft.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentGold
import com.vectorcraft.app.ui.theme.GlassBorder

@Composable
fun MasteryManualSheet(
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, GlassBorder, RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)),
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        color = Color(0xF20A0D14),
        shadowElevation = 24.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.MenuBook,
                        contentDescription = null,
                        tint = AccentCyan,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "MASTERY MANUAL",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        letterSpacing = 1.sp
                    )
                }

                IconButton(onClick = onClose, modifier = Modifier.size(32.dp)) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Color.LightGray
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                ManualSection(
                    title = "VECTOR GEOMETRY PRESETS",
                    accent = AccentCyan,
                    items = listOf(
                        "Spline (Smooth)" to "Fits least-squares cubic Bézier splines through detected edge contours. Best for illustrations, photos, organic shapes, and portraits.",
                        "Polygon (RDP)" to "Approximates contours using straight Douglas–Peucker line segments. Ideal for sharp architectural diagrams, logos, and geometric artwork.",
                        "Pixel Art" to "Preserves exact orthogonal pixel lattices with zero smoothing or anti-aliasing. Crucial for retro video game sprites, pixel fonts, and 8-bit icons."
                    )
                )

                ManualSection(
                    title = "ARTIFACT SUPPRESSION (LOW-RES / JPEG NOISE)",
                    accent = AccentGold,
                    items = listOf(
                        "Bilateral Filter" to "A dual-domain Gaussian filter that smooths flat regions while preserving high-contrast edge boundaries. Highly effective at erasing JPEG 8x8 block ringing and mosquito noise without dulling vector paths.",
                        "Median Blur" to "Replaces each pixel with the statistical median of its 3x3 neighborhood. Strips isolated salt-and-pepper sensor specks and isolated noisy pixels prior to tracing."
                    )
                )

                ManualSection(
                    title = "PERCEPTUAL COLOR QUANTIZATION (OKLab)",
                    accent = AccentCyan,
                    items = listOf(
                        "OKLab Color Space" to "Standard RGB distance does not match the human eye. Curvify clusters colors in OKLab perceptual color space, ensuring subtle gradients and skin tones do not suffer harsh banding when reducing to 2–64 colors.",
                        "Palette Optimization" to "Limiting palette size dramatically reduces SVG path counts and file sizes while retaining rich visual impact."
                    )
                )

                ManualSection(
                    title = "PATH SIMPLIFICATION (RDP TOLERANCE)",
                    accent = AccentGold,
                    items = listOf(
                        "RDP Threshold (0.2 – 8.0 px)" to "Controls the maximum allowable distance between the simplified vector curve and original raster pixels. Higher values yield leaner, smaller SVGs; lower values capture intricate microscopic detail."
                    )
                )

                ManualSection(
                    title = "SPECKLE SUPPRESSION",
                    accent = AccentCyan,
                    items = listOf(
                        "Area Cutoff (0 – 20 px)" to "Discards isolated stray regions smaller than the threshold. Eliminates camera sensor dust and compression artifacts from contaminating the output document."
                    )
                )
            }
        }
    }
}

@Composable
fun ManualSection(
    title: String,
    accent: Color,
    items: List<Pair<String, String>>
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0x22FFFFFF), RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        color = Color(0x22101624)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = accent,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(10.dp))

            items.forEach { (heading, body) ->
                Text(
                    text = "• $heading",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = body,
                    fontSize = 11.sp,
                    color = Color(0xFFCBD5E1),
                    lineHeight = 16.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}
