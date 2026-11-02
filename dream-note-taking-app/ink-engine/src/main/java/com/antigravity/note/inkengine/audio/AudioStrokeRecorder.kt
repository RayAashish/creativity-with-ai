package com.antigravity.note.inkengine.audio

import android.content.Context
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.os.Build
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/**
 * Data model for a stroke recorded during an active audio session.
 */
data class AudioStrokeTiming(
    val strokeIndex: Int,
    val startOffsetMs: Long,
    val durationMs: Long = 0
)

/**
 * High-performance audio recorder and player synchronized with vector strokes.
 * Notability-style:
 * 1. Record audio while taking notes.
 * 2. Each stroke is stamped with its relative audio offset.
 * 3. During playback, scrubbing advances ink or tapping a stroke seeks audio.
 */
class AudioStrokeRecorder(
    private val context: Context,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main.immediate)
) {
    companion object {
        private const val TAG = "AudioStrokeRecorder"
    }

    enum class State {
        IDLE,
        RECORDING,
        PLAYING,
        PAUSED
    }

    var state: State = State.IDLE
        private set

    private var mediaRecorder: MediaRecorder? = null
    private var mediaPlayer: MediaPlayer? = null
    private var playbackTickerJob: Job? = null

    private var recordingStartTimeMs: Long = 0
    val strokeTimings = mutableListOf<AudioStrokeTiming>()

    var activeAudioFile: File? = null
        private set

    /**
     * Start recording audio for a notebook page.
     * Output file will be saved at [outputFile].
     */
    fun startRecording(outputFile: File): Boolean {
        if (state == State.RECORDING) return true

        return try {
            outputFile.parentFile?.mkdirs()
            activeAudioFile = outputFile
            strokeTimings.clear()

            val recorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(context)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }

            recorder.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioEncodingBitRate(128000)
                setAudioSamplingRate(44100)
                setOutputFile(outputFile.absolutePath)
                prepare()
                start()
            }

            mediaRecorder = recorder
            recordingStartTimeMs = System.currentTimeMillis()
            state = State.RECORDING
            Log.i(TAG, "Audio recording started: ${outputFile.absolutePath}")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start audio recording", e)
            releaseRecorder()
            state = State.IDLE
            false
        }
    }

    /**
     * Stamp a completed stroke with its relative audio offset.
     */
    fun recordStrokeTiming(strokeIndex: Int, durationMs: Long = 0): AudioStrokeTiming? {
        if (state != State.RECORDING) return null

        val offsetMs = (System.currentTimeMillis() - recordingStartTimeMs).coerceAtLeast(0)
        val timing = AudioStrokeTiming(
            strokeIndex = strokeIndex,
            startOffsetMs = offsetMs,
            durationMs = durationMs
        )
        strokeTimings.add(timing)
        return timing
    }

    /**
     * Stop recording audio and persist the timing track.
     */
    fun stopRecording(): Long {
        if (state != State.RECORDING) return 0L

        val duration = System.currentTimeMillis() - recordingStartTimeMs
        try {
            mediaRecorder?.stop()
        } catch (e: Exception) {
            Log.w(TAG, "Error stopping MediaRecorder", e)
        } finally {
            releaseRecorder()
            state = State.IDLE
        }

        // Save timings alongside audio file
        activeAudioFile?.let { audioFile ->
            saveTimingsToFile(File(audioFile.parentFile, "${audioFile.nameWithoutExtension}.timing.json"))
        }

        Log.i(TAG, "Audio recording stopped. Duration: $duration ms, strokes stamped: ${strokeTimings.size}")
        return duration
    }

    /**
     * Start playing an existing audio recording.
     */
    fun startPlayback(
        audioFile: File,
        onProgress: (currentMs: Int, totalMs: Int) -> Unit,
        onComplete: () -> Unit
    ): Boolean {
        if (!audioFile.exists()) return false
        stopPlayback()

        return try {
            val player = MediaPlayer().apply {
                setDataSource(audioFile.absolutePath)
                prepare()
                setOnCompletionListener {
                    stopPlayback()
                    onComplete()
                }
                start()
            }

            mediaPlayer = player
            activeAudioFile = audioFile
            loadTimingsFromFile(File(audioFile.parentFile, "${audioFile.nameWithoutExtension}.timing.json"))
            state = State.PLAYING

            playbackTickerJob = scope.launch {
                while (isActive && state == State.PLAYING) {
                    val currentPos = player.currentPosition
                    val totalDuration = player.duration
                    onProgress(currentPos, totalDuration)
                    delay(50)
                }
            }
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start audio playback", e)
            stopPlayback()
            false
        }
    }

    fun pausePlayback() {
        if (state == State.PLAYING) {
            mediaPlayer?.pause()
            state = State.PAUSED
        }
    }

    fun resumePlayback() {
        if (state == State.PAUSED) {
            mediaPlayer?.start()
            state = State.PLAYING
        }
    }

    fun stopPlayback() {
        playbackTickerJob?.cancel()
        playbackTickerJob = null
        try {
            mediaPlayer?.stop()
        } catch (ignored: Exception) {}
        mediaPlayer?.release()
        mediaPlayer = null
        if (state == State.PLAYING || state == State.PAUSED) {
            state = State.IDLE
        }
    }

    fun seekTo(positionMs: Int) {
        mediaPlayer?.seekTo(positionMs)
    }

    /**
     * Get the stroke indices visible at a given audio timestamp (Notability-style sync).
     */
    fun getStrokesVisibleAt(audioPositionMs: Long): Set<Int> {
        val visible = mutableSetOf<Int>()
        for (timing in strokeTimings) {
            if (timing.startOffsetMs <= audioPositionMs) {
                visible.add(timing.strokeIndex)
            }
        }
        return visible
    }

    /**
     * Find the audio timestamp when a particular stroke was written.
     */
    fun getTimestampForStroke(strokeIndex: Int): Long? {
        return strokeTimings.firstOrNull { it.strokeIndex == strokeIndex }?.startOffsetMs
    }

    private fun releaseRecorder() {
        try {
            mediaRecorder?.reset()
            mediaRecorder?.release()
        } catch (ignored: Exception) {}
        mediaRecorder = null
    }

    fun release() {
        stopRecording()
        stopPlayback()
    }

    fun saveTimingsToFile(file: File) {
        try {
            val array = JSONArray()
            for (t in strokeTimings) {
                val obj = JSONObject()
                obj.put("strokeIndex", t.strokeIndex)
                obj.put("startOffsetMs", t.startOffsetMs)
                obj.put("durationMs", t.durationMs)
                array.put(obj)
            }
            file.writeText(array.toString(2))
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save stroke timings", e)
        }
    }

    fun loadTimingsFromFile(file: File) {
        if (!file.exists()) return
        try {
            strokeTimings.clear()
            val content = file.readText()
            val array = JSONArray(content)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                strokeTimings.add(
                    AudioStrokeTiming(
                        strokeIndex = obj.getInt("strokeIndex"),
                        startOffsetMs = obj.getLong("startOffsetMs"),
                        durationMs = obj.optLong("durationMs", 0)
                    )
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to load stroke timings", e)
        }
    }
}
