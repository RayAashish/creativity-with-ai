// app/src/main/java/com/raysi/launcher/ui/home/components/DailyFocusLine.kt
package com.raysi.launcher.ui.home.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.PureWhite

/**
 * DailyFocusLine:
 * Minimalist, intentional single focus intent line.
 * When a focus is set, an explicit [edit] trigger prevents accidental keyboard popups.
 * Includes inline [save] and [esc] actions for zero friction.
 */
@Composable
fun DailyFocusLine(
    focusGoal: String,
    onSaveFocusGoal: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var isEditing by remember { mutableStateOf(false) }
    var draftText by remember(focusGoal, isEditing) { mutableStateOf(focusGoal) }
    val focusRequester = remember { FocusRequester() }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Text(
            text = "today's focus:",
            fontFamily = FontFamily.Monospace,
            fontSize = 12.sp,
            color = DimGray
        )

        Spacer(modifier = Modifier.height(4.dp))

        if (isEditing) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "> ",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    color = PureWhite
                )

                BasicTextField(
                    value = draftText,
                    onValueChange = { draftText = it },
                    singleLine = true,
                    cursorBrush = SolidColor(PureWhite),
                    textStyle = TextStyle(
                        fontFamily = FontFamily.Monospace,
                        fontSize = 14.sp,
                        color = PureWhite
                    ),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            onSaveFocusGoal(draftText.trim())
                            isEditing = false
                        }
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .focusRequester(focusRequester)
                )

                Text(
                    text = "[save]",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    color = PureWhite,
                    modifier = Modifier
                        .clickable {
                            onSaveFocusGoal(draftText.trim())
                            isEditing = false
                        }
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                )

                Text(
                    text = "[esc]",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    color = DimGray,
                    modifier = Modifier
                        .clickable {
                            draftText = focusGoal
                            isEditing = false
                        }
                        .padding(start = 2.dp, top = 2.dp, bottom = 2.dp)
                )
            }

            LaunchedEffect(Unit) {
                focusRequester.requestFocus()
            }
        } else {
            if (focusGoal.isNotBlank()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "> $focusGoal",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 14.sp,
                        color = PureWhite,
                        modifier = Modifier.weight(1f, fill = false)
                    )

                    Text(
                        text = "[edit]",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = DimGray,
                        modifier = Modifier
                            .clickable { isEditing = true }
                            .padding(start = 12.dp, top = 2.dp, bottom = 2.dp)
                    )
                }
            } else {
                Text(
                    text = "> tap to set today's focus...",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 14.sp,
                    color = Color(0xFF666666),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { isEditing = true }
                        .padding(vertical = 2.dp)
                )
            }
        }
    }
}
