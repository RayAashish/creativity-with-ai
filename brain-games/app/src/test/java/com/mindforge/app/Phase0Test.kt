package com.mindforge.app

import com.mindforge.app.core.theme.AppThemeMode
import com.mindforge.app.core.theme.CategoryThemes
import com.mindforge.app.data.local.db.entity.StreakRecordEntity
import com.mindforge.app.data.local.preferences.UserPreferences
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Test

class Phase0Test {

    @Test
    fun defaultStreakRecord_hasInitialValues() {
        val streak = StreakRecordEntity()
        assertEquals(1, streak.id)
        assertEquals(0, streak.currentStreak)
        assertEquals(0, streak.longestStreak)
        assertEquals(1, streak.freezesAvailable)
    }

    @Test
    fun defaultUserPreferences_isCleanAndValid() {
        val prefs = UserPreferences()
        assertEquals(AppThemeMode.SYSTEM, prefs.themeMode)
        assertFalse(prefs.dynamicColor)
        assertEquals("Mind Athlete", prefs.displayName)
        assertFalse(prefs.isOnboardingCompleted)
        assertEquals(1, prefs.playerLevel)
    }

    @Test
    fun categoryThemes_areDefinedProperly() {
        assertNotNull(CategoryThemes.Math)
        assertNotNull(CategoryThemes.Memory)
        assertNotNull(CategoryThemes.Focus)
        assertNotNull(CategoryThemes.Logic)
        assertNotNull(CategoryThemes.Language)
    }
}
