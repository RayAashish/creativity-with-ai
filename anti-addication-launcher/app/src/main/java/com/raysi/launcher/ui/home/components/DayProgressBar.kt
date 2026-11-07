// app/src/main/java/com/raysi/launcher/ui/home/components/DayProgressBar.kt
package com.raysi.launcher.ui.home.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.domain.model.DailyProgress
import com.raysi.launcher.ui.theme.DimGray

@Composable
fun DayProgressBar(
    progress: DailyProgress,
    modifier: Modifier = Modifier
) {
    Text(
        text = progress.formattedBar,
        fontFamily = FontFamily.Monospace,
        fontSize = 13.sp,
        color = DimGray,
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    )
}
