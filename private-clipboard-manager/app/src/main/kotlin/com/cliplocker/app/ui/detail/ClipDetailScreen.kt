package com.cliplocker.app.ui.detail

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import com.cliplocker.app.core.model.ClipType
import java.io.File
import androidx.compose.foundation.layout.heightIn

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.fragment.app.FragmentActivity
import com.cliplocker.app.core.model.SecretTtl
import com.cliplocker.app.ui.components.BiometricPromptHelper
import com.cliplocker.app.ui.components.CopiedBadge
import com.cliplocker.app.ui.theme.CliplockerTheme
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

import com.cliplocker.app.ui.components.liquidGlass
import com.cliplocker.app.ui.components.spatialBackgroundBrush

@Composable
fun ClipDetailScreen(
    viewModel: ClipDetailViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val clip by viewModel.clip.collectAsState()
    val isUnmasked by viewModel.isUnmasked.collectAsState()
    val isDeleted by viewModel.isDeleted.collectAsState()

    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val shapes = CliplockerTheme.shapes
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current

    var showCopiedBadge by remember { mutableStateOf(false) }

    LaunchedEffect(isDeleted) {
        if (isDeleted) {
            onNavigateBack()
        }
    }

    if (clip == null) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(spatialBackgroundBrush(colors)),
            contentAlignment = Alignment.Center
        ) {
            Text(text = "Clip not found", style = typography.title, color = colors.inkMuted)
        }
        return
    }

    val item = clip!!

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(spatialBackgroundBrush(colors))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Spatial Liquid Glass Header Bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 14.dp, vertical = 6.dp)
                    .liquidGlass(colors = colors, shape = shapes.card, elevation = 2.dp)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = colors.inkPrimary
                        )
                    }

                    Text(
                        text = "CLIP DETAILS",
                        style = typography.title,
                        color = colors.inkPrimary,
                        modifier = Modifier.padding(start = 4.dp)
                    )

                    Spacer(modifier = Modifier.weight(1f))

                    IconButton(
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                            viewModel.copyToClipboard(context)
                            showCopiedBadge = true
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = "Copy to clipboard",
                            tint = colors.accent
                        )
                    }

                    IconButton(
                        onClick = { viewModel.shareClip(context) }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share",
                            tint = colors.inkSecondary
                        )
                    }

                    IconButton(
                        onClick = { viewModel.deleteClip() }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = colors.inkSecondary
                        )
                    }
                }
            }

            // Metadata Block (Spatial Glass)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 6.dp)
                    .liquidGlass(colors = colors, shape = shapes.card)
                    .padding(14.dp)
            ) {
                val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                val formattedDate = dateFormat.format(Date(item.timestamp))

                MetadataRow(label = "TYPE", value = "${item.type.name} (${item.type.glyph})")
                MetadataRow(label = "CAPTURED", value = formattedDate)
                item.sourceAppLabel?.let {
                    MetadataRow(label = "SOURCE APP", value = "$it (${item.sourceAppPackage ?: ""})")
                }
                MetadataRow(label = "LENGTH", value = "${item.charCount} chars · ${item.wordCount} words")
                if (item.sensitiveType.badge.isNotBlank()) {
                    MetadataRow(label = "SENSITIVE", value = "${item.sensitiveType.label} [${item.sensitiveType.badge}]")
                }
                if (item.isSecret && item.secretExpiresAt != null) {
                    val expiresDate = dateFormat.format(Date(item.secretExpiresAt))
                    MetadataRow(label = "EXPIRY", value = expiresDate)
                }
            }

            // Main Content Box (Spatial Glass)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 6.dp)
                    .liquidGlass(colors = colors, shape = shapes.card)
                    .padding(14.dp)
            ) {
                Text(
                    text = "CONTENT",
                    style = typography.sectionHeader,
                    color = colors.inkSecondary,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                if (item.isSecret && !isUnmasked) {
                    // Secret Masked View
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = "Secret content locked",
                            tint = colors.accent,
                            modifier = Modifier.size(36.dp)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "This clip is encrypted & masked.",
                            style = typography.label,
                            color = colors.inkSecondary
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                val activity = context as? FragmentActivity ?: return@Button
                                BiometricPromptHelper.authenticate(
                                    activity = activity,
                                    title = "Unlock Secret",
                                    subtitle = "Confirm identity to view content",
                                    onSuccess = { viewModel.unmask() },
                                    onError = {}
                                )
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = colors.accent,
                                contentColor = colors.onAccent
                            ),
                            shape = shapes.chip
                        ) {
                            Icon(
                                imageVector = Icons.Default.LockOpen,
                                contentDescription = null,
                                tint = colors.onAccent,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Reveal Content",
                                style = typography.badge.copy(fontWeight = FontWeight.Bold),
                                color = colors.onAccent
                            )
                        }
                    }
                } else {
                    if (item.type == ClipType.IMAGE) {
                        val fullBitmap = remember(item.imageUri, item.thumbnailUri) {
                            val path = item.imageUri ?: item.thumbnailUri
                            if (path != null && File(path).exists()) {
                                BitmapFactory.decodeFile(path)
                            } else null
                        }

                        if (fullBitmap != null) {
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Image(
                                    bitmap = fullBitmap.asImageBitmap(),
                                    contentDescription = "Full image preview",
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .heightIn(max = 320.dp)
                                        .clip(shapes.card)
                                        .border(1.dp, colors.border, shapes.card),
                                    contentScale = ContentScale.Fit
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Stored securely in private storage",
                                    style = typography.timestamp,
                                    color = colors.inkSecondary
                                )
                            }
                        } else {
                            Text(
                                text = "Image file not available on device",
                                style = typography.codeDetail,
                                color = colors.inkSecondary
                            )
                        }
                    } else {
                        // Unmasked Monospace Text Viewer
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(shapes.card)
                                .background(colors.background)
                                .border(1.dp, colors.border, shapes.card)
                                .padding(12.dp)
                        ) {
                            Text(
                                text = item.content,
                                style = typography.codeDetail,
                                color = colors.inkPrimary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Pin & Secret Settings Card (Spatial Glass)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 6.dp)
                    .liquidGlass(colors = colors, shape = shapes.card)
                    .padding(14.dp)
            ) {
                Text(
                    text = "ACTIONS & POLICIES",
                    style = typography.sectionHeader,
                    color = colors.inkSecondary,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                // Pin Action
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(shapes.chip)
                        .clickable { viewModel.togglePin() }
                        .padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.PushPin,
                        contentDescription = null,
                        tint = if (item.isPinned) colors.accent else colors.inkMuted,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = if (item.isPinned) "Pinned (Immune to pruning)" else "Not Pinned",
                            style = typography.label,
                            color = colors.inkPrimary
                        )
                        Text(
                            text = "Pinned clips are kept forever in the pinned shelf.",
                            style = typography.timestamp,
                            color = colors.inkSecondary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Secret Toggle & TTL Picker
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = null,
                            tint = if (item.isSecret) colors.accent else colors.inkMuted,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Mark as Secret",
                            style = typography.label,
                            color = colors.inkPrimary
                        )
                    }

                    Button(
                        onClick = {
                            viewModel.updateSecret(
                                isSecret = !item.isSecret,
                                ttl = SecretTtl.FIVE_MINUTES
                            )
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (item.isSecret) colors.accent else colors.surfaceVariant,
                            contentColor = if (item.isSecret) colors.onAccent else colors.inkPrimary
                        ),
                        shape = shapes.chip,
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text(
                            text = if (item.isSecret) "SECRET ACTIVE" else "SET SECRET",
                            style = typography.badge.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (item.isSecret) colors.onAccent else colors.inkPrimary
                            )
                        )
                    }
                }

                if (item.isSecret) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "Auto-expiry TTL:",
                        style = typography.timestamp,
                        color = colors.inkSecondary
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf(
                            SecretTtl.ONE_MINUTE,
                            SecretTtl.FIVE_MINUTES,
                            SecretTtl.ONE_HOUR,
                            SecretTtl.TWENTY_FOUR_HOURS
                        ).forEach { ttl ->
                            val isSelected = item.remainingTtlMillis != null &&
                                    Math.abs((item.remainingTtlMillis ?: 0L) - ttl.durationMillis) < 30_000L

                            Box(
                                modifier = Modifier
                                    .clip(shapes.chip)
                                    .background(if (isSelected) colors.accent else colors.surfaceVariant)
                                    .border(
                                        1.dp,
                                        if (isSelected) Color(0x66FFFFFF) else colors.border,
                                        shapes.chip
                                    )
                                    .clickable {
                                        viewModel.updateSecret(isSecret = true, ttl = ttl)
                                    }
                                    .padding(horizontal = 12.dp, vertical = 7.dp)
                            ) {
                                Text(
                                    text = ttl.displayName,
                                    style = typography.badge.copy(
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                    ),
                                    color = if (isSelected) colors.onAccent else colors.inkPrimary
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }

        // Copied ink stamp badge
        CopiedBadge(
            visible = showCopiedBadge,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 70.dp)
        )
    }
}

@Composable
private fun MetadataRow(label: String, value: String) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = typography.badge, color = colors.inkMuted)
        Text(text = value, style = typography.timestamp, color = colors.inkPrimary)
    }
}
