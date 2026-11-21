package com.antigravity.note.ui.settings

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Gesture
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableLongStateOf
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
import androidx.compose.ui.window.Dialog
import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.inkengine.canvas.BarrelButtonAction
import com.antigravity.note.inkengine.canvas.StationaryLongPressAction
import com.antigravity.note.inkengine.palm.InputMode

@Composable
fun SettingsDialog(
    appSettings: AppSettings,
    isDarkMode: Boolean,
    onToggleDarkMode: (Boolean) -> Unit,
    onOpenCloudBackup: () -> Unit,
    onOpenLocalBackup: () -> Unit,
    onApplySettings: () -> Unit,
    onDismissRequest: () -> Unit
) {
    // Obsidian & Gold luxury palette (Zero Blue)
    val velvetObsidian = Color(0xFF0E0F13)
    val imperialAmber = Color(0xFFF59E0B)
    val moltenGold = Color(0xFFFDE68A)
    val cardBackground = Color(0xFF181920)
    val textPrimary = Color(0xFFF3F4F6)
    val textSecondary = Color(0xFF9CA3AF)

    var userName by remember { mutableStateOf(appSettings.userName) }
    var userBio by remember { mutableStateOf(appSettings.userBio) }
    var userGoal by remember { mutableStateOf(appSettings.userGoal) }

    var stationaryAction by remember { mutableStateOf(appSettings.stationaryLongPressAction) }
    var barrelAction by remember { mutableStateOf(appSettings.barrelButtonAction) }
    var holdToSnapDelay by remember { mutableLongStateOf(appSettings.holdToSnapDelayMs) }
    var isHoldToSnapEnabled by remember { mutableStateOf(appSettings.isHoldToSnapEnabled) }

    var inputMode by remember { mutableStateOf(appSettings.inputMode) }
    var isFingerEraserEnabled by remember { mutableStateOf(appSettings.isFingerEraserEnabled) }
    var isAccidentalTouchProtection by remember { mutableStateOf(appSettings.isAccidentalTouchProtectionEnabled) }
    var isTwoFingerUndo by remember { mutableStateOf(appSettings.isTwoFingerUndoEnabled) }
    var isDebugOverlay by remember { mutableStateOf(appSettings.isDebugOverlayEnabled) }

    var showStationaryMenu by remember { mutableStateOf(false) }
    var showBarrelMenu by remember { mutableStateOf(false) }
    var showInputModeMenu by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismissRequest) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = velvetObsidian,
            tonalElevation = 10.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x33F59E0B)),
            modifier = Modifier
                .width(620.dp)
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0x22F59E0B)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Settings,
                                contentDescription = null,
                                tint = imperialAmber,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Settings & Stylus Customization",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = textPrimary
                            )
                            Text(
                                text = "Moto Pad 70 Pro & Hardware Stylus Preferences",
                                fontSize = 11.sp,
                                color = textSecondary
                            )
                        }
                    }

                    IconButton(onClick = onDismissRequest) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = textSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // ================= 1. USER PROFILE SECTION =================
                Text(
                    text = "USER PROFILE & STUDY GOAL",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = imperialAmber,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = cardBackground),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x1AF59E0B)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            // Monogram Avatar Badge: 18k Molten Gold on Velvet Obsidian
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(CircleShape)
                                    .background(velvetObsidian)
                                    .border(2.dp, imperialAmber, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = appSettings.userAvatarInitials,
                                    color = moltenGold,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Column(modifier = Modifier.weight(1f)) {
                                OutlinedTextField(
                                    value = userName,
                                    onValueChange = {
                                        userName = it
                                        appSettings.userName = it
                                    },
                                    label = { Text("Display Name", fontSize = 11.sp) },
                                    singleLine = true,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = imperialAmber,
                                        unfocusedBorderColor = Color(0x33F59E0B),
                                        focusedTextColor = textPrimary,
                                        unfocusedTextColor = textPrimary,
                                        focusedLabelColor = imperialAmber,
                                        unfocusedLabelColor = textSecondary
                                    ),
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = userBio,
                            onValueChange = {
                                userBio = it
                                appSettings.userBio = it
                            },
                            label = { Text("Subtitle / Bio", fontSize = 11.sp) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = imperialAmber,
                                unfocusedBorderColor = Color(0x33F59E0B),
                                focusedTextColor = textPrimary,
                                unfocusedTextColor = textPrimary,
                                focusedLabelColor = imperialAmber,
                                unfocusedLabelColor = textSecondary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = userGoal,
                            onValueChange = {
                                userGoal = it
                                appSettings.userGoal = it
                            },
                            label = { Text("DSA & Note-Taking Goal", fontSize = 11.sp) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = imperialAmber,
                                unfocusedBorderColor = Color(0x33F59E0B),
                                focusedTextColor = textPrimary,
                                unfocusedTextColor = textPrimary,
                                focusedLabelColor = imperialAmber,
                                unfocusedLabelColor = textSecondary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // ================= 2. HARDWARE STYLUS & GESTURES =================
                Text(
                    text = "HARDWARE STYLUS & GESTURES",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = imperialAmber,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = cardBackground),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x1AF59E0B)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        // Stationary Long-Press Action
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Stationary Long-Press Action", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = textPrimary)
                                Text("Triggers ONLY when pen is stationary (< 14px)", fontSize = 11.sp, color = textSecondary)
                            }
                            Box {
                                Button(
                                    onClick = { showStationaryMenu = true },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0x22F59E0B), contentColor = imperialAmber),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(stationaryAction.name, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                DropdownMenu(
                                    expanded = showStationaryMenu,
                                    onDismissRequest = { showStationaryMenu = false }
                                ) {
                                    StationaryLongPressAction.entries.forEach { action ->
                                        DropdownMenuItem(
                                            text = { Text(action.name) },
                                            trailingIcon = {
                                                if (stationaryAction == action) {
                                                    Icon(Icons.Default.Check, contentDescription = null, tint = imperialAmber)
                                                }
                                            },
                                            onClick = {
                                                stationaryAction = action
                                                appSettings.stationaryLongPressAction = action
                                                showStationaryMenu = false
                                            }
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Stylus Barrel Button Action
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Stylus Barrel Button Action", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = textPrimary)
                                Text("Physical side button (BUTTON_STYLUS_PRIMARY)", fontSize = 11.sp, color = textSecondary)
                            }
                            Box {
                                Button(
                                    onClick = { showBarrelMenu = true },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0x22F59E0B), contentColor = imperialAmber),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(getBarrelActionDisplayName(barrelAction), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                DropdownMenu(
                                    expanded = showBarrelMenu,
                                    onDismissRequest = { showBarrelMenu = false }
                                ) {
                                    BarrelButtonAction.entries.forEach { action ->
                                        DropdownMenuItem(
                                            text = { Text(getBarrelActionDisplayName(action)) },
                                            trailingIcon = {
                                                if (barrelAction == action) {
                                                    Icon(Icons.Default.Check, contentDescription = null, tint = imperialAmber)
                                                }
                                            },
                                            onClick = {
                                                barrelAction = action
                                                appSettings.barrelButtonAction = action
                                                showBarrelMenu = false
                                            }
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Hold-to-Shape Master Switch
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Hold-to-Shape Recognition", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = textPrimary)
                                Text("Snap vector shapes when pen pauses at stroke end", fontSize = 11.sp, color = textSecondary)
                            }
                            Switch(
                                checked = isHoldToSnapEnabled,
                                onCheckedChange = {
                                    isHoldToSnapEnabled = it
                                    appSettings.isHoldToSnapEnabled = it
                                },
                                colors = SwitchDefaults.colors(checkedThumbColor = imperialAmber, checkedTrackColor = Color(0x66F59E0B))
                            )
                        }

                        if (isHoldToSnapEnabled) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Hold-to-Shape Delay", fontSize = 12.sp, color = textSecondary)
                                Text("${holdToSnapDelay}ms", fontWeight = FontWeight.Bold, color = imperialAmber, fontSize = 12.sp)
                            }
                            Slider(
                                value = holdToSnapDelay.toFloat(),
                                onValueChange = {
                                    val rounded = (it / 25).toInt() * 25L
                                    holdToSnapDelay = rounded
                                    appSettings.holdToSnapDelayMs = rounded
                                },
                                valueRange = 250f..700f,
                                steps = 17,
                                colors = SliderDefaults.colors(
                                    thumbColor = imperialAmber,
                                    activeTrackColor = imperialAmber,
                                    inactiveTrackColor = Color(0x33F59E0B)
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // ================= 3. TOUCH & PALM REJECTION =================
                Text(
                    text = "INPUT & PALM REJECTION MODES",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = imperialAmber,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = cardBackground),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x1AF59E0B)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        // Input Mode
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Active Input Mode", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = textPrimary)
                                val modeDesc = when (inputMode) {
                                    InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM -> "Pen inks, fingers pan & zoom"
                                    InputMode.PEN_ONLY -> "Stylus only (reject all finger touch)"
                                    InputMode.PEN_DRAWS_FINGER_ERASES -> "Stylus writes, single finger erases"
                                    InputMode.PEN_AND_FINGER_DRAW -> "Both pen and finger can draw"
                                }
                                Text(modeDesc, fontSize = 11.sp, color = textSecondary)
                            }
                            Box {
                                Button(
                                    onClick = { showInputModeMenu = true },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0x22F59E0B), contentColor = imperialAmber),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(inputMode.name.substringBefore("_"), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                DropdownMenu(
                                    expanded = showInputModeMenu,
                                    onDismissRequest = { showInputModeMenu = false }
                                ) {
                                    InputMode.entries.forEach { mode ->
                                        DropdownMenuItem(
                                            text = { Text(mode.name.replace("_", " ")) },
                                            trailingIcon = {
                                                if (inputMode == mode) {
                                                    Icon(Icons.Default.Check, contentDescription = null, tint = imperialAmber)
                                                }
                                            },
                                            onClick = {
                                                inputMode = mode
                                                appSettings.inputMode = mode
                                                showInputModeMenu = false
                                            }
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Accidental Touch Protection
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Accidental Touch Protection", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = textPrimary)
                                Text("Grace window & palm contact filtering", fontSize = 11.sp, color = textSecondary)
                            }
                            Switch(
                                checked = isAccidentalTouchProtection,
                                onCheckedChange = {
                                    isAccidentalTouchProtection = it
                                    appSettings.isAccidentalTouchProtectionEnabled = it
                                },
                                colors = SwitchDefaults.colors(checkedThumbColor = imperialAmber, checkedTrackColor = Color(0x66F59E0B))
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Two-Finger Tap to Undo
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Two-Finger Tap to Undo", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = textPrimary)
                                Text("Quick double-finger tap instantly undoes stroke", fontSize = 11.sp, color = textSecondary)
                            }
                            Switch(
                                checked = isTwoFingerUndo,
                                onCheckedChange = {
                                    isTwoFingerUndo = it
                                    appSettings.isTwoFingerUndoEnabled = it
                                },
                                colors = SwitchDefaults.colors(checkedThumbColor = imperialAmber, checkedTrackColor = Color(0x66F59E0B))
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Debug HUD Overlay
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Diagnostics & 120Hz FPS Overlay", fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = textPrimary)
                                Text("Real-time framerate, touch latency & palm rejection monitor", fontSize = 11.sp, color = textSecondary)
                            }
                            Switch(
                                checked = isDebugOverlay,
                                onCheckedChange = {
                                    isDebugOverlay = it
                                    appSettings.isDebugOverlayEnabled = it
                                },
                                colors = SwitchDefaults.colors(checkedThumbColor = imperialAmber, checkedTrackColor = Color(0x66F59E0B))
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // ================= 4. BACKUP & WORKSPACE =================
                Text(
                    text = "BACKUP & WORKSPACE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = imperialAmber,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = {
                            onDismissRequest()
                            onOpenCloudBackup()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0x222E7D32), contentColor = Color(0xFF4CAF50)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.Cloud, contentDescription = null, modifier = Modifier.size(18.dp))
                            Text("Google Drive Sync", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = {
                            onDismissRequest()
                            onOpenLocalBackup()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0x22F59E0B), contentColor = imperialAmber),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.Storage, contentDescription = null, modifier = Modifier.size(18.dp))
                            Text("Local Backup", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Done Button
                Button(
                    onClick = {
                        onApplySettings()
                        onDismissRequest()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = imperialAmber, contentColor = velvetObsidian),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Apply & Save Preferences", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
        }
    }
}

private fun getBarrelActionDisplayName(action: BarrelButtonAction): String = when (action) {
    BarrelButtonAction.ERASER -> "Eraser"
    BarrelButtonAction.LASSO -> "Lasso Selection"
    BarrelButtonAction.COLOR_PICKER -> "Color Picker"
    BarrelButtonAction.PAN -> "Pan / Scroll Canvas"
    BarrelButtonAction.UNDO -> "Undo"
    BarrelButtonAction.TEMPORARY_LASER -> "Temporary Laser Pointer (Momentary)"
    BarrelButtonAction.DISABLED -> "Disabled"
}
