package com.raysi.anchor.util;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class ResponsiveGridHelperTest {

    @Test
    public void libraryColumnsScaleAcrossPhonesFoldablesAndLargeTablets() {
        // 5-inch compact phone (~320dp) -> 2 columns
        assertEquals(2, ResponsiveGridHelper.computeSpanCount(320, 175, 2, 6));
        // Standard 6.4-inch phone (~400dp) -> 2 columns
        assertEquals(2, ResponsiveGridHelper.computeSpanCount(400, 175, 2, 6));
        // Unfolded foldable (~680dp) -> 3 columns
        assertEquals(3, ResponsiveGridHelper.computeSpanCount(680, 175, 2, 6));
        // 11-inch tablet (~880dp) -> 5 columns
        assertEquals(5, ResponsiveGridHelper.computeSpanCount(880, 175, 2, 6));
        // 14.2-inch tablet (~1200dp) -> 6 columns
        assertEquals(6, ResponsiveGridHelper.computeSpanCount(1200, 175, 2, 6));
    }

    @Test
    public void queueColumnsScaleFromPhonesToLargeTablets() {
        // 5-inch & standard phones -> 1 column
        assertEquals(1, ResponsiveGridHelper.computeSpanCount(320, 400, 1, 3));
        assertEquals(1, ResponsiveGridHelper.computeSpanCount(400, 400, 1, 3));
        // 10-inch+ tablet (~800dp content width) -> 2 columns
        assertEquals(2, ResponsiveGridHelper.computeSpanCount(820, 400, 1, 3));
        // 14.2-inch tablet (~1200dp content width) -> 3 columns
        assertEquals(3, ResponsiveGridHelper.computeSpanCount(1200, 400, 1, 3));
    }
}
