package com.vectorcraft.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vectorcraft.app.engine.FilterMode
import com.vectorcraft.app.engine.FitMode
import com.vectorcraft.app.engine.VectorizationConfig
import com.vectorcraft.app.ui.theme.AccentAmber
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentCyanMuted
import com.vectorcraft.app.ui.theme.GlassBorder
import com.vectorcraft.app.ui.theme.ObsidianCard
import com.vectorcraft.app.ui.theme.ObsidianSurface
import com.vectorcraft.app.ui.theme.TextPrimary
import com.vectorcraft.app.ui.theme.TextSecondary
import java.util.Locale
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ControlsPanel(
    config: VectorizationConfig,
    onConfigChange: (VectorizationConfig) -> Unit,
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Engine Tuning",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = config.fitMode.description,
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
                TextButton(
                    onClick = { onConfigChange(VectorizationConfig()) }
                ) {
                    Text("Reset HD", color = AccentCyan, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                }
            }

            // 1. Tracing Engine Mode
            SectionLabel("TRACING GEOMETRY")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FitMode.entries.forEach { mode ->
                    val active = config.fitMode == mode
                    ChoicePill(
                        label = mode.displayName,
                        selected = active,
                        onClick = {
                            val nextGradient = when (mode) {
                                FitMode.SPLINE -> config.gradientShading
                                FitMode.POLYGON -> false
                                FitMode.PIXEL_ART -> false
                            }
                            onConfigChange(config.copy(fitMode = mode, gradientShading = nextGradient))
                        },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // 2. Gradient Shading Toggle (for Spline / Polygon mosaic)
            if (config.fitMode != FitMode.PIXEL_ART) {
                Surface(
                    color = ObsidianCard,
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Clamped Linear Gradient Shading",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                            Text(
                                text = if (config.colorQuantizeK > 0) "Disabled when a flat OKLab palette is active"
                                else "Eliminates poster bands across skin tones, sky & lighting",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                        Switch(
                            checked = config.gradientShading && config.colorQuantizeK == 0,
                            enabled = config.colorQuantizeK == 0,
                            onCheckedChange = { checked ->
                                onConfigChange(config.copy(gradientShading = checked))
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = ObsidianSurface,
                                checkedTrackColor = AccentCyan
                            )
                        )
                    }
                }
            }

            if (config.fitMode != FitMode.PIXEL_ART) {
                HorizontalDivider(color = GlassBorder)

                // 3. Detail Fidelity & Optical Sharpen
                SliderControl(
                    title = "Micro-Detail Fidelity",
                    valueText = "${(config.detailLevel * 100f).roundToInt()}%",
                    value = config.detailLevel,
                    range = 0.25f..1.0f,
                    accent = AccentCyan,
                    subtitle = "Controls adaptive watershed region density (higher preserves hair, text & textures)",
                    onValueChange = { onConfigChange(config.copy(detailLevel = it)) }
                )

                SliderControl(
                    title = "Optical Edge Sharpen",
                    valueText = "${(config.sharpenAmount * 100f).roundToInt()}%",
                    value = config.sharpenAmount,
                    range = 0.0f..0.80f,
                    accent = AccentAmber,
                    subtitle = "3×3 noise-gated unsharp mask prior to tracing to tighten camera softness",
                    onValueChange = { onConfigChange(config.copy(sharpenAmount = it)) }
                )

                HorizontalDivider(color = GlassBorder)

                // 4. Compression Noise Filter
                SectionLabel("ARTIFACT & NOISE SUPPRESSION")
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterMode.entries.forEach { mode ->
                        ChoicePill(
                            label = mode.displayName,
                            selected = config.filterMode == mode,
                            onClick = { onConfigChange(config.copy(filterMode = mode)) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                if (config.filterMode == FilterMode.BILATERAL) {
                    SliderControl(
                        title = "Bilateral Strength",
                        valueText = String.format(Locale.US, "%.1f", config.filterStrength),
                        value = config.filterStrength,
                        range = 0.5f..3.0f,
                        accent = AccentCyan,
                        onValueChange = { onConfigChange(config.copy(filterStrength = it)) }
                    )
                }

                // 5. OKLab Palette Quantization
                SliderControl(
                    title = "OKLab Color Palette",
                    valueText = if (config.colorQuantizeK == 0) "Full Color" else "${config.colorQuantizeK} colors",
                    value = config.colorQuantizeK.toFloat(),
                    range = 0f..64f,
                    steps = 63,
                    accent = AccentCyan,
                    subtitle = "0 = Continuous Full Color; 4–48 = Posterized flat design palette",
                    onValueChange = {
                        val k = it.roundToInt()
                        val normalizedK = if (k == 1) 2 else k
                        onConfigChange(config.copy(colorQuantizeK = normalizedK))
                    }
                )

                // 6. Simplify Tolerance & Speckle
                SliderControl(
                    title = "Path Simplification (RDP / Bézier Fit)",
                    valueText = String.format(Locale.US, "%.1f px", config.simplifyTolerance),
                    value = config.simplifyTolerance,
                    range = 0.0f..4.0f,
                    accent = AccentCyan,
                    subtitle = "0.0 px keeps tightest contours; increase for lighter geometric SVG size",
                    onValueChange = { onConfigChange(config.copy(simplifyTolerance = it)) }
                )

                SliderControl(
                    title = "Speckle Minimum Area",
                    valueText = "${2 + config.filterSpeckle} px",
                    value = config.filterSpeckle.toFloat(),
                    range = 0f..24f,
                    steps = 23,
                    accent = AccentCyan,
                    subtitle = "Absorbs sub-threshold micro regions into dominant surrounding colors",
                    onValueChange = { onConfigChange(config.copy(filterSpeckle = it.roundToInt())) }
                )
            }
        }
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 0.8.sp,
        color = AccentCyan
    )
}

@Composable
private fun ChoicePill(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(if (selected) AccentCyanMuted else ObsidianCard)
            .border(1.dp, if (selected) AccentCyan else GlassBorder, RoundedCornerShape(10.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            color = if (selected) AccentCyan else TextSecondary
        )
    }
}

@Composable
private fun SliderControl(
    title: String,
    valueText: String,
    value: Float,
    range: ClosedFloatingPointRange<Float>,
    accent: Color,
    steps: Int = 0,
    subtitle: String? = null,
    onValueChange: (Float) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = title, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
            Surface(
                color = ObsidianCard,
                shape = RoundedCornerShape(50),
                border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder)
            ) {
                Text(
                    text = valueText,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = accent,
                    modifier = Modifier.padding(horizontal = 9.dp, vertical = 3.dp)
                )
            }
        }
        if (subtitle != null) {
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, fontSize = 10.sp, color = TextSecondary, lineHeight = 13.sp)
        }
        Slider(
            value = value.coerceIn(range.start, range.endInclusive),
            onValueChange = onValueChange,
            valueRange = range,
            steps = steps,
            colors = SliderDefaults.colors(
                thumbColor = accent,
                activeTrackColor = accent,
                inactiveTrackColor = ObsidianCard
            )
        )
    }
}
