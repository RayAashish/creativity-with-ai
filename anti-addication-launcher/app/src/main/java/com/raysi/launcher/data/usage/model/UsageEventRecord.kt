// app/src/main/java/com/raysi/launcher/data/usage/model/UsageEventRecord.kt
package com.raysi.launcher.data.usage.model

/**
 * Clean data model representing a raw usage event.
 * Decouples the aggregation engine from android.app.usage.UsageEvents.Event,
 * enabling pure deterministic JVM unit testing with synthetic event streams.
 */
data class UsageEventRecord(
    val eventType: Int,
    val timestampMs: Long,
    val packageName: String,
    val className: String
) {
    companion object {
        const val ACTIVITY_RESUMED = 1
        const val ACTIVITY_PAUSED = 2
        const val SCREEN_INTERACTIVE = 15
        const val SCREEN_NON_INTERACTIVE = 16
        const val KEYGUARD_HIDDEN = 18
    }
}
