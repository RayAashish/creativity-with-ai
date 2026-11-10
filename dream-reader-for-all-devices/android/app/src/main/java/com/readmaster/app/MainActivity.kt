package com.readmaster.app

import android.content.Context
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.readmaster.app.data.db.ReadMasterDatabase
import com.readmaster.app.data.model.DocumentEntity
import com.readmaster.app.speech.TtsManager
import com.readmaster.app.ui.library.LibraryScreen
import com.readmaster.app.ui.reader.ReaderScreen
import com.readmaster.app.ui.theme.ReadMasterTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {

    private lateinit var ttsManager: TtsManager
    private lateinit var database: ReadMasterDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // 1. Keep screen on while studying & annotating
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // 2. Request 144Hz ultra-high refresh rate on Moto Pad 70 Pro for 1ms stylus latency
        val params = window.attributes
        params.preferredRefreshRate = 144.0f
        window.attributes = params

        // 3. Initialize Database & TTS
        database = ReadMasterDatabase.getDatabase(this)
        ttsManager = TtsManager(this)

        setContent {
            ReadMasterTheme {
                Box(
                    modifier = Modifier.fillMaxSize()
                ) {
                    ReadMasterApp(database = database, ttsManager = ttsManager)
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        ttsManager.shutdown()
    }
}

@Composable
fun ReadMasterApp(
    database: ReadMasterDatabase,
    ttsManager: TtsManager
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val prefs = remember { context.getSharedPreferences("lipi_reading_prefs", Context.MODE_PRIVATE) }

    var currentDocument by remember { mutableStateOf<DocumentEntity?>(null) }

    val docDao = database.documentDao()
    val folderDao = database.folderDao()
    val vocabDao = database.vocabularyDao()

    // Auto-restore reading session ONLY IF user was actively reading in the reader when app was closed/minimized
    // (If the user turned back to a folder or the library, app starts in that folder/library!)
    LaunchedEffect(Unit) {
        val lastScreen = prefs.getString("last_active_screen", "LIBRARY")
        val lastOpenedId = prefs.getString("last_opened_doc_id", null)
        if (lastScreen == "READER" && lastOpenedId != null && currentDocument == null) {
            withContext(Dispatchers.IO) {
                val savedDoc = docDao.getDocumentById(lastOpenedId)
                if (savedDoc != null) {
                    val isResumeEnabled = prefs.getBoolean("pref_resume_reading_enabled", true)
                    val targetPage = if (isResumeEnabled) {
                        val savedPage = prefs.getInt("last_page_${savedDoc.id}", savedDoc.lastPage)
                        savedPage.coerceIn(0, (savedDoc.pageCount - 1).coerceAtLeast(0))
                    } else {
                        0
                    }
                    val syncedDoc = savedDoc.copy(lastPage = targetPage)
                    withContext(Dispatchers.Main) {
                        currentDocument = syncedDoc
                    }
                }
            }
        }
    }

    val doc = currentDocument
    if (doc == null) {
        LibraryScreen(
            documentDao = docDao,
            folderDao = folderDao,
            vocabularyDao = vocabDao,
            ttsManager = ttsManager,
            onOpenDocument = { openedDoc ->
                scope.launch(Dispatchers.IO) {
                    // Fetch latest persisted state from DB & Prefs
                    val freshDoc = docDao.getDocumentById(openedDoc.id) ?: openedDoc
                    val isResumeEnabled = prefs.getBoolean("pref_resume_reading_enabled", true)
                    val targetPage = if (isResumeEnabled) {
                        val savedPage = prefs.getInt("last_page_${freshDoc.id}", freshDoc.lastPage)
                        savedPage.coerceIn(0, (freshDoc.pageCount - 1).coerceAtLeast(0))
                    } else {
                        0
                    }
                    val targetDoc = freshDoc.copy(lastPage = targetPage)
                    prefs.edit()
                        .putString("last_opened_doc_id", targetDoc.id)
                        .putString("last_active_screen", "READER")
                        .apply()
                    withContext(Dispatchers.Main) {
                        currentDocument = targetDoc
                    }
                }
            }
        )
    } else {
        ReaderScreen(
            document = doc,
            ttsManager = ttsManager,
            onSaveVocab = { vocab ->
                scope.launch(Dispatchers.IO) {
                    vocabDao.insert(vocab)
                }
            },
            onUpdateDocProgress = { page ->
                currentDocument = currentDocument?.copy(lastPage = page, lastReadTime = System.currentTimeMillis())
                prefs.edit()
                    .putInt("last_page_${doc.id}", page)
                    .apply()
                scope.launch(Dispatchers.IO) {
                    docDao.updatePageProgress(doc.id, page, System.currentTimeMillis())
                }
            },
            onBackClick = {
                // Clear active reader session when user explicitly navigates back to library/folder
                prefs.edit()
                    .remove("last_opened_doc_id")
                    .putString("last_active_screen", "LIBRARY")
                    .apply()
                currentDocument = null
            }
        )
    }
}
