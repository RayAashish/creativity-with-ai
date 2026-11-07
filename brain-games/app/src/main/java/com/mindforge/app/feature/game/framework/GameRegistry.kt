package com.mindforge.app.feature.game.framework

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GameRegistry @Inject constructor(
    private val gameEngines: Set<@JvmSuppressWildcards GameEngine>
) {
    private val enginesById: Map<String, GameEngine> by lazy {
        gameEngines.associateBy { it.id }
    }

    fun getEngine(gameId: String): GameEngine {
        return enginesById[gameId]
            ?: throw IllegalArgumentException("Game engine not found for id: $gameId")
    }

    fun getAllEngines(): List<GameEngine> {
        return gameEngines.toList()
    }
}
