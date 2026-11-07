package com.mindforge.app

import com.mindforge.app.domain.achievement.AchievementCatalog
import com.mindforge.app.domain.backup.MindForgeBackupData
import com.mindforge.app.domain.backup.StreakBackupModel
import com.mindforge.app.domain.backup.UserPreferencesBackupModel
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class Phase5Test {

    @Test
    fun testAchievementCatalog_containsSixtyPlusBadges() {
        val total = AchievementCatalog.allAchievements.size
        assertTrue("Should have at least 60 achievements, found: $total", total >= 60)

        // Ensure unique IDs
        val ids = AchievementCatalog.allAchievements.map { it.id }.toSet()
        assertEquals(total, ids.size)

        // Ensure valid properties
        AchievementCatalog.allAchievements.forEach { def ->
            assertTrue(def.title.isNotBlank())
            assertTrue(def.description.isNotBlank())
            assertTrue(def.maxProgress > 0)
            assertTrue(def.iconGlyph.isNotBlank())
        }
    }

    @Test
    fun testBackupRestoreSerialization_preservesIntegrity() {
        val json = Json { prettyPrint = true }
        val backup = MindForgeBackupData(
            schemaVersion = 1,
            exportTimestamp = 123456789L,
            app = "MindForge",
            profile = UserPreferencesBackupModel("Apex Thinker", "MATH", 4, 1850),
            streak = StreakBackupModel(7, 14, "2026-11-07", 2),
            stats = emptyList(),
            activities = emptyList(),
            sessions = emptyList()
        )

        val encoded = json.encodeToString(backup)
        val decoded = json.decodeFromString<MindForgeBackupData>(encoded)

        assertEquals("MindForge", decoded.app)
        assertEquals(1, decoded.schemaVersion)
        assertEquals("Apex Thinker", decoded.profile.displayName)
        assertEquals(4, decoded.profile.playerLevel)
        assertEquals(7, decoded.streak.currentStreak)
        assertEquals(2, decoded.streak.freezesAvailable)
    }
}
