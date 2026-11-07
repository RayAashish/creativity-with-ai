package com.cliplocker.app.service

import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import android.widget.Toast
import com.cliplocker.app.data.repository.ClipRepository
import com.cliplocker.app.ui.MainActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class CliplockerTileService : TileService() {

    @Inject
    lateinit var clipRepository: ClipRepository

    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onStartListening() {
        super.onStartListening()
        qsTile?.apply {
            state = Tile.STATE_ACTIVE
            label = "Cliplocker"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                subtitle = "Tap to save clip"
            }
            updateTile()
        }
    }

    override fun onClick() {
        super.onClick()
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        if (clipboard == null || !clipboard.hasPrimaryClip()) {
            Toast.makeText(this, "Clipboard is empty", Toast.LENGTH_SHORT).show()
            return
        }

        val clip = clipboard.primaryClip
        val item = clip?.getItemAt(0)
        val text = item?.text?.toString() ?: item?.uri?.toString()

        if (!text.isNullOrBlank()) {
            scope.launch {
                val imageUri = if (clip?.description?.hasMimeType("image/*") == true) item?.uri else null
                val id = clipRepository.saveNewClipFromCapture(
                    content = text,
                    sourceAppPackage = null,
                    imageUri = imageUri
                )
                launch(Dispatchers.Main) {
                    if (id != null) {
                        Toast.makeText(this@CliplockerTileService, "✓ Clip saved to Cliplocker", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@CliplockerTileService, "Clip already saved or ignored", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        } else {
            // Open Cliplocker main screen
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                // Android 14+ startActivityAndCollapse requires PendingIntent or normal startActivity
                val pendingIntent = android.app.PendingIntent.getActivity(
                    this, 0, intent, android.app.PendingIntent.FLAG_IMMUTABLE
                )
                startActivityAndCollapse(pendingIntent)
            } else {
                @Suppress("DEPRECATION", "StartActivityAndCollapseDeprecated")
                startActivityAndCollapse(intent)
            }
        }
    }
}
