package com.readmaster.app.data.model

data class FolderIcon(
    val key: String,
    val label: String,
    val symbol: String,
    val category: String,
    val defaultColor: String = "#4F46E5"
)

object FolderIconsCatalog {

    val allIcons: List<FolderIcon> = listOf(
        // === Core Requested & Top Tech ===
        FolderIcon("personal_dev", "Personal Development", "🌱", "Personal Growth", "#10B981"),
        FolderIcon("spring_boot", "Spring Boot", "🍃", "Software & Tech", "#22C55E"),
        FolderIcon("java", "Java", "☕", "Software & Tech", "#EA580C"),
        FolderIcon("system_design", "System Design", "🏛️", "Software & Tech", "#6366F1"),
        FolderIcon("dsa", "DSA & Algorithms", "🌲", "Software & Tech", "#3B82F6"),
        FolderIcon("python", "Python", "🐍", "Software & Tech", "#0284C7"),
        FolderIcon("cpp", "C / C++", "⚡", "Software & Tech", "#0284C7"),
        FolderIcon("csharp", "C# & .NET", "🔷", "Software & Tech", "#8B5CF6"),
        FolderIcon("kotlin", "Kotlin & Android", "🤖", "Software & Tech", "#10B981"),
        FolderIcon("swift", "Swift & iOS", "🍎", "Software & Tech", "#F97316"),
        FolderIcon("typescript", "TypeScript", "🌐", "Software & Tech", "#2563EB"),
        FolderIcon("javascript", "JavaScript", "💛", "Software & Tech", "#F59E0B"),
        FolderIcon("golang", "Go / Golang", "🐹", "Software & Tech", "#06B6D4"),
        FolderIcon("rust", "Rust", "🦀", "Software & Tech", "#B45309"),
        FolderIcon("php", "PHP", "🐘", "Software & Tech", "#6366F1"),

        // === Architecture & Systems ===
        FolderIcon("microservices", "Microservices", "🧩", "Architecture & Cloud", "#8B5CF6"),
        FolderIcon("distributed_systems", "Distributed Systems", "🌐", "Architecture & Cloud", "#3B82F6"),
        FolderIcon("cloud_aws", "Cloud & AWS", "☁️", "Architecture & Cloud", "#F59E0B"),
        FolderIcon("docker_k8s", "Docker & Kubernetes", "🐳", "Architecture & Cloud", "#0284C7"),
        FolderIcon("database_sql", "SQL & Database", "🗄️", "Architecture & Cloud", "#4F46E5"),
        FolderIcon("database_nosql", "NoSQL & Redis", "⚡", "Architecture & Cloud", "#DC2626"),
        FolderIcon("kafka", "Kafka & Queues", "📨", "Architecture & Cloud", "#059669"),
        FolderIcon("api_rest", "APIs & GraphQL", "🔌", "Architecture & Cloud", "#EC4899"),
        FolderIcon("hld", "High-Level Design", "📐", "Architecture & Cloud", "#6366F1"),
        FolderIcon("lld", "Low-Level Design", "🧱", "Architecture & Cloud", "#D97706"),
        FolderIcon("design_patterns", "Design Patterns", "🎯", "Architecture & Cloud", "#10B981"),
        FolderIcon("devops", "DevOps & CI/CD", "♾️", "Architecture & Cloud", "#06B6D4"),
        FolderIcon("security", "Security & Auth", "🛡️", "Architecture & Cloud", "#EF4444"),
        FolderIcon("linux_terminal", "Linux & Shell", "🐧", "Architecture & Cloud", "#374151"),
        FolderIcon("git", "Git & GitHub", "🐙", "Architecture & Cloud", "#F97316"),
        FolderIcon("networking", "Computer Networks", "📶", "Architecture & Cloud", "#0284C7"),
        FolderIcon("os", "Operating Systems", "⚙️", "Architecture & Cloud", "#6B7280"),

        // === AI, Data & Science ===
        FolderIcon("ai", "Artificial Intelligence", "✨", "AI & Data Science", "#8B5CF6"),
        FolderIcon("machine_learning", "Machine Learning", "🤖", "AI & Data Science", "#6366F1"),
        FolderIcon("deep_learning", "Deep Learning", "🕸️", "AI & Data Science", "#EC4899"),
        FolderIcon("data_science", "Data Science", "📊", "AI & Data Science", "#059669"),
        FolderIcon("big_data", "Big Data", "📈", "AI & Data Science", "#2563EB"),
        FolderIcon("statistics", "Statistics", "📉", "AI & Data Science", "#D97706"),
        FolderIcon("math", "Mathematics", "📐", "AI & Data Science", "#4F46E5"),
        FolderIcon("physics", "Physics", "⚛️", "AI & Data Science", "#0284C7"),
        FolderIcon("chemistry", "Chemistry", "🧪", "AI & Data Science", "#10B981"),
        FolderIcon("biology", "Biology & Genetics", "🧬", "AI & Data Science", "#059669"),

        // === Personal Development & Study ===
        FolderIcon("habits", "Atomic Habits", "⏳", "Personal Growth", "#F59E0B"),
        FolderIcon("mindset", "Mindset & Psychology", "💡", "Personal Growth", "#EAB308"),
        FolderIcon("deep_work", "Deep Work & Focus", "🎯", "Personal Growth", "#EF4444"),
        FolderIcon("productivity", "Productivity & Time", "⚡", "Personal Growth", "#F97316"),
        FolderIcon("reading", "Books & Reading", "📚", "Personal Growth", "#6366F1"),
        FolderIcon("notes", "Notes & Research", "📝", "Personal Growth", "#3B82F6"),
        FolderIcon("journal", "Daily Journal", "📓", "Personal Growth", "#8B5CF6"),
        FolderIcon("leadership", "Leadership & Impact", "👑", "Personal Growth", "#D97706"),
        FolderIcon("public_speaking", "Public Speaking", "🎙️", "Personal Growth", "#EC4899"),
        FolderIcon("memory", "Memory & Learning", "🧠", "Personal Growth", "#06B6D4"),
        FolderIcon("goals", "Goal Setting", "🏁", "Personal Growth", "#10B981"),
        FolderIcon("philosophy", "Philosophy & Stoicism", "🏛️", "Personal Growth", "#4B5563"),
        FolderIcon("meditation", "Mindfulness", "🧘", "Personal Growth", "#059669"),
        FolderIcon("sleep", "Sleep & Recovery", "🌙", "Personal Growth", "#312E81"),

        // === Career, Interview & Business ===
        FolderIcon("coding_interview", "LeetCode & Prep", "💻", "Career & Business", "#F59E0B"),
        FolderIcon("interview", "Tech Interviews", "💼", "Career & Business", "#2563EB"),
        FolderIcon("startup", "Startups & Build", "🚀", "Career & Business", "#EF4444"),
        FolderIcon("business", "Business Strategy", "🏢", "Career & Business", "#4F46E5"),
        FolderIcon("finance", "Finance & Wealth", "💰", "Career & Business", "#10B981"),
        FolderIcon("investing", "Investing & Stocks", "📈", "Career & Business", "#059669"),
        FolderIcon("economics", "Economics", "💵", "Career & Business", "#0D9488"),
        FolderIcon("crypto", "Crypto & Web3", "🪙", "Career & Business", "#F59E0B"),
        FolderIcon("management", "Product & Management", "👔", "Career & Business", "#4338CA"),
        FolderIcon("marketing", "Marketing & Growth", "📣", "Career & Business", "#EC4899"),

        // === Academia & University ===
        FolderIcon("university", "University & College", "🏛️", "Academia", "#3B82F6"),
        FolderIcon("exam", "Exam Preparation", "🎓", "Academia", "#6366F1"),
        FolderIcon("thesis", "Thesis & Papers", "📜", "Academia", "#D97706"),
        FolderIcon("research", "Academic Research", "🔬", "Academia", "#059669"),
        FolderIcon("flashcards", "Vocabulary Cards", "🗂️", "Academia", "#8B5CF6"),
        FolderIcon("homework", "Homework & Tasks", "📋", "Academia", "#0284C7"),
        FolderIcon("syllabus", "Course Syllabus", "🔖", "Academia", "#10B981"),
        FolderIcon("textbook", "Course Textbooks", "📖", "Academia", "#4F46E5"),

        // === Creative, Languages & Health ===
        FolderIcon("writing", "Creative Writing", "✍️", "Creative & Life", "#EC4899"),
        FolderIcon("design", "UI/UX Design", "🎨", "Creative & Life", "#8B5CF6"),
        FolderIcon("figma", "Figma & Wireframes", "✨", "Creative & Life", "#06B6D4"),
        FolderIcon("music", "Music & Sound", "🎵", "Creative & Life", "#3B82F6"),
        FolderIcon("language", "Language Learning", "🗣️", "Creative & Life", "#10B981"),
        FolderIcon("english", "English Mastery", "📖", "Creative & Life", "#2563EB"),
        FolderIcon("sanskrit_hindi", "Sanskrit & Hindi", "🕉️", "Creative & Life", "#D97706"),
        FolderIcon("health", "Health & Body", "💪", "Creative & Life", "#EF4444"),
        FolderIcon("nutrition", "Nutrition & Diet", "🥗", "Creative & Life", "#10B981"),
        FolderIcon("travel", "Travel & Places", "✈️", "Creative & Life", "#0284C7"),

        // === Utilities & Badges ===
        FolderIcon("star", "Favorites & Best", "⭐", "General", "#F59E0B"),
        FolderIcon("fire", "Top Priority", "🔥", "General", "#EF4444"),
        FolderIcon("trophy", "Milestones", "🏆", "General", "#D97706"),
        FolderIcon("medal", "Achievements", "🏅", "General", "#CA8A04"),
        FolderIcon("tag", "Tagged Items", "🏷️", "General", "#6366F1"),
        FolderIcon("archive", "Archive & Stash", "📦", "General", "#6B7280"),
        FolderIcon("folder", "Default Folder", "📁", "General", "#4F46E5"),
        FolderIcon("inbox", "Quick Inbox", "📥", "General", "#0284C7"),
        FolderIcon("bookmark", "Saved For Later", "🔖", "General", "#EC4899"),
        FolderIcon("idea", "Ideas & Brainstorm", "⚡", "General", "#EAB308"),
        FolderIcon("history", "History & Heritage", "🏺", "General", "#78350F"),
        FolderIcon("law", "Law & Rights", "⚖️", "General", "#374151"),
        FolderIcon("space", "Astronomy & Space", "🚀", "General", "#312E81"),
        FolderIcon("robotics", "Robotics & Hardware", "🦾", "General", "#4B5563"),
        FolderIcon("gaming", "Game Dev & Engines", "🎮", "General", "#8B5CF6")
    )

    fun findIcon(key: String): FolderIcon {
        return allIcons.firstOrNull { it.key == key } ?: allIcons.first { it.key == "folder" }
    }

    val categories: List<String> = listOf(
        "All",
        "Software & Tech",
        "Architecture & Cloud",
        "Personal Growth",
        "AI & Data Science",
        "Career & Business",
        "Academia",
        "Creative & Life",
        "General"
    )
}
