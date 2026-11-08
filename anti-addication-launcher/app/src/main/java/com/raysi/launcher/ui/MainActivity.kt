// app/src/main/java/com/raysi/launcher/ui/MainActivity.kt
package com.raysi.launcher.ui

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.AbstractSavedStateViewModelFactory
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import kotlinx.coroutines.launch
import com.raysi.launcher.FocusApplication
import com.raysi.launcher.service.FocusAccessibilityService
import com.raysi.launcher.service.notification.NotificationUtils
import com.raysi.launcher.util.SystemThemingHelper
import com.raysi.launcher.ui.drawer.DrawerScreen
import com.raysi.launcher.ui.drawer.DrawerViewModel
import com.raysi.launcher.ui.gate.GateScreen
import com.raysi.launcher.ui.gate.GateState
import com.raysi.launcher.ui.gate.GateViewModel
import com.raysi.launcher.ui.home.HomeScreen
import com.raysi.launcher.ui.home.HomeViewModel
import com.raysi.launcher.ui.quarantine.QuarantineScreen
import com.raysi.launcher.ui.quarantine.QuarantineViewModel
import com.raysi.launcher.ui.scratchpad.ScratchpadOverlay
import com.raysi.launcher.ui.settings.SettingsScreen
import com.raysi.launcher.ui.settings.SettingsViewModel
import com.raysi.launcher.ui.theme.FocusLauncherTheme
import com.raysi.launcher.ui.theme.OledBlack

/**
 * MainActivity: Single Activity host for FocusLauncher.
 * Configured with launchMode="singleTask", windowShowWallpaper=false, edge-to-edge,
 * manual service locator DI, and zero disk-blocking operations before first frame render.
 */
class MainActivity : ComponentActivity() {

