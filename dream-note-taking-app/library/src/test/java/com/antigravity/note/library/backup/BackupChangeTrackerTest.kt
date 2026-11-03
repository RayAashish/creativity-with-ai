package com.antigravity.note.library.backup

import com.antigravity.note.library.backup.manifest.BackupChangeTracker
import com.antigravity.note.library.backup.manifest.BackupManifestDao
import com.antigravity.note.library.backup.manifest.BackupManifestEntity
import com.antigravity.note.library.backup.manifest.ManifestState
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class BackupChangeTrackerTest {

    @get:Rule
    val tempFolder = TemporaryFolder()

    private lateinit var fakeDao: FakeBackupManifestDao
    private lateinit var tracker: BackupChangeTracker

    @Before
    fun setup() {
        fakeDao = FakeBackupManifestDao()
        tracker = BackupChangeTracker(
            manifestDao = fakeDao,
            ioDispatcher = kotlinx.coroutines.Dispatchers.Unconfined
        )
    }

    @Test
    fun testInitialSaveMarksDirty() = runBlocking {
        val pageFile = tempFolder.newFile("page1.inkflow")
        pageFile.writeText("initial stroke content")

        tracker.onPageSavedImmediate("nb1", "page1", pageFile)

        val entry = fakeDao.getByPath("notebooks/nb1/pages/page1.inkflow")
        assertNotNull(entry)
        assertEquals(ManifestState.DIRTY, entry?.state)
        assertEquals(pageFile.length(), entry?.sizeBytes)
        assertNull(entry?.lastBackedUpCommitSha)
    }

    @Test
    fun testNoOpEditDoesNotMarkDirtyWhenClean() = runBlocking {
        val pageFile = tempFolder.newFile("page2.inkflow")
        pageFile.writeText("stable content")

        // First save -> DIRTY
        tracker.onPageSavedImmediate("nb1", "page2", pageFile)
        val initialEntry = fakeDao.getByPath("notebooks/nb1/pages/page2.inkflow")!!

        // Simulate successful backup -> marked CLEAN with commit SHA
        fakeDao.markClean(initialEntry.path, "commit_sha_123")
        val cleanEntry = fakeDao.getByPath(initialEntry.path)!!
        assertEquals(ManifestState.CLEAN, cleanEntry.state)
        assertEquals("commit_sha_123", cleanEntry.lastBackedUpCommitSha)

        // Second save without changing file content (no-op edit)
        tracker.onPageSavedImmediate("nb1", "page2", pageFile)

        val afterNoOpEntry = fakeDao.getByPath(initialEntry.path)!!
        assertEquals("State should stay CLEAN on no-op save", ManifestState.CLEAN, afterNoOpEntry.state)
        assertEquals("commit_sha_123", afterNoOpEntry.lastBackedUpCommitSha)
    }

    @Test
    fun testEditChangesHashAndMarksDirty() = runBlocking {
        val pageFile = tempFolder.newFile("page3.inkflow")
        pageFile.writeText("version 1")

        // First save and simulated backup
        tracker.onPageSavedImmediate("nb1", "page3", pageFile)
        fakeDao.markClean("notebooks/nb1/pages/page3.inkflow", "commit_sha_123")

        // Edit page content
        pageFile.writeText("version 2 with more strokes drawn")
        tracker.onPageSavedImmediate("nb1", "page3", pageFile)

        val updatedEntry = fakeDao.getByPath("notebooks/nb1/pages/page3.inkflow")!!
        assertEquals(ManifestState.DIRTY, updatedEntry.state)
        assertEquals("commit_sha_123", updatedEntry.lastBackedUpCommitSha)
        assertEquals(pageFile.length(), updatedEntry.sizeBytes)
    }

    @Test
    fun testDeletePreviouslyBackedUpPageCreatesTombstone() = runBlocking {
        val pageFile = tempFolder.newFile("page4.inkflow")
        pageFile.writeText("to be deleted")

        tracker.onPageSavedImmediate("nb1", "page4", pageFile)
        fakeDao.markClean("notebooks/nb1/pages/page4.inkflow", "commit_sha_999")

        tracker.onPageDeleted("nb1", "page4")

        val entry = fakeDao.getByPath("notebooks/nb1/pages/page4.inkflow")
        assertNotNull("Entry must still exist as tombstone", entry)
        assertEquals(ManifestState.DELETED, entry?.state)
    }

    @Test
    fun testDeleteNeverBackedUpPageDeletesPermanently() = runBlocking {
        val pageFile = tempFolder.newFile("page5.inkflow")
        pageFile.writeText("draft never committed")

        tracker.onPageSavedImmediate("nb1", "page5", pageFile)
        tracker.onPageDeleted("nb1", "page5")

        val entry = fakeDao.getByPath("notebooks/nb1/pages/page5.inkflow")
        assertNull("Uncommitted deleted item should be completely removed", entry)
    }

    @Test
    fun testDirtyCountAndTotalSizeBytes() = runBlocking {
        val p1 = tempFolder.newFile("p1.inkflow")
        p1.writeText("12345")
        val p2 = tempFolder.newFile("p2.inkflow")
        p2.writeText("67890123")

        tracker.onPageSavedImmediate("nb1", "p1", p1)
        tracker.onPageSavedImmediate("nb1", "p2", p2)

        assertEquals(2, fakeDao.getDirtyCount())
        assertEquals(p1.length() + p2.length(), fakeDao.getTotalActiveSizeBytes())

        fakeDao.markClean("notebooks/nb1/pages/p1.inkflow", "c1")
        assertEquals(1, fakeDao.getDirtyCount())
    }
}

class FakeBackupManifestDao : BackupManifestDao {
    private val store = mutableMapOf<String, BackupManifestEntity>()

    override suspend fun insertOrUpdate(entry: BackupManifestEntity) {
        store[entry.path] = entry
    }

    override suspend fun insertOrUpdateAll(entries: List<BackupManifestEntity>) {
        entries.forEach { store[it.path] = it }
    }

    override suspend fun getByPath(path: String): BackupManifestEntity? {
        return store[path]
    }

    override suspend fun getAll(): List<BackupManifestEntity> {
        return store.values.toList()
    }

    override fun observeAll(): Flow<List<BackupManifestEntity>> {
        return flowOf(store.values.toList())
    }

    override suspend fun getDirtyOrDeleted(): List<BackupManifestEntity> {
        return store.values.filter { it.state == ManifestState.DIRTY || it.state == ManifestState.DELETED }
    }

    override fun observeDirtyCount(): Flow<Int> {
        return flowOf(store.values.count { it.state == ManifestState.DIRTY || it.state == ManifestState.DELETED })
    }

    override suspend fun getDirtyCount(): Int {
        return store.values.count { it.state == ManifestState.DIRTY || it.state == ManifestState.DELETED }
    }

    override suspend fun getTotalActiveSizeBytes(): Long {
        return store.values.filter { it.state != ManifestState.DELETED }.sumOf { it.sizeBytes }
    }

    override suspend fun markClean(path: String, commitSha: String, timestamp: Long) {
        val existing = store[path] ?: return
        store[path] = existing.copy(
            state = ManifestState.CLEAN,
            lastBackedUpCommitSha = commitSha,
            updatedAt = timestamp
        )
    }

    override suspend fun deletePermanently(path: String) {
        store.remove(path)
    }

    override suspend fun deletePermanentlyAll(paths: List<String>) {
        paths.forEach { store.remove(it) }
    }
}
