// app/src/test/java/com/raysi/launcher/service/notification/NotificationFilterTest.kt
package com.raysi.launcher.service.notification

import android.app.Notification
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class NotificationFilterTest {

    private val launcherPackage = "com.raysi.launcher"
    private val defaultSmsPackage = "com.google.android.apps.messaging"
    private val alwaysAllowList = setOf("com.work.chat", "com.banking.app")

    private fun createMetadata(
        packageName: String = "com.distracting.social",
        isOngoing: Boolean = false,
        flags: Int = 0,
        category: String? = null,
        template: String? = null,
        hasMediaSession: Boolean = false,
        isCallStyle: Boolean = false
    ): NotificationMetadata {
        return NotificationMetadata(
            packageName = packageName,
            isOngoing = isOngoing,
            flags = flags,
            category = category,
            template = template,
            hasMediaSession = hasMediaSession,
            isCallStyle = isCallStyle
        )
    }

    @Test
    fun testLauncherSelfPackageIsExempt() {
        val meta = createMetadata(packageName = launcherPackage)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Launcher package exempt", decision.reason)
    }

    @Test
    fun testSystemUiPackageIsExempt() {
        val meta = createMetadata(packageName = "com.android.systemui")
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("System package exempt", decision.reason)
    }

    @Test
    fun testDefaultSmsAppIsExempt() {
        val meta = createMetadata(packageName = defaultSmsPackage)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Default SMS app exempt", decision.reason)
    }

    @Test
    fun testAlwaysAllowUserListIsExempt() {
        val meta = createMetadata(packageName = "com.work.chat")
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("User always-allow list exempt", decision.reason)
    }

    @Test
    fun testOngoingNotificationIsExempt() {
        val meta = createMetadata(isOngoing = true)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Ongoing / Foreground service exempt", decision.reason)
    }

    @Test
    fun testForegroundServiceFlagIsExempt() {
        val meta = createMetadata(flags = Notification.FLAG_FOREGROUND_SERVICE)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Ongoing / Foreground service exempt", decision.reason)
    }

    @Test
    fun testOngoingEventFlagIsExempt() {
        val meta = createMetadata(flags = Notification.FLAG_ONGOING_EVENT)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Ongoing / Foreground service exempt", decision.reason)
    }

    @Test
    fun testMediaSessionIsExempt() {
        val meta = createMetadata(hasMediaSession = true)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Media notification exempt", decision.reason)
    }

    @Test
    fun testMediaTemplateIsExempt() {
        val meta = createMetadata(template = "android.app.Notification\$MediaStyle")
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Media notification exempt", decision.reason)
    }

    @Test
    fun testTransportCategoryIsExempt() {
        val meta = createMetadata(category = Notification.CATEGORY_TRANSPORT)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Media notification exempt", decision.reason)
    }

    @Test
    fun testCallNotificationIsExempt() {
        val meta = createMetadata(category = Notification.CATEGORY_CALL)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Call notification exempt", decision.reason)
    }

    @Test
    fun testCallStyleIsExempt() {
        val meta = createMetadata(isCallStyle = true)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertEquals("Call notification exempt", decision.reason)
    }

    @Test
    fun testAlarmCategoryIsExempt() {
        val meta = createMetadata(category = Notification.CATEGORY_ALARM)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertTrue(decision.reason.contains("Category exempt"))
    }

    @Test
    fun testReminderCategoryIsExempt() {
        val meta = createMetadata(category = Notification.CATEGORY_REMINDER)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertTrue(decision.reason.contains("Category exempt"))
    }

    @Test
    fun testEventCategoryIsExempt() {
        val meta = createMetadata(category = Notification.CATEGORY_EVENT)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertTrue(decision.reason.contains("Category exempt"))
    }

    @Test
    fun testNavigationCategoryIsExempt() {
        val meta = createMetadata(category = Notification.CATEGORY_NAVIGATION)
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertFalse(decision.shouldQuarantine)
        assertTrue(decision.reason.contains("Category exempt"))
    }

    @Test
    fun testSocialMediaNotificationIsQuarantined() {
        val meta = createMetadata(packageName = "com.instagram.android")
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertTrue(decision.shouldQuarantine)
        assertEquals("Quarantined for intentional focus", decision.reason)
    }

    @Test
    fun testNonDefaultMessengerIsQuarantinedUnlessAllowlisted() {
        val meta = createMetadata(packageName = "com.whatsapp")
        // Not in alwaysAllowList -> quarantined!
        val decision = NotificationFilter.evaluate(meta, alwaysAllowList, defaultSmsPackage, launcherPackage)
        assertTrue(decision.shouldQuarantine)

        // When added to allowlist -> exempt!
        val allowDecision = NotificationFilter.evaluate(
            meta,
            alwaysAllowList + "com.whatsapp",
            defaultSmsPackage,
            launcherPackage
        )
        assertFalse(allowDecision.shouldQuarantine)
    }
}
