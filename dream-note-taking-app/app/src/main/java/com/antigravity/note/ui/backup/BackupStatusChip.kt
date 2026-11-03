package com.antigravity.note.ui.backup

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.CloudQueue
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class BackupSyncStatus {
    SYNCED,
    BACKING_UP,
    NEEDS_ATTENTION,
    OFFLINE
}

@Composable
fun BackupStatusChip(
    status: BackupSyncStatus,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val (dotColor, label, icon) = when (status) {
        BackupSyncStatus.SYNCED -> Triple(
            Color(0xFF2E7D32),
            "Synced",
            Icons.Default.CloudDone
        )
        BackupSyncStatus.BACKING_UP -> Triple(
            Color(0xFF1976D2),
            "Backing up...",
            Icons.Default.CloudSync
        )
        BackupSyncStatus.NEEDS_ATTENTION -> Triple(
            Color(0xFFF57C00),
            "Attention",
            Icons.Default.CloudQueue
        )
        BackupSyncStatus.OFFLINE -> Triple(
            Color(0xFF757575),
            "Offline",
            Icons.Default.CloudOff
        )
    }

    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceContainerHigh,
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            if (status == BackupSyncStatus.BACKING_UP) {
                CircularProgressIndicator(
                    modifier = Modifier.size(12.dp),
                    strokeWidth = 2.dp,
                    color = dotColor
                )
            } else {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(dotColor)
                )
            }

            Text(
                text = label,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
