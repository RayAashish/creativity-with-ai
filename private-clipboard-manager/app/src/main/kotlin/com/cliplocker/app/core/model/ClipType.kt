package com.cliplocker.app.core.model

import kotlinx.serialization.Serializable

@Serializable
enum class ClipType(val glyph: String, val label: String) {
    TEXT(glyph = "TXT", label = "Text"),
    LINK(glyph = "URL", label = "Link"),
    IMAGE(glyph = "IMG", label = "Image"),
    SECRET(glyph = "SEC", label = "Secret")
}
