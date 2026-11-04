package com.antigravity.note.library.backup.engine

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class GitRef(
    val ref: String,
    @SerialName("node_id") val nodeId: String? = null,
    val url: String? = null,
    val `object`: GitObject
)

@Serializable
data class GitObject(
    val sha: String,
    val type: String = "commit",
    val url: String? = null
)

@Serializable
data class GitCommit(
    val sha: String,
    val message: String? = null,
    val tree: GitCommitTree,
    val parents: List<GitCommitParent> = emptyList()
)

@Serializable
data class GitCommitTree(
    val sha: String
)

@Serializable
data class GitCommitParent(
    val sha: String
)

@Serializable
data class GitTreeEntry(
    val path: String,
    val mode: String = "100644",
    val type: String = "blob",
    val sha: String? = null // null indicates file deletion in base_tree
)

@Serializable
data class CreateBlobResponse(
    val sha: String,
    val url: String? = null
)

@Serializable
data class CreateTreeResponse(
    val sha: String,
    val url: String? = null
)

@Serializable
data class GitTreeDetailItem(
    val path: String,
    val mode: String = "100644",
    val type: String = "blob",
    val sha: String,
    val size: Long? = null,
    val url: String? = null
)

@Serializable
data class GitTreeDetailResponse(
    val sha: String,
    val tree: List<GitTreeDetailItem> = emptyList(),
    val truncated: Boolean = false
)
