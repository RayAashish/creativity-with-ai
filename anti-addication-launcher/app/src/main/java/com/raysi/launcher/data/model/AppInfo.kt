// app/src/main/java/com/raysi/launcher/data/model/AppInfo.kt
package com.raysi.launcher.data.model

import android.content.ComponentName
import android.os.UserHandle

/**
 * Immutable model representing a launchable application activity on the device.
 * Keyed by ComponentName + UserHandle to cleanly support multiple launcher activities
 * per package and multi-user/work profiles without collision.
 */
data class AppInfo(
    val componentName: ComponentName? = null,
    val userHandle: UserHandle? = null,
    val label: String,
    val packageName: String = try { componentName?.packageName ?: "" } catch (_: Throwable) { "" },
    val className: String = try { componentName?.className ?: "" } catch (_: Throwable) { "" },
    val userSerialNumber: Long = 0L,
    val isWorkProfile: Boolean = false,
    val category: Int = -1
) {
    /**
     * Stable, composite key for indexing and dictionary lookup.
     */
    val uniqueKey: String = try {
        val compStr = componentName?.flattenToString() ?: "$packageName/$className"
        "$compStr#$userSerialNumber"
    } catch (_: Throwable) {
        "$packageName/$className#$userSerialNumber"
    }
}
