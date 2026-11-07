package org.ledger.pdf

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import dagger.hilt.android.AndroidEntryPoint
import org.ledger.pdf.ui.navigation.Screen
import org.ledger.pdf.ui.navigation.UriRouteCodec
import org.ledger.pdf.ui.screens.batch.BatchScreen
import org.ledger.pdf.ui.screens.batch.BatchViewModel
import org.ledger.pdf.ui.screens.compress.CompressScreen
import org.ledger.pdf.ui.screens.compress.CompressViewModel
import org.ledger.pdf.ui.screens.home.HomeScreen
import org.ledger.pdf.ui.screens.home.HomeViewModel
import org.ledger.pdf.ui.screens.merge.MergeScreen
import org.ledger.pdf.ui.screens.merge.MergeViewModel
import org.ledger.pdf.ui.screens.metadata.MetadataScreen
import org.ledger.pdf.ui.screens.metadata.MetadataViewModel
import org.ledger.pdf.ui.screens.ocr.OcrScreen
import org.ledger.pdf.ui.screens.ocr.OcrViewModel
import org.ledger.pdf.ui.screens.settings.SettingsScreen
import org.ledger.pdf.ui.screens.settings.SettingsViewModel
import org.ledger.pdf.ui.screens.sign.SignScreen
import org.ledger.pdf.ui.screens.sign.SignViewModel
import org.ledger.pdf.ui.screens.split.SplitScreen
import org.ledger.pdf.ui.screens.split.SplitViewModel
import org.ledger.pdf.ui.screens.workspace.WorkspaceScreen
import org.ledger.pdf.ui.screens.workspace.WorkspaceViewModel
import org.ledger.pdf.ui.theme.LedgerTheme

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val initialUri = if (intent?.action == Intent.ACTION_VIEW) {
            intent.data
        } else null

        setContent {
            val settingsViewModel: SettingsViewModel = hiltViewModel()
            val settingsState by settingsViewModel.uiState.collectAsState()

            LedgerTheme(themeMode = settingsState.themeMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = LedgerTheme.colors.background
                ) {
                    LedgerAppNav(initialUri = initialUri)
                }
            }
        }
    }
}

@Composable
fun LedgerAppNav(initialUri: Uri? = null) {
    val navController = rememberNavController()
    val startDestination = if (initialUri != null) {
        Screen.Workspace(initialUri).route
    } else {
        Screen.Home.route
    }

    NavHost(navController = navController, startDestination = startDestination) {
        composable(Screen.Home.route) {
            val homeVm: HomeViewModel = hiltViewModel()
            HomeScreen(
                viewModel = homeVm,
                onOpenWorkspace = { uri ->
                    navController.navigate(Screen.Workspace(uri).route)
                },
                onNavigateMerge = { navController.navigate(Screen.Merge.route) },
                onNavigateBatch = { navController.navigate(Screen.Batch.route) },
                onNavigateSettings = { navController.navigate(Screen.Settings.route) }
            )
        }

        composable(
            route = Screen.Workspace.ROUTE_TEMPLATE,
            arguments = listOf(navArgument("encodedUri") { type = NavType.StringType })
        ) { backStackEntry ->
            val encodedUri = backStackEntry.arguments?.getString("encodedUri") ?: ""
            val uri = UriRouteCodec.decode(encodedUri)
            val workspaceVm: WorkspaceViewModel = hiltViewModel()

            WorkspaceScreen(
                uri = uri,
                viewModel = workspaceVm,
                onBack = { navController.popBackStack() },
                onNavigateSplit = { navController.navigate(Screen.Split(it).route) },
                onNavigateCompress = { navController.navigate(Screen.Compress(it).route) },
                onNavigateOcr = { navController.navigate(Screen.Ocr(it).route) },
                onNavigateStrip = { navController.navigate(Screen.StripMetadata(it).route) },
                onNavigateSign = { navController.navigate(Screen.Sign(it).route) }
            )
        }

        composable(Screen.Merge.route) {
            val mergeVm: MergeViewModel = hiltViewModel()
            MergeScreen(
                viewModel = mergeVm,
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.Split.ROUTE_TEMPLATE,
            arguments = listOf(navArgument("encodedUri") { type = NavType.StringType })
        ) { backStackEntry ->
            val encodedUri = backStackEntry.arguments?.getString("encodedUri") ?: ""
            val uri = UriRouteCodec.decode(encodedUri)
            val splitVm: SplitViewModel = hiltViewModel()

            SplitScreen(
                uri = uri,
                viewModel = splitVm,
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.Compress.ROUTE_TEMPLATE,
            arguments = listOf(navArgument("encodedUri") { type = NavType.StringType })
        ) { backStackEntry ->
            val encodedUri = backStackEntry.arguments?.getString("encodedUri") ?: ""
            val uri = UriRouteCodec.decode(encodedUri)
            val compressVm: CompressViewModel = hiltViewModel()

            CompressScreen(
                uri = uri,
                viewModel = compressVm,
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.Ocr.ROUTE_TEMPLATE,
            arguments = listOf(navArgument("encodedUri") { type = NavType.StringType })
        ) { backStackEntry ->
            val encodedUri = backStackEntry.arguments?.getString("encodedUri") ?: ""
            val uri = UriRouteCodec.decode(encodedUri)
            val ocrVm: OcrViewModel = hiltViewModel()

            OcrScreen(
                uri = uri,
                viewModel = ocrVm,
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.StripMetadata.ROUTE_TEMPLATE,
            arguments = listOf(navArgument("encodedUri") { type = NavType.StringType })
        ) { backStackEntry ->
            val encodedUri = backStackEntry.arguments?.getString("encodedUri") ?: ""
            val uri = UriRouteCodec.decode(encodedUri)
            val metadataVm: MetadataViewModel = hiltViewModel()

            MetadataScreen(
                uri = uri,
                viewModel = metadataVm,
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.Sign.ROUTE_TEMPLATE,
            arguments = listOf(navArgument("encodedUri") { type = NavType.StringType })
        ) { backStackEntry ->
            val encodedUri = backStackEntry.arguments?.getString("encodedUri") ?: ""
            val uri = UriRouteCodec.decode(encodedUri)
            val signVm: SignViewModel = hiltViewModel()

            SignScreen(
                uri = uri,
                viewModel = signVm,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Batch.route) {
            val batchVm: BatchViewModel = hiltViewModel()
            BatchScreen(
                viewModel = batchVm,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Settings.route) {
            val settingsVm: SettingsViewModel = hiltViewModel()
            SettingsScreen(
                viewModel = settingsVm,
                onBack = { navController.popBackStack() }
            )
        }
    }
}
