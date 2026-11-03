package com.antigravity.note.library.model

import kotlinx.serialization.Serializable

@Serializable
data class TestCaseItem(
    val id: Int,
    val title: String,
    val input: String,
    val output: String = "",
    val isChecked: Boolean = false
)
