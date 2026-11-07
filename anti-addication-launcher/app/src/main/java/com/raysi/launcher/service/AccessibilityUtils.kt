// app/src/main/java/com/raysi/launcher/service/AccessibilityUtils.kt
package com.raysi.launcher.service

import android.accessibilityservice.AccessibilityService
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils

/**
 * Utility functions for checking and requesting FocusAccessibilityService status.
 */
object AccessibilityUtils {

    fun isAccessibilityServiceEnabled(
        context: Context,
        serviceClass: Class<out AccessibilityService> = FocusAccessibilityService::class.java
    ): Boolean {
        val expectedName = ComponentName(context, serviceClass)
        val fullString = expectedName.flattenToString()
        val shortString = expectedName.flattenToShortString()

        val enabledServices = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false

        val colonSplitter = TextUtils.SimpleStringSplitter(':')
        colonSplitter.setString(enabledServices)
        while (colonSplitter.hasNext()) {
            val componentNameString = colonSplitter.next()
            if (componentNameString.equals(fullString, ignoreCase = true) ||
                componentNameString.equals(shortString, ignoreCase = true)
            ) {
                return true
            }
        }
        return false
    }

    fun createAccessibilitySettingsIntent(): Intent {
        return Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
    }
}
