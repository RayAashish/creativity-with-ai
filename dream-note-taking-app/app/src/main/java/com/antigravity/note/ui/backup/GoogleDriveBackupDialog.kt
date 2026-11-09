package com.antigravity.note.ui.backup

import android.widget.Toast
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.antigravity.note.library.backup.gdrive.GoogleDriveAuthStorage
import com.antigravity.note.library.backup.gdrive.GoogleDriveBackupEngine
import com.antigravity.note.library.backup.gdrive.GoogleDriveRestoreEngine
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun GoogleDriveBackupDialog(
    authStorage: GoogleDriveAuthStorage,
    backupEngine: GoogleDriveBackupEngine,
    restoreEngine: GoogleDriveRestoreEngine,
    onRestoreCompleted: () -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var isBackingUp by remember { mutableStateOf(false) }
    var isRestoring by remember { mutableStateOf(false) }
    var progressPercent by remember { mutableFloatStateOf(0f) }
    var progressMessage by remember { mutableStateOf("") }
    var showRestoreConfirm by remember { mutableStateOf(false) }
    var showTokenDialog by remember { mutableStateOf(false) }

    var useVisibleFolder by remember { mutableStateOf(authStorage.isUseVisibleFolder()) }
    var lastBackupTime by remember { mutableStateOf(authStorage.getLastBackupTime()) }
    var lastBackupSize by remember { mutableStateOf(authStorage.getLastBackupSize()) }
    var lastBackupHash by remember { mutableStateOf(authStorage.getLastBackupHash()) }
    var apiKey by remember { mutableStateOf(authStorage.getApiKey()) }
    var accountEmail by remember { mutableStateOf(authStorage.getAccountEmail() ?: "2002raysi@gmail.com") }
    val hasToken = authStorage.getAccessToken() != null

    val dateFormat = remember { SimpleDateFormat("MMM dd, yyyy  hh:mm a", Locale.getDefault()) }

    Dialog(onDismissRequest = { if (!isBackingUp && !isRestoring) onDismiss() }) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp,
            modifier = Modifier
                .fillMaxWidth(0.94f)
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFE8F5E9)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Cloud,
                                contentDescription = "Google Drive",
                                tint = Color(0xFF2E7D32),
                                modifier = Modifier.size(26.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column {
                            Text(
                                text = "Google Drive Backup",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Lossless local-first cloud snapshot",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    IconButton(onClick = onDismiss, enabled = !isBackingUp && !isRestoring) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // WhatsApp-Style Backup Info Card
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Account",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = accountEmail,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = if (apiKey.isNotEmpty()) "API Key: ${apiKey.take(10)}...${apiKey.takeLast(4)}" else "No API Key",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                                )
                            }
                            OutlinedButton(
                                onClick = { showTokenDialog = true },
                                modifier = Modifier.height(34.dp)
                            ) {
                                Icon(Icons.Default.Key, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(if (hasToken) "Token" else "Connect", style = MaterialTheme.typography.labelSmall)
                            }
                        }

                        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Column {
                                Text(
                                    text = "Last Backup",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = if (lastBackupTime > 0) dateFormat.format(Date(lastBackupTime)) else "Never",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "Size",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = if (lastBackupSize > 0) "${lastBackupSize / 1024} KB" else "--",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }

                        if (!lastBackupHash.isNullOrEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.Security,
                                    contentDescription = null,
                                    tint = Color(0xFF2E7D32),
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "SHA-256: ${lastBackupHash?.take(16)}...",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontFamily = FontFamily.Monospace,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Storage target folder switch
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = if (useVisibleFolder) "Dedicated Visible Folder" else "AppDataFolder (Hidden Sandbox)",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = if (useVisibleFolder) {
                                    "Backup file visible in Google Drive root ('drive.file' scope)"
                                } else {
                                    "Isolated application sandbox ('drive.appdata' scope, invisible to other apps)"
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = useVisibleFolder,
                            onCheckedChange = {
                                useVisibleFolder = it
                                authStorage.setUseVisibleFolder(it)
                            }
                        )
                    }
                }

                // Progress indicator during operation
                if (isBackingUp || isRestoring) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = progressMessage,
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        LinearProgressIndicator(
                            progress = { progressPercent },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Action Buttons: Backup Now & Restore
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = { showRestoreConfirm = true },
                        enabled = !isBackingUp && !isRestoring && hasToken,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    ) {
                        Icon(Icons.Default.CloudDownload, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Restore")
                    }

                    Button(
                        onClick = {
                            if (!hasToken) {
                                showTokenDialog = true
                                return@Button
                            }
                            isBackingUp = true
                            progressPercent = 0.05f
                            progressMessage = "Preparing backup snapshot..."
                            scope.launch {
                                val result = backupEngine.uploadBackup(forceFullSnapshot = true) { p, msg ->
                                    progressPercent = p
                                    progressMessage = msg
                                }
                                isBackingUp = false
                                if (result.isSuccess) {
                                    val data = result.getOrThrow()
                                    lastBackupTime = authStorage.getLastBackupTime()
                                    lastBackupSize = authStorage.getLastBackupSize()
                                    lastBackupHash = authStorage.getLastBackupHash()
                                    Toast.makeText(context, "Backup uploaded (${data.bytesUploaded / 1024} KB)!", Toast.LENGTH_LONG).show()
                                } else {
                                    val err = result.exceptionOrNull()?.message ?: "Unknown error"
                                    Toast.makeText(context, "Backup failed: $err", Toast.LENGTH_LONG).show()
                                }
                            }
                        },
                        enabled = !isBackingUp && !isRestoring,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32)),
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    ) {
                        if (isBackingUp) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Back Up Now")
                        }
                    }
                }
            }
        }
    }

    // Confirmation dialog before Restore
    if (showRestoreConfirm) {
        AlertDialog(
            onDismissRequest = { showRestoreConfirm = false },
            title = { Text("Restore notes from Google Drive?") },
            text = {
                Text(
                    "This will restore all notes and media from the latest Google Drive backup archive and replace local notes. All archive checksums will be validated prior to restoring."
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showRestoreConfirm = false
                        isRestoring = true
                        progressPercent = 0.05f
                        progressMessage = "Connecting to Google Drive..."
                        scope.launch {
                            val result = restoreEngine.restoreBackup { p, msg ->
                                progressPercent = p
                                progressMessage = msg
                            }
                            isRestoring = false
                            if (result.isSuccess) {
                                val data = result.getOrThrow()
                                Toast.makeText(
                                    context,
                                    "Successfully restored ${data.restoredNotebooks} notebooks (${data.restoredPages} pages)!",
                                    Toast.LENGTH_LONG
                                ).show()
                                onRestoreCompleted()
                                onDismiss()
                            } else {
                                val err = result.exceptionOrNull()?.message ?: "Unknown error"
                                Toast.makeText(context, "Restore failed: $err", Toast.LENGTH_LONG).show()
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32))
                ) {
                    Text("Proceed with Restore")
                }
            },
            dismissButton = {
                TextButton(onClick = { showRestoreConfirm = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Token configuration dialog
    if (showTokenDialog) {
        var tokenInput by remember { mutableStateOf(authStorage.getAccessToken().orEmpty()) }
        var emailInput by remember { mutableStateOf(authStorage.getAccountEmail() ?: "2002raysi@gmail.com") }
        var apiKeyInput by remember { mutableStateOf(authStorage.getApiKey()) }

        AlertDialog(
            onDismissRequest = { showTokenDialog = false },
            title = { Text("Google Drive Credentials") },
            text = {
                Column {
                    Text(
                        "Google Drive API v3 requires an OAuth2 User Access Token to upload or restore private user files. Your Google API key is configured for project quotas.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = emailInput,
                        onValueChange = { emailInput = it },
                        label = { Text("Account Email") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = apiKeyInput,
                        onValueChange = { apiKeyInput = it },
                        label = { Text("Google Drive API Key") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = tokenInput,
                        onValueChange = { tokenInput = it },
                        label = { Text("OAuth Bearer Token") },
                        placeholder = { Text("ya29.a0...") },
                        trailingIcon = {
                            TextButton(
                                onClick = {
                                    val clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as? android.content.ClipboardManager
                                    val clip = clipboard?.primaryClip?.getItemAt(0)?.text?.toString()
                                    if (!clip.isNullOrBlank()) {
                                        tokenInput = clip.trim()
                                        Toast.makeText(context, "Pasted token from clipboard", Toast.LENGTH_SHORT).show()
                                    } else {
                                        Toast.makeText(context, "Clipboard is empty", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            ) {
                                Text("Paste", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        authStorage.saveAccessToken(tokenInput.trim().ifEmpty { null })
                        authStorage.saveAccountEmail(emailInput.trim().ifEmpty { null })
                        authStorage.saveApiKey(apiKeyInput.trim().ifEmpty { null })
                        apiKey = apiKeyInput.trim()
                        accountEmail = emailInput.trim().ifEmpty { "Connected Account" }
                        showTokenDialog = false
                        Toast.makeText(context, "Google Drive credentials saved", Toast.LENGTH_SHORT).show()
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showTokenDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
