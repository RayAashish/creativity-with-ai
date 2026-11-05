package com.antigravity.note

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.antigravity.note.designsystem.theme.DreamNoteTheme
import com.antigravity.note.inkengine.probe.DeviceProbeController
import com.antigravity.note.ui.canvas.InkCanvasScreen
import com.antigravity.note.ui.keyboard.KeyboardShortcutManager
import com.antigravity.note.ui.probe.DeviceProbeScreen
import com.antigravity.note.ui.settings.AppSettings

class MainActivity : ComponentActivity() {

    private lateinit var probeController: DeviceProbeController
    private var incomingUri by mutableStateOf<Uri?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Keep screen on during inking sessions
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        probeController = DeviceProbeController(applicationContext)
        incomingUri = intent?.data ?: intent?.getParcelableExtra(Intent.EXTRA_STREAM)

        setContent {
            val appSettings = remember { AppSettings(applicationContext) }
            var isDarkMode by remember { mutableStateOf(appSettings.isDarkMode) }

            DreamNoteTheme(darkTheme = isDarkMode) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    var currentScreen by remember { mutableStateOf("canvas") }

                    when (currentScreen) {
                        "canvas" -> {
                            InkCanvasScreen(
                                isDarkMode = isDarkMode,
                                onToggleDarkMode = { newDark ->
                                    isDarkMode = newDark
                                    appSettings.isDarkMode = newDark
                                },
                                onNavigateToProbe = {
                                    currentScreen = "probe"
                                },
                                incomingFileUri = incomingUri
                            )
                        }
                        "probe" -> {
                            DeviceProbeScreen(
                                probeController = probeController,
                                onNavigateToCanvas = {
                                    currentScreen = "canvas"
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        incomingUri = intent.data ?: intent.getParcelableExtra(Intent.EXTRA_STREAM)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        if (KeyboardShortcutManager.onKeyDown(keyCode, event)) {
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onResume() {
        super.onResume()
        probeController.request144Hz(window)
    }

    override fun onPause() {
        super.onPause()
        probeController.releaseHighRefreshRate(window)
    }
}
