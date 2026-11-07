package com.mindforge.app.core.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.mindforge.app.feature.achievements.AchievementsScreen
import com.mindforge.app.feature.challenge.DailyChallengeScreen
import com.mindforge.app.feature.game.instructions.GameInstructionsScreen
import com.mindforge.app.feature.game.play.GamePlayScreen
import com.mindforge.app.feature.game.results.GameResultsScreen
import com.mindforge.app.feature.game.results.GameResultsViewModel
import com.mindforge.app.feature.home.HomeScreen
import com.mindforge.app.feature.onboarding.OnboardingScreen
import com.mindforge.app.feature.profile.ProfileEditScreen
import com.mindforge.app.feature.settings.SettingsScreen
import com.mindforge.app.feature.stats.StatsScreen

@Composable
fun MindForgeNavGraph(
    navController: NavHostController,
    startDestination: Screen,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable<Screen.Onboarding> {
            OnboardingScreen(
                onFinished = {
                    navController.navigate(Screen.Home) {
                        popUpTo(Screen.Onboarding) { inclusive = true }
                    }
                }
            )
        }

        composable<Screen.Home> {
            HomeScreen(
                onNavigateToGame = { gameId, level ->
                    navController.navigate(Screen.GameInstructions(gameId, level))
                },
                onNavigateToDailyChallenge = {
                    navController.navigate(Screen.DailyChallenge)
                },
                onNavigateToStats = {
                    navController.navigate(Screen.Stats)
                },
                onNavigateToAchievements = {
                    navController.navigate(Screen.Achievements)
                },
                onNavigateToSettings = {
                    navController.navigate(Screen.Settings)
                }
            )
        }

        composable<Screen.Settings> {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToProfileEdit = { navController.navigate(Screen.ProfileEdit) }
            )
        }

        composable<Screen.ProfileEdit> {
            ProfileEditScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable<Screen.GameInstructions> { backStackEntry ->
            val route = backStackEntry.toRoute<Screen.GameInstructions>()
            GameInstructionsScreen(
                gameId = route.gameId,
                initialLevel = route.level,
                onNavigateBack = { navController.popBackStack() },
                onStartGame = { lvl, isPractice ->
                    navController.navigate(Screen.GamePlay(route.gameId, lvl, isPractice))
                }
            )
        }

        composable<Screen.GamePlay> { backStackEntry ->
            val route = backStackEntry.toRoute<Screen.GamePlay>()
            GamePlayScreen(
                gameId = route.gameId,
                level = route.level,
                isPractice = route.isPractice,
                onNavigateBack = { navController.popBackStack() },
                onGameFinished = { result ->
                    navController.navigate(Screen.GameResults(result.sessionId)) {
                        popUpTo(Screen.GamePlay(route.gameId, route.level, route.isPractice)) { inclusive = true }
                    }
                }
            )
        }

        composable<Screen.GameResults> {
            val vm: GameResultsViewModel = hiltViewModel()
            val result by vm.result.collectAsStateWithLifecycle()
            if (result != null) {
                GameResultsScreen(
                    result = result!!,
                    onPlayNextLevel = { nextLvl ->
                        navController.navigate(Screen.GamePlay(result!!.gameId, nextLvl)) {
                            popUpTo(Screen.Home) { inclusive = false }
                        }
                    },
                    onRetry = { lvl ->
                        navController.navigate(Screen.GamePlay(result!!.gameId, lvl)) {
                            popUpTo(Screen.Home) { inclusive = false }
                        }
                    },
                    onNavigateHome = {
                        navController.navigate(Screen.Home) {
                            popUpTo(Screen.Home) { inclusive = true }
                        }
                    }
                )
            } else {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    androidx.compose.material3.CircularProgressIndicator(
                        color = com.mindforge.app.core.theme.ForgeAmberPrimary
                    )
                }
            }
        }

        composable<Screen.DailyChallenge> {
            DailyChallengeScreen(
                onNavigateBack = { navController.popBackStack() },
                onStartGame = { gameId ->
                    navController.navigate(Screen.GameInstructions(gameId, level = 1))
                }
            )
        }

        composable<Screen.Stats> {
            StatsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable<Screen.Achievements> {
            AchievementsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}

@Composable
fun PlaceholderScreen(title: String) {
    Scaffold { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentAlignment = Alignment.Center
        ) {
            Text(text = title)
        }
    }
}
