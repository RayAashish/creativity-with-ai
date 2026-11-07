// app/src/main/java/com/raysi/launcher/ui/home/model/PinnedAppUiModel.kt
package com.raysi.launcher.ui.home.model

import android.content.ComponentName
import android.os.UserHandle

/**
 * Presentation model for a pinned essential application on the home screen.
 * - Id is stable for Compose LazyColumn keying.
 * - Max 5 pinned apps displayed according to displayOrder.
 * - usageDurationFormatted is populated when usage stats access is granted.
 */
data class PinnedAppUiModel(
    val id: String,
    val componentNameStr: String,
    val componentName: ComponentName?,
    val userHandle: UserHandle?,
    val displayLabel: String,
    val userSerialNumber: Long,
    val displayOrder: Int,
    val isInstalled: Boolean,
    val isWorkProfile: Boolean,
    val usageDurationFormatted: String? = null
)
