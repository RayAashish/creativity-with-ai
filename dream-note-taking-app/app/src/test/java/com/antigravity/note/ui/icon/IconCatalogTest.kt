package com.antigravity.note.ui.icon

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class IconCatalogTest {

    @Test
    fun testJavaAutoSuggestion() {
        val icon = IconCatalog.suggestIcon("Java")
        assertEquals("java", icon.key)
        assertEquals("JAVA", icon.badgeLabel)
        assertEquals("☕", icon.emojiFallback)
    }

    @Test
    fun testSpringBootAutoSuggestion() {
        val icon = IconCatalog.suggestIcon("Spring Boot")
        assertEquals("spring", icon.key)
        assertEquals("SPRING", icon.badgeLabel)
    }

    @Test
    fun testDsaAndSubtopicsAutoSuggestion() {
        assertEquals("dsa", IconCatalog.suggestIcon("DSA").key)
        assertEquals("dp", IconCatalog.suggestIcon("Dynamic Programming").key)
        assertEquals("dp", IconCatalog.suggestIcon("DP").key)
        assertEquals("tree", IconCatalog.suggestIcon("Binary Tree").key)
        assertEquals("graph", IconCatalog.suggestIcon("Graphs (BFS/DFS)").key)
        assertEquals("recursion", IconCatalog.suggestIcon("Recursion & Backtracking").key)
    }

    @Test
    fun testCoreCsAutoSuggestion() {
        assertEquals("system_design", IconCatalog.suggestIcon("System Design").key)
        assertEquals("database", IconCatalog.suggestIcon("Database Management").key)
        assertEquals("network", IconCatalog.suggestIcon("Computer Networks").key)
        assertEquals("os", IconCatalog.suggestIcon("Operating Systems").key)
        assertEquals("lld", IconCatalog.suggestIcon("Low Level Design (LLD)").key)
    }

    @Test
    fun testCatalogCompleteness() {
        assertTrue("Icon catalog should have at least 25 tech & CS icons", IconCatalog.ALL_ICONS.size >= 25)
        for (icon in IconCatalog.ALL_ICONS) {
            assertNotNull(icon.key)
            assertNotNull(icon.displayName)
            assertNotNull(icon.badgeLabel)
            assertNotNull(icon.category)
            assertNotNull(icon.emojiFallback)
            assertEquals(icon, IconCatalog.getIcon(icon.key))
        }
    }
}
