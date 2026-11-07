package com.cliplocker.app.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.cliplocker.app.core.detector.SensitiveContentDetector
import com.cliplocker.app.data.repository.ClipRepository
import com.cliplocker.app.widget.CliplockerWidgetProvider
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class ClipboardAccessibilityService : AccessibilityService() {

    @Inject
    lateinit var clipRepository: ClipRepository

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var clipboardManager: ClipboardManager? = null
    private var lastCapturedHash: String? = null

    private val clipListener = ClipboardManager.OnPrimaryClipChangedListener {
        captureCurrentClipboard(sourcePackage = null)
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        clipboardManager = getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        clipboardManager?.addPrimaryClipChangedListener(clipListener)

        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_VIEW_CLICKED or
                    AccessibilityEvent.TYPE_VIEW_TEXT_SELECTION_CHANGED or
                    AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                    AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS or
                    AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            notificationTimeout = 150
        }
        Log.i("CliplockerA11y", "ClipboardAccessibilityService connected and listener attached.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val eventType = event?.eventType ?: return
        when (eventType) {
            AccessibilityEvent.TYPE_VIEW_CLICKED,
            AccessibilityEvent.TYPE_VIEW_TEXT_SELECTION_CHANGED,
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                val pkg = event.packageName?.toString()
                if (pkg != packageName) {
                    captureCurrentClipboard(sourcePackage = pkg)
                }
            }
        }
    }

    private fun captureCurrentClipboard(sourcePackage: String?) {
        if (sourcePackage == packageName) return

        val clipboard = clipboardManager ?: return
        if (!clipboard.hasPrimaryClip()) return

        val clip = try {
            clipboard.primaryClip
        } catch (e: Exception) {
            Log.w("CliplockerA11y", "Could not read primary clip: ${e.message}")
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

        val hash = SensitiveContentDetector.computeSha256(content)
        if (hash == lastCapturedHash) return
        lastCapturedHash = hash

        Log.i("CliplockerA11y", "Capturing clip from $sourcePackage (hasImage=$hasImage)")

        serviceScope.launch {
            try {
                val insertedId = clipRepository.saveNewClipFromCapture(
                    content = content,
                    sourceAppPackage = sourcePackage,
                    imageUri = imageUri
                )
                if (insertedId != null) {
                    Log.i("CliplockerA11y", "Clip successfully persisted with ID: $insertedId")
                    CliplockerWidgetProvider.updateAllWidgets(this@ClipboardAccessibilityService)
                }
            } catch (e: Exception) {
                Log.e("CliplockerA11y", "Failed to save clip from capture", e)
            }
        }
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        clipboardManager?.removePrimaryClipChangedListener(clipListener)
        serviceScope.cancel()
        super.onDestroy()
    }
}
