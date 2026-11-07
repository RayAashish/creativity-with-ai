// app/src/main/java/com/raysi/launcher/ui/quarantine/QuarantineScreen.kt
package com.raysi.launcher.ui.quarantine

import android.content.Context
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.R
import com.raysi.launcher.service.notification.NotificationUtils
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.FocusTypography
import com.raysi.launcher.ui.theme.HudAmber
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite

@Composable
fun QuarantineScreen(
    viewModel: QuarantineViewModel,
    onLaunchPackage: (String) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.checkListenerPermission(context)
    }

    BackHandler {
        onDismiss()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(OledBlack)
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(horizontal = 24.dp, vertical = 16.dp)
    ) {
        // Top navigation bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "← back",
                style = FocusTypography.bodyMedium,
                color = DimGray,
                modifier = Modifier
                    .clickable { onDismiss() }
                    .padding(vertical = 8.dp)
            )

            if (uiState.items.isNotEmpty()) {
                Text(
                    text = stringResource(R.string.quarantine_clear_all),
                    style = FocusTypography.bodyMedium,
                    color = DimGray,
                    modifier = Modifier
                        .clickable { viewModel.clearAll() }
                        .padding(vertical = 8.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Title
        Text(
            text = stringResource(R.string.quarantine_title),
            style = FocusTypography.headlineMedium,
            color = PureWhite
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Warning banner regarding lost interactive actions and inline replies
        Text(
            text = stringResource(R.string.quarantine_inline_reply_warning),
            style = FocusTypography.bodySmall,
            color = DimGray,
            lineHeight = 16.sp
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = stringResource(R.string.quarantine_retention_info),
            style = FocusTypography.bodySmall,
            color = DimGray.copy(alpha = 0.6f)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Degraded mode alert if notification listener service is disabled
        if (!uiState.isListenerEnabled) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        try {
                            context.startActivity(NotificationUtils.getNotificationListenerSettingsIntent())
                        } catch (ignored: Exception) {
                        }
                    }
                    .padding(vertical = 8.dp)
            ) {
                Text(
                    text = stringResource(R.string.notification_access_off),
                    style = FocusTypography.bodyMedium,
                    color = HudAmber
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Notification List
        if (uiState.items.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = stringResource(R.string.quarantine_empty),
                    style = FocusTypography.bodyMedium,
                    color = DimGray
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(
                    items = uiState.items,
                    key = { it.id }
                ) { item ->
                    QuarantineItemRow(
                        item = item,
                        onClick = { onLaunchPackage(item.packageName) }
                    )
                }
            }
        }
    }
}

@Composable
private fun QuarantineItemRow(
    item: QuarantineItemUi,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = item.appLabel,
                style = FocusTypography.bodyMedium,
                color = PureWhite
            )
            Text(
                text = item.timeLabel,
                style = FocusTypography.bodySmall,
                color = DimGray
            )
        }

        if (item.title.isNotBlank()) {
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = item.title,
                style = FocusTypography.bodySmall,
                color = PureWhite.copy(alpha = 0.9f)
            )
        }

        if (item.text.isNotBlank()) {
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = item.text,
                style = FocusTypography.bodySmall,
                color = DimGray
            )
        }
    }
}
