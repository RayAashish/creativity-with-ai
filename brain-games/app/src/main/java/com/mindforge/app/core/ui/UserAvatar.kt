package com.mindforge.app.core.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.mindforge.app.R
import com.mindforge.app.core.theme.ForgeAmberPrimary
import com.mindforge.app.core.theme.CyanPulseSecondary

data class BuiltInAvatar(
    val id: Int,
    val name: String,
    val drawableRes: Int
)

val BuiltInAvatars = listOf(
    BuiltInAvatar(0, "The Architect", R.drawable.avatar_architect),
    BuiltInAvatar(1, "The Chrono", R.drawable.avatar_chrono),
    BuiltInAvatar(2, "The Synapse", R.drawable.avatar_synapse),
    BuiltInAvatar(3, "The Alchemist", R.drawable.avatar_alchemist),
    BuiltInAvatar(4, "The Vanguard", R.drawable.avatar_vanguard),
    BuiltInAvatar(5, "The Matrix", R.drawable.avatar_matrix)
)

@Composable
fun UserAvatar(
    avatarUri: String?,
    builtInIndex: Int,
    displayName: String,
    modifier: Modifier = Modifier,
    size: Dp = 48.dp,
    showBorder: Boolean = true
) {
    val borderModifier = if (showBorder) {
        Modifier.border(
            width = 2.dp,
            brush = Brush.linearGradient(
                listOf(ForgeAmberPrimary, CyanPulseSecondary)
            ),
            shape = CircleShape
        )
    } else Modifier

    Box(
        modifier = modifier
            .size(size)
            .then(borderModifier)
            .clip(CircleShape),
        contentAlignment = Alignment.Center
    ) {
        when {
            !avatarUri.isNullOrEmpty() -> {
                AsyncImage(
                    model = avatarUri,
                    contentDescription = displayName,
                    modifier = Modifier
                        .size(size)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }
            builtInIndex in BuiltInAvatars.indices -> {
                Image(
                    painter = painterResource(id = BuiltInAvatars[builtInIndex].drawableRes),
                    contentDescription = BuiltInAvatars[builtInIndex].name,
                    modifier = Modifier
                        .size(size)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }
            else -> {
                // Fallback to stylized initials
                val initials = displayName.trim().split(" ")
                    .filter { it.isNotEmpty() }
                    .take(2)
                    .map { it.first().uppercaseChar() }
                    .joinToString("")
                    .ifEmpty { "M" }

                Box(
                    modifier = Modifier
                        .size(size)
                        .background(
                            Brush.linearGradient(
                                listOf(
                                    MaterialTheme.colorScheme.primaryContainer,
                                    MaterialTheme.colorScheme.secondaryContainer
                                )
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = initials,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        fontSize = (size.value * 0.4f).sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
