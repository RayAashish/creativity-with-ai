package com.cliplocker.app.core.model

import kotlinx.serialization.Serializable

@Serializable
enum class SecretTtl(val durationMillis: Long, val displayName: String) {
    ONE_MINUTE(60_000L, "1 min"),
    FIVE_MINUTES(5 * 60_000L, "5 min"),
    ONE_HOUR(60 * 60_000L, "1 hour"),
    TWENTY_FOUR_HOURS(24 * 60 * 60_000L, "24 hours"),
    CUSTOM(-1L, "Custom");

    companion object {
        fun fromDurationMillis(millis: Long): SecretTtl {
            return entries.firstOrNull { it.durationMillis == millis } ?: CUSTOM
        }
    }
}
