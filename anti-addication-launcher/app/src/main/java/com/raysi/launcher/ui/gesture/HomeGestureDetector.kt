// app/src/main/java/com/raysi/launcher/ui/gesture/HomeGestureDetector.kt
package com.raysi.launcher.ui.gesture

import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import kotlin.math.abs

/**
 * Custom Compose Modifier handling full-screen gestures for FocusLauncher:
 * - Swipe Up: Open Keyboard-First App Drawer
 * - Swipe Down: Open Quick-Capture Scratchpad
 * - Swipe Left: Open Launcher Settings
 * - Double Tap: Lock Display (GLOBAL_ACTION_LOCK_SCREEN)
 * - Long Press: Open Quick-Pin Management Modal
 */
fun Modifier.homeGestureDetector(
    onSwipeUp: () -> Unit = {},
    onSwipeDown: () -> Unit = {},
    onSwipeLeft: () -> Unit = {},
    onDoubleTap: () -> Unit = {},
    onLongPress: () -> Unit = {}
): Modifier {
    return this
        .pointerInput(Unit) {
            detectTapGestures(
                onDoubleTap = { onDoubleTap() },
                onLongPress = { onLongPress() }
            )
        }
        .pointerInput(Unit) {
            val minThresholdPx = with(this) { 80.dp.toPx() }
            var cumulativeDragX = 0f
            var cumulativeDragY = 0f

            detectDragGestures(
                onDragStart = {
                    cumulativeDragX = 0f
                    cumulativeDragY = 0f
                },
                onDrag = { change, dragAmount ->
                    cumulativeDragX += dragAmount.x
                    cumulativeDragY += dragAmount.y
                    // Consume if significant drag underway to avoid parent scrolling conflicts
                    if (abs(cumulativeDragX) > 20f || abs(cumulativeDragY) > 20f) {
                        change.consume()
                    }
                },
                onDragEnd = {
                    val absX = abs(cumulativeDragX)
                    val absY = abs(cumulativeDragY)

                    if (absY > absX && absY >= minThresholdPx) {
                        if (cumulativeDragY < 0f) {
                            onSwipeUp()
                        } else {
                            onSwipeDown()
                        }
                    } else if (absX > absY && absX >= minThresholdPx) {
                        if (cumulativeDragX < 0f) {
                            onSwipeLeft()
                        }
                    }
                    cumulativeDragX = 0f
                    cumulativeDragY = 0f
                },
                onDragCancel = {
                    cumulativeDragX = 0f
                    cumulativeDragY = 0f
                }
            )
        }
}
