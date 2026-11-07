package com.mindforge.app.core.navigation

import kotlinx.serialization.Serializable

sealed interface Screen {
    @Serializable
    data object Onboarding : Screen

    @Serializable
    data object Home : Screen

    @Serializable
    data class GameInstructions(
        val gameId: String,
        val level: Int = 1
    ) : Screen

    @Serializable
    data class GamePlay(
        val gameId: String,
        val level: Int = 1,
        val isPractice: Boolean = false
    ) : Screen

    @Serializable
    data class GameResults(
        val sessionId: String
    ) : Screen

    @Serializable
    data object DailyChallenge : Screen

    @Serializable
    data object Stats : Screen

    @Serializable
    data object Achievements : Screen

    @Serializable
    data object Settings : Screen

    @Serializable
    data object ProfileEdit : Screen
}
