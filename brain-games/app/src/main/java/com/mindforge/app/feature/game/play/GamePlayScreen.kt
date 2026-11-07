package com.mindforge.app.feature.game.play

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.keyframes
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.remember
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.mindforge.app.core.theme.CategoryThemes
import com.mindforge.app.core.theme.ErrorRed
import com.mindforge.app.core.theme.ForgeAmberPrimary
import com.mindforge.app.core.theme.Spacing
import com.mindforge.app.core.theme.SuccessGreen
import com.mindforge.app.feature.game.framework.GameSessionResult
import com.mindforge.app.feature.home.GameCategory

@Composable
fun GamePlayScreen(
    gameId: String,
    level: Int,
    isPractice: Boolean,
    onNavigateBack: () -> Unit,
    onGameFinished: (GameSessionResult) -> Unit,
    viewModel: GamePlayViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(gameId, level, isPractice) {
        viewModel.initialize(gameId, level, isPractice)
    }

    LaunchedEffect(state.isGameOver, state.sessionResult) {
        if (state.isGameOver && state.sessionResult != null) {
            onGameFinished(state.sessionResult!!)
        }
    }

    val categoryTokens = when (state.category) {
        GameCategory.MATH -> CategoryThemes.Math
        GameCategory.MEMORY -> CategoryThemes.Memory
        GameCategory.FOCUS -> CategoryThemes.Focus
        GameCategory.LOGIC -> CategoryThemes.Logic
        GameCategory.LANGUAGE -> CategoryThemes.Language
    }

    val stageBgColor by animateColorAsState(
        targetValue = when (state.feedbackState) {
            FeedbackType.CORRECT -> SuccessGreen.copy(alpha = 0.15f)
            FeedbackType.WRONG -> ErrorRed.copy(alpha = 0.15f)
            FeedbackType.NONE -> MaterialTheme.colorScheme.background
        },
        animationSpec = tween(durationMillis = 200),
        label = "StageFeedbackColor"
    )

    // Matiks-style tactile horizontal spring shake on wrong answers
    val shakeOffset = remember { Animatable(0f) }
    LaunchedEffect(state.shakeTrigger) {
        if (state.shakeTrigger > 0) {
            shakeOffset.snapTo(0f)
            shakeOffset.animateTo(
                targetValue = 0f,
                animationSpec = keyframes {
                    durationMillis = 350
                    0f at 0
                    (-14f) at 40
                    14f at 80
                    (-10f) at 130
                    10f at 180
                    (-6f) at 230
                    6f at 280
                    (-2f) at 320
                    0f at 350
                }
            )
        }
    }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .background(stageBgColor)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = Spacing.lg, vertical = Spacing.sm),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top Bar: Pause + Lives + Timer Bar + Streak Multiplier
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = viewModel::pauseGame) {
                    Icon(
                        imageVector = Icons.Default.Pause,
                        contentDescription = "Pause",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Mistake hearts
                if (!state.isPractice) {
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        val remainingLives = (state.maxMistakes - state.mistakes).coerceAtLeast(0)
                        repeat(state.maxMistakes) { index ->
                            Icon(
                                imageVector = if (index < remainingLives) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = null,
                                tint = if (index < remainingLives) ErrorRed else MaterialTheme.colorScheme.outlineVariant,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(ForgeAmberPrimary.copy(alpha = 0.2f))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "PRACTICE ROUND",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = ForgeAmberPrimary
                        )
                    }
                }

                // Streak combo
                if (state.streakCombo >= 2) {
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(ForgeAmberPrimary.copy(alpha = 0.2f))
                            .padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalFireDepartment,
                            contentDescription = null,
                            tint = ForgeAmberPrimary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = "${state.streakCombo}x",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = ForgeAmberPrimary
                        )
                    }
                } else {
                    Spacer(modifier = Modifier.width(40.dp))
                }
            }

            // Time bar
            if (!state.isPractice) {
                val progress = state.remainingTimeSeconds.toFloat() / state.totalTimeSeconds.toFloat()
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(CircleShape),
                    color = if (state.remainingTimeSeconds <= 10) ErrorRed else categoryTokens.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(Spacing.md))

            // Question index & score row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Q ${state.currentQuestionIndex + 1} of ${state.totalQuestions}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "${state.score} pts",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = ForgeAmberPrimary
                )
            }

            // Center Stage (The Prompt)
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .offset(x = shakeOffset.value.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    val promptText = state.currentQuestion?.prompt ?: ""
                    val isMultiLine = promptText.contains("\n")
                    val isGridOrCode = isMultiLine && (promptText.contains("┌") || promptText.contains("|") || promptText.contains("→") || promptText.contains("Card ") || promptText.length > 50)

                    val promptStyle = when {
                        isGridOrCode -> MaterialTheme.typography.titleMedium
                        isMultiLine || promptText.length > 25 -> MaterialTheme.typography.headlineMedium
                        else -> MaterialTheme.typography.displayMedium
                    }

                    Text(
                        text = promptText,
                        style = promptStyle,
                        fontFamily = if (isGridOrCode) androidx.compose.ui.text.font.FontFamily.Monospace else androidx.compose.ui.text.font.FontFamily.Default,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .padding(horizontal = Spacing.md)
                            .verticalScroll(rememberScrollState())
                    )

                    // Answer entry box if using keypad
                    if (state.currentQuestion?.options == null) {
                        Spacer(modifier = Modifier.height(Spacing.lg))
                        Box(
                            modifier = Modifier
                                .width(180.dp)
                                .height(56.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(
                                    when (state.feedbackState) {
                                        FeedbackType.WRONG -> ErrorRed.copy(alpha = 0.25f)
                                        FeedbackType.CORRECT -> SuccessGreen.copy(alpha = 0.25f)
                                        FeedbackType.NONE -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
                                    }
                                )
                                .border(
                                    width = 2.dp,
                                    color = when (state.feedbackState) {
                                        FeedbackType.WRONG -> ErrorRed
                                        FeedbackType.CORRECT -> SuccessGreen
                                        FeedbackType.NONE -> if (state.currentInput.isNotEmpty()) categoryTokens.primary else MaterialTheme.colorScheme.outlineVariant
                                    },
                                    shape = RoundedCornerShape(14.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = state.currentInput.ifEmpty { "—" },
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.Bold,
                                color = when (state.feedbackState) {
                                    FeedbackType.WRONG -> ErrorRed
                                    FeedbackType.CORRECT -> SuccessGreen
                                    FeedbackType.NONE -> if (state.currentInput.isNotEmpty()) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outline
                                }
                            )
                        }
                    }
                }
            }

            // Input Section: Either Multiple Choice or Numeric Keypad
            if (state.currentQuestion?.options != null) {
                Box(modifier = Modifier.offset(x = shakeOffset.value.dp)) {
                    OptionsInputGrid(
                        options = state.currentQuestion!!.options!!,
                        onOptionClick = viewModel::onOptionSelected,
                        accentColor = categoryTokens.primary
                    )
                }
            } else {
                NumericKeypad(
                    onDigitClick = viewModel::onDigitInput,
                    onMinusClick = viewModel::onMinusInput,
                    onBackspace = viewModel::onBackspace,
                    onClear = viewModel::onClear,
                    onSubmit = viewModel::submitCurrentInput,
                    accentColor = categoryTokens.primary
                )
            }
        }
    }

    // Pause Dialog
    if (state.isPaused) {
        AlertDialog(
            onDismissRequest = viewModel::resumeGame,
            title = { Text("Session Paused") },
            text = { Text("Take a breath. The clock is frozen.") },
            confirmButton = {
                Button(
                    onClick = viewModel::resumeGame,
                    colors = ButtonDefaults.buttonColors(containerColor = categoryTokens.primary)
                ) {
                    Text("Resume Round", color = Color(0xFF0F172A))
                }
            },
            dismissButton = {
                TextButton(onClick = onNavigateBack) {
                    Text("Quit to Train")
                }
            }
        )
    }
}

