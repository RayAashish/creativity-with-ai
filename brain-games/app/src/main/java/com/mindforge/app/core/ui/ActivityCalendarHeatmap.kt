package com.mindforge.app.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mindforge.app.core.theme.ForgeAmberPrimary
import com.mindforge.app.core.theme.Spacing
import com.mindforge.app.data.local.db.entity.DailyActivityEntity
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Composable
fun ActivityCalendarHeatmap(
    activities: List<DailyActivityEntity>,
    modifier: Modifier = Modifier,
    weeksCount: Int = 12
) {
    val activityMap = remember(activities) {
        activities.associateBy { it.dateString }
    }

    val today = remember { LocalDate.now() }
    val totalDays = weeksCount * 7
    val startDate = remember(today) {
        // Find Monday of the week (totalDays - 1) days ago
        val initial = today.minusDays(totalDays.toLong() - 1)
        val dayOfWeek = initial.dayOfWeek.value // 1 = Monday
        initial.minusDays((dayOfWeek - 1).toLong())
    }

    var selectedDateInfo by remember { mutableStateOf<String?>(null) }

    // Generate weeks matrix: List of weeks, each containing 7 LocalDates
    val weeks = remember(startDate, today) {
        val list = mutableListOf<List<LocalDate>>()
        var curr = startDate
        while (!curr.isAfter(today)) {
            val weekDays = mutableListOf<LocalDate>()
            repeat(7) {
                weekDays.add(curr)
                curr = curr.plusDays(1)
            }
            list.add(weekDays)
        }
        list
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
            .padding(Spacing.md)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Activity Heatmap",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            // Heatmap Legend
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text("Less", style = MaterialTheme.typography.labelSmall, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Box(modifier = Modifier.size(10.dp).clip(RoundedCornerShape(2.dp)).background(MaterialTheme.colorScheme.surfaceVariant))
                Box(modifier = Modifier.size(10.dp).clip(RoundedCornerShape(2.dp)).background(ForgeAmberPrimary.copy(alpha = 0.4f)))
                Box(modifier = Modifier.size(10.dp).clip(RoundedCornerShape(2.dp)).background(ForgeAmberPrimary.copy(alpha = 0.75f)))
                Box(modifier = Modifier.size(10.dp).clip(RoundedCornerShape(2.dp)).background(ForgeAmberPrimary))
                Text("More", style = MaterialTheme.typography.labelSmall, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Heatmap Grid (Columns: Weeks, Rows: Mon-Sun)
        Row(modifier = Modifier.fillMaxWidth()) {
            // Day Labels (M, W, F)
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.padding(end = 6.dp)
            ) {
                val labels = listOf("M", "", "W", "", "F", "", "")
                labels.forEach { l ->
                    Box(modifier = Modifier.size(16.dp), contentAlignment = Alignment.Center) {
                        Text(text = l, fontSize = 9.sp, color = MaterialTheme.colorScheme.outline)
                    }
                }
            }

            // Scrollable Weeks
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(weeks) { week ->
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        week.forEach { date ->
                            val dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
                            val act = activityMap[dateStr]
                            val sessionCount = act?.sessionsCount ?: 0
                            val isFuture = date.isAfter(today)

                            val cellColor = when {
                                isFuture -> Color.Transparent
                                sessionCount >= 3 -> ForgeAmberPrimary
                                sessionCount == 2 -> ForgeAmberPrimary.copy(alpha = 0.75f)
                                sessionCount == 1 -> ForgeAmberPrimary.copy(alpha = 0.4f)
                                else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.8f)
                            }

                            Box(
                                modifier = Modifier
                                    .size(16.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(cellColor)
                                    .border(
                                        width = if (date == today) 1.dp else 0.dp,
                                        color = if (date == today) ForgeAmberPrimary else Color.Transparent,
                                        shape = RoundedCornerShape(3.dp)
                                    )
                                    .clickable(enabled = !isFuture) {
                                        val formatted = date.format(DateTimeFormatter.ofPattern("MMM dd"))
                                        selectedDateInfo = if (sessionCount > 0) {
                                            "$formatted: $sessionCount sessions completed (${act?.totalXp ?: 0} XP)"
                                        } else {
                                            "$formatted: No practice recorded"
                                        }
                                    }
                            )
                        }
                    }
                }
            }
        }

        // Selected Date Info Banner
        if (selectedDateInfo != null) {
            Spacer(modifier = Modifier.height(Spacing.xs))
            Text(
                text = selectedDateInfo!!,
                style = MaterialTheme.typography.labelSmall,
                color = ForgeAmberPrimary,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}
