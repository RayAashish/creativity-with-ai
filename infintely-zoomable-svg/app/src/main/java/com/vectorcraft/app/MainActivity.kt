package com.vectorcraft.app

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Code
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vectorcraft.app.engine.FitMode
import com.vectorcraft.app.engine.StudioPreset
import com.vectorcraft.app.ui.components.ControlsPanel
import com.vectorcraft.app.ui.components.InfiniteZoomViewport
import com.vectorcraft.app.ui.components.MasteryManualSheet
import com.vectorcraft.app.ui.components.SvgStudioSheet
import com.vectorcraft.app.ui.components.VectorForgeTopBar
import com.vectorcraft.app.ui.theme.AccentAmber
import com.vectorcraft.app.ui.theme.AccentCyan
import com.vectorcraft.app.ui.theme.AccentCyanMuted
import com.vectorcraft.app.ui.theme.AccentEmerald
import com.vectorcraft.app.ui.theme.GlassBorder
import com.vectorcraft.app.ui.theme.ObsidianBg
import com.vectorcraft.app.ui.theme.ObsidianCard
import com.vectorcraft.app.ui.theme.ObsidianElevated
import com.vectorcraft.app.ui.theme.ObsidianSurface
import com.vectorcraft.app.ui.theme.TextPrimary
import com.vectorcraft.app.ui.theme.TextSecondary
import com.vectorcraft.app.ui.theme.VectorForgeTheme
import com.vectorcraft.app.util.SampleImages
import com.vectorcraft.app.util.StorageHelper
import kotlinx.coroutines.launch
import java.util.Locale

class MainActivity : ComponentActivity() {
    private val viewModel: VectorViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(android.graphics.Color.TRANSPARENT)
        )
        super.onCreate(savedInstanceState)
        SampleImages.init(applicationContext)
        handleIncomingImageIntent(intent)

        setContent {
            VectorForgeTheme {
                VectorForgeAppScreen(viewModel)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingImageIntent(intent)
    }

    private fun handleIncomingImageIntent(intent: Intent?) {
        val uri: Uri? = when (intent?.action) {
            Intent.ACTION_VIEW -> intent.data
            Intent.ACTION_SEND -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
                } else {
                    @Suppress("DEPRECATION")
                    intent.getParcelableExtra(Intent.EXTRA_STREAM)
                }
            }
            else -> null
        }
        if (uri != null) {
            viewModel.loadFromUri(this, uri)
        }
    }
}

@Composable
fun VectorForgeAppScreen(viewModel: VectorViewModel) {
    val state by viewModel.state.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    val pickImageLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            viewModel.loadFromUri(context, uri)
        }
    }

    LaunchedEffect(state.error) {
        val err = state.error
        if (err != null) {
            snackbarHostState.showSnackbar(err)
        }
    }

    val performExport: () -> Unit = {
        val svg = state.svgContent
        if (svg != null) {
            val savedUri = StorageHelper.saveSvgToDownloads(context, svg, "vectorforge")
            if (savedUri != null) {
                Toast.makeText(context, "Saved SVG to Downloads/VectorForge", Toast.LENGTH_LONG).show()
                coroutineScope.launch {
                    snackbarHostState.showSnackbar("Saved SVG to Downloads/VectorForge/")
                }
            } else {
                Toast.makeText(context, "Failed to save SVG", Toast.LENGTH_SHORT).show()
            }
        }
    }

    val performShare: () -> Unit = {
        state.svgContent?.let { svg ->
            StorageHelper.shareSvg(context, svg, "vectorforge")
        }
    }

    Scaffold(
        containerColor = ObsidianBg,
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { _ ->
        Column(modifier = Modifier.fillMaxSize()) {
            // 1. Clean Non-Wrapping Top Studio Header
            VectorForgeTopBar(
                hasSvg = !state.svgContent.isNullOrEmpty(),
                isWireframe = state.isWireframe,
                backgroundStyle = state.backgroundStyle,
                onImportImage = {
                    pickImageLauncher.launch(
                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                    )
                },
                onExportSvg = performExport,
                onShareSvg = performShare,
                onLoadSample = viewModel::loadSample,
                onToggleWireframe = viewModel::toggleWireframe,
                onBackgroundStyleChange = viewModel::setBackgroundStyle,
                onOpenManual = viewModel::toggleManual
            )

            // 2. Full-Flex Infinite Zoom & Split Comparison Viewport (zero bottom overlay collision)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                InfiniteZoomViewport(
                    bitmap = state.bitmap,
                    svgContent = state.svgContent,
                    viewMode = state.viewMode,
                    splitRatio = state.splitRatio,
                    isProcessing = state.isProcessing,
                    isWireframe = state.isWireframe,
                    isPixelArt = state.config.fitMode == FitMode.PIXEL_ART,
                    backgroundStyle = state.backgroundStyle,
                    onViewModeChange = viewModel::setViewMode,
                    onSplitRatioChange = viewModel::setSplitRatio,
                    onToggleWireframe = viewModel::toggleWireframe
                )
            }

            // 3. Clean Docked Studio Control Deck
            BottomStudioDock(
                state = state,
                onSelectPreset = viewModel::applyStudioPreset,
                onOpenControls = viewModel::toggleControls,
                onOpenStudio = viewModel::toggleStudio
            )
        }

        // Modal Bottom Sheets
        if (state.isControlsOpen) {
            ControlsPanel(
                config = state.config,
                onConfigChange = { newConfig -> viewModel.updateConfig(newConfig, immediate = false) },
                onDismiss = viewModel::dismissSheets
            )
        }

        if (state.isStudioOpen) {
            SvgStudioSheet(
                svgContent = state.svgContent,
                stats = state.stats,
                isWireframe = state.isWireframe,
                onToggleWireframe = viewModel::toggleWireframe,
                onSaveToDownloads = performExport,
                onShareSvg = performShare,
                onDismiss = viewModel::dismissSheets
            )
        }

        if (state.isManualOpen) {
            MasteryManualSheet(
                onDismiss = viewModel::dismissSheets
            )
        }
    }
}

