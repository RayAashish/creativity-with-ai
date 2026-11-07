// app/src/main/java/com/raysi/launcher/service/notification/NotificationFilter.kt
package com.raysi.launcher.service.notification

import android.app.Notification
import android.os.Build
import android.service.notification.StatusBarNotification

/**
 * Filter decision explaining whether and why a notification should be quarantined or passed through.
 */
data class FilterDecision(
    val shouldQuarantine: Boolean,
    val reason: String
)

/**
 * Normalized metadata decoupled from Android runtime dependencies to allow 100% deterministic unit testing.
 */
data class NotificationMetadata(
    val packageName: String,
    val isOngoing: Boolean,
    val flags: Int,
    val category: String?,
    val template: String?,
    val hasMediaSession: Boolean,
    val isCallStyle: Boolean
)

object NotificationFilter {

    private val EXEMPT_CATEGORIES = setOf(
        Notification.CATEGORY_CALL,
        Notification.CATEGORY_ALARM,
        Notification.CATEGORY_REMINDER,
        Notification.CATEGORY_EVENT,
        Notification.CATEGORY_NAVIGATION,
        Notification.CATEGORY_TRANSPORT
    )

    private val SYSTEM_EXEMPT_PACKAGES = setOf(
        "android",
        "com.android.systemui",
        "com.android.server.telecom",
        "com.android.phone"
    )

    /**
     * Determines whether a notification should be intercepted and quarantined.
     *
     * @param metadata Extracted notification metadata
     * @param alwaysAllowPackages User-configured allowlist
     * @param defaultSmsPackage Package name of the default SMS app (from Telephony.Sms)
     * @param launcherPackage Package name of this launcher
     */
    fun evaluate(
        metadata: NotificationMetadata,
        alwaysAllowPackages: Set<String>,
        defaultSmsPackage: String?,
        launcherPackage: String
    ): FilterDecision {
        val pkg = metadata.packageName

        // 1. Never touch notifications from this launcher app
        if (pkg == launcherPackage) {
            return FilterDecision(false, "Launcher package exempt")
        }

        // 2. Never touch core system UI or telecom framework
        if (SYSTEM_EXEMPT_PACKAGES.contains(pkg)) {
            return FilterDecision(false, "System package exempt")
        }

        // 3. Never touch default SMS application
        if (!defaultSmsPackage.isNullOrEmpty() && pkg == defaultSmsPackage) {
            return FilterDecision(false, "Default SMS app exempt")
        }

        // 4. Never touch user's always-allow list
        if (alwaysAllowPackages.contains(pkg)) {
            return FilterDecision(false, "User always-allow list exempt")
        }

        // 5. Never touch ongoing or foreground service notifications
        val isOngoingFlag = (metadata.flags and Notification.FLAG_ONGOING_EVENT) != 0
        val isForegroundFlag = (metadata.flags and Notification.FLAG_FOREGROUND_SERVICE) != 0
        if (metadata.isOngoing || isOngoingFlag || isForegroundFlag) {
            return FilterDecision(false, "Ongoing / Foreground service exempt")
        }

        // 6. Never touch media notifications
        if (metadata.hasMediaSession ||
            metadata.template == "android.app.Notification\$MediaStyle" ||
            metadata.template == "androidx.media.app.NotificationCompat\$MediaStyle" ||
            metadata.category == Notification.CATEGORY_TRANSPORT
        ) {
            return FilterDecision(false, "Media notification exempt")
        }

        // 7. Never touch call notifications (or call-style notifications)
        if (metadata.isCallStyle || metadata.category == Notification.CATEGORY_CALL) {
            return FilterDecision(false, "Call notification exempt")
        }

        // 8. Never touch exempt categories: ALARM, REMINDER, EVENT, NAVIGATION
        val cat = metadata.category
        if (cat != null && EXEMPT_CATEGORIES.contains(cat)) {
            return FilterDecision(false, "Category exempt: $cat")
        }

        // 9. All other notifications are quarantined!
        return FilterDecision(true, "Quarantined for intentional focus")
    }

    /**
     * Extracts NotificationMetadata safely from a live StatusBarNotification.
     */
    fun extractMetadata(sbn: StatusBarNotification): NotificationMetadata {
        val notif = sbn.notification
        val extras = notif.extras

        val template = extras?.getString(Notification.EXTRA_TEMPLATE)
        val hasMediaSession = extras?.containsKey(Notification.EXTRA_MEDIA_SESSION) == true
        val isCallStyle = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            template?.contains("CallStyle", ignoreCase = true) == true
        } else {
            extras?.containsKey("android.callType") == true
        }

        return NotificationMetadata(
            packageName = sbn.packageName,
            isOngoing = sbn.isOngoing,
            flags = notif.flags,
            category = notif.category,
            template = template,
            hasMediaSession = hasMediaSession,
            isCallStyle = isCallStyle
        )
    }
}
