// app/src/main/java/com/raysi/launcher/ui/scratchpad/ScratchpadOverlay.kt
package com.raysi.launcher.ui.scratchpad

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raysi.launcher.ui.theme.DimGray
import com.raysi.launcher.ui.theme.OledBlack
import com.raysi.launcher.ui.theme.PureWhite
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ScratchpadOverlay(
    initialContent: String,
    onSaveContent: (String) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    var text by remember(initialContent) { mutableStateOf(initialContent) }
    val focusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current
    val scope = rememberCoroutineScope()
    var debounceJob by remember { mutableStateOf<Job?>(null) }

    BackHandler {
        debounceJob?.cancel()
        onSaveContent(text)
        onDismiss()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(OledBlack)
            .statusBarsPadding()
            .navigationBarsPadding()
            .imePadding()
            .padding(horizontal = 24.dp, vertical = 16.dp)
    ) {
        // Top Action Row: [esc]         SCRATCHPAD         [clear]
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "[esc]",
                fontFamily = FontFamily.Monospace,
                fontSize = 14.sp,
                color = DimGray,
                modifier = Modifier
                    .clickable {
                        debounceJob?.cancel()
                        onSaveContent(text)
                        onDismiss()
                    }
                    .padding(vertical = 4.dp, horizontal = 2.dp)
            )

            Text(
                text = "scratchpad",
                fontFamily = FontFamily.Monospace,
                fontSize = 14.sp,
                color = PureWhite
            )

            Text(
                text = "[clear]",
                fontFamily = FontFamily.Monospace,
                fontSize = 14.sp,
                color = DimGray,
                modifier = Modifier
                    .clickable {
                        text = ""
                        debounceJob?.cancel()
                        onSaveContent("")
                    }
                    .padding(vertical = 4.dp, horizontal = 2.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Monospaced text editing canvas filling the area above the keyboard
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            BasicTextField(
                value = text,
                onValueChange = { newText ->
                    text = newText
                    debounceJob?.cancel()
                    debounceJob = scope.launch {
                        delay(300L) // 300ms debounce
                        onSaveContent(newText)
                    }
                },
                cursorBrush = SolidColor(PureWhite),
                textStyle = TextStyle(
                    fontFamily = FontFamily.Monospace,
                    fontSize = 15.sp,
                    color = PureWhite,
                    lineHeight = 22.sp
                ),
                decorationBox = { innerTextField ->
                    if (text.isEmpty()) {
                        Text(
                            text = "type anything here to remember...",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 15.sp,
                            color = DimGray.copy(alpha = 0.5f)
                        )
                    }
                    innerTextField()
                },
                modifier = Modifier
                    .fillMaxSize()
                    .focusRequester(focusRequester)
            )
        }
    }

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
        keyboardController?.show()
    }
}
