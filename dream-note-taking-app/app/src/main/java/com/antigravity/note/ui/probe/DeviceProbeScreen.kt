package com.antigravity.note.ui.probe

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
import androidx.compose.ui.viewinterop.AndroidView
import com.antigravity.note.inkengine.probe.DeviceProbeController
import com.antigravity.note.inkengine.probe.ProbeInteractiveView

@Composable
fun DeviceProbeScreen(
    probeController: DeviceProbeController,
    onNavigateToCanvas: () -> Unit = {}
) {
    val state by probeController.state.collectAsState()
    val context = LocalContext.current
    val activity = context as? Activity
    val interactiveView = remember { ProbeInteractiveView(context) }

    DisposableEffect(activity) {
        if (activity != null) {
            probeController.request144Hz(activity.window)
        }
        onDispose {
            if (activity != null) {
                probeController.releaseHighRefreshRate(activity.window)
            }
        }
    }

    Row(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Left Column: Device & Hardware Capabilities Diagnostics (Scrollable)
        Column(
            modifier = Modifier
                .weight(0.48f)
                .fillMaxHeight()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header: Target Device Information
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Speed,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Phase 0: Device & Pen Probe",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Target: Motorola Moto Pad 70 Pro (Snapdragon 8s Gen 4, Adreno 825, Moto Pen Pro, 144 Hz IPS)",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.85f)
                    )
                }
            }

            // Display & Refresh Rate Card
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Display Refresh Modes",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(if (state.is144HzActive) Color(0xFF2E7D32) else Color(0xFFE65100))
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "%.1f Hz %s".format(
                                    state.activeRefreshRate,
                                    if (state.is144HzActive) "[144 Hz ACTIVE]" else ""
                                ),
                                fontWeight = FontWeight.Bold,
                                color = if (state.is144HzActive) Color(0xFF2E7D32) else Color(0xFFE65100),
                                fontSize = 14.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Resolution: ${state.displayWidth} × ${state.displayHeight} px | Frame budget: ${"%.2f".format(if (state.activeRefreshRate > 0) 1000f / state.activeRefreshRate else 16.6f)} ms",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                activity?.let { probeController.request144Hz(it.window) }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF005AC1)
                            )
                        ) {
                            Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Force 144 Hz")
                        }

                        OutlinedButton(
                            onClick = {
                                activity?.let { probeController.releaseHighRefreshRate(it.window) }
                            }
                        ) {
                            Text("Release (Idle)")
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Supported Modes: ${state.supportedModes.joinToString { "${it.width}x${it.height}@${it.refreshRate.toInt()}Hz" }}",
                        style = MaterialTheme.typography.labelSmall,
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Stylus Hardware Capabilities Card
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Stylus Hardware Detection",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    val stylus = state.stylusHardware
                    if (stylus != null) {
                        CapabilityRow("Device Name", stylus.deviceName)
                        CapabilityRow("Protocol Type", if (stylus.likelyActiveStylus) "Active Stylus Protocol (Moto Pen Pro)" else "EMR / Standard Digitizer")
                        CapabilityRow("Pressure Support", if (stylus.supportsPressure) "YES [min: ${stylus.pressureMin}, max: ${stylus.pressureMax}]" else "NO")
                        CapabilityRow("Tilt & Orientation", if (stylus.supportsTilt) "YES (Axis Tilt + Orientation)" else "NO")
                        CapabilityRow("Hover Distance", if (stylus.supportsHoverDistance) "YES (Proximity reporting)" else "NO")
                        CapabilityRow("Touch Major (Palm)", if (stylus.supportsTouchMajor) "YES (Contact area reporting)" else "NO")
                        CapabilityRow("Reported Axes", stylus.reportedAxes.joinToString(", "))
                    } else {
                        Text(
                            text = "Awaiting stylus contact or Bluetooth discovery. Touch the canvas with the Moto Pen Pro to probe.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Real-time Live Pointer Telemetry Card
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                val t = state.liveTelemetry
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Live Pointer Telemetry",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = t.action,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Tool type & Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        StatusChip(label = t.toolType, isActive = t.isStylus || t.isEraser)
                        StatusChip(label = "Barrel 1", isActive = t.isPrimaryButtonPressed)
                        StatusChip(label = "Barrel 2", isActive = t.isSecondaryButtonPressed)
                        StatusChip(label = "Eraser End", isActive = t.isEraserButtonPressed || t.isEraser)
                        StatusChip(label = "Hover", isActive = t.isHovering)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Pressure gauge
                    Text(
                        text = "Pressure: ${"%.3f".format(t.pressure)} (Range observed: ${"%.2f".format(state.minPressureObserved)} - ${"%.2f".format(state.maxPressureObserved)})",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    LinearProgressIndicator(
                        progress = { t.pressure.coerceIn(0f, 1f) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp))
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("Tilt: ${"%.1f".format(t.tiltDegrees)}°", style = MaterialTheme.typography.bodySmall)
                            Text("Orientation: ${"%.1f".format(t.orientationDegrees)}°", style = MaterialTheme.typography.bodySmall)
                            Text("Hover Dist: ${"%.2f".format(t.distance)}", style = MaterialTheme.typography.bodySmall)
                        }
                        Column {
                            Text("Batch Size: ${t.historySize} (Max: ${state.maxHistoryBatchSizeObserved})", style = MaterialTheme.typography.bodySmall)
                            Text("Sampling Rate: ${if (t.estimatedSamplingRateHz > 0) "${t.estimatedSamplingRateHz} Hz" else "Measuring..."}", style = MaterialTheme.typography.bodySmall)
                            Text("Touch Major: ${"%.1f".format(t.touchMajor)} px", style = MaterialTheme.typography.bodySmall)
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Total Events: ${state.eventCount} | Palms Rejected: ${state.palmTouchDetectedCount} | Latency: ${"%.1f".format(t.dispatchLatencyMs)} ms",
                        style = MaterialTheme.typography.labelSmall,
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // Right Column: Interactive Diagnostic Pad & Navigation
        Column(
            modifier = Modifier
                .weight(0.52f)
                .fillMaxHeight()
                .padding(top = 16.dp, end = 16.dp, bottom = 16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Diagnostic Canvas & Latency Pad",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Draw with Moto Pen Pro. Orange ellipse = contact geometry; Red dots = historical batch samples.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(
                        onClick = { interactiveView.clearCanvas() }
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Clear Pad")
                    }

                    Button(
                        onClick = onNavigateToCanvas,
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Open Inking Canvas")
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // The interactive diagnostic view container
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.5.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(12.dp))
                    .background(Color(0xFFFCFAF6))
            ) {
                AndroidView(
                    factory = {
                        interactiveView.apply {
                            this.probeController = probeController
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}

@Composable
private fun CapabilityRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun StatusChip(label: String, isActive: Boolean) {
    Surface(
        color = if (isActive) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
        contentColor = if (isActive) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
        shape = RoundedCornerShape(6.dp),
        border = if (!isActive) androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)) else null
    ) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
