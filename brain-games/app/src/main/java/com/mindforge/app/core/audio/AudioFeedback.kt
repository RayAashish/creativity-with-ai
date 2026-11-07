package com.mindforge.app.core.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.sin

@Singleton
class AudioFeedback @Inject constructor() {

    private val scope = CoroutineScope(Dispatchers.Default)
    private val sampleRate = 44100

    fun playCorrect(enabled: Boolean = true) {
        if (!enabled) return
        scope.launch {
            playTones(listOf(Pair(587.33, 80), Pair(880.00, 120))) // D5 -> A5 chime
        }
    }

    fun playWrong(enabled: Boolean = true) {
        if (!enabled) return
        scope.launch {
            playTones(listOf(Pair(220.00, 120), Pair(185.00, 160))) // Low error buzz
        }
    }

    fun playTick(enabled: Boolean = true) {
        if (!enabled) return
        scope.launch {
            playTones(listOf(Pair(1200.0, 20))) // Micro tick
        }
    }

    fun playVictory(enabled: Boolean = true) {
        if (!enabled) return
        scope.launch {
            // C5 -> E5 -> G5 -> C6 victory arpeggio
            playTones(listOf(
                Pair(523.25, 100),
                Pair(659.25, 100),
                Pair(783.99, 100),
                Pair(1046.50, 240)
            ))
        }
    }

    private fun playTones(tones: List<Pair<Double, Int>>) {
        try {
            val totalSamples = tones.sumOf { (it.second * sampleRate) / 1000 }
            val audioData = ShortArray(totalSamples)
            var offset = 0

            for ((freq, durationMs) in tones) {
                val numSamples = (durationMs * sampleRate) / 1000
                for (i in 0 until numSamples) {
                    val angle = 2.0 * Math.PI * i / (sampleRate / freq)
                    // Apply attack/decay envelope to eliminate pops/clicks
                    val envelope = when {
                        i < 200 -> i / 200.0
                        i > numSamples - 200 -> (numSamples - i) / 200.0
                        else -> 1.0
                    }
                    val sample = (sin(angle) * Short.MAX_VALUE * 0.4 * envelope).toInt().toShort()
                    if (offset + i < audioData.size) {
                        audioData[offset + i] = sample
                    }
                }
                offset += numSamples
            }

            val bufferSize = AudioTrack.getMinBufferSize(
                sampleRate,
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )

            val track = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_GAME)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(bufferSize.coerceAtLeast(audioData.size * 2))
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()

            track.write(audioData, 0, audioData.size)
            track.play()
            // Clean up track after completion in background
            Thread.sleep(tones.sumOf { it.second }.toLong() + 50)
            track.stop()
            track.release()
        } catch (e: Exception) {
            // Defensive: fail silently on constrained hardware
        }
    }
}
