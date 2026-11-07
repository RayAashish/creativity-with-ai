package com.mindforge.app.feature.game.instructions

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.mindforge.app.core.theme.CategoryThemes
import com.mindforge.app.core.theme.ForgeAmberPrimary
import com.mindforge.app.core.theme.CyanPulseSecondary
import com.mindforge.app.core.theme.Spacing
import com.mindforge.app.data.local.db.dao.GameStatDao
import com.mindforge.app.data.local.db.entity.GameStatEntity
import com.mindforge.app.feature.game.framework.GameEngine
import com.mindforge.app.feature.game.framework.GameRegistry
import com.mindforge.app.feature.home.GameCategory
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GameInstructionsViewModel @Inject constructor(
    private val gameRegistry: GameRegistry,
    private val gameStatDao: GameStatDao
) : ViewModel() {

    private val _engine = MutableStateFlow<GameEngine?>(null)
    val engine = _engine.asStateFlow()

    private val _stat = MutableStateFlow<GameStatEntity?>(null)
    val stat = _stat.asStateFlow()

    fun getEngine(gameId: String): GameEngine? {
        return runCatching { gameRegistry.getEngine(gameId) }.getOrNull()
    }

    fun load(gameId: String) {
        val eng = getEngine(gameId)
        if (eng != null) {
            _engine.value = eng
        }
        viewModelScope.launch {
            _stat.value = gameStatDao.getGameStat(gameId)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameInstructionsScreen(
    gameId: String,
    initialLevel: Int,
    onNavigateBack: () -> Unit,
    onStartGame: (Int, Boolean) -> Unit,
    viewModel: GameInstructionsViewModel = hiltViewModel()
) {
    val engineFromRegistry = remember(gameId) { viewModel.getEngine(gameId) }
    val engineFromVm by viewModel.engine.collectAsStateWithLifecycle()
    val engine = engineFromRegistry ?: engineFromVm
    val stat by viewModel.stat.collectAsStateWithLifecycle()

    LaunchedEffect(gameId) {
        viewModel.load(gameId)
    }

    if (engine == null) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Game Not Found", fontWeight = FontWeight.Bold) },
                    navigationIcon = {
                        IconButton(onClick = onNavigateBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background
                    )
                )
            }
        ) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Game '$gameId' could not be found.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        return
    }

    val maxUnlocked = stat?.highestLevelUnlocked ?: 1
    var selectedLevel by remember(initialLevel, maxUnlocked) {
        mutableIntStateOf(initialLevel.coerceIn(1, 50).coerceAtMost(maxUnlocked.coerceAtLeast(initialLevel).coerceIn(1, 50)))
    }

    val listState = rememberLazyListState()
    LaunchedEffect(selectedLevel) {
        listState.animateScrollToItem((selectedLevel - 1).coerceAtLeast(0))
    }

    val categoryTokens = when (engine.category) {
        GameCategory.MATH -> CategoryThemes.Math
        GameCategory.MEMORY -> CategoryThemes.Memory
        GameCategory.FOCUS -> CategoryThemes.Focus
        GameCategory.LOGIC -> CategoryThemes.Logic
        GameCategory.LANGUAGE -> CategoryThemes.Language
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(engine.title, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = Spacing.lg, vertical = Spacing.sm),
            verticalArrangement = Arrangement.spacedBy(Spacing.lg)
        ) {
            // Header Info Card
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(Spacing.lg)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(categoryTokens.primary.copy(alpha = 0.2f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = engine.category.title.uppercase(),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = categoryTokens.primary
                            )
                        }

                        val currentStat = stat
                        if (currentStat != null && currentStat.bestScore > 0) {
                            Text(
                                text = "Best: ${currentStat.bestScore} pts",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = ForgeAmberPrimary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(Spacing.sm))

                    Text(
                        text = engine.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Level Selector Bar (1 to 50)
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Select Level (1–50)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = "Unlocked: $maxUnlocked/50",
                        style = MaterialTheme.typography.labelMedium,
                        color = ForgeAmberPrimary,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(Spacing.xs))

                // Tier quick jumps
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf(1 to "1-10", 11 to "20", 21 to "30", 31 to "40", 41 to "50").forEach { (targetLvl, label) ->
                        val isTierUnlocked = targetLvl <= maxUnlocked
                        val isTierSelected = selectedLevel in targetLvl until targetLvl + 10
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(
                                    if (isTierSelected) categoryTokens.primary.copy(alpha = 0.25f)
                                    else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                )
                                .clickable(enabled = isTierUnlocked) {
                                    selectedLevel = targetLvl.coerceAtMost(maxUnlocked)
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = label,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = if (isTierSelected) categoryTokens.primary
                                else if (isTierUnlocked) MaterialTheme.colorScheme.onSurfaceVariant
                                else MaterialTheme.colorScheme.outline
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(Spacing.sm))

                LazyRow(
                    state = listState,
                    horizontalArrangement = Arrangement.spacedBy(Spacing.sm)
                ) {
                    items((1..50).toList()) { lvl ->
                        val isUnlocked = lvl <= maxUnlocked
                        val isSelected = lvl == selectedLevel

                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    when {
                                        isSelected -> categoryTokens.primary
                                        isUnlocked -> MaterialTheme.colorScheme.surfaceVariant
                                        else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                                    }
                                )
                                .border(
                                    width = if (isSelected) 2.dp else 0.dp,
                                    color = if (isSelected) Color.White else Color.Transparent,
                                    shape = RoundedCornerShape(12.dp)
                                )
                                .clickable(enabled = isUnlocked) {
                                    selectedLevel = lvl
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "$lvl",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = when {
                                    isSelected -> Color(0xFF0F172A)
                                    isUnlocked -> MaterialTheme.colorScheme.onSurface
                                    else -> MaterialTheme.colorScheme.outline
                                }
                            )
                        }
                    }
                }
            }

            // Rules / Instructions
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(Spacing.lg)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.SportsEsports,
                            contentDescription = null,
                            tint = categoryTokens.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(Spacing.xs))
                        Text(
                            text = "Rules of the Round",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(Spacing.sm))

                    engine.instructions.forEachIndexed { index, rule ->
                        Row(
                            modifier = Modifier.padding(vertical = 4.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Text(
                                text = "${index + 1}.",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = categoryTokens.primary,
                                modifier = Modifier.width(22.dp)
                            )
                            Text(
                                text = rule,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }

            // Tactical Tips Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = CyanPulseSecondary.copy(alpha = 0.08f)
                )
            ) {
                Column(modifier = Modifier.padding(Spacing.lg)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Lightbulb,
                            contentDescription = null,
                            tint = CyanPulseSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(Spacing.xs))
                        Text(
                            text = "Tactical Tips",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = CyanPulseSecondary
                        )
                    }

                    Spacer(modifier = Modifier.height(Spacing.sm))

                    engine.tips.forEach { tip ->
                        Text(
                            text = "• $tip",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(Spacing.sm))

            // Action Buttons (Practice & Play)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(Spacing.md)
            ) {
                OutlinedButton(
                    onClick = { onStartGame(selectedLevel, true) },
                    modifier = Modifier
                        .weight(1f)
                        .height(54.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Text("Practice Round", fontWeight = FontWeight.SemiBold)
                }

                Button(
                    onClick = { onStartGame(selectedLevel, false) },
                    modifier = Modifier
                        .weight(1f)
                        .height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = categoryTokens.primary,
                        contentColor = Color(0xFF0F172A)
                    )
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(Spacing.xs))
                    Text("Start Level $selectedLevel", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
