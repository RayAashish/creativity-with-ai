// app/src/main/java/com/raysi/launcher/data/search/RustSearchEngine.kt
package com.raysi.launcher.data.search

import android.util.Log
import com.raysi.launcher.data.model.AppInfo
import java.io.Closeable
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Rust-backed high-performance search engine communicating over JNI.
 * Executes search matching in native Rust code and returns result indices via IntArray.
 */
class RustSearchEngine(customLibPath: String? = null) : SearchEngine, Closeable {

    companion object {
        private const val TAG = "RustSearchEngine"
        private val isLoaded = AtomicBoolean(false)

        init {
            try {
                System.loadLibrary("focus_search")
                isLoaded.set(true)
            } catch (t: Throwable) {
                // Expected in JVM test environments unless explicitly loaded via customLibPath
                Log.w(TAG, "Native library 'focus_search' not loaded via System.loadLibrary: ${t.message}")
            }
        }

        fun loadExplicit(path: String): Boolean {
            return try {
                System.load(path)
                isLoaded.set(true)
                true
            } catch (t: Throwable) {
                Log.e(TAG, "Failed to load library from path: $path", t)
                false
            }
        }

        fun isNativeAvailable(): Boolean = isLoaded.get()
    }

    init {
        if (customLibPath != null && !isLoaded.get()) {
            loadExplicit(customLibPath)
        }
    }

    private var nativePtr: Long = if (isLoaded.get()) nativeCreate() else 0L
    private var cachedApps: List<AppInfo> = emptyList()

    @Synchronized
    override fun updateIndex(apps: List<AppInfo>) {
        cachedApps = apps
        if (nativePtr == 0L) return

        val labels = Array(apps.size) { i -> apps[i].label }
        nativeUpdateIndex(nativePtr, labels)
    }

    @Synchronized
    override fun search(query: String, maxResults: Int): List<AppInfo> {
        if (nativePtr == 0L || cachedApps.isEmpty()) {
            return cachedApps.take(maxResults)
        }

        val indices = nativeSearch(nativePtr, query, maxResults)
        val results = ArrayList<AppInfo>(indices.size)
        for (idx in indices) {
            if (idx in cachedApps.indices) {
                results.add(cachedApps[idx])
            }
        }
        return results
    }

    @Synchronized
    override fun close() {
        if (nativePtr != 0L) {
            nativeDestroy(nativePtr)
            nativePtr = 0L
        }
    }

    protected fun finalize() {
        close()
    }

    private external fun nativeCreate(): Long
    private external fun nativeUpdateIndex(ptr: Long, labels: Array<String>)
    private external fun nativeSearch(ptr: Long, query: String, maxResults: Int): IntArray
    private external fun nativeDestroy(ptr: Long)
}
