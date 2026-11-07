// app/src/main/java/com/raysi/launcher/ui/gate/GateScreen.kt
package com.raysi.launcher.ui.gate

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.raysi.launcher.R
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.FocusTypography
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite

/**
 * Minimalist OLED launch delay gate screen.
 * Presents a breathing circular countdown followed by intentional duration selection.
 */
@Composable
fun GateScreen(
    viewModel: GateViewModel,
    modifier: Modifier = Modifier,
    onCancel: () -> Unit = {}
) {
    val state by viewModel.gateState.collectAsState()

    // System Back acts as Cancel
    BackHandler {
        viewModel.cancelGate()
        onCancel()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(OledBlack)
            .systemBarsPadding()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        when (val gateState = state) {
            is GateState.Countdown -> {
                BreathingCountdownView(
                    appLabel = gateState.app.label,
                    totalSeconds = gateState.totalSeconds,
                    remainingSeconds = gateState.remainingSeconds,
                    onCancel = {
                        viewModel.cancelGate()
                        onCancel()
                    }
                )
            }
            is GateState.DurationSelection -> {
                DurationSelectionView(
                    appLabel = gateState.app.label,
                    onSelectDuration = { minutes ->
                        viewModel.approveSession(minutes)
                    },
                    onCancel = {
                        viewModel.cancelGate()
                        onCancel()
                    }
                )
            }
            GateState.Idle -> Unit
        }
    }
}

@Composable
private fun BreathingCountdownView(
    appLabel: String,
    totalSeconds: Int,
    remainingSeconds: Int,
    onCancel: () -> Unit
) {
    val progress = if (totalSeconds > 0) {
        remainingSeconds.toFloat() / totalSeconds.toFloat()
    } else 0f

    val animatedSweep by animateFloatAsState(
        targetValue = progress * 360f,
        label = "gate_countdown_sweep"
    )

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = stringResource(R.string.gate_breathing_title),
            style = FocusTypography.bodyLarge,
            color = PureWhite,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = appLabel,
            style = FocusTypography.bodyMedium,
            color = DimGray,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(48.dp))

        // Circular Countdown Canvas
        Box(
            modifier = Modifier.size(160.dp),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val strokeWidth = 3.dp.toPx()
                // Track circle (dim)
                drawCircle(
                    color = Color(0xFF222222),
                    style = Stroke(width = strokeWidth)
                )
                // Active countdown arc
                drawArc(
                    color = PureWhite,
                    startAngle = -90f,
                    sweepAngle = animatedSweep,
                    useCenter = false,
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
            }

            Text(
                text = "${remainingSeconds}s",
                style = FocusTypography.titleLarge,
                color = PureWhite
            )
        }

        Spacer(modifier = Modifier.height(56.dp))

        TextButton(
            onClick = onCancel,
            modifier = Modifier.height(48.dp)
        ) {
            Text(
                text = stringResource(R.string.gate_cancel),
                style = FocusTypography.bodyMedium,
                color = DimGray
            )
        }
    }
}

@Composable
private fun DurationSelectionView(
    appLabel: String,
    onSelectDuration: (Int) -> Unit,
    onCancel: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = stringResource(R.string.gate_duration_title),
            style = FocusTypography.bodyLarge,
            color = PureWhite,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = appLabel,
            style = FocusTypography.bodyMedium,
            color = DimGray,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(40.dp))

        // Duration option buttons [5m] [10m] [15m]
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center
        ) {
            DurationPill(label = stringResource(R.string.gate_duration_5m), onClick = { onSelectDuration(5) })
            Spacer(modifier = Modifier.width(16.dp))
            DurationPill(label = stringResource(R.string.gate_duration_10m), onClick = { onSelectDuration(10) })
            Spacer(modifier = Modifier.width(16.dp))
            DurationPill(label = stringResource(R.string.gate_duration_15m), onClick = { onSelectDuration(15) })
        }

        Spacer(modifier = Modifier.height(48.dp))

        TextButton(
            onClick = onCancel,
            modifier = Modifier.height(48.dp)
        ) {
            Text(
                text = stringResource(R.string.gate_cancel),
                style = FocusTypography.bodyMedium,
                color = DimGray
            )
        }
    }
}

@Composable
private fun DurationPill(
    label: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .border(1.dp, DimGray)
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            style = FocusTypography.bodyLarge,
            color = PureWhite
        )
    }
}
