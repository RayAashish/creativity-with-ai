package com.vectorcraft.app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.border
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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vectorcraft.app.ui.components.ControlsPanel
import com.vectorcraft.app.ui.components.CurvifyTopBar
import com.vectorcraft.app.ui.components.InfiniteZoomViewport
import com.vectorcraft.app.ui.components.MasteryManualSheet
import com.vectorcraft.app.ui.components.SvgStudioSheet
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.CurvifyTheme
import com.vectorcraft.app.ui.theme.DarkBackdrop
import com.vectorcraft.app.ui.theme.GlassBorderSubtle
import com.vectorcraft.app.util.StorageHelper
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val viewModel: VectorViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            CurvifyTheme {
                val state by viewModel.state.collectAsState()
                val context = LocalContext.current
                val snackbarHostState = remember { SnackbarHostState() }
                val scope = rememberCoroutineScope()

                // Photo picker launcher
                val photoPicker = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.PickVisualMedia()
                ) { uri ->
                    if (uri != null) {
                        viewModel.loadFromUri(context, uri)
                    }
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    containerColor = DarkBackdrop,
                    snackbarHost = { SnackbarHost(snackbarHostState) },
                    topBar = {
                        CurvifyTopBar(
                            viewMode = state.viewMode,
                            onViewModeChange = { viewModel.setViewMode(it) },
                            onPickImage = {
                                photoPicker.launch(
                                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                )
                            },
                            onSelectSample = { preset -> viewModel.loadSample(preset) },
                            onSaveToDownloads = {
                                val svg = state.svgContent
                                if (!svg.isNullOrBlank()) {
                                    val uri = StorageHelper.saveSvgToDownloads(context, svg, "curvify")
                                    if (uri != null) {
                                        scope.launch {
                                            snackbarHostState.showSnackbar("Export saved to Downloads/VectorCraft/")
                                        }
                                    } else {
                                        Toast.makeText(context, "Failed to save SVG", Toast.LENGTH_SHORT).show()
                                    }
                                } else {
                                    Toast.makeText(context, "Vectorizing... please wait", Toast.LENGTH_SHORT).show()
                                }
                            },
                            onShareSvg = {
                                val svg = state.svgContent
                                if (!svg.isNullOrBlank()) {
                                    StorageHelper.shareSvg(context, svg, "curvify")
                                } else {
                                    Toast.makeText(context, "Vectorizing... please wait", Toast.LENGTH_SHORT).show()
                                }
                            },
                            onToggleControls = { viewModel.toggleControls() },
                            isControlsOpen = state.isControlsOpen,
                            onToggleStudio = { viewModel.toggleStudio() },
                            isStudioOpen = state.isStudioOpen,
                            onToggleManual = { viewModel.toggleManual() }
                        )
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        // 1. Hardware-Accelerated Infinite Zoom & Split Viewport
                        InfiniteZoomViewport(
                            bitmap = state.bitmap,
                            svgContent = state.svgContent,
                            viewMode = state.viewMode,
                            splitRatio = state.splitRatio,
                            onSplitRatioChange = { viewModel.setSplitRatio(it) },
                            isWireframe = state.isWireframe,
                            backgroundStyle = state.backgroundStyle
                        )

                        // 2. Active Processing Indicator
                        if (state.isProcessing) {
                            LinearProgressIndicator(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .align(Alignment.TopCenter),
                                color = AccentCyan,
                                trackColor = Color(0x3300E5FF)
                            )
                        }

                        // 3. Tactile Glassmorphic Stats HUD Card (Bottom Left)
                        Surface(
                            modifier = Modifier
                                .align(Alignment.BottomStart)
                                .padding(16.dp)
                                .border(1.dp, GlassBorderSubtle, RoundedCornerShape(14.dp)),
                            shape = RoundedCornerShape(14.dp),
                            color = Color(0xD00A0D14),
                            shadowElevation = 8.dp
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                if (state.isProcessing) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(15.dp),
                                        strokeWidth = 2.dp,
                                        color = AccentCyan
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Curvify engine tracing...",
                                        fontSize = 11.sp,
                                        color = Color.White
                                    )
                                } else {
                                    val kbSize = state.stats.svgSizeBytes / 1024f
                                    val latencyColor = when {
                                        state.stats.durationMs < 1200 -> Color(0xFF4ADE80) // Green (< 1200ms)
                                        state.stats.durationMs > 2500 -> Color(0xFFFBBF24) // Amber (> 2500ms)
                                        else -> AccentCyan
                                    }
                                    val pathColor = when {
                                        state.stats.pathCount < 4000 -> Color(0xFF4ADE80) // Green (< 4000 paths)
                                        state.stats.pathCount > 8000 -> Color(0xFFFBBF24) // Amber (> 8000 paths)
                                        else -> Color.LightGray
                                    }

                                    Text(
                                        text = "⚡ ${state.stats.durationMs}ms",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = latencyColor,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = " • ${state.stats.pathCount} paths",
                                        fontSize = 12.sp,
                                        color = pathColor
                                    )
                                    Text(
                                        text = " • ${String.format("%.1f", kbSize)} KB",
                                        fontSize = 12.sp,
                                        color = Color.LightGray
                                    )
                                }

                            }
                        }

                        // 4. Slide-up Tuning Sliders Drawer
                        AnimatedVisibility(
                            visible = state.isControlsOpen,
                            enter = slideInVertically { it },
                            exit = slideOutVertically { it },
                            modifier = Modifier.align(Alignment.BottomCenter)
                        ) {
                            ControlsPanel(
                                config = state.config,
                                onConfigChange = { viewModel.updateConfig(it) },
                                modifier = Modifier.height(390.dp)
                            )
                        }

                        // 5. Standalone SVG Studio Sheet & Code Inspector
                        AnimatedVisibility(
                            visible = state.isStudioOpen,
                            enter = slideInVertically { it },
                            exit = slideOutVertically { it },
                            modifier = Modifier.align(Alignment.BottomCenter)
                        ) {
                            SvgStudioSheet(
                                svgContent = state.svgContent,
                                stats = state.stats,
                                isWireframe = state.isWireframe,
                                onToggleWireframe = { viewModel.toggleWireframe() },
                                backgroundStyle = state.backgroundStyle,
                                onBackgroundStyleChange = { viewModel.setBackgroundStyle(it) },
                                onClose = { viewModel.toggleStudio() },
                                modifier = Modifier.height(420.dp)
                            )
                        }

                        // 6. Mastery Manual Drawer
                        AnimatedVisibility(
                            visible = state.isManualOpen,
                            enter = slideInVertically { it },
                            exit = slideOutVertically { it },
                            modifier = Modifier.align(Alignment.BottomCenter)
                        ) {
                            MasteryManualSheet(
                                onClose = { viewModel.toggleManual() },
                                modifier = Modifier.height(420.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
