package com.mindforge.app.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindforge.app.core.theme.CategoryThemes
import com.mindforge.app.data.local.db.dao.DailyActivityDao
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.dao.StreakDao
import com.mindforge.app.data.local.db.entity.DailyActivityEntity
import com.mindforge.app.data.local.db.entity.GameStatEntity
import com.mindforge.app.data.local.db.entity.StreakRecordEntity
import com.mindforge.app.data.local.preferences.UserPreferences
import com.mindforge.app.data.local.preferences.UserPreferencesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject

enum class GameCategory(val title: String, val gameCount: Int) {
    MATH("Mental Math", 9),
    MEMORY("Memory", 5),
    FOCUS("Focus & Speed", 5),
    LOGIC("Logic & Puzzles", 4),
    LANGUAGE("Language", 2)
}

data class GameSummary(
    val id: String,
    val title: String,
    val description: String,
    val category: GameCategory,
    val isAdvanced: Boolean = false,
    val unlockedLevel: Int = 1,
    val stars: Int = 0,
    val bestScore: Int = 0
)

data class HomeUiState(
    val userPreferences: UserPreferences = UserPreferences(),
    val streak: StreakRecordEntity = StreakRecordEntity(),
    val todayActivity: DailyActivityEntity? = null,
    val selectedCategory: GameCategory = GameCategory.MATH,
    val dailyChallengeGames: List<GameSummary> = emptyList(),
    val gamesList: List<GameSummary> = emptyList(),
    val totalStarsEarned: Int = 0
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val preferencesRepository: UserPreferencesRepository,
    private val streakDao: StreakDao,
    private val dailyActivityDao: DailyActivityDao,
    private val gameStatDao: GameStatDao
) : ViewModel() {

    private val _selectedCategory = MutableStateFlow(GameCategory.MATH)
    private val todayString = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

    val uiState: StateFlow<HomeUiState> = combine(
        preferencesRepository.userPreferencesFlow,
        streakDao.observeStreak(),
        dailyActivityDao.observeTodayActivity(todayString),
        gameStatDao.getAllGameStats(),
        _selectedCategory
    ) { prefs, streak, activity, stats, selectedCat ->
        val statMap = stats.associateBy { it.gameId }
        val allGames = getAllCatalogGames(statMap)
        val dailyChallenge = computeDailyChallenge(allGames)
        val filteredGames = allGames.filter { it.category == selectedCat }
        val totalStars = stats.sumOf { it.totalStars }

        HomeUiState(
            userPreferences = prefs,
            streak = streak ?: StreakRecordEntity(),
            todayActivity = activity,
            selectedCategory = selectedCat,
            dailyChallengeGames = dailyChallenge,
            gamesList = filteredGames,
            totalStarsEarned = totalStars
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = HomeUiState()
    )

    fun selectCategory(category: GameCategory) {
        _selectedCategory.value = category
    }

    private fun computeDailyChallenge(allGames: List<GameSummary>): List<GameSummary> {
        val today = LocalDate.now()
        val seed = today.year * 10000L + today.monthValue * 100L + today.dayOfMonth
        val rng = kotlin.random.Random(seed)
        // Pick 3 distinct basic games deterministically
        val candidates = allGames.filter { !it.isAdvanced }
        return candidates.shuffled(rng).take(3)
    }

    private fun getAllCatalogGames(stats: Map<String, GameStatEntity>): List<GameSummary> {
        return listOf(
            // Math Category (9)
            createSummary("quick_calc", "Quick Calc", "Rapid arithmetic with chained operations and BODMAS", GameCategory.MATH, false, stats),
            createSummary("speed_chain", "Speed Chain", "Maintain a running total as modifiers stream in", GameCategory.MATH, false, stats),
            createSummary("missing_operator", "Missing Element", "Deduce the missing operator or operand under time pressure", GameCategory.MATH, false, stats),
            createSummary("squares_cubes", "Powers & Roots", "Instant recall of squares, cubes, and square roots", GameCategory.MATH, true, stats),
            createSummary("percent_sprint", "Percent Sprint", "Speedy percentages, discounts, and fraction conversions", GameCategory.MATH, false, stats),
            createSummary("true_false_calc", "True or False", "Rapid equation estimation under a high-speed clock", GameCategory.MATH, false, stats),
            createSummary("target_24", "Target 24", "Combine operands and operations to strike the target", GameCategory.MATH, true, stats),
            createSummary("number_sequence", "Number Sequence", "Identify arithmetic, Fibonacci, and geometric progressions", GameCategory.MATH, true, stats),
            createSummary("offline_duel", "Offline Duel", "Race against a simulated local AI bot opponent", GameCategory.MATH, true, stats),

            // Memory Category (5)
            createSummary("sequence_memory", "Sequence Memory", "Follow and reproduce growing audio-visual patterns", GameCategory.MEMORY, false, stats),
            createSummary("card_match", "Card Match", "Flip, memorize, and pair matching synaptic glyphs", GameCategory.MEMORY, false, stats),
            createSummary("digit_span", "Digit Span", "Recall forward and reverse numeric sequences", GameCategory.MEMORY, false, stats),
            createSummary("spatial_grid", "Spatial Grid", "Memorize briefly illuminated matrix coordinate cells", GameCategory.MEMORY, true, stats),
            createSummary("n_back", "N-Back", "Continuous cognitive stream matching 1-back, 2-back, 3-back", GameCategory.MEMORY, true, stats),

            // Focus & Speed (5)
            createSummary("stroop_test", "Stroop Test", "Overcome cognitive interference between color and word", GameCategory.FOCUS, false, stats),
            createSummary("schulte_table", "Schulte Grid", "Rapid peripheral visual search from 1 to N", GameCategory.FOCUS, false, stats),
            createSummary("odd_one_out", "Odd One Out", "Spot the subtle anomaly among uniform patterns", GameCategory.FOCUS, false, stats),
            createSummary("reaction_tap", "Reaction Tap", "Measure raw millisecond visual-to-motor response time", GameCategory.FOCUS, false, stats),
            createSummary("go_no_go", "Go / No-Go", "Inhibition training: tap targets, suppress on distractors", GameCategory.FOCUS, true, stats),

            // Logic (4)
            createSummary("pattern_matrix", "Pattern Matrix", "Complete 3x3 visual and symbolic deduction matrices", GameCategory.LOGIC, true, stats),
            createSummary("lights_out", "Lights Out", "Toggle all cells off in minimal moves", GameCategory.LOGIC, false, stats),
            createSummary("mini_sudoku", "Mini Sudoku", "4x4 and 6x6 deductive latin square puzzles", GameCategory.LOGIC, false, stats),
            createSummary("balance_weights", "Balance Weights", "Deduce relative weights from balance scale inequalities", GameCategory.LOGIC, true, stats),

            // Language (2)
            createSummary("word_scramble", "Word Scramble", "Unscramble jumbled letters into dictionary words", GameCategory.LANGUAGE, false, stats),
            createSummary("word_chain", "Word Chain", "Build continuous lexical chains via shared syllables", GameCategory.LANGUAGE, true, stats)
        )
    }

    private fun createSummary(
        id: String,
        title: String,
        desc: String,
        category: GameCategory,
        isAdvanced: Boolean,
        stats: Map<String, GameStatEntity>
    ): GameSummary {
        val stat = stats[id]
        return GameSummary(
            id = id,
            title = title,
            description = desc,
            category = category,
            isAdvanced = isAdvanced,
            unlockedLevel = stat?.highestLevelUnlocked ?: 1,
            stars = stat?.totalStars ?: 0,
            bestScore = stat?.bestScore ?: 0
        )
    }
}
