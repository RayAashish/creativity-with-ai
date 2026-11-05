package com.antigravity.note.library.repository

import com.antigravity.note.document.model.PaperTemplate
import com.antigravity.note.document.storage.PageRepository
import com.antigravity.note.library.db.FolderEntity
import com.antigravity.note.library.db.NoteDatabase
import com.antigravity.note.library.db.NotebookEntity
import com.antigravity.note.library.db.PageEntity
import com.antigravity.note.library.model.LibraryTreeItem
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import com.antigravity.note.library.backup.manifest.BackupChangeTracker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

class LibraryRepository(
    private val database: NoteDatabase,
    private val pageRepository: PageRepository,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
    val backupChangeTracker: BackupChangeTracker = BackupChangeTracker(database.backupManifestDao(), ioDispatcher),
    val localBackupManager: com.antigravity.note.library.backup.local.LocalBackupManager? = null
) {
    private val repoScope = CoroutineScope(SupervisorJob() + ioDispatcher)
    private val folderDao = database.folderDao()
    private val notebookDao = database.notebookDao()
    private val pageDao = database.pageDao()

    init {
        pageRepository.onPageSavedListener = { notebookId, pageId, file ->
            backupChangeTracker.schedulePageSave(notebookId, pageId, file)
            localBackupManager?.schedulePageMirror(notebookId, pageId, file)
        }
        pageRepository.onPageDeletedListener = { notebookId, pageId ->
            repoScope.launch {
                backupChangeTracker.onPageDeleted(notebookId, pageId)
            }
        }
    }

    fun getAllFolders(): Flow<List<FolderEntity>> = folderDao.getAllFolders()

    fun getAllNotebooks(): Flow<List<NotebookEntity>> = notebookDao.getAllNotebooks()

    fun getPagesForNotebook(notebookId: String): Flow<List<PageEntity>> =
        pageDao.getPagesForNotebook(notebookId)

    fun searchPages(query: String): Flow<List<PageEntity>> =
        pageDao.searchPages(query)

    fun getDueReviewPages(currentTimestamp: Long = System.currentTimeMillis()): Flow<List<PageEntity>> =
        pageDao.getDueReviewPages(currentTimestamp)

    suspend fun getPageById(pageId: String): PageEntity? = withContext(ioDispatcher) {
        pageDao.getPageById(pageId)
    }

    suspend fun updatePage(page: PageEntity) = withContext(ioDispatcher) {
        pageDao.updatePage(page)
    }

    suspend fun createFolder(name: String, parentFolderId: String? = null, iconKey: String? = null): FolderEntity = withContext(ioDispatcher) {
        val folder = FolderEntity(
            folderId = UUID.randomUUID().toString(),
            parentFolderId = parentFolderId,
            name = name,
            iconKey = iconKey
        )
        folderDao.insertFolder(folder)
        folder
    }

    suspend fun createNotebook(title: String, folderId: String? = null, iconKey: String? = null): NotebookEntity = withContext(ioDispatcher) {
        val notebook = NotebookEntity(
            notebookId = UUID.randomUUID().toString(),
            folderId = folderId,
            title = title,
            iconKey = iconKey
        )
        notebookDao.insertNotebook(notebook)

        // Create initial page 1
        val initialPage = pageRepository.createPage(notebook.notebookId, 0, PaperTemplate.RULED, "Page 1")
        pageRepository.savePageAtomic(initialPage)

        val pageEntity = PageEntity(
            pageId = initialPage.metadata.pageId,
            notebookId = notebook.notebookId,
            pageIndex = 0,
            title = "Page 1",
            template = "RULED"
        )
        pageDao.insertPage(pageEntity)
        notebook
    }

    suspend fun createProblemPage(
        notebookId: String,
        title: String,
        sourceUrl: String?,
        difficulty: String, // "Easy", "Medium", "Hard"
        tags: String,
        timeComplexity: String = "O(N)",
        spaceComplexity: String = "O(1)",
        codeSnippet: String = "",
        codeLanguage: String = "Kotlin",
        problemDescriptionHtml: String? = null,
        testCasesJson: String? = null
    ): PageEntity = withContext(ioDispatcher) {
        val pageCount = pageDao.getPageCount(notebookId)
        val docPage = pageRepository.createPage(notebookId, pageCount, PaperTemplate.RULED, title)
        pageRepository.savePageAtomic(docPage)

        val pageEntity = PageEntity(
            pageId = docPage.metadata.pageId,
            notebookId = notebookId,
            pageIndex = pageCount,
            title = title,
            template = "DSA_PROBLEM",
            isProblemPage = true,
            sourceUrl = sourceUrl,
            difficulty = difficulty,
            problemStatus = "Unsolved",
            tags = tags,
            timeComplexity = timeComplexity,
            spaceComplexity = spaceComplexity,
            codeSnippet = codeSnippet,
            codeLanguage = codeLanguage,
            revisitIntervalDays = 1,
            nextReviewTimestamp = System.currentTimeMillis() + (24L * 60L * 60L * 1000L), // 1 day later
            problemDescriptionHtml = problemDescriptionHtml,
            testCasesJson = testCasesJson,
            isDescriptionMinimized = false,
            isDescriptionWindowVisible = true,
            descriptionWindowX = 60f,
            descriptionWindowY = 140f
        )
        pageDao.insertPage(pageEntity)
        pageEntity
    }

    suspend fun createGeneralNotePage(
        notebookId: String,
        title: String,
        template: PaperTemplate = PaperTemplate.RULED
    ): PageEntity = withContext(ioDispatcher) {
        val pageCount = pageDao.getPageCount(notebookId)
        val docPage = pageRepository.createPage(notebookId, pageCount, template, title)
        pageRepository.savePageAtomic(docPage)

        val pageEntity = PageEntity(
            pageId = docPage.metadata.pageId,
            notebookId = notebookId,
            pageIndex = pageCount,
            title = title,
            template = template.name,
            isProblemPage = false
        )
        pageDao.insertPage(pageEntity)
        pageEntity
    }

    val trashPages: Flow<List<PageEntity>> = pageDao.getTrashPages()

    fun getAllActivePages(): Flow<List<PageEntity>> = pageDao.getAllActivePages()

    suspend fun movePageToTrash(pageId: String) = withContext(ioDispatcher) {
        pageDao.moveToTrash(pageId)
    }

    suspend fun movePagesToTrash(pageIds: List<String>) = withContext(ioDispatcher) {
        pageDao.moveMultipleToTrash(pageIds)
    }

    suspend fun restorePageFromTrash(pageId: String) = withContext(ioDispatcher) {
        pageDao.restoreFromTrash(pageId)
    }

    suspend fun renamePage(pageId: String, newTitle: String) = withContext(ioDispatcher) {
        pageDao.updatePageTitle(pageId, newTitle)
    }

    suspend fun renameNotebook(notebookId: String, newTitle: String) = withContext(ioDispatcher) {
        notebookDao.updateNotebookTitle(notebookId, newTitle)
    }

    suspend fun renameFolder(folderId: String, newName: String) = withContext(ioDispatcher) {
        folderDao.updateFolderName(folderId, newName)
    }

    suspend fun updateFolderIcon(folderId: String, iconKey: String?) = withContext(ioDispatcher) {
        folderDao.updateFolderIcon(folderId, iconKey)
    }

    suspend fun updateNotebookIcon(notebookId: String, iconKey: String?) = withContext(ioDispatcher) {
        notebookDao.updateNotebookIcon(notebookId, iconKey)
    }

    suspend fun deleteNotebook(notebookId: String) = withContext(ioDispatcher) {
        val pages = pageDao.getPagesForNotebook(notebookId).first()
        if (pages.isNotEmpty()) {
            pageDao.moveMultipleToTrash(pages.map { it.pageId })
        }
        notebookDao.deleteNotebook(notebookId)
    }

    suspend fun deleteFolder(folderId: String) = withContext(ioDispatcher) {
        val allFolders = folderDao.getAllFolders().first()
        val targetFolderIds = mutableSetOf(folderId)
        var added = true
        while (added) {
            val nextLevel = allFolders.filter { it.parentFolderId != null && targetFolderIds.contains(it.parentFolderId) && !targetFolderIds.contains(it.folderId) }
            if (nextLevel.isEmpty()) {
                added = false
            } else {
                targetFolderIds.addAll(nextLevel.map { it.folderId })
            }
        }

        val allNotebooks = notebookDao.getAllNotebooks().first()
        val notebooksToDelete = allNotebooks.filter { it.folderId != null && targetFolderIds.contains(it.folderId) }
        for (nb in notebooksToDelete) {
            val pages = pageDao.getPagesForNotebook(nb.notebookId).first()
            if (pages.isNotEmpty()) {
                pageDao.moveMultipleToTrash(pages.map { it.pageId })
            }
            notebookDao.deleteNotebook(nb.notebookId)
        }

        for (fId in targetFolderIds) {
            folderDao.deleteFolder(fId)
        }
    }

    suspend fun deletePage(pageId: String) = withContext(ioDispatcher) {
        movePageToTrash(pageId)
    }

    suspend fun deletePagePermanently(pageId: String) = withContext(ioDispatcher) {
        val page = pageDao.getPageById(pageId)
        if (page != null) {
            pageRepository.deletePage(page.notebookId, pageId)
            pageDao.deletePage(pageId)
        }
    }

    suspend fun emptyTrash() = withContext(ioDispatcher) {
        val trash = pageDao.getTrashPages().first()
        for (page in trash) {
            pageRepository.deletePage(page.notebookId, page.pageId)
        }
        pageDao.emptyTrash()
    }

    suspend fun purgeExpiredTrash() = withContext(ioDispatcher) {
        val thirtyDaysAgo = System.currentTimeMillis() - (30L * 24 * 60 * 60 * 1000L)
        pageDao.purgeOldTrash(thirtyDaysAgo)
    }

    suspend fun seedDsaDreamTemplate(): String = withContext(ioDispatcher) {
        seedAdditionalSubjectsIfNeeded()

        // Check if already seeded
        val existingNotebooks = notebookDao.getAllNotebooks().first()
        if (existingNotebooks.isNotEmpty()) {
            // Ensure at least one problem is scheduled for review today so Spaced Repetition can be experienced
            val due = pageDao.getDueReviewPages(System.currentTimeMillis()).first()
            if (due.isEmpty()) {
                val allPages = pageDao.getPagesForNotebook(existingNotebooks.first().notebookId).first()
                val targetPage = allPages.firstOrNull { it.isProblemPage }
                if (targetPage != null) {
                    val updated = targetPage.copy(
                        problemStatus = "Revisit",
                        revisitIntervalDays = 1,
                        nextReviewTimestamp = System.currentTimeMillis() - 1000L
                    )
                    pageDao.updatePage(updated)
                }
            }
            return@withContext existingNotebooks.first().notebookId
        }

        // 1. Root folder: DSA
        val dsaFolder = FolderEntity(
            folderId = "folder_dsa",
            parentFolderId = null,
            name = "DSA",
            colorHex = "#005AC1",
            isPinned = true
        )
        folderDao.insertFolder(dsaFolder)

        // 2. Subfolder: Arrays
        val arraysFolder = FolderEntity(
            folderId = "folder_arrays",
            parentFolderId = dsaFolder.folderId,
            name = "Arrays",
            colorHex = "#146C2E"
        )
        folderDao.insertFolder(arraysFolder)

        // 3. Subfolder: Dynamic Programming
        val dpFolder = FolderEntity(
            folderId = "folder_dp",
            parentFolderId = dsaFolder.folderId,
            name = "Dynamic Programming",
            colorHex = "#6750A4"
        )
        folderDao.insertFolder(dpFolder)

        // 4. Subfolder: Graphs
        val graphsFolder = FolderEntity(
            folderId = "folder_graphs",
            parentFolderId = dsaFolder.folderId,
            name = "Graphs",
            colorHex = "#BA1A1A"
        )
        folderDao.insertFolder(graphsFolder)

        // 5. Notebook: Two Pointers inside Arrays
        val twoPointersNotebook = NotebookEntity(
            notebookId = "nb_two_pointers",
            folderId = arraysFolder.folderId,
            title = "Two Pointers",
            pageCount = 2,
            isStarred = true
        )
        notebookDao.insertNotebook(twoPointersNotebook)

        // 6. Problem Page: Q1 – Two Sum
        val twoSumHtml = """
            <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
            <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
            <p>You can return the answer in any order.</p>
            <p>&nbsp;</p>
            <p><strong>Example 1:</strong></p>
            <pre><strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</pre>
            <p><strong>Example 2:</strong></p>
            <pre><strong>Input:</strong> nums = [3,2,4], target = 6
<strong>Output:</strong> [1,2]</pre>
            <p><strong>Example 3:</strong></p>
            <pre><strong>Input:</strong> nums = [3,3], target = 6
<strong>Output:</strong> [0,1]</pre>
            <p>&nbsp;</p>
            <p><strong>Constraints:</strong></p>
            <ul>
              <li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>
              <li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>
              <li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>
              <li><strong>Only one valid answer exists.</strong></li>
            </ul>
        """.trimIndent()

        val twoSumCases = """
            [{"id":1,"title":"Testcase 1","input":"nums = [2,7,11,15], target = 9","output":"[0,1]","isChecked":false},{"id":2,"title":"Testcase 2","input":"nums = [3,2,4], target = 6","output":"[1,2]","isChecked":false},{"id":3,"title":"Testcase 3","input":"nums = [3,3], target = 6","output":"[0,1]","isChecked":false}]
        """.trimIndent()

        createProblemPage(
            notebookId = twoPointersNotebook.notebookId,
            title = "Q1 – Two Sum",
            sourceUrl = "https://leetcode.com/problems/two-sum/",
            difficulty = "Easy",
            tags = "Array,Hash Table,Two Pointers",
            timeComplexity = "O(N)",
            spaceComplexity = "O(N)",
            codeSnippet = """
fun twoSum(nums: IntArray, target: Int): IntArray {
    val map = HashMap<Int, Int>()
    for (i in nums.indices) {
        val complement = target - nums[i]
        if (map.containsKey(complement)) {
            return intArrayOf(map[complement]!!, i)
        }
        map[nums[i]] = i
    }
    return intArrayOf()
}
            """.trimIndent(),
            problemDescriptionHtml = twoSumHtml,
            testCasesJson = twoSumCases
        )

        // 7. Problem Page: Q2 – 3Sum
        val q2 = createProblemPage(
            notebookId = twoPointersNotebook.notebookId,
            title = "Q2 – 3Sum",
            sourceUrl = "https://leetcode.com/problems/3sum/",
            difficulty = "Medium",
            tags = "Array,Two Pointers,Sorting",
            timeComplexity = "O(N^2)",
            spaceComplexity = "O(1) extra",
            codeSnippet = """
fun threeSum(nums: IntArray): List<List<Int>> {
    nums.sort()
    val res = mutableListOf<List<Int>>()
    for (i in 0 until nums.size - 2) {
        if (i > 0 && nums[i] == nums[i - 1]) continue
        var l = i + 1
        var r = nums.size - 1
        while (l < r) {
            val sum = nums[i] + nums[l] + nums[r]
            when {
                sum < 0 -> l++
                sum > 0 -> r--
                else -> {
                    res.add(listOf(nums[i], nums[l], nums[r]))
                    while (l < r && nums[l] == nums[l + 1]) l++
                    while (l < r && nums[r] == nums[r - 1]) r--
                    l++; r--
                }
            }
        }
    }
    return res
}
            """.trimIndent()
        )
        // Mark Q2 as Revisit to demonstrate the spaced repetition queue
        pageDao.updatePage(q2.copy(problemStatus = "Revisit"))

        twoPointersNotebook.notebookId
    }

    suspend fun seedAdditionalSubjectsIfNeeded() = withContext(ioDispatcher) {
        if (folderDao.getFolderById("folder_sys_design") != null) return@withContext

        // Subject 1: System Design
        val sysDesignFolder = FolderEntity(
            folderId = "folder_sys_design",
            parentFolderId = null,
            name = "System Design",
            colorHex = "#795548",
            isPinned = true
        )
        folderDao.insertFolder(sysDesignFolder)

        // Topic 1.1: Distributed Caching
        val cachingFolder = FolderEntity(
            folderId = "folder_sd_caching",
            parentFolderId = sysDesignFolder.folderId,
            name = "Distributed Caching",
            colorHex = "#FF6F00"
        )
        folderDao.insertFolder(cachingFolder)

        // Subtopic Notebook: Redis Architecture
        val redisNb = NotebookEntity(
            notebookId = "nb_redis_cache",
            folderId = cachingFolder.folderId,
            title = "Redis & Caching",
            pageCount = 2,
            isStarred = true
        )
        notebookDao.insertNotebook(redisNb)

        createProblemPage(
            notebookId = redisNb.notebookId,
            title = "Cache-Aside vs Write-Through",
            sourceUrl = "https://en.wikipedia.org/wiki/Cache_(computing)",
            difficulty = "Medium",
            tags = "System Design,Cache,Redis",
            timeComplexity = "O(1) cache read",
            spaceComplexity = "O(N) memory",
            codeSnippet = """
// Cache-Aside Pattern:
fun getProduct(id: String): Product {
    val cached = redis.get("prod:" + id)
    if (cached != null) return cached
    val product = db.queryProduct(id)
    redis.set("prod:" + id, product, ttl = 3600)
    return product
}
            """.trimIndent(),
            codeLanguage = "Kotlin"
        )

        createGeneralNotePage(
            notebookId = redisNb.notebookId,
            title = "Cache Invalidation & Eviction (LRU/LFU)",
            template = PaperTemplate.GRID
        )

        // Topic 1.2: Database Scaling & Sharding
        val dbScalingFolder = FolderEntity(
            folderId = "folder_sd_db",
            parentFolderId = sysDesignFolder.folderId,
            name = "Database Scaling",
            colorHex = "#0288D1"
        )
        folderDao.insertFolder(dbScalingFolder)

        val shardingNb = NotebookEntity(
            notebookId = "nb_sharding",
            folderId = dbScalingFolder.folderId,
            title = "Sharding & Replication",
            pageCount = 2
        )
        notebookDao.insertNotebook(shardingNb)

        createProblemPage(
            notebookId = shardingNb.notebookId,
            title = "Consistent Hashing & Ring Partitioning",
            sourceUrl = "https://en.wikipedia.org/wiki/Consistent_hashing",
            difficulty = "Hard",
            tags = "System Design,Hashing,Distributed",
            timeComplexity = "O(log N) lookup",
            spaceComplexity = "O(N) ring nodes",
            codeSnippet = """
class ConsistentHashRing(val replicas: Int = 3) {
    val ring = java.util.TreeMap<Int, String>()
    fun getNode(key: String): String {
        val hash = key.hashCode()
        val tail = ring.tailMap(hash)
        val target = if (tail.isEmpty()) ring.firstKey() else tail.firstKey()
        return ring[target]!!
    }
}
            """.trimIndent(),
            codeLanguage = "Kotlin"
        )

        createGeneralNotePage(
            notebookId = shardingNb.notebookId,
            title = "Leader-Follower Replication & WAL",
            template = PaperTemplate.RULED
        )

        // Subject 2: General Notes & Creative
        val generalFolder = FolderEntity(
            folderId = "folder_general_notes",
            parentFolderId = null,
            name = "General Notes",
            colorHex = "#00897B",
            isPinned = true
        )
        folderDao.insertFolder(generalFolder)

        val ideasFolder = FolderEntity(
            folderId = "folder_ideas",
            parentFolderId = generalFolder.folderId,
            name = "Project Ideas & Journal",
            colorHex = "#43A047"
        )
        folderDao.insertFolder(ideasFolder)

        val brainstormNb = NotebookEntity(
            notebookId = "nb_brainstorm",
            folderId = ideasFolder.folderId,
            title = "Architecture & Roadmaps",
            pageCount = 2
        )
        notebookDao.insertNotebook(brainstormNb)

        createGeneralNotePage(
            notebookId = brainstormNb.notebookId,
            title = "Dream Note Taking App Architecture",
            template = PaperTemplate.RULED
        )

        createGeneralNotePage(
            notebookId = brainstormNb.notebookId,
            title = "Freeform Canvas & Diagram Sketches",
            template = PaperTemplate.BLANK
        )
    }

    suspend fun schedulePageReview(pageId: String, intervalDays: Int) = withContext(ioDispatcher) {
        val page = pageDao.getPageById(pageId) ?: return@withContext
        val newStatus = when {
            intervalDays >= 21 -> "Mastered"
            intervalDays >= 7 -> "Solved"
            intervalDays >= 3 -> "Revisit"
            else -> "Revisit"
        }
        val nextReview = System.currentTimeMillis() + (intervalDays * 86400000L)
        val updated = page.copy(
            revisitIntervalDays = intervalDays,
            nextReviewTimestamp = nextReview,
            problemStatus = newStatus,
            modifiedAt = System.currentTimeMillis()
        )
        pageDao.updatePage(updated)
    }
}
