package com.antigravity.note.ui.icon

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountTree
import androidx.compose.material.icons.filled.Architecture
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Hub
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.LocalCafe
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Spa
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

data class IconItem(
    val key: String,
    val displayName: String,
    val badgeLabel: String,
    val category: String, // "LANGUAGES", "CORE_CS", "FRAMEWORKS", "GENERAL"
    val iconVector: ImageVector,
    val primaryColor: Long,
    val containerColor: Long,
    val emojiFallback: String
)

object IconCatalog {

    val ALL_ICONS: List<IconItem> = listOf(
        // ================= Languages =================
        IconItem(
            key = "java",
            displayName = "Java",
            badgeLabel = "JAVA",
            category = "Languages",
            iconVector = Icons.Default.LocalCafe,
            primaryColor = 0xFFE65100, // Coffee Orange-Red
            containerColor = 0xFFFFF3E0,
            emojiFallback = "☕"
        ),
        IconItem(
            key = "kotlin",
            displayName = "Kotlin",
            badgeLabel = "KOTLIN",
            category = "Languages",
            iconVector = Icons.Default.Code,
            primaryColor = 0xFF7F52FF,
            containerColor = 0xFFEDE7F6,
            emojiFallback = "🟣"
        ),
        IconItem(
            key = "python",
            displayName = "Python",
            badgeLabel = "PYTHON",
            category = "Languages",
            iconVector = Icons.Default.Terminal,
            primaryColor = 0xFF0277BD,
            containerColor = 0xFFE1F5FE,
            emojiFallback = "🐍"
        ),
        IconItem(
            key = "cpp",
            displayName = "C / C++",
            badgeLabel = "C++",
            category = "Languages",
            iconVector = Icons.Default.Code,
            primaryColor = 0xFF00599C,
            containerColor = 0xFFE3F2FD,
            emojiFallback = "⚡"
        ),
        IconItem(
            key = "rust",
            displayName = "Rust",
            badgeLabel = "RUST",
            category = "Languages",
            iconVector = Icons.Default.Settings,
            primaryColor = 0xFFBF360C,
            containerColor = 0xFFFBE9E7,
            emojiFallback = "🦀"
        ),
        IconItem(
            key = "go",
            displayName = "Go",
            badgeLabel = "GO",
            category = "Languages",
            iconVector = Icons.Default.Bolt,
            primaryColor = 0xFF00ACC1,
            containerColor = 0xFFE0F7FA,
            emojiFallback = "🐹"
        ),
        IconItem(
            key = "javascript",
            displayName = "JavaScript / TS",
            badgeLabel = "JS / TS",
            category = "Languages",
            iconVector = Icons.Default.Language,
            primaryColor = 0xFFF57F17,
            containerColor = 0xFFFFFDE7,
            emojiFallback = "🟨"
        ),
        IconItem(
            key = "sql",
            displayName = "SQL",
            badgeLabel = "SQL",
            category = "Languages",
            iconVector = Icons.Default.Storage,
            primaryColor = 0xFFC62828,
            containerColor = 0xFFFFEBEE,
            emojiFallback = "💾"
        ),

        // ================= Frameworks & Tools =================
        IconItem(
            key = "spring",
            displayName = "Spring Boot",
            badgeLabel = "SPRING",
            category = "Frameworks",
            iconVector = Icons.Default.Spa,
            primaryColor = 0xFF2E7D32, // Leaf Green
            containerColor = 0xFFE8F5E9,
            emojiFallback = "🍃"
        ),
        IconItem(
            key = "docker",
            displayName = "Docker / Container",
            badgeLabel = "DOCKER",
            category = "Frameworks",
            iconVector = Icons.Default.Storage,
            primaryColor = 0xFF0288D1,
            containerColor = 0xFFE1F5FE,
            emojiFallback = "🐳"
        ),
        IconItem(
            key = "kubernetes",
            displayName = "Kubernetes",
            badgeLabel = "K8S",
            category = "Frameworks",
            iconVector = Icons.Default.Hub,
            primaryColor = 0xFF303F9F,
            containerColor = 0xFFE8EAF6,
            emojiFallback = "☸️"
        ),
        IconItem(
            key = "react",
            displayName = "React / Web",
            badgeLabel = "REACT",
            category = "Frameworks",
            iconVector = Icons.Default.Language,
            primaryColor = 0xFF00838F,
            containerColor = 0xFFE0F7FA,
            emojiFallback = "⚛️"
        ),

        // ================= Core CS & DSA =================
        IconItem(
            key = "dsa",
            displayName = "DSA",
            badgeLabel = "DSA",
            category = "Core CS",
            iconVector = Icons.Default.Terminal,
            primaryColor = 0xFF0277BD,
            containerColor = 0xFFE1F5FE,
            emojiFallback = "💻"
        ),
        IconItem(
            key = "tree",
            displayName = "Binary Trees",
            badgeLabel = "TREE",
            category = "Core CS",
            iconVector = Icons.Default.AccountTree,
            primaryColor = 0xFF00897B,
            containerColor = 0xFFE0F2F1,
            emojiFallback = "🌲"
        ),
        IconItem(
            key = "graph",
            displayName = "Graphs",
            badgeLabel = "GRAPH",
            category = "Core CS",
            iconVector = Icons.Default.Hub,
            primaryColor = 0xFF6A1B9A,
            containerColor = 0xFFF3E5F5,
            emojiFallback = "🕸️"
        ),
        IconItem(
            key = "dp",
            displayName = "Dynamic Programming",
            badgeLabel = "DP",
            category = "Core CS",
            iconVector = Icons.Default.TableChart,
            primaryColor = 0xFFC2185B,
            containerColor = 0xFFFCE4EC,
            emojiFallback = "▦"
        ),
        IconItem(
            key = "recursion",
            displayName = "Recursion",
            badgeLabel = "RECURSION",
            category = "Core CS",
            iconVector = Icons.Default.Repeat,
            primaryColor = 0xFF00796B,
            containerColor = 0xFFE0F2F1,
            emojiFallback = "🔁"
        ),
        IconItem(
            key = "system_design",
            displayName = "System Design",
            badgeLabel = "SYS DESIGN",
            category = "Core CS",
            iconVector = Icons.Default.Hub,
            primaryColor = 0xFF512DA8,
            containerColor = 0xFFEDE7F6,
            emojiFallback = "🔀"
        ),
        IconItem(
            key = "database",
            displayName = "Database / DBMS",
            badgeLabel = "DBMS",
            category = "Core CS",
            iconVector = Icons.Default.Storage,
            primaryColor = 0xFFE65100,
            containerColor = 0xFFFFF3E0,
            emojiFallback = "🗄️"
        ),
        IconItem(
            key = "network",
            displayName = "Computer Networks",
            badgeLabel = "CN",
            category = "Core CS",
            iconVector = Icons.Default.Public,
            primaryColor = 0xFF00695C,
            containerColor = 0xFFE0F2F1,
            emojiFallback = "🌐"
        ),
        IconItem(
            key = "os",
            displayName = "Operating Systems",
            badgeLabel = "OS",
            category = "Core CS",
            iconVector = Icons.Default.Memory,
            primaryColor = 0xFFC62828,
            containerColor = 0xFFFFEBEE,
            emojiFallback = "🧠"
        ),
        IconItem(
            key = "lld",
            displayName = "Low-Level Design / OOP",
            badgeLabel = "LLD",
            category = "Core CS",
            iconVector = Icons.Default.Architecture,
            primaryColor = 0xFF455A64,
            containerColor = 0xFFECEFF1,
            emojiFallback = "📐"
        ),

        // ================= General & Study =================
        IconItem(
            key = "general_notes",
            displayName = "General Notes",
            badgeLabel = "NOTES",
            category = "General",
            iconVector = Icons.Default.Folder,
            primaryColor = 0xFF00897B,
            containerColor = 0xFFE0F2F1,
            emojiFallback = "📁"
        ),
        IconItem(
            key = "book",
            displayName = "Book / Literature",
            badgeLabel = "READ",
            category = "General",
            iconVector = Icons.Default.MenuBook,
            primaryColor = 0xFF1565C0,
            containerColor = 0xFFE3F2FD,
            emojiFallback = "📚"
        ),
        IconItem(
            key = "lightbulb",
            displayName = "Project Ideas",
            badgeLabel = "IDEAS",
            category = "General",
            iconVector = Icons.Default.Lightbulb,
            primaryColor = 0xFFF57F17,
            containerColor = 0xFFFFFDE7,
            emojiFallback = "💡"
        ),
        IconItem(
            key = "star",
            displayName = "Important / Stars",
            badgeLabel = "STAR",
            category = "General",
            iconVector = Icons.Default.Star,
            primaryColor = 0xFFFBC02D,
            containerColor = 0xFFFFFDE7,
            emojiFallback = "⭐"
        ),
        IconItem(
            key = "fire",
            displayName = "Daily Streak / Grind",
            badgeLabel = "STREAK",
            category = "General",
            iconVector = Icons.Default.LocalFireDepartment,
            primaryColor = 0xFFE64A19,
            containerColor = 0xFFFBE9E7,
            emojiFallback = "🔥"
        ),
        IconItem(
            key = "trophy",
            displayName = "Achievements",
            badgeLabel = "TROPHY",
            category = "General",
            iconVector = Icons.Default.EmojiEvents,
            primaryColor = 0xFFF57C00,
            containerColor = 0xFFFFF3E0,
            emojiFallback = "🏆"
        ),
        IconItem(
            key = "math",
            displayName = "Mathematics / Quant",
            badgeLabel = "MATH",
            category = "General",
            iconVector = Icons.Default.Calculate,
            primaryColor = 0xFF00838F,
            containerColor = 0xFFE0F7FA,
            emojiFallback = "🔢"
        ),
        IconItem(
            key = "folder",
            displayName = "Standard Folder",
            badgeLabel = "FOLDER",
            category = "General",
            iconVector = Icons.Default.Folder,
            primaryColor = 0xFF005AC1,
            containerColor = 0xFFD8E2FF,
            emojiFallback = "📁"
        )
    )

