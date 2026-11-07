// app/src/main/java/com/raysi/launcher/ui/home/components/DailyFocusLine.kt
package com.raysi.launcher.ui.home.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
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

@Composable
fun DailyFocusLine(
    focusGoal: String,
    onSaveFocusGoal: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var isEditing by remember { mutableStateOf(false) }
    var draftText by remember(focusGoal) { mutableStateOf(focusGoal) }
    val focusRequester = remember { FocusRequester() }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clickable { isEditing = true }
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
                            onSaveFocusGoal(draftText)
                            isEditing = false
                        }
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(focusRequester)
                )
            }

            LaunchedEffect(Unit) {
                focusRequester.requestFocus()
            }
        } else {
            val displayGoal = if (focusGoal.isNotBlank()) {
                "> $focusGoal"
            } else {
                "> tap to set today's focus..."
            }

            val textColor = if (focusGoal.isNotBlank()) PureWhite else Color(0xFF555555)

            Text(
                text = displayGoal,
                fontFamily = FontFamily.Monospace,
                fontSize = 14.sp,
                color = textColor
            )
        }
    }
}
