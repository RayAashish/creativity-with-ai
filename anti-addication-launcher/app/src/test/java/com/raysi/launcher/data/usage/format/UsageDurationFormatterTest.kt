// app/src/test/java/com/raysi/launcher/data/usage/format/UsageDurationFormatterTest.kt
package com.raysi.launcher.data.usage.format

import com.raysi.launcher.ui.theme.HudAmber
import com.raysi.launcher.ui.theme.HudNormal
import com.raysi.launcher.ui.theme.HudRed
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class UsageDurationFormatterTest {

    @Test
    fun formatScreenTime_omitsZeroUnitsCorrectly() {
        // 2h 14m 12s = 2 * 3600 + 14 * 60 + 12 = 7200 + 840 + 12 = 8052s
        assertEquals("2h 14m 12s", UsageDurationFormatter.formatScreenTime(8052L))

        // 14m 12s = 852s (hours omitted)
        assertEquals("14m 12s", UsageDurationFormatter.formatScreenTime(852L))

        // 42s (hours and minutes omitted)
        assertEquals("42s", UsageDurationFormatter.formatScreenTime(42L))

        // 0s
        assertEquals("0s", UsageDurationFormatter.formatScreenTime(0L))
    }

    @Test
    fun formatHud_producesExpectedStringAndSingularPluralUnlocks() {
        assertEquals("Today: 2h 14m 12s • 34 Unlocks", UsageDurationFormatter.formatHud(8052L, 34))
        assertEquals("Today: 42s • 1 Unlock", UsageDurationFormatter.formatHud(42L, 1))
        assertEquals("Today: 0s • 0 Unlocks", UsageDurationFormatter.formatHud(0L, 0))
    }

    @Test
    fun formatAppDuration_producesCompactAppFormats() {
        // 12m = 720_000ms
        assertEquals("12m", UsageDurationFormatter.formatAppDuration(720_000L))

        // 1h 5m = 3_900_000ms
        assertEquals("1h 5m", UsageDurationFormatter.formatAppDuration(3_900_000L))

        // < 1m
        assertEquals("<1m", UsageDurationFormatter.formatAppDuration(30_000L))

        // 0ms returns null (hidden in pinned essentials)
        assertNull(UsageDurationFormatter.formatAppDuration(0L))
        assertNull(UsageDurationFormatter.formatAppDuration(-100L))
    }

    @Test
    fun getHudColor_matchesBands() {
        // < 2h (7199s) -> HudNormal (#888888)
        assertEquals(HudNormal, UsageDurationFormatter.getHudColor(7199L))

        // 2h exactly (7200s) -> HudAmber (#D97706)
        assertEquals(HudAmber, UsageDurationFormatter.getHudColor(7200L))

        // 3h 59m (14399s) -> HudAmber (#D97706)
        assertEquals(HudAmber, UsageDurationFormatter.getHudColor(14399L))

        // >= 4h (14400s) -> HudRed (#DC2626)
        assertEquals(HudRed, UsageDurationFormatter.getHudColor(14400L))

        // 6h (21600s) -> HudRed (#DC2626)
        assertEquals(HudRed, UsageDurationFormatter.getHudColor(21600L))
    }
}