    private val KEY_MAP = ALL_ICONS.associateBy { it.key }

    fun getIcon(key: String?): IconItem? {
        if (key.isNullOrBlank()) return null
        return KEY_MAP[key.lowercase().trim()]
    }

    fun suggestIcon(name: String, isFolder: Boolean = true, isSubject: Boolean = true): IconItem {
        val lower = name.lowercase().trim()
        return when {
            lower.contains("java") && !lower.contains("javascript") -> getIcon("java")!!
            lower.contains("spring") -> getIcon("spring")!!
            lower.contains("dsa") || lower.contains("algo") || lower.contains("leetcode") || lower.contains("sorting") -> getIcon("dsa")!!
            lower.contains("tree") || lower.contains("bst") || lower.contains("trie") -> getIcon("tree")!!
            lower.contains("graph") || lower.contains("bfs") || lower.contains("dfs") -> getIcon("graph")!!
            lower.contains("dp") || lower.contains("dynamic") -> getIcon("dp")!!
            lower.contains("recursion") || lower.contains("backtrack") -> getIcon("recursion")!!
            lower.contains("system design") || lower.contains("architect") || lower.contains("distributed") || lower.contains("microservice") -> getIcon("system_design")!!
            lower.contains("db") || lower.contains("database") || lower.contains("sql") || lower.contains("redis") || lower.contains("mongo") -> getIcon("database")!!
            lower.contains("cn") || lower.contains("network") || lower.contains("tcp") || lower.contains("http") -> getIcon("network")!!
            lower.contains("os") || lower.contains("operating system") || lower.contains("linux") || lower.contains("kernel") -> getIcon("os")!!
            lower.contains("lld") || lower.contains("oop") || lower.contains("design pattern") -> getIcon("lld")!!
            lower.contains("kotlin") -> getIcon("kotlin")!!
            lower.contains("python") -> getIcon("python")!!
            lower.contains("c++") || lower.contains("cpp") -> getIcon("cpp")!!
            lower.contains("rust") -> getIcon("rust")!!
            lower.contains("go") || lower.contains("golang") -> getIcon("go")!!
            lower.contains("react") -> getIcon("react")!!
            lower.contains("docker") -> getIcon("docker")!!
            lower.contains("book") || lower.contains("read") -> getIcon("book")!!
            lower.contains("idea") -> getIcon("lightbulb")!!
            lower.contains("general") -> getIcon("general_notes")!!
            else -> if (isSubject) getIcon("folder")!! else if (isFolder) getIcon("folder")!! else getIcon("book")!!
        }
    }
}
