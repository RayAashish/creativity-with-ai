package com.vectorcraft.app

import android.content.Context
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vectorcraft.app.engine.FilterMode
import com.vectorcraft.app.engine.FitMode
import com.vectorcraft.app.engine.NativeBridge
import com.vectorcraft.app.engine.StudioPreset
import com.vectorcraft.app.engine.VectorizationConfig
import com.vectorcraft.app.ui.components.BackgroundStyle
import com.vectorcraft.app.ui.components.ViewMode
import com.vectorcraft.app.util.SampleImages
import com.vectorcraft.app.util.SamplePreset
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class VectorStats(
    val durationMs: Long = 0L,
    val pathCount: Int = 0,
    val gradientCount: Int = 0,
    val svgSizeBytes: Int = 0,
    val viewBoxWidth: Int = 0,
    val viewBoxHeight: Int = 0,
    val nodeCount: Int = 0
)

data class VectorForgeState(
    val bitmap: Bitmap? = null,
    val svgContent: String? = null,
    val isProcessing: Boolean = false,
    val error: String? = null,
    val config: VectorizationConfig = VectorizationConfig(),
    val viewMode: ViewMode = ViewMode.SPLIT_SLIDER,
    val splitRatio: Float = 0.5f,
    val isControlsOpen: Boolean = false,
    val isStudioOpen: Boolean = false,
    val isManualOpen: Boolean = false,
    val isWireframe: Boolean = false,
    val backgroundStyle: BackgroundStyle = BackgroundStyle.DARK_GRID,
    val stats: VectorStats = VectorStats()
)

class VectorViewModel : ViewModel() {
    private val _state = MutableStateFlow(VectorForgeState())
    val state: StateFlow<VectorForgeState> = _state.asStateFlow()

    private var vectorizationJob: Job? = null
    private var debounceJob: Job? = null

    init {
        loadSample(SamplePreset.STUDIO_HORIZON)
    }

    fun loadSample(preset: SamplePreset) {
        val bitmap = SampleImages.generateSample(preset)
        val suggestedConfig = when (preset) {
            SamplePreset.STUDIO_HORIZON, SamplePreset.MOON -> VectorizationConfig(
                fitMode = FitMode.SPLINE,
                gradientShading = true,
                detailLevel = 0.85f,
                sharpenAmount = 0.22f,
                filterMode = FilterMode.NONE,
                colorQuantizeK = 0,
                simplifyTolerance = 0.0f,
                filterSpeckle = 0
            )
            SamplePreset.LOGO -> VectorizationConfig(
                fitMode = FitMode.POLYGON,
                gradientShading = false,
                detailLevel = 0.78f,
                sharpenAmount = 0.20f,
                filterMode = FilterMode.NONE,
                colorQuantizeK = 0,
                simplifyTolerance = 0.8f,
                filterSpeckle = 1
            )
            SamplePreset.PIXEL_ART -> VectorizationConfig(
                fitMode = FitMode.PIXEL_ART,
                gradientShading = false,
                detailLevel = 0.80f,
                sharpenAmount = 0.0f,
                filterMode = FilterMode.NONE,
                colorQuantizeK = 0,
                simplifyTolerance = 0.0f,
                filterSpeckle = 0
            )
        }
        _state.value = _state.value.copy(
            bitmap = bitmap,
            config = suggestedConfig,
            error = null
        )
        triggerVectorization(immediate = true)
    }

