package com.mindforge.app.domain.achievement

import com.mindforge.app.feature.home.GameCategory

data class AchievementDef(
    val id: String,
    val title: String,
    val description: String,
    val category: String, // "GENERAL", "STREAK", "MATH", "MEMORY", "FOCUS", "LOGIC", "LANGUAGE"
    val maxProgress: Int,
    val iconGlyph: String = "✦"
)

object AchievementCatalog {
    val allAchievements: List<AchievementDef> = listOf(
        // General / Onboarding (1..10)
        AchievementDef("first_forge", "First Spark", "Complete your first mini-game session.", "GENERAL", 1, "⚡"),
        AchievementDef("three_sessions", "Warm-Up", "Complete 3 training sessions.", "GENERAL", 3, "🎯"),
        AchievementDef("ten_sessions", "Getting Fired Up", "Complete 10 training sessions.", "GENERAL", 10, "🔥"),
        AchievementDef("twenty_five_sessions", "Dedicated Athlete", "Complete 25 training sessions.", "GENERAL", 25, "🏅"),
        AchievementDef("fifty_sessions", "Crucible Veteran", "Complete 50 training sessions.", "GENERAL", 50, "🏆"),
        AchievementDef("hundred_sessions", "Centurion", "Complete 100 training sessions.", "GENERAL", 100, "👑"),
        AchievementDef("first_3_star", "Flawless Form", "Earn 3 stars in any mini-game level.", "GENERAL", 1, "⭐"),
        AchievementDef("ten_stars", "Starlit Path", "Accumulate 10 total stars across all games.", "GENERAL", 10, "✨"),
        AchievementDef("thirty_stars", "Constellation", "Accumulate 30 total stars.", "GENERAL", 30, "🌟"),
        AchievementDef("sixty_stars", "Starforged", "Accumulate 60 total stars.", "GENERAL", 60, "🌌"),

        // Streaks (11..20)
        AchievementDef("streak_3", "Spark Ignited", "Maintain a 3-day training streak.", "STREAK", 3, "🔥"),
        AchievementDef("streak_7", "Weekly Cadence", "Maintain a 7-day training streak.", "STREAK", 7, "🛡️"),
        AchievementDef("streak_14", "Fortnight of Focus", "Maintain a 14-day training streak.", "STREAK", 14, "⚔️"),
        AchievementDef("streak_21", "Habit Formed", "Maintain a 21-day training streak.", "STREAK", 21, "🧠"),
        AchievementDef("streak_30", "Iron Will", "Maintain a 30-day training streak.", "STREAK", 30, "💎"),
        AchievementDef("streak_60", "Two Moons", "Maintain a 60-day training streak.", "STREAK", 60, "🌕"),
        AchievementDef("streak_100", "The Unbroken", "Maintain an epic 100-day streak.", "STREAK", 100, "👑"),
        AchievementDef("first_daily_challenge", "Daily Victor", "Complete your first Daily Challenge.", "STREAK", 1, "⚡"),
        AchievementDef("five_daily_challenges", "Challenge Connoisseur", "Complete 5 Daily Challenges.", "STREAK", 5, "🎯"),
        AchievementDef("ten_daily_challenges", "Master of Routine", "Complete 10 Daily Challenges.", "STREAK", 10, "🏆"),

        // Mental Math (21..28)
        AchievementDef("calc_quick_1", "Speedy Adder", "Play Quick Calc 5 times.", "MATH", 5, "➕"),
        AchievementDef("calc_chain_1", "Chain Keeper", "Play Speed Chain 5 times.", "MATH", 5, "🔗"),
        AchievementDef("calc_missing_1", "Algebraic Eye", "Play Missing Element 5 times.", "MATH", 5, "❓"),
        AchievementDef("calc_powers_1", "Exponent Guru", "Play Powers & Roots 5 times.", "MATH", 5, "²"),
        AchievementDef("calc_percent_1", "Percentage Pro", "Play Percent Sprint 5 times.", "MATH", 5, "%"),
        AchievementDef("calc_true_false_1", "Instinctive Judge", "Play True or False 5 times.", "MATH", 5, "✓"),
        AchievementDef("calc_target24_1", "24 Striker", "Play Target 24 5 times.", "MATH", 5, "🎯"),
        AchievementDef("math_master", "Grand Arithmetician", "Earn 20 stars across Mental Math games.", "MATH", 20, "📐"),

        // Memory (29..36)
        AchievementDef("mem_seq_1", "Pattern Follower", "Play Sequence Memory 5 times.", "MEMORY", 5, "🎵"),
        AchievementDef("mem_cards_1", "Glyph Matcher", "Play Card Match 5 times.", "MEMORY", 5, "🃏"),
        AchievementDef("mem_digit_1", "Digit Retainer", "Play Digit Span 5 times.", "MEMORY", 5, "🔢"),
        AchievementDef("mem_grid_1", "Spatial Architect", "Play Spatial Grid 5 times.", "MEMORY", 5, "▦"),
        AchievementDef("mem_nback_1", "Cognitive Juggler", "Play N-Back 5 times.", "MEMORY", 5, "🔄"),
        AchievementDef("mem_perfect_span", "Limitless Recall", "Score 100% accuracy on Digit Span.", "MEMORY", 1, "💎"),
        AchievementDef("mem_nback_3back", "Deep Buffer", "Reach Level 8 in N-Back.", "MEMORY", 1, "🧠"),
        AchievementDef("memory_master", "Total Recall", "Earn 15 stars across Memory games.", "MEMORY", 15, "🔮"),

        // Focus & Reaction (37..44)
        AchievementDef("focus_stroop_1", "Color Disinhibitor", "Play Stroop Test 5 times.", "FOCUS", 5, "🎨"),
        AchievementDef("focus_schulte_1", "Peripheral Eye", "Play Schulte Grid 5 times.", "FOCUS", 5, "👀"),
        AchievementDef("focus_odd_1", "Eagle Eye", "Play Odd One Out 5 times.", "FOCUS", 5, "🦅"),
        AchievementDef("focus_reaction_1", "Lightning Reflex", "Play Reaction Tap 5 times.", "FOCUS", 5, "⚡"),
        AchievementDef("focus_gng_1", "Pure Control", "Play Go / No-Go 5 times.", "FOCUS", 5, "🛑"),
        AchievementDef("focus_sub_250ms", "Supersonic", "Achieve a sub-2.0s average speed in any game.", "FOCUS", 1, "⏱️"),
        AchievementDef("focus_zero_mistakes", "Precision Strikes", "Complete 5 games with zero mistakes.", "FOCUS", 5, "🎯"),
        AchievementDef("focus_master", "Unshakable", "Earn 15 stars across Focus games.", "FOCUS", 15, "🧘"),

        // Logic (45..52)
        AchievementDef("logic_matrix_1", "Matrix Solver", "Play Pattern Matrix 5 times.", "LOGIC", 5, "🧩"),
        AchievementDef("logic_lights_1", "Circuit Breaker", "Play Lights Out 5 times.", "LOGIC", 5, "💡"),
        AchievementDef("logic_sudoku_1", "Sudoku Starter", "Play Mini Sudoku 5 times.", "LOGIC", 5, "🔢"),
        AchievementDef("logic_balance_1", "Equilibrium Guru", "Play Balance Weights 5 times.", "LOGIC", 5, "⚖️"),
        AchievementDef("logic_fast_sudoku", "Sudoku Sprint", "Complete Mini Sudoku in under 20 seconds.", "LOGIC", 1, "⚡"),
        AchievementDef("logic_flawless_matrix", "Deduction Master", "Complete Level 5 of Pattern Matrix.", "LOGIC", 1, "🔍"),
        AchievementDef("logic_clean_lights", "Total Blackout", "Complete 5 rounds of Lights Out.", "LOGIC", 5, "🌑"),
        AchievementDef("logic_master", "Rational Mind", "Earn 12 stars across Logic games.", "LOGIC", 12, "🏛️"),

        // Language (53..60)
        AchievementDef("lang_scramble_1", "Anagram Artist", "Play Word Scramble 5 times.", "LANGUAGE", 5, "🔤"),
        AchievementDef("lang_chain_1", "Chain Linker", "Play Word Chain 5 times.", "LANGUAGE", 5, "⛓️"),
        AchievementDef("lang_ten_words", "Lexicon Explorer", "Complete 10 Language sessions.", "LANGUAGE", 10, "📖"),
        AchievementDef("lang_speed_scramble", "Flash Anagram", "Solve Word Scramble with 100% accuracy.", "LANGUAGE", 1, "⚡"),
        AchievementDef("lang_chain_level5", "Unbroken Lexicon", "Reach Level 5 in Word Chain.", "LANGUAGE", 1, "🔗"),
        AchievementDef("lang_vocab_master", "Word Smith", "Earn 6 stars across Language games.", "LANGUAGE", 6, "✍️"),
        AchievementDef("all_round_athlete", "Renaissance Mind", "Play at least one game in all 5 categories.", "GENERAL", 5, "🌌"),
        AchievementDef("level_10_player", "Forge Paragon", "Reach Player Level 10.", "GENERAL", 10, "👑")
    )
}
