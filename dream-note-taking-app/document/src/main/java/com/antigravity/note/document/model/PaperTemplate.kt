package com.antigravity.note.document.model

enum class PaperTemplate(val displayName: String) {
    BLANK("Blank"),
    RULED("Ruled / Lined"),
    GRID("Math Grid"),
    DOT("Dot Grid"),
    CORNELL("Cornell Note");

    companion object {
        fun fromOrdinal(ordinal: Int): PaperTemplate {
            return entries.getOrElse(ordinal) { RULED }
        }
    }
}