    private val homeViewModel: HomeViewModel by viewModels {
        object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val locator = FocusApplication.instance.locator
                return HomeViewModel(
                    appInventoryRepository = locator.appInventoryRepository,
                    settingsRepository = locator.settingsRepository,
                    telemetryRepository = locator.telemetryRepository,
                    preferencesRepository = locator.preferencesRepository,
                    quarantineRepository = locator.quarantineRepository,
                    systemThemingHelper = locator.systemThemingHelper
                ) as T
            }
        }
    }

    private val quarantineViewModel: QuarantineViewModel by viewModels {
        object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val locator = FocusApplication.instance.locator
                return QuarantineViewModel(
                    quarantineRepository = locator.quarantineRepository,
                    appInventoryRepository = locator.appInventoryRepository,
                    dispatchers = locator.dispatchers
                ) as T
            }
        }
    }

    private val drawerViewModel: DrawerViewModel by viewModels {
        object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val locator = FocusApplication.instance.locator
                return DrawerViewModel(
                    appInventoryRepository = locator.appInventoryRepository,
                    searchEngine = locator.searchEngine,
                    settingsRepository = locator.settingsRepository,
                    dispatchers = locator.dispatchers
                ) as T
            }
        }
    }

    private val gateViewModel: GateViewModel by viewModels {
        object : AbstractSavedStateViewModelFactory(this, null) {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(
                key: String,
                modelClass: Class<T>,
                handle: SavedStateHandle
            ): T {
                val locator = FocusApplication.instance.locator
                return GateViewModel(
                    savedStateHandle = handle,
                    settingsRepository = locator.settingsRepository,
                    appInventoryRepository = locator.appInventoryRepository,
                    dispatchers = locator.dispatchers
                ) as T
            }
        }
    }

    private val settingsViewModel: SettingsViewModel by viewModels {
        object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val locator = FocusApplication.instance.locator
                return SettingsViewModel(
                    settingsRepository = locator.settingsRepository,
                    appInventoryRepository = locator.appInventoryRepository,
                    usageRepository = locator.usageRepository,
                    preferencesRepository = locator.preferencesRepository,
                    dispatchers = locator.dispatchers
                ) as T
            }
        }
    }

    private var isQuarantineOpen = androidx.compose.runtime.mutableStateOf(false)
    private var isSettingsOpen = androidx.compose.runtime.mutableStateOf(false)
    private var isScratchpadOpen = androidx.compose.runtime.mutableStateOf(false)

    private val defaultLauncherResultLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        homeViewModel.refreshDefaultLauncherStatus()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (intent?.action == NotificationUtils.ACTION_OPEN_QUARANTINE) {
            isQuarantineOpen.value = true
        }

        // Enforce edge-to-edge rendering across all supported API levels (28-35)
        SystemThemingHelper.configureEdgeToEdge(this, homeViewModel.isStealthMode.value)
        SystemThemingHelper.applyZeroJankTransition(this)

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                homeViewModel.isStealthMode.collect { stealth ->
                    SystemThemingHelper.configureEdgeToEdge(this@MainActivity, stealth)
                }
            }
        }

        setContent {
            FocusLauncherTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = OledBlack
                ) {
                    val gateState by gateViewModel.gateState.collectAsState()
                    val isDrawerOpen by drawerViewModel.isDrawerOpen.collectAsState()
                    val showQuarantine by isQuarantineOpen
                    val showSettings by isSettingsOpen
                    val showScratchpad by isScratchpadOpen

                    if (gateState !is GateState.Idle) {
                        GateScreen(
                            viewModel = gateViewModel,
                            onCancel = { gateViewModel.cancelGate() }
                        )
                    } else if (showSettings) {
                        SettingsScreen(
                            viewModel = settingsViewModel,
                            onRequestDefaultLauncher = { requestDefaultLauncher() },
                            onDismiss = { isSettingsOpen.value = false }
                        )
                    } else if (showQuarantine) {
                        QuarantineScreen(
                            viewModel = quarantineViewModel,
                            onLaunchPackage = { pkg ->
                                isQuarantineOpen.value = false
                                val app = FocusApplication.instance.locator.appInventoryRepository.appsFlow.value.firstOrNull { it.packageName == pkg }
                                if (app != null) {
                                    gateViewModel.checkAndLaunch(app)
                                } else {
                                    val launchIntent = packageManager.getLaunchIntentForPackage(pkg)
                                    if (launchIntent != null) {
                                        try {
                                            startActivity(launchIntent)
                                        } catch (ignored: Exception) {
                                        }
                                    }
                                }
                            },
                            onDismiss = { isQuarantineOpen.value = false }
                        )
                    } else if (showScratchpad) {
                        val scratchContent by homeViewModel.scratchpadContent.collectAsState()
                        ScratchpadOverlay(
                            initialContent = scratchContent,
                            onSaveContent = { homeViewModel.saveScratchpad(it) },
                            onDismiss = { isScratchpadOpen.value = false }
                        )
                    } else if (isDrawerOpen) {
                        DrawerScreen(
                            viewModel = drawerViewModel,
                            onCloseDrawer = { drawerViewModel.closeDrawer() },
                            onLaunchApp = { app -> gateViewModel.checkAndLaunch(app) }
                        )
                    } else {
                        HomeScreen(
                            viewModel = homeViewModel,
                            onOpenDrawer = {
                                drawerViewModel.openDrawer()
                            },
                            onOpenSettings = {
                                isSettingsOpen.value = true
                            },
                            onOpenQuarantine = {
                                isQuarantineOpen.value = true
                            },
                            onOpenScratchpad = {
                                isScratchpadOpen.value = true
                            },
                            onRequestDefaultLauncher = {
                                requestDefaultLauncher()
                            },
                            onOpenUsageAccessSettings = {
                                openUsageAccessSettings()
                            },
                            onLaunchApp = { app ->
                                gateViewModel.checkAndLaunch(app)
                            }
                        )
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        homeViewModel.onResume()
        applyImmersiveStatusBar()
        SystemThemingHelper.applyZeroJankTransition(this)
    }

    private fun applyImmersiveStatusBar() {
        SystemThemingHelper.configureEdgeToEdge(this, homeViewModel.isStealthMode.value)
    }

    override fun onPause() {
        super.onPause()
        homeViewModel.onPause()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (intent.action == NotificationUtils.ACTION_OPEN_QUARANTINE) {
            isQuarantineOpen.value = true
            isSettingsOpen.value = false
            isScratchpadOpen.value = false
            gateViewModel.cancelGate()
            drawerViewModel.closeDrawer()
        } else {
            // Home press while open -> close gate, drawer, quarantine, settings and return to Home
            isQuarantineOpen.value = false
            isSettingsOpen.value = false
            isScratchpadOpen.value = false
            gateViewModel.cancelGate()
            drawerViewModel.closeDrawer()
        }
    }

    private fun requestDefaultLauncher() {
        try {
            val intent = FocusApplication.instance.locator.appInventoryRepository.createDefaultLauncherIntent()
            defaultLauncherResultLauncher.launch(intent)
        } catch (e: Exception) {
            // Degrade gracefully if settings intent fails to resolve
        }
    }

    private fun openUsageAccessSettings() {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            startActivity(intent)
        } catch (e: Exception) {
            // Degrade gracefully if intent fails on exotic ROMs
        }
    }
}
