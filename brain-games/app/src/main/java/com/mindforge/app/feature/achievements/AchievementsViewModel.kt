package com.mindforge.app.feature.achievements

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindforge.app.data.local.db.dao.AchievementDao
import com.mindforge.app.domain.achievement.AchievementCatalog
import com.mindforge.app.domain.achievement.AchievementDef
import com.mindforge.app.domain.achievement.AchievementEngine
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AchievementUiItem(
    val def: AchievementDef,
    val progress: Int,
    val isUnlocked: Boolean,
    val unlockedAt: Long?
)

data class AchievementsUiState(
    val items: List<AchievementUiItem> = emptyList(),
    val totalUnlocked: Int = 0,
    val totalCount: Int = AchievementCatalog.allAchievements.size,
    val selectedCategory: String = "ALL"
)

@HiltViewModel
class AchievementsViewModel @Inject constructor(
    private val achievementDao: AchievementDao,
    private val achievementEngine: AchievementEngine
) : ViewModel() {

    private val _selectedCategory = MutableStateFlow("ALL")

    init {
        viewModelScope.launch {
            achievementEngine.syncAchievements()
        }
    }

    val uiState: StateFlow<AchievementsUiState> = combine(
        achievementDao.observeAllAchievements(),
        _selectedCategory
    ) { entities, filter ->
        val entityMap = entities.associateBy { it.id }
        val allUiItems = AchievementCatalog.allAchievements.map { def ->
            val ent = entityMap[def.id]
            AchievementUiItem(
                def = def,
                progress = ent?.progress ?: 0,
                isUnlocked = ent?.isUnlocked ?: false,
                unlockedAt = ent?.unlockedAt
            )
        }

        val filtered = if (filter == "ALL") allUiItems else allUiItems.filter { it.def.category == filter }
        val unlockedCount = allUiItems.count { it.isUnlocked }

        AchievementsUiState(
            items = filtered,
            totalUnlocked = unlockedCount,
            totalCount = allUiItems.size,
            selectedCategory = filter
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = AchievementsUiState()
    )

    fun setCategoryFilter(filter: String) {
        _selectedCategory.value = filter
    }
}
