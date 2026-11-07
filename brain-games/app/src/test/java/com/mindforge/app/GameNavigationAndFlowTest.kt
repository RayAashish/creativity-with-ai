package com.mindforge.app

import com.mindforge.app.core.navigation.Screen
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.entity.GameStatEntity
import com.mindforge.app.feature.game.focus.GoNoGoEngine
import com.mindforge.app.feature.game.focus.OddOneOutEngine
import com.mindforge.app.feature.game.focus.ReactionTapEngine
import com.mindforge.app.feature.game.focus.SchulteTableEngine
import com.mindforge.app.feature.game.focus.StroopTestEngine
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameRegistry
import com.mindforge.app.feature.game.instructions.GameInstructionsViewModel
import com.mindforge.app.feature.game.language.WordChainEngine
import com.mindforge.app.feature.game.language.WordScrambleEngine
import com.mindforge.app.feature.game.logic.BalanceWeightsEngine
import com.mindforge.app.feature.game.logic.LightsOutEngine
import com.mindforge.app.feature.game.logic.MiniSudokuEngine
import com.mindforge.app.feature.game.logic.PatternMatrixEngine
import com.mindforge.app.feature.game.math.MissingOperatorEngine
import com.mindforge.app.feature.game.math.NumberSequenceEngine
import com.mindforge.app.feature.game.math.OfflineDuelEngine
import com.mindforge.app.feature.game.math.PercentSprintEngine
import com.mindforge.app.feature.game.math.QuickCalcEngine
import com.mindforge.app.feature.game.math.SpeedChainEngine
import com.mindforge.app.feature.game.math.SquaresCubesEngine
import com.mindforge.app.feature.game.math.Target24Engine
import com.mindforge.app.feature.game.math.TrueFalseCalcEngine
import com.mindforge.app.feature.game.memory.CardMatchEngine
import com.mindforge.app.feature.game.memory.DigitSpanEngine
import com.mindforge.app.feature.game.memory.NBackEngine
import com.mindforge.app.feature.game.memory.SequenceMemoryEngine
import com.mindforge.app.feature.game.memory.SpatialGridEngine
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class GameNavigationAndFlowTest {

    private lateinit var registry: GameRegistry
    private lateinit var allEngines: Set<GameEngine>

    @Before
    fun setup() {
        allEngines = setOf(
            QuickCalcEngine(), SpeedChainEngine(), MissingOperatorEngine(),
            SquaresCubesEngine(), PercentSprintEngine(), TrueFalseCalcEngine(),
            Target24Engine(), NumberSequenceEngine(), OfflineDuelEngine(),
            SequenceMemoryEngine(), CardMatchEngine(), DigitSpanEngine(),
            SpatialGridEngine(), NBackEngine(),
            StroopTestEngine(), SchulteTableEngine(), OddOneOutEngine(),
            ReactionTapEngine(), GoNoGoEngine(),
            PatternMatrixEngine(), LightsOutEngine(), MiniSudokuEngine(), BalanceWeightsEngine(),
            WordScrambleEngine(), WordChainEngine()
        )
        registry = GameRegistry(allEngines)
    }

    @Test
    fun testAll25Engines_RegisteredAndQueryable() {
        assertEquals(25, registry.getAllEngines().size)

        allEngines.forEach { engine ->
            val retrieved = registry.getEngine(engine.id)
            assertNotNull("Engine must be found for id: ${engine.id}", retrieved)
            assertEquals(engine.title, retrieved.title)
            assertEquals(engine.category, retrieved.category)
            assertTrue(retrieved.instructions.isNotEmpty())
            assertTrue(retrieved.tips.isNotEmpty())
        }
    }

    @Test
    fun testGameInstructionsViewModel_synchronousResolutionNeverReturnsNull() {
        val fakeDao = object : GameStatDao {
            override suspend fun upsertGameStat(stat: GameStatEntity) {}
            override suspend fun getGameStat(gameId: String): GameStatEntity? = null
            override fun observeGameStat(gameId: String): Flow<GameStatEntity?> = flowOf(null)
            override fun getAllGameStats(): Flow<List<GameStatEntity>> = flowOf(emptyList())
            override fun getTotalStarsFlow(): Flow<Int?> = flowOf(0)
            override suspend fun clearAll() {}
        }

        val viewModel = GameInstructionsViewModel(
            gameRegistry = registry,
            gameStatDao = fakeDao
        )

        allEngines.forEach { engine ->
            val syncEngine = viewModel.getEngine(engine.id)
            assertNotNull("ViewModel must synchronously resolve engine for ${engine.id}", syncEngine)
            assertEquals(engine.id, syncEngine?.id)
        }
    }

    @Test
    fun testScreenRoutes_GamePlayCarriesPracticeFlag() {
        val playNormal = Screen.GamePlay(gameId = "quick_calc", level = 2, isPractice = false)
        val playPractice = Screen.GamePlay(gameId = "quick_calc", level = 2, isPractice = true)

        assertEquals("quick_calc", playNormal.gameId)
        assertEquals(2, playNormal.level)
        assertEquals(false, playNormal.isPractice)

        assertEquals(true, playPractice.isPractice)
    }
}
