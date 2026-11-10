package com.readmaster.app.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.BookmarkAdd
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.readmaster.app.data.dictionary.VocabEntry

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun WordLookupDialog(
    vocabEntry: VocabEntry,
    onSpeak: (String) -> Unit,
    onSaveWord: (VocabEntry) -> Unit,
    onDismiss: () -> Unit
) {
    // 0: English, 1: Hindi, 2: Nepali, 3: Combined
    var selectedTab by remember { mutableIntStateOf(0) }
    var isSaved by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(22.dp),
            color = Color(0xFF181B22),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF2E3544)),
            tonalElevation = 10.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Top Bar: Word, Pronunciation Button, Close
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = vocabEntry.word,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        IconButton(
                            onClick = { onSpeak(vocabEntry.word) },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF4F46E5))
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                                contentDescription = "Pronounce",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color(0xFF94A3B8)
                        )
                    }
                }

                // Phonetics & Devanagari Pronunciation
                Row(
                    modifier = Modifier.padding(top = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (vocabEntry.phonetic.isNotBlank()) {
                        Text(
                            text = vocabEntry.phonetic,
                            fontSize = 14.sp,
                            fontFamily = FontFamily.Monospace,
                            color = Color(0xFF94A3B8)
                        )
                    }
                    if (vocabEntry.devanagariPhonetic.isNotBlank()) {
                        Spacer(modifier = Modifier.width(10.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color(0xFF312E81))
                                .border(1.dp, Color(0xFF4338CA), RoundedCornerShape(6.dp))
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = vocabEntry.devanagariPhonetic,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFFC7D2FE)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 4 Tabs: English (Google/Oxford), Hindi, Nepali, Combined
                val tabTitles = listOf("English 📖", "Hindi 🇮🇳", "Nepali 🇳🇵", "Combined 🌐")
                ScrollableTabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color(0xFF0F1218),
                    edgePadding = 0.dp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFF242A38), RoundedCornerShape(12.dp))
                ) {
                    tabTitles.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            text = {
                                Text(
                                    text = title,
                                    fontSize = 13.sp,
                                    fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Medium,
                                    color = if (selectedTab == index) Color(0xFF818CF8) else Color(0xFF94A3B8)
                                )
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Content of Senses
                vocabEntry.senses.forEachIndexed { _, sense ->
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF131720)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF242A38)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            // Part of Speech Pill
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color(0xFF312E81))
                                    .border(1.dp, Color(0xFF4338CA), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = sense.partOfSpeech.uppercase(),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFA5B4FC)
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // --- TAB 0: ENGLISH DICTIONARY (Google Translate / Oxford Style) ---
                            if (selectedTab == 0 || selectedTab == 3) {
                                Text(
                                    text = "DEFINITION",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF94A3B8)
                                )
                                Text(
                                    text = sense.englishDefinition,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFFF1F5F9),
                                    modifier = Modifier.padding(top = 2.dp, bottom = 8.dp)
                                )

                                // Synonyms Section (Google Translate chips)
                                if (sense.synonyms.isNotEmpty()) {
                                    Text(
                                        text = "SYNONYMS",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF38BDF8)
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    FlowRow(
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalArrangement = Arrangement.spacedBy(6.dp),
                                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                                    ) {
                                        sense.synonyms.forEach { syn ->
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(16.dp))
                                                    .background(Color(0xFF0C4A6E))
                                                    .border(1.dp, Color(0xFF0284C7), RoundedCornerShape(16.dp))
                                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                                            ) {
                                                Text(
                                                    text = syn,
                                                    fontSize = 12.sp,
                                                    fontWeight = FontWeight.SemiBold,
                                                    color = Color(0xFFBAE6FD)
                                                )
                                            }
                                        }
                                    }
                                }

                                // Antonyms Section
                                if (sense.antonyms.isNotEmpty()) {
                                    Text(
                                        text = "ANTONYMS",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFF87171)
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    FlowRow(
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalArrangement = Arrangement.spacedBy(6.dp),
                                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                                    ) {
                                        sense.antonyms.forEach { ant ->
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(16.dp))
                                                    .background(Color(0xFF450A0A))
                                                    .border(1.dp, Color(0xFFDC2626), RoundedCornerShape(16.dp))
                                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                                            ) {
                                                Text(
                                                    text = ant,
                                                    fontSize = 12.sp,
                                                    fontWeight = FontWeight.SemiBold,
                                                    color = Color(0xFFFECACA)
                                                )
                                            }
                                        }
                                    }
                                }

                                // Examples Section
                                val allExamples = mutableListOf<String>()
                                if (sense.exampleSentence.isNotBlank()) allExamples.add(sense.exampleSentence)
                                allExamples.addAll(sense.additionalExamples)

                                if (allExamples.isNotEmpty()) {
                                    Text(
                                        text = "EXAMPLES",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF94A3B8)
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    allExamples.forEach { ex ->
                                        Row(
                                            modifier = Modifier.padding(bottom = 4.dp),
                                            verticalAlignment = Alignment.Top
                                        ) {
                                            Text(
                                                text = "• ",
                                                fontSize = 13.sp,
                                                color = Color(0xFF818CF8),
                                                fontWeight = FontWeight.Bold
                                            )
                                            Text(
                                                text = "“$ex”",
                                                fontSize = 13.sp,
                                                fontStyle = FontStyle.Italic,
                                                color = Color(0xFFCBD5E1)
                                            )
                                        }
                                    }
                                }
                            }

                            // --- TAB 1: HINDI TRANSLATION ---
                            if (selectedTab == 1 || selectedTab == 3) {
                                if (selectedTab == 3) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    HorizontalDivider(color = Color(0xFF242A38))
                                    Spacer(modifier = Modifier.height(8.dp))
                                }
                                Text(
                                    text = "HINDI TRANSLATION (हिन्दी अर्थ)",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFFB923C)
                                )
                                Text(
                                    text = sense.hindi.joinToString(", "),
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFFED7AA),
                                    modifier = Modifier.padding(top = 2.dp, bottom = 4.dp)
                                )
                                if (selectedTab == 1) {
                                    Text(
                                        text = "“${sense.exampleSentence}”",
                                        fontSize = 13.sp,
                                        fontStyle = FontStyle.Italic,
                                        color = Color(0xFFCBD5E1),
                                        modifier = Modifier.padding(top = 4.dp)
                                    )
                                }
                            }

                            // --- TAB 2: NEPALI TRANSLATION ---
                            if (selectedTab == 2 || selectedTab == 3) {
                                if (selectedTab == 3) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    HorizontalDivider(color = Color(0xFF242A38))
                                    Spacer(modifier = Modifier.height(8.dp))
                                }
                                Text(
                                    text = "NEPALI TRANSLATION (नेपाली अर्थ)",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFA78BFA)
                                )
                                Text(
                                    text = sense.nepali.joinToString(", "),
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFDDD6FE),
                                    modifier = Modifier.padding(top = 2.dp, bottom = 4.dp)
                                )
                                if (selectedTab == 2) {
                                    Text(
                                        text = "“${sense.exampleSentence}”",
                                        fontSize = 13.sp,
                                        fontStyle = FontStyle.Italic,
                                        color = Color(0xFFCBD5E1),
                                        modifier = Modifier.padding(top = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))
                HorizontalDivider(color = Color(0xFF242A38))
                Spacer(modifier = Modifier.height(12.dp))

                // Bottom Action: Save to Notebook
                Button(
                    onClick = {
                        onSaveWord(vocabEntry)
                        isSaved = true
                    },
                    enabled = !isSaved,
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSaved) Color(0xFF059669) else Color(0xFF4F46E5)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.BookmarkAdd,
                        contentDescription = "Save",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isSaved) "Saved to Notebook ✓" else "Save Word to Notebook",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
