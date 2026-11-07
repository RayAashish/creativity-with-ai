// app/src/main/java/com/raysi/launcher/data/search/SearchEngine.kt
package com.raysi.launcher.data.search

import com.raysi.launcher.data.model.AppInfo

/**
 * Common search engine interface powering the keyboard-first drawer.
 * Implementations must satisfy: keystroke -> results <= 1 ms for 500 apps.
 */
interface SearchEngine {
    fun updateIndex(apps: List<AppInfo>)
    fun search(query: String, maxResults: Int = 50): List<AppInfo>
}
