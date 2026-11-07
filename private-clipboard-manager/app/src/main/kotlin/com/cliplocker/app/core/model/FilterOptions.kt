package com.cliplocker.app.core.model

enum class DateFilter(val label: String) {
    ALL("All time"),
    TODAY("Today"),
    YESTERDAY("Yesterday"),
    THIS_WEEK("This week")
}

data class FilterOptions(
    val query: String = "",
    val selectedType: ClipType? = null,
    val onlyPinned: Boolean = false,
    val onlySecrets: Boolean = false,
    val dateFilter: DateFilter = DateFilter.ALL
) {
    val isActive: Boolean
        get() = query.isNotBlank() || selectedType != null || onlyPinned || onlySecrets || dateFilter != DateFilter.ALL
}
