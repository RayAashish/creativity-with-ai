package com.mindforge.app.domain.achievement

import com.mindforge.app.data.local.db.dao.AchievementDao
import com.mindforge.app.data.local.db.dao.DailyActivityDao
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.dao.SessionDao
import com.mindforge.app.data.local.db.dao.StreakDao
import com.mindforge.app.data.local.db.entity.AchievementEntity
import com.mindforge.app.data.local.preferences.UserPreferencesRepository
import com.mindforge.app.feature.home.GameCategory
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AchievementEngine @Inject constructor(
    private val achievementDao: AchievementDao,
    private val sessionDao: SessionDao,
    private val gameStatDao: GameStatDao,
    private val dailyActivityDao: DailyActivityDao,
    private val streakDao: StreakDao,
    private val preferencesRepository: UserPreferencesRepository
) {
    suspend fun syncAchievements() {
        val allEntities = achievementDao.observeAllAchievements().first().associateBy { it.id }
        val sessions = sessionDao.getRecentSessions(500).first()
        val stats = gameStatDao.getAllGameStats().first()
        val streak = streakDao.getStreak()
        val prefs = preferencesRepository.userPreferencesFlow.first()

        val totalSessions = sessions.size
        val totalStars = stats.sumOf { it.totalStars }
        val currentStreak = streak?.currentStreak ?: 0
        val longestStreak = streak?.longestStreak ?: 0
        val effectiveStreak = maxOf(currentStreak, longestStreak)

        val updates = mutableListOf<AchievementEntity>()

        for (def in AchievementCatalog.allAchievements) {
            val existing = allEntities[def.id]
            var currentProgress = existing?.progress ?: 0

            when (def.id) {
                "first_forge" -> currentProgress = if (totalSessions >= 1) 1 else 0
                "three_sessions" -> currentProgress = minOf(3, totalSessions)
                "ten_sessions" -> currentProgress = minOf(10, totalSessions)
                "twenty_five_sessions" -> currentProgress = minOf(25, totalSessions)
                "fifty_sessions" -> currentProgress = minOf(50, totalSessions)
                "hundred_sessions" -> currentProgress = minOf(100, totalSessions)
                "first_3_star" -> currentProgress = if (sessions.any { it.stars == 3 }) 1 else 0
                "ten_stars" -> currentProgress = minOf(10, totalStars)
                "thirty_stars" -> currentProgress = minOf(30, totalStars)
                "sixty_stars" -> currentProgress = minOf(60, totalStars)

                "streak_3" -> currentProgress = minOf(3, effectiveStreak)
                "streak_7" -> currentProgress = minOf(7, effectiveStreak)
                "streak_14" -> currentProgress = minOf(14, effectiveStreak)
                "streak_21" -> currentProgress = minOf(21, effectiveStreak)
                "streak_30" -> currentProgress = minOf(30, effectiveStreak)
                "streak_60" -> currentProgress = minOf(60, effectiveStreak)
                "streak_100" -> currentProgress = minOf(100, effectiveStreak)

                "calc_quick_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "quick_calc" })
                "calc_chain_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "speed_chain" })
                "calc_missing_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "missing_operator" })
                "calc_powers_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "squares_cubes" })
                "calc_percent_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "percent_sprint" })
                "calc_true_false_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "true_false_calc" })
                "calc_target24_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "target_24" })

                "mem_seq_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "sequence_memory" })
                "mem_cards_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "card_match" })
                "mem_digit_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "digit_span" })
                "mem_grid_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "spatial_grid" })
                "mem_nback_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "n_back" })

                "focus_stroop_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "stroop_test" })
                "focus_schulte_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "schulte_table" })
                "focus_odd_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "odd_one_out" })
                "focus_reaction_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "reaction_tap" })
                "focus_gng_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "go_no_go" })

                "logic_matrix_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "pattern_matrix" })
                "logic_lights_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "lights_out" })
                "logic_sudoku_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "mini_sudoku" })
                "logic_balance_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "balance_weights" })

                "lang_scramble_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "word_scramble" })
                "lang_chain_1" -> currentProgress = minOf(5, sessions.count { it.gameId == "word_chain" })

                "all_round_athlete" -> {
                    val playedCats = sessions.map { it.category }.toSet()
                    currentProgress = minOf(5, playedCats.size)
                }
                "level_10_player" -> currentProgress = minOf(10, prefs.playerLevel)
                else -> {
                    // Default fallback
                    currentProgress = existing?.progress ?: 0
                }
            }

            val isUnlocked = currentProgress >= def.maxProgress
            val unlockedAt = if (isUnlocked && (existing == null || !existing.isUnlocked)) {
                System.currentTimeMillis()
            } else {
                existing?.unlockedAt
            }

            updates.add(
                AchievementEntity(
                    id = def.id,
                    progress = currentProgress,
                    maxProgress = def.maxProgress,
                    isUnlocked = isUnlocked,
                    unlockedAt = unlockedAt
                )
            )
        }

        achievementDao.upsertAchievements(updates)
    }
}
