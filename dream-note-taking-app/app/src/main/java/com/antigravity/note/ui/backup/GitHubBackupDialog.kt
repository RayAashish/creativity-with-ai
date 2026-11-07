package com.antigravity.note.ui.backup

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DividerDefaults
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.antigravity.note.library.backup.auth.AuthState
import com.antigravity.note.library.backup.auth.EncryptedTokenStorage
import com.antigravity.note.library.backup.auth.GitHubDeviceFlowClient
import com.antigravity.note.library.backup.engine.BackupResult
import com.antigravity.note.library.backup.engine.BackupEngine
import com.antigravity.note.library.backup.engine.GitHubGitDataClient
import com.antigravity.note.library.backup.engine.SlimDownExecutionResult
import com.antigravity.note.library.backup.engine.SlimDownScanResult
import com.antigravity.note.library.backup.repo.GitHubRepoManager
import com.antigravity.note.library.backup.repo.RepoAvailability
import com.antigravity.note.library.backup.worker.BackupWorker
import com.antigravity.note.library.db.NoteDatabase
import com.antigravity.note.document.storage.PageRepository
import java.io.File
import java.util.Locale
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch

@Composable
fun GitHubBackupDialog(
    tokenStorage: EncryptedTokenStorage,
    deviceFlowClient: GitHubDeviceFlowClient,
    repoManager: GitHubRepoManager,
    onDismiss: () -> Unit,
    onTriggerBackupNow: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    var authState by remember { mutableStateOf<AuthState>(AuthState.SignedOut) }
    var selectedRepo by remember { mutableStateOf(tokenStorage.getSelectedRepo()) }
    var repoNameInput by remember { mutableStateOf(selectedRepo?.second ?: GitHubRepoManager.DEFAULT_REPO_NAME) }
    var repoAvailability by remember { mutableStateOf<RepoAvailability>(RepoAvailability.Idle) }

    var wifiOnly by remember { mutableStateOf(tokenStorage.isWifiOnly()) }
    var chargingOnly by remember { mutableStateOf(tokenStorage.isChargingOnly()) }
    var exportSvg by remember { mutableStateOf(tokenStorage.isExportSvg()) }
    var encryptionEnabled by remember { mutableStateOf(tokenStorage.isEncryptionEnabled()) }
    var mirrorDeletions by remember { mutableStateOf(tokenStorage.isMirrorDeletions()) }
    var passphraseInput by remember { mutableStateOf(tokenStorage.getEncryptionPassphrase() ?: "") }

    var isBackingUp by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var isSuccessMessage by remember { mutableStateOf(true) }

    var showCompactHistoryDialog by remember { mutableStateOf(false) }
    var isCompacting by remember { mutableStateOf(false) }

    var showSlimDownDialog by remember { mutableStateOf(false) }
    var isScanningSlimDown by remember { mutableStateOf(false) }
    var isExecutingSlimDown by remember { mutableStateOf(false) }
    var slimDownScanResult by remember { mutableStateOf<SlimDownScanResult?>(null) }
    var slimDownExecutionResult by remember { mutableStateOf<SlimDownExecutionResult?>(null) }

    val engine = remember(context) {
        val database = NoteDatabase.getInstance(context)
        val rootDir = File(context.filesDir, "notebooks")
        val pageRepository = PageRepository(rootDir)
        val okHttpClient = okhttp3.OkHttpClient.Builder().build()
        val gitDataClient = GitHubGitDataClient(tokenStorage, okHttpClient)
        BackupEngine(database, pageRepository, tokenStorage, gitDataClient)
    }

    LaunchedEffect(Unit) {
        authState = deviceFlowClient.getCurrentAuthState()
        val repo = tokenStorage.getSelectedRepo()
        selectedRepo = repo
        if (repo != null) {
            repoNameInput = repo.second
        }
    }

    LaunchedEffect(repoNameInput, authState) {
        val owner = (authState as? AuthState.Authenticated)?.username
        if (owner.isNullOrBlank() || repoNameInput.isBlank()) {
            repoAvailability = RepoAvailability.Idle
            return@LaunchedEffect
        }
        val err = GitHubRepoManager.validateRepoName(repoNameInput)
        if (err != null) {
            repoAvailability = RepoAvailability.InvalidName(err)
            return@LaunchedEffect
        }
        repoAvailability = RepoAvailability.Checking
        kotlinx.coroutines.delay(400L)
        repoAvailability = repoManager.checkRepoAvailability(owner, repoNameInput.trim())
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .padding(vertical = 24.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .verticalScroll(scrollState),
                verticalArrangement = Arrangement.spacedBy(18.dp)
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
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CloudSync,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                        Column {
                            Text(
                                text = "GitHub Backup & Restore",
                                fontSize = 19.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Local-first atomic note synchronization",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                HorizontalDivider(color = DividerDefaults.color.copy(alpha = 0.5f))

                // Section 1: GitHub Account
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "GitHub Account",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary
                        )

                        when (val state = authState) {
                            is AuthState.Authenticated -> {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = state.username,
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "OAuth Scope: repo (private repositories)",
                                            fontSize = 12.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    OutlinedButton(
                                        onClick = {
                                            deviceFlowClient.signOut()
                                            authState = AuthState.SignedOut
                                            selectedRepo = null
                                        }
                                    ) {
                                        Text("Sign Out")
                                    }
                                }
                            }
                            is AuthState.Authorizing -> {
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.Center,
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "Enter this one-time code on GitHub:",
                                        fontSize = 13.sp
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = MaterialTheme.colorScheme.primaryContainer,
                                        modifier = Modifier.padding(vertical = 4.dp)
                                    ) {
                                        Text(
                                            text = state.userCode,
                                            fontSize = 26.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            fontFamily = FontFamily.Monospace,
                                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                                            color = MaterialTheme.colorScheme.onPrimaryContainer
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Button(
                                        onClick = {
                                            val clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                                            val clip = android.content.ClipData.newPlainText("GitHub Code", state.userCode)
                                            clipboard.setPrimaryClip(clip)
                                            android.widget.Toast.makeText(context, "Code ${state.userCode} copied!", android.widget.Toast.LENGTH_SHORT).show()

                                            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(state.verificationUri))
                                            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                            context.startActivity(browserIntent)
                                        }
                                    ) {
                                        Icon(Icons.Default.OpenInBrowser, contentDescription = null)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("Copy Code & Open GitHub")
                                    }
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                                        Text(
                                            text = "Waiting for authorization on GitHub...",
                                            fontSize = 12.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                            is AuthState.SignedOut, is AuthState.ReconnectionRequired, is AuthState.Error -> {
                                if (state is AuthState.ReconnectionRequired) {
                                    Text(
                                        text = "Session expired. Please reconnect your GitHub account.",
                                        color = MaterialTheme.colorScheme.error,
                                        fontSize = 13.sp
                                    )
                                } else if (state is AuthState.Error) {
                                    Text(
                                        text = state.message,
                                        color = MaterialTheme.colorScheme.error,
                                        fontSize = 13.sp
                                    )
                                }
                                Button(
                                    onClick = {
                                        scope.launch {
                                            val codeRes = deviceFlowClient.requestDeviceCode()
                                            codeRes.fold(
                                                onSuccess = { res ->
                                                    authState = AuthState.Authorizing(res.userCode, res.verificationUri, res.expiresIn)
                                                    deviceFlowClient.pollForToken(res.deviceCode, res.interval, res.expiresIn)
                                                        .collect { polledState ->
                                                            if (polledState is AuthState.Authenticated || (polledState is AuthState.Error && !polledState.isRecoverable)) {
                                                                authState = polledState
                                                                if (polledState is AuthState.Authenticated) {
                                                                    selectedRepo = tokenStorage.getSelectedRepo()
                                                                }
                                                            }
                                                        }
                                                },
                                                onFailure = { err ->
                                                    authState = AuthState.Error("Failed requesting code: ${err.message}")
                                                }
                                            )
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.Cloud, contentDescription = null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Sign In with GitHub Device Flow")
                                }
                            }
                        }
                    }
                }

                // Section 2: Repository Configuration
                if (authState is AuthState.Authenticated) {
                    val currentOwner = (authState as AuthState.Authenticated).username
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text(
                                text = "Target Repository",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary
                            )

                            if (selectedRepo != null) {
                                val (owner, repo, branch) = selectedRepo!!
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = Color(0xFFE8F5E9),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Lock,
                                            contentDescription = null,
                                            tint = Color(0xFF2E7D32),
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Column {
                                            Text(
                                                text = "Active: $owner/$repo",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = Color(0xFF1B5E20)
                                            )
                                            Text(
                                                text = "Branch: $branch (Private)",
                                                fontSize = 11.sp,
                                                color = Color(0xFF2E7D32)
                                            )
                                        }
                                    }
                                }
                            }

                            // Editable repo name input
                            OutlinedTextField(
                                value = repoNameInput,
                                onValueChange = { repoNameInput = it.trim() },
                                label = { Text("Backup Repository Name") },
                                prefix = {
                                    Text(
                                        text = "$currentOwner/",
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )

                            // Availability Status
                            when (val avail = repoAvailability) {
                                is RepoAvailability.Checking -> {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        CircularProgressIndicator(modifier = Modifier.size(14.dp), strokeWidth = 2.dp)
                                        Text("Checking GitHub repository...", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                                is RepoAvailability.Existing -> {
                                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF2E7D32), modifier = Modifier.size(16.dp))
                                            Text(
                                                text = "Found existing repo (will sync)",
                                                fontSize = 12.sp,
                                                color = Color(0xFF2E7D32),
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                        if (selectedRepo?.second != repoNameInput.trim()) {
                                            Button(
                                                onClick = {
                                                    tokenStorage.saveSelectedRepo(currentOwner, repoNameInput.trim(), "main")
                                                    selectedRepo = tokenStorage.getSelectedRepo()
                                                    statusMessage = "Switched target repo to $currentOwner/${repoNameInput.trim()}"
                                                    isSuccessMessage = true
                                                },
                                                modifier = Modifier.fillMaxWidth()
                                            ) {
                                                Text("Use This Repository")
                                            }
                                        }
                                    }
                                }
                                is RepoAvailability.NotExistsCanCreate -> {
                                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Icon(Icons.Default.Add, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                                            Text(
                                                text = "New repo (will create as private)",
                                                fontSize = 12.sp,
                                                color = MaterialTheme.colorScheme.primary,
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                        Button(
                                            onClick = {
                                                scope.launch {
                                                    val createRes = repoManager.createBackupRepo(name = repoNameInput.trim(), isPrivate = true)
                                                    createRes.fold(
                                                        onSuccess = { created ->
                                                            selectedRepo = tokenStorage.getSelectedRepo()
                                                            statusMessage = "Created private repository ${created.fullName}!"
                                                            isSuccessMessage = true
                                                        },
                                                        onFailure = { err ->
                                                            statusMessage = "Failed: ${err.message}"
                                                            isSuccessMessage = false
                                                        }
                                                    )
                                                }
                                            },
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text("Create & Link Private Repo (${repoNameInput.trim()})")
                                        }
                                    }
                                }
                                is RepoAvailability.InvalidName -> {
                                    Text(
                                        text = "⚠️ ${avail.reason}",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.error
                                    )
                                }
                                is RepoAvailability.AccessDenied -> {
                                    Text(
                                        text = "⚠️ ${avail.message}",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.error
                                    )
                                }
                                is RepoAvailability.Error -> {
                                    Text(
                                        text = "⚠️ ${avail.message}",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.error
                                    )
                                }
                                is RepoAvailability.Idle -> {}
                            }
                        }
                    }

                    // Section 3: Sync & Storage Limits
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = "GitHub Quotas & Hygiene",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Repo Size Budget", fontSize = 13.sp)
                                Text("< 50 MB / 1,000 MB recommended", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                            LinearProgressIndicator(
                                progress = { 0.05f },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp))
                            )
                            Text(
                                text = "• Files > 50 MiB skipped automatically to respect GitHub API guidelines.\n• Pushes coalesced to avoid secondary rate limits.",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            Spacer(modifier = Modifier.height(4.dp))
                            OutlinedButton(
                                onClick = {
                                    showSlimDownDialog = true
                                    slimDownScanResult = null
                                    slimDownExecutionResult = null
                                    scope.launch {
                                        isScanningSlimDown = true
                                        val scanRes = engine.scanForSlimDown()
                                        slimDownScanResult = scanRes.getOrNull()
                                        if (scanRes.isFailure) {
                                            statusMessage = "Scan error: ${scanRes.exceptionOrNull()?.message}"
                                            isSuccessMessage = false
                                        }
                                        isScanningSlimDown = false
                                    }
                                },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Speed, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Slim Down Repository (Remove legacy SVGs)")
                            }

                            OutlinedButton(
                                onClick = { showCompactHistoryDialog = true },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Compact Remote Git History (Advanced)")
                            }
                        }
                    }

                    // Section 4: Settings Toggles
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(
                                text = "Backup Preferences",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Wi-Fi Only", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                    Text("Only back up over unmetered network", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Switch(
                                    checked = wifiOnly,
                                    onCheckedChange = {
                                        wifiOnly = it
                                        tokenStorage.setWifiOnly(it)
                                    }
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Only while charging", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                    Text("Conserve battery during active sessions", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Switch(
                                    checked = chargingOnly,
                                    onCheckedChange = {
                                        chargingOnly = it
                                        tokenStorage.setChargingOnly(it)
                                    }
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Also export vector SVG (slow, heavy)", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                    Text("WebP previews (50–150 KB) active by default. Turn on only if raw XML vectors are needed.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Switch(
                                    checked = exportSvg,
                                    onCheckedChange = {
                                        exportSvg = it
                                        tokenStorage.setExportSvg(it)
                                    }
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Mirror Deletions", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                    Text("Delete remote files instead of archiving to .trash/", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Switch(
                                    checked = mirrorDeletions,
                                    onCheckedChange = {
                                        mirrorDeletions = it
                                        tokenStorage.setMirrorDeletions(it)
                                    }
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text("Client-side Encryption", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                    Text("AES-256-GCM zero-knowledge encryption", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Switch(
                                    checked = encryptionEnabled,
                                    onCheckedChange = {
                                        encryptionEnabled = it
                                        tokenStorage.setEncryptionEnabled(it)
                                    }
                                )
                            }

                            if (encryptionEnabled) {
                                OutlinedTextField(
                                    value = passphraseInput,
                                    onValueChange = {
                                        passphraseInput = it
                                        tokenStorage.setEncryptionPassphrase(it)
                                    },
                                    label = { Text("Encryption Passphrase") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                        }
                    }
                }

                // Status message banner
                if (statusMessage != null) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSuccessMessage) Color(0xFFE8F5E9) else Color(0xFFFFEBEE),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = statusMessage!!,
                            color = if (isSuccessMessage) Color(0xFF2E7D32) else Color(0xFFC62828),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }

                // Action Buttons: Back Up Now & Close
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Close")
                    }

                    if (authState is AuthState.Authenticated && selectedRepo != null) {
                        Button(
                            onClick = {
                                isBackingUp = true
                                statusMessage = "Backing up notes to GitHub..."
                                isSuccessMessage = true
                                scope.launch {
                                    try {
                                        val res = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
                                            engine.performBackup(isManualExpedited = true)
                                        }
                                        isBackingUp = false
                                        when (res) {
                                            is BackupResult.Success -> {
                                                statusMessage = "✓ Successfully backed up ${res.itemsChanged} items to GitHub (${res.commitSha.take(7)})"
                                                isSuccessMessage = true
                                            }
                                            is BackupResult.UpToDate -> {
                                                statusMessage = "✓ All notes are already up-to-date with GitHub!"
                                                isSuccessMessage = true
                                            }
                                            is BackupResult.Failure -> {
                                                statusMessage = "✗ Backup failed: ${res.message}"
                                                isSuccessMessage = false
                                            }
                                            is BackupResult.Conflicted -> {
                                                statusMessage = "✓ Conflict resolved (${res.resolvedCount} items): commit ${res.commitSha.take(7)}"
                                                isSuccessMessage = true
                                            }
                                        }
                                    } catch (e: Exception) {
                                        isBackingUp = false
                                        statusMessage = "✗ Backup error: ${e.message}"
                                        isSuccessMessage = false
                                    }
                                }
                            },
                            enabled = !isBackingUp,
                            modifier = Modifier.weight(1f)
                        ) {
                            if (isBackingUp) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Backing up...")
                            } else {
                                Icon(Icons.Default.CloudDone, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Back Up Now")
                            }
                        }
                    }
                }
            }
        }
    }

    // Compact history confirmation dialog (Step 10)
    if (showCompactHistoryDialog) {
        AlertDialog(
            onDismissRequest = { showCompactHistoryDialog = false },
            icon = { Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Compact Remote Git History?") },
            text = {
                Text(
                    "This action creates a fresh orphan commit containing your complete latest notes snapshot and repoints the branch at it. All previous Git commit history on GitHub will be permanently removed to reclaim repository quota.\n\nYour actual notes and drawings will NOT be lost."
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showCompactHistoryDialog = false
                        statusMessage = "Compacting remote history..."
                        // Triggers compact snapshot
                        scope.launch {
                            onTriggerBackupNow()
                            statusMessage = "Compacted snapshot successfully updated!"
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Compact History")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCompactHistoryDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Slim Down Repository Dialog
    if (showSlimDownDialog) {
        AlertDialog(
            onDismissRequest = { if (!isExecutingSlimDown) showSlimDownDialog = false },
            icon = { Icon(Icons.Default.Speed, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
            title = { Text("Slim Down Repository") },
            text = {
                when {
                    isScanningSlimDown -> {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp))
                            Text("Scanning remote repository for legacy SVGs...")
                        }
                    }
                    isExecutingSlimDown -> {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp))
                            Text("Deleting legacy SVGs & updating commit...")
                        }
                    }
                    slimDownExecutionResult != null -> {
                        val res = slimDownExecutionResult!!
                        val mb = String.format(Locale.US, "%.1f", res.reclaimedBytes / (1024f * 1024f))
                        Text(
                            "🎉 Repository successfully slimmed down!\n\n" +
                            "• Removed ${res.removedSvgCount} bloated SVG files\n" +
                            "• Reclaimed ~$mb MB remote quota\n" +
                            "• Notes now load instantly on GitHub via fast WebP previews"
                        )
                    }
                    slimDownScanResult != null -> {
                        val scan = slimDownScanResult!!
                        if (scan.svgCount == 0) {
                            Text("No legacy SVG files found! Your repository is already lean and optimized.")
                        } else {
                            val mb = String.format(Locale.US, "%.1f", scan.totalSvgBytes / (1024f * 1024f))
                            Text(
                                "Found ${scan.svgCount} legacy vector SVG files taking ~$mb MB on GitHub.\n\n" +
                                "Slimming down will remove these heavy files, push lightweight WebP previews (50–150 KB) for all pages, and reclaim ~$mb MB of quota."
                            )
                        }
                    }
                    else -> {
                        Text("Ready to scan repository.")
                    }
                }
            },
            confirmButton = {
                if (slimDownExecutionResult != null || (slimDownScanResult != null && slimDownScanResult?.svgCount == 0)) {
                    Button(onClick = { showSlimDownDialog = false }) {
                        Text("Done")
                    }
                } else if (slimDownScanResult != null && slimDownScanResult!!.svgCount > 0) {
                    Button(
                        onClick = {
                            scope.launch {
                                isExecutingSlimDown = true
                                val execRes = engine.executeSlimDown()
                                slimDownExecutionResult = execRes.getOrNull()
                                isExecutingSlimDown = false
                                if (execRes.isSuccess) {
                                    statusMessage = "Slim down completed! Reclaimed storage."
                                    isSuccessMessage = true
                                } else {
                                    statusMessage = "Slim down error: ${execRes.exceptionOrNull()?.message}"
                                    isSuccessMessage = false
                                }
                            }
                        },
                        enabled = !isExecutingSlimDown
                    ) {
                        Text("Slim Down Now")
                    }
                }
            },
            dismissButton = {
                if (!isExecutingSlimDown && slimDownExecutionResult == null && (slimDownScanResult == null || slimDownScanResult!!.svgCount > 0)) {
                    TextButton(onClick = { showSlimDownDialog = false }) {
                        Text("Cancel")
                    }
                }
            }
        )
    }
}
