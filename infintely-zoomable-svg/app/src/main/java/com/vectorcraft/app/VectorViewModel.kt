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
    val svgSizeBytes: Int = 0,
    val viewBoxWidth: Int = 0,
    val viewBoxHeight: Int = 0,
    val nodeCount: Int = 0
)

data class CurvifyState(
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
    private val _state = MutableStateFlow(CurvifyState())
    val state: StateFlow<CurvifyState> = _state.asStateFlow()

    private var vectorizationJob: Job? = null
    private var debounceJob: Job? = null

    init {
        loadSample(SamplePreset.LOGO)
    }

    fun loadSample(preset: SamplePreset) {
        val bitmap = SampleImages.generateSample(preset)
        val suggestedConfig = when (preset) {
            SamplePreset.PIXEL_ART -> _state.value.config.copy(
                fitMode = FitMode.PIXEL_ART,
                filterMode = FilterMode.NONE,
                filterSpeckle = 0
            )
            SamplePreset.LOGO -> _state.value.config.copy(
                fitMode = FitMode.SPLINE,
                filterMode = FilterMode.NONE,
                filterSpeckle = 4,
                simplifyTolerance = 1.2f
            )
            SamplePreset.PHOTO -> _state.value.config.copy(
                fitMode = FitMode.SPLINE,
                filterMode = FilterMode.NONE, // Off by default to preserve crisp details & facial contours
                colorQuantizeK = 0, // Full Color high fidelity by default
                simplifyTolerance = 0.8f,
                filterSpeckle = 2
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

                // Downscale large camera photos to safe bounds (max 1024px) for sub-800ms on-device vectorization
                val maxDim = 1024
                val scaled = withContext(Dispatchers.Default) {
                    if (loadedBitmap.width > maxDim || loadedBitmap.height > maxDim) {
                        val scaleFactor = maxDim.toFloat() / maxOf(loadedBitmap.width, loadedBitmap.height)
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

                _state.value = _state.value.copy(
                    bitmap = scaled,
                    error = null
                )
                triggerVectorization(immediate = true)
            } catch (e: Exception) {
                Log.e("CurvifyViewModel", "Failed to load image from URI", e)
                _state.value = _state.value.copy(
                    isProcessing = false,
                    error = "Failed to load image: ${e.message}"
                )
            }
        }
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

    fun toggleWireframe() {
        _state.value = _state.value.copy(isWireframe = !_state.value.isWireframe)
    }

    fun setBackgroundStyle(style: BackgroundStyle) {
        _state.value = _state.value.copy(backgroundStyle = style)
    }

    private fun triggerVectorization(immediate: Boolean = false) {
        val currentBitmap = _state.value.bitmap ?: return
        val currentConfig = _state.value.config

        // Cancel pending debounce or active vectorization job
        debounceJob?.cancel()
        vectorizationJob?.cancel()

        debounceJob = viewModelScope.launch {
            if (!immediate) {
                // Debounce rapid slider updates by 200ms so we never bottleneck the CPU
                delay(200)
            }

            vectorizationJob = launch(Dispatchers.Default) {
                _state.value = _state.value.copy(isProcessing = true, error = null)

                val startTime = System.currentTimeMillis()
                try {
                    ensureActive()
                    val result = NativeBridge.vectorizeBitmap(currentBitmap, currentConfig)
                    ensureActive()

                    val elapsed = System.currentTimeMillis() - startTime
                    if (result.isNotEmpty() && isActive) {
                        val pathMatches = "<path".toRegex().findAll(result).count()
                        val sizeBytes = result.toByteArray(Charsets.UTF_8).size
                        val nodeEstimate = countSvgNodes(result)

                        _state.value = _state.value.copy(
                            svgContent = result,
                            isProcessing = false,
                            stats = VectorStats(
                                durationMs = elapsed,
                                pathCount = pathMatches,
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
                } catch (e: Exception) {
                    if (isActive) {
                        Log.e("CurvifyViewModel", "Vectorization failed", e)
                        _state.value = _state.value.copy(
                            isProcessing = false,
                            error = "Vectorization error: ${e.message}"
                        )
                    }
                }
            }
        }
    }

    private fun countSvgNodes(svg: String): Int {
        // Approximate count of Bézier curve commands: C, S, Q, T, L, M, Z
        var count = 0
        for (ch in svg) {
            if (ch in "cCsSqQtTlLmMzZ") count++
        }
        return count.coerceAtLeast(1)
    }
}
