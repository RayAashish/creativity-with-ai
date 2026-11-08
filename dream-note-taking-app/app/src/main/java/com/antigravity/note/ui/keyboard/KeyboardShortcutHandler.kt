package com.antigravity.note.ui.keyboard

import android.view.KeyEvent

enum class NoteAppShortcut {
    UNDO,
    REDO,
    QUICK_SWITCHER,
    EXPORT,
    NEW_PAGE,
    PREV_PAGE,
    NEXT_PAGE,
    TOOL_PEN,
    TOOL_MARKER,
    TOOL_ERASER,
    TOOL_HIGHLIGHTER,
    TOOL_LASSO,
    TOOL_SHAPES,
    TOGGLE_AUDIO,
    PASTE
}

object KeyboardShortcutManager {

    var activeListener: ((NoteAppShortcut) -> Boolean)? = null

    fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        val isCtrl = event.isCtrlPressed || event.isMetaPressed
        val isShift = event.isShiftPressed

        val shortcut = when {
            // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y -> Redo
            isCtrl && (keyCode == KeyEvent.KEYCODE_Y || (isShift && keyCode == KeyEvent.KEYCODE_Z)) -> {
                NoteAppShortcut.REDO
            }
            // Ctrl/Cmd + Z -> Undo
            isCtrl && keyCode == KeyEvent.KEYCODE_Z -> {
                NoteAppShortcut.UNDO
            }
            // Ctrl/Cmd + K -> Quick Switcher
            isCtrl && keyCode == KeyEvent.KEYCODE_K -> {
                NoteAppShortcut.QUICK_SWITCHER
            }
            // Ctrl/Cmd + V -> Paste (Strokes or Images)
            isCtrl && keyCode == KeyEvent.KEYCODE_V -> {
                NoteAppShortcut.PASTE
            }
            // Ctrl/Cmd + E or Ctrl/Cmd + S -> Export
            isCtrl && (keyCode == KeyEvent.KEYCODE_E || keyCode == KeyEvent.KEYCODE_S) -> {
                NoteAppShortcut.EXPORT
            }
            // Ctrl/Cmd + N -> New Page
            isCtrl && keyCode == KeyEvent.KEYCODE_N -> {
                NoteAppShortcut.NEW_PAGE
            }
            // Bracket navigation without ctrl
            keyCode == KeyEvent.KEYCODE_LEFT_BRACKET -> {
                NoteAppShortcut.PREV_PAGE
            }
            keyCode == KeyEvent.KEYCODE_RIGHT_BRACKET -> {
                NoteAppShortcut.NEXT_PAGE
            }
            // Tool hotkeys (when ctrl is NOT held)
            !isCtrl && keyCode == KeyEvent.KEYCODE_P -> NoteAppShortcut.TOOL_PEN
            !isCtrl && keyCode == KeyEvent.KEYCODE_M -> NoteAppShortcut.TOOL_MARKER
            !isCtrl && keyCode == KeyEvent.KEYCODE_E -> NoteAppShortcut.TOOL_ERASER
            !isCtrl && keyCode == KeyEvent.KEYCODE_H -> NoteAppShortcut.TOOL_HIGHLIGHTER
            !isCtrl && keyCode == KeyEvent.KEYCODE_L -> NoteAppShortcut.TOOL_LASSO
            !isCtrl && keyCode == KeyEvent.KEYCODE_S -> NoteAppShortcut.TOOL_SHAPES
            !isCtrl && keyCode == KeyEvent.KEYCODE_R -> NoteAppShortcut.TOGGLE_AUDIO
            else -> null
        }

        return if (shortcut != null) {
            activeListener?.invoke(shortcut) ?: false
        } else {
            false
        }
    }
}
