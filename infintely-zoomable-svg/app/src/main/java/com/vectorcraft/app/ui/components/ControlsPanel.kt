package com.vectorcraft.app.ui.components

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vectorcraft.app.engine.FilterMode
import com.vectorcraft.app.engine.FitMode
import com.vectorcraft.app.engine.VectorizationConfig
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentGold
import com.vectorcraft.app.ui.theme.GlassBorder
import com.vectorcraft.app.ui.theme.GlassBorderSubtle
import com.vectorcraft.app.ui.theme.GlassFrostedHigh
import com.vectorcraft.app.ui.theme.GlassFrostedLow

@Composable
fun ControlsPanel(
    config: VectorizationConfig,
    onConfigChange: (VectorizationConfig) -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(
                Brush.verticalGradient(listOf(Color(0xFA0E1524), Color(0xFC0A0D14)))
            )
            .border(1.dp, GlassBorder, RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
            .padding(18.dp)
            .verticalScroll(scrollState)
    ) {
        // Quick Presets Row
        Text(
            text = "EXPRESS PRESETS",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = AccentCyan,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            PresetChip(
                selected = config.fitMode == FitMode.SPLINE && config.colorQuantizeK == 0 && config.filterMode == FilterMode.NONE,
                onClick = {
                    onConfigChange(
                        config.copy(
                            fitMode = FitMode.SPLINE,
                            filterMode = FilterMode.NONE,
                            colorQuantizeK = 0,
                            simplifyTolerance = 0.8f,
                            filterSpeckle = 2
                        )
                    )
                },
                label = "👤 Portrait / Photo"
            )

            PresetChip(
                selected = config.fitMode == FitMode.PIXEL_ART,
                onClick = {
                    onConfigChange(
                        config.copy(
                            fitMode = FitMode.PIXEL_ART,
                            filterMode = FilterMode.NONE,
                            colorQuantizeK = 0,
                            filterSpeckle = 0
                        )
                    )
                },
                label = "👾 Pixel Art"
            )

            PresetChip(
                selected = config.fitMode == FitMode.SPLINE && config.colorQuantizeK == 0 && config.filterMode == FilterMode.NONE,
                onClick = {
                    onConfigChange(
                        config.copy(
                            fitMode = FitMode.SPLINE,
                            filterMode = FilterMode.NONE,
                            filterStrength = 1.0f,
                            colorQuantizeK = 0,
                            simplifyTolerance = 1.0f,
                            filterSpeckle = 3
                        )
                    )
                },
                label = "✨ High Fidelity"
            )

            PresetChip(
                selected = config.colorQuantizeK in 8..16,
                onClick = {
                    onConfigChange(
                        config.copy(
                            fitMode = FitMode.SPLINE,
                            filterMode = FilterMode.NONE,
                            colorQuantizeK = 16,
                            simplifyTolerance = 1.8f,
                            filterSpeckle = 6
                        )
                    )
                },
                label = "🎨 Poster Art"
            )

            PresetChip(
                selected = config.fitMode == FitMode.POLYGON,
                onClick = {
                    onConfigChange(
                        config.copy(
                            fitMode = FitMode.POLYGON,
                            filterMode = FilterMode.NONE,
                            colorQuantizeK = 0,
                            simplifyTolerance = 3.0f,
                            filterSpeckle = 6
                        )
                    )
                },
                label = "📐 Low Poly"
            )
        }


        Spacer(modifier = Modifier.height(18.dp))

        // Fit Mode Tabs
        Text(
            text = "VECTORIZATION GEOMETRY",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = AccentCyan,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        TabRow(
            selectedTabIndex = config.fitMode.id,
            containerColor = Color(0x33101624),
            contentColor = Color.White,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    Modifier.tabIndicatorOffset(tabPositions[config.fitMode.id]),
                    color = AccentCyan
                )
            }
        ) {
            FitMode.values().forEach { mode ->
                Tab(
                    selected = config.fitMode == mode,
                    onClick = { onConfigChange(config.copy(fitMode = mode)) },
                    text = {
                        Text(
                            text = mode.displayName,
                            fontSize = 12.sp,
                            fontWeight = if (config.fitMode == mode) FontWeight.Bold else FontWeight.Normal,
                            color = if (config.fitMode == mode) Color.White else Color.Gray
                        )
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Artifact Suppression (Bilateral / Median blur)
        Text(
            text = "ARTIFACT SUPPRESSION (LOW-RES / JPEG NOISE)",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = AccentCyan,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterMode.values().forEach { mode ->
                FilterChip(
                    selected = config.filterMode == mode,
                    onClick = { onConfigChange(config.copy(filterMode = mode)) },
                    label = { Text(mode.displayName, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AccentCyan,
                        selectedLabelColor = Color.Black
                    )
                )
            }
        }

        if (config.filterMode != FilterMode.NONE) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Filter Strength", fontSize = 12.sp, color = Color.LightGray)
                Text(
                    String.format("%.1fx", config.filterStrength),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = AccentCyan
                )
            }
            Slider(
                value = config.filterStrength,
                onValueChange = { onConfigChange(config.copy(filterStrength = it)) },
                valueRange = 1.0f..5.0f,
                steps = 7,
                colors = SliderDefaults.colors(
                    thumbColor = AccentCyan,
                    activeTrackColor = AccentCyan
                )
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Color Quantization (OKLab)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "PERCEPTUAL COLOR QUANTIZATION (OKLab)",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = AccentCyan,
                letterSpacing = 1.sp
            )
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (config.colorQuantizeK == 0) Color(0x33FFFFFF) else AccentGold
            ) {
                Text(
                    text = if (config.colorQuantizeK == 0) "Full Color" else "${config.colorQuantizeK} Colors",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (config.colorQuantizeK == 0) Color.White else Color.Black,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(4.dp))
        Slider(
            value = config.colorQuantizeK.toFloat(),
            onValueChange = {
                val k = it.toInt()
                onConfigChange(config.copy(colorQuantizeK = if (k < 2) 0 else k))
            },
            valueRange = 0f..64f,
            steps = 63,
            colors = SliderDefaults.colors(
                thumbColor = AccentGold,
                activeTrackColor = AccentGold
            )
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Path Simplification (Ramer–Douglas–Peucker tolerance)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "PATH SIMPLIFICATION (RDP)",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = AccentCyan,
                letterSpacing = 1.sp
            )
            Text(
                text = "${String.format("%.1f", config.simplifyTolerance)} px",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
        Slider(
            value = config.simplifyTolerance,
            onValueChange = { onConfigChange(config.copy(simplifyTolerance = it)) },
            valueRange = 0.2f..8.0f,
            steps = 38,
            colors = SliderDefaults.colors(
                thumbColor = AccentCyan,
                activeTrackColor = AccentCyan
            )
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Speckle Filter
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "SPECKLE SUPPRESSION",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = AccentCyan,
                letterSpacing = 1.sp
            )
            Text(
                text = "${config.filterSpeckle} px",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
        Slider(
            value = config.filterSpeckle.toFloat(),
            onValueChange = { onConfigChange(config.copy(filterSpeckle = it.toInt())) },
            valueRange = 0f..20f,
            steps = 20,
            colors = SliderDefaults.colors(
                thumbColor = AccentCyan,
                activeTrackColor = AccentCyan
            )
        )
    }
}

@Composable
fun PresetChip(
    selected: Boolean,
    onClick: () -> Unit,
    label: String
) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(label, fontSize = 12.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal) },
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = AccentCyan,
            selectedLabelColor = Color.Black,
            containerColor = Color(0x33101624),
            labelColor = Color.LightGray
        ),
        border = FilterChipDefaults.filterChipBorder(
            enabled = true,
            selected = selected,
            borderColor = if (selected) AccentCyan else Color(0x22FFFFFF)
        )
    )
}
