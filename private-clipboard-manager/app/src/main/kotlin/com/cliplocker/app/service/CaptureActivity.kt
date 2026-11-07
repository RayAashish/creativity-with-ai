package com.cliplocker.app.service

import androidx.activity.ComponentActivity
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.widget.Toast
import com.cliplocker.app.data.repository.ClipRepository
import com.cliplocker.app.widget.CliplockerWidgetProvider
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class CaptureActivity : ComponentActivity() {

    @Inject
    lateinit var clipRepository: ClipRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Read clipboard immediately with foreground focus
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        if (clipboard == null || !clipboard.hasPrimaryClip()) {
            Toast.makeText(this, "Clipboard is empty", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        val clip = clipboard.primaryClip
        val item = clip?.getItemAt(0)
        val hasImage = clip?.description?.hasMimeType("image/*") == true
        val imageUri = if (hasImage) item?.uri else null
        val text = item?.text?.toString() ?: if (!hasImage) item?.coerceToText(this)?.toString() else null

        val content = text ?: imageUri?.toString()
        if (content.isNullOrBlank()) {
            Toast.makeText(this, "Clipboard is empty", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            val insertedId = clipRepository.saveNewClipFromCapture(
                content = content,
                sourceAppPackage = null,
                imageUri = imageUri
            )

            launch(Dispatchers.Main) {
                if (insertedId != null) {
                    Toast.makeText(this@CaptureActivity, "✓ Clip saved to Cliplocker", Toast.LENGTH_SHORT).show()
                    CliplockerWidgetProvider.updateAllWidgets(this@CaptureActivity)
                } else {
                    Toast.makeText(this@CaptureActivity, "Clip already saved or ignored", Toast.LENGTH_SHORT).show()
                }
                finish()
            }
        }
    }
}
