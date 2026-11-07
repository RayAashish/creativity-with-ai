package com.cliplocker.app.ui

import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import android.widget.Toast
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.lifecycleScope
import com.cliplocker.app.data.repository.ClipRepository
import com.cliplocker.app.widget.CliplockerWidgetProvider
import kotlinx.coroutines.launch
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.cliplocker.app.data.preferences.PreferencesManager
import com.cliplocker.app.ui.components.BiometricPromptHelper
import com.cliplocker.app.ui.detail.ClipDetailScreen
import com.cliplocker.app.ui.detail.ClipDetailViewModel
import com.cliplocker.app.ui.main.MainScreen
import com.cliplocker.app.ui.main.MainViewModel
import com.cliplocker.app.ui.settings.SettingsScreen
import com.cliplocker.app.ui.settings.SettingsViewModel
import com.cliplocker.app.ui.theme.CliplockerTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : FragmentActivity() {

    @Inject
    lateinit var preferencesManager: PreferencesManager

    @Inject
    lateinit var clipRepository: ClipRepository

    override fun onResume() {
        super.onResume()
        syncCurrentClipboard()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            syncCurrentClipboard()
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingShare(intent)
    }

    private fun handleIncomingShare(intent: Intent?) {
        if (intent == null) return
        when (intent.action) {
            Intent.ACTION_SEND -> {
                val mimeType = intent.type ?: return
                if (mimeType.startsWith("text/")) {
                    val text = intent.getStringExtra(Intent.EXTRA_TEXT)
                    if (!text.isNullOrBlank()) {
                        saveSharedClip(text, imageUri = null)
                    }
                } else if (mimeType.startsWith("image/")) {
                    val imageUri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        intent.getParcelableExtra(Intent.EXTRA_STREAM)
                    }
                    if (imageUri != null) {
                        saveSharedClip(content = imageUri.toString(), imageUri = imageUri)
                    }
                }
            }
        }
    }

    private fun saveSharedClip(content: String, imageUri: Uri?) {
        lifecycleScope.launch {
            val id = clipRepository.saveNewClipFromCapture(
                content = content,
                sourceAppPackage = null,
                imageUri = imageUri
            )
            if (id != null) {
                Toast.makeText(this@MainActivity, "✓ Saved to Cliplocker", Toast.LENGTH_SHORT).show()
                CliplockerWidgetProvider.updateAllWidgets(this@MainActivity)
            }
        }
    }

    private fun syncCurrentClipboard() {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return
        if (!clipboard.hasPrimaryClip()) return

        val clip = try {
            clipboard.primaryClip
        } catch (e: Exception) {
            Log.w("Cliplocker", "Failed to access clipboard: ${e.message}")
            null
        } ?: return

        if (clip.itemCount == 0) return

        val item = clip.getItemAt(0) ?: return
        val description = clip.description
        val hasImage = description?.hasMimeType("image/*") == true ||
                description?.hasMimeType(ClipDescription.MIMETYPE_TEXT_URILIST) == true
        val imageUri = if (hasImage) item.uri else null
        val text = item.text?.toString() ?: if (!hasImage) item.coerceToText(this)?.toString() else null

        val content = text ?: imageUri?.toString() ?: return
        if (content.isBlank()) return

        lifecycleScope.launch {
            val id = clipRepository.saveNewClipFromCapture(
                content = content,
                sourceAppPackage = null,
                imageUri = imageUri
            )
            if (id != null) {
                CliplockerWidgetProvider.updateAllWidgets(this@MainActivity)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        handleIncomingShare(intent)

        setContent {
            val prefs by preferencesManager.userPreferences.collectAsState()

            // Observe FLAG_SECURE
            LaunchedEffect(prefs.flagSecureEnabled) {
                if (prefs.flagSecureEnabled) {
                    window.setFlags(
                        WindowManager.LayoutParams.FLAG_SECURE,
                        WindowManager.LayoutParams.FLAG_SECURE
                    )
                } else {
                    window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
                }
            }

            CliplockerTheme(themeMode = prefs.themeMode) {
                // Biometric lock gate
                var isAuthenticated by remember {
                    mutableStateOf(!prefs.biometricLockEnabled)
                }

                LaunchedEffect(prefs.biometricLockEnabled) {
                    if (prefs.biometricLockEnabled && !isAuthenticated) {
                        BiometricPromptHelper.authenticate(
                            activity = this@MainActivity,
                            title = "Cliplocker Locked",
                            subtitle = "Verify identity to open clipboard history",
                            onSuccess = { isAuthenticated = true },
                            onError = { /* Keep locked */ }
                        )
                    }
                }

                if (!isAuthenticated) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(CliplockerTheme.colors.background),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Cliplocker is locked.\nAuthenticate to continue.",
                            style = CliplockerTheme.typography.title,
                            color = CliplockerTheme.colors.inkPrimary
                        )
                    }
                } else {
                    val navController = rememberNavController()

                    LaunchedEffect(intent?.action) {
                        if (intent?.action == ACTION_SETTINGS) {
                            navController.navigate("settings")
                        }
                    }

                    NavHost(
                        navController = navController,
                        startDestination = "main"
                    ) {
                        composable("main") {
                            val mainViewModel: MainViewModel = hiltViewModel()
                            MainScreen(
                                viewModel = mainViewModel,
                                onNavigateToDetail = { clipId ->
                                    navController.navigate("detail/$clipId")
                                },
                                onNavigateToSettings = {
                                    navController.navigate("settings")
                                }
                            )
                        }

                        composable(
                            route = "detail/{clipId}",
                            arguments = listOf(
                                navArgument("clipId") { type = NavType.LongType }
                            )
                        ) {
                            val detailViewModel: ClipDetailViewModel = hiltViewModel()
                            ClipDetailScreen(
                                viewModel = detailViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }

                        composable("settings") {
                            val settingsViewModel: SettingsViewModel = hiltViewModel()
                            SettingsScreen(
                                viewModel = settingsViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }

    companion object {
        const val ACTION_OPEN_SEARCH = "com.cliplocker.action.OPEN_SEARCH"
        const val ACTION_SETTINGS = "com.cliplocker.action.SETTINGS"
    }
}
