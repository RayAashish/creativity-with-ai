package com.cliplocker.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cliplocker.app.ui.theme.CliplockerTheme

@Composable
fun AccessibilityBanner(
    onEnableClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = CliplockerTheme.colors
    val typography = CliplockerTheme.typography
    val bannerShape = RoundedCornerShape(18.dp)

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 6.dp)
            .clip(bannerShape)
            .background(colors.accentSubtle)
            .border(
                1.dp,
                Brush.verticalGradient(
                    listOf(colors.accent, colors.accent.copy(alpha = 0.3f))
                ),
                bannerShape
            )
            .padding(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = null,
                tint = colors.accent,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "PASSIVE BACKGROUND CAPTURE",
                style = typography.sectionHeader.copy(letterSpacing = 1.2.sp, fontWeight = FontWeight.Bold),
                color = colors.accent
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Android 10+ restricts background clipboard access. Enable Cliplocker in Accessibility Settings for 100% passive capture, or tap 'Capture Now' from the notification shade.",
            style = typography.codePreview.copy(fontSize = 11.5.sp, lineHeight = 16.sp),
            color = colors.inkPrimary
        )

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = onEnableClick,
            colors = ButtonDefaults.buttonColors(
                containerColor = colors.accent,
                contentColor = Color.White
            ),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.height(34.dp)
        ) {
            Text(
                text = "ENABLE IN ACCESSIBILITY SETTINGS →",
                style = typography.badge.copy(fontWeight = FontWeight.ExtraBold)
            )
        }
    }
}
