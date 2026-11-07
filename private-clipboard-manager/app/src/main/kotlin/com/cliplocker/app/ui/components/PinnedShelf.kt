package com.cliplocker.app.ui.components

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.ui.theme.CliplockerTheme
import java.io.File

@Composable
fun PinnedShelf(
    pinnedClips: List<ClipItem>,
    onClipClick: (ClipItem) -> Unit,
    modifier: Modifier = Modifier
) {
    if (pinnedClips.isEmpty()) return

    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 6.dp)
            .liquidGlass(
                colors = colors,
                shape = RoundedCornerShape(20.dp),
                elevation = 2.dp
            )
            .padding(vertical = 10.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "📌 PINNED SHELF (${pinnedClips.size})",
                style = typography.sectionHeader.copy(
                    letterSpacing = 1.4.sp,
                    fontWeight = FontWeight.ExtraBold
                ),
                color = colors.accent
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(scrollState)
                .padding(horizontal = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            pinnedClips.forEach { item ->
                PinnedCard(
                    clip = item,
                    onClick = { onClipClick(item) }
                )
            }
        }
    }
}

@Composable
private fun PinnedCard(
    clip: ClipItem,
    onClick: () -> Unit
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val cardShape = RoundedCornerShape(14.dp)

    val previewText = if (clip.isSecret) "••••••••••••••••" else clip.content.trim()

    val thumbBitmap = remember(clip.thumbnailUri, clip.imageUri) {
        if (clip.type == ClipType.IMAGE) {
            val path = clip.thumbnailUri ?: clip.imageUri
            if (path != null && File(path).exists()) {
                BitmapFactory.decodeFile(path)
            } else null
        } else null
    }

    Row(
        modifier = Modifier
            .widthIn(min = 140.dp, max = 220.dp)
            .height(64.dp)
            .clip(cardShape)
            .background(colors.surfaceVariant.copy(alpha = 0.5f))
            .border(
                1.dp,
                Brush.verticalGradient(
                    listOf(colors.accent.copy(alpha = 0.6f), colors.accent.copy(alpha = 0.15f))
                ),
                cardShape
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (thumbBitmap != null) {
            Image(
                bitmap = thumbBitmap.asImageBitmap(),
                contentDescription = "Pinned image",
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, colors.border.copy(alpha = 0.3f), RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(8.dp))
        }

        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = if (clip.type == ClipType.IMAGE && previewText.isBlank()) "Image" else previewText,
                style = typography.codePreview.copy(fontSize = 12.sp),
                color = colors.inkPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = clip.type.glyph,
                    style = typography.badge.copy(fontWeight = FontWeight.Bold),
                    color = colors.accent
                )
                clip.sourceAppLabel?.let {
                    Text(
                        text = it,
                        style = typography.timestamp.copy(fontSize = 9.5.sp),
                        color = colors.inkMuted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}
