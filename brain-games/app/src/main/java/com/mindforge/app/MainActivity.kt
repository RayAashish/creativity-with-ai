package com.mindforge.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.rememberNavController
import com.mindforge.app.core.navigation.MindForgeNavGraph
import com.mindforge.app.core.navigation.Screen
import com.mindforge.app.core.theme.MindForgeTheme
import com.mindforge.app.data.local.preferences.UserPreferences
import com.mindforge.app.data.local.preferences.UserPreferencesRepository
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var preferencesRepository: UserPreferencesRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val userPrefs by preferencesRepository.userPreferencesFlow
                .collectAsStateWithLifecycle(initialValue = UserPreferences())

            MindForgeTheme(
                themeMode = userPrefs.themeMode,
                dynamicColor = userPrefs.dynamicColor
            ) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val navController = rememberNavController()
                    val startDest: Screen = if (userPrefs.isOnboardingCompleted) {
                        Screen.Home
                    } else {
                        Screen.Onboarding
                    }

                    MindForgeNavGraph(
                        navController = navController,
                        startDestination = startDest
                    )
                }
            }
        }
    }
}