@Composable
private fun OptionsInputGrid(
    options: List<String>,
    onOptionClick: (String) -> Unit,
    accentColor: Color
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = Spacing.md),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm)
    ) {
        val rows = options.chunked(2)
        rows.forEach { rowOptions ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(Spacing.sm)
            ) {
                rowOptions.forEach { opt ->
                    Button(
                        onClick = { onOptionClick(opt) },
                        modifier = Modifier
                            .weight(1f)
                            .height(64.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            contentColor = MaterialTheme.colorScheme.onSurface
                        ),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
                    ) {
                        Text(
                            text = opt,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun NumericKeypad(
    onDigitClick: (Char) -> Unit,
    onMinusClick: () -> Unit,
    onBackspace: () -> Unit,
    onClear: () -> Unit,
    onSubmit: () -> Unit,
    accentColor: Color
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = Spacing.xs),
        verticalArrangement = Arrangement.spacedBy(Spacing.xs)
    ) {
        // Rows 1-3 (Numbers 1-9)
        val digits = listOf(
            listOf('1', '2', '3'),
            listOf('4', '5', '6'),
            listOf('7', '8', '9')
        )

        digits.forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(Spacing.xs)
            ) {
                row.forEach { d ->
                    KeypadButton(
                        text = d.toString(),
                        onClick = { onDigitClick(d) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Row 4: Minus, 0, Backspace
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs)
        ) {
            KeypadButton(
                text = "−",
                onClick = onMinusClick,
                modifier = Modifier.weight(1f)
            )
            KeypadButton(
                text = "0",
                onClick = { onDigitClick('0') },
                modifier = Modifier.weight(1f)
            )
            Surface(
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .clickable { onBackspace() },
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.Backspace,
                        contentDescription = "Backspace",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        }

        // Row 5: Clear and Submit
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = Spacing.xxs),
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs)
        ) {
            OutlinedButton(
                onClick = onClear,
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Clear", fontWeight = FontWeight.SemiBold)
            }

            Button(
                onClick = onSubmit,
                modifier = Modifier
                    .weight(2f)
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = accentColor,
                    contentColor = Color(0xFF0F172A)
                )
            ) {
                Text("Submit Answer", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}

@Composable
private fun KeypadButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .height(52.dp)
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() },
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f),
        tonalElevation = 1.dp
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = text,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
