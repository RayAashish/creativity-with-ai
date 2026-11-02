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
import kotlinx.coroutines.withContext
import java.util.UUID

class LibraryRepository(
    private val database: NoteDatabase,
    private val pageRepository: PageRepository,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val folderDao = database.folderDao()
    private val notebookDao = database.notebookDao()
    private val pageDao = database.pageDao()

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

    suspend fun createFolder(name: String, parentFolderId: String? = null): FolderEntity = withContext(ioDispatcher) {
        val folder = FolderEntity(
            folderId = UUID.randomUUID().toString(),
            parentFolderId = parentFolderId,
            name = name
        )
        folderDao.insertFolder(folder)
        folder
    }

    suspend fun createNotebook(title: String, folderId: String? = null): NotebookEntity = withContext(ioDispatcher) {
        val notebook = NotebookEntity(
            notebookId = UUID.randomUUID().toString(),
            folderId = folderId,
            title = title
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
        codeLanguage: String = "Kotlin"
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
            nextReviewTimestamp = System.currentTimeMillis() + (24L * 60L * 60L * 1000L) // 1 day later
        )
        pageDao.insertPage(pageEntity)
        pageEntity
    }

    suspend fun seedDsaDreamTemplate(): String = withContext(ioDispatcher) {
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
            """.trimIndent()
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
