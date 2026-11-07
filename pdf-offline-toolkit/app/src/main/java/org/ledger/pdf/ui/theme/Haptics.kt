package org.ledger.pdf.ui.theme

import android.view.HapticFeedbackConstants
import android.view.View
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalView

interface LedgerHaptics {
    fun tick()
    fun selection()
    fun confirm()
    fun warning()
}

class AndroidLedgerHaptics(private val view: View) : LedgerHaptics {
    override fun tick() {
        view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK)
    }

    override fun selection() {
        view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
    }

    override fun confirm() {
        view.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
    }

    override fun warning() {
        view.performHapticFeedback(HapticFeedbackConstants.REJECT)
    }
}

@Composable
fun rememberLedgerHaptics(): LedgerHaptics {
    val view = LocalView.current
    return remember(view) { AndroidLedgerHaptics(view) }
}
