// app/src/main/java/com/raysi/launcher/data/usage/engine/UsageAggregationEngine.kt
package com.raysi.launcher.data.usage.engine

import com.raysi.launcher.data.usage.model.UsageEventRecord
import kotlin.math.max
import kotlin.math.min

data class UsageAggregationResult(
    val totalScreenTimeMs: Long,
    val unlockCount: Int,
    val perAppDurationsMs: Map<String, Long>,
    val currentlyForegroundPackage: String?,
    val isCurrentlyInteractive: Boolean
)

/**
 * Pure, deterministic usage events aggregation engine.
 * Handles:
 * 1. Activity pairing by package + class
 * 2. Missing pause events (graceful closure on package switch or screen off)
 * 3. Activity-to-activity transitions inside a single package (prevents double-counting)
 * 4. Sessions open across startOfDay (midnight rollover)
 * 5. Open sessions still running at "now"
 * 6. Screen interactive session tracking and unlocks
 */
object UsageAggregationEngine {

    fun aggregate(
        events: List<UsageEventRecord>,
        startOfDayMs: Long,
        nowMs: Long,
        ownPackageName: String
    ): UsageAggregationResult {
        if (nowMs <= startOfDayMs) {
            return UsageAggregationResult(
                totalScreenTimeMs = 0L,
                unlockCount = 0,
                perAppDurationsMs = emptyMap(),
                currentlyForegroundPackage = null,
                isCurrentlyInteractive = false
            )
        }

        val sortedEvents = events.sortedWith(compareBy({ it.timestampMs }, { it.eventType }))

        val perAppDurations = mutableMapOf<String, Long>()
        var unlockCount = 0

        // Screen-interactive tracking
        var screenInteractiveTotalMs = 0L
        var screenInteractiveStartMs: Long? = null
        var hasScreenEvents = false

        // Package foreground tracking
        // Tracks active activity classes per package: Map<packageName, Set<className>>
        val activeActivitiesPerPackage = mutableMapOf<String, MutableSet<String>>()
        // Tracks when a package entered foreground (when active activities went from 0 to 1)
        val packageForegroundStartMs = mutableMapOf<String, Long>()

        var currentForegroundPackage: String? = null
        val seenPackages = mutableSetOf<String>()
        var hasSeenScreenNonInteractive = false

        fun closePackageSession(pkg: String, closeTime: Long) {
            val start = packageForegroundStartMs.remove(pkg) ?: return
            activeActivitiesPerPackage.remove(pkg)
            seenPackages.add(pkg)
            val effectiveStart = max(start, startOfDayMs)
            val effectiveEnd = min(closeTime, nowMs)
            if (effectiveEnd > effectiveStart) {
                val duration = effectiveEnd - effectiveStart
                perAppDurations[pkg] = (perAppDurations[pkg] ?: 0L) + duration
            }
        }

        val closedStartOfDayPackages = mutableSetOf<String>()
        val maxPossibleDurationToday = max(0L, nowMs - startOfDayMs)

        for (event in sortedEvents) {
            val timestamp = event.timestampMs.coerceIn(startOfDayMs, nowMs)

            when (event.eventType) {
                UsageEventRecord.KEYGUARD_HIDDEN -> {
                    unlockCount++
                }

                UsageEventRecord.SCREEN_INTERACTIVE -> {
                    hasScreenEvents = true
                    if (screenInteractiveStartMs == null) {
                        screenInteractiveStartMs = timestamp
                    }
                }

                UsageEventRecord.SCREEN_NON_INTERACTIVE -> {
                    hasScreenEvents = true
                    hasSeenScreenNonInteractive = true
                    val start = screenInteractiveStartMs ?: startOfDayMs
                    val duration = max(0L, timestamp - start)
                    screenInteractiveTotalMs += duration
                    screenInteractiveStartMs = null

                    // Screen off pauses whatever package was in foreground
                    if (currentForegroundPackage != null) {
                        closePackageSession(currentForegroundPackage!!, timestamp)
                        currentForegroundPackage = null
                    }
                }

                UsageEventRecord.ACTIVITY_RESUMED -> {
                    val pkg = event.packageName
                    val cls = event.className
                    seenPackages.add(pkg)

                    // If a different package was previously in foreground without an explicit pause, close it
                    if (currentForegroundPackage != null && currentForegroundPackage != pkg) {
                        closePackageSession(currentForegroundPackage!!, timestamp)
                    }
                    currentForegroundPackage = pkg

                    val activeClasses = activeActivitiesPerPackage.getOrPut(pkg) { mutableSetOf() }
                    if (activeClasses.isEmpty()) {
                        packageForegroundStartMs[pkg] = timestamp
                    }
                    activeClasses.add(cls)

                    // If screen interactive state wasn't recorded, treat activity foreground as interactive
                    if (screenInteractiveStartMs == null) {
                        screenInteractiveStartMs = timestamp
                    }
                }

                UsageEventRecord.ACTIVITY_PAUSED -> {
                    val pkg = event.packageName
                    val cls = event.className

                    val activeClasses = activeActivitiesPerPackage[pkg]
                    if (activeClasses == null) {
                        // Only treat an unmatched pause as a midnight-rollover foreground session if:
                        // 1. We have not seen any prior session/close for this package today
                        // 2. The screen has not already gone non-interactive today
                        // 3. No other foreground package is currently known to own the screen before now
                        val canBeMidnightRollover =
                            !seenPackages.contains(pkg) &&
                                !hasSeenScreenNonInteractive &&
                                currentForegroundPackage == null &&
                                closedStartOfDayPackages.add(pkg)
                        if (canBeMidnightRollover) {
                            val duration = max(0L, timestamp - startOfDayMs)
                            if (duration > 0L) {
                                perAppDurations[pkg] = (perAppDurations[pkg] ?: 0L) + duration
                            }
                        }
                        seenPackages.add(pkg)
                    } else {
                        activeClasses.remove(cls)
                        // Only close the package's foreground interval when ALL activities of this package have paused
                        if (activeClasses.isEmpty()) {
                            closePackageSession(pkg, timestamp)
                            if (currentForegroundPackage == pkg) {
                                currentForegroundPackage = null
                            }
                        }
                    }
                }
            }
        }

        // Handle sessions still open at "now"
        val isScreenCurrentlyInteractive = screenInteractiveStartMs != null
        if (screenInteractiveStartMs != null) {
            val duration = max(0L, nowMs - screenInteractiveStartMs!!)
            screenInteractiveTotalMs += duration
        }

        if (currentForegroundPackage != null) {
            closePackageSession(currentForegroundPackage!!, nowMs)
        }

        // If no SCREEN_INTERACTIVE events were emitted by system (some OEM ROMs filter them),
        // fallback to the union of all activity foreground durations including the launcher
        val finalScreenTimeMs = if (hasScreenEvents) {
            screenInteractiveTotalMs
        } else {
            val allPackagesTotal = perAppDurations.values.sum()
            max(allPackagesTotal, screenInteractiveTotalMs)
        }

        // Clamp every per-app duration so an anomaly can never exceed total screen time or day length
        val upperDurationBound = if (hasScreenEvents && finalScreenTimeMs > 0L) {
            min(maxPossibleDurationToday, finalScreenTimeMs)
        } else {
            maxPossibleDurationToday
        }

        val finalPerAppDurations = perAppDurations
            .filterKeys { it != ownPackageName }
            .mapValues { min(it.value, upperDurationBound) }

        return UsageAggregationResult(
            totalScreenTimeMs = finalScreenTimeMs,
            unlockCount = unlockCount,
            perAppDurationsMs = finalPerAppDurations,
            currentlyForegroundPackage = currentForegroundPackage,
            isCurrentlyInteractive = isScreenCurrentlyInteractive
        )
    }
}
