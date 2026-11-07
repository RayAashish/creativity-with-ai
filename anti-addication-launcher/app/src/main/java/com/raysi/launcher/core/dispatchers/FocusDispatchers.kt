// app/src/main/java/com/raysi/launcher/core/dispatchers/FocusDispatchers.kt
package com.raysi.launcher.core.dispatchers

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.asCoroutineDispatcher
import java.io.Closeable
import java.util.concurrent.Executors

/**
 * FocusDispatchers contract specifying strict threading boundaries:
 * - default: CPU work (e.g. search indexing, Levenshtein distance calculations)
 * - usageAggregation: dedicated single-thread dispatcher for serialized usage event aggregation
 * - mainImmediate: Main.immediate for synchronous UI state dispatch
 * - io: Disk / network / DataStore persistence operations
 */
interface FocusDispatchers {
    val default: CoroutineDispatcher
    val usageAggregation: CoroutineDispatcher
    val mainImmediate: CoroutineDispatcher
    val io: CoroutineDispatcher
}

class StandardFocusDispatchers : FocusDispatchers, Closeable {
    private val usageExecutor = Executors.newSingleThreadExecutor { runnable ->
        Thread(runnable, "focus-usage-aggregator").apply {
            priority = Thread.NORM_PRIORITY - 1
        }
    }

    override val default: CoroutineDispatcher = Dispatchers.Default
    override val usageAggregation: CoroutineDispatcher = usageExecutor.asCoroutineDispatcher()
    override val mainImmediate: CoroutineDispatcher = Dispatchers.Main.immediate
    override val io: CoroutineDispatcher = Dispatchers.IO

    override fun close() {
        usageExecutor.shutdown()
    }
}
