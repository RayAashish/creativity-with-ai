package com.antigravity.note.inkengine.ml

import android.graphics.RectF
import androidx.ink.strokes.Stroke
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.common.model.RemoteModelManager
import com.google.mlkit.vision.digitalink.DigitalInkRecognition
import com.google.mlkit.vision.digitalink.DigitalInkRecognitionModel
import com.google.mlkit.vision.digitalink.DigitalInkRecognitionModelIdentifier
import com.google.mlkit.vision.digitalink.DigitalInkRecognizer
import com.google.mlkit.vision.digitalink.DigitalInkRecognizerOptions
import com.google.mlkit.vision.digitalink.Ink
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

data class RecognizedBlock(
    val text: String,
    val strokes: List<Stroke>,
    val bounds: RectF
)

class DigitalInkManager(
    languageTag: String = "en-US"
) {

    private val modelIdentifier: DigitalInkRecognitionModelIdentifier? = try {
        DigitalInkRecognitionModelIdentifier.fromLanguageTag(languageTag)
    } catch (_: Exception) {
        null
    }

    private val model: DigitalInkRecognitionModel? = modelIdentifier?.let {
        DigitalInkRecognitionModel.builder(it).build()
    }

    private var recognizer: DigitalInkRecognizer? = null
    private val modelManager = RemoteModelManager.getInstance()

    init {
        initRecognizer()
    }

    private fun initRecognizer() {
        val m = model ?: return
        try {
            recognizer = DigitalInkRecognition.getClient(
                DigitalInkRecognizerOptions.builder(m).build()
            )
        } catch (_: Exception) {}
    }

    suspend fun isModelDownloaded(): Boolean = suspendCancellableCoroutine { cont ->
        val m = model
        if (m == null) {
            cont.resume(false)
            return@suspendCancellableCoroutine
        }
        modelManager.isModelDownloaded(m)
            .addOnSuccessListener { downloaded -> cont.resume(downloaded) }
            .addOnFailureListener { cont.resume(false) }
    }

    suspend fun downloadModelIfNeeded(): Boolean = suspendCancellableCoroutine { cont ->
        val m = model
        if (m == null) {
            cont.resume(false)
            return@suspendCancellableCoroutine
        }
        val conditions = DownloadConditions.Builder().build()
        modelManager.download(m, conditions)
            .addOnSuccessListener {
                initRecognizer()
                cont.resume(true)
            }
            .addOnFailureListener {
                cont.resume(false)
            }
    }

    /**
     * Performs on-device ML Kit handwriting recognition on a group of strokes.
     * Returns top recognition candidate strings.
     */
    suspend fun recognizeStrokes(strokes: List<Stroke>): List<String> = suspendCancellableCoroutine { cont ->
        if (strokes.isEmpty()) {
            cont.resume(emptyList())
            return@suspendCancellableCoroutine
        }

        val rec = recognizer
        if (rec == null) {
            cont.resume(emptyList())
            return@suspendCancellableCoroutine
        }

        val inkBuilder = Ink.builder()
        for (stroke in strokes) {
            val strokeBuilder = Ink.Stroke.builder()
            val inputs = stroke.inputs
            for (i in 0 until inputs.size) {
                val pt = inputs.get(i)
                strokeBuilder.addPoint(
                    Ink.Point.create(pt.x, pt.y, pt.elapsedTimeMillis)
                )
            }
            inkBuilder.addStroke(strokeBuilder.build())
        }

        val ink = inkBuilder.build()
        rec.recognize(ink)
            .addOnSuccessListener { result ->
                val texts = result.candidates.map { it.text }
                cont.resume(texts)
            }
            .addOnFailureListener {
                cont.resume(emptyList())
            }
    }

    /**
     * Converts a list of strokes to an indexed text block with computed bounding box.
     */
    suspend fun transcribeStrokesToBlock(strokes: List<Stroke>): RecognizedBlock? {
        val candidates = recognizeStrokes(strokes)
        val text = candidates.firstOrNull() ?: return null

        var minX = Float.MAX_VALUE
        var maxX = -Float.MAX_VALUE
        var minY = Float.MAX_VALUE
        var maxY = -Float.MAX_VALUE

        for (stroke in strokes) {
            val box = stroke.shape.computeBoundingBox() ?: continue
            if (box.xMin < minX) minX = box.xMin
            if (box.xMax > maxX) maxX = box.xMax
            if (box.yMin < minY) minY = box.yMin
            if (box.yMax > maxY) maxY = box.yMax
        }

        val bounds = if (minX < maxX && minY < maxY) {
            RectF(minX, minY, maxX, maxY)
        } else {
            RectF(0f, 0f, 0f, 0f)
        }

        return RecognizedBlock(text = text, strokes = strokes, bounds = bounds)
    }

    fun close() {
        recognizer?.close()
        recognizer = null
    }
}