@Composable
private fun BottomStudioDock(
    state: VectorForgeState,
    onSelectPreset: (StudioPreset) -> Unit,
    onOpenControls: () -> Unit,
    onOpenStudio: () -> Unit
) {
    val activePreset = state.config.activePreset

    Surface(
        color = ObsidianSurface,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
        ) {
            HorizontalDivider(color = GlassBorder)

            // Preset Mode Strip
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 12.dp, vertical = 9.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                StudioPreset.entries.forEach { preset ->
                    val selected = activePreset == preset
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(if (selected) AccentCyanMuted else ObsidianCard)
                            .border(
                                width = 1.dp,
                                color = if (selected) AccentCyan else GlassBorder,
                                shape = RoundedCornerShape(50)
                            )
                            .clickable { onSelectPreset(preset) }
                            .padding(horizontal = 13.dp, vertical = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = preset.label,
                            fontSize = 11.sp,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                            color = if (selected) AccentCyan else TextSecondary
                        )
                    }
                }
            }

            // Telemetry + Tune / Inspect Buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 14.dp, end = 14.dp, bottom = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                val stats = state.stats
                val sizeLabel = if (stats.svgSizeBytes >= 1024 * 1024) {
                    String.format(Locale.US, "%.1f MB", stats.svgSizeBytes / (1024f * 1024f))
                } else {
                    String.format(Locale.US, "%.0f KB", stats.svgSizeBytes / 1024f)
                }
                val pathLabel = if (stats.pathCount >= 1000) {
                    String.format(Locale.US, "%.1fk", stats.pathCount / 1000f)
                } else {
                    stats.pathCount.toString()
                }
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "${stats.durationMs}ms",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentEmerald,
                        maxLines = 1
                    )
                    Text("·", fontSize = 11.sp, color = TextSecondary)
                    Text(
                        text = "$pathLabel paths",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextPrimary,
                        maxLines = 1
                    )
                    Text("·", fontSize = 11.sp, color = TextSecondary)
                    Text(
                        text = sizeLabel,
                        fontSize = 11.sp,
                        color = TextSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Surface(
                        color = ObsidianElevated,
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder),
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .clickable(onClick = onOpenControls)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            Icon(Icons.Rounded.Tune, contentDescription = "Tune Engine", tint = AccentCyan, modifier = Modifier.size(15.dp))
                            Text("Tune", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        }
                    }

                    Surface(
                        color = ObsidianElevated,
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, GlassBorder),
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .clickable(onClick = onOpenStudio)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            Icon(Icons.Rounded.Code, contentDescription = "Inspect SVG", tint = AccentAmber, modifier = Modifier.size(15.dp))
                            Text("Inspect", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        }
                    }
                }
            }
        }
    }
}
