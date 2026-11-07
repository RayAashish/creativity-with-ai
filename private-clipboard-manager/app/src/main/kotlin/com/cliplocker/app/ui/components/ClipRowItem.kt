package com.cliplocker.app.ui.components

import android.graphics.BitmapFactory
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInHorizontally
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
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
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliplocker.app.core.model.ClipItem
import com.cliplocker.app.core.model.ClipType
import com.cliplocker.app.ui.theme.CliplockerTheme
import java.io.File

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ClipRowItem(
    clip: ClipItem,
    isSelected: Boolean,
    isSelectionMode: Boolean,
    isUnmasked: Boolean,
    searchHighlight: String,
    onClick: () -> Unit,
    onLongClick: () -> Unit,
    onSecretClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val cardShape = RoundedCornerShape(16.dp)

    val contentDisplay = when {
        clip.isSecret && !isUnmasked -> "••••••••••••••••"
        else -> clip.content.trim()
    }

    // Highlight search match in preview with glowing liquid style
    val annotatedContent = buildAnnotatedString {
        if (searchHighlight.isNotBlank() && (!clip.isSecret || isUnmasked)) {
            val lowerContent = contentDisplay.lowercase()
            val lowerQuery = searchHighlight.lowercase()
            var startIndex = 0

            while (startIndex < contentDisplay.length) {
                val matchIndex = lowerContent.indexOf(lowerQuery, startIndex)
                if (matchIndex == -1) {
                    append(contentDisplay.substring(startIndex))
                    break
                }
                append(contentDisplay.substring(startIndex, matchIndex))
                val endMatch = matchIndex + lowerQuery.length
                pushStyle(
                    SpanStyle(
                        background = colors.accent.copy(alpha = 0.25f),
                        color = colors.accent,
                        fontWeight = FontWeight.Bold
                    )
                )
                append(contentDisplay.substring(matchIndex, endMatch))
                pop()
                startIndex = endMatch
            }
        } else {
            append(contentDisplay)
        }
    }

    val relativeTime = formatRelativeTime(clip.timestamp)
    val metadataText = buildString {
        clip.sourceAppLabel?.let { append(it).append(" · ") }
        append(relativeTime)
    }

    AnimatedVisibility(
        visible = true,
        enter = fadeIn(animationSpec = tween(120)) + slideInHorizontally(
            initialOffsetX = { -16 },
            animationSpec = tween(120)
        )
    ) {
        Row(
            modifier = modifier
                .fillMaxWidth()
                .heightIn(min = 60.dp, max = 68.dp)
                .liquidGlass(
                    colors = colors,
                    shape = cardShape,
                    isSelected = isSelected,
                    elevation = if (isSelected) 4.dp else 1.dp
                )
                .combinedClickable(
                    onClick = {
                        if (clip.isSecret && !isUnmasked) {
                            onSecretClick()
                        } else {
                            onClick()
                        }
                    },
                    onLongClick = onLongClick
                )
                .padding(horizontal = 12.dp, vertical = 9.dp)
                .semantics {
                    contentDescription = if (clip.isSecret && !isUnmasked) {
                        "Secret clip. Tap to authenticate and reveal."
                    } else {
                        "Clip: $contentDisplay. Tap to copy."
                    }
                },
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Liquid Glass Type Glyph Badge
            LiquidTypeGlyphBadge(
                type = clip.type,
                isPinned = clip.isPinned,
                isSecret = clip.isSecret
            )

            Spacer(modifier = Modifier.width(10.dp))

            // Center Content Preview (with rounded glass thumbnail if image)
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (clip.type == ClipType.IMAGE) {
                    val thumbBitmap = remember(clip.thumbnailUri, clip.imageUri) {
                        val path = clip.thumbnailUri ?: clip.imageUri
                        if (path != null && File(path).exists()) {
                            BitmapFactory.decodeFile(path)
                        } else null
                    }
                    if (thumbBitmap != null) {
                        Image(
                            bitmap = thumbBitmap.asImageBitmap(),
                            contentDescription = "Image preview",
                            modifier = Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .border(
                                    1.dp,
                                    Brush.verticalGradient(
                                        listOf(colors.glassHighlight, colors.border.copy(alpha = 0.3f))
                                    ),
                                    RoundedCornerShape(10.dp)
                                ),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                    }
                }

                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = if (clip.type == ClipType.IMAGE && annotatedContent.text.isBlank()) {
                            androidx.compose.ui.text.AnnotatedString("Image Clip")
                        } else {
                            annotatedContent
                        },
                        style = typography.codePreview.copy(
                            fontSize = 13.sp,
                            fontWeight = if (clip.isSecret && !isUnmasked) FontWeight.Bold else FontWeight.Normal
                        ),
                        color = if (clip.isSecret && !isUnmasked) colors.typeSecret else colors.inkPrimary,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Right Metadata: Source App + Timestamp + Indicator
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (clip.isPinned) {
                        Text(
                            text = "📌",
                            style = typography.badge,
                            modifier = Modifier.padding(end = 4.dp)
                        )
                    }
                    if (clip.isSecret) {
                        Text(
                            text = if (isUnmasked) "🔓" else "🔒",
                            style = typography.badge,
                            modifier = Modifier.padding(end = 4.dp)
                        )
                    }
                    Text(
                        text = metadataText,
                        style = typography.timestamp.copy(fontSize = 10.sp),
                        color = colors.inkSecondary,
                        maxLines = 1
                    )
                }

                if (clip.isSecret && clip.remainingTtlMillis != null) {
                    val ttlMinutes = ((clip.remainingTtlMillis ?: 0L) / 60_000L).coerceAtLeast(1)
                    Text(
                        text = "exp in ${ttlMinutes}m",
                        style = typography.badge.copy(fontSize = 9.sp, fontWeight = FontWeight.Bold),
                        color = colors.typeSecret
                    )
                }
            }
        }
    }
}

@Composable
private fun LiquidTypeGlyphBadge(
    type: ClipType,
    isPinned: Boolean,
    isSecret: Boolean
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val badgeShape = RoundedCornerShape(8.dp)

    val (accentColor, label) = when {
        isSecret -> colors.typeSecret to "SEC"
        type == ClipType.LINK -> colors.typeUrl to "URL"
        type == ClipType.IMAGE -> colors.typeImage to "IMG"
        else -> colors.typeText to "TXT"
    }

    Box(
        modifier = Modifier
            .size(width = 36.dp, height = 24.dp)
            .clip(badgeShape)
            .background(accentColor.copy(alpha = 0.14f))
            .border(
                1.dp,
                Brush.verticalGradient(
                    listOf(accentColor.copy(alpha = 0.6f), accentColor.copy(alpha = 0.2f))
                ),
                badgeShape
            ),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            style = typography.badge.copy(
                fontSize = 9.5.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 0.6.sp
            ),
            color = accentColor
        )
    }
}

private fun formatRelativeTime(timestamp: Long): String {
    val diff = (System.currentTimeMillis() - timestamp).coerceAtLeast(0L)
    val seconds = diff / 1000
    val minutes = seconds / 60
    val hours = minutes / 60
    val days = hours / 24

    return when {
        seconds < 45 -> "just now"
        minutes < 60 -> "${minutes}m ago"
        hours < 24 -> "${hours}h ago"
        days < 7 -> "${days}d ago"
        else -> "${days / 7}w ago"
    }
}