    fun loadFromUri(context: Context, uri: Uri) {
        viewModelScope.launch {
            try {
                _state.value = _state.value.copy(isProcessing = true, error = null)
                val loadedBitmap = withContext(Dispatchers.IO) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        val source = ImageDecoder.createSource(context.contentResolver, uri)
                        ImageDecoder.decodeBitmap(source) { decoder, _, _ ->
                            decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
                            decoder.isMutableRequired = true
                        }
                    } else {
                        @Suppress("DEPRECATION")
                        MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
                    }
                }

                // Keep display bitmap crystal-sharp up to 2048px so Original raster comparisons
                // stay crisp at zoom; NativeBridge independently traces at up to 1080px for speed.
                val maxDisplayDim = 2048
                val displayBitmap = withContext(Dispatchers.Default) {
                    if (loadedBitmap.width > maxDisplayDim || loadedBitmap.height > maxDisplayDim) {
                        val scaleFactor = maxDisplayDim.toFloat() / maxOf(loadedBitmap.width, loadedBitmap.height)
                        Bitmap.createScaledBitmap(
                            loadedBitmap,
                            (loadedBitmap.width * scaleFactor).toInt().coerceAtLeast(1),
                            (loadedBitmap.height * scaleFactor).toInt().coerceAtLeast(1),
                            true
                        )
                    } else {
                        loadedBitmap
                    }
                }

                val photoConfig = VectorizationConfig(
                    fitMode = FitMode.SPLINE,
                    gradientShading = true,
                    detailLevel = 0.85f,
                    sharpenAmount = 0.24f,
                    filterMode = FilterMode.NONE,
                    colorQuantizeK = 0,
                    simplifyTolerance = 0.0f,
                    filterSpeckle = 0
                )

                _state.value = _state.value.copy(
                    bitmap = displayBitmap,
                    config = photoConfig,
                    error = null
                )
                triggerVectorization(immediate = true)
            } catch (e: Exception) {
                Log.e("VectorForgeVM", "Failed to load image from URI", e)
                _state.value = _state.value.copy(
                    isProcessing = false,
                    error = "Failed to load image: ${e.message}"
                )
            }
        }
    }

    fun applyStudioPreset(preset: StudioPreset) {
        val next = when (preset) {
            StudioPreset.PHOTO_HD -> _state.value.config.copy(
                fitMode = FitMode.SPLINE,
                gradientShading = true,
                detailLevel = 0.85f,
                sharpenAmount = 0.24f,
                colorQuantizeK = 0,
                simplifyTolerance = 0.0f,
                filterSpeckle = 0
            )
            StudioPreset.FLAT_VECTOR -> _state.value.config.copy(
                fitMode = FitMode.SPLINE,
                gradientShading = false,
                detailLevel = 0.72f,
                sharpenAmount = 0.20f,
                colorQuantizeK = 0,
                simplifyTolerance = 0.4f,
                filterSpeckle = 2
            )
            StudioPreset.POLYGON -> _state.value.config.copy(
                fitMode = FitMode.POLYGON,
                gradientShading = false,
                detailLevel = 0.70f,
                sharpenAmount = 0.20f,
                simplifyTolerance = 1.2f,
                filterSpeckle = 2
            )
            StudioPreset.PIXEL_ART -> _state.value.config.copy(
                fitMode = FitMode.PIXEL_ART,
                gradientShading = false,
                sharpenAmount = 0.0f,
                filterMode = FilterMode.NONE,
                colorQuantizeK = 0,
                simplifyTolerance = 0.0f,
                filterSpeckle = 0
            )
        }
        updateConfig(next, immediate = true)
    }

    fun updateConfig(newConfig: VectorizationConfig, immediate: Boolean = false) {
        _state.value = _state.value.copy(config = newConfig)
        triggerVectorization(immediate = immediate)
    }

    fun setViewMode(mode: ViewMode) {
        _state.value = _state.value.copy(viewMode = mode)
    }

    fun setSplitRatio(ratio: Float) {
        _state.value = _state.value.copy(splitRatio = ratio.coerceIn(0.05f, 0.95f))
    }

    fun toggleControls() {
        _state.value = _state.value.copy(
            isControlsOpen = !_state.value.isControlsOpen,
            isStudioOpen = false,
            isManualOpen = false
        )
    }

    fun toggleStudio() {
        _state.value = _state.value.copy(
            isStudioOpen = !_state.value.isStudioOpen,
            isControlsOpen = false,
            isManualOpen = false
        )
    }

    fun toggleManual() {
        _state.value = _state.value.copy(
            isManualOpen = !_state.value.isManualOpen,
            isControlsOpen = false,
            isStudioOpen = false
        )
    }

    fun dismissSheets() {
        _state.value = _state.value.copy(
            isControlsOpen = false,
            isStudioOpen = false,
            isManualOpen = false
        )
    }

    fun toggleWireframe() {
        _state.value = _state.value.copy(isWireframe = !_state.value.isWireframe)
    }

    fun setBackgroundStyle(style: BackgroundStyle) {
        _state.value = _state.value.copy(backgroundStyle = style)
    }

    private fun triggerVectorization(immediate: Boolean = false) {
        val currentBitmap = _state.value.bitmap ?: return
        val currentConfig = _state.value.config

        debounceJob?.cancel()
        vectorizationJob?.cancel()

        debounceJob = viewModelScope.launch {
            if (!immediate) {
                delay(180)
            }

            vectorizationJob = launch(Dispatchers.Default) {
                Log.i("VectorForgeVM", "Tracing ${currentBitmap.width}x${currentBitmap.height}, preset=${currentConfig.activePreset}")
                _state.value = _state.value.copy(isProcessing = true, error = null)

                val startTime = System.currentTimeMillis()
                try {
                    ensureActive()
                    val result = NativeBridge.vectorizeBitmap(currentBitmap, currentConfig)
                    ensureActive()

                    val elapsed = System.currentTimeMillis() - startTime
                    if (result.isNotEmpty() && isActive) {
                        val pathMatches = countTagOccurrences(result, "<path")
                        val gradientMatches = countTagOccurrences(result, "<linearGradient")
                        val sizeBytes = result.length
                        val nodeEstimate = countSvgNodes(result)
                        Log.i(
                            "VectorForgeVM",
                            "VectorForge SUCCESS in ${elapsed}ms: $pathMatches paths, $gradientMatches gradients, ${sizeBytes / 1024}KB"
                        )

                        _state.value = _state.value.copy(
                            svgContent = result,
                            isProcessing = false,
                            stats = VectorStats(
                                durationMs = elapsed,
                                pathCount = pathMatches,
                                gradientCount = gradientMatches,
                                svgSizeBytes = sizeBytes,
                                viewBoxWidth = currentBitmap.width,
                                viewBoxHeight = currentBitmap.height,
                                nodeCount = nodeEstimate
                            )
                        )
                    } else if (isActive) {
                        _state.value = _state.value.copy(
                            isProcessing = false,
                            error = "Vectorization produced empty output."
                        )
                    }
                } catch (t: Throwable) {
                    if (isActive) {
                        Log.e("VectorForgeVM", "Vectorization failed with error", t)
                        _state.value = _state.value.copy(
                            isProcessing = false,
                            error = "Vectorization error: ${t.message}"
                        )
                    }
                }
            }
        }
    }

    private fun countTagOccurrences(text: String, tag: String): Int {
        var count = 0
        var searchIdx = 0
        while (true) {
            searchIdx = text.indexOf(tag, searchIdx)
            if (searchIdx == -1) break
            count++
            searchIdx += tag.length
        }
        return count
    }

    private fun countSvgNodes(svg: String): Int {
        var count = 0
        val sampleLimit = minOf(svg.length, 400_000)
        for (i in 0 until sampleLimit) {
            val ch = svg[i]
            if (ch == 'c' || ch == 'C' || ch == 'l' || ch == 'L' || ch == 'q' || ch == 'm' || ch == 'M') {
                count++
            }
        }
        if (svg.length > sampleLimit) {
            count = (count.toLong() * svg.length / sampleLimit).toInt()
        }
        return count.coerceAtLeast(1)
    }
}
