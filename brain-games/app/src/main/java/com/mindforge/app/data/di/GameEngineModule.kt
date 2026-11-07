package com.mindforge.app.data.di

import com.mindforge.app.feature.game.focus.GoNoGoEngine
import com.mindforge.app.feature.game.focus.OddOneOutEngine
import com.mindforge.app.feature.game.focus.ReactionTapEngine
import com.mindforge.app.feature.game.focus.SchulteTableEngine
import com.mindforge.app.feature.game.focus.StroopTestEngine
import com.mindforge.app.feature.game.framework.GameEngine
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
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dagger.multibindings.IntoSet

@Module
@InstallIn(SingletonComponent::class)
abstract class GameEngineModule {

    // Math (9)
    @Binds @IntoSet abstract fun bindQuickCalc(e: QuickCalcEngine): GameEngine
    @Binds @IntoSet abstract fun bindSpeedChain(e: SpeedChainEngine): GameEngine
    @Binds @IntoSet abstract fun bindMissingOperator(e: MissingOperatorEngine): GameEngine
    @Binds @IntoSet abstract fun bindSquaresCubes(e: SquaresCubesEngine): GameEngine
    @Binds @IntoSet abstract fun bindPercentSprint(e: PercentSprintEngine): GameEngine
    @Binds @IntoSet abstract fun bindTrueFalse(e: TrueFalseCalcEngine): GameEngine
    @Binds @IntoSet abstract fun bindTarget24(e: Target24Engine): GameEngine
    @Binds @IntoSet abstract fun bindNumberSequence(e: NumberSequenceEngine): GameEngine
    @Binds @IntoSet abstract fun bindOfflineDuel(e: OfflineDuelEngine): GameEngine

    // Memory (5)
    @Binds @IntoSet abstract fun bindSequenceMemory(e: SequenceMemoryEngine): GameEngine
    @Binds @IntoSet abstract fun bindCardMatch(e: CardMatchEngine): GameEngine
    @Binds @IntoSet abstract fun bindDigitSpan(e: DigitSpanEngine): GameEngine
    @Binds @IntoSet abstract fun bindSpatialGrid(e: SpatialGridEngine): GameEngine
    @Binds @IntoSet abstract fun bindNBack(e: NBackEngine): GameEngine

    // Focus & Speed (5)
    @Binds @IntoSet abstract fun bindStroopTest(e: StroopTestEngine): GameEngine
    @Binds @IntoSet abstract fun bindSchulteTable(e: SchulteTableEngine): GameEngine
    @Binds @IntoSet abstract fun bindOddOneOut(e: OddOneOutEngine): GameEngine
    @Binds @IntoSet abstract fun bindReactionTap(e: ReactionTapEngine): GameEngine
    @Binds @IntoSet abstract fun bindGoNoGo(e: GoNoGoEngine): GameEngine

    // Logic (4)
    @Binds @IntoSet abstract fun bindPatternMatrix(e: PatternMatrixEngine): GameEngine
    @Binds @IntoSet abstract fun bindLightsOut(e: LightsOutEngine): GameEngine
    @Binds @IntoSet abstract fun bindMiniSudoku(e: MiniSudokuEngine): GameEngine
    @Binds @IntoSet abstract fun bindBalanceWeights(e: BalanceWeightsEngine): GameEngine

    // Language (2)
    @Binds @IntoSet abstract fun bindWordScramble(e: WordScrambleEngine): GameEngine
    @Binds @IntoSet abstract fun bindWordChain(e: WordChainEngine): GameEngine
}
