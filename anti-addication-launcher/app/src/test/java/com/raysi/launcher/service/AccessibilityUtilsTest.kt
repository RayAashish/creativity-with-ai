// app/src/test/java/com/raysi/launcher/service/AccessibilityUtilsTest.kt
package com.raysi.launcher.service

import android.content.Intent
import android.provider.Settings
import org.junit.Assert.assertNotNull
import org.junit.Test

class AccessibilityUtilsTest {

    @Test
    fun createAccessibilitySettingsIntent_createsNonNullIntent() {
        val intent = AccessibilityUtils.createAccessibilitySettingsIntent()
        assertNotNull(intent)
    }
}
