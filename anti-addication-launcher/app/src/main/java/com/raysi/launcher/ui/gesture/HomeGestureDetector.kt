// app/src/main/java/com/raysi/launcher/ui/gesture/HomeGestureDetector.kt
package com.raysi.launcher.ui.gesture

import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import kotlin.math.abs

/**
 * Custom Compose Modifier handling full-screen gestures for FocusLauncher:
 * - Swipe Up: Open App Drawer
 * - Swipe Down: Pull Notification Shade / Scratchpad (configurable)
 * - Swipe Left: Open Launcher Settings
 * - Swipe Right: Open Quick Scratchpad
 * - Double Tap: Lock Display (GLOBAL_ACTION_LOCK_SCREEN)
 * - Long Press: Open Launcher Home Menu (Customize, Pin Apps, Wallpapers, Settings)
 *
 * Uses rememberUpdatedState so pointerInput lambdas always execute the latest state/preferences
 * without recreating gesture detectors on recomposition.
 */
fun Modifier.homeGestureDetector(
    onSwipeUp: () -> Unit = {},
    onSwipeDown: () -> Unit = {},
    onSwipeLeft: () -> Unit = {},
    onSwipeRight: () -> Unit = {},
    onDoubleTap: () -> Unit = {},
    onLongPress: () -> Unit = {}
): Modifier = composed {
    val swipeUpState = rememberUpdatedState(onSwipeUp)
    val swipeDownState = rememberUpdatedState(onSwipeDown)
    val swipeLeftState = rememberUpdatedState(onSwipeLeft)
    val swipeRightState = rememberUpdatedState(onSwipeRight)
    val doubleTapState = rememberUpdatedState(onDoubleTap)
    val longPressState = rememberUpdatedState(onLongPress)

    this
        .pointerInput(Unit) {
            detectTapGestures(
                onDoubleTap = { doubleTapState.value() },
                onLongPress = { longPressState.value() }
            )
        }
        .pointerInput(Unit) {
            val minThresholdPx = with(this) { 72.dp.toPx() }
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
                    if (abs(cumulativeDragX) > 20f || abs(cumulativeDragY) > 20f) {
                        change.consume()
                    }
                },
                onDragEnd = {
                    val absX = abs(cumulativeDragX)
                    val absY = abs(cumulativeDragY)

                    if (absY > absX && absY >= minThresholdPx) {
                        if (cumulativeDragY < 0f) {
                            swipeUpState.value()
                        } else {
                            swipeDownState.value()
                        }
                    } else if (absX > absY && absX >= minThresholdPx) {
                        if (cumulativeDragX < 0f) {
                            swipeLeftState.value()
                        } else {
                            swipeRightState.value()
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
